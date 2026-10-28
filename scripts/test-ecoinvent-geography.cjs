const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createForm } = require('@formily/core');

const root = path.resolve(__dirname, '..');
const directory = 'src/components/SearchFactor/ModalFactor';

function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    setTimeout,
    clearTimeout,
    require: name => (name in mocks ? mocks[name] : require(name)),
  });
  return exports;
}

const helpers = load(`${directory}/ecoinvent.ts`);
const text = new Proxy({}, { get: (_, key) => String(key) });
const { schema } = load(`${directory}/schema.tsx`, {
  '@src/lang/I18N': { default: new Proxy({}, { get: () => text }) },
  '@/views/subModules/CarbonFootprintModel/components/Factor/util': {
    factorPublishYear: () => [2026, 2025],
  },
  './ecoinvent': helpers,
  '@formily/react': { connect: component => component, mapProps: () => ({}) },
  antd: { Checkbox: () => null, Tooltip: () => null },
  '@ant-design/icons': { RedoOutlined: () => null, SearchOutlined: () => null },
});
const overflowTextMock = {
  default: props => React.createElement('span', null, props.value),
};
const { default: FactorNameCell } = load(
  `${directory}/components/FactorNameCell/index.tsx`,
  {
    '@src/assets/icon/ai.svg': { default: 'ai.svg' },
    '@src/lang/I18N': {
      default: {
        components: { used: '使用过' },
        template: (_, { val1 }) => `AI推荐理由：${val1}`,
      },
    },
    '../../ecoinvent': helpers,
    antd: { Tooltip: props => props.children },
    'antd/lib/typography': {
      default: {
        Paragraph: props => React.createElement('div', null, props.children),
        Text: props => React.createElement('span', null, props.children),
      },
    },
    './index.module.less': { default: {} },
    '@/views/carbonFootprint3/component/TextOverflowTable/byWidth':
      overflowTextMock,
  },
);
const { withEcoinventColumns } = load(`${directory}/ecoinventColumns.tsx`, {
  '@src/lang/I18N': { default: { components: text } },
  './ecoinvent': helpers,
  './components/FactorNameCell': { default: FactorNameCell },
  '@/views/carbonFootprint3/component/TextOverflowTable/byWidth': {
    default: props => React.createElement('span', null, props.value),
  },
});

test('发布机构按名称识别，不依赖固定 ID', () => {
  const form = createForm();
  form.createField({ name: 'institution', value: 'arbitrary-id' });
  const location = form.createArrayField({ name: 'ecoinventGeographies' });
  for (const [name, expected] of [
    [' Ecoinvent ', true],
    ['ECOINVENT', true],
    ['Ecoinvent-V3.12', true],
    [' eCoInVeNt-v3.11 ', true],
    ['其他机构', false],
    [undefined, false],
  ]) {
    helpers.syncEcoinventGeography(
      form,
      name ? [{ id: 'arbitrary-id', institution: name, year: '2026' }] : [],
      true,
    );
    assert.equal(location.visible, expected);
  }
});

test('机构列表返回 null、undefined 或空数组时不报错', () => {
  for (const institutions of [null, undefined, []]) {
    for (const enabled of [true, false]) {
      const form = createForm();
      form.createVoidField({ name: 'grid' });
      const grid = form.createVoidField({ name: 'filters', basePath: 'grid' });
      form.createField({ name: 'institution' });
      const location = form.createArrayField({ name: 'ecoinventGeographies' });
      helpers.syncEcoinventGeography(form, institutions, enabled);
      assert.equal(location.visible, false);
      assert.equal(grid.componentProps.maxColumns, 4);
    }
  }

  const form = createForm();
  const institution = form.createField({
    name: 'institution',
    value: 'selected-id',
  });
  const location = form.createArrayField({ name: 'ecoinventGeographies' });
  helpers.syncEcoinventGeography(
    form,
    [{ id: 'selected-id', institution: 'Ecoinvent', year: '2026' }],
    true,
  );
  location.setValue(['CN']);
  helpers.syncEcoinventGeography(form, null, true);
  assert.equal(location.visible, true);
  assert.deepEqual(Array.from(location.value), ['CN']);
  institution.setValue(undefined);
  helpers.syncEcoinventGeography(form, null, true);
  assert.equal(location.visible, false);
  assert.equal(location.value?.length || 0, 0);
});

