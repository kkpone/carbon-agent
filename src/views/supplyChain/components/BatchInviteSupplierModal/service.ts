import { request } from '@src/api/request';

import {
  InviteSupplier,
  InviteSupplierFilterOptions,
  SearchParams,
} from './type';

export const getInviteSupplierFilterOptions = (params: {
  operateKey: string;
}) =>
  request<{ data: InviteSupplierFilterOptions }>({
    method: 'get',
    url: '/chain/excel/import/list/all',
    params,
  });

export const getInviteSupplierList = (
  params: SearchParams & { operateKey: string },
) =>
  request<{ rows: InviteSupplier[]; total: number; sumTotal: number }>({
    method: 'get',
    url: '/chain/excel/import/list',
    params,
  });

export const editInviteSupplier = (data: InviteSupplier) =>
  request({
    method: 'post',
    url: '/chain/excel/import/supplier/edit',
    data,
  });

export const deleteInviteSupplier = (params: { supplierMiddleId: number }) =>
  request({
    method: 'get',
    url: '/chain/excel/import/supplier/deleted',
    params,
  });
