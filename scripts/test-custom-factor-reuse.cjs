const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createForm } = require('@formily/core');

const root = path.resolve(__dirname, '..');
const factorPath = 'src/components/FormilyUtil/FormilyFactor';
const main = 'src/components/CarbonFootprintAccount/BuildModelMainData';
const context = React.createContext(false);

function source(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
function evaluate(code, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
    },
  }).outputText;
  vm.runInNewContext(compiled, { exports, React, ...globals });
  return exports;
}
function declaration(file, name, globals = {}) {
  const ast = source(file);
  let found;
  function visit(node) {
    if (
      (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) &&
      node.name?.getText(ast) === name
    )
      found = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(found, `Missing ${name}`);
  const code = ts.isVariableDeclaration(found)
    ? `const ${found.getText(ast)};`
    : found.getText(ast);
  return evaluate(`${code}\nexports.result = ${name};`, globals).result;
}
const constants = {
  MODEL_EMISSION_MATCH_WAY: { FACTOR_CREATE: 2, SUPPLIER: 5 },
  FactorPatternType: { ordinaryFactor: '1' },
};
const selectedFixture = {
  id: '4923390481677824123',
  name: 'saved factor',
  factor: '1.1234567891',
  unit: 'kgCO₂e/kg/year',
  institution: 'source',
  year: null,
};
const toFactorValue = declaration(
  `${factorPath}/customFactorReuse/toFactorValue.ts`,
  'toFactorValue',
  constants,
);

const getSavedFactorTarget = declaration(
  `${factorPath}/customFactorReuse/target.ts`,
  'getSavedFactorTarget',
);

test('Real service uses documented methods, query and original response fields in all environments', async () => {
  assert.equal(
    fs.existsSync(path.join(root, factorPath, 'customFactorReuse/mock.ts')),
    false,
  );
  for (const env of ['development', 'production']) {
    const calls = [];
    const service = declaration(
      `${factorPath}/customFactorReuse/service.ts`,
      'savedFactorService',
      {
        process: { env: { NODE_ENV: env } },
        request: async options => {
          calls.push(options);
          return {
            data: {
              code: 200,
              data: options.url.endsWith('/list')
                ? { rows: [selectedFixture], total: 1 }
                : options.method === 'DELETE'
                ? null
                : selectedFixture,
            },
          };
        },
      },
    );
    const filters = {
      name: 'test',
      factor: '1.2300',
      institution: 'source',
      year: '2026',
      pageNum: 2,
      pageSize: 10,
    };
    const page = await service.query(filters);
    assert.equal(page.rows[0], selectedFixture);
    assert.equal(calls[0].params, filters);
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].url, '/footprint3/customFactor/list');
    assert.equal(await service.detail(selectedFixture.id), selectedFixture);
    await service.remove(selectedFixture.id);
    assert.equal(calls[1].method, 'GET');
    assert.equal(calls[2].method, 'DELETE');
    assert.equal(
      calls[2].url,
      `/footprint3/customFactor/${selectedFixture.id}`,
    );
    for (const call of calls) assert.equal(call.data, undefined);
  }
});

test('Real service propagates request failures without successful results', async () => {
  const error = new Error('request layer handled');
  const service = declaration(
    `${factorPath}/customFactorReuse/service.ts`,
    'savedFactorService',
    {
      request: async () => {
        throw error;
      },
    },
  );
  await assert.rejects(service.query({ pageNum: 1, pageSize: 10 }), error);
  await assert.rejects(service.detail('1'), error);
  await assert.rejects(service.remove('1'), error);
});

