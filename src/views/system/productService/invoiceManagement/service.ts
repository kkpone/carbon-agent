/*
 * @Author: 张明尧
 * @Date: 2022-10-15 14:58:29
 */
import { request } from '@src/api/request';
import store from '@src/store';
import { AxiosResponse } from 'axios';
import { InvoiceManagementTableData } from './type';

/** 获取发票管理的列表数据 */
export function getProductServiceInvoiceList(params: {
  page: number;
  size: number;
}) {
  return request<AxiosResponse<InvoiceManagementTableData>>({
    method: 'get',
    url: `management/invoice/list`,
    params: {
      companyId:
        Number(store.getState().companyUserInfo.userInfo?.companyId) || 0,
      ...params,
    },
  });
}

/** 获取发票管理的列表数据 */
export function getProductServiceInvoiceTotal() {
  return request<{ data: number }>({
    method: 'get',
    url: `management/invoice/total`,
  });
}
