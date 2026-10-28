import { request } from '@src/api/request';

import { OverviewInfo } from './type';
import { Supplier } from '../type';

export const getOverviewInfo = () =>
  request<{ data: OverviewInfo }>({
    url: '/chain//supplier/joinInfo',
  });

export const getSupplierList = (params: {
  pageNum: number;
  pageSize: number;
  companyName?: string;
  inviteStatus?: number | string;
  status?: number;
}) =>
  request<{ total: number; rows: Supplier[] }>({
    method: 'GET',
    url: '/chain/supplier/list',
    params,
  });

export const editSupplierStatus = (params: {
  supplierId: number;
  status: number;
}) =>
  request({
    method: 'GET',
    url: '/chain/supplier/editStatus',
    params,
  });

export const inviteSupplier = (params: { supplierId: number }) =>
  request({
    method: 'GET',
    url: '/chain/supplier/invite',
    params,
  });