test('Selecting a saved custom factor uses the real existing submit callback and isolates transport rows', async () => {
  const selected = selectedFixture;
  const mapped = toFactorValue({
    ...selected,
    id: 999,
    amount: 500,
    rate: 100,
  });
  for (const key of ['id', 'id', 'amount', 'rate'])
    assert.equal(key in mapped, false);
  assert.equal(mapped.factor, selected.factor);
  assert.equal(mapped.denominatorUnit, 'kg/year');
  assert.equal(mapped.year, '');
  assert.equal(mapped.matchWay, 2);
  assert.equal(mapped.factorPattern, '1');
  for (const parent of ['', 'accountEmissionTransportList.0']) {
    const fieldPath = parent ? `${parent}.factorObj` : 'factorObj';
    const matchWayPath = parent ? `${parent}.matchWay` : 'matchWay';
    const form = createForm({
      initialValues: {
        amount: 42,
        otherProduct0: { amount: 8 },
        otherProduct1: { factorObj: { name: 'other product' }, matchWay: 1 },
        otherOutPut0: { amount: 9 },
        otherOutPut1: { factorObj: { name: 'other output' }, matchWay: 1 },
        accountEmissionTransportList: [
          { amount: 7 },
          { factorObj: { name: 'sibling' }, matchWay: 1 },
        ],
      },
    });
    form.setValuesIn(fieldPath, {
      id: 19,
      name: 'system factor',
      checkType: 2,
      ecoinventValueVisible: false,
      customFactorId: 'old',
      rate: 3,
      matchWay: 1,
    });
    const field = {
      path: fieldPath,
      parent: parent ? { path: parent } : undefined,
    };
    let autoRateCalls = 0;
    let modalClosed = false;
    const matchFactorObjId = { current: '19' };
    const submit = declaration(`${factorPath}/index.tsx`, 'onSubmit', {
      form,
      field,
      FACTOR_CREATE: 2,
      matchFactorObjId,
      initiativeAutoRate: () => {
        autoRateCalls += 1;
      },
      setFactorModal: visible => {
        modalClosed = !visible;
      },
    });
    // Exercise the actual saved selection handler, which replaces the snapshot before original submit.
    const action = declaration(
      `${factorPath}/index.tsx`,
      'customFactorAction',
      {
        customFactorReuse: true,
        customFactorReuseExcluded: false,
        getSavedFactorTarget,
        savedFactorTarget: getSavedFactorTarget(form, field),
        allowCustomFactorReuse: true,
        savedFactorService: {},
        readPretty: false,
        field: Object.assign(field, { editable: true }),
        form,
        value: { name: 'old' },
        CustomFactorAction: () => null,
        onClickFactorModalBtn: () => {},
        onSubmit: submit,
        toFactorValue,
        cancelTokenSource: { current: [] },
        matchFactorObjId,
        MODEL_EMISSION_MATCH_WAY: constants.MODEL_EMISSION_MATCH_WAY,
      },
    );
    action.props.onSelect(selected);
    assert.equal(form.getValuesIn(fieldPath).rate, undefined);
    assert.equal(form.getValuesIn(fieldPath).checkType, undefined);
    assert.equal(form.getValuesIn(fieldPath).ecoinventValueVisible, undefined);
    assert.equal(form.getValuesIn(fieldPath).name, selected.name);
    assert.equal(form.getValuesIn(fieldPath).id, undefined);
    assert.equal(form.getValuesIn(matchWayPath), 2);
    assert.equal(form.getValuesIn('amount'), 42);
    assert.equal(form.getValuesIn('otherProduct0.amount'), 8);
    assert.equal(form.getValuesIn('otherOutPut0.amount'), 9);
    assert.equal(
      form.getValuesIn('otherProduct1.factorObj.name'),
      'other product',
    );
    assert.equal(
      form.getValuesIn('otherOutPut1.factorObj.name'),
      'other output',
    );
    assert.equal(form.getValuesIn('otherProduct1.matchWay'), 1);
    assert.equal(form.getValuesIn('otherOutPut1.matchWay'), 1);
    assert.equal(form.getValuesIn('accountEmissionTransportList.0.amount'), 7);
    assert.equal(
      form.getValuesIn('accountEmissionTransportList.1.factorObj.name'),
      'sibling',
    );
    assert.equal(
      form.getValuesIn('accountEmissionTransportList.1.matchWay'),
      1,
    );
    assert.equal(autoRateCalls, 1);
    assert.equal(matchFactorObjId.current, '');
    assert.ok(modalClosed);
  }
});

