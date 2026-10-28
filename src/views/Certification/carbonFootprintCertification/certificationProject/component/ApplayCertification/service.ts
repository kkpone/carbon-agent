import { request } from '@api/request';

// 申请认证草稿提交
export function postSubmitDraft(data: any) {
  return request<{ data: { id: number } }>({
    method: 'POST',
    url: `/authentication/carbonAuth/addDraftAuth`,
    data,
  });
}

// 申请认证提交
export function postSubmitAuth(data: any) {
  return request<{ data: { id: number } }>({
    method: 'POST',
    url: `/authentication/carbonAuth/editSubmitAuth`,
    data,
  });
}

// 申请认证提交
export function postSubmitAuthByTable(data: any) {
  return request<{ data: { id: number } }>({
    method: 'POST',
    url: `/authentication/carbonAuth/addSubmitAuth`,
    data,
  });
}

// 申请认证草稿提交
export function postCancelAuth(data: { id: number }) {
  return request<{ data: string }>({
    method: 'POST',
    url: `/authentication/carbonAuth/cancel`,
    data,
  });
}

// 获取报告快照信息
export function getSnapInfoByCode(params: { snapCode: string }) {
  return request<{ data: string }>({
    method: 'get',
    url: `/footprint3/reportSnap/detail`,
    params,
  });
}

export function getSnapInfoByReportId(params: { snapCode: string }) {
  return request<{ data: string }>({
    method: 'get',
    url: `/footprint3/reportSnap/info`,
    params,
  });
}

// 获取报告快照信息
export function getCompanySnapInfoByCode(params: { snapCode: string }) {
  return request<{ data: string }>({
    method: 'get',
    url: `/enterprise/carbonAuthSnap/detail`,
    params,
  });
}

export const getCertInstitutionList = params =>
  request({
    url: '/authentication/certInstitution/list',
    params,
  });

export const getCarbonLabelReportList = params =>
  request({
    url: '/footprint3/report/list',
    params,
  });

export const getCarbonLabelReportInfo = params =>
  request({
    url: '/footprint3/report/info',
    params,
  });
