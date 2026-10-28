import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { CommonProductListData } from '../../type';

/** 查询数据质量 - 评价范围 */
export function getReportScope(params: { accountType: number }) {
  return request<{ data: any }>({
    method: 'get',
    url: `footprint3/report/scope`,
    params,
  });
}

/**
 * 获取指定报告的产品列表
 * @param params 包含报告ID的对象
 * @param params.id 报告的唯一标识符
 */
export function getProductsOfReport(params: { id: number }) {
  return request<AxiosResponse<CommonProductListData[]>>({
    method: 'get',
    url: `footprint3/report/productsOfReport`,
    params,
  });
}

export function getReportFile(params: { reportId: number }) {
  return request<AxiosResponse<{ name: string; url: string }>>({
    method: 'get',
    url: `footprint3/report/create`,
    params,
  });
}

export const getCarbonLabelProductType = () =>
  request<{ data: { value: number; label: string }[] }>({
    method: 'get',
    url: 'footprint3/report/productTypes',
  });

export const getStageEmissions = params =>
  request<{ data: Record<number, any> }>({
    url: 'footprint3/report/accountEmissions',
    params,
    debounced: true,
  });
