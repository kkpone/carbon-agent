/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-16 11:49:51
 * @Date: 2023-05-11 09:41:41
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ImportParams, OutImportTableList } from './type';

/** 输出 - 获取导入的列表数据 */
export function getFileOutImportApi(params: ImportParams) {
  return request<AxiosResponse<OutImportTableList[]>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

/** 输出 - 确认导入 */
export function postFileImportProcessOutApi(
  data: { fileUrl: string; fileName?: string },
  params: { accountId: string; processId: string },
) {
  const { accountId, processId } = params;
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');

  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountProcessOut/upload?accountId=${accountId}&processId=${processId}`,
    data: FD,
  });
}

/** 过程核算 - 输入(排放源) - 确认导入 */
export function postFileImportProcessInApi(
  data: { fileUrl: string; fileName?: string },
  params: { accountId: string; processId: string },
) {
  const { accountId, processId } = params;
  const FD = new FormData();

  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountProcessIn/upload?accountId=${accountId}&processId=${processId}`,
    data: FD,
  });
}

/** 循环调用文件接口数据是否异步导入完毕 */
export function getSysFileStatus(params: { id: number }) {
  return request<{ data: number }>({
    method: 'get',
    url: `/footprint3/sysImportRecord/status`,
    params,
  });
}
