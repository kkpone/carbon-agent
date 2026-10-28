const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const cache = new Map();
const root = path.resolve(__dirname, '..');
let requested;
let teamLocale = 'zh-CN';
const langRoot = path.resolve(__dirname, '../../../../lang');
function load(filename, extra = '') {
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  cache.set(filename, mod);
  const native = Module.createRequire(filename);
  mod.require = name => {
    if (name === '@src/api/request')
      return {
        request: async options => {
          requested = options;
          return {
            data: {
              code: 200,
              data: { id: 42, membershipId: '9223372036854775807' },
            },
          };
        },
      };
    if (name === '@src/lang/I18N')
      return {
        __esModule: true,
        default: {
          get agentTeam() { return load(path.join(langRoot, teamLocale, 'agentTeam.ts')).default; },
          carbonAgent: new Proxy({}, { get: (_, key) => key }),
          template: (text, values = {}) => text.replace(/\{(\w+)\}/g, (match, key) => key in values ? String(values[key]) : match),
        },
      };
    if (name === '@src/lang/createI18nLabelMap')
      return load(path.join(langRoot, 'createI18nLabelMap.ts'));
    if (name.endsWith('.less')) return {};
    if (filename.endsWith('FormRequestCard.tsx') && name === './Icon')
      return { __esModule: true, default: () => null };
    if (filename.endsWith('FormRequestCard.tsx') && name === '../constants')
      return { icons: {} };
    if (
      filename.endsWith('FormRequestCard.tsx') &&
      [
        './CbamNextActionForm',
        './EnterpriseAccountingPurposeForm',
        './Icon',
        '../constants',
      ].includes(name)
    )
      return {};
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), `${name}.ts`);
      if (fs.existsSync(target)) return load(target);
    }
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
const helpers = load(path.join(__dirname, 'helpers.ts'));
const api = load(path.join(__dirname, 'api.ts'));
const json = load(path.join(root, 'monitor/json.ts'));
const errors = load(path.join(__dirname, 'errors.ts'));
const tools = load(path.join(root, 'toolEvents.ts'));
const form = load(
  path.join(root, 'components/FormRequestCard.tsx'),
  '\nexport { normalizeField, createInitialValues, buildFormSubmission, validateFields, buildSubmitPayload, buildCancelPayload, getFormFields, getFormInitialValueSources };',
);

