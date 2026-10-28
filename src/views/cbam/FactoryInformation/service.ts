import { request, ResponseData, IPageList } from '@src/api/request';

import { FactoryResp, FactoryRequest } from './type';

/**
 * @description 工厂信息列表
 */
export const getFactoryList = (params: FactoryRequest) =>
  request<ResponseData<IPageList<FactoryResp>>>({
    method: 'GET',
    url: '/cbam2/factory',
    params,
  });

/**
 * @description 工厂信息新增
 */
export const postFactoryAdd = (data: FactoryResp) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/cbam2/factory',
    data,
  });

/**
 * @description 工厂信息编辑
 */
export const putFactoryEdit = (data: FactoryResp) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'PUT',
    url: '/cbam2/factory',
    data,
  });

/**
 * @description 工厂信息详情
 */
export const getFactoryDetail = (params: { id: number }) =>
  request<ResponseData<FactoryResp>>({
    method: 'GET',
    url: `/cbam2/factory/${params.id}`,
    params,
  });

/**
 * @description 工厂信息删除
 */
export const deleteFactoryDelete = (params: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'DELETE',
    url: `/cbam2/factory/${params.id}`,
    params,
  });
