import { request } from '@src/api/request';

export const getProductList = (params: {
  pageNum: number;
  pageSize: number;
  name?: string;
}) =>
  request<{ total: number; rows: Record<string, any>[] }>({
    method: 'GET',
    url: '/chain/goods/list',
    params,
  });

export const deleteProduct = (params: { purchaseGoodsId: number }) =>
  request({
    method: 'GET',
    url: '/chain/goods/deleted',
    params,
  });
