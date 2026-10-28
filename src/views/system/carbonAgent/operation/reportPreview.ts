import { baseURL } from '@src/api/request';
import I18N from '@src/lang/I18N';
import axios from 'axios';

import { parseMonitorJson } from '../monitor/json';
import { OPERATION_DOWNLOAD_PATH } from './reportDownload';

export type OperationReportOpenTarget = {
  type: 'report';
  reportId: string;
  reportName?: string;
  reportUrl: string;
  reportReadonly: true;
  reportKind: 'cbamOperation';
  reportLabel: string;
  refreshKey: string;
};

export async function readOperationReportPreview(
  sessionId: string,
  fileId: string,
) {
  const { data: response } = await axios.request({
    baseURL,
    method: 'POST',
    url: OPERATION_DOWNLOAD_PATH.replace('/download', '/preview'),
    data: { sessionId, resourceId: fileId },
    silentResponseError: true,
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
  });
  const result = response?.data?.data;
  if (
    response?.code !== 200 ||
    response.data?.success !== true ||
    result?.fileId !== fileId ||
    result.fileStatus !== 'READY' ||
    result.readonly !== true
  ) {
    throw new Error(
      response?.data?.message || I18N.cbamMonitor.agentLoadFailed,
    );
  }
  const url = new URL(result.reportUrl);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(I18N.cbamMonitor.agentLoadFailed);
  }
  return result as {
    fileName: string;
    reportUrl: string;
    language?: 'ZH' | 'EN';
    sourceDataVersion?: number;
  };
}
