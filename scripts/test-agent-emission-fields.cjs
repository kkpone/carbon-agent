// node --test scripts/test-agent-emission-fields.cjs
// Exercise the real expressions, schemas and React provider boundaries without API writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const BigNumber = require('bignumber.js');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '../src');
const files = {
  context:
    'components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext.ts',
  factorContext: 'components/FormilyUtil/FormilyFactor/context.ts',
  model:
    'views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/index.tsx',
  check:
    'views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/BuildModelDescribe/CheckModalData.tsx',
  application:
    'views/Certification/carbonFootprintCertification/certificationProject/component/ApplayCertification/index.tsx',
  certification:
    'views/subModules/CarbonFootprintModel/Certification/CertificationForm/index.tsx',
  card: 'views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/ProductInfoCard/index.tsx',
  process:
    'views/carbonFootprint3/ProcessBusinessAccounting/Management/ProcessAccountSelectFactor/index.tsx',
  schema:
    'views/carbonFootprint3/ProcessBusinessAccounting/Management/ProcessAccountSelectFactor/schema.tsx',
  transport:
    'views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema.tsx',
  constants: 'views/carbonFootprint3/discharge/process/constant.ts',
  validators: 'views/carbonFootprint3/util/index.tsx',
  regex: 'utils/regs.ts',
};