test('Long IDs are parsed losslessly while prices and versions stay numeric', async () => {
  const value = api.normalizeTeamIds(
    json.parseMonitorJson(
      '{"membershipId":9223372036854775807,"id":12,"amount":88.5,"limitVersion":3}',
    ),
  );
  assert.deepEqual(value, {
    membershipId: '9223372036854775807',
    id: '12',
    amount: 88.5,
    limitVersion: 3,
  });
  const result = await api.teamApi.assign('9223372036854775807', 'stable-key');
  assert.deepEqual(requested.data, {
    membershipId: '9223372036854775807',
    requestId: 'stable-key',
  });
  assert.equal(result.id, '42');
});
test('unlimited omits limitValue; specified zero retains versions and rejects below usage', () => {
  const rows = [
    { member: { membershipId: '7' }, shouldChargePoints: 0, limitVersion: 9 },
  ];
  assert.deepEqual(helpers.limitPayload(rows, 'UNLIMITED', 200), {
    membershipIds: ['7'],
    limitMode: 'UNLIMITED',
    versions: { 7: 9 },
  });
  assert.equal(helpers.limitPayload(rows, 'SPECIFIED', 0).limitValue, 0);
  assert.throws(() =>
    helpers.limitPayload(
      [{ ...rows[0], shouldChargePoints: 2 }],
      'SPECIFIED',
      1,
    ),
  );
  assert.throws(() => helpers.limitPayload(rows, 'SPECIFIED', -1));
});
test('exclusive dates use Beijing and quote expiry is enforced', () => {
  assert.equal(helpers.dateText('2026-11-21', true), '2026-11-20');
  assert.equal(helpers.dateText('2026-11-20T16:00:00Z', true), '2026-11-20');
  assert.equal(
    helpers.isQuoteValid({ expiresAt: '2000-01-01 00:00:00' }),
    false,
  );
  assert.equal(
    helpers.isQuoteValid({ expiresAt: '2099-01-01 00:00:00' }),
    true,
  );
});
test('CSV escapes formulas, quotes and embedded newlines', () => {
  assert.equal(helpers.csvCell(' =SUM(A1)'), '"\' =SUM(A1)"');
  assert.equal(helpers.csvCell('a"b\nc'), '"a""b\nc"');
});
test('business denials do not become login expiry', () => {
  assert.equal(
    errors.isAgentBusinessDenial({
      code: 403,
      data: { reasonCode: 'AGENT_SEAT_REQUIRED' },
    }),
    true,
  );
  assert.equal(
    errors.isAgentBusinessDenial({ msg: 'AGENT_LOGIN_REQUIRED' }),
    false,
  );
  assert.equal(
    errors.errorText({
      response: { data: { msg: 'AGENT_CONTEXT_CONFLICT SQL private stack' } },
    }),
    '数据已变化，请刷新后重新确认',
  );
});
test('late and duplicate starts preserve failed tool state and ordering', () => {
  const failed = {
    toolCallId: 'call',
    eventType: 'tool_call_failed',
    status: 'FAILED',
    errorMessage: '业务失败',
    orderNo: 0,
  };
  const merged = tools.mergeToolEvent(failed, {
    toolCallId: 'call',
    eventType: 'tool_call_start',
    status: 'RUNNING',
    orderNo: 9,
  });
  assert.equal(merged.status, 'FAILED');
  assert.equal(merged.orderNo, 0);
  assert.equal(
    tools.finishHistoricalTool({ status: 'RUNNING' }).status,
    'ENDED',
  );
  assert.equal(tools.finishHistoricalTool(failed).status, 'FAILED');
});
test('live and historical tool presentation honors nested visibility and stage name', () => {
  assert.equal(
    tools.isVisibleToolEvent({ safePayload: { display: { visible: false } } }),
    false,
  );
  assert.equal(tools.isVisibleToolEvent({ visible: 0 }), false);
  assert.equal(tools.isVisibleToolEvent({ visible: false }), false);
  assert.equal(
    tools.normalizeToolPresentation({
      payload: { safePayload: { display: { stageName: '解析数据' } } },
    }).display.stageName,
    '解析数据',
  );
});
test('form keeps typed choices, boolean false, numeric zero and one-row arrays', () => {
  const fields = [
    {
      name: 'rows',
      kind: 'array',
      default_rows: [{ amount: 0, enabled: false }],
      columns: [
        { name: 'amount', kind: 'number', required: true, default: 9 },
        { name: 'enabled', kind: 'boolean', required: true },
      ],
    },
    {
      name: 'choice',
      kind: 'single_select',
      value: false,
      options: [false, 'false', 0],
    },
    {
      name: 'choices',
      kind: 'multi_select',
      defaultValue: [0, true, 'x'],
      options: [0, true, 'x'],
    },
    {
      name: 'priority',
      kind: 'integer',
      value: 0,
      defaultValue: 2,
      default: 3,
    },
  ].map((value, index) => form.normalizeField(value, index));
  const values = form.createInitialValues(fields);
  assert.deepEqual(form.validateFields(fields, values), {});
  assert.deepEqual(form.buildFormSubmission(fields, values), {
    rows: [{ amount: 0, enabled: false }],
    choice: false,
    choices: [0, true, 'x'],
    priority: 0,
  });
});
test('form defaultValue precedes default and required rows validate individually', () => {
  const fields = [
    form.normalizeField(
      {
        name: 'rows',
        kind: 'table',
        required: true,
        columns: [{ name: 'x', kind: 'integer', required: true }],
      },
      0,
    ),
  ];
  assert.ok(Object.keys(form.validateFields(fields, { rows: [] })).length);
  assert.ok(
    Object.keys(form.validateFields(fields, { rows: [{ x: 1.5 }] })).length,
  );
  const field = form.normalizeField(
    { name: 'value', defaultValue: 2, default: 3 },
    0,
  );
  assert.equal(form.createInitialValues([field]).value, '2');
});
test('resume template preserves checkpoint, fills nested path, cancellation has no validation', () => {
  const payload = {
    resumeRequest: {
      submit: {
        action: 'resume',
        checkpoint: 'cp',
        interruptId: 'i',
        resumeEventId: 'evt',
        formDataPath: 'resumeData.i.form_submission',
        copyFormDataToResumeRoot: true,
        resumeData: { i: { keep: 1 } },
      },
      cancel: { action: 'cancel', checkpoint: 'cp', resumeEventId: 'evt' },
    },
  };
  const result = form.buildSubmitPayload(
    payload,
    { amount: 0, enabled: false },
    '确认',
  );
  assert.equal(result.checkpoint, 'cp');
  assert.equal(result.formDataPath, undefined);
  assert.deepEqual(result.resumeData.i, {
    keep: 1,
    form_submission: { amount: 0, enabled: false },
  });
  assert.deepEqual(
    form.buildCancelPayload(payload),
    payload.resumeRequest.cancel,
  );
  assert.equal(
    payload.resumeRequest.submit.resumeData.i.form_submission,
    undefined,
  );
});

