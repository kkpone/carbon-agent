import { request } from '@api/request';

import {
  AddSubmitParam,
  CarbonAuthAuditRecordsReturn,
  CarbonAuthInfoReturn,
  CarbonAuthListParam,
  FileListType,
  PageReturn,
  Response,
} from './type';

// 申请认证提交
export function apiAddSubmit(data: AddSubmitParam) {
  return request<{ data: string }>({
    method: 'POST',
    url: `/authentication/carbonAuth/addSubmitAuth`,
    data,
  });
}
// 申请认证编辑提交
// 申请认证保存

// 认证项目详情
export function apiGETCarbonAuthInfo(params: { id: number }) {
  return request<Response<CarbonAuthInfoReturn>>({
    method: 'GET',
    url: `/authentication/carbonAuth/info`,
    params,
  });
}
// 认证项目审批记录
export function apiGETCarbonAuthAuditRecords(params: { applyNo: number }) {
  return request<Response<CarbonAuthAuditRecordsReturn[]>>({
    method: 'GET',
    url: `/authentication/carbonAuth/auditRecords`,
    params,
  });
}

// 认证项目列表
export function apiGETCarbonAuthList(params: CarbonAuthListParam) {
  return request<Response<PageReturn<CarbonAuthInfoReturn>>>({
    method: 'GET',
    url: `/authentication/carbonAuth/list`,
    params,
  });
}

// 删除认证项目
export function apiDeletevCarbonAuth(data: { id: number }) {
  return request<{ data: string }>({
    method: 'POST',
    url: `/authentication/carbonAuth/delete`,
    data,
  });
}
// 撤回申请认证项目
export function apiCancelCarbonAuth(data: { id: number; comment?: string }) {
  return request<{ data: string }>({
    method: 'POST',
    url: `/authentication/carbonAuth/cancel`,
    data,
  });
}

//  下载文件获取
export function apiGETCarbonAuthFiles(params: {
  sourceId: number;
  type: number;
}) {
  return request<Response<FileListType[]>>({
    method: 'GET',
    url: `/authentication/auth/files/list`,
    params,
  });
}

// 报告详情快照
