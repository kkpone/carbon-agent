/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 17:50:12
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

import { QuickBusinessAccountingSourceInfo } from '../carbonFootprint3/QuickBusinessAccounting/type';
import { EnterpriseCategorys } from '../enterpriseCarbonAccount2/utils/type';
// import { Dicts } from '../emission/Show/type';
import {
  BackTableData,
  DataBackType,
  DataSourceListTableData,
  FootprintAccountEmissionListTableData,
  FootprintAccountInfoBackData,
  FootprintAccountMenusBackData,
  Pages,
} from './type';

/**
 * @description 数据概览
 * @param params
 * @returns
 */
export function apiChainData(id) {
  return request<AxiosResponse<DataBackType>>({
    method: 'get',
    url: `/chain/data/${id}`,
  });
}

/**
 * @description 企业碳核算过程->排放源列表
 * @param params
 * @returns
 */
export function apiDataSourceList(params: { categoryId: number } & Pages) {
  return request<AxiosResponse<BackTableData<DataSourceListTableData[]>>>({
    method: 'get',
    url: `/chain/data/source/list`,
    params,
  });
}

/**
 * @description 企业碳核算过程->分类列表
 * @param params
 * @returns
 */
export function apiComputationCategoryList(params: { id: number | string }) {
  return request<AxiosResponse<EnterpriseCategorys[]>>({
    method: 'get',
    url: `/chain/data/computation/category/list`,
    params,
  });
}

/**
 * @description 产品碳足迹过程->排放源分类
 * @param params
 * @returns
 */
export function apiFootprintAccountMenus(
  params: { id: number | string },
  isChaniApi,
) {
  const url = isChaniApi
    ? `/chain/data/inner/footprint/account/menus`
    : '/footprint3/account/menu';

  return request<AxiosResponse<FootprintAccountMenusBackData[]>>({
    method: 'get',
    url,
    params,
  });
}
/**
 * @description 产品碳足迹过程->排放源列表
 * @param params
 * @returns
 */
export function apiFootprintAccountEmissionList(
  params: { accountId: number | string; stage: string } & Pages,
  isChaniApi,
) {
  const url = isChaniApi
    ? `/chain/data/inner/footprint/accountEmission/list`
    : '/footprint3/accountEmission/list';

  return request<AxiosResponse<FootprintAccountEmissionListTableData[]>>({
    method: 'get',
    url,
    params,
  });
}
/**
 * @description 产品碳足迹->核算产品详情
 * @param params
 * @returns
 */
export function apiFootprintAccountInfo(
  params: { id: number | string },
  isChaniApi,
) {
  const url = isChaniApi
    ? `/chain/data/inner/footprint/account/info`
    : '/footprint3/account/info';

  return request<AxiosResponse<FootprintAccountInfoBackData>>({
    method: 'get',
    url,
    params,
  });
}
/** 快速核算 - 核算管理  - 排放源信息 */
export function getQuickBusinessAccountingEmissionInfo(
  params: { id: string },
  isChaniApi,
) {
  const url = isChaniApi
    ? `chain/data/outer/footprint/accountEmission/info`
    : 'footprint3/accountEmission/info/supplier';
  return request<AxiosResponse<QuickBusinessAccountingSourceInfo>>({
    method: 'get',
    url,
    params,
  });
}
