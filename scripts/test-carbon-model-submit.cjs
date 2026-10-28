// Run the real submit handlers with isolated form/API boundaries.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(
  __dirname,
  '../src/views/subModules/CarbonFootprintModel',
);
function submitHandler(file, context) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let handler;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(source) === 'onSubmit'
    )
      handler = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(handler);
  const js = ts.transpileModule(`const submit = ${handler.getText(source)};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return vm.runInNewContext(`${js}\nsubmit;`, context);
}

for (const file of [
  'BuildModel/ProcessList/ProcessFactorForm/index.tsx',
  'components/EmissionSourceDrawer/index.tsx',
]) {
  test(`${file}: 提交保留因子和运输数据，排除辅助字段且不修改原表单`, async () => {
    for (const type of [1, 3]) {
      const values = {
        name: '排放源',
        type,
        amount: '10.25',
        unitCode: ['mass', 'kg'],
        unitName: 'kg',
        factorObj: { rate: '0.001', factorPattern: 'custom', factor: '2.345' },
        typeExtra: { obsolete: true },
        accountEmissionTransportList: [{ amount: '8' }],
      };
      const original = JSON.stringify(values);
      let submitted;
      const run = submitHandler(file, {
        form: { submit: async () => values, getFieldState: () => undefined },
        info: { id: 123 },
        stage: 2,
        QUICK_ACCOUNT_EMISSION: { TRANS: 3 },
        EMISSION_TYPE_OPTIONS: { TRANS: 3 },
        FactorPatternType: { eCoinVent: 'ecoinvent' },
        factorPattern: 'custom',
        TransportListTransToService: rows =>
          rows.map(item => ({ ...item, converted: true })),
        onOk: value => {
          submitted = value;
        },
      });
      const result = (await run()) || submitted;
      assert.equal(result.modelId, 123);
      assert.equal(result.name, '排放源');
      assert.equal(result.amount, '10.25');
      assert.equal(result.rate, '0.001');
      assert.equal(result.factorObj, values.factorObj);
      assert.equal('typeExtra' in result, false);
      assert.equal(result.accountEmissionTransportList[0].converted, true);
      assert.equal(JSON.stringify(values), original);
    }
  });
}
