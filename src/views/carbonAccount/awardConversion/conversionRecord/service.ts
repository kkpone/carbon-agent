/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-06-30 18:12:04
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 18:04:58
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  ApiGetConversionRecordInfo,
  CarbonAccountConversionRecordTable,
  CarbonAccountConversionRecordTableGetParams,
} from './type';

// 兑换记录的列表
export function ApiConversionRecordListGet(
  params: CarbonAccountConversionRecordTableGetParams,
) {
  return request<AxiosResponse<CarbonAccountConversionRecordTable>>({
    method: 'get',
    url: `/carbonAccount/orders/list`,
    params,
  });
}

// 兑换详情
export function ApiConversionRecordListUInfo(
  params: Pick<CarbonAccountConversionRecordTable, 'id'>,
) {
  return request<ApiGetConversionRecordInfo>({
    method: 'get',
    url: `/carbonAccount/orders/info`,
    params,
  });
}

// 完成兑换
export function ApiConversionRecordListUpdateStatus(
  data: Pick<CarbonAccountConversionRecordTable, 'orderStatus' | 'id'>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/orders/updateStatus`,
    data,
  });
}

// 导出
export function ApiOrdersExportExcel(params: {
  begTime: string;
  endTime: string;
  excelName: string;
}) {
  return request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/orders/export/excel`,
    params,
  });
}