test('New action requires explicit scope, writable field, available service and stable form', () => {
  const base = {
    customFactorReuse: true,
    customFactorReuseExcluded: false,
    getSavedFactorTarget,
    savedFactorTarget: 'target',
    allowCustomFactorReuse: true,
    MODEL_EMISSION_MATCH_WAY: constants.MODEL_EMISSION_MATCH_WAY,
    savedFactorService: {},
    readPretty: false,
    field: { editable: true, address: 'factorObj' },
    form: { id: 'f', loading: false, getValuesIn: () => 1 },
    value: { name: 'factor' },
    CustomFactorAction: () => null,
    onClickFactorModalBtn: () => {},
    onSubmit: () => {},
    toFactorValue,
  };
  assert.ok(declaration(`${factorPath}/index.tsx`, 'customFactorAction', base));
  for (const override of [
    { customFactorReuse: false },
    { customFactorReuseExcluded: true },
    { allowCustomFactorReuse: false },
    { readPretty: true },
    { field: { ...base.field, editable: false } },
    { form: { ...base.form, loading: true } },
  ]) {
    assert.equal(
      declaration(`${factorPath}/index.tsx`, 'customFactorAction', {
        ...base,
        ...override,
      }),
      null,
    );
  }
  const action = declaration(
    `${factorPath}/index.tsx`,
    'customFactorAction',
    base,
  );
  assert.equal(action.props.onEdit, base.onClickFactorModalBtn);
});

function jsxElement(file, tag, globals) {
  const ast = source(file);
  let target;
  function visit(node) {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(ast) === tag
    )
      target = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(target, `Missing ${tag}`);
  return evaluate(`exports.element = (${target.getText(ast)});`, globals)
    .element;
}

test('Process entry boundaries enable writable scopes and support a single rollback switch', () => {
  function Probe() {
    return React.useContext(context) ? 'enabled' : 'disabled';
  }
  const processLibrary = 'src/views/carbonFootprint3/discharge/process';
  const cases = [
    [
      `${main}/BuildModelList/index.tsx`,
      { ProcessBuildList: Probe },
      { isDetail: false },
      { isDetail: true },
    ],
    [
      `${main}/BuildModelVisual/index.tsx`,
      { ProcessBuildVisual: Probe },
      { isDetail: false },
      { isDetail: true },
    ],
    [
      `${processLibrary}/details/index.tsx`,
      { content: React.createElement(Probe) },
      { isDetail: false },
      { isDetail: true },
    ],
    [
      'src/views/carbonFootprint3/ProcessBusinessAccounting/AddOrDetail/index.tsx',
      { page: React.createElement(Probe), MODEL: 1 },
      { stepValue: 1 },
      { stepValue: 2 },
    ],
  ];
  const isAgent = source(
    'src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/index.tsx',
  ).text.includes('agentPreviewLayout');
  for (const [file, children, writable, readonly] of isAgent
    ? cases.slice(0, 2)
    : cases) {
    for (const enabled of [true, false]) {
      for (const ancestorEnabled of [true, false]) {
        for (const [state, expected] of [
          [writable, enabled && !isAgent],
          [readonly, false],
        ]) {
          const element = jsxElement(
            file,
            'CustomFactorReuseContext.Provider',
            {
              CustomFactorReuseContext: context,
              PROCESS_CUSTOM_FACTOR_REUSE_ENABLED: enabled,
              accountInfo: {},
              apiExtraParams: {},
              updateAccountInfo: undefined,
              editAccount: undefined,
              enableFactorSourceRange: false,
              onEmissionTaskCreate: undefined,
              ...children,
              ...state,
            },
          );
          const html = renderToStaticMarkup(
            React.createElement(
              context.Provider,
              { value: ancestorEnabled },
              element,
            ),
          );
          assert.equal(html, expected ? 'enabled' : 'disabled', file);
        }
      }
    }
  }
});

