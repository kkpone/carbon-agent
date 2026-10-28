import type { AgentMessageCard, AgentToolCall } from '../service';

export const LEGACY_OPERATION_DOWNLOAD_PATH =
  '/cbam2/agent/internal/skills/cbam2/operation-report/report/download';
export const OPERATION_DOWNLOAD_PATH =
  '/cbam2/agent/internal/skills/cbam2/operation-report/v1.1/report/download';

export type OperationDownloadAccess = {
  method: 'POST';
  path: typeof LEGACY_OPERATION_DOWNLOAD_PATH | typeof OPERATION_DOWNLOAD_PATH;
  body:
    | { sessionId: string; resourceId: string }
    | {
        sessionId: string;
        operationId: string;
        dataVersion: number;
        language: 'ZH' | 'EN';
      };
  fileName?: string;
  fileId?: string;
  sourceDataVersion?: number;
  language?: 'ZH' | 'EN';
};

const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const id = (value: unknown) => {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0)
    return String(value);
  return typeof value === 'string' && /^[1-9]\d*$/.test(value)
    ? value
    : undefined;
};

/** 仅从成功回执提取固定下载入口，保留字符串 ID，禁止把工具输入当作文件回执。 */
export function getOperationReportDownloadAccess(
  payload: unknown,
  sessionId?: string,
): OperationDownloadAccess | undefined {
  return getOperationReportDownloadAccesses(payload, sessionId)[0];
}

export function getOperationReportDownloadAccesses(
  payload: unknown,
  sessionId?: string,
): OperationDownloadAccess[] {
  const results: OperationDownloadAccess[] = [];
  if (!sessionId) return results;
  const find = (
    value: unknown,
    depth: number,
  ): OperationDownloadAccess | undefined => {
    if (depth > 12) return undefined;
    if (typeof value === 'string') {
      try {
        return find(JSON.parse(value), depth + 1);
      } catch {
        return undefined;
      }
    }
    if (Array.isArray(value)) {
      value.forEach(item => find(item, depth + 1));
      return undefined;
    }
    const node = record(value);
    if (
      !node ||
      node.success === false ||
      node.isError === true ||
      (node.code !== undefined &&
        ![0, 200, '0', '200', 'SUCCESS'].includes(node.code as number | string))
    )
      return undefined;
    const access = record(node.access);
    const publishedBody = record(access?.body);
    const fileId = id(node.fileId);
    if (
      node.fileStatus === 'READY' &&
      node.downloadRegistered === true &&
      fileId &&
      access?.method === 'POST' &&
      access.path === OPERATION_DOWNLOAD_PATH &&
      publishedBody?.sessionId === sessionId &&
      id(publishedBody.resourceId) === fileId &&
      typeof node.fileName === 'string' &&
      typeof node.sourceDataVersion === 'number' &&
      Number.isSafeInteger(node.sourceDataVersion) &&
      node.sourceDataVersion >= 0
    ) {
      results.push({
        method: 'POST',
        path: OPERATION_DOWNLOAD_PATH,
        body: { sessionId, resourceId: fileId },
        fileId,
        fileName: node.fileName,
        sourceDataVersion: node.sourceDataVersion,
        language:
          node.language === 'EN' || node.language === 'ZH'
            ? node.language
            : undefined,
      });
      return undefined;
    }
    const body = record(node.body);
    const operationId = id(body?.operationId);
    if (
      node.method === 'POST' &&
      node.path === LEGACY_OPERATION_DOWNLOAD_PATH &&
      body &&
      body.sessionId === sessionId &&
      operationId &&
      typeof body.dataVersion === 'number' &&
      Number.isSafeInteger(body.dataVersion) &&
      body.dataVersion >= 0 &&
      (body.language === 'ZH' || body.language === 'EN')
    ) {
      results.push({
        method: 'POST',
        path: LEGACY_OPERATION_DOWNLOAD_PATH,
        body: {
          sessionId,
          operationId,
          dataVersion: body.dataVersion,
          language: body.language,
        },
      });
      return undefined;
    }
    [
      'data',
      'result',
      'output',
      'toolResult',
      'resultData',
      'safePayload',
      'contentJson',
      'content',
      'text',
      'host_operations',
      'structuredContent',
      'chunk',
      'artifact',
      'card',
      'access',
    ].forEach(key => find(node[key], depth + 1));
    return undefined;
  };
  find(payload, 0);
  return results;
}

/** 将已发布的运营报告放入会话卡片流，同一文件在嵌套工具和卡片中只展示一次。 */
export function operationReportCards(
  cards: AgentMessageCard[],
  tools: AgentToolCall[],
  sessionId?: string,
): AgentMessageCard[] {
  const seen = new Set<string>();
  const collect = (
    payload: unknown,
    source: Pick<AgentMessageCard, 'messageId' | 'orderNo' | 'streamOrderNo'>,
  ) =>
    getOperationReportDownloadAccesses(payload, sessionId).flatMap(access => {
      if (!access.fileId || seen.has(access.fileId)) return [];
      seen.add(access.fileId);
      return [
        {
          ...source,
          cardType: 'cbam_operation_report',
          card: {
            ...access,
            access,
            fileStatus: 'READY',
            downloadRegistered: true,
          },
        },
      ];
    });
  const normalized = cards.flatMap(card =>
    getOperationReportDownloadAccesses(card.card, sessionId).some(
      access => access.fileId,
    )
      ? collect(card.card, card)
      : [card],
  );
  const extra = tools.flatMap(tool =>
    ['COMPLETED', 'SUCCESS'].includes(tool.status || '')
      ? collect(tool.payload, {
          messageId: tool.messageId || tool.toolCallId || 'operation-report',
          orderNo: tool.orderNo ?? tool.sequenceNo ?? 0,
          streamOrderNo: tool.streamOrderNo,
        })
      : [],
  );
  return [...normalized, ...extra];
}
