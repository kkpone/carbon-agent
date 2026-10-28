import { request, ResponseData } from '@src/api/request';

import { SupplierData } from './type';

/**
 * @description 供应商数据列表
 */
export const getSupplyDataList = (params: { productId: number }) =>
  request<ResponseData<SupplierData[]>>({
    method: 'GET',
    url: '/lca/supplierData/list',
    params,
  });

/**
 * @description 供应商数据导入
 */
export const postImportSupplyData = (data: {
  fileName?: string;
  fileUrl?: string;
  productId: string;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/supplierData/importSupplierData`,
    data,
  });
