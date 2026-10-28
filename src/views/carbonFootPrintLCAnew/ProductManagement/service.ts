import { request, ResponseData, IPageList } from '@src/api/request';

import { Product, Request } from './type';

/**
 * @description 产品信息列表
 */
export const getProductionList = (params: Request) =>
  request<ResponseData<IPageList<Product>>>({
    method: 'GET',
    url: '/lca2/product/page',
    params,
  });

/**
 * @description 产品信息新增
 */
export const postProductionAdd = (data: Product) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/product/add',
    data,
  });

/**
 * @description 产品信息编辑
 */
export const postProductionEdit = (data: Product) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/product/edit',
    data,
  });

/**
 * @description 产品信息详情
 */
export const getProductionDetail = (params: { id: number }) =>
  request<ResponseData<Product>>({
    method: 'GET',
    url: `/lca2/product/${params.id}`,
    params,
  });

/**
 * @description 产品信息删除
 */
export const postProductionDelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/product/delete',
    data,
  });

/**
 * @description 生成产品流ilcd
 */
export const getProductIlcd = (params: { productId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: '/lca2/ccdb/product/ilcd/flow',
    params,
  });

/**
 * @description 生成过程ilcd
 */
export const getProcessIlcd = (params: { processId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: '/lca2/ccdb/process/ilcd/flow',
    params,
  });

/**
 * @description 产品信息详情-ccdbURL
 */
export const getProductionDetailURL = (params: { processId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: `/lca2/ccdb/process/ccdbUrl`,
    params,
  });
/**
 * @description 生成过程ilcd
 */
export const getProcessIlcdByModelId = (params: { modelId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: '/lca2/ccdb/model/ilcd/flow',
    params,
  });

/**
 * @description 产品信息详情-ccdbURL
 */
export const getProductionDetailURLByModelId = (params: { modelId: number }) =>
  request<ResponseData<string>>({
    method: 'GET',
    url: `/lca2/ccdb/model/ccdbUrl`,
    params,
  });
