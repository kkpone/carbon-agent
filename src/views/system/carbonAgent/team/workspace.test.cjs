const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const teamText = key => key;
function load(filename, extra = '', mocks = {}) {
  const mod = new Module(filename, module);
  const native = Module.createRequire(filename);
  mod.require = name => {
    if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name];
    if (name === './i18n') return { teamText };
    if (name === './errors') return errors;
    if (name === '@src/lang/createI18nLabelMap')
      return load(path.resolve(__dirname, '../../../../lang/createI18nLabelMap.ts'));
    return native(name);
  };
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8') + extra, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  mod._compile(result.outputText, filename);
  return mod.exports;
}
const errors = load(path.join(__dirname, 'errors.ts'));

test('successful workspace responses keep capability reasons out of request failures', () => {
  for (const reasonCode of ['AGENT_TEAM_EXPIRED', 'AGENT_SEAT_REQUIRED', 'AGENT_TEAM_REVOKED']) {
    for (const canEnter of [true, false]) {
      for (const canManage of [true, false]) {
        assert.equal(
          errors.isAgentBusinessDenial({
            code: 200,
            data: { canEnter, canManage, canUseAi: false, reasonCode },
          }),
          false,
        );
      }
    }
    assert.equal(errors.isAgentBusinessDenial({ code: 200, reasonCode }), false);
    assert.equal(errors.isAgentBusinessDenial({ code: 200, msg: reasonCode }), false);
  }
});
test('failed expired-team requests remain business denials while login failures remain auth errors', () => {
  for (const code of [401, 403, 500]) {
    assert.equal(
      errors.isAgentBusinessDenial({ code, data: { reasonCode: 'AGENT_TEAM_EXPIRED' } }),
      true,
    );
    assert.equal(
      errors.isAgentBusinessDenial({ code, data: { reasonCode: 'AGENT_LOGIN_REQUIRED' } }),
      false,
    );
  }
});
test('expired workspace renders content, disables entry only by canEnter and retains renewal only for managers', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  let access = {
    companyId: '42', companyName: 'Expired team', workspaceType: 'TEAM',
    canEnter: true, canManage: true, canUseAi: false,
    reasonCode: 'AGENT_TEAM_EXPIRED',
  };
  let accessError;
  const wrap = ({ children }) => React.createElement('div', null, children);
  const workspace = load(
    path.join(__dirname, 'workspace.tsx'),
    '\nexport { WorkspaceSession };',
    {
      './api': {},
      './helpers': { AGENT_PATH: '/agent', TEAM_PATH: '/agent/team' },
      '@tanstack/react-query': {
        useQuery: key => key.at(-1) === 'workspaces'
          ? { data: access ? [access] : [] }
          : { data: access, isError: !!accessError, error: accessError },
        useQueryClient: () => ({}),
      },
      antd: {
        Alert: ({ message, action }) => React.createElement('aside', null, message, action),
        Button: wrap, Space: wrap, Spin: wrap,
        Select: props => React.createElement('span', null, props['aria-label']),
        Result: ({ title, extra }) => React.createElement('section', null, title, extra),
      },
      'react-redux': {
        useSelector: selector => selector({ companyUserInfo: { access_token: 'token', companyId: '42', userInfo: { userId: '7' } } }),
      },
      'react-router-dom': { useHistory: () => ({}) },
      '@/router/localePath': { withCurrentLocalePrefix: value => value },
      '@/store': { default: {} },
      '@/store/actionTypes': {},
      '@/utils/consts': {},
      '@/utils/feishuSession': {},
    },
  );
  const render = () => renderToStaticMarkup(
    React.createElement(workspace.WorkspaceSession, null,
      React.createElement('p', null, 'workspace-content'),
      React.createElement(workspace.WorkspaceNotice),
    ),
  );
  let html = render();
  assert.ok(html.includes('workspace-content'));
  assert.ok(html.includes(errors.reasonText('AGENT_TEAM_EXPIRED')));
  assert.ok(html.includes(teamText('renewSubscription')));

  access = { ...access, canManage: false };
  html = render();
  assert.ok(html.includes('workspace-content'));
  assert.ok(!html.includes(teamText('renewSubscription')));

  access = { ...access, canEnter: false, canManage: true };
  html = render();
  assert.ok(!html.includes('workspace-content'));
  assert.ok(html.includes(errors.reasonText('AGENT_TEAM_EXPIRED')));

  access = { ...access, canEnter: true, canUseAi: true };
  html = render();
  assert.ok(html.includes('workspace-content'));
  assert.ok(!html.includes(errors.reasonText('AGENT_TEAM_EXPIRED')));

  access = { ...access, canEnter: false, canUseAi: false, canManage: true,
    reasonCode: 'AGENT_TEAM_NOT_ENABLED' };
  const renderManagement = () => renderToStaticMarkup(
    React.createElement(workspace.WorkspaceSession, { management: true },
      React.createElement('p', null, 'purchase-configuration'),
    ),
  );
  assert.ok(renderManagement().includes('purchase-configuration'));
  assert.ok(!render().includes('workspace-content'), 'AI workspace must remain blocked');
  assert.equal(access.canUseAi, false);
  access = { ...access, canManage: false };
  assert.ok(!renderManagement().includes('purchase-configuration'));
  for (const role of ['owner', 'superAdmin']) {
    for (const reasonCode of ['AGENT_SEAT_REQUIRED', 'AGENT_TEAM_NOT_ENABLED', 'AGENT_TEAM_EXPIRED', undefined]) {
      for (const canEnter of [true, false]) {
        access = { ...access, role, canManage: true, canUseAi: false, canEnter, reasonCode };
        assert.ok(renderManagement().includes('purchase-configuration'), `${role}: ${reasonCode}`);
        assert.equal(render().includes('workspace-content'), canEnter);
      }
    }
  }
  for (const canEnter of [true, false]) {
    access = { ...access, canManage: false, canEnter, canUseAi: canEnter, reasonCode: 'AGENT_SEAT_REQUIRED' };
    const denied = renderManagement();
    assert.ok(!denied.includes('purchase-configuration'));
    assert.ok(denied.includes(teamText('youDoNotHavePermissionToManage')));
    assert.ok(denied.includes(teamText('backToAgent')));
    assert.ok(denied.includes(teamText('switchPersonalOrTeamWorkspace')));
    assert.ok(!denied.includes(errors.reasonText('AGENT_SEAT_REQUIRED')));
  }
  access = undefined;
  accessError = { data: { code: 403, msg: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } };
  const denied = renderManagement();
  assert.ok(denied.includes(teamText('youDoNotHavePermissionToManage')));
  assert.ok(denied.includes(teamText('backToAgent')));
  assert.ok(denied.includes(teamText('switchPersonalOrTeamWorkspace')));
  assert.ok(!denied.includes(teamText('unableToCheckWorkspaceAccess')));
});

