/*
 * @Author: 张明尧
 * @Date: 2022-10-15 14:58:29
 */
import { request } from '@src/api/request';
import { InvoiceWriteInvoiceAdd } from '../type';

/** 填写发票 */
export function postWriteInvoiceAdd(data: InvoiceWriteInvoiceAdd) {
  return request<{ code: number }>({
    method: 'post',
    url: `management/invoice/add`,
    data,
  });
}