function parse(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function findAll(ast, predicate) {
  const nodes = [];
  function visit(node) {
    if (predicate(node)) nodes.push(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return nodes;
}

function evaluate(code, bindings = {}) {
  const sandbox = { React, URL, URLSearchParams, ...bindings };
  const compiled = ts.transpileModule(
    code.replaceAll('import.meta.env', 'testEnv'),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
      },
    },
  );
  vm.runInNewContext(compiled.outputText, sandbox);
  return sandbox.result;
}

function variables(file, names, bindings = {}) {
  const ast = parse(file);
  const nodes = names.map(name => {
    const matches = findAll(
      ast,
      node => ts.isVariableDeclaration(node) && node.name.getText(ast) === name,
    );
    assert.equal(matches.length, 1, `${file}: ${name}`);
    return `const ${matches[0].getText(ast)};`;
  });
  return evaluate(
    `${nodes.join('\n')}\nresult = { ${names.join(',')} };`,
    bindings,
  );
}

function jsxAttribute(file, tag, attr) {
  const ast = parse(file);
  const tags = findAll(
    ast,
    node =>
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(ast) === tag,
  );
  return tags.flatMap(node =>
    node.attributes.properties
      .filter(prop => ts.isJsxAttribute(prop) && prop.name.text === attr)
      .map(prop => prop.initializer.expression.getText(ast)),
  );
}

const I18N = new Proxy(
  { template: (text, args) => `${text}:${args.val1}` },
  {
    get: (obj, key) =>
      obj[key] || new Proxy({}, { get: (_, label) => String(label) }),
  },
);
const constants = variables(files.constants, [
  'AMOUNT',
  'MAX_DECIMAL_PLACE',
  'AGENT_EMISSION_AMOUNT_MAX_DECIMAL_PLACE',
]);
const config = variables(
  files.context,
  [
    'DEFAULT_MEASUREMENT_PRECISION',
    'AGENT_MEASUREMENT_PRECISION',
    'MeasurementPrecisionContext',
    'ModelCheckEmissionFieldsContext',
    'AGENT_CERTIFICATION_PREVIEW_SOURCE',
  ],
  { ...constants, createContext: React.createContext },
);
const factorConfig = variables(files.factorContext, ['ShowFactorTypeContext'], {
  createContext: React.createContext,
});

function entryConfig(urlState, apiExtraParams, agentPreviewLayout = false) {
  return variables(
    files.model,
    [
      'isAgentShare',
      'isAgentCertificationPreview',
      'enableAgentEmissionFields',
      'basicInfoReadOnly',
      'emissionReadOnly',
    ],
    {
      ...config,
      urlState,
      apiExtraParams,
      agentPreviewLayout,
      isDetail: true,
      isShareEmissionEditable: false,
    },
  );
}

test('Agent canvas, conversation share and marked certification preview opt in without changing readonly', () => {
  for (const args of [
    [{}, {}, true],
    [{ snapFlag: '7' }, { snapFlag: 7 }],
    // /share sends snapFlag=2 to APIs even though the certification URL has snapFlag=4.
    [{ snapFlag: '4', source: 'agent' }, { snapFlag: 2 }],
  ]) {
    const entry = entryConfig(...args);
    assert.equal(entry.enableAgentEmissionFields, true);
    assert.equal(entry.emissionReadOnly, true);
    assert.equal(entry.basicInfoReadOnly, true);
  }
});

test('ordinary accounting, unmarked certification and expert snapshots remain unchanged', () => {
  for (const urlState of [
    {},
    { snapFlag: 4 },
    { snapFlag: 4, source: 'other' },
    { snapFlag: 2, source: 'agent' },
    { snapFlag: 6 },
  ]) {
    assert.equal(
      entryConfig(urlState, { snapFlag: 2 }).enableAgentEmissionFields,
      false,
    );
  }
});

test('only embedded Agent certification supplies the source; both product card branches forward it', () => {
  const [expression] = jsxAttribute(
    files.application,
    'CertificationForm',
    'accountPreviewSource',
  );
  for (const [embedded, agentSessionId, expected] of [
    [true, 'session', 'agent'],
    [false, 'session', undefined],
    [true, undefined, undefined],
  ]) {
    assert.equal(
      evaluate(`result = ${expression};`, {
        ...config,
        embedded,
        agentSessionId,
      }),
      expected,
    );
  }
  assert.deepEqual(
    jsxAttribute(
      files.certification,
      'ProductInfoCard',
      'accountPreviewSource',
    ),
    ['accountPreviewSource', 'accountPreviewSource'],
  );
});

function clickCertificationCard(props = {}) {
  const [handler] = jsxAttribute(files.card, 'Button', 'onClick');
  const calls = [];
  evaluate(`(${handler})();`, {
    window: { open: (...args) => calls.push(args) },
    testEnv: { REACT_APP_SAAS_URL: 'https://saas.example' },
    productSnapInfo: { accountSnapList: [{ snapAccountId: 123 }] },
    authType: '0',
    reportSnapCode: 'report-123',
    isBoss: false,
    accountPreviewSource: undefined,
    ...props,
  });
  assert.equal(calls.length, 1);
  return calls[0];
}

test('certification links preserve domain, API identity and navigation while carrying Agent source', () => {
  const base =
    '/carbonFootprint3/footprintAccount/share?accountId=123&authType=0&reportSnapCode=report-123&listOrGraph=0&status=1&stepValue=1&snapFlag=4';
  assert.deepEqual(clickCertificationCard(), [
    base,
    '_blank',
    'noopener noreferrer',
  ]);
  assert.equal(
    clickCertificationCard({ accountPreviewSource: 'agent' })[0],
    `${base}&source=agent`,
  );
  assert.equal(
    clickCertificationCard({ isBoss: true, accountPreviewSource: 'agent' })[0],
    `https://saas.example${base}`,
  );
  const encoded = new URL(
    clickCertificationCard({ accountPreviewSource: 'agent&status=2' })[0],
    'https://agent.example',
  );
  assert.equal(encoded.searchParams.get('status'), '1');
  assert.equal(encoded.searchParams.get('source'), 'agent&status=2');
});

test('model-check context changes only its emission drawer, not sibling AI forms or mass-unit precision', () => {
  const Probe = () => {
    const precision = React.useContext(config.MeasurementPrecisionContext);
    const showType = React.useContext(factorConfig.ShowFactorTypeContext);
    return React.createElement(
      'output',
      null,
      `${precision.amountDecimalPlace}/${precision.productWeightDecimalPlace}/${showType}`,
    );
  };
  const Null = () => null;
  const { CheckModalData } = variables(
    files.check,
    ['options', 'cssCommon', 'columsBalance', 'columsModel', 'CheckModalData'],
    {
      ...config,
      ...factorConfig,
      ...React,
      I18N,
      useSubscriptionServiceModal: () => ({}),
      style: {},
      Radio: { Group: Null },
      Button: Null,
      EmissionSourceDrawer: Probe,
    },
  );
  for (const enabled of [false, true]) {
    const html = renderToStaticMarkup(
      React.createElement(
        config.ModelCheckEmissionFieldsContext.Provider,
        { value: enabled },
        React.createElement(CheckModalData, {
          accountId: 123,
          cRef: React.createRef(),
          onCancel() {},
          updateModelCheckData() {},
        }),
        React.createElement(Probe),
      ),
    );
    assert.match(
      html,
      enabled
        ? /<output>9\/9\/true<\/output>/
        : /<output>6\/6\/false<\/output>/,
    );
    assert.ok(html.endsWith('<output>6/6/false</output>'));
  }
  const ast = parse(files.model);
  const describe = findAll(
    ast,
    node =>
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(ast) === 'BuildModelDescribe',
  )[0];
  assert.equal(
    describe.parent.openingElement.tagName.getText(ast),
    'ModelCheckEmissionFieldsContext.Provider',
  );
  assert.match(
    fs.readFileSync(path.join(root, files.check), 'utf8'),
    /regexpDecimalsNum\(13\)/,
  );
});

const regex = variables(files.regex, [
  'REGEXP_MORE_ZERO_DECIMALS',
  'regexpDecimalsNum',
]);
const { genNumberValidator, RegAccountValue } = variables(
  files.validators,
  ['genNumberValidator', 'RegAccountValue'],
  { ...regex, I18N, BigNumber },
);
const schemaBindings = {
  I18N,
  MAX: constants.AMOUNT.MAX,
  MAX_DECIMAL_PLACE: constants.MAX_DECIMAL_PLACE,
  ALL_EMISSION: {},
  ALL_EMISSION_LABEL: () => ({}),
  initFormilyInput: () => ({}),
  initFormilySelect: () => ({}),
  initFormilyCascader: () => ({}),
  genLengthValidator: () => '',
  genRequiredValidator: () => '',
  genNumberValidator,
};

test('process consumption uses real validation: nine digits pass, ten fail, default remains six', () => {
  const { processAccountEmissionSourceSchema } = variables(
    files.schema,
    ['processAccountEmissionSourceSchema'],
    schemaBindings,
  );
  const amountValidator = precision =>
    processAccountEmissionSourceSchema(() => {}, precision).properties.grid
      .properties.amountColumn.properties.amount['x-validator'][1];
  const nine = amountValidator(9);
  assert.equal(nine('0.000000001'), '');
  assert.equal(nine('123.123456789'), '');
  assert.equal(nine('9999999999.999999999'), '');
  assert.notEqual(nine('10000000000'), '');
  assert.notEqual(nine('123.1234567891'), '');
  assert.notEqual(nine('-1'), '');
  assert.equal(amountValidator(undefined)('1.123456'), '');
  assert.notEqual(amountValidator(undefined)('1.1234567'), '');
});

test('quick and process nine-decimal limits compare exact values without rounding', () => {
  const validators = [
    value => RegAccountValue(value, 9),
    genNumberValidator({ max: constants.AMOUNT.MAX, decimalPlace: 9 }),
  ];
  for (const validate of validators) {
    for (const value of [
      '0.000000001',
      '12345678.123456789',
      '9999999999.999999999',
    ]) {
      assert.equal(validate(value), '', value);
    }
    for (const value of [
      '10000000000',
      '10000000000.000000001',
      '1.1234567891',
      '-1',
      'abc',
    ]) {
      assert.notEqual(validate(value), '', value);
    }
    assert.equal(validate(''), '');
  }
  const inclusive = genNumberValidator({
    max: constants.AMOUNT.MAX,
    decimalPlace: 9,
    includeMax: true,
  });
  assert.equal(inclusive('10000000000'), '');
  assert.notEqual(inclusive('10000000000.000000001'), '');
});

test('default six-decimal and zero validation rules remain unchanged', () => {
  const process = genNumberValidator({
    max: constants.AMOUNT.MAX,
    decimalPlace: 6,
  });
  for (const validate of [RegAccountValue, process]) {
    assert.equal(validate('1.123456'), '');
    assert.notEqual(validate('1.1234567'), '');
    assert.notEqual(validate('10000000000'), '');
  }
  assert.notEqual(RegAccountValue('0', 9), '');
  assert.equal(genNumberValidator({ decimalPlace: 9 })('0'), '');
});

test('cargo weight opts into nine; transport distance and energy retain six', () => {
  const { transportSchema } = variables(files.transport, ['transportSchema'], {
    I18N,
    initFormilyInput: () => ({}),
    titleTip: () => '',
    factorObjDefaultValidator: () => '',
    factorObjModelEmissionApiValidator: () => '',
    transportTypeEnum: () => [],
    calculationTypeEnum: () => [],
    ETransportType: { road: 1, railway: 2, sea: 3, air: 4 },
    ECalculationType: { byWeight: 1, byLoadRadio: 2, byEnergy: 3 },
  });
  for (const precision of [undefined, 9]) {
    const fields = transportSchema({ productWeightDecimalPlace: precision })
      .properties.accountEmissionTransportList.items.properties.gridWrapper
      .properties;
    const amount = fields.productWeight.properties.amount['x-component-props'];
    assert.equal(amount.precision, precision ?? 6);
    assert.equal(amount.min, 10 ** -(precision ?? 6));
    assert.equal(fields.distance['x-component-props'].precision, 6);
    assert.equal(
      fields.quantityUnit.properties.quantity['x-component-props'].precision,
      6,
    );
    assert.equal(
      fields.factorSchema.properties.factorObj['x-component'],
      'FormilyFactor',
    );
  }
  const processSource = fs.readFileSync(path.join(root, files.process), 'utf8');
  assert.match(processSource, /useContext\(\s*MeasurementPrecisionContext/);
  assert.match(
    processSource,
    /processAccountEmissionSourceSchema\(\s*\(\) => onBasicNameChange\(true\),\s*amountDecimalPlace/,
  );
  assert.match(
    processSource,
    /transportSchema\(\{[^}]*productWeightDecimalPlace/,
  );
});
