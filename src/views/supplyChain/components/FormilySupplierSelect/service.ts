import { request } from '@src/api/request';

import { SupplierSelectOptions } from './type';

export const searchSupplier = (params: { companyName: string }) =>
  request<{ data: SupplierSelectOptions }>({
    method: 'GET',
    url: '/chain/supplier/like/search',
    params,
  });
