import { request, ResponseData, IPageList } from '@src/api/request';

import {
  LifeCycleDataImportRequest,
  LifeCycleDataRequest,
  LifeCycleDataResponse,
} from './type';

/**
 * @description 生命周期数据列表
 */
export const getLifeCycleDataList = (params: LifeCycleDataRequest) =>
  request<ResponseData<IPageList<LifeCycleDataResponse>>>({
    method: 'GET',
    url: '/lca/impProcess/page',
    params,
  });

/**
 * @description 生命周期数据-详情
 */
export const getLifeCycleDataDetail = (params: { processCode: string }) =>
  request<ResponseData<LifeCycleDataResponse[]>>({
    method: 'GET',
    url: '/lca/impProcess/detail/list',
    params,
  });

/**
 * 生命周期数据导入
 */
export const postLifeCycleDataImport = (data: LifeCycleDataImportRequest) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca/impProcess/importProcess',
    data,
  });
