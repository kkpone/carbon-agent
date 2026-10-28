/*
 * @Author: 张明尧
 * @Date: 2022-10-15 14:58:29
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { OrderRecordTableData } from '../../../orderRecord/type';

/** 获取订购记录的列表数据 */
export function getSelectOrderRecordList(params: {
  page: number;
  size: number;
}) {
  return request<AxiosResponse<OrderRecordTableData>>({
    method: 'get',
    url: `management/orders/list`,
    params: {
      ...params,
      status: 1,
      invoiceFlag: 0,
    },
  });
}