test('Menu keeps the old edit handler and exposes saved selection in both empty and populated states', () => {
  for (const hasFactor of [false, true]) {
    const actions = [];
    const Component = declaration(
      `${factorPath}/components/CustomFactorAction/index.tsx`,
      'CustomFactorAction',
      {
        useState: () => [undefined, open => actions.push(open)],
        useSelector: () => 'scope',
        selectSavedFactorScope: () => 'scope',
        useEffect: () => {},
        I18N: {
          customFactorReuse: {
            add: 'add',
            edit: 'edit',
            chooseSaved: 'select',
            customFactor: 'custom',
          },
        },
        Dropdown: 'dropdown',
        Button: 'button',
        IconAlibaba: 'icon',
        DownOutlined: 'arrow',
        styles: {},
      },
    );
    const result = Component({
      hasFactor,
      service: {},
      onEdit: () => actions.push('edit'),
      onSelect: () => {},
    });
    const menu = result.props.children[0].props.menu;
    assert.equal(menu.items[0].label, hasFactor ? 'edit' : 'add');
    assert.equal(menu.items[1].label, 'select');
    menu.onClick({ key: 'edit' });
    menu.onClick({ key: 'select' });
    assert.deepEqual(actions, ['edit', 'scope']);
  }
});

test('Selection cannot write back after permission is revoked or the original field unmounts', () => {
  for (const change of ['readonly', 'unmounted']) {
    const writes = [];
    const field = { editable: true, address: 'factorObj', unmounted: false };
    const form = { id: 'form', getValuesIn: () => 1, loading: false };
    const action = declaration(
      `${factorPath}/index.tsx`,
      'customFactorAction',
      {
        customFactorReuse: true,
        customFactorReuseExcluded: false,
        getSavedFactorTarget,
        savedFactorTarget: getSavedFactorTarget(form, field),
        allowCustomFactorReuse: true,
        MODEL_EMISSION_MATCH_WAY: constants.MODEL_EMISSION_MATCH_WAY,
        savedFactorService: {},
        readPretty: false,
        field,
        form,
        value: { name: 'factor' },
        CustomFactorAction: () => null,
        onClickFactorModalBtn: () => {},
        onSubmit: value => writes.push(value),
        toFactorValue,
      },
    );
    if (change === 'readonly') field.editable = false;
    else field.unmounted = true;
    action.props.onSelect({ name: 'saved' });
    assert.equal(writes.length, 0);
  }
});

test('Closing or changing the list discards an outstanding query response', async () => {
  const file = `${factorPath}/components/SavedFactorPicker/components/SavedFactorList/index.tsx`;
  const ast = source(file);
  let effect;
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(ast) === 'useEffect'
    )
      effect = node.arguments[0].getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const events = [];
  let resolve;
  const query = new Promise(done => {
    resolve = done;
  });
  const runEffect = evaluate(`exports.effect = ${effect};`, {
    getSavedFactorScope: () => 'scope',
    service: { query: () => query },
    filters: {},
    pageNum: 1,
    pageSize: 10,
    onSelectionChange: undefined,
    setLoading: value => events.push(['loading', value]),
    setPage: value => events.push(['page', value]),
    setPageNum: value => events.push(['pageNum', value]),
  }).effect;
  const cleanup = runEffect();
  cleanup();
  resolve({ rows: [{ name: 'old model' }], total: 1 });
  await new Promise(setImmediate);
  assert.deepEqual(events, [['loading', true]]);
});

test('Failed or stale deletion never triggers the success refresh', async () => {
  for (const outcome of ['failed', 'closed', 'success']) {
    const events = [];
    const active = { current: true };
    const pending = { current: false };
    let resolve;
    let reject;
    const response = new Promise((done, fail) => {
      resolve = done;
      reject = fail;
    });
    const remove = declaration(
      `${factorPath}/components/SavedFactorPicker/index.tsx`,
      'remove',
      {
        deleteTarget: { id: 'saved-1' },
        scope: { current: 'scope' },
        getSavedFactorScope: () => 'scope',
        deletePending: pending,
        active,
        service: { remove: () => response },
        setDeleting: value => events.push(['loading', value]),
        setDeleteTarget: () => events.push('clear'),
        setSelectedFactor: () => events.push('clearSelection'),
        setRevision: () => events.push('refresh'),
      },
    );
    const completion = remove();
    if (outcome === 'closed') active.current = false;
    if (outcome === 'failed') reject(new Error('Handled by request layer'));
    else resolve();
    await completion;
    assert.equal(events.includes('refresh'), outcome === 'success');
    assert.equal(events.includes('clear'), outcome === 'success');
    assert.equal(pending.current, false);
  }
});

