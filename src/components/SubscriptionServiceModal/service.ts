import { request } from '@src/api/request';
import { CancelToken } from 'axios';

import {
  GoodsPersonalResponse,
  OrderDetailsPersonal,
  OrderPayStatusPersonal,
  SubmitOrderPersonalResponse,
} from './type';

/**
 * 获取个人商品信息
 */
export const getGoodsPersonal = data =>
  request<GoodsPersonalResponse>({
    method: 'post',
    url: '/management/goods/getGoodsPersonal',
    data: {
      page: 1,
      size: 1000,
      online: 1,
      status: 0,
      ...data,
    },
  });

/**
 * 提交个人订单
 */
export const submitOrderPersonal = (data: {
  orderGoods: { goodsId: string; priceId: number; goodsType: string }[];
  companyId: number;
}) =>
  request<SubmitOrderPersonalResponse>({
    method: 'post',
    url: '/management/orders/submitSkuOrderPersonal',
    data,
  });

/**
 * 获取订单详情
 */
export const getOrderDetailsPersonal = (
  params: { orderId: string },
  cancelToken?: CancelToken,
) =>
  request<{ data: OrderDetailsPersonal }>({
    method: 'get',
    url: '/management/orders/orderDetail',
    params,
    cancelToken,
  });

/**
 * 获取订单支付状态
 */
export const getOrderPayStatusPersonal = (
  params: { orderId: string },
  cancelToken?: CancelToken,
) =>
  request<{
    data: OrderPayStatusPersonal;
  }>({
    method: 'get',
    url: '/management/orders/payQuery',
    params,
    cancelToken,
  });
