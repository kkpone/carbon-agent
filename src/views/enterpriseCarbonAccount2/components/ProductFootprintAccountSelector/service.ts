import { request } from '@/api/request';

import {
  AccountReferListParams,
  AccountReferPageResponse,
  ProductReferListParams,
  ProductReferPageResponse,
} from './types';

export function getProductReferList(
  params: ProductReferListParams,
  signal?: AbortSignal,
) {
  return request<ProductReferPageResponse>({
    method: 'get',
    url: '/enterprise/source/account/refer/products',
    params,
    signal,
  });
}

export function getAccountReferList(
  params: AccountReferListParams,
  signal?: AbortSignal,
) {
  return request<AccountReferPageResponse>({
    method: 'get',
    url: '/enterprise/source/account/refer/accounts',
    params,
    signal,
  });
}
