import { request } from '@src/api/request';

import { CategoryData, ClassifyData, CockpitData } from './type';

export const getDataCockpit = (params: {
  period: string;
  foreignId?: number;
  computationId?: number;
  computationPeriod?: string;
  orgId?: number | string;
  sessionId?: string;
  shareId?: string;
}) =>
  request<{ data: CockpitData[] }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataCockpit',
    params,
  });

// 近几年排放量与基准年对比

// 近几年排放强度与基准年对比

// 排放量明细数据

// 排放量分类对比
export const getDataQuantityCateComparison = (params: {
  type: number;
  period: string;
  foreignId?: number;
  computationId?: number;
  computationPeriod?: string;
  orgId?: number | string;
  sessionId?: string;
  shareId?: string;
}) =>
  request<{
    data: { categoryData: CategoryData[]; classifyData: ClassifyData[] };
  }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataQuantityComparison',
    params,
  });

// 获取范围一，二，三的堆叠图

// 获取分流图数据
export const getDataQuantityDiversion = (params: {
  type: number;
  period: string;
  computationId?: number;
  computationPeriod?: string;
  orgId?: number | string;
  sessionId?: string;
  shareId?: string;
}) =>
  request<{
    data: {
      totalYearQuantity: number;
      categoryDataList: {
        emissionQuantity: string;
        category: string;
        classifyDataList: {
          emissionQuantity: string;
          category: string;
          sourceName: string;
        }[];
      }[];
    };
  }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataQuantityDiversion',
    params,
  });
