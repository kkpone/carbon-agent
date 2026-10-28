// node --test scripts/test-cbam-history-download.cjs
// 执行真实的历史转换、卡片识别和下载分流函数，不依赖服务或浏览器。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.join(__dirname, '../src/views/system/carbonAgent');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
const slice = (text, start, end) => {
  assert.ok(text.includes(start) && text.includes(end));
  return text.slice(text.indexOf(start), text.indexOf(end));
};
function evaluate(text, deps = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(text, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText, {
    exports,
    require: name => {
      if (name in deps) return deps[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const helper = evaluate(source('cbamHistoryTools.ts'));
const json = evaluate(source('monitor/json.ts'));
const monitor = evaluate(source('monitor/results.ts'), { './json': json });
const service = source('service.ts');
const history = evaluate(`
import {isCbamHistoryTool, mergeCbamHistoryTools} from './cbamHistoryTools';
const asString = v => typeof v === 'string' ? v : '';
const asNumber = v => typeof v === 'number' ? v : undefined;
const asRecord = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const parseJsonRecord = v => v ? JSON.parse(v) : {};
const getEventMessage = e => e.message;
const getEventTitle = e => e.title;
${slice(service, 'const getTimelineItems =', 'const findTimelineBlockOrder =')}
${slice(service, 'const getToolCallId =', 'const normalizeTraceErrorCard =')}
export {normalizeTraceToolCalls, normalizeTraceToolCall, buildTraceTimelineIndex, mergeToolCalls, getToolCallSortOrder};
`, { './cbamHistoryTools': helper });
const answer = source('components/AnswerMessage.tsx');
const artifacts = evaluate(`
import {monitorToolResults} from '../monitor/results';
const asRecord = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const parseJsonRecord = v => {try {return asRecord(typeof v === 'string' ? JSON.parse(v) : v);} catch {return {};}};
const getOptionalScalarString = v => typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;
const getFileNameFromPath = v => v ? v.split('/').pop() : undefined;
const getNumberValue = v => typeof v === 'number' ? v : undefined;
const I18N = {carbonAgent:{mdDownloadFile:'download'}};
${slice(answer, 'const normalizeWorkspaceArtifactExport =', 'const CCDB_SEARCH_FIELD_PATTERNS:')}
export {getWorkspaceArtifactExportResult};
`, { '../monitor/results': monitor });
const operationDownload = evaluate(source('operation/reportDownload.ts'));
const plain = value => JSON.parse(JSON.stringify(value));
const receipt = {fileId:'2100168158284779522',fileName:'monitor.docx',fileStatus:'READY',planId:'3100035',size:46720};
const access = {method:'POST',path:'/cbam2/agent/internal/skills/cbam2/operation-report/report/download',
  body:{sessionId:'s1',operationId:73,dataVersion:0,language:'ZH'}};
function scenario(name = 'agent_cbam_monitor_report_generate', result = receipt) {
  const defs = [
    [182,150,'before','RUNNING',{}],
    [188,210,'before','SUCCESS',{autoClosed:true}],
    [190,10,'confirmed','SUCCESS',result],
  ];
  const events = defs.map(([sequenceNo,orderNo,messageId,status,payload]) => ({
    sequenceNo,messageId,status,toolName:name,eventId:`event-${sequenceNo}`,visible:1,
    eventType: status === 'RUNNING' ? 'tool_call_start' : 'tool_call_success',
    safePayloadJson:JSON.stringify({safePayload:{toolCallId:'shared-call',...payload}}),
  }));
  const turns = ['before','confirmed'].map(messageId => ({messageId,payload:{timeline:
    defs.filter(d=>d[2]===messageId).map(d=>({eventId:`event-${d[0]}`,orderNo:d[1]}))}}));
  return {events, index:history.buildTraceTimelineIndex(turns)};
}
test('监测报告跨确认轮次：按事件顺序恢复文件，卡片挂在确认消息', () => {
  const {events,index}=scenario();
  const tools=history.normalizeTraceToolCalls(events,index);
  assert.equal(tools.length,1);
  assert.equal(tools[0].sequenceNo,190);
  assert.equal(tools[0].messageId,'confirmed');
  assert.equal(tools[0].orderNo,10);
  const cards=monitor.monitorCards([],tools);
  assert.equal(cards.length,1);
  assert.equal(cards[0].card.fileId,receipt.fileId);
  assert.equal(cards[0].messageId,'confirmed');
  assert.deepEqual(plain(history.normalizeTraceToolCalls([...events].reverse(),index)),plain(tools));
});
test('运营报告恢复受控下载入口，版本0有效，拒绝跨会话', () => {
  const {events,index}=scenario('agent_cbam_operation_report_generate',{success:true,access});
  const [tool]=history.normalizeTraceToolCalls(events,index);
  assert.equal(tool.sequenceNo,190);
  assert.deepEqual(plain(operationDownload.getOperationReportDownloadAccess(tool.payload,'s1')),
    {...access,body:{...access.body,operationId:'73'}});
  assert.equal(operationDownload.getOperationReportDownloadAccess(tool.payload,'s2'),undefined);
});

test('运营报告新文件回执经过历史恢复后仍可下载', () => {
  const published = {fileId:'9007199254740993',operationId:'73',fileName:'operation.docx',
    sourceDataVersion:0,fileStatus:'READY',downloadRegistered:true,
    access:{method:'POST',path:'/cbam2/agent/internal/skills/cbam2/operation-report/v1.1/report/download',
      body:{sessionId:'s1',resourceId:'9007199254740993'}}};
  const {events,index}=scenario('agent_cbam_operation_report_generate',{success:true,data:published});
  const [tool]=history.normalizeTraceToolCalls(events,index);
  const downloaded=operationDownload.getOperationReportDownloadAccess(tool.payload,'s1');
  assert.equal(downloaded.fileId,published.fileId);
  assert.equal(downloaded.sourceDataVersion,0);
  assert.deepEqual(plain(downloaded.body),published.access.body);
});
test('迟到自动结束或开始不能覆盖真实成功，也不能覆盖真实失败', () => {
  for (const status of ['SUCCESS','FAILED']) {
    const {events,index}=scenario();
    events[2].status=status;
    events[2].eventType=status==='FAILED'?'tool_call_error':'tool_call_success';
    if(status==='FAILED') events[2].safePayloadJson=JSON.stringify({safePayload:{toolCallId:'shared-call',success:false,message:'failed'}});
    for (const old of [events[0],events[1]]) {
      events.push({...old,eventId:`late-${old.sequenceNo}`,sequenceNo:200+old.sequenceNo});
    }
    const [tool]=history.normalizeTraceToolCalls(events,index);
    assert.equal(tool.sequenceNo,190);
    assert.equal(tool.status,status);
    assert.equal(monitor.monitorCards([],[tool]).length,status==='SUCCESS'?1:0);
  }
});
test('宿主内成功回执在宿主后续失败时仍可恢复', () => {
  const payload={success:false,host_operations:[{tool_name:'agent_cbam_monitor_plan_create',success:true,
    result:{planId:'35',saved:true,created:true,dataVersion:0}}]};
  const {events,index}=scenario('prepareCbamMonitorTask',payload);
  events[2].status='FAILED';
  const tools=history.normalizeTraceToolCalls(events,index);
  assert.equal(monitor.monitorToolResults(tools[0])[0].planId,'35');
});
test('独立工具调用不串计划，隐藏记录不恢复', () => {
  const {events,index}=scenario();
  events.push({...events[2],sequenceNo:191,eventId:'other',
    safePayloadJson:JSON.stringify({safePayload:{toolCallId:'other-call',...receipt,fileId:'other-file',planId:'other-plan'}})});
  events.push({...events[2],sequenceNo:192,visible:0});
  const tools=history.normalizeTraceToolCalls(events,index);
  assert.equal(tools.length,2);
  assert.deepEqual(plain(monitor.monitorCards([],tools).map(c=>c.card.fileId)),[receipt.fileId,'other-file']);
});
test('产品碳、组织碳、沟通表及通用工具严格保持旧历史合并结果', () => {
  for(const name of ['agent_report_generate','agent_modeling_execute','agent_enterprise_report_generate',
    'agent_enterprise_inventory_query','agent_cbam_report_generate','exportWorkspaceArtifact','task','write_todos']) {
    const {events,index}=scenario(name,{marker:'old-business'});
    assert.equal(helper.isCbamHistoryTool({toolName:name}),false);
    const expected=history.mergeToolCalls(events.map(e=>history.normalizeTraceToolCall(e,index))
      .sort((a,b)=>history.getToolCallSortOrder(a)-history.getToolCallSortOrder(b)));
    assert.deepEqual(plain(history.normalizeTraceToolCalls(events,index)),plain(expected),name);
    const mixed=[...scenario().events.map(e=>({...e,safePayloadJson:e.safePayloadJson.replace('shared-call','cbam-call')})),...events];
    assert.deepEqual(plain(history.normalizeTraceToolCalls(mixed,index).filter(t=>t.toolName===name)),plain(expected),name);
  }
});
test('监测业务文件不生成通用沙箱下载卡，原报告卡保留', () => {
  const tool={toolName:'agent_cbam_monitor_report_generate',status:'SUCCESS',payload:{safePayload:receipt}};
  assert.equal(artifacts.getWorkspaceArtifactExportResult(tool),undefined);
  assert.equal(monitor.monitorCards([],[tool])[0].card.fileName,'monitor.docx');
});
test('非CBAM多工具合并后的原有排列也保持不变', () => {
  const events=[
    {sequenceNo:1,toolName:'agent_report_generate',eventId:'a1',call:'a'},
    {sequenceNo:2,toolName:'agent_enterprise_report_generate',eventId:'b1',call:'b',orderNo:20},
    {sequenceNo:3,toolName:'agent_report_generate',eventId:'a2',call:'a',orderNo:100},
  ].map(e=>({...e,eventType:'tool_call_success',status:'SUCCESS',
    safePayloadJson:JSON.stringify({orderNo:e.orderNo,safePayload:{toolCallId:e.call}})}));
  const expected=history.mergeToolCalls(events.map(e=>history.normalizeTraceToolCall(e))
    .sort((a,b)=>history.getToolCallSortOrder(a)-history.getToolCallSortOrder(b)));
  assert.deepEqual(plain(history.normalizeTraceToolCalls(events)),plain(expected));
  const mixed=history.normalizeTraceToolCalls([...events,...scenario().events]);
  assert.deepEqual(plain(mixed.filter(t=>!helper.isCbamHistoryTool(t))),plain(expected));
});
test('其他业务文件与普通沙箱文件继续按原规则解析', () => {
  for(const name of ['exportWorkspaceArtifact','agent_report_generate','agent_enterprise_report_generate']) {
    const tool={toolName:name,status:'SUCCESS',payload:{safePayload:{fileId:'file-original',filename:'report.pdf',mime:'application/pdf',size:99}}};
    const result=artifacts.getWorkspaceArtifactExportResult(tool);
    assert.equal(result.fileId,'file-original');
    assert.equal(result.filename,'report.pdf');
    assert.equal(result.mime,'application/pdf');
  }
});
test('业务识别限制在两类CBAM及其宿主，不从参数伪造成功报告', () => {
  for(const name of ['cbam_monitor_report_generate','agent_cbam_operation_report_generate','cbam2/monitor/report/generate',
    'cbam2/operation/report/v1/1/report/generate','prepareCbamOperationTask','applyCbamOperationCandidates'])
    assert.equal(helper.isCbamHistoryTool({toolName:name}),true,name);
  assert.equal(monitor.monitorCards([],[{toolName:'agent_cbam_monitor_report_generate',status:'SUCCESS',payload:{arguments:receipt}}]).length,0);
});

// Optional local real-trace replay; no production log is committed to the repository.
if(process.env.CBAM_TRACE_FILE) test('用户真实trace刷新回放：报告成功回执和卡片保留',()=>{
  const {events,turns}=JSON.parse(fs.readFileSync(process.env.CBAM_TRACE_FILE,'utf8')).data;
  const tools=history.normalizeTraceToolCalls(events,history.buildTraceTimelineIndex(turns));
  const report=tools.find(t=>t.toolName==='agent_cbam_monitor_report_generate'&&t.sequenceNo===190);
  assert.ok(report);
  const card=monitor.monitorCards([],[report])[0];
  assert.equal(card.card.fileId,'2100168158284779522');
  assert.equal(card.messageId,'msg_0d726729a1f04ddb97c362dc8869d34d');
  assert.equal(artifacts.getWorkspaceArtifactExportResult(report),undefined);
});
