import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ProductListApi, ProductListInfo, ProductListParams } from './types';

/** 对比产品的产品下拉 */
export function getProductListData(params: ProductListParams) {
  return request<AxiosResponse<ProductListApi>>({
    method: 'get',
    url: `footprint3/dashboard/compare/accountName/list`,
    params,
  });
}

/** 获取产品的详情 */
export function getProductListInfoData(params: { id: number }) {
  return request<AxiosResponse<ProductListInfo>>({
    method: 'get',
    url: `footprint3/dashboard/compare/detail`,
    params,
  });
}