test('机构切换、选项更新及关闭开关时清空位置并恢复四列', async () => {
  const form = createForm();
  form.createVoidField({ name: 'grid' });
  const grid = form.createVoidField({ name: 'filters', basePath: 'grid' });
  const institution = form.createField({ name: 'institution' });
  const location = form.createArrayField({
    name: 'ecoinventGeographies',
    initialValue: [],
  });
  const institutions = [
    { id: 'arbitrary-id', institution: ' eCoInVeNt ', year: '2026' },
    { id: 'other', institution: '其他机构', year: '2026' },
  ];
  institution.setValue('arbitrary-id');
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.visible, true);
  assert.equal(grid.componentProps.minColumns, 5);
  location.setValue(['CN', 'GLO']);
  institution.setValue('other');
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.display, 'none');
  assert.equal(form.getValuesIn('ecoinventGeographies')?.length || 0, 0);
  assert.equal(grid.componentProps.maxColumns, 4);
  institution.setValue('arbitrary-id');
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.visible, true);
  assert.equal(form.getValuesIn('ecoinventGeographies')?.length || 0, 0);
  location.setValue(['CN']);
  institution.setValue(undefined);
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.visible, false);
  assert.equal(form.getValuesIn('ecoinventGeographies')?.length || 0, 0);
  institution.setValue('arbitrary-id');
  helpers.syncEcoinventGeography(form, institutions, true);
  location.setValue(['US']);
  helpers.syncEcoinventGeography(form, institutions, false);
  assert.equal(location.visible, false);
  assert.equal(form.getValuesIn('ecoinventGeographies')?.length || 0, 0);
  helpers.syncEcoinventGeography(form, [], true);
  assert.equal(location.visible, true);
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.visible, true);
  await form.reset();
  helpers.syncEcoinventGeography(form, institutions, true);
  assert.equal(location.visible, false);
  assert.equal(grid.componentProps.maxColumns, 4);
});

test('查询返回不同年份的机构 ID 时，保留当前选择对应的名称和地理位置', () => {
  const form = createForm();
  form.createVoidField({ name: 'grid' });
  const grid = form.createVoidField({ name: 'filters', basePath: 'grid' });
  const institution = form.createField({
    name: 'institution',
    value: 'old-id',
  });
  const location = form.createArrayField({ name: 'ecoinventGeographies' });
  helpers.syncEcoinventGeography(
    form,
    [{ id: 'old-id', institution: 'Ecoinvent ', year: '2024' }],
    true,
  );
  location.setValue(['CN', 'GLO']);
  helpers.syncEcoinventGeography(
    form,
    [{ id: 'new-id', institution: 'Ecoinvent ', year: '2025' }],
    true,
  );
  assert.equal(institution.value, 'old-id');
  assert.equal(location.visible, true);
  assert.equal(grid.componentProps.maxColumns, 5);
  assert.deepEqual(Array.from(location.value), ['CN', 'GLO']);

  const anotherForm = createForm();
  anotherForm.createField({ name: 'institution', value: 'old-id' });
  const anotherLocation = anotherForm.createArrayField({
    name: 'ecoinventGeographies',
  });
  helpers.syncEcoinventGeography(anotherForm, [], true);
  assert.equal(anotherLocation.visible, false);

  institution.setValue(undefined);
  helpers.syncEcoinventGeography(form, [], true);
  assert.equal(location.visible, false);
  institution.setValue('new-id');
  helpers.syncEcoinventGeography(form, [], true);
  assert.equal(location.visible, true);
  assert.equal(location.value?.length || 0, 0);
});

test('开关关闭时保留原表单，开启时提供独立筛选行和多选', () => {
  const disabled = schema({}).properties.grid.properties;
  assert.ok(disabled.institution);
  assert.equal(disabled.filters, undefined);
  const filters = schema({ enableEcoinventGeography: true }).properties.grid
    .properties.filters;
  assert.equal(filters['x-component-props']['data-grid-span'], 24);
  assert.deepEqual(Array.from(Object.keys(filters.properties)), [
    'year',
    'factorUnitM',
    'institution',
    'countries',
    'ecoinventGeographies',
  ]);
  const location = filters.properties.ecoinventGeographies;
  assert.equal(
    location['x-component-props'].placeholder,
    'pleaseSelectEcoinventGeography',
  );
  assert.equal(location['x-visible'], false);
  assert.equal(location['x-component-props'].mode, 'multiple');
  assert.equal(location['x-component-props'].options, undefined);
  assert.equal(location['x-component-props'].fieldNames.label, 'dictLabel');
  assert.equal(location['x-component-props'].fieldNames.value, 'dictValue');
  assert.equal(location['x-component-props'].optionFilterProp, 'dictLabel');
  let stopped = false;
  location['x-component-props'].onKeyDown({
    key: 'Enter',
    stopPropagation: () => {
      stopped = true;
    },
  });
  assert.equal(stopped, true);
});

