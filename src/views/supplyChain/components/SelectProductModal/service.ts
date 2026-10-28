import { request } from '@src/api/request';

import { PurchaseProduct } from '../../type';

export const getSelectProductList = (params: {
  pageNum: number;
  pageSize: number;
  supplierId: number;
  name?: string;
}) =>
  request<{
    rows: PurchaseProduct[];
    total: number;
  }>({
    method: 'get',
    url: '/chain/supplier/select/goods',
    params,
  });
