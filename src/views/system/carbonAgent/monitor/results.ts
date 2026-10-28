import type { AgentMessageCard, AgentToolCall } from '../service';
import { parseMonitorJson } from './json';
import type { MonitorCardData, MonitorResult } from './types';

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const id = (value: unknown) =>
  typeof value === 'string' && value.trim()
    ? value
    : typeof value === 'number' && Number.isSafeInteger(value)
    ? String(value)
    : undefined;

const monitorResultKeys = [
  'safePayload',
  'result',
  'output',
  'toolResult',
  'resultData',
  'data',
  'content',
  'text',
  'card',
];
const monitorHostResultKeys = [
  ...monitorResultKeys,
  'contentJson',
  'chunk',
  'artifact',
  'monitor_host_receipt',
];
const monitorHostTools = new Set([
  'preparecbammonitorcandidates',
  'preparecbammonitortask',
]);
const isMonitorHostTool = (name?: string) =>
  monitorHostTools.has((name || '').trim().toLowerCase());
const isSuccessfulMonitorTool = (status?: string) =>
  /^(SUCCESS|SUCCEEDED|COMPLETED)$/i.test(status || '');
const isTerminalMonitorHostTool = (status?: string) =>
  /^(SUCCESS|SUCCEEDED|COMPLETED|FAILED|ERROR)$/i.test(status || '');

/** 只遍历结果封装，不从 input/arguments 猜测成功计划或文件。 */
export function monitorResult(
  value: unknown,
  depth = 0,
): MonitorResult | undefined {
  if (depth > 7 || value == null) return undefined;
  if (typeof value === 'string') {
    try {
      return monitorResult(parseMonitorJson(value), depth + 1);
    } catch {
      return undefined;
    }
  }
  if (typeof value !== 'object') return undefined;
  if (Array.isArray(value)) {
    return value.map(item => monitorResult(item, depth + 1)).find(Boolean);
  }
  const root = record(value);
  if (
    root.success === false ||
    root.isError === true ||
    (typeof root.code === 'number' && root.code !== 200)
  )
    return undefined;
  const display = record(root.display);
  const cardId = id(display.cardId) || id(root.cardId);
  const fileId = id(root.fileId);
  if (
    cardId ||
    (fileId && root.fileStatus) ||
    ((root.saved === true || root.cardType === 'cbam2_monitor_plan') &&
      id(root.planId))
  ) {
    return {
      ...root,
      planId: id(root.planId),
      cardId,
      fileId,
      display,
    } as MonitorResult;
  }
  return monitorResultKeys
    .map(key => monitorResult(root[key], depth + 1))
    .find(Boolean);
}

const parseResultValue = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return parseMonitorJson(value);
  } catch {
    return undefined;
  }
};

/** 包装工具只能读取宿主返回的 host_operations，不能从 input/arguments 或模型正文推断写入成功。 */
const monitorHostOperationResults = (payload: unknown) => {
  const results: MonitorResult[] = [];
  const identities = new Set<string>();
  const visited = new WeakSet<object>();
  const walk = (value: unknown, depth = 0) => {
    if (depth > 12 || value == null) return;
    const parsed = parseResultValue(value);
    if (parsed == null || typeof parsed !== 'object') return;
    if (visited.has(parsed)) return;
    visited.add(parsed);
    if (Array.isArray(parsed)) {
      parsed.forEach(item => walk(item, depth + 1));
      return;
    }
    const root = record(parsed);
    if (Array.isArray(root.host_operations)) {
      root.host_operations.forEach(value => {
        const operation = record(value);
        const operationName =
          id(operation.tool_name) || id(operation.toolName) || '';
        if (
          operation.success !== true ||
          !/^agent_cbam_monitor_/i.test(operationName)
        )
          return;
        const result = monitorResult(operation.result);
        if (!result) return;
        const identity = [
          operationName,
          result.planId,
          result.dataVersion,
          result.saved,
          result.created,
          result.cardId,
          result.fileId,
        ].join('|');
        if (identities.has(identity)) return;
        identities.add(identity);
        results.push({ ...result, hostOperation: operationName });
      });
    }
    monitorHostResultKeys.forEach(key => walk(root[key], depth + 1));
  };
  walk(payload);
  return results;
};

export function monitorToolResults(tool: AgentToolCall): MonitorResult[] {
  if (isMonitorHostTool(tool.toolName)) {
    return isTerminalMonitorHostTool(tool.status)
      ? monitorHostOperationResults(tool.payload)
      : [];
  }
  if (
    !/cbam_monitor_|monitor\//i.test(tool.toolName || '') ||
    !isSuccessfulMonitorTool(tool.status)
  )
    return [];
  const result = monitorResult(tool.payload);
  return result ? [result] : [];
}

export function monitorToolResult(tool: AgentToolCall) {
  return monitorToolResults(tool)[0];
}

export function monitorSavedPlanResult(tool: AgentToolCall) {
  return monitorToolResults(tool).reduce<MonitorResult | undefined>(
    (latest, result) => {
      if (!result.planId || result.saved !== true) return latest;
      if (!latest) return result;
      const latestVersion =
        typeof latest.dataVersion === 'number' ? latest.dataVersion : -1;
      const resultVersion =
        typeof result.dataVersion === 'number' ? result.dataVersion : -1;
      return resultVersion >= latestVersion ? result : latest;
    },
    undefined,
  );
}

const monitorCardTypes = [
  'cbam2_monitor_plan',
  'cbam_monitor_material_advice',
  'cbam_monitor_report',
];

/** 只呈现服务端组装且匹配当前引用的完整快照，不能把工具摘要当成完整历史内容。 */
export function monitorCardSnapshot(
  result: MonitorResult,
): MonitorCardData | undefined {
  const card = result.resolvedCard;
  if (
    result.cardResolved !== true ||
    result.cardResolveError ||
    !result.cardId ||
    !card ||
    card.cardId !== result.cardId ||
    !['cbam_monitor_material_advice', 'cbam2_monitor_plan'].includes(
      card.cardType || '',
    ) ||
    (!Array.isArray(card.groups) && !card.completion)
  )
    return undefined;
  return card;
}

/** 历史 trace 的外层类型统一为 business_card；报告只有 fileId，不能要求它带 cardId。 */
export const isMonitorCard = (card: AgentMessageCard) => {
  const result = monitorResult(card.card);
  return [
    card.cardType,
    record(card.card).cardType,
    result?.cardType,
    result?.display?.cardType,
  ].some(type => monitorCardTypes.includes(String(type || '')));
};

/** 工具成功结果也可以呈现卡片，防止宿主未重复发送 business_card 时用户看不到服务端产物。 */
export function monitorCards(
  cards: AgentMessageCard[],
  tools: AgentToolCall[],
): AgentMessageCard[] {
  const identities = new Set(
    cards
      .map(card => monitorResult(card.card))
      .filter(Boolean)
      .map(result => result?.cardId || result?.fileId),
  );
  const extra = tools.flatMap(tool =>
    monitorToolResults(tool).flatMap(result => {
      const key = result.cardId || result.fileId;
      if (!key || identities.has(key)) return [];
      identities.add(key);
      return [
        {
          card: result as Record<string, unknown>,
          cardType: result.fileId
            ? 'cbam_monitor_report'
            : result.display?.cardType || 'cbam2_monitor_plan',
          messageId: tool.messageId || `monitor-${key}`,
          orderNo: tool.orderNo ?? tool.sequenceNo ?? 0,
          streamOrderNo: tool.streamOrderNo,
        },
      ];
    }),
  );
  return [...cards, ...extra];
}
