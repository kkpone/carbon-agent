/*
 * @Author: 张明尧
 * @Date: 2022-10-15 14:58:29
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { OrderRecordListDetail, OrderRecordTableData } from './type';

/** 获取订购记录的列表数据 */
export function getProductServiceOrderRecordList(params: {
  page: number;
  size: number;
}) {
  return request<AxiosResponse<OrderRecordTableData>>({
    method: 'get',
    url: `management/orders/list`,
    params,
  });
}

/** 订购记录的详细订单信息 */
export function getProductServiceOrderListDetail(params: { orderId: string }) {
  return request<AxiosResponse<OrderRecordListDetail>>({
    method: 'get',
    url: `management/orders/orderDetail`,
    params,
  });
}

/** 取消订单 */
export function postCloseOrder(data: FormData) {
  return request<{ code: number }>({
    method: 'post',
    url: `management/orders/closeOrder`,
    data,
  });
}
