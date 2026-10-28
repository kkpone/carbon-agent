import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ResponseDataType } from './type';

export function getProductInfo(params: { id: string; compareId: string }) {
  return request<AxiosResponse<ResponseDataType>>({
    method: 'get',
    url: `footprint3/dashboard/compare/productInfo`,
    params,
  });
}

export function saveCompareInfo(data: {
  accountId: string;
  compareAccountId: string;
}) {
  return request<AxiosResponse<ResponseDataType>>({
    method: 'post',
    url: `footprint3/dashboard/compare/saveCompareInfo`,
    data,
  });
}
