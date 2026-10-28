import { request } from '@src/api/request';

export const batchInviteSupplier = (data: FormData) =>
  request<{ data: { operateKey: string } }>({
    method: 'post',
    url: '/chain/excel/import',
    data,
  });

export const importSupplier = (params: {
  operateKey: string;
  inviteFlag?: boolean;
}) =>
  request({
    method: 'get',
    url: '/chain/excel/import/supplier/affirm',
    params,
  });
