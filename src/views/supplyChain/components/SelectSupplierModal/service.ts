import { request } from '@src/api/request';

import { Supplier } from '../../type';

export const getSelectSupplierList = (params: {
  pageNum: number;
  pageSize: number;
  purchaseGoodsId: number;
  companyName?: string;
  companyNumber?: string;
}) =>
  request<{
    rows: Supplier[];
    total: number;
  }>({
    method: 'get',
    url: '/chain/goods/select/supplier/list',
    params,
  });