test('地理位置位于单位之后，保留其余列顺序和原配置', () => {
  const columns = [
    { dataIndex: 'name' },
    { dataIndex: 'unit' },
    { dataIndex: 'countries' },
    { dataIndex: 'specification', render: value => value },
    { dataIndex: 'factorUse' },
  ];
  const result = withEcoinventColumns(columns);
  assert.equal(columns.length, 5);
  assert.equal(result.length, 6);
  assert.deepEqual(
    Array.from(result, column => column.dataIndex),
    [
      'name',
      'unit',
      'ecoinventGeography',
      'countries',
      'specification',
      'factorUse',
    ],
  );
  assert.equal(result[2].key, 'ecoinventGeography');
  assert.equal(result[2].title, 'geographicLocation');
  assert.equal(
    result.some(column => column.key === 'technicalDescription'),
    false,
  );
  assert.equal(columns[0].render, undefined);
  const record = {
    id: '1',
    ecoinventGeography: '',
    referenceProductName: null,
  };
  assert.equal(result[2].render(undefined, record).props.value, '-');
  assert.equal(result[0].render(undefined, record).type, FactorNameCell);
  assert.equal(result[3], columns[2]);
  assert.equal(result[4], columns[3]);
  assert.equal(result[5], columns[4]);
  assert.equal(
    result[2].render(undefined, {
      ...record,
      ecoinventGeography: 'IAI Area, Asia, without China and GCC',
    }).props.value,
    'IAI Area, Asia, without China and GCC',
  );
});

test('公共字典 Hook 原值绑定，地理输入查询一次，机构切换清空且不重复查询', async () => {
  const core = require('@formily/core');
  const effects = [];
  const submissions = [];
  const enumArguments = [];
  const dictionary = [
    { dictLabel: 'Switzerland', dictValue: 'CH' },
    {
      dictLabel: 'Asia without China and GCC',
      dictValue: 'IAI Area, Asia, without China and GCC',
    },
  ];
  let form;
  const { SearchForm } = load(`${directory}/SearchForm.tsx`, {
    '@formily/antd-v5': { Form: 'form' },
    '@formily/core': {
      ...core,
      createForm: options => {
        form = core.createForm(options);
        return form;
      },
    },
    '@formily/react': { createSchemaField: () => () => null },
    '@src/lang/I18N': { default: new Proxy({}, { get: () => text }) },
    ahooks: { useEventListener() {} },
    antd: {},
    'lodash-es': { uniqBy: value => value },
    react: {
      useMemo: factory => factory(),
      useRef: current => ({ current }),
      useEffect: effect => effects.push(effect),
    },
    '@/api/request': {
      request: () => {
        throw new Error('不得新增字典请求');
      },
    },
    '@/components/formily/SelectInput': {},
    '@/hooks': {
      useAllEnumsBatch: key => {
        enumArguments.push(key);
        return key ? { ecoinventGeography: dictionary } : undefined;
      },
    },
    '@/hooks/useFieldSetValueByLabel': {},
    '@/hooks/useFieldUnitDictSource': {},
    '@/views/utils': {},
    './index.module.less': { default: {} },
    './ecoinvent': helpers,
    './schema': { schema, CheckboxWithTooltip: () => null },
  });
  SearchForm({
    initialValues: {},
    enableEcoinventGeography: true,
    loading: false,
    institutionsList: [
      { id: 'selected', institution: 'Ecoinvent-V3.12', year: '2026' },
      { id: 'other', institution: '其他机构', year: '2026' },
    ],
    submit: values => submissions.push(values),
  });
  form.createVoidField({ name: 'grid' });
  form.createVoidField({ name: 'filters', basePath: 'grid' });
  const institution = form.createField({ name: 'institution' });
  const location = form.createArrayField({
    name: 'ecoinventGeographies',
    initialValue: [],
  });
  effects.forEach(effect => effect());
  assert.deepEqual(enumArguments, ['ecoinventGeography']);
  assert.equal(location.dataSource[0].dictLabel, 'Switzerland（CH）');
  assert.equal(location.dataSource[1].dictValue, dictionary[1].dictValue);
  assert.equal('label' in location.dataSource[0], false);
  assert.equal('value' in location.dataSource[0], false);

  await institution.onInput('selected');
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(location.visible, true);
  submissions.length = 0;
  await location.onInput(['CH', dictionary[1].dictValue]);
  assert.equal(submissions.length, 1);
  assert.deepEqual(Array.from(submissions[0].ecoinventGeographies), [
    'CH',
    dictionary[1].dictValue,
  ]);
  submissions.length = 0;
  await institution.onInput('other');
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(location.visible, false);
  assert.equal(location.value?.length || 0, 0);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].ecoinventGeographies?.length || 0, 0);
  await institution.onInput('selected');
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(location.visible, true);
  assert.equal(location.value?.length || 0, 0);

  enumArguments.length = 0;
  effects.length = 0;
  SearchForm({
    initialValues: {},
    loading: false,
    enableEcoinventGeography: false,
  });
  assert.deepEqual(enumArguments, [undefined]);
});

