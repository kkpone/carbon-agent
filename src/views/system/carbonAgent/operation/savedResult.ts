import type { AgentToolCall } from '../service';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : undefined;

// 仅从响应封装中读取回执，调用参数和材料提取结果不能作为保存回执。
const outputs = (value: unknown, depth = 0): RecordValue[] => {
  if (depth > 8) return [];
  if (typeof value === 'string') {
    try {
      return outputs(JSON.parse(value), depth + 1);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value))
    return value.flatMap(item => {
      const block = record(item);
      return block?.type === 'text' ? outputs(block.text, depth + 1) : [];
    });
  const obj = record(value);
  if (!obj) return [];
  return [
    obj,
    ...[
      'data',
      'result',
      'output',
      'response',
      'safePayload',
      'structuredContent',
      'content',
    ].flatMap(key => outputs(obj[key], depth + 1)),
  ];
};

const writeTool = (name: unknown) =>
  /(?:^|_)cbam_operation_(?:report_create|(?:general|process|condition|quality)_patch|report_save|item_delete|evidence_manage)$/.test(
    String(name),
  );

export const operationSavedResult = (
  toolCall: AgentToolCall,
): RecordValue | undefined => {
  const name = toolCall.toolName || '';
  const host = /^(prepareCbamOperationTask|applyCbamOperationCandidates)$/.test(
    name,
  );
  if (
    !host &&
    (!writeTool(name) ||
      !['COMPLETED', 'SUCCESS', 'SUCCEEDED'].includes(toolCall.status || ''))
  )
    return undefined;
  let candidates = outputs(toolCall.payload);
  if (host) {
    // 宿主调用整体失败时，仍可能包含已提交的创建或增量保存回执。
    candidates = candidates.flatMap(item =>
      Array.isArray(item.host_operations)
        ? item.host_operations.flatMap(value => {
            const op = record(value);
            return op?.success === true && writeTool(op.tool_name)
              ? outputs(op.result)
              : [];
          })
        : [],
    );
  }
  return candidates
    .filter(item => item.success !== false)
    .map(item => record(item.businessResult))
    .filter((item): item is RecordValue => Boolean(item))
    .filter(
      item =>
        item.module === 'cbam2' &&
        item.bizType === 'operation_report' &&
        item.success === true &&
        item.persisted === true &&
        ['created', 'patched', 'completed', 'evidence_changed'].includes(
          String(item.action),
        ) &&
        typeof item.eventId === 'string' &&
        Boolean(item.eventId) &&
        typeof item.operationId === 'string' &&
        /^\d+$/.test(item.operationId) &&
        typeof item.dataVersion === 'number' &&
        Number.isSafeInteger(item.dataVersion) &&
        item.dataVersion >= 0,
    )
    .sort((a, b) => Number(b.dataVersion) - Number(a.dataVersion))[0];
};
