import { request, ResponseData, IPageList } from '@src/api/request';

import { Product, Request } from './type';

/**
 * @description 产品信息列表
 */
export const getProductionList = (params: Request) =>
  request<ResponseData<IPageList<Product>>>({
    method: 'GET',
    url: '/lca/product/page',
    params,
  });

/**
 * @description 产品信息新增
 */
export const postProductionAdd = (data: Product) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/product/add',
    data,
  });

/**
 * @description 产品信息编辑
 */
export const postProductionEdit = (data: Product) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/product/edit',
    data,
  });

/**
 * @description 产品信息详情
 */
export const getProductionDetail = (params: { id: number }) =>
  request<ResponseData<Product>>({
    method: 'GET',
    url: `/lca/product/${params.id}`,
    params,
  });

/**
 * @description 产品信息删除
 */
export const postProductionDelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/product/delete',
    data,
  });