test('unopened-team managers land on OPEN configuration; normal teams and members keep their guards', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const router = require('react-router-dom');
  const base = '/system/carbonAgent/team';
  let access = { companyId: '42', companyName: 'Unopened team', canManage: true,
    canEnter: false, canUseAi: false, reasonCode: 'AGENT_TEAM_NOT_ENABLED' };
  let subscriptionStatus = 'NOT_ENABLED';
  let summaryError;
  const wrap = ({ children }) => React.createElement('div', null, children);
  const filename = path.join(__dirname, 'index.tsx');
  const assets = Object.fromEntries(
    [...fs.readFileSync(filename, 'utf8').matchAll(/from '(\.\/assets\/[^']+)'/g)]
      .map(match => [match[1], 'asset.svg']),
  );
  const team = load(filename, '', {
    ...assets,
    '@ant-design/icons': { ArrowLeftOutlined: () => null },
    '@tanstack/react-query': { useQuery: () => ({ data: { subscriptionStatus }, error: summaryError }) },
    antd: { ConfigProvider: wrap, Button: wrap, Menu: () => null,
      Result: ({ title }) => React.createElement('p', null, title) },
    'react-router-dom': { ...router,
      Redirect: ({ to }) => React.createElement('p', { 'data-redirect': to }, 'redirect') },
    '@/components/LocaleProvider': { LocaleContext: React.createContext({ locale: 'en' }) },
    '@/hooks/use-mobile': { useMobile: () => false },
    './Finance': { Finance: () => null },
    './Members': { Members: () => null },
    './Points': { Points: () => null },
    './Purchase': { Purchase: () => React.createElement('p', null, 'purchase-configuration') },
    './Reports': { Overview: () => React.createElement('p', null, 'overview'),
      AuditPage: () => null, ExecutionsPage: () => null, Profile: () => null },
    './api': { teamApi: {} },
    './helpers': { AGENT_PATH: '/system/carbonAgent', TEAM_PATH: base, dateText: () => '' },
    './team.module.less': {},
    './workspace': {
      WorkspaceProvider: props => {
        assert.equal(props.management, true);
        return wrap(props);
      },
      TeamManagementDenied: () => React.createElement('p', null, teamText('youDoNotHavePermissionToManage')),
      WorkspaceSwitcher: () => null,
      useWorkspace: () => ({ access, personal: false, key: [] }),
    },
  });
  const render = pathname => renderToStaticMarkup(
    React.createElement(router.MemoryRouter, { initialEntries: [pathname] }, React.createElement(team.default)),
  );
  for (const pathname of [base, `${base}/overview`]) {
    assert.ok(render(pathname).includes(`data-redirect="${base}/purchase?action=OPEN"`));
  }
  assert.ok(render(`${base}/purchase?action=OPEN`).includes('purchase-configuration'));
  access = { ...access, reasonCode: undefined, canEnter: true };
  assert.ok(render(base).includes(`data-redirect="${base}/purchase?action=OPEN"`), 'summary also detects unopened teams');
  subscriptionStatus = 'ACTIVE';
  assert.ok(render(base).includes(`data-redirect="${base}/overview"`));
  assert.ok(render(`${base}/overview`).includes('overview'));
  subscriptionStatus = 'EXPIRED';
  access = { ...access, canEnter: false, canUseAi: false, reasonCode: 'AGENT_TEAM_EXPIRED' };
  for (const suffix of ['overview', 'members', 'seats', 'finance', 'purchase?action=RENEW', 'purchase?action=EXPAND']) {
    assert.ok(!render(`${base}/${suffix}`).includes('youDoNotHavePermissionToManage'), suffix);
  }
  summaryError = { data: { reasonCode: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } };
  assert.ok(render(`${base}/purchase?action=RENEW`).includes('youDoNotHavePermissionToManage'));
  summaryError = undefined;
  access = { ...access, canManage: false };
  assert.ok(render(`${base}/purchase?action=OPEN`).includes('youDoNotHavePermissionToManage'));
  assert.ok(!render(`${base}/purchase?action=OPEN`).includes('purchase-configuration'));
});

