// node --test scripts/test-cbam-monitor.cjs
// 执行真实协议解析和请求函数，隔离全局登录与浏览器依赖。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.join(__dirname, '../src/views/system/carbonAgent/monitor');
function load(name, stubs = {}) {
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync(path.join(root, `${name}.ts`), 'utf8'),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    process,
    Blob,
    URL,
    require: key => {
      if (key in stubs) return stubs[key];
      if (key === './json') return load('json');
      throw new Error(`Unexpected dependency: ${key}`);
    },
  });
  return exports;
}
const { parseMonitorJson } = load('json');
const { monitorResult, monitorToolResult, monitorCards, isMonitorCard } =
  load('results');
const { monitorCardSnapshot } = load('results');
const { resolveMonitorMaterialOrigin, resolveAddedMaterialOrigin } = load('materialOrigin');

test('材料卡文件后通过继续添加或输入框加号追加，提交仍属于原材料卡', () => {
  const origin = { entry: 'monitor_material_advice_card', cardId: 'c1', originMessageId: 'm1' };
  const zip = { status: 'done', fileId: 'zip1', materialOrigin: origin, materialOriginSessionId: 's1' };
  for (const entry of ['queue-add', 'composer-plus']) {
    const added = resolveAddedMaterialOrigin([zip], 's1');
    const image = { status: 'done', fileId: entry, materialOrigin: added, materialOriginSessionId: 's1' };
    assert.equal(added, origin);
    assert.equal(resolveMonitorMaterialOrigin([zip, image], 's1'), origin);
  }
});

test('追加时保留上传中和失败附件来源，清空队列后无残留，普通上传不变', () => {
  const origin = { entry: 'monitor_material_advice_card', cardId: 'c1', originMessageId: 'm1' };
  for (const status of ['uploading', 'error', 'done']) {
    assert.equal(resolveAddedMaterialOrigin([{ status, materialOrigin: origin, materialOriginSessionId: 's1' }], 's1'), origin);
  }
  assert.equal(resolveAddedMaterialOrigin([], 's1'), undefined);
  assert.equal(resolveAddedMaterialOrigin([{ status: 'done', fileId: 'plain' }], 's1'), undefined);
});

test('追加不覆盖显式卡片来源，不从混合、失效或跨会话队列推断目标', () => {
  const origin = { entry: 'monitor_material_advice_card', cardId: 'c1', originMessageId: 'm1', planId: 'p1' };
  const file = { status: 'done', fileId: 'f1', materialOrigin: origin, materialOriginSessionId: 's1' };
  const other = { ...origin, cardId: 'c2', planId: 'p2' };
  assert.equal(resolveAddedMaterialOrigin([file], 's1', other), other);
  assert.throws(() => resolveMonitorMaterialOrigin([file, { ...file, materialOrigin: other }], 's1'), /CONFLICTING/);
  assert.throws(() => resolveAddedMaterialOrigin([file], 's2'), /INVALID/);
  assert.throws(() => resolveAddedMaterialOrigin([file]), /INVALID/);
  assert.throws(() => resolveAddedMaterialOrigin([file, { status: 'uploading' }], 's1'), /CONFLICTING/);
  assert.throws(() => resolveAddedMaterialOrigin([{ ...file, materialOrigin: { ...origin, originMessageId: undefined } }], 's1'), /INVALID/);
});

test('运营报告材料卡追加保留 taskId 和 operationId，不混入计划目标', () => {
  const origin = { entry: 'operation_material_advice_card', cardId: 'o1', originMessageId: 'm1', taskId: 't1', operationId: 'r1' };
  const file = { status: 'done', fileId: 'f1', materialOrigin: origin, materialOriginSessionId: 's1' };
  assert.equal(resolveAddedMaterialOrigin([file], 's1'), origin);
  assert.throws(() => resolveAddedMaterialOrigin([{ ...file, materialOrigin: { ...origin, planId: 'p1' } }], 's1'), /INVALID/);
});

test('材料卡来源随附件保留，重试一致，移除附件后不残留', () => {
  const origin = { entry: 'monitor_material_advice_card', cardId: 'c1', originMessageId: 'm1' };
  const file = { status: 'done', fileId: 'f1', materialOrigin: origin, materialOriginSessionId: 's1' };
  assert.equal(resolveMonitorMaterialOrigin([file], 's1'), origin);
  assert.equal(resolveMonitorMaterialOrigin([file, {...file, fileId: 'f2'}], 's1'), origin);
  assert.equal(resolveMonitorMaterialOrigin([], 's1'), undefined);
  assert.equal(resolveMonitorMaterialOrigin([{...file, status: 'error'}], 's1'), undefined);
});

