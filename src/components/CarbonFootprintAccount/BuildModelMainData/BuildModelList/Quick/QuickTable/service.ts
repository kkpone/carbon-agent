import { request } from '@src/api/request';
import { BackTableData } from '@src/views/carbonFootprint3/type';
import { AxiosResponse } from 'axios';

import {
  QuickAccounEmissionParams,
  QuickAccountEmissionBatchDeleteParams,
  QuickAccountModelEmissionData,
} from './type';

/** 快速核算  - 排放源列表 */
export function getAccountingEmissionData(params: QuickAccounEmissionParams) {
  return request<AxiosResponse<BackTableData<QuickAccountModelEmissionData>>>({
    method: 'get',
    url: `footprint3/accountEmission/list`,
    params,
  });
}

/** 快速核算 - 保存到库 */
export function postQuickAccounEmissionInStore(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/inStore`,
    data,
  });
}

/** 快速核算  - 删除排放源 */
export function postQuickAccountEmissionDelete(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/delete`,
    data,
  });
}

/** 快速核算 - 批量删除正式及临时排放源 */
export function postQuickAccountEmissionBatchDelete(
  data: QuickAccountEmissionBatchDeleteParams,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/batchDelete`,
    data,
  });
}

/**
 * 文章相关的信息类型
 */
export interface ArticleInfo {
  /**
   * 单位编码
   */
  unitCode: string;
  /**
   * 数量
   */
  amount: string;
  /**
   * 核算id
   */
  accountId: string;
  /**
   * 单位
   */
  unitName: string;
  /**
   * 文章ID
   */
  id: number;
  aiFlag?: number;
}

/** 快速核算  - 列表编辑消耗数量 */
export function editListData(data: ArticleInfo) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editListData`,
    data,
  });
}

/** AI 建模 删除临时排放源列表 */
export function postAiQuickAccountEmissionDelete(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/deleteTmp`,
    data,
  });
}