test('seat orders and point orders use independent polling/terminal states', () => {
  assert.equal(helpers.shouldPollTeamOrder('PENDING'), true);
  assert.equal(helpers.shouldPollTeamOrder('PAID'), true);
  ['APPLIED', 'REVIEW', 'CLOSED', 'paid', 'pending'].forEach(state =>
    assert.equal(helpers.shouldPollTeamOrder(state), false),
  );
  assert.equal(helpers.shouldPollPointOrder('pending'), true);
  ['paid', 'closed', 'PAID', 'PENDING'].forEach(state =>
    assert.equal(helpers.shouldPollPointOrder(state), false),
  );
});
test('a quote cannot authorize a different quantity, action, name or expired price', () => {
  const quote = {
    action: 'OPEN',
    quantity: 2,
    companyName: '示例',
    expiresAt: '2099-01-01T00:00:00+08:00',
  };
  assert.equal(helpers.quoteMatches(quote, 'OPEN', 2, ' 示例 '), true);
  assert.equal(helpers.quoteMatches(quote, 'OPEN', 3, '示例'), false);
  assert.equal(helpers.quoteMatches(quote, 'EXPAND', 2, '示例'), false);
  assert.equal(helpers.quoteMatches(quote, 'OPEN', 2, '新名称'), false);
});
test('CSV row limit counts logical rows, not newlines inside quoted cells', () => {
  assert.equal(
    helpers.csvRecordCount(
      'name,email\r\n"a\nb",a@example.com\r\n"c""d",c@example.com',
    ),
    3,
  );
  assert.equal(
    helpers.csvRecordCount('name\n' + 'member\n'.repeat(1001)),
    1002,
  );
});
test('execution export rejects over-limit, duplicates, changed totals and incomplete pages', async () => {
  const { collectExecutions } = load(
    path.join(__dirname, 'exportExecutions.ts'),
  );
  const page = (total, ids) => ({ total, rows: ids.map(runId => ({ runId })) });
  assert.deepEqual(
    await collectExecutions(async n =>
      n === 1 ? page(3, ['a', 'b']) : page(3, ['c']),
    ),
    [{ runId: 'a' }, { runId: 'b' }, { runId: 'c' }],
  );
  await assert.rejects(
    collectExecutions(async () => page(10001, [])),
    /LIMIT_EXCEEDED/,
  );
  await assert.rejects(
    collectExecutions(async n =>
      n === 1 ? page(3, ['a', 'b']) : page(3, ['b']),
    ),
    /DATA_CHANGED/,
  );
  await assert.rejects(
    collectExecutions(async n =>
      n === 1 ? page(3, ['a', 'b']) : page(4, ['c']),
    ),
    /DATA_CHANGED/,
  );
  await assert.rejects(
    collectExecutions(async n => (n === 1 ? page(3, ['a', 'b']) : page(3, []))),
    /DATA_CHANGED/,
  );
});

test('tool diagnostic presentation strips secrets and internal stack traces', () => {
  const value = JSON.parse(
    tools.publicToolText(
      JSON.stringify({
        message: '完成',
        metadata: { token: 'private' },
        password: 'private',
        count: 0,
      }),
    ),
  );
  assert.deepEqual(value, { message: '完成', count: 0 });
  assert.equal(
    tools.publicToolText('查询失败\n    at module.run(file.js:2)'),
    '执行信息包含内部诊断内容，请联系管理员排查',
  );
  assert.equal(
    tools.publicToolText('已完成 2 项业务检查'),
    '已完成 2 项业务检查',
  );
});

