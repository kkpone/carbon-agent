/* Run with: node --test scripts/test-carbon-label.cjs. No live API calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { createForm } = require('@formily/core');
const { Schema } = require('@formily/react');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
function load(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const result = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
    filename,
  })(
    name => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
    result,
    result.exports,
  );
  return result.exports;
}
const lang = {
  carbonAgent: load('src/lang/zh-CN/carbonAgent.ts').default,
  carbonAccount: load('src/lang/zh-CN/carbonAccount.ts').default,
  carbonFootprint: new Proxy({}, { get: (_, key) => String(key) }),
  carbonFootprint3: new Proxy({}, { get: (_, key) => String(key) }),
  template: (text, values) =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(values[key])),
};
const constants = load('src/views/carbonFootprint3/CarbonLabel/constant.ts', {
  '@src/lang/I18N': lang,
});
function loadData(services = {}, prepare = {}) {
  return load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/data.ts',
    {
      '@src/lang/I18N': lang,
      '@src/views/carbonFootprint3/CarbonLabel/constant': constants,
      '@src/views/carbonFootprint3/CarbonLabel/service': {
        getCarbonLabelContrastList: async () => ({ data: { data: [] } }),
        ...services,
      },
      './service': {
        ...prepare,
      },
    },
  );
}
const data = loadData();
const access = load(
  'src/views/system/carbonAgent/components/carbonLabelPreview.ts',
);
const source = {
  id: 71,
  productId: 12,
  accountId: 34,
  applyNum: 'apply-71',
  productName: 'Original',
  accountName: '1 item',
  startTime: '2026-01-01',
  endTime: '2026-12-31',
  unitName: 'item',
  brand: 'Brand',
  specs: 'Model',
  productPic: 'image-one',
  specsShow: 1,
  contrastShow: 1,
  contrastValues: '1,2',
  accountObj: {
    perEmission: '7.05',
    unitName: 'kgCO₂e',
    equalList: [
      { code: 1, name: '家庭用电量', amount: 42, unitName: 'kWh' },
    ],
    stageList: [{ stage: 1, rateAccount: 38 }],
  },
};

test('Agent H5 fixes category slots and stamp stacking without changing legacy styles', () => {
  const lessSyntax = require('postcss-less');
  const filename = path.join(
    root,
    'src/views/carbonFootprint3/CarbonLabel/component/PreviewH5/index.module.less',
  );
  const stylesheet = lessSyntax.parse(fs.readFileSync(filename, 'utf8'));
  const declarations = selector => {
    const values = {};
    stylesheet.walkRules(rule => {
      const ancestry = [];
      for (let node = rule; node?.type !== 'root'; node = node.parent) {
        if (node.type === 'rule') ancestry.unshift(node.selector);
      }
      if (ancestry.join(' ') !== selector) return;
      rule.each(declaration => {
        if (declaration.type === 'decl')
          values[declaration.prop] = declaration.value;
      });
    });
    return values;
  };
  const legacyRoot = '.previewH5 .content .main';
  const agentRoot = '.previewH5.agentPreview .content .main';
  const image = declarations(agentRoot + ' .productImg');
  const header = declarations(agentRoot + ' .carbonIsoMain');
  assert.equal(image['object-fit'], 'contain');
  assert.equal(image.height, 'calc(343 * var(--h5-px))');
  assert.equal(header.top, 'calc(268 * var(--h5-px))');
  assert.equal(header.border, '0');
  assert.equal(image['clip-path'], undefined);
  assert.equal(
    declarations(legacyRoot + ' .productImg')['clip-path'],
    undefined,
  );
  const categoryPath =
    ' .carbonFootprintMain .footprintAboutMain .aboutContent';
  const categories = declarations(agentRoot + categoryPath);
  assert.equal(categories.display, 'grid');
  assert.equal(
    categories['grid-template-columns'],
    'repeat(3, minmax(0, 1fr))',
  );
  const category = declarations(agentRoot + categoryPath + ' .every');
  assert.equal(category.width, 'auto');
  assert.equal(category.flex, undefined);
  const stamp = declarations(
    agentRoot + ' .carbonFootprintMain .footprintMain .willMain',
  );
  const product = declarations(legacyRoot + ' .productInfo');
  assert.ok(Number(stamp['z-index']) > Number(product['z-index']));
  assert.equal(declarations(legacyRoot + categoryPath).display, 'flex');
  assert.equal(
    declarations(legacyRoot + categoryPath)['justify-content'],
    'space-around',
  );
  assert.equal(
    declarations(legacyRoot + ' .carbonFootprintMain .footprintMain .willMain')[
      'z-index'
    ],
    undefined,
  );
});

test('Figma example assets are displayed without additional blur or opacity', () => {
  const lessSyntax = require('postcss-less');
  const stylesheet = lessSyntax.parse(
    fs.readFileSync(
      path.join(
        root,
        'src/views/system/carbonAgent/components/ProductCarbonLabelApply/index.module.less',
      ),
      'utf8',
    ),
  );
  for (const selector of ['.exampleGraphic', '.exampleQr']) {
    let found = false;
    stylesheet.walkRules(rule => {
      if (rule.selector !== selector) return;
      found = true;
      rule.walkDecls(declaration => {
        assert.ok(
          !['filter', 'backdrop-filter', 'opacity'].includes(declaration.prop),
          `${selector} must use the exported Figma image effects directly`,
        );
      });
    });
    assert.ok(found, `${selector} must exist`);
  }
});

test('application page belongs to Agent components and is lazy-loaded without retaining the old page', () => {
  const agentComponent =
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply';
  assert.ok(fs.existsSync(path.join(root, agentComponent, 'index.tsx')));
  assert.ok(
    !fs.existsSync(
      path.join(root, 'src/views/carbonFootprint3/CarbonLabel/AgentApply'),
    ),
  );
  const previewPane = fs.readFileSync(
    path.join(root, 'src/views/system/carbonAgent/components/PreviewPane.tsx'),
    'utf8',
  );
  assert.match(
    previewPane,
    /lazy\(\s*\(\) => import\('\.\/ProductCarbonLabelApply'\)/,
  );
  const schema = fs.readFileSync(
    path.join(root, agentComponent, 'schema.tsx'),
    'utf8',
  );
  assert.ok(!schema.includes('AddOrDetail/schema'));
  for (const name of [
    'application',
    'calendar',
    'hidden',
    'points',
    'selected',
    'unselected',
    'upload',
  ]) {
    assert.ok(
      fs.existsSync(path.join(root, agentComponent, 'assets', `${name}.svg`)),
    );
  }
});

test('extracted payment confirmation delegates actions and preserves submission locks', () => {
  const { PaymentConfirmModal } = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/components/PaymentConfirmModal.tsx',
    {
      '@src/lang/I18N': lang,
      antd: { Modal: () => null },
    },
  );
  const onConfirm = () => {};
  const onCancel = () => {};
  for (const submitting of [false, true]) {
    const modal = PaymentConfirmModal({
      open: true,
      pointCost: 2468,
      submitting,
      onConfirm,
      onCancel,
    });
    assert.equal(modal.props.open, true);
    assert.equal(modal.props.onOk, onConfirm);
    assert.equal(modal.props.onCancel, onCancel);
    assert.equal(modal.props.confirmLoading, submitting);
    assert.equal(modal.props.closable, !submitting);
    assert.equal(modal.props.maskClosable, !submitting);
    assert.equal(modal.props.cancelButtonProps.disabled, submitting);
    assert.match(renderToStaticMarkup(modal.props.children), /2468/);
    assert.equal(modal.props.okButtonProps, undefined);
  }
  const pending = PaymentConfirmModal({ open: true, submitting: false, onConfirm, onCancel });
  assert.equal(pending.props.okButtonProps, undefined);
  assert.ok(!renderToStaticMarkup(pending.props.children).includes('1299'));
});

test('rejected applications follow Figma copy without duplicate feedback or payment text and retain submission handlers', () => {
  const requests = [];
  const buttons = [];
  const renderedForms = [];
  const renderedRecords = [];
  const auditRecords = [{ id: 1, actType: 3, comment: 'Keep the complete review feedback' }];
  const prepareSubmit = () => requests.push('prepareSubmit');
  let state = {
    info: source,
    preview: source,
    pointCost: 2468,
    auditRecords,
    editable: true,
    canSubmit: true,
    submitting: false,
    loading: false,
    approved: false,
    rejected: false,
    status: constants.ApplyForAccountStatus.TO_BE_SUB,
    prepareSubmit,
  };
  const { default: ApplicationPage } = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/index.tsx',
    {
      '@src/lang/I18N': lang,
      '@src/views/carbonFootprint3/CarbonLabel/constant': constants,
      './assets/application.svg': 'application.svg',
      './assets/points.svg': 'points.svg',
      './components/ApplicationForm': {
        ApplicationForm: props => {
          renderedForms.push(props);
          return React.createElement('div', null, 'Application form');
        },
      },
      './components/ApplicationRecords': {
        ApplicationRecords: props => {
          renderedRecords.push(props);
          return React.createElement('section', null, props.auditRecords.map(row => row.comment));
        },
      },
      './components/ApplicationPreview': { ApplicationPreview: () => null },
      './components/PaymentConfirmModal': { PaymentConfirmModal: () => null },
      './data': data,
      './useLabelApplication': { useLabelApplication: () => state },
      './index.module.less': {
        footer: 'footer',
        resubmitFooter: 'resubmitFooter',
        applicationColumn: 'applicationColumn',
        rejectedColumn: 'rejectedColumn',
        applicationCards: 'applicationCards',
        applicationCard: 'applicationCard',
        statusTag: 'statusTag',
      },
      antd: {
        Alert: ({ message, description }) => React.createElement('div', { role: 'alert' }, message, description),
        Spin: ({ children }) => children,
        Button: props => {
          buttons.push(props);
          return React.createElement('button', { disabled: props.disabled }, props.children);
        },
      },
    },
  );
  const render = () => {
    buttons.length = 0;
    return renderToStaticMarkup(React.createElement(ApplicationPage));
  };
  const findNodes = predicate => {
    const nodes = [];
    const walk = node => {
      if (!React.isValidElement(node)) return;
      if (predicate(node)) nodes.push(node);
      React.Children.forEach(node.props.children, walk);
    };
    walk(ApplicationPage({}));
    return nodes;
  };
  const getCards = () => findNodes(node => node.props.className === 'applicationCard');
  const initial = render();
  assert.equal(getCards().length, 1);
  assert.ok(initial.includes('2468'));
  assert.ok(initial.includes(lang.carbonAgent.labelApplication.feeHint));
  assert.equal(buttons.at(-1).children, lang.carbonAgent.labelApplication.pay);
  assert.equal(buttons.at(-1).onClick, prepareSubmit);
  state = { ...state, applicationId: '71', rejected: true, status: constants.ApplyForAccountStatus.NOT_PASS };
  const rejected = render();
  assert.ok(!rejected.includes('role="alert"'));
  assert.ok(!rejected.includes('2468'));
  assert.ok(!rejected.includes(lang.carbonAgent.labelApplication.free));
  assert.ok(!rejected.includes(lang.carbonAgent.labelApplication.freeHint));
  assert.ok(!rejected.includes(lang.carbonAgent.labelApplication.feeHint));
  assert.ok(rejected.includes('footer resubmitFooter'));
  assert.ok(rejected.includes('Keep the complete review feedback'));
  assert.equal(renderedRecords.at(-1).auditRecords, auditRecords);
  assert.equal(buttons.at(-1).children, '获取最新模型结果并提交');
  assert.equal(buttons.at(-1).onClick, prepareSubmit);
  assert.equal(requests.length, 0);
  buttons.at(-1).onClick();
  assert.deepEqual(requests, ['prepareSubmit']);
  state = { ...state, editable: false, canSubmit: false, submitting: true };
  render();
  assert.equal(buttons.at(-1).disabled, true);
  assert.equal(buttons.at(-1).loading, true);
  const rejectedCards = getCards();
  assert.equal(rejectedCards.length, 2);
  const formCard = renderToStaticMarkup(rejectedCards[0]);
  const recordsCard = renderToStaticMarkup(rejectedCards[1]);
  assert.ok(formCard.includes('Application form'));
  assert.ok(!formCard.includes('Keep the complete review feedback'));
  assert.ok(!formCard.includes('<footer'));
  assert.ok(!recordsCard.includes('Application form'));
  assert.ok(recordsCard.includes('Keep the complete review feedback'));
  assert.ok(recordsCard.includes(lang.carbonAgent.labelApplication.recordHint));
  assert.ok(!recordsCard.includes('<footer'));
  const [rejectedColumn] = findNodes(node => node.props.className === 'applicationColumn rejectedColumn');
  const [scrollArea, footer] = React.Children.toArray(rejectedColumn.props.children);
  assert.equal(scrollArea.props.className, 'applicationCards');
  assert.equal(footer.type, 'footer', 'Keep the resubmit button outside the scrolling cards');
  assert.ok(!renderToStaticMarkup(scrollArea).includes('<footer'));
  assert.ok(renderToStaticMarkup(footer).includes('获取最新模型结果并提交'));
  assert.equal(renderedRecords.at(-1).info, source);
  assert.equal(renderedRecords.at(-1).showHeading, false);
  for (const status of [constants.ApplyForAccountStatus.REVIEWED_ING, constants.ApplyForAccountStatus.PASS]) {
    state = { ...state, status, rejected: false, approved: status === constants.ApplyForAccountStatus.PASS };
    assert.equal(getCards().length, 1);
    const readonly = render();
    assert.ok(!readonly.includes('Application form'));
    assert.ok(!readonly.includes('<footer'));
      assert.ok(readonly.includes('Keep the complete review feedback'));
  }

  state = {
    ...state,
    applicationId: undefined,
    auditRecords: [],
    approved: false,
    canSubmit: false,
    editable: true,
    info: undefined,
    loading: false,
    pointCost: undefined,
    preview: undefined,
    rejected: false,
    status: undefined,
    submitting: false,
  };
  const failedPrepare = render();
  assert.ok(!failedPrepare.includes('role="alert"'));
  assert.ok(failedPrepare.includes('Application form'));
  assert.equal(renderedForms.at(-1).disabled, false);
  assert.equal(buttons.at(-1).disabled, true);
  const [unknownStatus] = findNodes(node => node.props.className === 'statusTag');
  assert.equal(unknownStatus.props.children, '-');

  state = {
    ...state,
    applicationId: '71',
    auditRecords,
    editable: false,
  };
  const recordsOnly = render();
  assert.ok(!recordsOnly.includes('Application form'));
  assert.ok(recordsOnly.includes('Keep the complete review feedback'));
  assert.equal(renderedRecords.at(-1).info, undefined);
  assert.equal(renderedRecords.at(-1).auditRecords, auditRecords);
});

test('Agent shows static examples until approval and preserves original final deliverables', () => {
  const labels = [];
  const previews = [];
  const { ApplicationPreview } = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/components/ApplicationPreview.tsx',
    {
      '@src/lang/I18N': lang,
      '../assets/label-example.png': 'label-example.png',
      '../assets/qr-example.png': 'qr-example.png',
      '@src/views/carbonFootprint3/CarbonLabel/component/CarbonLabelModal': {
        CarbonLabelModal: props => {
          labels.push(props);
          return null;
        },
      },
      '@src/views/carbonFootprint3/CarbonLabel/component/PreviewH5': {
        PreviewH5: props => {
          previews.push(props);
          return props.labelPreview || null;
        },
      },
      '../index.module.less': {},
    },
  );
  // Data and even an application number are not evidence of approval.
  for (const preview of [
    undefined,
    source,
    { ...source, accountObj: { ...source.accountObj, perEmission: '0' } },
    { ...source, accountObj: { ...source.accountObj, perEmission: '' } },
  ]) {
    for (const canDownload of [false, true]) {
      labels.length = 0;
      previews.length = 0;
      const markup = renderToStaticMarkup(
        React.createElement(ApplicationPreview, {
          preview,
          approved: false,
          canDownload,
        }),
      );
      assert.equal(labels.length, 0, 'Never generate a real label or QR');
      assert.equal(previews.length, 1);
      assert.equal(previews[0].info, preview, 'Keep H5 data and form linkage');
      assert.equal(previews[0].variant, 'agent');
      assert.equal(
        previews[0].labelPreview,
        undefined,
        'Use the old pending stamp',
      );
      assert.ok(markup.includes('src="label-example.png"'));
      assert.ok(markup.includes('src="qr-example.png"'));
      assert.equal(
        markup.split(lang.carbonAgent.labelApplication.sampleImage).length - 1,
        2,
      );
      assert.ok(
        markup.includes(
          lang.carbonAgent.labelApplication.downloadAfterApproval,
        ),
      );
      assert.ok(!markup.includes('<button'));
      assert.ok(!markup.includes('<canvas'));
    }
  }
  for (const canDownload of [false, true]) {
    labels.length = 0;
    previews.length = 0;
    const markup = renderToStaticMarkup(
      React.createElement(ApplicationPreview, {
        preview: source,
        approved: true,
        canDownload,
      }),
    );
    assert.equal(previews.length, 1);
    assert.equal(previews[0].info, source);
    assert.equal(previews[0].variant, 'agent');
    assert.equal(labels.length, 2);
    assert.equal(labels[0].info, source);
    assert.equal(labels[0].embedded, true);
    assert.equal(labels[0].hiddenBtn, !canDownload);
    assert.equal(labels[1].stampOnly, true);
    assert.equal(labels[1].info, source);
    assert.equal(
      markup.includes(lang.carbonAgent.labelApplication.downloadAfterApproval),
      false,
    );
    assert.ok(!markup.includes('label-example.png'));
    assert.ok(!markup.includes('qr-example.png'));
    assert.ok(!markup.includes(lang.carbonAgent.labelApplication.sampleImage));
  }
});

test('only non-shared editable desktop Agent can display labels', () => {
  assert.equal(access.canDisplayCarbonLabel(false, undefined, 768), true);
  assert.equal(access.canDisplayCarbonLabel(false, undefined, 767), false);
  assert.equal(access.canDisplayCarbonLabel(false, 'share', 1440), false);
  assert.equal(access.canDisplayCarbonLabel(true, undefined, 1440), false);
  assert.notEqual(
    access.getCarbonLabelTabKey({ carbonLabelKey: 'new-1' }),
    access.getCarbonLabelTabKey({ carbonLabelKey: 'new-2' }),
  );
  assert.equal(
    access.getCarbonLabelTabKey({
      carbonLabelKey: 'new-1',
      carbonLabelApplicationId: '71',
    }),
    'carbonLabel:new-1',
  );
});

function loadApplicationList(getAgentCarbonLabelList) {
  return load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/applicationList.ts',
    {
      '@src/lang/I18N': lang,
      './service': { getAgentCarbonLabelList },
    },
  );
}

function loadApplicationTabs() {
  return load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/applicationTabs.ts',
    {
      '@src/views/carbonFootprint3/CarbonLabel/constant': constants,
    },
  );
}

test('Agent applications use accountId only and return all records in backend order without pagination', async () => {
  const calls = [];
  const rows = Array.from({ length: 125 }, (_, index) => ({
    ...source,
    id: 1000 - index,
  }));
  const controller = new AbortController();
  const list = loadApplicationList(async (params, signal) => {
    calls.push({ params, signal });
    return {
      data: {
        data: rows,
      },
    };
  });
  const result = await list.loadCarbonLabelApplications('34', controller.signal);
  assert.equal(result, rows);
  assert.deepEqual(calls.map(call => call.params), [
    { accountId: '34' },
  ]);
  assert.ok(calls.every(call => call.signal === controller.signal));
});

test('application listing rejects wrong accounting scope, invalid arrays and request errors', async () => {
  const cases = [
    [{ ...source, accountId: 99 }],
    [{ ...source, id: undefined }],
    [null],
    null,
    { rows: [source] },
  ];
  for (const page of cases) {
    const list = loadApplicationList(async () => ({ data: { data: page } }));
    await assert.rejects(list.loadCarbonLabelApplications('34'));
  }
  const error = new Error('request failed');
  const failing = loadApplicationList(async () => { throw error; });
  await assert.rejects(failing.loadCarbonLabelApplications('34'), error);
  const empty = loadApplicationList(async () => ({
    data: { data: [] },
  }));
  assert.deepEqual(await empty.loadCarbonLabelApplications('34'), []);
});

test('application listing makes no request without an account or after cancellation', async () => {
  let calls = 0;
  const controller = new AbortController();
  const list = loadApplicationList(async () => {
    calls += 1;
    controller.abort();
    return { data: { data: [source] } };
  });
  assert.deepEqual(await list.loadCarbonLabelApplications(''), []);
  assert.equal(calls, 0);
  await assert.rejects(
    list.loadCarbonLabelApplications('34', controller.signal),
    { name: 'AbortError' },
  );
  assert.equal(calls, 1);
  await assert.rejects(
    list.loadCarbonLabelApplications('34', controller.signal),
    { name: 'AbortError' },
  );
  assert.equal(calls, 1);
});

test('application tab sources exclude other businesses and deduplicate accounting IDs', () => {
  const tabs = loadApplicationTabs();
  assert.equal(tabs.getCarbonLabelAccountIdsKey([
    { type: 'account', accountId: '34' },
    { type: 'report', accountId: '34' },
    { type: 'certification', accountId: '35' },
    { type: 'expertReview', accountId: '35' },
    { type: 'carbonLabel', accountId: '34' },
    { type: 'enterpriseCarbonAccounting', accountId: '2026' },
    { type: 'cbamReport', accountId: '99' },
    { type: 'workspace', accountId: '88' },
    { type: 'account' },
  ]), '34|35');
});

test('existing application tabs preserve draft identity, server status and per-application isolation', () => {
  const tabs = loadApplicationTabs();
  const model = { type: 'account', accountId: '34' };
  const draft = { type: 'carbonLabel', accountId: '34', carbonLabelKey: 'new-2' };
  const submitted = {
    type: 'carbonLabel', accountId: '34', carbonLabelKey: 'new-1',
    carbonLabelApplicationId: '71',
  };
  const records = [
    { ...source, status: 1 },
    { ...source, id: 72, status: 2 },
    { ...source, id: 73, accountId: 35, status: 3 },
    { ...source, id: 72, status: 2 },
  ];
  const merged = tabs.mergeCarbonLabelApplicationTargets([model, submitted, draft], records);
  assert.equal(merged.length, 5);
  assert.equal(merged[0], model);
  assert.equal(merged[2], draft);
  assert.equal(merged[1].carbonLabelKey, 'new-1');
  assert.equal(merged[1].carbonLabelStatus, 1);
  assert.equal(merged[1].carbonLabelApplyNum, 'apply-71');
  assert.deepEqual(merged.filter(row => row.carbonLabelApplicationId).map(row => row.carbonLabelApplicationId), ['71', '72', '73']);
  assert.equal(merged[3].carbonLabelKey, 'application:34:72');
  assert.equal(merged[4].accountId, '35');
  assert.equal(new Set(merged.slice(1).map(access.getCarbonLabelTabKey)).size, 4);
});

test('new carbon label tabs display the pending-submission status in grouped navigation', () => {
  const pane = fs.readFileSync(
    path.join(
      root,
      'src/views/system/carbonAgent/components/PreviewPane.tsx',
    ),
    'utf8',
  );
  assert.match(
    pane,
    /target\.carbonLabelStatus\s*\?\?\s*ApplyForAccountStatus\.TO_BE_SUB/,
  );
});

test('prepare is the sole label entry decision and forceNew is used only after approval', async () => {
  const calls = [];
  const loadEntry = responses => load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/entry.ts',
    {
      '@src/views/carbonFootprint3/CarbonLabel/constant': constants,
      './data': {
        prepareApplicationSource: async (...args) => {
          calls.push(args);
          return responses.shift();
        },
      },
    },
  );

  for (const status of [
    constants.ApplyForAccountStatus.TO_BE_SUB,
    constants.ApplyForAccountStatus.TO_BE_REVIEWED,
    constants.ApplyForAccountStatus.NOT_PASS,
    constants.ApplyForAccountStatus.REVIEWED_ING,
    constants.ApplyForAccountStatus.REVIEWED_ERR,
  ]) {
    calls.length = 0;
    const ongoing = { ...source, id: 71, status };
    const entry = loadEntry([ongoing]);
    assert.deepEqual(await entry.resolveCarbonLabelEntry('34', '12'), {
      application: ongoing,
      forceNew: false,
      kind: 'existing',
    });
    assert.deepEqual(calls, [['34', '12', false]]);
  }

  calls.length = 0;
  const approved = { ...source, id: 70, status: constants.ApplyForAccountStatus.PASS, applyNum: 'approved' };
  const fresh = {
    ...source,
    id: 81,
    status: constants.ApplyForAccountStatus.PASS,
    applyNum: 'must-be-cleared',
    projectId: 9,
    sessionId: 'old-session',
    messageId: 'old-message',
  };
  const approvedEntry = loadEntry([approved, fresh]);
  const approvedResolution = await approvedEntry.resolveCarbonLabelEntry('34', '12');
  assert.equal(approvedResolution.kind, 'new');
  assert.equal(approvedResolution.forceNew, true);
  assert.equal(approvedResolution.application.productId, source.productId);
  for (const key of ['id', 'status', 'applyNum', 'version', 'projectId', 'sessionId', 'messageId'])
    assert.equal(approvedResolution.application[key], undefined, key);
  assert.deepEqual(calls, [['34', '12', false], ['34', '12', true]]);

  calls.length = 0;
  const empty = { ...source, id: undefined, status: undefined, applyNum: undefined };
  const emptyEntry = loadEntry([empty]);
  const emptyResolution = await emptyEntry.resolveCarbonLabelEntry('34', '12');
  assert.equal(emptyResolution.kind, 'new');
  assert.equal(emptyResolution.forceNew, false);
  assert.deepEqual(calls, [['34', '12', false]]);
});

test('successful label submissions retain the exact tab through parent updates and list refreshes', () => {
  const parse = file => ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const parentSource = parse('src/views/system/carbonAgent/index.tsx');
  const paneSource = parse('src/views/system/carbonAgent/components/PreviewPane.tsx');
  const find = (sourceFile, predicate) => {
    let result;
    const visit = node => {
      if (result) return;
      if (predicate(node)) result = node;
      else ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    assert.ok(result, 'Expected production callback or effect to exist');
    return result;
  };
  const evaluate = (sourceFile, node, context) => vm.runInNewContext(
    ts.transpileModule(`(${node.getText(sourceFile)})`, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    }).outputText,
    context,
  );
  const submittedHandler = find(parentSource, node => ts.isVariableDeclaration(node) && node.name.getText(parentSource) === 'handlePreviewCarbonLabelSubmitted').initializer;
  const openHandler = find(parentSource, node => ts.isVariableDeclaration(node) && node.name.getText(parentSource) === 'handlePreviewCarbonLabelOpen').initializer;
  const applyPreview = find(paneSource, node => ts.isJsxSelfClosingElement(node) && node.tagName.getText(paneSource) === 'CarbonLabelApplyPreview');
  const messageIdProp = applyPreview.attributes.properties.find(node => ts.isJsxAttribute(node) && node.name.text === 'messageId').initializer.expression;
  const forceNewProp = applyPreview.attributes.properties.find(node => ts.isJsxAttribute(node) && node.name.text === 'forceNew').initializer.expression;
  const preparedProp = applyPreview.attributes.properties.find(node => ts.isJsxAttribute(node) && node.name.text === 'preparedApplication').initializer.expression;
  const submittedProp = applyPreview.attributes.properties.find(node => ts.isJsxAttribute(node) && node.name.text === 'onSubmitted').initializer.expression;
  const resetEffect = find(paneSource, node => ts.isCallExpression(node) && node.expression.getText(paneSource) === 'useEffect' && node.arguments[0].getText(paneSource).includes('setActiveTab(currentTab =>')).arguments[0];
  const requestEffect = find(paneSource, node => ts.isCallExpression(node) && node.expression.getText(paneSource) === 'useEffect' && node.arguments[0].getText(paneSource).includes('const resolvedActiveTabKey =')).arguments[0];
  const tabs = loadApplicationTabs();

  assert.match(openHandler.getText(parentSource), /messageId:\s*source\.messageId/);
  assert.match(openHandler.getText(parentSource), /resolveCarbonLabelEntry/);
  assert.match(
    openHandler.getText(parentSource),
    /focusedPreviewCarbonLabelAccountIdRef\.current\s*=\s*targetAccountId/,
  );
  assert.match(
    openHandler.getText(parentSource),
    /focusedPreviewCarbonLabelAccountIdRef\.current\s*===\s*targetAccountId/,
  );
  assert.equal(messageIdProp.getText(paneSource), 'tab.messageId');
  assert.equal(forceNewProp.getText(paneSource), 'tab.carbonLabelForceNew');
  assert.equal(preparedProp.getText(paneSource), 'tab.carbonLabelPreparedApplication');
  assert.match(openHandler.getText(parentSource), /carbonLabelForceNew:\s*resolution\.forceNew/);
  assert.match(submittedHandler.getText(parentSource), /carbonLabelForceNew:\s*undefined/);
  assert.doesNotMatch(paneSource.text, /getOngoingCarbonLabelTarget/);
  assert.match(paneSource.text, /onCarbonLabelOpen\?\.\(activeCarbonLabelSourceTarget\)/);

  for (const scenario of ['first-submit', 'resubmit-opened', 'resubmit-history']) {
    const model = { type: 'account', accountId: '34' };
    const otherDraft = { type: 'carbonLabel', accountId: '34', carbonLabelKey: 'other-draft' };
    const application = {
      type: 'carbonLabel', accountId: '34',
      carbonLabelKey: scenario === 'resubmit-history' ? 'application:34:71' : 'opened-draft',
      carbonLabelApplicationId: scenario === 'first-submit' ? undefined : '71',
      carbonLabelForceNew: scenario === 'first-submit',
    };
    const applicationKey = access.getCarbonLabelTabKey(application);
    let targets = scenario === 'resubmit-history' ? [model, otherDraft] : [model, application, otherDraft];
    let tabTargets = { account: model, carbonLabel: otherDraft };
    let focusedTarget = scenario === 'first-submit' ? application : model;
    let request = { key: 'account', token: 7 };
    let refreshes = 0;
    const serverRecords = [{ ...source, status: 2 }, { ...source, id: 72, status: 1 }];
    let currentRecords = scenario === 'first-submit' ? [] : serverRecords;
    const onSubmitted = evaluate(parentSource, submittedHandler, {
      getCarbonLabelTabKey: access.getCarbonLabelTabKey,
      setPreviewTargets: update => { targets = update(targets); },
      setPreviewTabTargets: update => { tabTargets = update(tabTargets); },
      setPreviewTarget: update => { focusedTarget = update(focusedTarget); },
      requestPreviewActiveTab: key => { request = { key, token: request.token + 1 }; },
    });
    const submitFromPane = evaluate(paneSource, submittedProp, {
      tab: { ...application, key: applicationKey },
      onCarbonLabelSubmitted: onSubmitted,
      updateApplication: submittedApplication => {
        currentRecords = currentRecords.map(record =>
          String(record.accountId) === submittedApplication.accountId &&
          String(record.id) === submittedApplication.id
            ? {
                ...record,
                applyNum: submittedApplication.applyNum ?? record.applyNum,
                status: submittedApplication.status ?? record.status,
              }
            : record,
        );
      },
      refreshApplications: () => { refreshes += 1; },
    });
    submitFromPane({ accountId: '34', id: '71', applyNum: 'T-71', status: 4 });
    assert.equal(request.key, applicationKey, scenario);
    assert.equal(request.token, 8);
    assert.equal(refreshes, 1);
    assert.equal(tabTargets.carbonLabel, otherDraft, 'Do not modify another application');
    assert.equal(targets[0], model);
    const submittedTarget = targets.find(target => target.carbonLabelKey === application.carbonLabelKey);
    if (scenario !== 'resubmit-history') {
      assert.equal(submittedTarget?.carbonLabelForceNew, undefined);
      assert.equal(submittedTarget?.carbonLabelApplicationId, '71');
      assert.equal(submittedTarget?.carbonLabelApplyNum, 'T-71');
      assert.equal(submittedTarget?.carbonLabelStatus, 4);
    }
    let activeTab = applicationKey;
    const appliedActiveTabRequestIdentityRef = { current: undefined };
    // Run the real PreviewPane effects before and after refreshed application metadata arrives.
    for (const [index, rows] of [currentRecords, serverRecords].entries()) {
      const merged = tabs.mergeCarbonLabelApplicationTargets(targets, rows);
      if (index === 0) {
        const immediateTarget = merged.find(
          target => access.getCarbonLabelTabKey(target) === applicationKey,
        );
        assert.equal(immediateTarget?.carbonLabelStatus, 4, scenario);
        assert.equal(immediateTarget?.carbonLabelApplyNum, 'T-71', scenario);
      }
      const availableKeys = ['account', ...merged.filter(target => target.type === 'carbonLabel').map(access.getCarbonLabelTabKey)];
      const effectContext = {
        agentSessionId: 'session',
        defaultTab: 'account',
        activeTabKey: request.key,
        activeTabAccountId: '34',
        activeTabEnterpriseCarbonBizId: undefined,
        activeTabReportId: undefined,
        activeTabReportUrl: undefined,
        activeTabTrigger: request.token,
        activeTabYear: undefined,
        activeTargetIsEnterpriseCarbonCertification: false,
        appliedActiveTabRequestIdentityRef,
        enterpriseCarbonCertificationDraftTabKey: undefined,
        focusedProductCarbonCertificateAccountIdRef: { current: undefined },
        getResolvablePreviewTab: key => availableKeys.includes(key) ? key : undefined,
        pendingProductCarbonCertificateTabKeyRef: { current: undefined },
        previewTabs: availableKeys.map(key => ({ key })),
        sessionId: 'session',
        setActiveTab: key => {
          activeTab = typeof key === 'function' ? key(activeTab) : key;
        },
      };
      evaluate(paneSource, resetEffect, effectContext)();
      evaluate(paneSource, requestEffect, effectContext)();
      assert.equal(activeTab, applicationKey, `${scenario}: refresh must not select the model`);
      assert.equal(availableKeys.filter(key => key === applicationKey).length, 1);
    }
  }
});

// Minimal hook lifecycle harness: run effects/cleanup and rerender state without live APIs.
function applicationListHookHarness(fetchList) {
  const state = [];
  const effects = [];
  const errors = [];
  let stateIndex;
  let effectIndex;
  let pendingEffects;
  const hook = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/useCarbonLabelApplications.ts',
    {
      '@src/lang/I18N': lang,
      './applicationList': { loadCarbonLabelApplications: fetchList },
      antd: { message: { error: value => errors.push(value) } },
      react: {
        useState: initial => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = initial;
          return [state[index], value => {
            state[index] = typeof value === 'function' ? value(state[index]) : value;
          }];
        },
        useMemo: fn => fn(),
        useEffect: (fn, deps) => {
          const index = effectIndex++;
          const previous = effects[index];
          if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
          pendingEffects.push(() => {
            previous?.cleanup?.();
            effects[index] = { deps, cleanup: fn() };
          });
        },
      },
    },
  );
  return {
    errors,
    render: props => {
      stateIndex = 0;
      effectIndex = 0;
      pendingEffects = [];
      const value = hook.useCarbonLabelApplications(props);
      pendingEffects.forEach(run => run());
      return value;
    },
    unmount: () => effects.forEach(effect => effect.cleanup?.()),
  };
}
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

function hookHarness() {
  const cells = [];
  let cursor = 0;
  let pendingEffects = [];
  const changed = (previous, deps) => !previous || deps.some((value, i) => !Object.is(value, previous.deps[i]));
  const hooks = {
    useState: initial => {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial;
      return [cells[index], value => {
        cells[index] = typeof value === 'function' ? value(cells[index]) : value;
      }];
    },
    useRef: initial => {
      const index = cursor++;
      if (!(index in cells)) cells[index] = { current: initial };
      return cells[index];
    },
    useMemo: (create, deps) => {
      const index = cursor++;
      if (changed(cells[index], deps)) cells[index] = { deps, value: create() };
      return cells[index].value;
    },
    useEffect: (effect, deps) => {
      const index = cursor++;
      const previous = cells[index];
      if (changed(previous, deps)) pendingEffects.push(() => {
        previous?.cleanup?.();
        cells[index] = { deps, cleanup: effect() };
      });
    },
  };
  return {
    hooks,
    render: callback => {
      cursor = 0;
      pendingEffects = [];
      const result = callback();
      pendingEffects.forEach(run => run());
      return result;
    },
    unmount: () => cells.forEach(cell => cell?.cleanup?.()),
  };
}

function labelSubmissionHarness(existing = false, options = {}) {
  const runtime = hookHarness();
  const requests = [];
  const submitted = [];
  const notifications = [];
  const detailRequests = [];
  const auditRequests = [];
  const sourceRequests = [];
  const permissions = [];
  const pointCostRequests = [];
  const initialInfo = {
    ...source,
    id: existing ? source.id : undefined,
    applyNum: existing ? source.applyNum : undefined,
    status: existing ? constants.ApplyForAccountStatus.NOT_PASS : undefined,
    ...options.preparedInfo,
  };
  let detailInfo = initialInfo;
  let preparedRecords = options.records || [];
  const request = method => (payload, forceNew) => new Promise((resolve, reject) => {
    requests.push({ method, payload, forceNew, resolve, reject });
  });
  const { useLabelApplication } = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/useLabelApplication.ts',
    {
      '@src/lang/I18N': lang,
      '@src/components/Permission/utils': { checkPermissions: (_, permission) => {
        permissions.push(permission);
        return options.checkPermission?.(permission) ?? true;
      } },
      '@src/views/carbonFootprint3/CarbonLabel/constant': constants,
      './service': { postAgentCarbonLabelSubmit: request('agentSubmit') },
      './data': {
        ...data,
        loadApplicationPointCost: async accountId => {
          pointCostRequests.push(accountId);
          return options.loadPointCost ? options.loadPointCost() : 2468;
        },
        prepareApplicationSource: async (...args) => {
          sourceRequests.push(args);
          const prepared = options.prepareSource
            ? await options.prepareSource(...args)
            : initialInfo;
          if (prepared?.records) preparedRecords = prepared.records;
          return prepared?.info || prepared;
        },
        loadApplicationInfo: async id => {
          detailRequests.push(id);
          const detail = options.loadDetail
            ? await options.loadDetail(id)
            : detailInfo;
          return detail?.info || detail;
        },
        loadApplicationAuditRecords: async applyNum => {
          auditRequests.push(applyNum);
          if (options.loadAuditRecords)
            return options.loadAuditRecords(applyNum);
          return options.submittedRecords || preparedRecords;
        },
      },
      antd: { message: new Proxy({}, { get: (_, method) => text => notifications.push({ method, text }) }) },
      react: runtime.hooks,
    },
  );
  const render = (props = {}) => runtime.render(() => useLabelApplication({ accountId: '34', productId: '12', applicationId: existing ? '71' : undefined, forceNew: options.forceNew, onSubmitted: application => submitted.push(application), ...props }));
  return { render, requests, submitted, notifications, detailRequests, auditRequests, sourceRequests, permissions, pointCostRequests, unmount: runtime.unmount, setDetail: info => { detailInfo = info; } };
}

async function startLabelSubmission(harness, props = {}) {
  const state = harness.render(props);
  if (state.rejected) {
    const result = state.prepareSubmit();
    await flushPromises();
    return { result };
  }
  await state.prepareSubmit();
  return { result: harness.render(props).confirmSubmit() };
}

test('prepare can return any existing application state without losing its ID, form values or timeline or refetching old detail', async () => {
  for (const status of [0, 1, 2, 3]) {
    const records = [{ id: 8, actType: 0 }, { id: 3, actType: 3 }];
    const preparedInfo = {
      id: 1164, status, applyNum: 'T202608310115', version: 2,
      brand: '水杯水杯', specsShow: 0, periodShow: 0, contrastShow: 0,
      pointCost: 1299, pointPaid: 1, sourceType: 'AGENT_PAID',
    };
    const harness = labelSubmissionHarness(false, { preparedInfo, records });
    harness.render();
    await flushPromises();
    const state = harness.render();
    assert.equal(state.applicationId, '1164');
    assert.equal(state.status, status);
    assert.equal(state.approved, status === 2);
    assert.equal(state.rejected, status === 3);
    assert.equal(state.editable, status === 0 || status === 3);
    assert.equal(state.info.pointPaid, 1);
    assert.equal(state.preview.version, 2);
    assert.equal(state.form.values.brand, '水杯水杯');
    assert.equal(state.form.values.specsShow, 0);
    assert.equal(state.form.values.periodShow, 0);
    assert.equal(state.form.values.contrastShow, 0);
    assert.equal(state.auditRecords, records);
    assert.deepEqual(
      harness.pointCostRequests,
      status === 0 ? ['34'] : [],
    );
    assert.equal(harness.permissions.at(-1), 'footprint3:label:edit');
    harness.render();
    await flushPromises();
    assert.deepEqual(harness.sourceRequests, [['34', '12']]);
    assert.deepEqual(harness.detailRequests, []);
    assert.deepEqual(harness.submitted, []);
    assert.deepEqual(harness.requests, []);
    harness.unmount();
  }
});

test('entry-prepared new application data initializes the page without repeating prepare', async () => {
  const preparedApplication = {
    ...source,
    id: undefined,
    status: undefined,
    applyNum: undefined,
    brand: 'Fresh brand',
  };
  const harness = labelSubmissionHarness(false);
  harness.render({ preparedApplication });
  await flushPromises();
  const state = harness.render({ preparedApplication });
  assert.equal(state.info, preparedApplication);
  assert.equal(state.form.values.brand, 'Fresh brand');
  assert.deepEqual(harness.sourceRequests, []);
  assert.deepEqual(harness.detailRequests, []);
  harness.unmount();
});

test('application detail and audit records render independently when either request fails', async () => {
  const detailOnly = labelSubmissionHarness(true, {
    loadAuditRecords: async () => {
      throw new Error('audit unavailable');
    },
  });
  const existingProps = { applicationApplyNum: source.applyNum };
  detailOnly.render(existingProps);
  await flushPromises();
  let state = detailOnly.render(existingProps);
  assert.equal(state.info.id, source.id);
  assert.equal(state.form.values.brand, source.brand);
  assert.deepEqual(state.auditRecords, []);
  assert.equal(state.loading, false);
  assert.deepEqual(detailOnly.detailRequests, ['71']);
  assert.deepEqual(detailOnly.auditRequests, [source.applyNum]);
  detailOnly.unmount();

  const records = [{ id: 8, actType: 0, applyNum: source.applyNum }];
  const recordsOnly = labelSubmissionHarness(true, {
    loadDetail: async () => {
      throw new Error('detail unavailable');
    },
    loadAuditRecords: async () => records,
  });
  recordsOnly.render(existingProps);
  await flushPromises();
  state = recordsOnly.render(existingProps);
  assert.equal(state.info, undefined);
  assert.deepEqual(state.auditRecords, records);
  assert.equal(state.loading, false);
  assert.equal(state.canSubmit, false);
  assert.deepEqual(recordsOnly.detailRequests, ['71']);
  assert.deepEqual(recordsOnly.auditRequests, [source.applyNum]);
  recordsOnly.unmount();
});

test('a new application after approval preserves forceNew through submit', async () => {
  const harness = labelSubmissionHarness(false, { forceNew: true });
  harness.render();
  await flushPromises();
  const { result } = await startLabelSubmission(harness);
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.requests[0].forceNew, true);
  harness.requests[0].resolve({
    data: {
      code: 200,
      data: {
        ...source,
        id: 72,
        applyNum: 'apply-72',
        status: constants.ApplyForAccountStatus.REVIEWED_ING,
      },
    },
  });
  await result;
  harness.render();
  await flushPromises();
  const state = harness.render();
  assert.equal(state.status, constants.ApplyForAccountStatus.REVIEWED_ING);
  assert.deepEqual(harness.detailRequests, []);
  assert.deepEqual(harness.auditRequests, ['apply-72']);
  assert.deepEqual(harness.submitted, [{
    accountId: '34',
    id: '72',
    applyNum: 'apply-72',
    status: constants.ApplyForAccountStatus.REVIEWED_ING,
  }]);
  harness.unmount();
});

test('resubmitting a rejected prepared application uses its existing ID and the complete submit response', async () => {
  const preparedInfo = { id: 1164, status: 3, applyNum: 'T202608310115' };
  const harness = labelSubmissionHarness(false, {
    preparedInfo,
    checkPermission: permission => permission === 'footprint3:label:edit',
  });
  harness.render();
  await flushPromises();
  let state = harness.render();
  state.form.setValuesIn('brand', 'Edited');
  const { result } = await startLabelSubmission(harness);
  assert.equal(harness.render().confirmOpen, false);
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.requests[0].method, 'agentSubmit');
  assert.equal(harness.requests[0].forceNew, false);
  assert.equal(Object.hasOwn(harness.requests[0].payload, 'id'), false);
  assert.equal(Object.hasOwn(harness.requests[0].payload, 'applyNum'), false);
  assert.equal(harness.requests[0].payload.brand, 'Edited');
  harness.requests[0].resolve({
    data: {
      code: 200,
      data: {
        ...source,
        ...preparedInfo,
        brand: 'Edited',
        status: constants.ApplyForAccountStatus.REVIEWED_ING,
      },
    },
  });
  await result;
  harness.render();
  await flushPromises();
  state = harness.render();
  assert.equal(state.applicationId, '1164');
  assert.equal(state.status, constants.ApplyForAccountStatus.REVIEWED_ING);
  assert.equal(state.form.values.brand, 'Edited');
  assert.deepEqual(harness.detailRequests, []);
  assert.deepEqual(harness.auditRequests, [
    'T202608310115',
    'T202608310115',
  ]);
  assert.deepEqual(harness.submitted, [{
    accountId: '34',
    id: '1164',
    applyNum: 'T202608310115',
    status: constants.ApplyForAccountStatus.REVIEWED_ING,
  }]);
  assert.equal(harness.sourceRequests.length, 1);
  harness.unmount();
});

test('late prepare responses cannot overwrite another accounting context or a selected application', async () => {
  const pending = [];
  const harness = labelSubmissionHarness(false, {
    prepareSource: accountId => new Promise(resolve => { pending.push({ accountId, resolve }); }),
  });
  harness.render();
  const otherAccount = { accountId: '35', productId: '12' };
  harness.render(otherAccount);
  assert.deepEqual(pending.map(item => item.accountId), ['34', '35']);
  const otherInfo = { ...source, id: 72, accountId: 35, brand: 'Second', status: 2 };
  pending[1].resolve({ info: otherInfo, preview: otherInfo, records: [{ id: 72 }] });
  await flushPromises();
  let state = harness.render(otherAccount);
  assert.equal(state.applicationId, '72');
  pending[0].resolve({ info: source, preview: source, records: [{ id: 71 }] });
  await flushPromises();
  state = harness.render(otherAccount);
  assert.equal(state.applicationId, '72');
  assert.equal(state.form.values.brand, 'Second');
  assert.deepEqual(state.auditRecords, [{ id: 72 }]);
  harness.render();
  const existing = { applicationId: '71' };
  harness.render(existing);
  harness.render(existing);
  await flushPromises();
  pending[2].resolve({ info: otherInfo, preview: otherInfo, records: [{ id: 72 }] });
  await flushPromises();
  state = harness.render(existing);
  assert.equal(state.applicationId, '71');
  assert.equal(state.form.values.brand, 'Brand');
  assert.deepEqual(harness.detailRequests, ['71']);
  harness.unmount();
});

test('switching accounting context clears the previous successful snapshot before loading the next one', async () => {
  const pending = [];
  const harness = labelSubmissionHarness(false, {
    prepareSource: accountId =>
      new Promise((resolve, reject) => {
        pending.push({ accountId, resolve, reject });
      }),
  });
  harness.render();
  pending[0].resolve({ info: source, preview: source, records: [{ id: 71 }] });
  await flushPromises();
  let state = harness.render();
  assert.equal(state.info.accountId, 34);
  assert.equal(state.form.values.brand, 'Brand');

  const nextContext = { accountId: '35', productId: '12' };
  harness.render(nextContext);
  state = harness.render(nextContext);
  assert.equal(state.info, undefined);
  assert.equal(state.form.values.brand, '');
  assert.deepEqual(state.auditRecords, []);
  assert.equal(state.statusHint, '');
  pending[1].reject(new Error('next context unavailable'));
  await flushPromises();
  state = harness.render(nextContext);
  assert.equal(state.info, undefined);
  assert.equal(state.canSubmit, false);
  harness.unmount();
});

test('submit request failures rely on the shared request layer and preserve input, retry and success behavior', async () => {
  for (const existing of [false, true]) {
    const harness = labelSubmissionHarness(existing);
    harness.render();
    await flushPromises();
    let state = harness.render();
    state.form.setValuesIn('brand', 'Edited');
    const values = JSON.stringify(state.form.values);
    const initialDetailCount = harness.detailRequests.length;
    for (const error of [{ data: { code: 500, msg: 'Business error already handled' } }, new Error('Network error')]) {
      const { result } = await startLabelSubmission(harness);
      state = harness.render();
      assert.equal(state.submitting, true);
      const count = harness.requests.length;
      // The pending request lock must still reject repeated clicks.
      if (existing) await state.prepareSubmit();
      else await state.confirmSubmit();
      assert.equal(harness.requests.length, count);
      const currentRequest = harness.requests.at(-1);
      assert.equal(currentRequest.method, 'agentSubmit');
      assert.equal(currentRequest.forceNew, false);
      assert.equal(currentRequest.payload.brand, 'Edited');
      currentRequest.reject(error);
      await result;
      state = harness.render();
      assert.equal(state.submitting, false);
      assert.equal(state.confirmOpen, false);
      assert.equal('receipt' in state, false);
      assert.equal(state.submitError, '');
      assert.equal(state.editable, true);
      assert.equal(JSON.stringify(state.form.values), values);
      assert.deepEqual(harness.notifications, []);
      assert.deepEqual(harness.submitted, []);
      assert.equal(harness.detailRequests.length, initialDetailCount);
      assert.equal('clearUncertainReceipt' in state, false);
    }
    const { result } = await startLabelSubmission(harness);
    harness.requests.at(-1).resolve({
      data: {
        code: 200,
        data: {
          ...source,
          brand: 'Edited',
          status: constants.ApplyForAccountStatus.REVIEWED_ING,
        },
      },
    });
    await result;
    harness.render();
    await flushPromises();
    state = harness.render();
    assert.equal(state.applicationId, '71');
    assert.equal(state.status, constants.ApplyForAccountStatus.REVIEWED_ING);
    assert.equal(state.form.values.brand, 'Edited');
    assert.deepEqual(harness.submitted, [{
      accountId: '34',
      id: '71',
      applyNum: 'apply-71',
      status: constants.ApplyForAccountStatus.REVIEWED_ING,
    }]);
    assert.equal(harness.detailRequests.length, initialDetailCount);
    assert.deepEqual(
      harness.auditRequests,
      existing ? [source.applyNum, source.applyNum] : [source.applyNum],
    );
    assert.deepEqual(harness.notifications.map(item => item.method), ['success']);
  }
});

test('submit response immediately becomes the application snapshot without a detail refresh', async () => {
  const harness = labelSubmissionHarness(false, {
    submittedRecords: [{ id: 99, actType: 0 }],
  });
  const preparedApplication = {
    ...source,
    id: undefined,
    applyNum: undefined,
    status: undefined,
  };
  const preparedProps = { preparedApplication };
  harness.render(preparedProps);
  await flushPromises();
  let state = harness.render(preparedProps);
  state.form.setValuesIn('brand', 'Edited before submit');
  const { result } = await startLabelSubmission(harness, preparedProps);
  harness.requests.at(-1).resolve({
    data: {
      code: 200,
      data: {
        ...source,
        id: 88,
        applyNum: 'apply-88',
        brand: 'Edited before submit',
        status: constants.ApplyForAccountStatus.REVIEWED_ING,
      },
    },
  });
  await result;
  // 父级把新申请 ID 写回页签并清除 prepare 快照时，不得重复请求详情。
  const submittedProps = { applicationId: '88' };
  harness.render(submittedProps);
  await flushPromises();
  state = harness.render(submittedProps);
  assert.equal(state.applicationId, '88');
  assert.equal(state.info.accountId, source.accountId);
  assert.equal(state.form.values.brand, 'Edited before submit');
  assert.equal(state.status, constants.ApplyForAccountStatus.REVIEWED_ING);
  assert.equal('receipt' in state, false);
  assert.equal(state.editable, false);
  assert.deepEqual(state.auditRecords, [{ id: 99, actType: 0 }]);
  assert.deepEqual(harness.detailRequests, []);
  assert.deepEqual(harness.auditRequests, ['apply-88']);
  assert.deepEqual(harness.submitted, [{
    accountId: '34',
    id: '88',
    applyNum: 'apply-88',
    status: constants.ApplyForAccountStatus.REVIEWED_ING,
  }]);
  harness.unmount();
});

test('successful HTTP responses retain legacy source-deletion checks and missing-ID protection', async () => {
  const harness = labelSubmissionHarness();
  harness.render();
  await flushPromises();
  harness.render();
  const first = await startLabelSubmission(harness);
  harness.requests.at(-1).resolve({ data: { code: 200, data: { errorCode: 1 } } });
  await first.result;
  let state = harness.render();
  assert.equal(state.submitError, lang.carbonAgent.labelApplication.sourceDeleted);
  assert.equal('receipt' in state, false);
  const next = await startLabelSubmission(harness);
  harness.requests.at(-1).resolve({ data: { code: 200, data: {} } });
  await next.result;
  state = harness.render();
  assert.equal(state.submitError, lang.carbonAgent.labelApplication.missingId);
  assert.equal('receipt' in state, false);
  assert.equal(state.editable, true);
  assert.deepEqual(harness.submitted, []);
});


test('application history is isolated on mobile/share, session switches and late responses', async () => {
  const requests = [];
  const harness = applicationListHookHarness((accountId, signal) => new Promise(resolve => {
    requests.push({ accountId, signal, resolve });
  }));
  const props = { accountIdsKey: '34', sessionKey: 'session-a', enabled: false, open: true };
  assert.deepEqual(harness.render(props).applications, []);
  assert.equal(requests.length, 0);
  const desktop = { ...props, enabled: true };
  assert.equal(harness.render(desktop).applicationsLoading, true);
  assert.equal(requests.length, 1);
  const otherSession = { ...desktop, sessionKey: 'session-b', accountIdsKey: '35' };
  assert.deepEqual(harness.render(otherSession).applications, []);
  assert.equal(requests[0].signal.aborted, true);
  requests[0].resolve([source]);
  requests[1].resolve([{ ...source, id: 72, accountId: 35 }]);
  await flushPromises();
  const loaded = harness.render(otherSession);
  assert.deepEqual(loaded.applications.map(row => row.accountId), [35]);
  assert.equal(loaded.applicationsLoading, false);
  assert.deepEqual(harness.render({ ...otherSession, enabled: false }).applications, []);
  assert.equal(requests[1].signal.aborted, true);
  assert.equal(requests.length, 2);
  harness.unmount();
});

test('application history refresh preserves mounted records across partial request failures', async () => {
  const requests = [];
  const harness = applicationListHookHarness((accountId, signal) => new Promise((resolve, reject) => {
    requests.push({ accountId, signal, resolve, reject });
  }));
  const props = { accountIdsKey: '34|35', sessionKey: 'session', enabled: true, open: true };
  harness.render(props);
  requests[0].resolve([source]);
  requests[1].resolve([{ ...source, id: 72, accountId: 35 }]);
  await flushPromises();
  const loaded = harness.render(props);
  assert.equal(loaded.applications.length, 2);
  loaded.updateApplication({
    accountId: '34',
    id: '71',
    applyNum: 'submitted-71',
    status: constants.ApplyForAccountStatus.REVIEWED_ING,
  });
  const submitted = harness.render(props).applications[0];
  assert.equal(submitted.applyNum, 'submitted-71');
  assert.equal(submitted.status, constants.ApplyForAccountStatus.REVIEWED_ING);
  assert.equal(harness.render({ ...props, open: false }).applications.length, 2);
  assert.equal(requests.length, 2);
  harness.render(props);
  requests[2].reject(new Error('offline'));
  requests[3].resolve([{ ...source, id: 72, accountId: 35, status: 2 }]);
  await flushPromises();
  const refreshed = harness.render(props);
  assert.equal(refreshed.applications.length, 2);
  assert.equal(
    refreshed.applications[0].status,
    constants.ApplyForAccountStatus.REVIEWED_ING,
  );
  assert.equal(refreshed.applications[1].status, 2);
  assert.equal(harness.errors.length, 0);
  refreshed.refreshApplications();
  assert.equal(harness.render(props).applications.length, 2);
  assert.equal(requests.length, 6);
  harness.unmount();
});

test('prepare failures leave an empty application page without local error state', async () => {
  const harness = labelSubmissionHarness(false, {
    prepareSource: async () => {
      throw new Error('not deployed');
    },
  });
  harness.render();
  await flushPromises();
  const state = harness.render();
  assert.equal(state.loading, false);
  assert.equal(state.info, undefined);
  assert.equal(state.preview.accountId, undefined);
  assert.equal(state.preview.productId, undefined);
  assert.equal(state.preview.productName, '');
  assert.equal(state.editable, true);
  assert.equal(state.canSubmit, false);
  assert.equal(state.statusHint, '');
  assert.equal('loadError' in state, false);
  assert.equal(harness.notifications.length, 0);
});

test('application-only edits preserve source IDs and old first-image/comma-category payload', () => {
  const before = JSON.stringify(source);
  const values = data.toApplicationValues(source);
  Object.assign(values, {
    productName: 'Edited',
    accountName: 'Edited unit',
    perEmission: '9.81',
    productPic: [{ url: 'first' }, { url: 'second' }],
    contrastValuesArr: [1, 3, 5],
  });
  const payload = data.toApplicationPayload(values, source);
  assert.equal(payload.id, 71);
  assert.equal(payload.accountId, 34);
  assert.equal(payload.productId, 12);
  assert.equal(payload.productName, 'Edited');
  assert.equal(payload.accountName, 'Edited unit');
  assert.equal(payload.perEmission, '9.81');
  assert.equal(payload.productPic, 'first');
  assert.equal(payload.contrastValues, '1,3,5');
  assert.equal(payload.labelType, 0);
  assert.equal(JSON.stringify(source), before);
});
test('preview overlays display fields but never recalculates backend results', () => {
  const values = data.toApplicationValues(source);
  values.brand = 'New brand';
  values.perEmission = '10';
  values.specsShow = 0;
  values.contrastShow = 0;
  const preview = data.toApplicationPreview(values, source);
  assert.equal(preview.brand, 'New brand');
  assert.equal(preview.specsShow, 0);
  assert.equal(preview.contrastShow, 0);
  assert.equal(preview.accountObj.perEmission, '10');
  assert.equal(preview.accountObj.equalList, source.accountObj.equalList);
  assert.equal(preview.accountObj.stageList, source.accountObj.stageList);
  assert.equal(source.accountObj.perEmission, '7.05');
});
test('Agent emission fields preserve API units and expose the product unit for read-only display', () => {
  const values = data.toApplicationValues(source);
  assert.equal(values.perEmissionUnit, 'kgCO₂e');
  assert.equal(values.productUnitName, 'item');
  values.perEmission = '9.81';
  values.perEmissionUnit = 't CO₂e/件';
  const payload = data.toApplicationPayload(values, source);
  assert.equal(payload.perEmissionUnit, 't CO₂e/件');
  assert.equal(payload.perEmission, '9.81');
  assert.equal(payload.unitName, 'item');
  const detail = { ...source, ...payload };
  const restored = data.toApplicationValues(detail);
  assert.equal(restored.perEmissionUnit, 'kgCO₂e');
  assert.equal(restored.productUnitName, 'item');
  assert.equal(restored.perEmission, '7.05');
  const preview = data.toApplicationPreview(restored, detail);
  assert.equal(preview.perEmissionUnit, 'kgCO₂e');
  assert.equal(preview.accountObj.unitName, 'kgCO₂e');
  assert.equal(preview.accountObj.perEmission, '7.05');
  assert.equal(preview.accountObj.equalList, source.accountObj.equalList);
  assert.equal(preview.accountObj.stageList, source.accountObj.stageList);
  assert.equal(source.accountObj.perEmission, '7.05');
});
test('all six existing states are handled without treating submission as approval', () => {
  assert.equal(data.CARBON_LABEL_POINTS, undefined);
  assert.equal(data.isApplicationEditable(undefined), true);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 99].map(data.isApplicationEditable), [
    true,
    false,
    false,
    true,
    false,
    true,
    false,
  ]);
  assert.deepEqual(
    [undefined, 0, 1, 2, 3, 4, 5, 99].map(
      data.shouldLoadApplicationPointCost,
    ),
    [true, true, false, false, false, false, true, false],
  );
});

test('Agent category options come from the independent legacy contrast endpoint rather than preview accountObj', async () => {
  const requests = [];
  const module = loadData({
    getCarbonLabelContrastList: async () => {
      requests.push('contrastList');
      return {
        data: {
          data: [
            { code: 0, name: '梭梭树CO₂吸收量' },
            { code: 1, name: '家庭用电量' },
          ],
        },
      };
    },
  });
  assert.deepEqual(await module.loadApplicationCategoryOptions(), [
    { label: '梭梭树CO₂吸收量', value: 0 },
    { label: '家庭用电量', value: 1 },
  ]);
  assert.deepEqual(requests, ['contrastList']);
  const hookSource = fs.readFileSync(
    path.join(
      root,
      'src/views/system/carbonAgent/components/ProductCarbonLabelApply/useLabelApplication.ts',
    ),
    'utf8',
  );
  assert.ok(hookSource.includes('loadApplicationCategoryOptions'));
});
test('Agent category options accept the legacy endpoint live shape and discard invalid options', async () => {
  const module = loadData({
    getCarbonLabelContrastList: async () => ({
      data: {
        data: [
          { label: '梭梭树CO₂吸收量', value: 0 },
          { label: '家庭用电量', value: 1 },
          { label: '无效选项' },
        ],
      },
    }),
  });
  assert.deepEqual(await module.loadApplicationCategoryOptions(), [
    { label: '梭梭树CO₂吸收量', value: 0 },
    { label: '家庭用电量', value: 1 },
  ]);
  const sharedComponentSource = fs.readFileSync(
    path.join(
      root,
      'src/views/carbonFootprint3/CarbonLabel/component/FormilyClassRadios/index.tsx',
    ),
    'utf8',
  );
  assert.match(sharedComponentSource, /item\.value \?\? item\.code/);
  assert.match(sharedComponentSource, /label != null && optionValue != null/);
});
test('Agent prepare uses GET with forceNew false while the old preview API remains legacy-only', async () => {
  const calls = [];
  const mocks = { '@src/api/request': { request: async options => { calls.push(options); } } };
  const service = load('src/views/system/carbonAgent/components/ProductCarbonLabelApply/service.ts', mocks);
  await service.getAgentCarbonLabelPrepare({ accountId: '10062', forceNew: false });
  assert.deepEqual(calls, [{
    method: 'get',
    url: '/footprint3/agent/tag-label/prepare',
    params: { accountId: '10062', forceNew: false },
  }]);
  const legacyService = load('src/views/carbonFootprint3/CarbonLabel/service.ts', mocks);
  await legacyService.getCarbonLabelPrviewInit({ accountId: 34, productId: 12 });
  assert.deepEqual(calls[1], {
    method: 'post', url: 'footprint3/tagLabel/preview',
    data: { accountId: 34, productId: 12 },
  });
});

test('Agent service methods match the new paths and preserve explicit forceNew values', async () => {
  const calls = [];
  const service = load('src/views/system/carbonAgent/components/ProductCarbonLabelApply/service.ts', {
    '@src/api/request': { request: async options => { calls.push(options); } },
  });
  const payload = data.toAgentApplicationPayload(data.toApplicationValues(source), source);
  const signal = new AbortController().signal;
  await service.getAgentCarbonLabelPrepare({ accountId: '34' });
  await service.postAgentCarbonLabelSubmit(payload);
  await service.postAgentCarbonLabelSubmit(payload, true);
  await service.getAgentCarbonLabelList({ accountId: '34' }, signal);
  await service.getAgentCarbonLabelDetail(1164);
  await service.getAgentCarbonLabelDetail('72');
  await service.getAgentCarbonLabelAuditRecords({ applyNum: source.applyNum });
  await service.getAgentCarbonLabelPointCost('34');
  assert.deepEqual(calls, [
    { method: 'get', url: '/footprint3/agent/tag-label/prepare', params: { accountId: '34', forceNew: false } },
    { method: 'post', url: '/footprint3/agent/tag-label/submit', data: payload, params: { forceNew: false } },
    { method: 'post', url: '/footprint3/agent/tag-label/submit', data: payload, params: { forceNew: true } },
    { method: 'get', url: '/footprint3/agent/tag-label/list', params: { accountId: '34' }, signal },
    { method: 'get', url: '/footprint3/agent/tag-label/1164' },
    { method: 'get', url: '/footprint3/agent/tag-label/72' },
    { method: 'get', url: '/footprint3/agent/tag-label/audit-records', params: { applyNum: source.applyNum } },
    { method: 'get', url: '/footprint3/agent/tag-label/point-cost', params: { accountId: '34' } },
  ]);
});

test('Agent request fields match the provided contract, preserve the first image and distinguish product units from emission units', () => {
  const values = data.toApplicationValues(source);
  values.productPic = [{ url: 'first' }, { url: 'second' }];
  values.contrastValuesArr = [0, 1, 2];
  const payload = data.toAgentApplicationPayload(values, { ...source, unitCode: '61' }, {
    projectId: 'project-1', sessionId: 'agent_session', messageId: 'message-1',
  });
  assert.deepEqual(payload, {
    accountId: 34, productId: 12,
    productName: source.productName, accountName: source.accountName,
    brand: source.brand, specsShow: 1, specs: source.specs,
    productPic: 'first', periodShow: 1,
    startTime: source.startTime, endTime: source.endTime,
    contrastShow: 1, contrastValues: '0,1,2',
    unitCode: '61', unitName: 'item',
    projectId: 'project-1', sessionId: 'agent_session', messageId: 'message-1',
  });
  for (const field of ['id', 'applyNum', 'status', 'version', 'pointCost', 'pointPaid', 'labelType', 'perEmission', 'perEmissionUnit']) {
    assert.ok(!Object.hasOwn(payload, field), `${field} is not in the supplied request contract`);
  }
  const savedContext = { ...source, projectId: 1, sessionId: 'saved-session', messageId: 2 };
  assert.equal(data.toAgentApplicationPayload(values, savedContext, { sessionId: 'other-session' }).sessionId, 'saved-session');
});

test('prepare data directly initializes both the application and H5 preview for every status', async () => {
  for (const status of [0, 1, 2, 3]) {
    const prepared = { ...source, status, version: 4, pointPaid: 1 };
    const module = loadData({}, {
      getAgentCarbonLabelPrepare: async () => ({ data: { data: prepared } }),
      getAgentCarbonLabelAuditRecords: async () => ({ data: { data: [{ id: 8 }] } }),
    });
    const result = await module.loadApplicationSource('34', '12');
    assert.equal(result.info.id, 71);
    assert.equal(result.info.status, status);
    assert.equal(result.info.version, 4);
    assert.equal(result.info.pointPaid, 1);
    assert.equal(result.info.brand, source.brand);
    assert.deepEqual(result.records, [{ id: 8 }]);
    assert.equal(result.preview, result.info);
    assert.equal(result.preview.accountObj, prepared.accountObj);
  }
});

test('the price is display-only, accepts zero and maps invalid successful values to no price', async () => {
  for (const cost of [0, 2468, 1299]) {
    const module = loadData({}, { getAgentCarbonLabelPointCost: async () => ({ data: { data: { pointCost: cost } } }) });
    assert.equal(await module.loadApplicationPointCost('34'), cost);
  }
  for (const cost of [undefined, null, '1299', -1, NaN]) {
    const module = loadData({}, { getAgentCarbonLabelPointCost: async () => ({ data: { data: { pointCost: cost } } }) });
    assert.equal(await module.loadApplicationPointCost('34'), undefined);
  }
  const failure = new Error('Price unavailable');
  const module = loadData({}, { getAgentCarbonLabelPointCost: async () => { throw failure; } });
  await assert.rejects(module.loadApplicationPointCost('34'), failure);
});

test('the hook overlays form edits on prepare data without requesting another preview', async () => {
  const harness = labelSubmissionHarness(false, { preparedInfo: { id: 71, status: 3 } });
  harness.render();
  await flushPromises();
  let state = harness.render();
  assert.equal(state.preview, state.info);
  assert.equal(state.pointCost, undefined);
  assert.equal(harness.pointCostRequests.length, 0);
  assert.equal(state.info.status, 3);
  assert.equal(state.form.values.brand, source.brand);
  state.form.setValuesIn('brand', 'Edited brand');
  state = harness.render();
  assert.equal(state.preview.brand, 'Edited brand');
  assert.equal(state.preview.accountObj.equalList, source.accountObj.equalList);
  assert.equal(harness.sourceRequests.length, 1);
  harness.unmount();
  const failed = labelSubmissionHarness(false, { loadPointCost: async () => { throw new Error('Price unavailable'); } });
  failed.render();
  await flushPromises();
  let ready = failed.render();
  assert.equal(ready.pointCost, undefined);
  assert.equal(ready.canSubmit, true);
  assert.equal('loadError' in ready, false);
  assert.equal(ready.info.brand, source.brand);
  assert.equal(ready.form.values.brand, source.brand);
  await ready.prepareSubmit();
  ready = failed.render();
  assert.equal(ready.confirmOpen, true);
  const submission = ready.confirmSubmit();
  assert.equal(failed.requests.length, 1);
  failed.requests[0].reject(new Error('Submit rejected'));
  await submission;
  failed.unmount();
});
test('prepare initializes every form field, preview and existing application metadata without requesting accounting detail or legacy preview', async () => {
  const calls = [];
  const prepared = {
    ...source,
    id: 1164,
    accountId: 10062,
    productId: 6108,
    companyId: 1000000226813904,
    productName: '水杯',
    accountName: '1个550ml双层不锈钢水杯（含包装）半生命周期碳足迹',
    specs: '',
    brand: '水杯水杯',
    unitCode: '61',
    unitName: '个',
    specsShow: 0,
    periodShow: 1,
    contrastShow: 1,
    contrastValues: '0,1,2',
    status: 2,
    applyNum: 'T202608310115',
    version: 2,
    labelType: 0,
    labelPic: '',
    sourceType: 'AGENT_PAID',
    pointCost: 1299,
    pointPaid: 1,
    projectId: null,
    sessionId: 'agent_test_session',
    messageId: null,
    errorCode: null,
    accountObj: { ...source.accountObj, perEmission: '2.66' },
  };
  const records = [{ id: 9, actType: 0 }, { id: 3, actType: 2 }];
  const module = loadData(
    {},
    {
      getAgentCarbonLabelAuditRecords: async args => {
        calls.push(['auditRecords', args]);
        return { data: { data: records } };
      },
      getAgentCarbonLabelPrepare: async args => {
        calls.push(['prepare', args]);
        return { data: { code: 200, msg: '成功', data: prepared } };
      },
    },
  );
  const result = await module.loadApplicationSource('10062', '6108');
  const { info } = result;
  assert.equal(result.records, records);
  assert.deepEqual(info, module.normalizeApplicationInfo(prepared));
  assert.equal(info.accountObj, prepared.accountObj);
  const values = module.toApplicationValues(info);
  assert.deepEqual(values, {
    productName: prepared.productName,
    accountName: prepared.accountName,
    period: [prepared.startTime, prepared.endTime],
    perEmission: '2.66', perEmissionUnit: 'kgCO₂e', productUnitName: '个',
    brand: prepared.brand, specs: '', specsShow: 0,
    periodShow: 1, contrastShow: 1, contrastValuesArr: [0, 1, 2],
    productPic: [{ url: prepared.productPic, name: 'productImages', uid: 'label-product' }],
  });
  const payload = module.toApplicationPayload(values, info);
  assert.equal(payload.id, prepared.id);
  assert.equal(payload.accountId, prepared.accountId);
  assert.equal(payload.applyNum, prepared.applyNum);
  assert.equal(payload.perEmission, '2.66');
  assert.equal(payload.perEmissionUnit, 'kgCO₂e');
  assert.equal(payload.unitName, '个');
  const preview = module.toApplicationPreview(values, info);
  assert.equal(preview.accountObj.equalList, prepared.accountObj.equalList);
  assert.equal(preview.accountObj.stageList, prepared.accountObj.stageList);
  assert.equal(preview.version, 2);
  assert.deepEqual(calls, [
    ['prepare', { accountId: '10062', forceNew: false }],
    ['auditRecords', { applyNum: prepared.applyNum }],
  ]);
});
test('new prepared applications preserve zero or missing emissions and backend units without extra model or audit queries', async () => {
  for (const perEmission of [0, '0', undefined, null, '']) {
    for (const unitName of ['g CO₂e', undefined, null, '']) {
      const module = loadData({}, {
        getAgentCarbonLabelPrepare: async () => ({ data: { data: {
          accountId: 34, productId: 12, id: null, applyNum: null,
          unitName: '套', accountObj: { ...source.accountObj, perEmission, unitName },
        } } }),
      });
      const { info, records } = await module.loadApplicationSource('34');
      const values = module.toApplicationValues(info);
      const expectedEmission = perEmission === 0 || perEmission === '0' ? '0' : '';
      assert.equal(info.perEmission, expectedEmission);
      assert.equal(info.accountObj.perEmission, perEmission);
      assert.equal(values.perEmission, expectedEmission);
      assert.equal(values.perEmissionUnit, unitName || '');
      assert.equal(info.id, undefined);
      assert.deepEqual(records, []);
      const preview = module.toApplicationPreview(values, info);
      assert.equal(preview.accountObj.perEmission, expectedEmission);
      assert.equal(preview.accountObj.equalList, source.accountObj.equalList);
      assert.equal(preview.accountObj.stageList, source.accountObj.stageList);
    }
  }
});
test('missing product image and specification stay empty for manual completion without additional queries', async () => {
  for (const missing of [undefined, null, '']) {
    const module = loadData({}, {
      getAgentCarbonLabelPrepare: async () => ({ data: { data: {
        accountId: 34, productId: 12,
        productName: 'Product without optional info',
        productPic: missing, specs: missing,
      } } }),
    });
    const { info } = await module.loadApplicationSource('34');
    const values = module.toApplicationValues(info);
    assert.deepEqual(values.productPic, []);
    assert.equal(values.specs, '');
  }
});
test('missing or mismatched prepared accounting sources fail before loading application records', async () => {
  for (const prepared of [
    undefined,
    null,
    { accountId: 34 },
    { accountId: 999, productId: 12 },
    { accountId: 34, productId: 999 },
  ]) {
    const module = loadData({}, {
      getAgentCarbonLabelPrepare: async () => ({ data: { data: prepared } }),
    });
    await assert.rejects(module.loadApplicationSource('34', '12'), /未找到/);
  }
});
test('prepare request failures propagate and backend business errors are preserved', async () => {
  const failure = new Error('Prepare access denied');
  const failed = loadData({}, {
    getAgentCarbonLabelPrepare: async () => { throw failure; },
  });
  await assert.rejects(
    failed.loadApplicationSource('34'),
    error => error === failure,
  );
  const module = loadData({}, {
    getAgentCarbonLabelPrepare: async () => ({
      data: { data: { accountId: 34, productId: 12, errorCode: 2 } },
    }),
  });
  assert.equal((await module.loadApplicationSource('34')).info.errorCode, 2);
});
test('Agent detail and audit timeline preserve saved data and server ordering without requesting legacy detail or latest model', async () => {
  const records = [
    { id: 4, actType: 0 },
    { id: 1, actType: 3 },
    { id: 9, actType: 0 },
  ];
  for (const id of [1164, 72]) {
    const detail = {
      ...source, id, applyNum: `apply-${id}`, status: 2, version: 2,
      sourceType: 'AGENT_PAID', pointCost: 1299, pointPaid: 1,
      sessionId: 'agent_saved_session', projectId: null, messageId: null,
      errorCode: null,
      accountObj: { ...source.accountObj, perEmission: '2.66' },
    };
    const calls = [];
    const module = loadData({}, {
      getAgentCarbonLabelDetail: async applicationId => {
        calls.push(['detail', applicationId]);
        return { data: { code: 200, data: detail } };
      },
      getAgentCarbonLabelAuditRecords: async args => {
        calls.push(['auditRecords', args]);
        return { data: { data: records } };
      },
    });
    const result = await module.loadApplication(String(id));
    assert.deepEqual(calls, [['detail', String(id)], ['auditRecords', { applyNum: `apply-${id}` }]]);
    assert.equal(result.records, records);
    assert.deepEqual(result.info, module.normalizeApplicationInfo(detail));
    assert.equal(result.preview, result.info);
    assert.equal(result.info.accountObj, detail.accountObj);
    const values = module.toApplicationValues(result.info);
    assert.equal(values.perEmission, '2.66');
    assert.equal(values.perEmissionUnit, 'kgCO₂e');
    assert.equal(result.info.version, 2);
    assert.equal(result.info.pointPaid, 1);
  }
});

test('Agent detail preserves backend errors, empty timelines and the original module detail API', async () => {
  const failure = new Error('Detail denied');
  const failing = loadData({}, {
    getAgentCarbonLabelDetail: async () => { throw failure; },
  });
  await assert.rejects(failing.loadApplication('1164'), error => error === failure);
  const module = loadData({}, {
    getAgentCarbonLabelDetail: async () => ({ data: { data: { ...source, applyNum: null, errorCode: 2 } } }),
  });
  const result = await module.loadApplication('71');
  assert.equal(result.info.errorCode, 2);
  assert.deepEqual(result.records, []);
  const requests = [];
  const legacyService = load('src/views/carbonFootprint3/CarbonLabel/service.ts', {
    '@src/api/request': { request: async options => { requests.push(options); } },
  });
  await legacyService.getCarbonLabelDetail({ id: '71' });
  assert.deepEqual(requests, [{ method: 'get', url: 'footprint3/tagLabel/info', params: { id: '71' } }]);
});
test('all editable Agent label required fields use localized field-specific prompts without generic or duplicate errors', async () => {
  for (const locale of ['zh-CN', 'zh-TW', 'en-US']) {
    const messages = { ...lang };
    for (const name of [
      'carbonAgent',
      'carbonAccount',
      'carbonFootprint',
      'carbonFootprint3',
      'components',
    ]) {
      messages[name] = load(`src/lang/${locale}/${name}.ts`).default;
    }
    const formUtils = load('src/components/FormilyUtil/util.tsx', {
      '@src/lang/I18N': messages,
      '@components/formily/components/Text': {},
      '@/lang/createI18nLabelMap': load('src/lang/createI18nLabelMap.ts'),
    });
    const sharedFields = load(
      'src/views/carbonFootprint3/CarbonLabel/formFields.ts',
      {
        '@src/lang/I18N': messages,
        '@src/components/FormilyUtil/util': formUtils,
      },
    );
    const { createApplicationSchema } = load(
      'src/views/system/carbonAgent/components/ProductCarbonLabelApply/schema.tsx',
      {
        '@src/lang/I18N': messages,
        '@src/components/iconfont': () => null,
        './assets/hidden.svg': 'hidden.svg',
        './assets/upload.svg': 'upload.svg',
        './index.module.less': {},
        '@src/components/FormilyUtil/util': formUtils,
        '@src/views/carbonFootprint3/CarbonLabel/formFields': sharedFields,
      },
    );
    const form = createForm({ initialValues: data.toApplicationValues({}) });
    const schema = new Schema(createApplicationSchema(form));
    Object.entries(schema.properties).forEach(([name, field]) => {
      if (field.type !== 'void')
        form.createField({ name, ...field.toFieldProps() });
    });
    await assert.rejects(form.validate());
    const expected = {
      productName:
        messages.components.pleaseFillIn + messages.carbonFootprint.productName,
      accountName:
        messages.components.pleaseFillIn +
        messages.carbonFootprint3.functionalUnits,
      brand:
        messages.components.pleaseFillIn + messages.carbonFootprint3.brandName,
      specs:
        messages.components.pleaseFillIn +
        messages.carbonFootprint.specificationAndModel,
      period:
        messages.carbonFootprint.pleaseSelect +
        messages.carbonFootprint.accountingCycle,
      productPic: messages.template(messages.carbonAccount.pleaseUploadIt, {
        val1: messages.carbonFootprint3.productImages,
      }),
      contrastValuesArr:
        messages.carbonFootprint.pleaseSelect +
        messages.carbonAgent.labelApplication.categoryLabel,
    };
    for (const [name, message] of Object.entries(expected)) {
      assert.deepEqual(
        form.query(name).take().selfErrors,
        [message],
        `${locale}: ${name}`,
      );
    }
    assert.deepEqual(form.query('perEmission').take().selfErrors, []);
    form.setValuesIn('brand', '12345678901');
    form.setValuesIn('perEmission', '-1');
    form.setValuesIn('period', ['2026-12-31', '2026-01-01']);
    form.setValuesIn('productPic', [{ name: 'uploading' }]);
    form.setValuesIn('contrastValuesArr', [0, 1, 2, 3]);
    await assert.rejects(form.validate());
    const invalid = {
      brand: messages.carbonFootprint3.enterUpTo,
      period: messages.carbonAgent.labelApplication.invalidPeriod,
      productPic: messages.carbonAgent.labelApplication.uploadedRequired,
      contrastValuesArr: messages.carbonAgent.labelApplication.categoryRequired,
    };
    for (const [name, message] of Object.entries(invalid)) {
      assert.deepEqual(
        form.query(name).take().selfErrors,
        [message],
        `${locale}: ${name}`,
      );
    }
    assert.deepEqual(form.query('perEmission').take().selfErrors, []);
    form.setValuesIn('perEmission', '0');
    form.setValuesIn('specsShow', 0);
    form.setValuesIn('contrastShow', 0);
    form.setValuesIn('contrastValuesArr', []);
    await assert.rejects(form.validate());
    assert.deepEqual(form.query('specs').take().selfErrors, []);
    assert.deepEqual(form.query('contrastValuesArr').take().selfErrors, []);
    assert.deepEqual(form.query('perEmission').take().selfErrors, []);
    form.setValuesIn('specsShow', 1);
    form.setValuesIn('contrastShow', 1);
    await assert.rejects(form.validate());
    assert.deepEqual(form.query('specs').take().selfErrors, [expected.specs]);
    assert.deepEqual(form.query('contrastValuesArr').take().selfErrors, [
      expected.contrastValuesArr,
    ]);
  }
});

test('Agent form retains old upload schema and conditional validation', async () => {
  const sharedFields = load(
    'src/views/carbonFootprint3/CarbonLabel/formFields.ts',
    {
      '@src/lang/I18N': lang,
      '@src/components/FormilyUtil/util': {
        initFormilyInput: (title, required) => ({
          title,
          required,
          'x-component': 'Input',
          'x-validator': { required },
        }),
      },
    },
  );
  const form = createForm({ initialValues: data.toApplicationValues(source) });
  const schemaModule = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/schema.tsx',
    {
      '@src/lang/I18N': lang,
      '@src/components/iconfont': () => null,
      './assets/hidden.svg': 'hidden.svg',
      './assets/upload.svg': 'upload.svg',
      './index.module.less': {},
      '@src/components/FormilyUtil/util': {
        initFormilyInput: (title, required) => ({
          title,
          required,
          'x-component': 'Input',
          'x-validator': { required },
        }),
        initFormilyDatePicker: (title, required) => ({ title, required }),
      },
      '@src/views/carbonFootprint3/CarbonLabel/formFields': sharedFields,
    },
  );
  const definition = schemaModule.createApplicationSchema(form);
  const schema = new Schema(definition);
  Object.entries(schema.properties).forEach(([name, field]) => {
    if (field.type !== 'void')
      form.createField({ name, ...field.toFieldProps() });
  });
  form.setValuesIn('brand', '12345678901');
  await assert.rejects(form.validate());
  form.setValuesIn('brand', '');
  await assert.rejects(form.validate());
  form.setValuesIn('brand', 'Brand');
  form.setValuesIn('specs', '');
  form.setValuesIn('contrastValuesArr', []);
  await assert.rejects(form.validate());
  form.setValuesIn('specsShow', 0);
  form.setValuesIn('contrastShow', 0);
  await form.validate();
  form.setValuesIn('specsShow', 1);
  await assert.rejects(form.validate());
  form.setValuesIn('specs', 'Model');
  form.setValuesIn('perEmission', '-1');
  await form.validate();
  form.setValuesIn('perEmission', '0');
  form.setValuesIn('contrastShow', 1);
  form.setValuesIn('contrastValuesArr', [1, 2, 3, 4]);
  await assert.rejects(form.validate());
  form.setValuesIn('contrastValuesArr', [1, 2, 3]);
  await form.validate();
  form.setValuesIn('period', ['2026-12-31', '2026-01-01']);
  await assert.rejects(form.validate());
  form.setValuesIn('period', ['2026-01-01', '']);
  await assert.rejects(form.validate());
  form.setValuesIn('period', ['2026-01-01', '2026-12-31']);
  await form.validate();
  form.setValuesIn('perEmissionUnit', '  ');
  await form.validate();
  form.setValuesIn('perEmissionUnit', 't CO₂e/件');
  await form.validate();
  assert.equal(
    definition.properties.perEmission['x-component'],
    'EmissionInput',
  );
  assert.equal(
    definition.properties.period['x-component'],
    'ApplicationPeriod',
  );
  assert.equal(
    definition.properties.productPic['x-component-props'].descriptionPosition,
    'before',
  );
  assert.equal(
    definition.properties.productPic['x-component'],
    'FormilyUploadCrop',
  );
  assert.equal(
    definition.properties.productPic['x-component-props'].maxCount,
    1,
  );
  assert.equal(
    definition.properties.productPic['x-component-props'].replaceOnExceed,
    true,
  );
  const imageProps = definition.properties.productPic['x-component-props'];
  const legacyImageProps =
    sharedFields.carbonLabelProductImageField()['x-component-props'];
  for (const key of [
    'description',
    'maxSize',
    'acceptArr',
    'formatArr',
    'cropProps',
  ]) {
    assert.deepEqual(imageProps[key], legacyImageProps[key]);
  }
});

test('unit emissions use the label-type read-only appearance and combine emission and product units', () => {
  const component = fs.readFileSync(
    path.join(
      root,
      'src/views/system/carbonAgent/components/ProductCarbonLabelApply/components/EmissionInput.tsx',
    ),
    'utf8',
  );
  assert.match(component, /aria-readonly='true'/);
  assert.match(component, /className=\{style\.fixedValue\}/);
  assert.match(component, /`\$\{emissionUnit\}\/\$\{productUnit\}`/);
  assert.doesNotMatch(component, /<input/);
  assert.doesNotMatch(component, /onChange=/);
});

test('embedded timeline uses design assets without changing records or legacy rendering', () => {
  const auditLang = {
    ...lang,
    carbonFootprint3: load('src/lang/zh-CN/carbonFootprint3.ts').default,
  };
  const auditConstants = load(
    'src/views/carbonFootprint3/CarbonLabel/component/AuditList/constant.ts',
    { '@src/lang/I18N': auditLang },
  );
  const { AuditList } = load(
    'src/views/carbonFootprint3/CarbonLabel/component/AuditList/index.tsx',
    {
      '@src/lang/I18N': auditLang,
      '@src/components/iconfont': { IconAlibaba: () => null },
      '@src/assets/images/carbonLabel/agent/submitted.svg': 'submitted.svg',
      '@src/assets/images/carbonLabel/agent/approved.svg': 'approved.svg',
      '@src/assets/images/carbonLabel/agent/rejected.svg': 'rejected.svg',
      '@src/assets/svg/icon_avatar.svg': 'avatar.svg',
      './constant': auditConstants,
      './index.module.less': { embedded: 'embedded' },
      './index.less': {},
      '../../service': {},
      '../PreviewH5': { PreviewH5: () => null },
      antd: {
        Button: ({ children }) => React.createElement('button', null, children),
        Popover: ({ children }) => children,
        Spin: ({ children }) => children,
      },
    },
  );
  const auditLists = [
    {
      id: 3,
      actType: 0,
      version: 1,
      createTime: '2026-08-27 10:00',
      updateByName: 'Applicant A',
    },
    {
      id: 1,
      actType: 3,
      createTime: '2026-08-28 10:00',
      updateByName: 'Reviewer B',
      comment: 'Full feedback\nSecond line',
    },
    {
      id: 2,
      actType: 2,
      createTime: '2026-08-29 10:00',
      updateByName: 'Reviewer C',
    },
  ];
  const markup = renderToStaticMarkup(
    React.createElement(AuditList, { auditLists, embedded: true }),
  );
  assert.ok(markup.indexOf('submitted.svg') < markup.indexOf('rejected.svg'));
  assert.ok(markup.indexOf('rejected.svg') < markup.indexOf('approved.svg'));
  assert.ok(markup.includes('Full feedback\nSecond line'));
  assert.ok(markup.includes('Applicant A'));
  assert.ok(markup.includes('Reviewer B'));
  assert.ok(markup.includes('驳回原因'));
  assert.ok(!markup.includes('未通过原因'));
  assert.ok(markup.includes('#版本1'));
  assert.ok(!markup.includes('##版本1'));
  const legacy = renderToStaticMarkup(
    React.createElement(AuditList, { auditLists }),
  );
  assert.ok(!legacy.includes('submitted.svg'));
  assert.ok(!legacy.includes('avatar.svg'));
  assert.ok(legacy.includes('#版本1'));
  assert.ok(!legacy.includes('##版本1'));
});

test('Agent timeline connects only adjacent nodes with the Figma thin line and keeps legacy borders intact', () => {
  const lessSyntax = require('postcss-less');
  const stylesheet = lessSyntax.parse(
    fs.readFileSync(
      path.join(root, 'src/views/carbonFootprint3/CarbonLabel/component/AuditList/index.module.less'),
      'utf8',
    ),
  );
  const declarations = selector => {
    const values = {};
    stylesheet.walkRules(rule => {
      const ancestry = [];
      for (let node = rule; node?.type !== 'root'; node = node.parent) {
        if (node.type === 'rule') ancestry.unshift(node.selector);
      }
      if (ancestry.join(' ') !== selector) return;
      rule.each(declaration => {
        if (declaration.type === 'decl') values[declaration.prop] = declaration.value;
      });
    });
    return values;
  };
  const scope = '.auditListMain.embedded .list';
  assert.equal(declarations('.auditListMain .list')['border-left'], '1px dashed #ebedf0');
  assert.equal(declarations(scope)['border-left'], 'none');
  assert.equal(declarations(scope)['padding-left'], '24px');
  const connector = declarations(scope + ' &:not(:last-child)::before');
  assert.equal(connector.width, '1px');
  assert.equal(connector.background, '#e5e7eb');
  assert.equal(connector.top, '20px');
  assert.equal(connector.bottom, '-2px');
  assert.equal(connector.left, '7.5px');
  assert.equal(declarations(scope + ' &:last-child')['padding-bottom'], '0');
  assert.deepEqual(declarations(scope + ' &::before'), {});
  assert.equal(declarations(scope + ' .dateTime .version').top, '14px');
});

test('version popover spacing and rejected record-footer seam keep the existing scrolling layout', () => {
  const lessSyntax = require('postcss-less');
  const declarations = (file, selector) => {
    const values = {};
    const stylesheet = lessSyntax.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    stylesheet.walkRules(rule => {
      const ancestry = [];
      for (let node = rule; node?.type !== 'root'; node = node.parent) {
        if (node.type === 'rule') ancestry.unshift(node.selector);
      }
      if (ancestry.join(' ') !== selector) return;
      rule.each(declaration => {
        if (declaration.type === 'decl') values[declaration.prop] = declaration.value;
      });
    });
    return values;
  };
  const popoverFile = 'src/views/carbonFootprint3/CarbonLabel/component/AuditList/index.less';
  // One layer owns all four outer insets; title and content must not add more padding.
  assert.equal(declarations(popoverFile, '.auditPopoverClass .ant-popover-inner').padding, '16px');
  const title = declarations(popoverFile, '.auditPopoverClass .ant-popover-title');
  assert.equal(title.height, 'auto');
  assert.equal(title.margin, '0 0 16px');
  assert.equal(title.padding, '0');
  assert.equal(declarations(popoverFile, '.auditPopoverClass .ant-popover-inner-content').padding, '0');
  const pageFile = 'src/views/system/carbonAgent/components/ProductCarbonLabelApply/index.module.less';
  const rejectedScope = '.applicationColumn.rejectedColumn';
  const seam = declarations(pageFile, rejectedScope + ' .applicationCard + .applicationCard');
  assert.equal(seam['border-bottom'], '0');
  assert.equal(seam['border-bottom-left-radius'], '0');
  assert.equal(seam['border-bottom-right-radius'], '0');
  assert.equal(declarations(pageFile, rejectedScope + ' .applicationCards')['overflow-y'], 'auto');
  assert.equal(declarations(pageFile, rejectedScope + ' > .footer')['border-radius'], '0 0 16px 16px');
  assert.equal(declarations(pageFile, '.footer')['flex-shrink'], '0');
});

function auditVersionHarness(request) {
  const runtime = hookHarness();
  const auditConstants = load(
    'src/views/carbonFootprint3/CarbonLabel/component/AuditList/constant.ts',
    { '@src/lang/I18N': lang },
  );
  const previews = [];
  const popovers = [];
  const { AuditList } = load(
    'src/views/carbonFootprint3/CarbonLabel/component/AuditList/index.tsx',
    {
      react: runtime.hooks,
      '@src/lang/I18N': lang,
      '@src/components/iconfont': { IconAlibaba: () => null },
      '@src/assets/images/carbonLabel/agent/submitted.svg': 'submitted.svg',
      '@src/assets/images/carbonLabel/agent/approved.svg': 'approved.svg',
      '@src/assets/images/carbonLabel/agent/rejected.svg': 'rejected.svg',
      '@src/assets/svg/icon_avatar.svg': 'avatar.svg',
      './constant': auditConstants,
      './index.module.less': { popoverMain: 'popoverMain', agentPopoverMain: 'agentPopoverMain' },
      './index.less': {},
      '../../service': {
        getCarbonLabelAuditDiff: request,
      },
      '../PreviewH5': {
        PreviewH5: props => { previews.push(props); return null; },
      },
      antd: {
        Button: ({ children }) => React.createElement('button', null, children),
        Spin: ({ children, spinning }) => React.createElement('div', { 'data-loading': spinning }, children),
        Popover: props => {
          popovers.push(props);
          return React.createElement('div', null, props.title, props.open ? props.content : null, props.children);
        },
      },
    },
  );
  return {
    render: props => {
      previews.length = 0;
      popovers.length = 0;
      return renderToStaticMarkup(runtime.render(() => AuditList(props)));
    },
    popovers,
    previews,
    unmount: runtime.unmount,
  };
}

test('version popovers reuse Agent appearance without changing the version request or its response', async () => {
  const auditLists = [{ id: 1, labelId: 71, actType: 0, version: 2 }];
  const historicalInfo = { ...source, brand: 'Historical brand', brandChange: 1 };
  for (const embedded of [true, false]) {
    const requests = [];
    const harness = auditVersionHarness(async params => {
      requests.push(params);
      return { data: { data: historicalInfo } };
    });
    const render = () => harness.render({ auditLists, embedded });
    render();
    assert.equal(requests.length, 0);
    harness.popovers[0].onOpenChange(true);
    await flushPromises();
    const markup = render();
    assert.deepEqual(requests, [{ labelId: 71, version: 2 }]);
    assert.equal(harness.previews.at(-1).info, historicalInfo);
    assert.equal(harness.previews.at(-1).variant, embedded ? 'agent-version' : 'legacy');
    assert.equal(harness.previews.at(-1).labelPreview, undefined);
    assert.equal(markup.includes('agentPopoverMain'), embedded);
    assert.ok(markup.includes('useRedInDifferentPlaces'));
    harness.unmount();
  }
});

test('Agent and legacy historical versions ignore out-of-order responses and clear the previous preview immediately', async () => {
  for (const embedded of [true, false]) {
    const requests = [];
    const harness = auditVersionHarness(params => new Promise((resolve, reject) => requests.push({ params, resolve, reject })));
    const props = { embedded, auditLists: [
      { id: 1, labelId: 71, actType: 0, version: 1 },
      { id: 2, labelId: 71, actType: 0, version: 2 },
    ] };
    const render = () => harness.render(props);
    render();
    harness.popovers[0].onOpenChange(true);
    render();
    harness.popovers[1].onOpenChange(true);
    // An older popover's close notification must not close the new one.
    harness.popovers[0].onOpenChange(false);
    render();
    assert.deepEqual(harness.popovers.map(popover => popover.open), [false, true]);
    assert.equal(harness.previews[0].info, undefined);
    assert.deepEqual(requests.map(item => item.params), [{ labelId: 71, version: 1 }, { labelId: 71, version: 2 }]);
    const second = { ...source, version: 2, brand: 'Second', brandChange: 1 };
    requests[1].resolve({ data: { data: second } });
    await flushPromises();
    render();
    assert.equal(harness.previews[0].info, second);
    requests[0].resolve({ data: { data: { ...source, version: 1, brand: 'First' } } });
    await flushPromises();
    render();
    assert.equal(harness.previews[0].info, second);
    harness.popovers[0].onOpenChange(true);
    assert.ok(render().includes('data-loading="true"'));
    assert.equal(harness.previews[0].info, undefined, 'Do not show version 2 while version 1 loads');
    requests[2].reject(new Error('Handled by request layer'));
    await flushPromises();
    assert.ok(!render().includes('data-loading="true"'));
    assert.equal(harness.previews[0].info, undefined);
    harness.popovers[0].onOpenChange(false);
    render();
    assert.deepEqual(harness.popovers.map(popover => popover.open), [false, false]);
    harness.unmount();
  }
});

test('closing, reopening the same version and unmounting invalidate stale version requests', async () => {
  const requests = [];
  const harness = auditVersionHarness(params => new Promise(resolve => requests.push({ params, resolve })));
  const props = { auditLists: [{ id: 1, labelId: 71, actType: 0, version: 1 }] };
  const render = () => harness.render(props);
  render();
  harness.popovers[0].onOpenChange(true);
  render();
  harness.popovers[0].onOpenChange(false);
  requests[0].resolve({ data: { data: source } });
  await flushPromises();
  render();
  assert.equal(harness.popovers[0].open, false);
  harness.popovers[0].onOpenChange(true);
  render();
  harness.popovers[0].onOpenChange(false);
  render();
  harness.popovers[0].onOpenChange(true);
  const newest = { ...source, brand: 'Newest' };
  requests[2].resolve({ data: { data: newest } });
  await flushPromises();
  requests[1].resolve({ data: { data: source } });
  await flushPromises();
  render();
  assert.equal(harness.previews[0].info, newest);
  harness.popovers[0].onOpenChange(true);
  render();
  harness.unmount();
  requests[3].resolve({ data: { data: source } });
  await flushPromises();
  render();
  assert.equal(harness.previews[0].info, undefined);
});

test('submitted accounting periods use the localized 至 separator and preserve missing-value behavior', () => {
  const { ApplicationRecords } = load(
    'src/views/system/carbonAgent/components/ProductCarbonLabelApply/components/ApplicationRecords.tsx',
    {
      '@src/lang/I18N': lang,
      '@src/views/carbonFootprint3/CarbonLabel/component/AuditList': { AuditList: () => null },
      '../data': data,
      '../index.module.less': {},
      antd: { Empty: () => null },
    },
  );
  const render = info => renderToStaticMarkup(
    React.createElement(ApplicationRecords, { info, auditRecords: [], showHeading: false }),
  );
  const markup = render(source);
  assert.ok(markup.includes('2026-01-01 至 2026-12-31'));
  assert.ok(!markup.includes(' — '));
  assert.ok(!render({ ...source, endTime: undefined }).includes('2026-01-01 至'));
});

test('embedded deliverables retain legacy QR targets, download controls and isolated instances', () => {
  const assets = Object.fromEntries(
    [
      'agent/download.svg',
      'carbonLabel.png',
      'carbonStopQR.jpeg',
      'downIcon.svg',
      'offsetLabel.png',
      'reduceLabel.png',
    ].map(name => [`@src/assets/images/carbonLabel/${name}`, name]),
  );
  const { CarbonLabelModal } = load(
    'src/views/carbonFootprint3/CarbonLabel/component/CarbonLabelModal/index.tsx',
    {
      ...assets,
      '@src/lang/I18N': lang,
      '@src/components/iconfont': () => null,
      '@src/utils/Toast': {},
      './index.module.less': {
        embedded: 'embedded',
        title: 'title',
        titleDownload: 'titleDownload',
        downLoadMain: 'downLoadMain',
      },
      '../../constant': constants,
      html2canvas: () => {
        throw new Error('Rendering must not start downloads');
      },
      'qrcode.react': ({ value, size }) =>
        React.createElement('canvas', { 'data-qr-value': value, width: size }),
      antd: {
        Button: ({ children, type, ...props }) =>
          React.createElement('button', props, children),
        Spin: ({ children }) => children,
      },
    },
  );
  const originalApiUrl = process.env.REACT_APP_API_URL;
  try {
    for (const [environment, domain] of [
      ['test', 'carbon-label-test'],
      ['dev', 'carbon-label-dev'],
      ['pre', 'carbon-label-test'],
      ['prod', 'carbon-label'],
    ]) {
      process.env.REACT_APP_API_URL = `https://${environment}.example.com`;
      const info = { ...source, labelType: 0, version: 2 };
      const preview = renderToStaticMarkup(
        React.createElement(CarbonLabelModal, {
          info,
          embedded: true,
          hiddenBtn: true,
        }),
      );
      assert.ok(
        preview.includes(
          `https://${domain}.carbonstop.net/?applyNum=apply-71&amp;source=1&amp;version=2`,
        ),
      );
      assert.ok(preview.includes('width="110"'));
      assert.ok(!preview.includes('<button'));
      assert.ok(
        preview.includes(lang.carbonAgent.labelApplication.labelExample),
      );
      for (const embedded of [false, true]) {
        const final = renderToStaticMarkup(
          React.createElement(CarbonLabelModal, { info, embedded }),
        );
        assert.ok(final.includes('downloadCarbonTags'));
        assert.ok(final.includes('downloadQrCode'));
        assert.equal((final.match(/<button/g) || []).length, 2);
        const titles = [...final.matchAll(/<div class="title">(.*?)<\/div>/g)];
        assert.equal(titles.length, 2);
        for (const [index, [, title]] of titles.entries()) {
          assert.equal(title.includes('<button'), embedded);
          if (embedded) {
            const action = index === 0 ? 'downloadCarbonTags' : 'downloadQrCode';
            const label = index === 0 ? 'carbonLabel' : 'qrCode';
            assert.ok(title.includes(`aria-label="${action}"`));
            assert.ok(title.includes('class="titleDownload"'));
            assert.ok(title.includes(`>${label}<img src="agent/download.svg" width="16" height="16" alt=""/></button>`));
          }
        }
        assert.equal(final.includes('class="downLoadMain"'), !embedded);
      }
      const editedInfo = { ...info, perEmissionUnit: 't CO₂e/件' };
      const stamp = renderToStaticMarkup(
        React.createElement(CarbonLabelModal, {
          info: editedInfo,
          stampOnly: true,
        }),
      );
      assert.ok(stamp.includes('kgCO₂e'));
      assert.ok(stamp.includes('carbonLabel.png'));
      assert.ok(!stamp.includes('<button'));
      assert.ok(!stamp.includes('<canvas'));
      assert.ok(!stamp.includes('downloadCarbonTags'));
      const legacyUnit = renderToStaticMarkup(
        React.createElement(CarbonLabelModal, { info: editedInfo }),
      );
      assert.ok(legacyUnit.includes('kgCO₂e'));
      assert.ok(!legacyUnit.includes('t CO₂e/件'));
      const multiple = renderToStaticMarkup(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(CarbonLabelModal, { info, embedded: true }),
          React.createElement(CarbonLabelModal, {
            info: { ...info, applyNum: 'apply-72' },
            embedded: true,
          }),
        ),
      );
      const ids = [
        ...multiple.matchAll(/id="(carbon-label-circle-[^"]+)"/g),
      ].map(match => match[1]);
      assert.equal(new Set(ids).size, 2);
      for (const id of ids) assert.ok(multiple.includes(`xlink:href="#${id}"`));
      assert.ok(multiple.includes('applyNum=apply-72'));
    }
  } finally {
    if (originalApiUrl === undefined) delete process.env.REACT_APP_API_URL;
    else process.env.REACT_APP_API_URL = originalApiUrl;
  }
});

test('Agent download icons use Figma sizing and spacing scoped to the embedded titles', () => {
  const lessSyntax = require('postcss-less');
  const stylesheet = lessSyntax.parse(fs.readFileSync(path.join(
    root,
    'src/views/carbonFootprint3/CarbonLabel/component/CarbonLabelModal/index.module.less',
  ), 'utf8'));
  const rules = {};
  stylesheet.walkRules(rule => {
    const ancestry = [];
    for (let node = rule; node?.type !== 'root'; node = node.parent) {
      if (node.type === 'rule') ancestry.unshift(node.selector);
    }
    const declarations = {};
    rule.each(node => {
      if (node.type === 'decl') declarations[node.prop] = node.value;
    });
    rules[ancestry.join(' ')] = declarations;
  });
  const parent = '.carbonLabelModalMain.embedded .everyMain';
  assert.equal(rules[`${parent} .title`].display, 'flex');
  assert.equal(rules[`${parent} .title`]['align-items'], 'center');
  assert.equal(rules[`${parent} .title`].gap, '8px');
  assert.equal(rules[`${parent} .title`]['margin-bottom'], '12px');
  assert.equal(rules[`${parent} .titleDownload`].display, 'inline-flex');
  assert.equal(rules[`${parent} .titleDownload`].gap, '8px');
  assert.equal(rules[`${parent} .titleDownload`].height, '22px');
  assert.equal(rules[`${parent} .titleDownload`].padding, '0');
  assert.equal(rules['.carbonLabelModalMain .everyMain .title'].display, undefined);
  assert.equal(rules['.carbonLabelModalMain .everyMain .downLoadMain'].color, '#0cbf9f');
  const asset = fs.readFileSync(path.join(root, 'src/assets/images/carbonLabel/agent/download.svg'), 'utf8');
  assert.ok(asset.includes('fill="#6C757D"'));
});

test('Agent H5 variant uses existing results and icons while leaving legacy preview behavior unchanged', () => {
  let textMeasurements = 0;
  const assets = Object.fromEntries(
    ['car', 'dian', 'gas', 'phone', 'subway', 'tree'].map(name => [
      `@src/assets/svg/carbonLabel/icon_${name}.svg`,
      `icon_${name}.svg`,
    ]),
  );
  const { PreviewH5 } = load(
    'src/views/carbonFootprint3/CarbonLabel/component/PreviewH5/index.tsx',
    {
      ...assets,
      '@src/assets/images/carbonLabel/carbonLabelWill.png':
        'carbonLabelWill.png',
      '@src/lang/I18N': {
        ...lang,
        template: (_, { val1, val2 }) => `${val1} 至 ${val2}`,
      },
      '@src/views/carbonFootprint3/graph/utils': {
        calcTextWidth: () => {
          textMeasurements += 1;
          return 24;
        },
      },
      './index.module.less': {
        previewH5: 'previewH5',
        agentPreview: 'agentPreview',
        versionChange: 'versionChange',
        versionTextHiden: 'versionTextHiden',
      },
    },
  );
  const info = {
    ...source,
    perEmissionUnit: 't CO₂e/件',
    periodShow: 1,
    contrastValues: '0,1',
    accountObj: {
      ...source.accountObj,
      equalList: [
        { code: 0, amount: 42, unitName: '棵/年', name: '梭梭树 CO₂ 吸收量' },
        { code: 1, amount: 120, unitName: 'kWh', name: '家庭用电量' },
      ],
      stageList: [
        { stage: 1, stageName: '原材料获取', rateAccount: 1.64 },
        { stage: 2, stageName: '生产制造', rateAccount: 98.36 },
      ],
    },
  };
  const labelPreview = React.createElement(
    'span',
    null,
    'Original label graphic',
  );
  const agent = renderToStaticMarkup(
    React.createElement(PreviewH5, { info, variant: 'agent', labelPreview }),
  );
  assert.ok(agent.includes('previewH5 agentPreview'));
  assert.ok(agent.includes('kgCO₂e'));
  assert.ok(agent.includes('kgCO₂e/item'));
  assert.ok(agent.includes('Original label graphic'));
  assert.ok(!agent.includes('carbonLabelWill.png'));
  assert.ok(agent.includes('icon_tree.svg'));
  assert.ok(agent.includes('icon_dian.svg'));
  assert.ok(agent.includes('42 棵/年'));
  assert.ok(agent.includes('width:1.64%;background-color:#0cbf9f'));
  assert.ok(agent.includes('width:98.36%;background-color:#026961'));
  assert.equal((agent.match(/background-color:/g) || []).length, 2);
  assert.equal(textMeasurements, 0);
  const pending = renderToStaticMarkup(
    React.createElement(PreviewH5, { info, variant: 'agent' }),
  );
  assert.ok(pending.includes('carbonLabelWill.png'));
  assert.ok(pending.includes('7.05'));
  assert.ok(pending.includes('kgCO₂e'));
  assert.ok(pending.includes('kgCO₂e/item'));
  assert.ok(pending.includes('42 棵/年'));
  assert.ok(pending.includes('width:98.36%;background-color:#026961'));
  const legacy = renderToStaticMarkup(
    React.createElement(PreviewH5, { info, labelPreview }),
  );
  assert.ok(!legacy.includes('agentPreview'));
  assert.ok(!legacy.includes('t CO₂e/件'));
  assert.ok(legacy.includes('kgCO₂e/item'));
  assert.ok(legacy.includes('carbonLabelWill.png'));
  assert.ok(!legacy.includes('Original label graphic'));
  assert.ok(legacy.includes('42棵/年'));
  assert.ok(legacy.includes('width:1.64%'));
  assert.ok(!legacy.includes('background-color:'));
  assert.equal(textMeasurements, 1);
  const changedInfo = {
    ...info,
    productChange: 1,
    brandChange: 1,
    perEmissionChange: 1,
    specsChange: 0,
    accountPeriodChange: 0,
    contrastChange: 0,
    stageChange: 1,
    accountObj: {
      ...info.accountObj,
      stageList: info.accountObj.stageList.map(stage => ({ ...stage, change: 1 })),
    },
  };
  const history = renderToStaticMarkup(
    React.createElement(PreviewH5, { info: changedInfo, variant: 'agent-version' }),
  );
  const legacyHistory = renderToStaticMarkup(
    React.createElement(PreviewH5, { info: changedInfo }),
  );
  assert.ok(history.includes('previewH5 agentPreview'));
  assert.ok(history.includes('kgCO₂e'));
  assert.ok(history.includes('kgCO₂e/item'));
  assert.ok(!history.includes('t CO₂e/件'));
  assert.ok(history.includes('carbonLabelWill.png'));
  assert.ok(history.includes('7.05'));
  assert.ok(history.includes('width:98.36%;background-color:#026961'));
  assert.equal((history.match(/versionChange/g) || []).length, 9);
  assert.equal((history.match(/versionTextHiden/g) || []).length, 3);
  assert.equal((history.match(/versionChange/g) || []).length, (legacyHistory.match(/versionChange/g) || []).length);
  assert.equal((history.match(/versionTextHiden/g) || []).length, (legacyHistory.match(/versionTextHiden/g) || []).length);
  const empty = renderToStaticMarkup(
    React.createElement(PreviewH5, { variant: 'agent' }),
  );
  assert.ok(empty.includes('carbonLabelWill.png'));
  assert.ok(!empty.includes('background-color:'));
  assert.ok(!empty.includes('<button'));
});
