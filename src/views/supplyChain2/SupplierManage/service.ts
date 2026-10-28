/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 10:16:07
 */
import { request } from '@api/request';

import { BackTableData } from '../type';
// import { Dicts } from '../emission/Show/type';
import { SupplierParams, SupplierTableData } from './type';

// 供应商管理
/**
 * @description 供应商列表
 * @param params
 * @returns
 */
export function apiSupplierList(
  params: SupplierParams & { pageNum?: number; pageSize?: number },
) {
  return request<BackTableData<SupplierTableData>>({
    method: 'get',
    url: '/chain/supplier/list',
    params,
  });
}