test('finance uses numeric commerce payment states and Beijing timestamps', () => {
  assert.deepEqual(['0', '1', '2', '3', '4'].map(helpers.financePaymentText), [
    '待支付',
    '已支付',
    '已取消',
    '退款中',
    '已退款',
  ]);
  assert.equal(helpers.financePaymentText('APPLIED'), '—');
  assert.equal(
    helpers.dateTimeText('2026-10-22T11:12:58Z'),
    '2026-10-22 19:12:58',
  );
  assert.equal(
    helpers.dateTimeText('2026-10-22 19:12:58'),
    '2026-10-22 19:12:58',
  );
  assert.equal(helpers.dateTimeText(), '—');
});

const productFormFields = [
  {
    name: 'functional_unit',
    label: '功能单位',
    kind: 'single_select',
    required: true,
    options: [
      { value: 'kg', label: '千克' },
      { value: 'piece', label: '件' },
      { value: 'custom', label: '自定义' },
    ],
  },
  {
    name: 'functional_unit_custom',
    label: '自定义功能单位',
    kind: 'text',
    required: true,
  },
  { name: 'product_name', label: '产品名称', required: true },
];
const productPayload = initial_values => ({
  formName: 'product_modeling',
  ui: { title: '产品建模', fields: productFormFields },
  initial_values,
});
const initializeProductForm = payload => {
  const fields = form.getFormFields(payload);
  return {
    fields,
    values: form.createInitialValues(
      fields,
      form.getFormInitialValueSources(payload),
    ),
  };
};

test('legacy functional unit becomes custom, keeps original text and submits contract values', () => {
  const payload = productPayload({
    functional_unit: '  每平方米涂层（寿命 10 年）  ',
    product_name: '涂层',
  });
  const before = JSON.stringify(payload);
  const { fields, values } = initializeProductForm(payload);
  assert.equal(values.functional_unit, 'custom');
  assert.equal(
    values.functional_unit_custom,
    payload.initial_values.functional_unit,
  );
  assert.deepEqual(form.validateFields(fields, values), {});
  assert.deepEqual(form.buildFormSubmission(fields, values), {
    functional_unit: 'custom',
    functional_unit_custom: '每平方米涂层（寿命 10 年）',
    product_name: '涂层',
  });
  assert.equal(
    JSON.stringify(payload),
    before,
    'do not rewrite the history payload',
  );
});

test('functional unit migration preserves existing custom text independent of field order', () => {
  for (const existing of [
    '已填写的功能描述',
    '  已填写的功能描述  ',
    '',
    '   ',
  ]) {
    for (const fields of [
      productFormFields,
      [...productFormFields].reverse(),
    ]) {
      const payload = productPayload({
        functional_unit: '历史自由文本',
        functional_unit_custom: existing,
      });
      payload.ui.fields = fields;
      const { values } = initializeProductForm(payload);
      assert.equal(values.functional_unit, 'custom');
      assert.equal(
        values.functional_unit_custom,
        existing.trim() ? existing : '历史自由文本',
      );
    }
  }
});

test('valid functional unit options and labels retain their meaning', () => {
  for (const [input, expected] of [
    ['kg', 'kg'],
    ['千克', 'kg'],
    ['custom', 'custom'],
    ['', ''],
  ]) {
    const { values } = initializeProductForm(
      productPayload({
        functional_unit: input,
        functional_unit_custom: '已有说明',
      }),
    );
    assert.equal(values.functional_unit, expected);
    assert.equal(values.functional_unit_custom, '已有说明');
  }
});

test('raw interrupt initial values migrate without losing other invalid fields', () => {
  const payload = productPayload({
    functional_unit: '每次使用',
    product_name: '设备',
  });
  payload.ui.fields = [
    ...productFormFields,
    {
      name: 'quantity',
      label: '数量',
      kind: 'number',
      required: true,
    },
  ];
  payload.initial_values.quantity = '旧格式数量';
  const { fields, values } = initializeProductForm({
    rawInterrupt: { value: payload },
  });
  assert.equal(values.functional_unit, 'custom');
  assert.equal(values.functional_unit_custom, '每次使用');
  assert.equal(values.product_name, '设备');
  assert.deepEqual(Object.keys(form.validateFields(fields, values)), [
    'quantity',
  ]);
  assert.deepEqual(form.validateFields(fields, { ...values, quantity: 1 }), {});
});

