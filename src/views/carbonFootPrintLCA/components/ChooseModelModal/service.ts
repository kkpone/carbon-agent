import { IPageList, ResponseData, request } from '@/api/request';

import { ChooseModel, ChooseModelRequest } from './type';

/**
 * @description 选择模型的列表
 */
export const getChooseModelList = (params: ChooseModelRequest) =>
  request<ResponseData<IPageList<ChooseModel>>>({
    method: 'GET',
    url: '/lca/model/ref/page',
    params,
  });
