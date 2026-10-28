/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 15:30:30
 * @Date: 2023-02-03 10:06:14
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  QuickBusinessAccountingAddBasic,
  QuickBusinessAccountingEditBasic,
  QuickBusinessAccountingEmissionParams,
  QuickBusinessAccountingInfo,
  QuickBusinessAccountingSource,
  QuickBusinessAccountingSourceInfo,
  QuickBusinessAccountingSourceUpdate,
  QuickBusinessAccountingTableData,
  QuickBusinessAccountingTableParams,
} from './type';
import {
  BusinessAccountingModelAdd,
  BusinessAccountingModelEmissionData,
  QuickModelMenusList,
} from '../BusinessAccountingModel/type';
import { BackTableData } from '../type';

/** 快速核算 - 列表数据 */
export function getQuickBusinessAccountingTableData(
  params: Partial<QuickBusinessAccountingTableParams> & {
    pageNum: number;
    pageSize: number;
  },
) {
  return request<
    AxiosResponse<BackTableData<QuickBusinessAccountingTableData>>
  >({
    method: 'get',
    url: `footprint3/account/list`,
    params: { ...params, type: 0 },
  });
}

/** 新增核算基础信息 */
export const postQuickBusinessAccountingBasic = (
  data: QuickBusinessAccountingAddBasic,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/save',
    data,
  });

// 保存并建模
export const postQuickBusinessAccountingSaveAndView = (
  data: QuickBusinessAccountingAddBasic,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/saveAndView',
    data,
  });

// 复制并建模
export const postQuickBusinessAccountingCopyAndView = (
  data: QuickBusinessAccountingAddBasic,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/copyAndView',
    data,
  });

/** 编辑核算基础信息 */
export const postQuickBusinessAccountingEditBasic = (
  data: QuickBusinessAccountingEditBasic,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/edit',
    data,
  });

/** 复制核算基础信息 */
export const postQuickBusinessAccountingCopyBasic = (
  data: QuickBusinessAccountingEditBasic,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/copy',
    data,
  });

/** 删除快速核算列表数据 */
export const postQuickBusinessAccountingDeleteBasic = (data: {
  id: string | number;
}) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/delete',
    data,
  });

/** 快速核算 - 核算管理  - 获取菜单 */
export function geQuickBusinessAccountingMenus(params: { id: string }) {
  return request<AxiosResponse<QuickModelMenusList[]>>({
    method: 'get',
    url: `footprint3/account/menu`,
    params,
  });
}

/** 快速核算 - 核算管理  - 获取详细信息 */
export function getQuickBusinessAccountingInfo(
  params: { id: string },
  isChain?: boolean,
) {
  const url = isChain
    ? 'chain/data/inner/footprint/account/info'
    : 'footprint3/account/info';
  return request<AxiosResponse<QuickBusinessAccountingInfo>>({
    method: 'get',
    url,
    params,
  });
}

/** 快速核算 - 核算管理  - 排放源列表 */
export function getQuickBusinessAccountingEmissionData(
  params: QuickBusinessAccountingEmissionParams,
) {
  return request<
    AxiosResponse<BackTableData<BusinessAccountingModelEmissionData>>
  >({
    method: 'get',
    url: `footprint3/accountEmission/list`,
    params,
  });
}

/** 快速核算 - 核算管理  - 新增排放源 */
export function postQuickBusinessAccountingEmissionAdd(
  data: QuickBusinessAccountingSource,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/add`,
    data,
  });
}

/** 快速核算 - 核算管理  - 编辑排放源 */
export function postQuickBusinessAccountingEmissionEdit(
  data: QuickBusinessAccountingSource & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/edit`,
    data,
  });
}

/** 快速核算 - ai临时列表核算管理  - 编辑排放源 */
export function postAiQuickBusinessAccountingEmissionEdit(
  data: QuickBusinessAccountingSource & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editTmpCheck`,
    data,
  });
}

/** 快速核算-新增排放源（请求供应商收数） */
export function postQuickBusinessAccountingEmissionSupplierAddAndRequest(
  data: QuickBusinessAccountingSource,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/addAndRequest`,
    data,
  });
}

/** 快速核算-编辑排放源（请求供应商收数） */
export function postQuickBusinessAccountingEmissionSupplierEditAndRequest(
  data: QuickBusinessAccountingSource & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editAndRequest`,
    data,
  });
}

/** 快速核算- ai临时 - 编辑排放源（请求供应商收数） */
export function postAiSupplierEditAndRequest(
  data: QuickBusinessAccountingSource & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editAndRequestTmp`,
    data,
  });
}

/** 快速核算 - 核算管理  - 修改数量 */
export function postQuickBusinessAccountingEmissionUpdate(
  data: QuickBusinessAccountingSourceUpdate,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/updateAmount`,
    data,
  });
}

/** 快速核算 - 核算管理  - 排放源信息 */
export function getQuickBusinessAccountingEmissionInfo(params: {
  id: string;
  aiStatus?: number;
}) {
  return request<AxiosResponse<QuickBusinessAccountingSourceInfo>>({
    method: 'get',
    url: `footprint3/accountEmission/info`,
    params,
  });
}

/** 快速核算 - ai临时 核算管理  - 排放源信息 */
export function getAiQuickBusinessAccountingEmissionInfo(params: {
  id: string;
}) {
  return request<AxiosResponse<QuickBusinessAccountingSourceInfo>>({
    method: 'get',
    url: `footprint3/accountEmission/infoTmp`,
    params,
  });
}

/** 快速核算 - 核算管理 - 删除排放源 */
export function postQuickBusinessAccountingEmissionDelete(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/delete`,
    data,
  });
}

/** 快速核算 - 核算管理 - 保存到库 */
export function postQuickBusinessAccountingEmissionInStore(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/inStore`,
    data,
  });
}

/** 快速核算 - 核算管理 - 保存到模型 */
export function postQuickBusinessAccountingEmissionInModel(
  data: Omit<BusinessAccountingModelAdd, 'type'> & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/account/inModel`,
    data,
  });
}

/** 快速核算 - 核算管理 - 保存到库 */
export function postQuickBusinessAccountingEmissionExportExcel(params: {
  id: string | number;
}) {
  return request<{ code: number; data: string }>({
    method: 'get',
    url: `footprint3/account/export/excel/`,
    params,
  });
}

/** 快速核算 - 核算管理 - 排放源 - 自动填写换算比例 */
export function postQuickBusinessAccountingEmissionUnitRate(params: {
  unitName: string;
  factorUnit: string;
  name?: string;
}) {
  return request<{ code: number; data: string }>({
    method: 'get',
    url: `footprint3/factor/unitRate`,
    params,
  });
}

/** 切换生命周期 */
export const postQuickBusinessAccountingScopeUpdate = (data: {
  id: number | string;
  scope: number;
}) =>
  request<{ code: number; data: string }>({
    method: 'post',
    url: `footprint3/account/updateScope`,
    data,
  });

/** 去建模 */
export const postQuickBusinessAccountingToModel = (data: {
  id: number | string;
}) =>
  request<{ code: number; data: string }>({
    method: 'post',
    url: `footprint3/account/addView`,
    data,
  });

/** 生成碳足迹结果 */
export const postQuickBusinessAccountingResult = (data: {
  id: number | string;
}) =>
  request<{ code: number; data: string }>({
    method: 'post',
    url: `footprint3/account/finish`,
    data,
  });
