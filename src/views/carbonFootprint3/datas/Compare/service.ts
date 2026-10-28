import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ProductData } from './types';

export function getCompareList(params: { pageNum: number; pageSize: number }) {
  return request<AxiosResponse<{ data: ProductData[]; total: number }>>({
    method: 'get',
    url: `footprint3/dashboard/compare/CompareList`,
    params,
  });
}

export function deleteCompareInfo(params: { id: number }) {
  return request<AxiosResponse<{ data: ProductData[] }>>({
    method: 'post',
    url: `footprint3/dashboard/compare/deleteCompareInfo`,
    params,
  });
}
