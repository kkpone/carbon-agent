/* 执行真实登录组件中的请求与回调逻辑，验证环境地址和无 Cookie 的授权绑定。 */
const assert = require('node:assert/strict');
const { webcrypto, createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../src/components/FeishuLoginGate/index.tsx'), 'utf8',
);
// 仅在测试沙箱暴露内部函数，生产模块不增加测试接口。
const code = ts.transpileModule(`${source}\nexport { authorize, exchange };`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const state = 's'.repeat(43);

function load(apiBase, values = new Map(), callback = false, callbackState = state) {
  const requests = [];
  const redirects = [];
  const exports = {};
  const sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  vm.runInNewContext(code, {
    exports, process: { env: { REACT_APP_API_URL: apiBase } },
    require: name => {
      if (name === '@src/store/actionTypes') return { SET_COMPANY_USER_INFO: 'SET_COMPANY_USER_INFO' };
      if (name === '@src/utils/feishuSession') return {
        FEISHU_ENTRY: '/agent/feishu/entry', FEISHU_CALLBACK: '/agent/feishu/callback',
        isFeishuSession: () => true, suspendFeishuSession() {}, markFeishuReady() {}, takeFeishuReady: () => false,
      };
      return {};
    },
    window: {
      crypto: webcrypto, setTimeout, clearTimeout, history: { replaceState() {} },
      location: {
        origin: 'https://agenttest.carbonstop.com',
        pathname: callback ? '/agent/feishu/callback' : '/agent/feishu/entry',
        search: callback ? `?code=test-code&state=${callbackState}` : '', hash: '',
        replace: url => redirects.push(url),
      },
    },
    document: { documentElement: { lang: 'zh' } }, navigator: { userAgent: 'Lark Desktop' },
    sessionStorage, URL, URLSearchParams, AbortController, TextEncoder, Uint8Array, btoa,
    fetch: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ code: 200, data: url.endsWith('/authorize')
        ? { authorizeUrl: `https://accounts.feishu.cn/open-apis/authen/v1/authorize?state=${state}` }
        : { access_token: 'agent-test-token', userInfo: { userId: 100 } } }) };
    },
  });
  return { api: exports, values, requests, redirects };
}

for (const apiBase of ['https://gateway-base-test.carbonstop.com', 'https://gateway.carbonstop.com/', '/api']) {
  test(`授权和兑换沿用环境地址 ${apiBase}，不携带 Cookie 或旧 Token 请求头`, async () => {
    const entry = load(apiBase);
    await entry.api.authorize(false);
    const verifier = entry.values.get('agent:feishu:oauth-verifier');
    const challenge = entry.requests[0].body.browserChallenge;
    assert.match(verifier, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(challenge, createHash('sha256').update(verifier).digest('base64url'));
    assert.equal(entry.requests[0].body.browserVerifier, undefined);
    assert.equal(entry.redirects[0].includes(verifier), false);
    assert.equal(entry.redirects[0].includes(challenge), false);
    const callback = load(apiBase, entry.values, true);
    await callback.api.exchange();
    assert.equal(callback.requests[0].body.browserVerifier, verifier);
    assert.equal(callback.requests[0].body.state, state);
    for (const req of [...entry.requests, ...callback.requests]) {
      assert.ok(req.url.startsWith(`${apiBase.replace(/\/$/, '')}/auth/agent/feishu/`));
      assert.equal(req.options.credentials, 'omit');
      assert.equal(Object.keys(req.options.headers).join(','), 'Content-Type');
    }
    assert.equal(entry.values.has('agent:feishu:oauth-verifier'), false);
    assert.equal(entry.values.has('agent:feishu:oauth-state'), false);
    assert.equal(callback.redirects[0], '/system/carbonAgent?agentChannel=feishu');
    assert.equal(JSON.parse(entry.values.get('SET_COMPANY_USER_INFO')).access_token, 'agent-test-token');
  });
}

test('其他标签页缺失校验值或 state 不一致时不能发起兑换', async () => {
  const entry = load('/api');
  await entry.api.authorize(false);
  const foreign = load('/api', new Map([['agent:feishu:oauth-state', state]]), true);
  await assert.rejects(foreign.api.exchange(), /FEISHU_CALLBACK_INVALID/);
  assert.equal(foreign.requests.length, 0);
  const wrongState = load('/api', entry.values, true, 'x'.repeat(43));
  await assert.rejects(wrongState.api.exchange(), /FEISHU_CALLBACK_INVALID/);
  assert.equal(wrongState.requests.length, 0);
});

test('重新授权会生成新的随机校验值', async () => {
  const entry = load('/api');
  await entry.api.authorize(false);
  const before = entry.values.get('agent:feishu:oauth-verifier');
  await entry.api.authorize(true);
  assert.notEqual(entry.values.get('agent:feishu:oauth-verifier'), before);
  assert.equal(entry.requests[1].body.interactive, true);
});
