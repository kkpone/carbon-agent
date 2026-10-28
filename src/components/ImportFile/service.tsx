import { request, ResponseData, IPageList } from '@src/api/request';

import { ImportLogReq, ImportLogResp } from './type';

/**
 * @description 导入历史列表
 */
export const getImportLogList = (params: ImportLogReq) =>
  request<ResponseData<IPageList<ImportLogResp>>>({
    method: 'GET',
    url: `/management/importLog/page`,
    params,
  });
