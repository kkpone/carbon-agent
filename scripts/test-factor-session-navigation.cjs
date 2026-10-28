// node --test scripts/test-factor-session-navigation.cjs
// Execute the real navigation functions without loading the whole application.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../src/views/system/carbonAgent/index.tsx'),
  'utf8',
);
const ast = ts.createSourceFile(
  'index.tsx',
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const names = new Set([
  'SESSION_ID_QUERY_KEY',
  'PROJECT_SESSION_PROJECT_ID_QUERY_KEY',
  'SECTION_QUERY_KEY',
  'BUSINESS_PREVIEW_QUERY_KEYS',
  'getSearchWithSessionId',
  'replaceUrlSearch',
  'syncSessionIdToUrl',
]);
const snippets = ast.statements
  .filter(ts.isVariableStatement)
  .flatMap(statement =>
    statement.declarationList.declarations
      .filter(
        declaration =>
          names.has(declaration.name.getText(ast)) ||
          declaration.name.getText(ast).startsWith('BUSINESS_PREVIEW_'),
      )
      .map(declaration => `const ${declaration.getText(ast)};`),
  );
const context = {
  URLSearchParams,
  clearIssueFeedbackNavigationParams: params => {
    params.delete('feedbackId');
  },
};

const citationModule = { exports: {} };
const citationSource = fs.readFileSync(
  path.join(
    __dirname,
    '../src/views/system/carbonAgent/components/ccdbFactorMarkdown.ts',
  ),
  'utf8',
);
vm.runInNewContext(
  ts.transpileModule(citationSource, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText,
  {
    exports: citationModule.exports,
    module: citationModule,
    URL,
  },
);
const { linkifyCcdbFactorNames } = citationModule.exports;
vm.runInNewContext(
  ts.transpileModule(
    `${snippets.join('\n')}\nthis.sync = syncSessionIdToUrl;`,
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
      },
    },
  ).outputText,
  context,
);

function navigate(pathname, search, options = {}) {
  const calls = [];
  context.sync({
    history: { replace: location => calls.push(location) },
    location: { pathname, search, hash: '', state: undefined },
    sessionId: 'test-session',
    ...options,
  });
  return calls;
}

test('first factor message preserves the route and adds the session without remount', () => {
  const [next] = navigate('/factors/123', '', { preserveFactorLanding: true });
  assert.equal(next.pathname, '/factors/123');
  assert.equal(
    new URLSearchParams(next.search).get('sessionId'),
    'test-session',
  );
});

test('shared-factor first message keeps share/referral identity to avoid reinitialization', () => {
  const [next] = navigate(
    '/factors/123',
    '?share=fsh_test&agentInviteCode=invite_test',
    {
      preserveFactorLanding: true,
    },
  );
  assert.equal(next.pathname, '/factors/123');
  const params = new URLSearchParams(next.search);
  assert.equal(params.get('share'), 'fsh_test');
  assert.equal(params.get('agentInviteCode'), 'invite_test');
  assert.equal(params.get('sessionId'), 'test-session');
});

test('subsequent messages do not replace an unchanged URL', () => {
  assert.equal(
    navigate('/factors/123', '?sessionId=test-session', {
      preserveFactorLanding: true,
    }).length,
    0,
  );
});

test('explicit new chat leaves landing and removes source share attribution', () => {
  const [next] = navigate(
    '/factors/123',
    '?share=fsh_test&agentInviteCode=invite_test&sessionId=old',
    {
      sessionId: undefined,
    },
  );
  assert.equal(next.pathname, '/system/carbonAgent');
  const params = new URLSearchParams(next.search);
  assert.equal(params.has('share'), false);
  assert.equal(params.has('agentInviteCode'), false);
  assert.equal(params.has('sessionId'), false);
});

test('selecting another session still leaves factor landing', () => {
  const [next] = navigate('/factors/123', '?share=fsh_test', {
    sessionId: 'other-session',
  });
  assert.equal(next.pathname, '/system/carbonAgent');
  assert.equal(
    new URLSearchParams(next.search).get('sessionId'),
    'other-session',
  );
});

test('normal and project sessions keep existing navigation and preview cleanup', () => {
  const [next] = navigate(
    '/system/carbonAgent',
    '?section=newChat&previewType=account',
    {
      preserveFactorLanding: true,
      projectId: 'project-test',
    },
  );
  assert.equal(next.pathname, '/system/carbonAgent');
  const params = new URLSearchParams(next.search);
  assert.equal(params.get('projectId'), 'project-test');
  assert.equal(params.has('section'), false);
  assert.equal(params.has('previewType'), false);
});

test('send and anonymous-login handoff opt in; unmount cancellation remains intact', () => {
  assert.match(
    source,
    /preserveFactorLanding: true,\s*projectId: sessionProjectId/,
  );
  assert.match(
    source,
    /preserveFactorLanding: true,\s*sessionId: anonymousSessionId/,
  );
  assert.match(
    source,
    /useEffect\(\s*\(\) => \(\) => \{\s*streamAbortControllerRef\.current\?\.abort\(\)/,
  );
});

test('factor context is attached once and restored sessions reuse the saved binding', () => {
  assert.match(
    source,
    /const factorContext = ccdbFactorSubmittedRef\.current\s*\? undefined\s*:\s*boundFactor \|\| ccdbFactorDraft/,
  );
  assert.match(
    source,
    /ccdbFactorSubmittedRef\.current = true;\s*}\s*setCcdbFactorDraft/,
  );
  assert.doesNotMatch(
    source,
    /withCcdbFactorContext\([\s\S]{0,180}boundFactor \|\| ccdbFactorDraft/,
  );
});

test('factor citation moves an existing details URL onto the factor name', () => {
  const detailUrl = 'https://agenttest.carbonstop.com/factors/1937234610025728';
  const markdown = [
    '选择最匹配的因子：**Gas oil**',
    '',
    '> **Gas oil：2.75540897852349 kgCO₂e/L**',
    '> [因子详情（ID：1937234610025728）](https://agenttest.carbonstop.com/factors/1937234610025728)',
  ].join('\n');
  const linked = linkifyCcdbFactorNames(markdown, [
    {
      detailUrl,
      factorId: '1937234610025728',
      name: 'Gas oil',
    },
  ]);

  assert.match(linked, new RegExp(`\\*\\*\\[Gas oil\\]\\(${detailUrl}\\)：`));
});

test('factor citation leaves an already linked name unchanged', () => {
  const detailUrl = 'https://agenttest.carbonstop.com/factors/123';
  const markdown = `[电力](${detailUrl})：0.5777 kgCO₂e/kWh`;

  assert.equal(
    linkifyCcdbFactorNames(markdown, [
      { detailUrl, factorId: '123', name: '电力' },
    ]),
    markdown,
  );
});

test('factor citation does not invent a link when the answer has no detail URL', () => {
  const markdown = '推荐因子：电力，0.5777 kgCO₂e/kWh';

  assert.equal(
    linkifyCcdbFactorNames(markdown, [
      {
        detailUrl: 'https://agenttest.carbonstop.com/factors/123',
        factorId: '123',
        name: '电力',
      },
    ]),
    markdown,
  );
});
