import { request } from '@src/api/request';

export const importPurchaseProduct = (data: FormData) =>
  request({
    method: 'post',
    url: '/chain/purchase/excel/import',
    data,
  });
