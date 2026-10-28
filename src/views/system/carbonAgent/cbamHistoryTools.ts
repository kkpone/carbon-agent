import type { AgentToolCall } from './service';

/** 仅覆盖监测计划和运营报告，不改变沟通表、产品碳、组织碳的历史合并。 */
export const isCbamHistoryTool = (tool: AgentToolCall) =>
  /(?:^|_)cbam_(?:monitor|operation)_/i.test(tool.toolName || '') ||
  /^(?:cbam2\/monitor\/|cbam\/operation\/|cbam2\/operation(?:-report\/|\/report\/v1\/1\/))/i.test(
    tool.toolName || '',
  ) ||
  /^(?:prepareCbamMonitorTask|prepareCbamMonitorCandidates|prepareCbamOperationTask|applyCbamOperationCandidates)$/i.test(
    tool.toolName || '',
  );

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const isActualTerminal = (tool: AgentToolCall) => {
  const payload = record(tool.payload);
  const safePayload = record(payload.safePayload);
  return (
    payload.autoClosed !== true &&
    safePayload.autoClosed !== true &&
    /^(?:SUCCESS|SUCCEEDED|COMPLETED|FAILED|ERROR|CANCELLED|CANCELED)$/i.test(
      tool.status || '',
    )
  );
};

const identity = (tool: AgentToolCall) =>
  tool.toolCallId ||
  tool.eventId ||
  `${tool.toolName || 'tool'}-${tool.sequenceNo || ''}-${
    tool.createTime || ''
  }`;

const chronologicalOrder = (left: AgentToolCall, right: AgentToolCall) => {
  if (left.sequenceNo != null && right.sequenceNo != null)
    return left.sequenceNo - right.sequenceNo;
  const leftTime = Date.parse(left.createTime || '');
  const rightTime = Date.parse(right.createTime || '');
  return Number.isFinite(leftTime) && Number.isFinite(rightTime)
    ? leftTime - rightTime
    : 0;
};

/** orderNo 是单轮展示顺序；跨确认轮次按事件序号合并，真实终态不被自动结束占位覆盖。 */
export function mergeCbamHistoryTools(tools: AgentToolCall[]): AgentToolCall[] {
  const merged = new Map<string, AgentToolCall>();
  [...tools]
    .filter(isCbamHistoryTool)
    .sort(chronologicalOrder)
    .forEach(tool => {
      const key = identity(tool);
      const previous = merged.get(key);
      if (previous && isActualTerminal(previous) && !isActualTerminal(tool))
        return;
      const sameMessage = previous?.messageId === tool.messageId;
      merged.set(key, {
        ...previous,
        ...tool,
        // 恢复结果归属确认后的消息，只在同一消息内保留首次出现的位置。
        orderNo: sameMessage ? previous?.orderNo ?? tool.orderNo : tool.orderNo,
        streamOrderNo: sameMessage
          ? previous?.streamOrderNo ?? tool.streamOrderNo
          : tool.streamOrderNo,
      });
    });
  return [...merged.values()];
}
