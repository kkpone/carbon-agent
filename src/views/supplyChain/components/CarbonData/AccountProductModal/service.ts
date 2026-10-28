import { request } from '@src/api/request';
import { CarbonData } from '@src/views/supplyChain/type';

import { AccountProduct } from './type';

export const getAccountProductList = (params: {
  pageNum: number;
  pageSize: number;
  scope?: number;
  unitCode?: string;
  productName?: string;
  productCode?: string;
}) =>
  request<{ data: { total: number; rows: AccountProduct[] } }>({
    method: 'get',
    url: '/footprint3/account/listSupply',
    params,
  });

export const getAccountProductEmission = (params: { accountId: number }) =>
  request<{ data: { year: string } & CarbonData['result'] }>({
    method: 'get',
    url: '/chain/data/footprint/choose',
    params,
  });
