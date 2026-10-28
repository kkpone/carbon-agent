import { request, ResponseData, IPageList } from '@src/api/request';

import { ParameterRequest, ParameterResp } from './type';

/**
 * @description 参数配置列表
 */
export const getParameterList = (params: ParameterRequest) =>
  request<ResponseData<IPageList<ParameterResp>>>({
    method: 'GET',
    url: '/cbam2/productCategory',
    params,
  });

/**
 * @description 参数配置新增
 */
export const postParameterAdd = (data: ParameterResp) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/cbam2/productCategory',
    data,
  });

/**
 * @description 参数配置编辑
 */
export const putParameterEdit = (data: ParameterResp) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'PUT',
    url: '/cbam2/productCategory/update',
    data,
  });

/**
 * @description 参数配置详情
 */
export const getParameterDetail = (params: { id: number }) =>
  request<ResponseData<ParameterResp>>({
    method: 'GET',
    url: `/cbam2/productCategory/${params.id}`,
    params,
  });

/**
 * @description 参数配置删除
 */
export const deleteParameterDelete = (params: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'DELETE',
    url: `/cbam2/productCategory/${params.id}`,
    params,
  });