test('management API denials notify the mounted guard for reads and writes and preserve the original error', async () => {
  let outcome;
  let rejects = false;
  const api = load(path.join(__dirname, 'api.ts'), '', {
    '@src/api/request': { request: async () => {
      if (rejects) throw outcome;
      return outcome;
    } },
    '../monitor/json': load(path.join(__dirname, '../monitor/json.ts')),
  });
  let denied = 0;
  const unsubscribe = api.subscribeTeamManagementDenied(() => { denied++; });
  for (const method of ['GET', 'POST', 'PUT']) {
    outcome = { data: { code: 403, data: { reasonCode: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } } };
    rejects = true;
    await assert.rejects(api.teamRequest('/management/agent/team/members', { method }), error => error === outcome);
  }
  assert.equal(denied, 3);
  rejects = false;
  outcome = { data: { code: 500, msg: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } };
  await assert.rejects(api.teamRequest('/management/agent/team/summary'));
  assert.equal(denied, 4);
  outcome = { data: { code: 403, msg: 'AGENT_SEAT_REQUIRED' } };
  await assert.rejects(api.teamRequest('/management/agent/team/summary'));
  assert.equal(denied, 4, 'seat errors must not be reclassified as missing management permission');
  outcome = { data: { code: 200, data: { canManage: true, canEnter: false } } };
  assert.equal((await api.teamRequest('/management/agent/workspace-access')).canManage, true);
  assert.equal(denied, 4);
  unsubscribe();
  outcome = { data: { code: 403, msg: 'AGENT_TEAM_MANAGEMENT_FORBIDDEN' } };
  await assert.rejects(api.teamRequest('/management/agent/team/summary'));
  assert.equal(denied, 4, 'unmounted guards must not receive errors');
});
