import { request } from '@/api/request';

import { Task, TaskOption, TaskSearchParams } from './type';

export const getTaskOption = (params: { ticket?: string }) =>
  request<{ data: TaskOption }>({
    method: 'get',
    url: '/enterprise/source/task/org/list',
    params: {
      ...params,
      type: '1',
    },
  });

export const getTaskList = (
  data: TaskSearchParams & { activityType?: number },
) =>
  request<{
    rows: Task[];
    waitDealTotal: number;
    sumTotal: number;
    flowingCount: number;
    completeCount: number;
    cancelCount: number;
    total: number;
    code: number;
    msg: string;
    queryKey: any;
    institutionsList: any;
    searchId: any;
    versionId: any;
    selectionSuggestion: any;
  }>({
    method: 'post',
    url: '/enterprise/source/task/list_new',
    data,
  });

export const updateActivityData = (data: {
  id: number;
  activityData?: number | string | null;
  ticket?: string;
  paramId?: number;
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/edit/data',
    data,
  });

export const updateAttachment = (data: {
  idList: number[];
  supportImg: { name: string; url: string }[];
  ticket?: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/upload/attachment/batch',
    data,
  });

export const deleteAttachment = (data: { idList: number[]; ticket?: string }) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/deleted/taskSupportImg',
    data,
  });

export const batchDeleteAttachment = (data: {
  supportImgIds: number[];
  ticket?: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/deleted/supportImg/batch',
    data,
  });

export const submitTask = (data: { idList: number[]; ticket?: string }) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/submitFlow/batch',
    data,
  });

export const batchDownloadAttachment = data =>
  request<{ data: { url: string } }>({
    method: 'post',
    url: '/enterprise/source/task/upload/supportImg/batch',
    data,
  });

export const getImportRecords = (params: {
  ticket?: string;
  pageNum: number;
  pageSize: number;
}) =>
  request<{ rows: Record<string, any>[]; total: number }>({
    method: 'get',
    url: '/enterprise/source/task/excel/list',
    params,
  });

export const getImportTemplate = (params: { ticket?: string }) =>
  request<{ data: { path: string } }>({
    method: 'get',
    url: '/enterprise/source/task/export',
    params,
  });

export const importTask = (data: FormData) =>
  request({
    method: 'post',
    url: '/enterprise/source/task/import',
    data,
  });

export const getAuditRecordList = (data: { id: number; ticket?: string }) =>
  request<{
    data: {
      id: number;
      sourceId: number;
      name: string;
      initiate: string;
      updateTime: string;
      appoint: string;
      approvers?: string;
      auditRecordList: {
        recordId: number;
        nodeName: string;
        instanceAuditStatus: number;
        actionTime: string;
        instanceId: number;
        dataId: number;
        modifiedFields: string | null;
        modifiedActivityData?: string | null;
        attachmentIds: string | null;
        /** 修改的附件，JSON 或 Java toString 风格字符串 */
        modifiedAttachment: string | null;
        originalData: string | null;
        activityData?: string | null;
        recordAuditStatus: number;
        operatorName: string;
        opinion: string | null;
      }[];
    };
  }>({
    method: 'post',
    url: '/enterprise/source/task/auditRecordList',
    data,
  });
