/* node --test scripts/test-oauth-completion.cjs — no live API calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function setup() {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  const filename = path.join(
    __dirname,
    '../src/views/system/carbonAgent/ccdb/oauthCompletion.ts',
  );
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const context = {
    exports: {},
    window: { sessionStorage: storage },
    URLSearchParams,
    Date,
  };
  vm.runInNewContext(code, context, { filename });
  return { ...context.exports, values, storage };
}

test('success requires the matching approved decision; refresh preserves the result', () => {
  const api = setup();
  assert.equal(api.readOAuthCompletion(''), null);
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a').status,
    'unknown',
  );
  api.rememberOAuthDecision('a', 'CCDB 联调工具', true);
  for (let i = 0; i < 2; i++) {
    const result = api.readOAuthCompletion('#ccdb_result=success&state=a');
    assert.equal(result.status, 'success');
    assert.equal(result.clientName, 'CCDB 联调工具');
  }
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=b').status,
    'unknown',
  );
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=error&state=a').status,
    'error',
  );
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a&state=a').status,
    'unknown',
  );
});

test('cancelled decision cannot be presented as a successful connection', () => {
  const api = setup();
  api.rememberOAuthDecision('a', 'CCDB 联调工具', false);
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a').status,
    'unknown',
  );
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=cancelled&state=a').status,
    'cancelled',
  );
});

test('expired, corrupt and inaccessible storage safely fall back without interrupting OAuth', () => {
  const api = setup();
  api.rememberOAuthDecision('a', 'CCDB 联调工具', true);
  const key = [...api.values.keys()][0];
  const record = JSON.parse(api.values.get(key));
  record.createdAt = Date.now() - 16 * 60 * 1000;
  api.values.set(key, JSON.stringify(record));
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a').status,
    'unknown',
  );
  api.values.set(key, '{');
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a').status,
    'unknown',
  );
  api.storage.getItem = () => {
    throw new Error('disabled');
  };
  api.storage.setItem = () => {
    throw new Error('disabled');
  };
  assert.doesNotThrow(() => api.rememberOAuthDecision('a', 'client', true));
  assert.equal(
    api.readOAuthCompletion('#ccdb_result=success&state=a').status,
    'unknown',
  );
});
