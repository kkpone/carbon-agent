import { request } from '@src/api/request';

import { Supplier, SupplierCarbonData, SupplierDataSearchParams } from './type';

export const getSupplierList = (params?: {
  status?: number;
  inviteStatus?: number;
}) =>
  request<{ rows: Supplier[] }>({
    method: 'GET',
    url: `/chain/supplier/list`,
    params,
  });

export const getSupplierCarbonDataList = (
  params: Omit<SupplierDataSearchParams, 'supplierIds'> & {
    pageNum: number;
    pageSize: number;
    supplierIds?: string;
  },
) =>
  request<{ rows: SupplierCarbonData[]; total: number }>({
    method: 'GET',
    url: '/chain/data/inner/footprint/list2',
    params,
  });