test('两个搜索接口保留地理数组，条件变化清除 searchId，翻页复用新缓存', async () => {
  const file = `${directory}/index.tsx`;
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let callback;
  function visit(node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(source) === 'CommonTable'
    ) {
      callback = node.attributes.properties.find(
        item => item.name?.text === 'fetchApi',
      ).initializer.expression;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(callback);
  const code = ts.transpileModule(`(${callback.getText(source)})`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  for (const isEnterprise of [false, true]) {
    const params = {
      name: 'oil boiler',
      factorType: '3',
      matchType: '1',
      institution: 'ecoinvent-id',
      factorUnitM: ['all', 'kg'],
      countries: ['all', 'US'],
      year: '2026',
      ecoinventGeographies: ['CH', 'IAI Area, Asia, without China and GCC'],
      pageNum: 1,
      pageSize: 10,
    };
    const searchId = { current: 'stale-search' };
    const versionId = { current: 'original-version' };
    const searchParamsDataRef = { current: params };
    const prePageParams = {
      current: {
        ...params,
        unit: 'kg',
        institutions: 'ecoinvent-id',
        countries: 'US',
        ecoinventGeographies: ['OLD'],
      },
    };
    const requests = [];
    const fetch = async (data, token) => {
      requests.push({ data, token });
      const payload = {
        rows: [],
        total: 0,
        searchId: 'fresh-search',
        versionId: 'original-version',
        institutionsList: [],
      };
      return isEnterprise ? { data: payload } : { data: { data: payload } };
    };
    const fetchApi = vm.runInNewContext(code, {
      searchParamsDataRef,
      searchId,
      versionId,
      prePageParams,
      isEnterprise,
      normalizeRequestSourceIds: () => undefined,
      isEqual: require('lodash').isEqual,
      axios: {
        CancelToken: { source: () => ({ token: 'cancel-token', cancel() {} }) },
      },
      cancelTokenSource: { current: [] },
      omit: (value, keys) =>
        Object.fromEntries(
          Object.entries(value).filter(([key]) => !keys.includes(key)),
        ),
      GetLocalStorageProductId: () => 'product-id',
      computationId: undefined,
      accountId: undefined,
      enableFactorSourceRange: false,
      getSerachCarbonFactorTable: isEnterprise
        ? () => {
            throw new Error('接口选择错误');
          }
        : fetch,
      getEnterpriseSearchCarbonFactorTable: isEnterprise
        ? fetch
        : () => {
            throw new Error('接口选择错误');
          },
      setLoading() {},
      setSelectionSuggestion() {},
      setInstitutionsList() {},
    });
    await fetchApi({ page: 1, size: 10 });
    assert.equal(
      requests[0].data.ecoinventGeographies,
      params.ecoinventGeographies,
    );
    assert.equal(requests[0].data.searchId, undefined);
    assert.equal(requests[0].data.versionId, 'original-version');
    assert.equal(requests[0].data.institutions, 'ecoinvent-id');
    assert.equal(requests[0].token, 'cancel-token');
    await fetchApi({ page: 2, size: 10 });
    assert.equal(requests[1].data.pageNum, 2);
    assert.equal(requests[1].data.searchId, 'fresh-search');
    assert.equal(
      requests[1].data.ecoinventGeographies,
      params.ecoinventGeographies,
    );
    searchParamsDataRef.current = { ...params, matchType: '3' };
    await fetchApi({ page: 1, size: 10 });
    assert.equal(requests[2].data.matchType, '3');
    assert.equal(requests[2].data.searchId, undefined);
    assert.equal(
      requests[2].data.ecoinventGeographies,
      params.ecoinventGeographies,
    );
    searchParamsDataRef.current = { ...params, ecoinventGeographies: [] };
    await fetchApi({ page: 1, size: 10 });
    assert.equal(requests[3].data.ecoinventGeographies.length, 0);
    assert.equal(requests[3].data.searchId, undefined);
  }
});

test('参考产品展示在名称下方、AI 理由上方，无值隐藏且不回退到其他字段', () => {
  const factor = Object.freeze({
    id: '1',
    name: 'oil boiler production, 10kW',
    referenceProductName: 'oil boiler, 10kW',
    specification: '原有规格型号字段',
    productName: '其他产品字段',
    technicalDescription: '旧 mock 字段',
    recommendReason: '接口返回的推荐理由',
    useStatus: 1,
  });
  const html = renderToStaticMarkup(
    React.createElement(FactorNameCell, { factor }),
  );
  assert.ok(html.includes('使用过'));
  assert.ok(
    html.indexOf(factor.name) < html.indexOf(factor.referenceProductName),
  );
  assert.ok(
    html.indexOf(factor.referenceProductName) <
      html.indexOf(factor.recommendReason),
  );
  assert.ok(!html.includes('模拟数据'));
  assert.ok(!html.includes('技术说明：'));
  assert.ok(!html.includes(factor.specification));
  assert.ok(!html.includes(factor.productName));
  assert.ok(!html.includes(factor.technicalDescription));
  for (const referenceProductName of [null, undefined, '', '   ']) {
    const empty = renderToStaticMarkup(
      React.createElement(FactorNameCell, {
        factor: {
          id: 'empty',
          name: '空值因子',
          referenceProductName,
          specification: '不能作为副标题兜底',
          productName: '不能作为副标题兜底',
        },
      }),
    );
    assert.equal(empty, '<div><div><div>空值因子</div></div></div>');
  }
});

test('搜索直接提交完整地理数组，并在清空或隐藏时清除旧条件', () => {
  const file = `${directory}/index.tsx`;
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let callback;
  function visit(node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      node.tagName.getText(source) === 'SearchForm'
    ) {
      callback = node.attributes.properties.find(
        item => item.name?.text === 'submit',
      ).initializer.expression;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(callback);
  let submitted;
  const code = ts.transpileModule(`(${callback.getText(source)})`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const submit = vm.runInNewContext(code, {
    enableEcoinventGeography: true,
    normalizeRequestSourceIds: values => (values?.length ? values : undefined),
    omit: (value, keys) =>
      Object.fromEntries(
        Object.entries(value).filter(([key]) => !keys.includes(key)),
      ),
    applySearchParamsData: updater => {
      submitted = updater({
        name: '水',
        size: 10,
        pageSize: 10,
        page: 3,
        pageNum: 3,
        ecoinventGeographies: ['OLD'],
      });
      return submitted;
    },
    childRef: { current: { reset() {} } },
    MatchTypeEnum: { basic: '1', sortByAi: '3' },
  });
  const geographies = ['CH', 'IAI Area, Asia, without China and GCC'];
  submit({
    institution: 'example',
    ecoinventGeographies: geographies,
    useAi: true,
  });
  assert.equal(submitted.institution, 'example');
  assert.equal(submitted.name, '水');
  assert.equal(submitted.matchType, '3');
  assert.equal(submitted.ecoinventGeographies, geographies);
  assert.equal(submitted.page, 1);
  assert.equal(submitted.pageNum, 1);
  for (const value of [
    { ecoinventGeographies: [] },
    { institution: 'other' },
  ]) {
    submit(value);
    assert.equal(submitted.ecoinventGeographies.length, 0);
  }
});