test('product form renders editable controls despite an unmatched field', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const payload = productPayload({
    functional_unit: '每次使用',
    product_name: '设备',
    region: '历史地区',
    quantity: '旧格式数量',
  });
  payload.ui.fields = [
    ...productFormFields,
    {
      name: 'region',
      label: '地区',
      kind: 'single_select',
      options: ['华东', '华北'],
    },
    { name: 'quantity', label: '数量', kind: 'number', required: true },
  ];
  const html = renderToStaticMarkup(
    React.createElement(form.default, {
      card: { cardType: 'form_request', card: payload },
      onSubmit() {},
    }),
  );
  for (const id of [
    'functional_unit',
    'functional_unit_custom',
    'product_name',
    'region',
    'quantity',
  ])
    assert.ok(html.includes(`id="${id}"`), `${id} remains visible`);
  assert.ok(html.includes('每次使用'));
  assert.ok(html.includes('历史地区'));
  assert.ok(!html.includes('disabled=""'), 'unsubmitted form stays editable');
});

test('report shortcuts use inclusive calendar days across month boundaries', () => {
  assert.deepEqual(helpers.recentDays(7, '2026-03-02'), {
    start: '2026-02-24',
    end: '2026-03-02',
  });
  assert.deepEqual(helpers.recentDays(30, '2026-01-01'), {
    start: '2025-12-03',
    end: '2026-01-01',
  });
  assert.deepEqual(helpers.recentDays(90, '2026-10-23'), {
    start: '2026-07-26',
    end: '2026-10-23',
  });
});
test('invoice state distinguishes issued, pending, legacy applications and ineligible orders', () => {
  assert.equal(
    helpers.financeInvoiceText({ invoiceFlag: 1, invoiceStatus: 0 }),
    '开票中',
  );
  assert.equal(
    helpers.financeInvoiceText({ invoiceFlag: 1, invoiceStatus: 1 }),
    '已开票',
  );
  assert.equal(helpers.financeInvoiceText({ invoiceFlag: 1 }), '已申请开票');
  assert.equal(
    helpers.financeInvoiceText({ invoiceFlag: 0, canInvoice: true }),
    '未开票',
  );
  assert.equal(
    helpers.financeInvoiceText({ invoiceFlag: 0, canInvoice: false }),
    '不可开票',
  );
});
test('finance validity uses historical periods and never invents an expiry date', () => {
  assert.equal(
    helpers.financeValidityText({
      periods: [{ startDate: '2026-10-23', endDateExclusive: '2026-11-23' }],
    }),
    '2026-10-23 至 2026-11-22',
  );
  assert.equal(
    helpers.financeValidityText({ pointValidityDays: 365 }),
    '自权益生效起 365 天',
  );
  assert.equal(helpers.financeValidityText({}), '—');
});

test('audit text uses server actionName and falls back to the raw action', () => {
  assert.equal(
    helpers.auditActionText({
      action: 'FUTURE_EVENT',
      actionName: '服务端新增事件',
    }),
    '服务端新增事件',
  );
  assert.equal(
    helpers.auditActionText({ action: 'MEMBER_CREATE' }),
    'MEMBER_CREATE',
  );
  assert.equal(
    helpers.auditActionText({ action: 'FUTURE_EVENT', actionName: '  ' }),
    'FUTURE_EVENT',
  );
});

test('successful team order creation does not query any previous pending order', async () => {
  const order = {
    orderNo: 'new-order',
    quoteId: 'new-quote',
    state: 'PENDING',
  };
  assert.equal(
    await helpers.createOrRecoverTeamOrder('new-quote', {
      order: async quoteId => {
        assert.equal(quoteId, 'new-quote');
        return order;
      },
      pending: async () => {
        assert.fail('must not query pending after success');
      },
    }),
    order,
  );
});

test('lost create response recovers only a pending order with the exact quoteId', async () => {
  const failure = new Error('response lost');
  const order = {
    orderNo: 'same-order',
    quoteId: 'current-quote',
    state: 'PENDING',
  };
  const create = async () => {
    throw failure;
  };
  assert.equal(
    await helpers.createOrRecoverTeamOrder('current-quote', {
      order: create,
      pending: async () => order,
    }),
    order,
  );
  for (const pending of [
    null,
    { ...order, quoteId: 'old-quote' },
    { orderNo: 'unknown-quote' },
  ]) {
    await assert.rejects(
      helpers.createOrRecoverTeamOrder('current-quote', {
        order: create,
        pending: async () => pending,
      }),
      error => error === failure,
    );
  }
});

