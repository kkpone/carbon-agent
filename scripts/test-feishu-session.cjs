/* 飞书会话存储/恢复测试：直接执行生产 TS 模块，不需要浏览器或真实账号。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function storage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function load(pagePath = '/system/carbonAgent', userAgent = 'Chrome', previous) {
  const localStorage = previous?.localStorage || storage();
  const sessionStorage = previous?.sessionStorage || storage();
  const redirects = [];
  const exports = {};
  const url = new URL(pagePath, 'https://agenttest.carbonstop.com');
  const location = { pathname: url.pathname, search: url.search, replace: value => redirects.push(value) };
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, '../src/utils/feishuSession.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require: name => {
      assert.equal(name, '@src/store/actionTypes');
      return { SET_COMPANY_USER_INFO: 'SET_COMPANY_USER_INFO' };
    },
    window: { location },
    navigator: { userAgent },
    localStorage,
    sessionStorage,
    Date,
    URLSearchParams,
  });
  return { api: exports, localStorage, sessionStorage, redirects, location };
}

test('普通网页保持原登录存储和请求行为', () => {
  const env = load();
  assert.equal(env.api.getLoginStorage(), env.localStorage);
  assert.equal(env.api.isFeishuVerified(), true);
  assert.equal(env.api.handleFeishuAuthFailure(401), false);
  assert.equal(env.redirects.length, 0);
});

test('飞书首次进入隔离官网凭证，身份核验前不放行业务', () => {
  const env = load('/agent/feishu/entry', 'Mozilla Lark/7');
  env.localStorage.setItem('SET_COMPANY_USER_INFO', 'website-account');
  assert.equal(env.api.getLoginStorage(), env.sessionStorage);
  assert.equal(env.api.isFeishuVerified(), false);
  assert.equal(env.api.getLoginStorage().getItem('SET_COMPANY_USER_INFO'), null);
  env.api.getLoginStorage().setItem('SET_COMPANY_USER_INFO', 'feishu-account');
  assert.equal(env.localStorage.getItem('SET_COMPANY_USER_INFO'), 'website-account');
});

test('授权完成仅允许一次内部跳转，恢复页面须重新核验', () => {
  const env = load('/agent/feishu/entry');
  env.api.markFeishuReady();
  assert.equal(env.api.takeFeishuReady(), true);
  env.api.suspendFeishuSession();
  assert.equal(env.api.isFeishuVerified(), false);
  assert.equal(env.api.takeFeishuReady(), false);
});

test('会话过期只自动恢复一次，被挤出不触发循环登录', () => {
  const env = load('/agent/feishu/entry', 'Feishu');
  env.location.pathname = '/system/carbonAgent';
  assert.equal(env.api.handleFeishuAuthFailure(401), true);
  assert.equal(env.redirects[0], '/agent/feishu/entry');
  env.api.handleFeishuAuthFailure(401);
  assert.equal(env.redirects[1], '/agent/feishu/entry?stopped=1');
  env.api.handleFeishuAuthFailure(410);
  assert.equal(env.redirects[2], '/agent/feishu/entry?stopped=1');
});

test('飞书退出只删除自身凭证，官网登录保留', () => {
  const env = load('/agent/feishu/entry');
  env.localStorage.setItem('SET_COMPANY_USER_INFO', 'website-account');
  env.sessionStorage.setItem('SET_COMPANY_USER_INFO', 'feishu-account');
  env.api.clearFeishuSession();
  assert.equal(env.localStorage.getItem('SET_COMPANY_USER_INFO'), 'website-account');
  assert.equal(env.sessionStorage.getItem('SET_COMPANY_USER_INFO'), null);
  assert.equal(env.redirects[0], '/agent/feishu/entry?stopped=1');
});

for (const userAgent of ['Mozilla Android Lark/7', 'Mozilla iPhone Feishu/7']) {
  for (const path of ['/', '/system/carbonAgent', '/en/system/carbonAgent']) {
    test(`飞书浏览器打开普通链接不触发授权：${userAgent} ${path}`, () => {
      const env = load(path, userAgent);
      assert.equal(env.api.isFeishuSession(), false);
      assert.equal(env.api.getLoginStorage(), env.localStorage);
      assert.equal(env.api.handleFeishuAuthFailure(401), false);
      assert.equal(env.redirects.length, 0);
    });
  }
}

test('同一 WebView 从飞书切到普通链接，清理残留标记且两个渠道 Token 均不覆盖', () => {
  const feishu = load('/agent/feishu/entry', 'Lark');
  feishu.localStorage.setItem('SET_COMPANY_USER_INFO', 'website-account');
  feishu.sessionStorage.setItem('SET_COMPANY_USER_INFO', 'feishu-account');
  feishu.sessionStorage.setItem('agent:feishu:oauth-state', 'old-state');
  feishu.sessionStorage.setItem('agent:feishu:oauth-verifier', 'old-verifier');
  feishu.sessionStorage.setItem('agent:feishu:return-path', '/en/system/carbonAgent');
  feishu.api.markFeishuReady();
  const website = load('/system/carbonAgent', 'Lark', feishu);
  assert.equal(website.api.isFeishuSession(), false);
  assert.equal(website.api.getLoginStorage().getItem('SET_COMPANY_USER_INFO'), 'website-account');
  assert.equal(website.sessionStorage.getItem('SET_COMPANY_USER_INFO'), 'feishu-account');
  for (const key of ['source', 'ready', 'oauth-state', 'oauth-verifier', 'return-path']) {
    assert.equal(website.sessionStorage.getItem(`agent:feishu:${key}`), null);
  }
  const reentry = load('/agent/feishu/entry', 'Lark', website);
  assert.equal(reentry.api.getLoginStorage().getItem('SET_COMPANY_USER_INFO'), 'feishu-account');
  assert.equal(reentry.api.isFeishuVerified(), false);
});

test('专用入口回调后保留飞书渠道，刷新和切换语言仍须重新核验身份', () => {
  const entry = load('/agent/feishu/entry');
  entry.api.markFeishuReady();
  const home = load('/system/carbonAgent?agentChannel=feishu', 'Lark', entry);
  assert.equal(home.api.isFeishuSession(), true);
  assert.equal(home.api.takeFeishuReady(), true);
  const refreshed = load('/system/carbonAgent?agentChannel=feishu', 'Lark', home);
  assert.equal(refreshed.api.isFeishuSession(), true);
  assert.equal(refreshed.api.takeFeishuReady(), false);
  const english = load('/en/system/carbonAgent?agentChannel=feishu', 'Lark', refreshed);
  assert.equal(english.api.getLoginStorage(), english.sessionStorage);
  assert.equal(english.api.isFeishuVerified(), false);
});

test('链接中的渠道参数不能单独建立飞书会话', () => {
  const env = load('/system/carbonAgent?agentChannel=feishu', 'Lark');
  assert.equal(env.api.isFeishuSession(), false);
  assert.equal(env.api.getLoginStorage(), env.localStorage);
});

test('无上下文的回调交给登录页校验，不能建立已验证会话', () => {
  const env = load('/agent/feishu/callback?code=invalid&state=invalid');
  assert.equal(env.api.isFeishuSession(), true);
  assert.equal(env.api.isFeishuVerified(), false);
  assert.equal(env.sessionStorage.getItem('agent:feishu:source'), null);
});
