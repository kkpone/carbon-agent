import { request, ResponseData, IPageList } from '@src/api/request';

import { Request, Factor } from './type';

/**
 * @description 选择因子的列表
 */
export const getChooseFactorList = (params: Request) =>
  request<ResponseData<IPageList<Factor>>>({
    method: 'GET',
    url: `/system/factor/page`,
    params,
  });
