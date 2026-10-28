import { IPageList, ResponseData, request } from '@/api/request';

import { ChooseProcessLibrary, ChooseProcessLibraryRequest } from './type';

/**
 * @description 选择过程的列表
 */
export const getChooseProcessList = (params: ChooseProcessLibraryRequest) =>
  request<ResponseData<IPageList<ChooseProcessLibrary>>>({
    method: 'GET',
    url: `/lca/processLib/page`,
    params,
  });