test('failed create and pending queries retain the original failure and quote for retry', async () => {
  const failure = new Error('create timed out');
  const attempted = [];
  const api = {
    order: async quoteId => {
      attempted.push(quoteId);
      throw failure;
    },
    pending: async () => {
      throw new Error('pending timed out');
    },
  };
  await assert.rejects(
    helpers.createOrRecoverTeamOrder('original-quote', api),
    error => error === failure,
  );
  await assert.rejects(
    helpers.createOrRecoverTeamOrder('original-quote', api),
    error => error === failure,
  );
  assert.deepEqual(attempted, ['original-quote', 'original-quote']);
});

test('continue payment is available only for unpaid team seat orders', () => {
  for (const action of ['OPEN', 'RENEW', 'EXPAND']) {
    assert.equal(
      helpers.canContinueTeamPayment({ action, entitlementStatus: 'PENDING' }),
      true,
    );
    for (const entitlementStatus of ['PAID', 'APPLIED', 'REVIEW', 'CLOSED'])
      assert.equal(
        helpers.canContinueTeamPayment({ action, entitlementStatus }),
        false,
      );
  }
  assert.equal(
    helpers.canContinueTeamPayment({
      action: 'POINTS',
      entitlementStatus: 'PENDING',
    }),
    false,
  );
});


test('finance list status retains entitlement progress and prioritizes refunds', () => {
  for (const entitlementStatus of ['PENDING', 'PAID', 'APPLIED', 'REVIEW', 'CLOSED', 'pending', 'paid', 'closed']) {
    assert.equal(helpers.financeOrderStatus({ status: '1', entitlementStatus }), entitlementStatus);
  }
  for (const status of ['2', '3', '4']) {
    assert.equal(helpers.financeOrderStatus({ status, entitlementStatus: 'APPLIED' }), helpers.financePaymentText(status));
  }
  assert.equal(helpers.financeOrderStatus({ status: '0' }), '待支付');
  assert.equal(helpers.financeOrderStatus({ status: '1' }), '已支付');
});

test('payment countdown follows server Beijing expiry and never becomes negative', () => {
  const now = Date.parse('2026-10-23T02:00:00Z');
  assert.equal(helpers.paymentSecondsLeft('2026-10-23 10:01:30', now), 90);
  assert.equal(helpers.paymentSecondsLeft('2026-10-23T02:01:30Z', now), 90);
  assert.equal(helpers.paymentSecondsLeft('2026-10-23 09:59:59', now), 0);
  assert.equal(helpers.paymentSecondsLeft(undefined, now), undefined);
  assert.equal(helpers.paymentSecondsLeft('2026-99-99', now), undefined);
});


test('team English messages cover Chinese keys and preserve interpolation variables', () => {
  const zh = load(path.join(langRoot, 'zh-CN/agentTeam.ts')).default;
  const en = load(path.join(langRoot, 'en-US/agentTeam.ts')).default;
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
  const variables = text => (text.match(/\{\w+\}/g) || []).sort();
  for (const key of Object.keys(zh)) {
    assert.ok(en[key].trim(), key);
    assert.ok(!/[\u3400-\u9fff]/.test(en[key]), key);
    assert.deepEqual(variables(en[key]), variables(zh[key]), key);
  }
});

test('team labels, business errors and templates follow locale changes without reloading', () => {
  const { teamText } = load(path.join(__dirname, 'i18n.ts'));
  try {
    teamLocale = 'en-US';
    assert.equal(teamText('switchCompanyAccount'), 'Switch company account');
    assert.equal(helpers.financePaymentText('0'), 'Pending payment');
    assert.equal(errors.reasonText('AGENT_SEAT_REQUIRED'), 'No seat has been assigned to you. Contact an administrator.');
    assert.equal(teamText('valueRecords', { value0: 0 }), '0 records');
    assert.equal(teamText('valueToValue', { value0: '2026-10-23', value1: '2026-11-22' }), '2026-10-23 to 2026-11-22');
    assert.equal(helpers.auditActionText({actionName: '后端事件名称', action: 'TEAM_OPEN'}), '后端事件名称');
    teamLocale = 'zh-CN';
    assert.equal(teamText('switchCompanyAccount'), '切换企业账号');
    assert.equal(errors.reasonText('AGENT_SEAT_REQUIRED'), '尚未分配席位，请联系管理员');
  } finally { teamLocale = 'zh-CN'; }
});
