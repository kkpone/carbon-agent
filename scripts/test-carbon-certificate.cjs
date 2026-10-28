/* Run with: node --test scripts/test-carbon-certificate.cjs. No live API calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const moduleRoot =
  'src/views/system/carbonAgent/components/ProductCarbonCertificateApply';

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function load(relative, mocks = {}) {
  const filename = path.join(root, relative);
  const result = { exports: {} };
  const code = ts.transpileModule(read(relative), {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
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

const language = {
  carbonAgent: load('src/lang/zh-CN/carbonAgent.ts').default,
};
const serviceMock = {
  getProductCarbonCertificateDetail: async () => ({ data: { data: {} } }),
  getProductCarbonCertificateList: async () => ({ data: { data: [] } }),
  postProductCarbonCertificatePrepare: async () => ({ data: { data: {} } }),
};
const data = load(`${moduleRoot}/data.ts`, {
  '@src/lang/I18N': language,
  './service': serviceMock,
});
const tabs = load(`${moduleRoot}/applicationTabs.ts`);
const pageState = load(`${moduleRoot}/pageState.ts`, { './data': data });
const visibility = load(`${moduleRoot}/visibility.ts`);

const values = {
  accountingBoundary: 'Raw materials, manufacturing, transport, use, disposal',
  accountingEndDate: '2026-12-31',
  accountingStandard: 'ISO 14067:2018',
  accountingStartDate: '2026-01-01',
  applicantCompanyName: '示例公司',
  companyAddress: '上海市示例路 1 号',
  companyAddressEn: 'No. 1 Example Road, Shanghai',
  companyNameEn: 'Example Company',
  functionalUnit: '1 台产品',
  productName: '玻璃杯',
  productNameEn: 'Glass Cup',
  specification: '500ml',
  specificationEn: '500 ml',
  unitEmission: '32.68 kgCO2e/台',
};

test('certificate service uses the five approved /ai endpoints', () => {
  const source = read(`${moduleRoot}/service.ts`);
  for (const endpoint of [
    '/ai/agent/certificate/list',
    '/ai/agent/certificate/prepare',
    '/ai/agent/certificate/point-cost',
    '/ai/agent/certificate/${encodeURIComponent(id)}',
    '/ai/agent/certificate/submit',
  ]) {
    assert.ok(source.includes(endpoint), endpoint);
  }
  for (const forbidden of [
    '/agent/certificate/latest',
    "url: '/agent/certificate/",
    'tag-label',
  ]) {
    assert.ok(!source.includes(forbidden), forbidden);
  }
  assert.match(source, /data: \{ accountId, forceNew \}/);
  assert.match(
    source,
    /getProductCarbonCertificatePointCost\([\s\S]*?accountId: string[\s\S]*?params: \{ accountId \}/,
  );
  assert.ok(!source.includes('params: { accountId, forceNew }'));
});

test('certificate requests keep the documented body without injected companyId', () => {
  const requestSource = read('src/api/request.ts');

  assert.match(requestSource, /'\/ai\/agent\/certificate\/'/);
});

test('prepare response populates every model-backed certificate field', async () => {
  const prepareExample = {
    accountingBoundaryEn:
      'raw material acquisition, manufacturing, distribution and storage',
    accountId: 10062,
    auditRecords: [
      {
        actionCode: 'SUBMIT',
        actionName: '提交申请',
        operateTime: '2026-09-02 09:47:31',
        id: 1,
        operatorName: '张三',
        toStatus: 'pending_consult_review',
        version: 1,
      },
    ],
    accountingBoundary: '原材料获取、生产制造、分销和储存',
    accountingEndDate: '2026-12-31',
    accountingStandard: 'ISO 14067:2018, PAS 2050:2011, ISO 14064-2',
    accountingStartDate: '2026-01-01',
    applicantCompanyName: 'agentBase',
    companyAddress: null,
    companyAddressEn: null,
    companyNameEn: null,
    functionalUnit: '1个',
    id: null,
    pointCost: 1299,
    productName: '水杯',
    productNameEn: null,
    specification: '',
    specificationEn: null,
    status: 'not_submitted',
    statusName: '待提交',
    unitEmission: '2.664902kgCO₂e/个',
    unitEmissionEn: '2.664902 kgCO2e/item',
  };
  const prepareData = load(`${moduleRoot}/data.ts`, {
    '@src/lang/I18N': language,
    './service': {
      ...serviceMock,
      postProductCarbonCertificatePrepare: async () => ({
        data: { data: prepareExample },
      }),
    },
  });
  const prepared = await prepareData.prepareProductCarbonCertificateApplication(
    '10062',
  );

  assert.deepEqual(prepareData.toProductCarbonCertificateFormValues(prepared), {
    accountingBoundary: '原材料获取、生产制造、分销和储存',
    accountingEndDate: '2026-12-31',
    accountingStandard: 'ISO 14067:2018, PAS 2050:2011, ISO 14064-2',
    accountingStartDate: '2026-01-01',
    applicantCompanyName: 'agentBase',
    companyAddress: '',
    companyAddressEn: '',
    companyNameEn: '',
    functionalUnit: '1个',
    productName: '水杯',
    productNameEn: '',
    specification: '',
    specificationEn: '',
    unitEmission: '2.664902kgCO₂e/个',
  });
  assert.equal(prepared.status, 'not_submitted');
  assert.equal(
    prepared.accountingBoundaryEn,
    'raw material acquisition, manufacturing, distribution and storage',
  );
  assert.equal(prepared.unitEmissionEn, '2.664902 kgCO2e/item');
  assert.equal(prepared.auditRecords.length, 1);
  assert.equal(prepared.auditRecords[0].actionCode, 'SUBMIT');
  assert.equal(prepared.auditRecords[0].actionName, '提交申请');
  assert.equal(prepared.auditRecords[0].operateTime, '2026-09-02 09:47:31');
  assert.equal(prepared.auditRecords[0].operatorName, '张三');
  assert.equal(Object.hasOwn(prepared, 'records'), false);
  assert.equal(Object.hasOwn(prepared, 'pointCost'), false);
});

test('prepare and detail values overwrite the initial empty Ant Design form', () => {
  const page = read(`${moduleRoot}/index.tsx`);
  const populateEffect = page.slice(
    page.indexOf('useEffect(() => {'),
    page.indexOf('const submitCurrentForm'),
  );

  assert.ok(populateEffect.includes('form.setFieldsValue(initialValues)'));
  assert.ok(populateEffect.includes('setPreviewValues(initialValues)'));
  assert.ok(!populateEffect.includes('form.isFieldTouched'));
  assert.ok(!populateEffect.includes('form.getFieldsValue'));
});

test('first submit omits applicationId while rejected resubmit keeps it', () => {
  const first = data.toProductCarbonCertificateSubmitPayload(values, '42', {
    messageId: 'message-1',
    projectId: 'project-1',
    sessionId: 'session-1',
  });
  const resubmit = data.toProductCarbonCertificateSubmitPayload(
    values,
    '42',
    {
      messageId: 'message-1',
      projectId: 'project-1',
      sessionId: 'session-1',
    },
    'application-7',
  );

  assert.equal(Object.hasOwn(first, 'applicationId'), false);
  assert.equal(resubmit.applicationId, 'application-7');
  assert.deepEqual(
    Object.keys(first).sort(),
    [
      ...Object.keys(values),
      'accountId',
      'messageId',
      'projectId',
      'sessionId',
    ].sort(),
  );
});

test('point cost is loaded for every not-submitted application only', () => {
  const hook = read(`${moduleRoot}/useProductCarbonCertificateApplication.ts`);
  const pointCostEffect = hook.slice(
    hook.indexOf('pointCostGenerationRef.current += 1'),
    hook.indexOf('const submit = async'),
  );

  assert.ok(pointCostEffect.includes('loadProductCarbonCertificatePointCost'));
  assert.ok(
    pointCostEffect.includes(
      'loadProductCarbonCertificatePointCost(accountId, controller.signal)',
    ),
  );
  assert.ok(pointCostEffect.includes('initializing || !notSubmitted'));
  assert.ok(!pointCostEffect.includes('detailId ||'));
  assert.ok(pointCostEffect.includes('setPointCost(cost)'));
});

test('applications and audit records remain in backend order', () => {
  const applications = [
    { ...values, accountId: '42', id: 'first', status: 'approved' },
    { ...values, accountId: '42', id: 'second', status: 'rejected' },
    { ...values, accountId: '51', id: 'third', status: 'pending_review' },
  ];
  const merged = tabs.mergeProductCarbonCertificateApplicationTargets(
    [
      { accountId: '42', type: 'account' },
      { accountId: '51', type: 'account' },
    ],
    applications,
  );
  const identities = merged
    .filter(target => target.type === 'productCarbonCertificate')
    .map(target => target.productCarbonCertificateApplicationId);

  assert.deepEqual(identities, ['first', 'second', 'third']);
  const moduleSource = fs
    .readdirSync(path.join(root, moduleRoot), { recursive: true })
    .filter(name => /\.(ts|tsx)$/.test(name))
    .map(name => read(path.join(moduleRoot, name)))
    .join('\n');
  assert.ok(!/\.sort\s*\(/.test(moduleSource));
  assert.ok(!/\.reverse\s*\(/.test(moduleSource));
});

test('application history uses detail auditRecords and the Figma record card', () => {
  const component = read(`${moduleRoot}/components/ApplicationRecords.tsx`);
  const dataSource = read(`${moduleRoot}/data.ts`);
  const types = read(`${moduleRoot}/types.ts`);
  const page = read(`${moduleRoot}/index.tsx`);
  const stylesheet = read(`${moduleRoot}/index.module.less`);

  assert.ok(component.includes('info.auditRecords || []'));
  assert.ok(component.includes('auditRecords.map'));
  assert.ok(component.includes('state.submitted && version'));
  assert.ok(!component.includes('record.version == null ? index + 1'));
  assert.ok(!component.includes('info.records'));
  assert.ok(!component.includes('Timeline'));
  assert.ok(dataSource.includes('Array.isArray(source.auditRecords)'));
  assert.ok(!dataSource.includes('source.records'));
  assert.ok(types.includes('auditRecords?:'));
  assert.ok(!types.includes('records?: ProductCarbonCertificate'));
  assert.ok(page.includes('info.auditRecords?.length'));
  assert.ok(stylesheet.includes('border-bottom: 1px dashed'));
  assert.ok(stylesheet.includes('gap: 24px'));
  assert.ok(stylesheet.includes('flex: 0 0 112px'));
  assert.ok(stylesheet.includes('white-space: nowrap'));
  assert.ok(stylesheet.includes('.certificateTypeTag'));
  assert.ok(component.includes('record.actionName'));
  assert.ok(component.includes('record.operateTime'));
  assert.ok(component.includes('record.remark'));
  assert.ok(!component.includes('text.submitTime'));
  assert.ok(!component.includes('text.reviewTime'));
  assert.ok(component.includes('certificate-record-submitted.svg'));
  assert.ok(component.includes('certificate-record-approved.svg'));
  assert.ok(component.includes('certificate-record-rejected.svg'));
});

test('tabs are isolated by account and application identity', () => {
  assert.equal(
    tabs.getProductCarbonCertificateTabKey({
      accountId: '42',
      productCarbonCertificateApplicationId: '7',
    }),
    'productCarbonCertificate:42:7',
  );
  assert.notEqual(
    tabs.getProductCarbonCertificateTabKey({
      accountId: '42',
      productCarbonCertificateApplicationId: '7',
    }),
    tabs.getProductCarbonCertificateTabKey({
      accountId: '51',
      productCarbonCertificateApplicationId: '7',
    }),
  );
  assert.notEqual(
    tabs.getProductCarbonCertificateTabKey({
      accountId: '42',
      productCarbonCertificateTemporaryKey: 'draft:42',
    }),
    tabs.getProductCarbonCertificateTabKey({
      accountId: '51',
      productCarbonCertificateTemporaryKey: 'draft:51',
    }),
  );
  assert.equal(
    tabs.getProductCarbonCertificateAccountIdsKey([
      { accountId: '42', type: 'account' },
      { accountId: '51', type: 'report' },
      { accountId: '42', type: 'expertReview' },
      { accountId: 'enterprise', type: 'enterpriseCarbonAccounting' },
    ]),
    '42|51',
  );
});

test('entry is limited to editable desktop, non-share previews without permissions', () => {
  assert.equal(
    visibility.canDisplayProductCarbonCertificate(false, undefined, 1440),
    true,
  );
  assert.equal(
    visibility.canDisplayProductCarbonCertificate(true, undefined, 1440),
    false,
  );
  assert.equal(
    visibility.canDisplayProductCarbonCertificate(false, 'share-1', 1440),
    false,
  );
  assert.equal(
    visibility.canDisplayProductCarbonCertificate(false, undefined, 767),
    false,
  );
  assert.ok(!read(`${moduleRoot}/visibility.ts`).includes('permission'));
});

test('the four certificate states expose only their own controls', () => {
  assert.deepEqual(
    pageState.getProductCarbonCertificatePageState('not_submitted'),
    {
      approved: false,
      notSubmitted: true,
      pendingReview: false,
      rejected: false,
      showDownload: false,
      showForm: true,
      showPaymentSubmit: true,
      showRecords: false,
      showResubmit: false,
    },
  );
  assert.deepEqual(
    pageState.getProductCarbonCertificatePageState('pending_review'),
    {
      approved: false,
      notSubmitted: false,
      pendingReview: true,
      rejected: false,
      showDownload: false,
      showForm: false,
      showPaymentSubmit: false,
      showRecords: true,
      showResubmit: false,
    },
  );
  assert.equal(
    pageState.getProductCarbonCertificatePageState('consult_rejected')
      .showResubmit,
    true,
  );
  assert.equal(
    pageState.getProductCarbonCertificatePageState('consult_rejected')
      .showPaymentSubmit,
    false,
  );
  assert.equal(
    pageState.getProductCarbonCertificatePageState('approved').showDownload,
    true,
  );
  assert.equal(
    pageState.getProductCarbonCertificatePageState('approved').showResubmit,
    false,
  );
});

test('certificate module is independent from carbon label business code', () => {
  const files = fs
    .readdirSync(path.join(root, moduleRoot), { recursive: true })
    .filter(name => /\.(ts|tsx)$/.test(name));
  const source = files
    .map(name => read(path.join(moduleRoot, name)))
    .join('\n');

  assert.ok(!source.includes('ProductCarbonLabelApply'));
  assert.ok(!source.includes('/CarbonLabel/'));
  assert.ok(!source.includes('checkPermissions'));
  assert.ok(!source.includes('canSubmit'));
  assert.ok(!source.includes('disabledReason'));
  assert.ok(!source.includes('pointPaid'));
  assert.ok(!source.includes('snapshotData'));
});

test('live preview uses the Boss-style SVG certificate artwork', () => {
  const preview = read(`${moduleRoot}/components/CertificatePreview.tsx`);
  const artwork = read(`${moduleRoot}/components/CertificateArtwork.tsx`);
  const page = read(`${moduleRoot}/index.tsx`);
  const stylesheet = read(`${moduleRoot}/index.module.less`);
  const backgroundPath = path.join(
    root,
    moduleRoot,
    'assets/certificate-preview-background@2x.png',
  );
  const logoPath = path.join(
    root,
    moduleRoot,
    'assets/certificate-preview-logo.svg',
  );
  const dividerPath = path.join(
    root,
    moduleRoot,
    'assets/certificate-preview-divider.svg',
  );

  assert.ok(fs.existsSync(backgroundPath));
  assert.ok(fs.existsSync(logoPath));
  assert.ok(fs.existsSync(dividerPath));
  const backgroundBuffer = fs.readFileSync(backgroundPath);
  assert.equal(backgroundBuffer.readUInt32BE(16), 1190);
  assert.equal(backgroundBuffer.readUInt32BE(20), 1684);
  assert.ok(preview.includes('<CertificateArtwork'));
  assert.ok(preview.includes('certificateNo={info?.certificateNo}'));
  assert.ok(preview.includes('info?.resultFileName ||'));
  assert.ok(preview.includes("from 'react-pdf'"));
  assert.ok(preview.includes("'pdfjs-dist/build/pdf.worker.min.js'"));
  assert.ok(preview.includes('<CertificatePdfPreview url={resultUrl} />'));
  assert.ok(preview.includes("const resultUrl = info?.resultImageUrl || ''"));
  assert.ok(!preview.includes("replace(/^http:\\/\\//i, 'https://')"));
  assert.ok(!preview.includes('<iframe'));
  assert.ok(artwork.includes('certificate-preview-background@2x.png'));
  assert.ok(artwork.includes('certificate-preview-logo.svg'));
  assert.ok(artwork.includes('certificate-preview-divider.svg'));
  assert.ok(artwork.includes('<svg'));
  assert.ok(artwork.includes('viewBox={`0 0 ${CERTIFICATE_CANVAS_WIDTH}'));
  assert.ok(artwork.includes('onContentFitChange?.(contentFits)'));
  assert.ok(
    artwork.includes(
      "const safeText = (value?: string | null) => value?.trim() || '';",
    ),
  );
  assert.ok(!artwork.includes("return '-';"));
  assert.ok(artwork.includes("label='产品碳足迹'"));
  assert.ok(!artwork.includes("label='功能单位'"));
  assert.ok(!artwork.includes('translateBoundary'));
  assert.ok(!artwork.includes('translateEmission'));
  assert.ok(artwork.includes('accountingBoundaryEn'));
  assert.ok(artwork.includes('english={unitEmissionEn}'));
  assert.ok(preview.includes('info?.accountingBoundaryEn'));
  assert.ok(preview.includes('info?.unitEmissionEn'));
  assert.ok(artwork.includes('<CenteredSvgLines'));
  assert.equal(
    (artwork.match(/<tspan[\s\S]*?className=\{className\}/g) || []).length,
    2,
  );
  assert.ok(artwork.includes('formatDateZh(issueDate)'));
  assert.ok(artwork.includes('formatDateZh(validUntil)'));
  assert.ok(!preview.includes('certificate-preview-template.png'));
  assert.ok(!stylesheet.includes('.certificateBorder'));
  assert.ok(stylesheet.includes('.certificateCanvas'));
  assert.ok(stylesheet.includes('.certificateNumberPrimary'));
  assert.ok(stylesheet.includes('.certificateNumberSecondary'));
  assert.ok(stylesheet.includes('.certificateFactZh'));
  assert.ok(stylesheet.includes('.certificateDatePrimary'));
  assert.match(
    stylesheet,
    /\.certificateSheet[\s\S]*?width: 408px;[\s\S]*?max-width: 100%;[\s\S]*?aspect-ratio: 595 \/ 842;/,
  );
  assert.match(
    stylesheet,
    /\.certificateFactZh,[\s\S]*?\.certificateBoundaryZh[\s\S]*?font-size: 24px;/,
  );
  assert.match(
    stylesheet,
    /\.certificateFactEn,[\s\S]*?\.certificateBoundaryEn[\s\S]*?font-size: 18px;/,
  );
  assert.match(
    page,
    /disabled=\{[\s\S]*?submitting[\s\S]*?!previewContentFits[\s\S]*?\}/,
  );
  assert.ok(page.includes('previewContentTooLong'));
});

test('certificate submit keeps the source messageId through preview tabs', () => {
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );
  const activeTargetFlow = previewPane.slice(
    previewPane.indexOf('const activePreviewTarget'),
    previewPane.indexOf('const activeCarbonLabelSourceTarget'),
  );

  assert.ok(activeTargetFlow.includes('activePreviewTabItem.messageId'));
  assert.ok(activeTargetFlow.includes('activePreviewTabItem.sourceTarget?.messageId'));
  assert.ok(activeTargetFlow.includes('contextTarget?.messageId'));
});

test('rejected state follows the Figma footer without duplicate rejection notice', () => {
  const page = read(`${moduleRoot}/index.tsx`);
  const stylesheet = read(`${moduleRoot}/index.module.less`);

  assert.ok(!page.includes('WarningOutlined'));
  assert.ok(!page.includes('style.rejectAlert'));
  assert.ok(!page.includes('text.noRepayment'));
  assert.ok(!page.includes('text.resubmitHint'));
  assert.ok(page.includes('style.applicationCards'));
  assert.ok(page.includes('{rejected ? submitFooter : null}'));
  assert.ok(!page.includes('style.applicationCardRejected'));
  assert.match(
    stylesheet,
    /\.rejectedColumn[\s\S]*?\.applicationCards[\s\S]*?overflow-y: auto;[\s\S]*?> \.submitFooter/,
  );
  assert.match(
    stylesheet,
    /\.rejectedColumn[\s\S]*?grid-template-rows: minmax\(0, 1fr\) auto;/,
  );
  assert.match(
    stylesheet,
    /\.leftColumn[\s\S]*?height: 100%;[\s\S]*?max-height: 100%;[\s\S]*?overflow: hidden;/,
  );
  assert.match(
    stylesheet,
    /\.columns[\s\S]*?grid-template-rows: minmax\(0, 1fr\);/,
  );
  assert.ok(stylesheet.includes('@container (max-width: 760px)'));
  assert.ok(!stylesheet.includes('@container (max-width: 900px)'));
  assert.match(
    stylesheet,
    /@container \(max-width: 560px\)[\s\S]*?\.resubmitFooter[\s\S]*?align-items: center;[\s\S]*?justify-content: center;[\s\S]*?flex-direction: row;/,
  );
  assert.doesNotMatch(stylesheet, /\.resubmitFooter[\s\S]*?position: sticky/);
  assert.match(stylesheet, /\.resubmitFooter[\s\S]*?justify-content: center/);
  assert.match(stylesheet, /\.resubmitFooter[\s\S]*?min-width: 224px/);
  assert.match(
    stylesheet,
    /\.certificateDatePrimary[\s\S]*?fill: #313333;[\s\S]*?font-size: 22px;/,
  );
  assert.match(
    stylesheet,
    /\.certificateSmallEn[\s\S]*?fill: #808080;[\s\S]*?font-size: 18px;/,
  );
  assert.match(
    stylesheet,
    /\.statusRejected[\s\S]*?color: #04252b[\s\S]*?background: #f9e7e6/,
  );
});

test('certificate form follows the merged Figma layout and Ant Design date control', () => {
  const form = read(`${moduleRoot}/components/ApplicationForm.tsx`);
  const page = read(`${moduleRoot}/index.tsx`);
  const preview = read(`${moduleRoot}/components/CertificatePreview.tsx`);
  const stylesheet = read(`${moduleRoot}/index.module.less`);

  assert.ok(form.includes("import { DatePicker, Form, Input } from 'antd'"));
  assert.ok(!form.includes('RangePicker'));
  assert.ok(!form.includes("type='date'"));
  assert.ok(form.includes('style.fieldPair'));
  assert.ok(!form.includes('supplementalFields'));
  assert.ok(page.includes('certificate-header-icon.svg'));
  assert.ok(page.includes('certificate-points-icon.svg'));
  assert.ok(preview.includes('certificate-download-icon.svg'));
  assert.ok(!page.includes('SafetyCertificateOutlined'));
  assert.ok(!preview.includes('DownloadOutlined'));
  assert.ok(
    stylesheet.includes(
      'grid-template-columns: minmax(400px, 1fr) minmax(354px, 440px)',
    ),
  );
  assert.ok(stylesheet.includes('width: 408px'));
});

test('model-owned certificate fields are read-only and have no required marker', () => {
  const form = read(`${moduleRoot}/components/ApplicationForm.tsx`);
  const unitEmissionField = form.slice(
    form.indexOf('<FieldLabel>{text.unitEmission}</FieldLabel>'),
    form.indexOf('<FieldLabel>{text.accountingStandard}</FieldLabel>'),
  );
  const accountingStandardField = form.slice(
    form.indexOf('<FieldLabel>{text.accountingStandard}</FieldLabel>'),
    form.indexOf('<FieldLabel>{text.certificateType}</FieldLabel>'),
  );
  const certificateTypeField = form.slice(
    form.indexOf('<FieldLabel>{text.certificateType}</FieldLabel>'),
    form.indexOf('<FieldLabel>{text.accountingBoundary}</FieldLabel>'),
  );
  const accountingBoundaryField = form.slice(
    form.indexOf('<FieldLabel>{text.accountingBoundary}</FieldLabel>'),
  );

  [unitEmissionField, accountingStandardField, accountingBoundaryField].forEach(
    field => {
      assert.ok(field.includes('readOnly'));
      assert.ok(!field.includes('rules={[requiredRule('));
      assert.ok(!field.includes('<FieldLabel required>'));
    },
  );
  assert.ok(certificateTypeField.includes('readOnly'));
  assert.ok(certificateTypeField.includes('value={text.certificateTypeValue}'));
  assert.ok(!certificateTypeField.includes("name='certificateType'"));
});

test('functional unit is a visible editable required field', () => {
  const form = read(`${moduleRoot}/components/ApplicationForm.tsx`);
  const functionalUnitField = form.slice(
    form.indexOf('<FieldLabel required>{text.functionalUnit}</FieldLabel>'),
    form.indexOf('<FieldLabel required>{text.accountingPeriod}</FieldLabel>'),
  );

  assert.ok(!form.includes("<Form.Item hidden name='functionalUnit'"));
  assert.ok(functionalUnitField.includes("name='functionalUnit'"));
  assert.ok(
    functionalUnitField.includes('rules={[requiredRule(text.functionalUnit)]}'),
  );
  assert.ok(functionalUnitField.includes('placeholder={text.functionalUnit}'));
  assert.ok(!functionalUnitField.includes('readOnly'));
});

test('every required certificate field has a localized field-specific message', () => {
  const form = read(`${moduleRoot}/components/ApplicationForm.tsx`);
  const zhCN = read('src/lang/zh-CN/carbonAgent.ts');

  for (const field of [
    'productName',
    'productNameEn',
    'specification',
    'specificationEn',
    'applicantCompanyName',
    'companyNameEn',
    'companyAddress',
    'companyAddressEn',
    'functionalUnit',
  ]) {
    assert.ok(
      form.includes(`rules={[requiredRule(text.${field})]}`),
      `${field} should use its localized label`,
    );
  }

  assert.ok(
    form.includes('rules={[requiredDateRule(text.accountingStartDate)]}'),
  );
  assert.ok(
    form.includes('rules={[requiredDateRule(text.accountingEndDate)]}'),
  );
  assert.ok(zhCN.includes("requiredInput: '请输入{val1}'"));
  assert.ok(zhCN.includes("requiredSelect: '请选择{val1}'"));
});

test('accounting period stays editable and matches the carbon label date fields', () => {
  const form = read(`${moduleRoot}/components/ApplicationForm.tsx`);
  const periodField = form.slice(
    form.indexOf('<FieldLabel required>{text.accountingPeriod}</FieldLabel>'),
    form.indexOf('<FieldLabel>{text.unitEmission}</FieldLabel>'),
  );

  assert.ok(form.includes('certificate-calendar-icon.svg'));
  assert.equal((periodField.match(/<DatePicker/g) || []).length, 2);
  assert.ok(periodField.includes('className={style.period}'));
  assert.ok(periodField.includes('<span>{text.to}</span>'));
  assert.ok(periodField.includes("format='YYYY-MM-DD'"));
  assert.ok(periodField.includes('disabled={disabled}'));
  assert.ok(periodField.includes('disabledDate='));
  assert.ok(periodField.includes('suffixIcon='));
  assert.ok(periodField.includes('updatePeriod'));
  assert.ok(!periodField.includes('readOnly'));
  assert.ok(
    form.indexOf('<FieldLabel required>{text.functionalUnit}</FieldLabel>') <
      form.indexOf('<FieldLabel required>{text.accountingPeriod}</FieldLabel>'),
  );
  assert.ok(
    form.indexOf('<FieldLabel required>{text.accountingPeriod}</FieldLabel>') <
      form.indexOf('<FieldLabel>{text.unitEmission}</FieldLabel>'),
  );
});

test('certificate tab keeps all review menu entries and activates on creation', () => {
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );
  const carbonLabelVisibility = previewPane.slice(
    previewPane.indexOf('const showCarbonLabelEntry'),
    previewPane.indexOf('const showProductCarbonCertificateEntry'),
  );
  const openFlow = previewPane.slice(
    previewPane.indexOf('const handleProductCarbonCertificateOpen'),
    previewPane.indexOf('const handleProductCarbonCertificateSubmitted'),
  );
  const resolvedTargetFlow = openFlow.slice(
    openFlow.indexOf('const resolvedKey ='),
    openFlow.indexOf('if (shouldKeepCertificateFocused) {\n        setActiveTab'),
  );

  assert.ok(carbonLabelVisibility.includes("'productCarbonCertificate'"));
  assert.ok(
    resolvedTargetFlow.indexOf(
      'pendingProductCarbonCertificateTabKeyRef.current = resolvedKey',
    ) < resolvedTargetFlow.indexOf('setLocalProductCarbonCertificateTargets'),
  );
  assert.ok(previewPane.includes('setActiveTab(pendingCertificateTabKey)'));
  assert.ok(
    previewPane.includes(
      'previewTabs.some(tab => tab.key === currentTab) ? currentTab : defaultTab',
    ),
  );
  assert.ok(
    previewPane.includes('appliedActiveTabRequestIdentityRef.current'),
  );
  assert.ok(
    previewPane.includes(
      'appliedActiveTabRequestIdentityRef.current === requestIdentity',
    ),
  );
  assert.ok(
    previewPane.indexOf(
      'appliedActiveTabRequestIdentityRef.current = requestIdentity',
    ) < previewPane.indexOf('setActiveTab(resolvedActiveTabKey)'),
  );
  assert.ok(
    openFlow.includes(
      'focusedProductCarbonCertificateAccountIdRef.current = targetAccountId',
    ),
  );
  assert.ok(
    openFlow.includes(
      'focusedProductCarbonCertificateAccountIdRef.current ===',
    ),
  );
  assert.ok(!openFlow.includes('existingApplicationTab'));
  assert.ok(!openFlow.includes("productCarbonCertificateStatus !== 'approved'"));
  assert.ok(
    !openFlow.includes('localDraft?.productCarbonCertificatePrepared'),
  );
  assert.ok(
    openFlow.indexOf('await resolveProductCarbonCertificateEntry') <
      openFlow.indexOf('setLocalProductCarbonCertificateTargets'),
  );
});

test('carbon certificate does not disable or replace the carbon label menu action', () => {
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );
  const reviewMenu = previewPane.slice(
    previewPane.indexOf("role='menu'"),
    previewPane.indexOf('aria-label={\n              fullscreen'),
  );
  const carbonLabelMenuItem = reviewMenu.slice(
    reviewMenu.indexOf('{showCarbonLabelEntry'),
    reviewMenu.indexOf('{showProductCarbonCertificateEntry'),
  );
  const certificateMenuItem = reviewMenu.slice(
    reviewMenu.indexOf('{showProductCarbonCertificateEntry'),
  );

  assert.equal(
    previewPane.match(/className=\{style\.previewReviewCertificationMenu\}/g)
      ?.length,
    1,
  );
  assert.ok(
    carbonLabelMenuItem.includes(
      'onCarbonLabelOpen?.(activeCarbonLabelSourceTarget)',
    ),
  );
  assert.ok(!carbonLabelMenuItem.includes('disabled='));
  assert.ok(
    certificateMenuItem.includes(
      'handleProductCarbonCertificateOpen(activePreviewTarget)',
    ),
  );
});

test('carbon label receives the accounting target when opened from a certificate tab', () => {
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );
  const sourceTargetFlow = previewPane.slice(
    previewPane.indexOf('const activeCarbonLabelSourceTarget'),
    previewPane.indexOf('let activeExpertReviewOpen'),
  );
  const carbonAgentPage = read('src/views/system/carbonAgent/index.tsx');
  const carbonLabelOpenFlow = carbonAgentPage.slice(
    carbonAgentPage.indexOf('const handlePreviewCarbonLabelOpen'),
    carbonAgentPage.indexOf('const handlePreviewCarbonLabelSubmitted'),
  );

  assert.ok(
    sourceTargetFlow.includes(
      "activePreviewTabItem?.kind !== 'productCarbonCertificate'",
    ),
  );
  assert.ok(sourceTargetFlow.includes("tab.kind === 'account'"));
  assert.ok(sourceTargetFlow.includes("type: 'account'"));
  assert.ok(!carbonLabelOpenFlow.includes("'productCarbonCertificate'"));
});

test('certificate entry follows prepare(false), then prepare(true) only after approval', async () => {
  const calls = [];
  const makeEntry = current =>
    load(`${moduleRoot}/entry.ts`, {
      './data': {
        isProductCarbonCertificateApproved: application =>
          application.status === 'approved',
        prepareProductCarbonCertificateApplication: async (
          accountId,
          forceNew,
        ) => {
          calls.push([accountId, forceNew]);
          return forceNew
            ? { ...values, accountId, status: 'not_submitted' }
            : current;
        },
      },
    });

  const existing = await makeEntry({
    ...values,
    accountId: '42',
    id: '7',
    status: 'pending_review',
  }).resolveProductCarbonCertificateEntry('42');
  assert.equal(existing.kind, 'existing');
  assert.equal(existing.application.id, '7');
  assert.deepEqual(calls.splice(0), [['42', false]]);

  const afterApproval = await makeEntry({
    ...values,
    accountId: '42',
    id: '8',
    status: 'approved',
  }).resolveProductCarbonCertificateEntry('42');
  assert.equal(afterApproval.kind, 'new');
  assert.equal(afterApproval.application.id, undefined);
  assert.deepEqual(calls.splice(0), [
    ['42', false],
    ['42', true],
  ]);

  const first = await makeEntry({
    ...values,
    accountId: '42',
    id: null,
    status: 'not_submitted',
  }).resolveProductCarbonCertificateEntry('42');
  assert.equal(first.kind, 'new');
  assert.deepEqual(calls.splice(0), [['42', false]]);
});

test('submit refreshes detail and resubmit keeps the original ID without prepare', () => {
  const source = read(
    `${moduleRoot}/useProductCarbonCertificateApplication.ts`,
  );
  const submitSource = source.slice(
    source.indexOf('const submit = async'),
    source.indexOf('const editable ='),
  );

  assert.ok(!source.includes('prepareProductCarbonCertificateApplication'));
  assert.ok(!source.includes('getProductCarbonCertificateList'));
  assert.ok(!source.includes('latest'));
  assert.ok(!source.includes('point-cost'));
  assert.match(source, /resubmission \? detailId : undefined/);
  assert.ok(submitSource.includes('setDetailReload(value => value + 1)'));
  assert.ok(submitSource.includes('setDetailId(nextId)'));
  assert.ok(!submitSource.includes('setInfo(data.data)'));
});

test('request failures do not gate the certificate page or add local retry UI', () => {
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );
  const openFlow = previewPane.slice(
    previewPane.indexOf('const handleProductCarbonCertificateOpen'),
    previewPane.indexOf('const handleProductCarbonCertificateSubmitted'),
  );
  const page = read(`${moduleRoot}/index.tsx`);
  const detailHook = read(
    `${moduleRoot}/useProductCarbonCertificateApplication.ts`,
  );

  assert.ok(openFlow.includes('setLocalProductCarbonCertificateTargets'));
  assert.ok(openFlow.includes('setActiveTab'));
  assert.ok(
    openFlow.indexOf('await resolveProductCarbonCertificateEntry') <
      openFlow.indexOf('setLocalProductCarbonCertificateTargets'),
  );
  assert.ok(openFlow.includes('const fallbackTarget: PreviewPaneTarget'));
  assert.ok(openFlow.includes('setActiveTab(fallbackKey)'));
  assert.ok(openFlow.includes('productCarbonCertificateInitializing: false'));
  assert.ok(!openFlow.includes('ensureProductCarbonCertificateApplications'));
  assert.ok(!openFlow.includes('antdMessage'));
  assert.ok(page.includes('const { showForm } = pageState;'));
  assert.ok(!page.includes('retryLoad'));
  assert.ok(!page.includes('retryDetail'));
  assert.ok(!detailHook.includes('setLoadError'));
  assert.ok(!detailHook.includes('retryLoad'));
  assert.ok(detailHook.includes('保留现有页面和数据'));
});

test('missing submit IDs stay locked without inventing list recovery state', () => {
  const detailHook = read(
    `${moduleRoot}/useProductCarbonCertificateApplication.ts`,
  );
  const previewPane = read(
    'src/views/system/carbonAgent/components/PreviewPane.tsx',
  );

  assert.ok(detailHook.includes('setSubmissionLocked(true)'));
  assert.ok(detailHook.includes('setSubmitError(text.missingId)'));
  assert.ok(!detailHook.includes('onSubmissionMissingId'));
  assert.ok(
    !previewPane.includes('productCarbonCertificateKnownApplicationIds'),
  );
  assert.ok(
    !previewPane.includes('productCarbonCertificateSubmissionMissingId'),
  );
});
