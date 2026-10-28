import type { AgentToolCall } from './service';

const record = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' ? (value as Record<string, any>) : {};
const terminal = new Set([
  'SUCCESS',
  'COMPLETED',
  'FAILED',
  'ERROR',
  'CANCELLED',
  'ENDED',
]);
export const isTerminalTool = (tool: AgentToolCall) =>
  terminal.has((tool.status || '').toUpperCase());
export const isVisibleToolEvent = (value: unknown) => {
  const data = record(value);
  const safe = record(data.safePayload);
  return [
    data.visible,
    safe.visible,
    record(data.display).visible,
    record(safe.display).visible,
  ].every(flag => flag !== false && flag !== 0);
};
export const normalizeToolPresentation = (
  tool: AgentToolCall,
): AgentToolCall => {
  const data = record(tool.payload);
  const safe = record(data.safePayload);
  const display = {
    ...record(data.display),
    ...record(safe.display),
    ...record(tool.display),
  };
  const type = tool.eventType || '';
  const status =
    type === 'tool_call_success'
      ? 'SUCCESS'
      : ['tool_call_error', 'tool_call_failed'].includes(type)
      ? 'FAILED'
      : tool.status || (type === 'tool_call_start' ? 'RUNNING' : undefined);
  return { ...tool, status, display, title: display.stageName || tool.title };
};
export const mergeToolEvent = (
  previous: AgentToolCall,
  incoming: AgentToolCall,
): AgentToolCall => {
  const next = normalizeToolPresentation(incoming);
  // Replayed or late start events cannot reopen a finished invocation.
  const merged =
    isTerminalTool(previous) && !isTerminalTool(next)
      ? { ...next, ...previous }
      : {
          ...previous,
          ...Object.fromEntries(
            Object.entries(next).filter(([, value]) => value !== undefined),
          ),
        };
  return {
    ...merged,
    orderNo: previous.orderNo ?? next.orderNo,
    streamOrderNo: previous.streamOrderNo ?? next.streamOrderNo,
    toolCallId: previous.toolCallId || next.toolCallId,
  };
};
export const finishHistoricalTool = (tool: AgentToolCall): AgentToolCall =>
  isTerminalTool(tool) ? tool : { ...tool, status: 'ENDED' };

/** Only presentation text is redacted; original protocol data stays available for business cards/resume. */
export const publicToolText = (value: string): string => {
  const trimmed = value.trim();
  if (/^[{[]/.test(trimmed)) {
    try {
      return JSON.stringify(
        JSON.parse(trimmed),
        (key, item) =>
          /^(arguments|input|metadata|authorization|api[_-]?key|secret|.*token|password|stack|stacktrace)$/i.test(
            key,
          )
            ? undefined
            : item,
        2,
      );
    } catch {
      /* Non-JSON business text continues below. */
    }
  }
  if (
    /Traceback \(most recent|\n\s*at [\w.$]+\(|SELECT\s+.+\s+FROM\s|INSERT\s+INTO\s|Authorization:\s|api[_-]?key\s*[:=]/i.test(
      value,
    )
  )
    return '执行信息包含内部诊断内容，请联系管理员排查';
  return value;
};
