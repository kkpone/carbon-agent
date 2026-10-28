import { request, ResponseData } from '@src/api/request';

import { BomResp } from './type';

/**
 * @description BOM清单列表
 */
export const getBomList = (params: { productId: number }) =>
  request<ResponseData<BomResp[]>>({
    method: 'GET',
    url: '/lca/bom/list',
    params,
  });

/**
 * @description BOM导入
 */
export const postImportBom = (data: {
  fileName?: string;
  fileUrl?: string;
  productId: string;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/bom/importBom`,
    data,
  });
