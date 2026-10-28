/*
 * @Author: 张明尧
 * @Date: 2022-09-02 15:50:22
 */
import { request } from '@src/api/request';
import { FetchNewPage } from '@src/components/TableUtil/types/util';
import { AxiosResponse } from 'axios';
import { ProductImportParams, ProductImportTableData } from './type';

/** 导入的数据 */
export function getFileProductImportApi(
  params: ProductImportParams & FetchNewPage,
) {
  return request<AxiosResponse<ProductImportTableData>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

/** 输入 - 确认导入 */
export function postFileImportProcessInApi(
  data: { fileUrl: string },
  params: { accountId: string; processId: string },
) {
  const { accountId, processId } = params;
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountProcessIn/upload?accountId=${accountId}&processId=${processId}`,
    data: FD,
  });
}

/** 产品库 - 下载模版 */
export function getFileImportProductTemplate() {
  return request<AxiosResponse<string>>({
    method: 'get',
    url: `/footprint3/product/download/tpl`,
  });
}