test('Original manual form still prefills both system and custom factors', () => {
  for (const matchWay of [1, 2]) {
    const record = {
      name: 'existing factor',
      matchWay,
      factor: 0.1234,
      institution: 'source',
      year: '2024',
    };
    const events = [];
    const open = declaration(
      `${factorPath}/index.tsx`,
      'onClickFactorModalBtn',
      {
        field: { path: 'factorObj' },
        form: { getValuesIn: () => record },
        isEmpty: require('lodash/isEmpty'),
        setEditFactorModalValues: value => events.push(value),
        setFactorModalRead: value => events.push(value),
        setFactorModal: value => events.push(value),
      },
    );
    open();
    assert.equal(events[0], record);
    assert.deepEqual(events.slice(1), [false, true]);
  }
});

const agentBoundaryFile =
  'src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/index.tsx';
if (source(agentBoundaryFile).text.includes('agentPreviewLayout')) {
  test('Agent enables reuse only for writable right-panel quick models, not iframe shares or process models', () => {
    const ast = source(agentBoundaryFile);
    let expression;
    function visit(node) {
      if (
        ts.isJsxOpeningElement(node) &&
        node.tagName.getText(ast) === 'CustomFactorReuseContext.Provider'
      ) {
        expression = node.attributes.properties
          .find(attribute => attribute.name?.getText(ast) === 'value')
          .initializer.expression.getText(ast);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.ok(expression);
    for (const [agentPreviewLayout, emissionReadOnly, type, expected] of [
      [true, false, 0, true],
      [true, true, 0, false],
      [false, false, 0, false],
      [undefined, true, 0, false],
      [true, false, 1, false],
    ]) {
      assert.equal(
        evaluate(`exports.enabled = ${expression};`, {
          agentPreviewLayout,
          emissionReadOnly,
          accountInfo: { type },
          FootprintAccountStatusType: { QUICK: 0 },
        }).enabled,
        expected,
      );
    }
  });
}

test('Confirm fetches detail once and ignores closed, failed or changed-scope responses', async () => {
  for (const outcome of ['success', 'closed', 'scope', 'business', 'network']) {
    const writes = [];
    const events = [];
    let currentScope = 'a';
    let resolve;
    let reject;
    let requests = 0;
    const response = new Promise((done, fail) => {
      resolve = done;
      reject = fail;
    });
    const active = { current: true };
    const selectPending = { current: false };
    const confirm = declaration(
      `${factorPath}/components/SavedFactorPicker/index.tsx`,
      'confirmSelection',
      {
        selectedFactor: selectedFixture,
        managerOpen: false,
        active,
        selectPending,
        scope: { current: 'a' },
        getSavedFactorScope: () => currentScope,
        service: {
          detail: id => {
            assert.equal(id, selectedFixture.id);
            requests++;
            return response;
          },
        },
        setSelecting: () => {},
        setSelectedFactor: () => events.push('clear'),
        setRevision: () => events.push('refresh'),
        onSelect: record => writes.push(record),
      },
    );
    assert.equal(requests, 0);
    const first = confirm();
    await confirm();
    assert.equal(requests, 1);
    if (outcome === 'closed') active.current = false;
    if (outcome === 'scope') currentScope = 'b';
    if (outcome === 'business') reject({ data: { code: 500 } });
    else if (outcome === 'network') reject(new Error('offline'));
    else resolve({ ...selectedFixture, name: 'latest detail' });
    await first;
    assert.equal(writes.length, outcome === 'success' ? 1 : 0);
    if (writes.length) assert.equal(writes[0].name, 'latest detail');
    assert.equal(events.includes('refresh'), outcome === 'business');
    assert.equal(selectPending.current, false);
  }
});

test('Picker Cancel closes without committing a pending table selection', () => {
  const writes = [];
  const pending = { id: 'saved-1', name: 'pending' };
  let closes = 0;
  let stateIndex = 0;
  let refIndex = 0;
  const values = [pending, false, 0, undefined, false, false];
  const refs = [
    { current: true },
    { current: 'scope' },
    { current: false },
    { current: false },
  ];
  const Component = declaration(
    `${factorPath}/components/SavedFactorPicker/index.tsx`,
    'SavedFactorPicker',
    {
      useState: () => [values[stateIndex++], () => {}],
      useRef: () => refs[refIndex++],
      useEffect: () => {},
      Modal: 'modal',
      Button: 'button',
      SavedFactorList: 'list',
      LeftOutlined: 'icon',
      I18N: { customFactorReuse: {} },
      styles: {},
      manageFactorsIcon: '',
      getSavedFactorScope: () => 'scope',
    },
  );
  const picker = Component({
    service: {},
    onSelect: value => writes.push(value),
    onClose: () => {
      closes += 1;
    },
  });
  const modal = picker.props.children[0];
  assert.equal(modal.props.okButtonProps.disabled, false);
  assert.equal(modal.props.children.props.selectedFactor, pending);
  modal.props.onCancel();
  assert.equal(closes, 1);
  assert.equal(writes.length, 0);
});

test('Table uses single selection, continuous page numbers, and clears pending selection on paging and filtering', () => {
  const record = { id: 'saved-11', name: 'pending' };
  for (const mode of ['select', 'manage']) {
    const events = [];
    const values = [{}, 2, 10, { rows: [record], total: 23 }, false];
    const updates = [];
    let stateIndex = 0;
    const Component = declaration(
      `${factorPath}/components/SavedFactorPicker/components/SavedFactorList/index.tsx`,
      'SavedFactorList',
      {
        useState: () => {
          const index = stateIndex++;
          return [
            values[index],
            value => {
              updates[index] = value;
            },
          ];
        },
        useEffect: () => {},
        Form: Object.assign(() => null, {
          useForm: () => [{ resetFields: () => {} }],
          Item: 'item',
        }),
        Table: 'table',
        Pagination: 'pagination',
        Input: 'input',
        InputNumber: 'number',
        DatePicker: 'date',
        Button: 'button',
        I18N: { customFactorReuse: {} },
        styles: {},
        emptyImage: '',
      },
    );
    const element = Component({
      service: {},
      revision: 0,
      mode,
      selectedFactor: record,
      onSelectionChange: value => events.push(value),
    });
    const [form, tableArea, pagination] = element.props.children;
    const factorInput = form.props.children.find(
      child => child.props.name === 'factor',
    ).props.children;
    assert.equal(factorInput.props.precision, undefined);
    assert.equal(factorInput.props.stringMode, true);
    for (const factor of ['0.123456789123456789', '2.74', '0']) {
      assert.equal(
        factorInput.props.formatter(factor, {
          userTyping: false,
          input: factor,
        }),
        factor,
      );
      form.props.onFinish({ factor });
      assert.equal(updates[0].factor, factor);
    }
    const table = tableArea.props.children;
    assert.equal(table.props.columns[0].render(null, record, 0), 11);
    assert.equal(table.props.columns[0].render(null, record, 9), 20);
    assert.equal(table.props.columns.length, mode === 'select' ? 6 : 7);
    if (mode === 'select') {
      assert.equal(table.props.rowSelection.type, 'radio');
      table.props.rowSelection.onChange([record.id], [record]);
      assert.equal(events.pop(), record);
    } else assert.equal(table.props.rowSelection, undefined);
    assert.equal(table.props.pagination, false);
    assert.equal(pagination.props.size, 'default');
    pagination.props.onChange(3, 10);
    assert.equal(events.pop(), undefined);
    form.props.onFinish({ name: 'filter' });
    assert.equal(events.pop(), undefined);
    assert.ok(table.props.scroll.y);
  }
});

test('Field wiring reacts to supplier mode and excluded forms always keep the original action', () => {
  const ast = source(`${factorPath}/index.tsx`);
  const exported = ast.statements.find(node => ts.isExportAssignment(node));
  const globals = {
    FormilyFactor: () => null,
    connect: (_, mapper) => mapper,
    mapProps: (_, mapper) => mapper,
    MODEL_EMISSION_MATCH_WAY: constants.MODEL_EMISSION_MATCH_WAY,
  };
  const normal = evaluate(
    `exports.mapper = ${exported.expression.getText(ast)};`,
    globals,
  ).mapper;
  const excluded = declaration(
    `${factorPath}/index.tsx`,
    'FormilyFactorWithoutReuse',
    globals,
  );
  const form = createForm({ initialValues: { matchWay: 1 } });
  const field = form.createObjectField({ name: 'factorObj' });
  for (const matchWay of [1, 2, 5, 2]) {
    form.setValuesIn('matchWay', matchWay);
    assert.equal(normal({}, field).allowCustomFactorReuse, matchWay !== 5);
    assert.equal(excluded({}, field).allowCustomFactorReuse, false);
  }
  field.setState({ readPretty: true });
  assert.equal(normal({}, field).allowCustomFactorReuse, false);
  const isAgent = source(
    'src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/index.tsx',
  ).text.includes('agentPreviewLayout');
  for (const name of isAgent
    ? []
    : ['ProcessDrawer', 'ProductDrawer', 'OutPutDrawer']) {
    const file = `src/views/carbonFootprint3/component/AccessoryDrawer/${name}/index.tsx`;
    assert.match(
      source(file).text,
      /FormilyFactorWithoutReuse as FormilyFactor/,
    );
  }
});

test('Switching the target emission or transport row prevents late writeback', () => {
  const form = createForm({
    initialValues: { id: 'old', accountId: 'account-a', matchWay: 2 },
  });
  const field = form.createObjectField({ name: 'factorObj' });
  let writes = 0;
  const action = declaration(`${factorPath}/index.tsx`, 'customFactorAction', {
    customFactorReuse: true,
    customFactorReuseExcluded: false,
    allowCustomFactorReuse: true,
    savedFactorService: {},
    readPretty: false,
    savedFactorTarget: getSavedFactorTarget(form, field),
    getSavedFactorTarget,
    field,
    form,
    value: { name: 'factor' },
    CustomFactorAction: () => null,
    onClickFactorModalBtn: () => {},
    onSubmit: () => writes++,
    toFactorValue,
    MODEL_EMISSION_MATCH_WAY: constants.MODEL_EMISSION_MATCH_WAY,
  });
  form.setValuesIn('accountId', 'account-b');
  action.props.onSelect(selectedFixture);
  assert.equal(writes, 0);
});

test('Shared page exclusion overrides inner reuse providers, including legacy shares without a snapshot flag', () => {
  const ast = source(
    'src/components/CarbonFootprintAccount/ShareBuildModelMainData/index.tsx',
  );
  let provider;
  function visit(node) {
    if (
      ts.isJsxOpeningElement(node) &&
      node.tagName.getText(ast) === 'CustomFactorReuseExcludedContext.Provider'
    )
      provider = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(provider);
  const value = provider.attributes.properties.find(
    prop => prop.name?.getText(ast) === 'value',
  );
  assert.ok(value);
  assert.equal(value.initializer, undefined);
  const excludedContext = React.createContext(false);
  function Probe() {
    const customFactorReuseExcluded = declaration(
      `${factorPath}/index.tsx`,
      'customFactorReuseExcluded',
      {
        useContext: React.useContext,
        CustomFactorReuseExcludedContext: excludedContext,
      },
    );
    const action = declaration(
      `${factorPath}/index.tsx`,
      'customFactorAction',
      {
        customFactorReuse: React.useContext(context),
        customFactorReuseExcluded,
        allowCustomFactorReuse: true,
      },
    );
    return action === null ? 'original' : 'reuse';
  }
  const html = renderToStaticMarkup(
    React.createElement(
      excludedContext.Provider,
      { value: true },
      React.createElement(
        context.Provider,
        { value: true },
        React.createElement(Probe),
      ),
    ),
  );
  assert.equal(html, 'original');
});