test('跨会话、混合卡片和输入框材料不能静默写入某个计划', () => {
  const file = { status: 'done', fileId: 'f1', materialOriginSessionId: 's1',
    materialOrigin: { entry: 'monitor_material_advice_card', cardId: 'c1', originMessageId: 'm1', planId: 'p1' } };
  assert.throws(() => resolveMonitorMaterialOrigin([file], 's2'), /INVALID_MATERIAL_ORIGIN/);
  assert.throws(() => resolveMonitorMaterialOrigin([file, {status: 'done', fileId: 'f2'}], 's1'), /CONFLICTING/);
  assert.throws(() => resolveMonitorMaterialOrigin([file, {...file, materialOrigin: {...file.materialOrigin, cardId: 'c2'}}], 's1'), /CONFLICTING/);
  assert.throws(() => resolveMonitorMaterialOrigin([{...file, materialOrigin: {...file.materialOrigin, originMessageId: undefined}}], 's1'), /INVALID/);
  assert.equal(resolveMonitorMaterialOrigin([{status: 'done', fileId: 'f2'}], 's1').entry, 'composer');
});

const currentCopy = { language: 'current' };
const englishCopy = { language: 'en' };
const chineseCopy = { language: 'zh' };
const { monitorCardCopy, splitMonitorMaterial } = load('materialAdvice', {
  '@src/lang/I18N': { cbamMonitor: currentCopy },
  '@src/lang/en-US/cbamMonitor': englishCopy,
  '@src/lang/zh-CN/cbamMonitor': chineseCopy,
});

test('材料分列保留中英文说明、适用条件和旧版无标签内容', () => {
  for (const [source, information, materials] of [
    ['需要的信息：计划名称、年度。\n\n材料名称：已有计划。首次编制不需要历史版本。', '计划名称、年度。', '已有计划。首次编制不需要历史版本。'],
    ['Information needed: Year and dates. Materials: Existing plan. No historical version is required for a first plan.', 'Year and dates.', 'Existing plan. No historical version is required for a first plan.'],
    ['设备清单、校准记录', undefined, '设备清单、校准记录'],
  ]) {
    const actual = splitMonitorMaterial(source);
    assert.equal(actual.information, information);
    assert.equal(actual.materials, materials);
  }
});

test('英文历史卡配套标题跟随卡片语言，无语言的旧卡沿用当前页面语言', () => {
  assert.equal(monitorCardCopy('en'), englishCopy);
  assert.equal(monitorCardCopy('EN'), englishCopy);
  assert.equal(monitorCardCopy('zh'), chineseCopy);
  assert.equal(monitorCardCopy(), currentCopy);
});

test('历史完整快照可直接展示，卡片引用、错配或失败不能冒充完整数据', () => {
  const snapshot = { cardId: 'c1', cardType: 'cbam2_monitor_plan', dataVersion: 8,
    completion: { completedCount: 5, totalCount: 22, completionRate: 22.73 } };
  const result = monitorResult({ card: { cardId: 'c1', cardResolved: true, resolvedCard: snapshot } });
  assert.equal(monitorCardSnapshot(result).dataVersion, 8);
  assert.equal(monitorCardSnapshot(result).completion.completedCount, 5);
  assert.equal(monitorCardSnapshot({ ...result, cardId: 'other' }), undefined);
  assert.equal(monitorCardSnapshot({ ...result, cardResolveError: 'UNAVAILABLE' }), undefined);
  assert.equal(monitorCardSnapshot({ cardId: 'c1', display: { cardId: 'c1' } }), undefined);
});
const tool = (payload, status = 'SUCCESS') => ({
  toolName: 'cbam_monitor_plan_progress',
  status,
  payload,
  messageId: 'm1',
  orderNo: 7,
});

test('Long 精度、小数、零和字符串内容保持正确', () => {
  const value = parseMonitorJson(
    '{"planId":9223372036854775807,"n":-9223372036854775807,"v":0,"rate":45.45,"exp":1e2,"text":"plan 9223372036854775807"}',
  );
  assert.equal(value.planId, '9223372036854775807');
  assert.equal(value.n, '-9223372036854775807');
  assert.equal(value.v, 0);
  assert.equal(value.rate, 45.45);
  assert.equal(value.exp, 100);
  assert.equal(value.text, 'plan 9223372036854775807');
});
test('MCP 文本和多层输出保持计划 ID，拒绝请求参数和失败结果', () => {
  assert.equal(
    monitorResult({
      content: [
        {
          type: 'text',
          text: '{"success":true,"data":{"planId":9223372036854775807,"saved":true}}',
        },
      ],
    }).planId,
    '9223372036854775807',
  );
  assert.equal(
    monitorResult({ input: { planId: '123', saved: true } }),
    undefined,
  );
  assert.equal(
    monitorResult({ success: false, data: { saved: true, planId: '123' } }),
    undefined,
  );
  assert.equal(monitorResult({ code: 500, data: { cardId: 'c1' } }), undefined);
  assert.equal(
    monitorResult({ isError: true, content: [{ text: '{"cardId":"c1"}' }] }),
    undefined,
  );
  assert.equal(
    monitorResult({ saved: true, planId: Number.MAX_SAFE_INTEGER + 1 }),
    undefined,
  );
});
test('仅成功监测工具生成卡片，宿主卡片和重放事件去重', () => {
  const result = {
    display: { cardId: 'c1', cardType: 'cbam_monitor_material_advice' },
  };
  for (const status of ['FAILED', 'RUNNING', 'ERROR'])
    assert.equal(monitorToolResult(tool(result, status)), undefined);
  assert.equal(
    monitorToolResult({ ...tool(result), toolName: 'unrelated_tool' }),
    undefined,
  );
  const cards = monitorCards([], [tool(result), tool(result)]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].cardType, 'cbam_monitor_material_advice');
  assert.equal(monitorCards(cards, [tool(result)]).length, 1);
  assert.equal(isMonitorCard({ card: { safePayload: result } }), true);
  assert.equal(
    monitorResult({ cardType: 'cbam2_monitor_plan', planId: '123' }).planId,
    '123',
  );
});
test('刷新后的 business_card 包装识别无 cardId 的报告并与工具结果去重', () => {
  const report = {fileId: '2099079526064312321', fileStatus: 'READY', sourceDataVersion: 10};
  const historical = {cardType: 'business_card', card: {eventType: 'business_card', cardType: 'cbam_monitor_report', card: report}};
  assert.equal(isMonitorCard(historical), true);
  assert.equal(monitorResult(historical.card).fileId, report.fileId);
  assert.equal(monitorCards([historical], [tool(report)]).length, 1);
  assert.equal(isMonitorCard({cardType: 'business_card', card: {cardType: 'unrelated', card: report}}), false);
});

