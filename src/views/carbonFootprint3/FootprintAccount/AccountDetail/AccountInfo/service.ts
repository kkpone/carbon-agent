import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  AccountingAddBasicApiData,
  AccountingInfoData,
  AccountingUpadteScopeParams,
  ProcessAccountEveryList,
  AiModelAndWebsiteResponse,
  AiModelAndWebsiteParams,
  AiModelThirdParams,
} from './type';

export const getAccountViewEveryList = (params: { id: number | string }) =>
  request<{ data: ProcessAccountEveryList }>({
    method: 'get',
    url: '/footprint3/account/accountView',
    params,
  });

/** 新增核算 - 基础信息 - 仅保存 */
export const postAccountingBasic = (data: AccountingAddBasicApiData) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/save',
    data,
  });

/** 新增核算 - 基础信息 - 保存并建模 */
export const postAccountingBasicSaveAndView = (
  data: AccountingAddBasicApiData,
) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/saveAndView',
    data,
  });

/** 核算 - 去建模 */
export const postAccountingBasicBasicAddview = (data: {
  id: string | undefined;
}) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/addView',
    data,
  });

/** 核算 - 复制过程核算基本信息 - 仅保存 */
export const postAccountingCopyBasic = (data: AccountingAddBasicApiData) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copy',
    data,
  });

/** 核算 - 保存选择的模型*/
export const postAccountingCopyModelBasic = (
  data: AccountingAddBasicApiData & { modelId?: string },
) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copyModel',
    data,
  });

/** 核算 - 保存选择的模型*/
export const postAccountingCopyModelViewBasic = (
  data: AccountingAddBasicApiData & { modelId?: string },
) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copyModelAndView',
    data,
  });

/** 核算 - 保存并去建模 */
export const postAccountingCopyBasicAndView = (
  data: AccountingAddBasicApiData,
) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copyAndView',
    data,
  });

/** 删除快速核算列表数据 */
export const postAccountingDelete = (data: { id: string | number }) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/delete',
    data,
  });

/** 获取核算详情 */
export function getAccountingInfo(params: { id: string; lang?: string }) {
  return request<AxiosResponse<AccountingInfoData>>({
    method: 'get',
    url: '/footprint3/account/info',
    params,
  });
}
/** 撤销核算（分享快照等需携带 shareAuth/snapFlag 查询参数） */
export function revokeAccount(data: { id: string }) {
  return request<AxiosResponse<AccountingInfoData>>({
    method: 'POST',
    url: '/footprint3/account/revokeAccount',
    data,
  });
}

export function postAccountRevokeWithShare(
  data: { id: string | number },
  params?: Record<string, unknown>,
) {
  return request<AxiosResponse<AccountingInfoData>>({
    method: 'POST',
    url: '/footprint3/account/revokeAccount',
    data,
    params,
  });
}

/** 编辑核算基础信息 */
export const postAccountingEditBasic = (data: AccountingAddBasicApiData) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/account/save',
    data,
  });

/** 过程核算 - 切换生命周期 */
export const postAccountUpadteScope = (data: AccountingUpadteScopeParams) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/updateScope',
    data,
  });

/** 生成碳足迹结果 */
export const postProcessAccountFinish = (data: { id: string | number }) =>
  request({
    method: 'post',
    url: '/footprint3/account/finish',
    data,
  });

/** 生成碳足迹结果（分享快照等需携带 shareAuth/snapFlag 查询参数） */
export const postAccountFinishWithShare = (
  data: { id: string | number },
  params?: Record<string, unknown>,
) =>
  request({
    method: 'post',
    url: '/footprint3/account/finish',
    data,
    params,
  });

/** AI模型和网站接口 */
export const postAiModelAndWebsite = (data: AiModelAndWebsiteParams) =>
  request<AiModelAndWebsiteResponse>({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelAndWebsite',
    data,
  });

/** AI模型第三方接口 */
export const postAiModelThird = (data: AiModelThirdParams) =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelThird',
    data,
  });

/** AI模型处理进度查询接口 */
export const getAiProcess = (params: { accountId: number }) =>
  request<{ code: number; msg: string; data: number; lang: null }>({
    method: 'get',
    url: '/footprint3/accountEmission/aiProcess',
    params,
  });

/** AI 模型完成接口（列表页 AI 入口跳转后调用） */
export const postAiModelFinish = (data: {
  accountId: number;
  productId: number;
  userContent: string;
  scope?: number;
  scopeValue?: string;
  factorPrefId?: number;
}) =>
  request<{ code: number; msg: string; data: unknown; lang: null }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelFinish',
    data,
  });
