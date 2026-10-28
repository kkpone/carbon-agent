/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-07 16:49:21
 * @Date: 2023-06-06 16:26:52
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  AccountMaxCardTotal,
  AccountNameListApi,
  EmissionTotalComparisonChartData,
  EmissionTotalComparisonData,
  EmissionTotalListData,
  EmissionTotalRankingChartData,
  GreenSupplierInfo,
  GreenSupplierListParams,
  PageReturn,
  SankeyChartData,
} from './type';

/** 功能单位的列表信息 */
export function getAccountNameList(params: { accountId: number }) {
  return request<AxiosResponse<AccountNameListApi>>({
    method: 'get',
    url: `footprint3/dashboard/accountName/list`,
    params,
  });
}

/** 核算的头部card数据信息 - 总排放量，最大排放环节，最大排放类型，最大排放源 */
export function getAccountCardInfo(params: { accountId: number }) {
  return request<AxiosResponse<AccountMaxCardTotal>>({
    method: 'get',
    url: `footprint3/dashboard/card`,
    params,
  });
}

/** 排放量按环节、按类型分布对比的左侧生命周期比例 */
export function getEmissionTotalComparison(params: { accountId: number }) {
  return request<AxiosResponse<EmissionTotalComparisonData[]>>({
    method: 'get',
    url: `footprint3/dashboard/chart/stage`,
    params,
  });
}

/** 排放量按环节、按类型分布对比的左侧生命周期比例 - 对应的图表数据 */
export function getEmissionTotalComparisonChart(params: {
  accountId: number;
  stage?: number;
}) {
  return request<AxiosResponse<EmissionTotalComparisonChartData>>({
    method: 'get',
    url: `footprint3/dashboard/chart/type`,
    params,
  });
}

/** 排放量TOP10排名 - 对应的图表数据 */
export function getEmissionTotalRankingChart(params: { accountId: number }) {
  return request<AxiosResponse<EmissionTotalRankingChartData[]>>({
    method: 'get',
    url: `footprint3/dashboard/chart/emission`,
    params,
  });
}

/** 排放量详情 - 列表表格展示数据 */
export function getEmissionTotalList(params: { accountId: number }) {
  return request<AxiosResponse<EmissionTotalListData[]>>({
    method: 'get',
    url: `footprint3/dashboard/emission/list`,
    params,
  });
}

/** 桑葚图的数据 */
export function getSankeyChartData(params: { accountId: number }) {
  return request<AxiosResponse<SankeyChartData>>({
    method: 'get',
    url: `footprint3/dashboard/emission/sankey`,
    params,
  });
}

// 供应商管理列表
export const apiGetGreenSupplierList = (params: GreenSupplierListParams) => request<{ data: PageReturn<GreenSupplierInfo> }>({
    method: 'get',
    url: '/management/greenSupplier/list',
    params,
  });