function service(response) {
  const calls = [];
  const downloads = [];
  const api = load('service', {
    '@src/api/request': { baseURL: '/api' },
    '@src/lang/I18N': {
      cbamMonitor: {
        agentLoadFailed: 'load failed',
        agentDownloadFailed: 'download failed',
      },
    },
    '@src/router/localePath': { getLocaleCodeFromPathname: () => 'en' },
    axios: {
      request: async options => {
        calls.push(options);
        return { data: response };
      },
    },
    'file-saver': (...args) => downloads.push(args),
  });
  return { api, calls, downloads };
}
test('卡片和会话请求在正文传递会话，不添加跨域受限头或越权字段', async () => {
  const { api, calls } = service({
    code: 200,
    data: { success: true, data: { intakeId: 'i1' } },
  });
  await api.readMonitorCard('s1', '9223372036854775807');
  const body = calls[0].data;
  assert.equal(body.resourceId, '9223372036854775807');
  assert.equal(body.sessionId, 's1');
  assert.equal(body.lang, 'en');
  assert.equal(body.companyId, undefined);
  assert.equal(body.confirmed, undefined);
  assert.equal(calls[0].headers?.['X-Agent-Session-Id'], undefined);
  assert.equal(calls[0].headers?.['X-Agent-Internal-Key'], undefined);
  await api.readMonitorSession('s2', 3);
  assert.equal(calls[1].data.sessionId, 's2');
  assert.equal(calls[1].data.monitorPageNum, 3);
  assert.equal(calls[1].headers?.['X-Agent-Session-Id'], undefined);
});
test('业务失败不能作为成功数据返回', async () => {
  const { api } = service({
    code: 200,
    data: { success: false, message: 'binding pending' },
  });
  await assert.rejects(api.readMonitorSession('s1'), /binding pending/);
});
test('下载固定会话资源入口，拒绝 JSON 错误与空文件', async () => {
  for (const blob of [
    new Blob([], { type: 'application/octet-stream' }),
    new Blob(['{"code":403}'], { type: 'application/json' }),
  ]) {
    const { api, downloads } = service(blob);
    await assert.rejects(
      api.downloadMonitorReport('s1', 'f1'),
      /download failed/,
    );
    assert.equal(downloads.length, 0);
  }
  const { api, calls, downloads } = service(
    new Blob(['docx fixture'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
  );
  await api.downloadMonitorReport('s1', 'f1', 'report.docx');
  assert.equal(
    calls[0].url,
    '/cbam2/agent/internal/skills/cbam2/monitor/report/download',
  );
  assert.equal(calls[0].data.resourceId, 'f1');
  assert.equal(calls[0].data.sessionId, 's1');
  assert.equal(calls[0].headers?.['X-Agent-Session-Id'], undefined);
  assert.equal(downloads[0][1], 'report.docx');
});

test('报告预览只使用当前会话的已发布只读资源并校验返回身份和地址', async () => {
  const valid = { fileId: 'f1', fileStatus: 'READY', readonly: true, reportUrl: 'https://files.example/report.docx' };
  const response = value => ({ code: 200, data: { success: true, data: value } });
  const { api, calls } = service(response(valid));
  assert.equal((await api.readMonitorReportPreview('s1', 'f1')).reportUrl, valid.reportUrl);
  assert.equal(calls[0].url, '/cbam2/agent/internal/skills/cbam2/monitor/report/preview');
  assert.equal(calls[0].data.sessionId, 's1');
  assert.equal(calls[0].data.resourceId, 'f1');
  for (const patch of [{fileId:'other'}, {fileStatus:'UPLOADED'}, {readonly:false},
    {reportUrl:'javascript:alert(1)'}, {reportUrl:'https://user:password@files.example/report.docx'}]) {
    await assert.rejects(service(response({...valid,...patch})).api.readMonitorReportPreview('s1','f1'));
  }
});
