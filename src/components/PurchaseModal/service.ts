import { request } from '@src/api/request';
import { CancelToken } from 'axios';
import { ValueOf } from 'type-fest';

import { GOODS_MODE, GOODS_ONLINE, GOODS_STATUS } from './constant';
import { Goods, GoodsDetails, OrderDetails, OrderPayStatus } from './type';

export const getGoodsList = (data: {
  page: number;
  size: number;
  mode: ValueOf<typeof GOODS_MODE>;
  online: ValueOf<typeof GOODS_ONLINE>;
  status: ValueOf<typeof GOODS_STATUS>;
}) =>
  request<{ data: { rows: Goods[] } }>({
    method: 'post',
    url: '/management/goods/getGoods',
    data,
  });

export const getGoodsDetails = (params: { goodsId: string }) =>
  request<{ data: GoodsDetails }>({
    method: 'get',
    url: '/management/goods/goodsInfo',
    params,
  });

export const submitOrder = (data: {
  orderGoods: { goodsId: string; priceId: number }[];
}) =>
  request<{ data: { orderId: string } }>({
    method: 'post',
    url: '/management/orders/submitSkuOrder',
    data,
  });

export const getOrderDetails = (
  params: { orderId: string },
  cancelToken?: CancelToken,
) =>
  request<{ data: OrderDetails }>({
    method: 'get',
    url: '/management/orders/orderDetail',
    params,
    cancelToken,
  });

export const getOrderPayStatus = (
  params: { orderId: string },
  cancelToken?: CancelToken,
) =>
  request<{
    data: OrderPayStatus;
  }>({
    method: 'get',
    url: '/management/orders/payQuery',
    params,
    cancelToken,
  });
