import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  CarbonLabelContrastList,
  CarbonLabelSubApiData,
} from './AddOrDetail/type';
import { AuditListData } from './component/AuditList/type';
import { PreviewH5Props } from './component/PreviewH5/type';
import {
  ApiBackErrorCode,
  CarbonLabelListData,
  CarbonLabelParams,
  CarbonLabelPrviewParams,
  CarbonLabelSubmitResult,
} from './type';
import { BackTableData } from '../type';

/** 碳标签 - 列表 */
export function getCarbonLabelList(
  params: CarbonLabelParams,
  signal?: AbortSignal,
) {
  return request<AxiosResponse<BackTableData<CarbonLabelListData>>>({
    method: 'get',
    url: `footprint3/tagLabel/list`,
    params,
    signal,
  });
}

/** 碳标签 - 碳披露预览 */
export function getCarbonLabelPrviewInit(data: CarbonLabelPrviewParams) {
  return request<AxiosResponse<CarbonLabelListData>>({
    method: 'post',
    url: `footprint3/tagLabel/preview`,
    data,
  });
}

/** 新增申请 - 碳排放类比列表 */
export function getCarbonLabelContrastList() {
  return request<AxiosResponse<CarbonLabelContrastList[]>>({
    method: 'get',
    url: `footprint3/tagLabel/contrastList`,
  });
}

/** 碳标签 - 新增草稿 */
export function postCarbonLabelApplyAddDraft(
  data: Partial<CarbonLabelSubApiData>,
) {
  return request<{ code: number; data: ApiBackErrorCode }>({
    method: 'post',
    url: `footprint3/tagLabel/addDraft`,
    data,
  });
}
/** 碳标签 - 编辑草稿 */
export function postCarbonLabelApplyEditDraft(
  data: Partial<CarbonLabelSubApiData>,
) {
  return request<{ code: number; data: ApiBackErrorCode }>({
    method: 'post',
    url: `footprint3/tagLabel/editDraft`,
    data,
  });
}

/** 碳标签 - 新增申请 */
export function postCarbonLabelApplyAdd(data: CarbonLabelSubApiData) {
  return request<{ code: number; data: CarbonLabelSubmitResult }>({
    method: 'post',
    url: `footprint3/tagLabel/addSubmit`,
    data,
  });
}

/** 碳标签 - 编辑提交申请 */
export function postCarbonLabelApplyEdit(data: CarbonLabelSubApiData) {
  return request<{ code: number; data: CarbonLabelSubmitResult }>({
    method: 'post',
    url: `footprint3/tagLabel/editSubmit`,
    data,
  });
}

/** 碳标签 - 详情回显 */
export function getCarbonLabelDetail(params: { id: string }) {
  return request<AxiosResponse<CarbonLabelListData>>({
    method: 'get',
    url: `footprint3/tagLabel/info`,
    params,
  });
}

/** 碳标签 - 列表撤销 */
export function postCarbonLabelListCancel(data: { id: number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/tagLabel/cancel`,
    data,
  });
}

/** 碳标签 - 列表删除 */
export function postCarbonLabelListDelete(data: { id: number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/tagLabel/delete`,
    data,
  });
}

/** 碳标签 - 审核列表 */
export function getCarbonLabelAuditList(params: { applyNum: string }) {
  return request<AxiosResponse<AuditListData[]>>({
    method: 'get',
    url: `footprint3/tagLabel/auditRecords`,
    params,
  });
}

/** 碳标签 - 版本对比 */
export function getCarbonLabelAuditDiff(params: {
  labelId: number;
  version: number;
}) {
  return request<AxiosResponse<PreviewH5Props['info']>>({
    method: 'get',
    url: `footprint3/tagLabel/versionDiff`,
    params,
  });
}
