/* node --test scripts/test-agent-sso-callback.cjs — no live API calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(relative, dependencies) {
  const filename = path.join(__dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    window: dependencies.window,
    URLSearchParams,
    process: { env: {} },
  }, { filename });
  return exports;
}

const response = data => ({ data: { code: 200, data } });
const login = (companyId, token = 'exchanged-token') => ({
  access_token: token,
  userInfo: { userId: '10000000000000001', companyId },
  expires_in: 3600,
});
const flush = () => new Promise(resolve => setImmediate(resolve));

function setup(data, switchResult = response(login('target', 'target-token'))) {
  const calls = [];
  const states = [];
  const effects = [];
  const storage = new Map();
  let currentLogin = login('previous-company', 'previous-token');
  const window = {
    location: {
      hash: '#ticket=one-time-ticket', pathname: '/agent/sso/callback', search: '',
      replace: url => calls.push(['navigate', url]),
    },
    history: {
      state: {},
      replaceState: (...args) => calls.push(['removeTicket', ...args]),
    },
  };
  const component = load('src/views/system/agentSsoCallback/index.tsx', {
    window,
    'react/jsx-runtime': { jsx: () => null, jsxs: () => null },
    react: {
      useEffect: effect => effects.push(effect),
      useState: () => ['exchanging', state => states.push(state)],
    },
    antd: { Button: 'Button', Result: 'Result', Spin: 'Spin' },
    '@src/lang/I18N': { carbonAgent: {} },
    '@src/router/localePath': {
      buildLocaleSwitchPath: (locale, route) => `/${locale}${route.pathname}`,
    },
    '@src/router/route-paths': {
      RouteMaps: { carbonAgent: '/system/carbonAgent', carbonAgentTeam: '/system/carbonAgent/team' },
    },
    '@src/store/actionTypes': { SET_COMPANY_USER_INFO: 'SET_COMPANY_USER_INFO' },
    '@/utils/consts': { COMPANY_ID: 'companyId' },
    '@/utils/feishuSession': { getLoginStorage: () => ({ setItem: (key, value) => storage.set(key, value) }) },
    '../../../store': {
      dispatch(action) { currentLogin = action.payload; calls.push(['save', action]); },
    },
    '@/api/api': {
      async switchoverCompany(params) {
        calls.push(['switch', params, currentLogin.access_token]);
        if (switchResult instanceof Error) throw switchResult;
        return switchResult;
      },
    },
    './service': { exchangeAgentSsoTicket: async ticket => { calls.push(['exchange', ticket]); return response(data); } },
    './index.module.less': {},
  });
  component.default();
  const cleanup = effects[0]();
  return { calls, states, storage, cleanup, currentLogin: () => currentLogin };
}

test('team SSO switches with exchanged identity before saving target login and navigating', async () => {
  const target = '9223372036854775806';
  const app = setup(
    { ...login('personal'), destination: 'TEAM_MANAGEMENT', targetCompanyId: target, lang: 'en' },
    response(login(target, 'target-token')),
  );
  await flush();
  const switched = app.calls.find(call => call[0] === 'switch');
  assert.deepEqual(JSON.parse(JSON.stringify(switched[1])), {
    companyId: target, userId: '10000000000000001', purpose: 'TEAM_MANAGEMENT',
  });
  assert.equal(switched[2], 'exchanged-token');
  assert.equal(app.currentLogin().access_token, 'target-token');
  assert.equal(app.storage.get('companyId'), target);
  assert.equal(app.calls.at(-1)[1], '/en/system/carbonAgent/team');
  assert.equal(app.calls.filter(call => call[0] === 'save').at(-1)[1].type, 'agent/replaceWorkspaceLogin');
  assert.deepEqual(app.states, []);
});

test('ordinary SSO retains the conversation destination and does not switch organizations', async () => {
  for (const [lang, locale] of [['en', 'en'], ['zt', 'zt'], [undefined, 'zh']]) {
    const app = setup({ ...login('personal'), lang });
    await flush();
    assert.equal(app.calls.some(call => call[0] === 'switch'), false);
    assert.equal(app.calls.at(-1)[1], `/${locale}/system/carbonAgent`);
  }
});

test('missing or blank team target fails without saving or navigating to another organization', async () => {
  for (const targetCompanyId of [undefined, null, '', '   ']) {
    const app = setup({ ...login('personal'), destination: 'TEAM_MANAGEMENT', targetCompanyId });
    await flush();
    assert.deepEqual(app.states, ['failed']);
    assert.equal(app.calls.some(call => ['switch', 'save', 'navigate'].includes(call[0])), false);
  }
});

test('permission denial, network error, missing token and wrong target never navigate', async () => {
  for (const result of [
    { data: { code: 403, msg: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } },
    new Error('network failed'),
    response({ userInfo: { companyId: 'target' } }),
    response(login('another-company')),
  ]) {
    const app = setup({ ...login('personal'), destination: 'TEAM_MANAGEMENT', targetCompanyId: 'target' }, result);
    await flush();
    assert.deepEqual(app.states, ['failed']);
    assert.equal(app.calls.some(call => call[0] === 'navigate'), false);
    assert.equal(app.storage.has('companyId'), false);
  }
});

test('unmounted callback does not replace login or navigate', async () => {
  const app = setup({ ...login('personal'), destination: 'TEAM_MANAGEMENT', targetCompanyId: 'target' });
  app.cleanup();
  await flush();
  assert.equal(app.calls.some(call => ['switch', 'save', 'navigate'].includes(call[0])), false);
});

test('ticket exchange preserves Long target organization IDs', () => {
  const parser = load('src/views/system/carbonAgent/monitor/json.ts', {});
  const service = load('src/views/system/agentSsoCallback/service.ts', {
    '@src/api/request': { request: options => options },
    '@src/views/system/carbonAgent/monitor/json': parser,
  });
  const options = service.exchangeAgentSsoTicket('ticket');
  const result = options.transformResponse[0]('{"code":200,"data":{"targetCompanyId":9223372036854775806}}');
  assert.equal(result.data.targetCompanyId, '9223372036854775806');
});
