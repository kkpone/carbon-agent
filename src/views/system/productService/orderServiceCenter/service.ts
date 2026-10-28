/*
 * @Author: 张明尧
 * @Date: 2022-10-14 09:53:42
 */
import { request } from '@src/api/request';
import store from '@src/store';
import { AxiosResponse } from 'axios';
import {
  OrderPayStatusBack,
  OrderProductListDetail,
  OrderServiceCenterList,
  SubOrderApiData,
  SubOrderData,
} from './type';

/** 获取服务中心的列表数据 */
export function getProductServiceOrderServiceCenterList() {
  return request<AxiosResponse<OrderServiceCenterList[]>>({
    method: 'get',
    url: `management/company/products`,
    params: {
      companyId:
        Number(store.getState().companyUserInfo.userInfo?.companyId) || 0,
    },
  });
}

/** 获取续订的信息明细 */
export function getProductListDetail(id: string | number) {
  return request<AxiosResponse<OrderProductListDetail>>({
    method: 'get',
    url: `management/goods/goodsDetail`,
    params: {
      productId: id,
    },
  });
}

/** 提交订单 */
export function postSubOrder(data: SubOrderData) {
  return request<AxiosResponse<SubOrderApiData>>({
    method: 'post',
    url: `management/orders/submitOrder`,
    data: {
      orderGoods: [data],
    },
  });
}
/** 获取订单支付结果 */
export function getOrderServiceCenterPayStatus(params: { orderId: string }) {
  return request<AxiosResponse<OrderPayStatusBack>>({
    method: 'get',
    url: `management/orders/payQuery`,
    params,
  });
}
