import { baseURL } from '@src/api/request';
import I18N from '@src/lang/I18N';
import { getLocaleCodeFromPathname } from '@src/router/localePath';
import axios from 'axios';
import saveAs from 'file-saver';

import { parseMonitorJson } from './json';
import type { MonitorCardData, MonitorResult, MonitorSession } from './types';

const prefix = '/cbam2/agent/internal/skills/cbam2/monitor/';
type Envelope<T> = {
  code: number;
  msg?: string;
  data?: {
    success: boolean;
    message?: string;
    data?: T;
    error?: { code?: string };
  };
};

/** 复用 axios 登录态；会话仅在正文传递，避免额外请求头触发跨域限制。 */
export async function monitorRequest<T>(
  path: string,
  sessionId: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  const options = {
    baseURL,
    method: 'POST' as const,
    url: `${prefix}${path}`,
    silentResponseError: true,
    data: {
      ...data,
      sessionId,
      lang: getLocaleCodeFromPathname() === 'en' ? 'en' : 'zh',
    },
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
  };
  const { data: result } = await axios.request<Envelope<T>>(options);
  if (
    result.code !== 200 ||
    result.data?.success !== true ||
    result.data.data == null
  ) {
    throw new Error(
      result.data?.message || result.msg || I18N.cbamMonitor.agentLoadFailed,
    );
  }
  return result.data.data;
}

export const readMonitorSession = (sessionId: string, page = 1) =>
  monitorRequest<MonitorSession>('session/objects', sessionId, {
    monitorPageNum: page,
    monitorPageSize: 20,
  });
export const readMonitorCard = (sessionId: string, cardId: string) =>
  monitorRequest<MonitorCardData>('card/read', sessionId, {
    resourceId: cardId,
  });

/** 预览地址来自服务端已鉴权、校验哈希的报告资源，不能读取卡片里任意 URL。 */
export async function readMonitorReportPreview(
  sessionId: string,
  fileId: string,
) {
  const result = await monitorRequest<
    MonitorResult & { reportUrl: string; readonly: boolean }
  >('report/preview', sessionId, { resourceId: fileId });
  const url = new URL(result.reportUrl);
  if (
    result.fileId !== fileId ||
    result.fileStatus !== 'READY' ||
    result.readonly !== true ||
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(I18N.cbamMonitor.agentLoadFailed);
  }
  return result;
}

/** 始终请求固定下载入口，不访问卡片中可能携带的任意 URL 或其他会话。 */
export async function downloadMonitorReport(
  sessionId: string,
  fileId: string,
  fileName?: string,
) {
  const options = {
    baseURL,
    method: 'POST' as const,
    url: `${prefix}report/download`,
    responseType: 'blob' as const,
    silentResponseError: true,
    data: { sessionId, resourceId: fileId },
  };
  const { data } = await axios.request<Blob>(options);
  if (!data.size || !/officedocument|octet-stream|zip/i.test(data.type)) {
    throw new Error(I18N.cbamMonitor.agentDownloadFailed);
  }
  saveAs(data, fileName || `monitor-${fileId}.docx`);
}
