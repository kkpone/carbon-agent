/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-01-09 14:39:38
 * @Date: 2023-01-09 11:18:12
 * @@description: 核算模型 接口
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { BackTableData } from '../type';
import {
  AddQuickEmissionSource,
  BusinessAccountingModelAdd,
  BusinessAccountingModelCopy,
  BusinessAccountingModelEdit,
  BusinessAccountingModelEmissionData,
  BusinessAccountingModelEmissionParams,
  BusinessAccountingModelInfo,
  BusinessAccountingModelTableData,
  BusinessAccountingModelTableParams,
  QuickEmissionSourceInfo,
  QuickModelMenusList,
} from './type';

/** 核算模型 - 列表数据 */
export function getBusinessAccountingModelTableData(
  params: Partial<BusinessAccountingModelTableParams> & {
    pageNum: number;
    pageSize: number;
  },
) {
  return request<
    AxiosResponse<BackTableData<BusinessAccountingModelTableData>>
  >({
    method: 'get',
    url: `footprint3/model/list`,
    params,
  });
}

/** 核算模型 - 新增模型 */
export function postBusinessAccountingModelAdd(
  data: BusinessAccountingModelAdd,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/add`,
    data,
  });
}

/** 核算模型 - 编辑模型 */
export function postBusinessAccountingModelEdit(
  data: BusinessAccountingModelEdit,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/edit`,
    data,
  });
}

/** 核算模型 - 复制模型 */
export function postBusinessAccountingModelCopy(
  data: BusinessAccountingModelCopy,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/copy`,
    data,
  });
}

/** 核算模型 - 删除模型 */
export function postBusinessAccountingModelDelete(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/delete`,
    data,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 获取菜单 */
export function getQuickModelMenus(params: { id: string }) {
  return request<AxiosResponse<QuickModelMenusList[]>>({
    method: 'get',
    url: `footprint3/model/menu`,
    params,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 获取详细信息 */
export function getQuickModelInfo(params: { id: string }) {
  return request<AxiosResponse<BusinessAccountingModelInfo>>({
    method: 'get',
    url: `footprint3/model/info`,
    params,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 排放源列表 */
export function getQuickModelEmissionData(
  params: BusinessAccountingModelEmissionParams,
) {
  return request<
    AxiosResponse<BackTableData<BusinessAccountingModelEmissionData[]>>
  >({
    method: 'get',
    url: `footprint3/modelEmission/list`,
    params,
  });
}

/** 核算模型 - 新增模型 */
export function postBusinessAccountingQuickModelEmissionAdd(
  data: AddQuickEmissionSource,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/add`,
    data,
  });
}

/** 核算模型 - 编辑模型 */
export function postBusinessAccountingQuickModelEmissionEdit(
  data: QuickEmissionSourceInfo,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/edit`,
    data,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 删除排放源 */
export function postBusinessAccountingModelEmissionDelete(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/delete`,
    data,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 排放源详情 */
export function getBusinessAccountingModelEmissionInfo(params: { id: string }) {
  return request<AxiosResponse<QuickEmissionSourceInfo>>({
    method: 'get',
    url: `footprint3/modelEmission/info`,
    params,
  });
}

/** 核算模型 - 核算管理 - 快速核算 - 保存倒库 */
export function postBusinessAccountingModelEmissionSave(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/inStore`,
    data,
  });
}
