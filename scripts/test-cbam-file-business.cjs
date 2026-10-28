const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,
  '../src/views/system/carbonAgent/cbamFileBusiness.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject });
const { getCbamFileBusinessType: type } = exportsObject;
test('communication and monitoring IDs resolve to separate business spaces', () => {
  assert.equal(type({ module: 'cbam2' }), 'report');
  assert.equal(type({ module: 'cbam2', info: 'old error text' }), 'report');
  assert.equal(type({ module: 'cbam2', info: 'null' }), 'report');
  assert.equal(type({ module: 'cbam2', info: 'monitor_plan' }), 'monitor_plan');
  assert.equal(type({ module: 'cbam2_monitor_plan' }), 'monitor_plan');
});
test('communication report is compatible with its explicit type marker', () => {
  assert.equal(type({ module: 'cbam2', info: 'report' }), 'report');
});
