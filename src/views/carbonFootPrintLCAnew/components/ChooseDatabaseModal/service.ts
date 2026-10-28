import { IPageList, ResponseData, request } from '@/api/request';

import { DatabaseRequest, LcaFactor } from './type';

/**
 * @description 选择数据库的列表
 */
export const getChooseDatabaseList = (params: DatabaseRequest) =>
  request<ResponseData<IPageList<LcaFactor>>>({
    method: 'GET',
    url: '/management/lcaDb/factor/page',
    params,
  });
