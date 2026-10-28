/*
 * @Author: 张明尧
 * @Date: 2022-09-02 15:50:22
 */
import { request } from '@src/api/request';
import { FetchNewPage } from '@src/components/TableUtil/types/util';
import { AxiosResponse } from 'axios';

import { ProductImportParams, ProductImportTableData } from './type';

/** 获取产品导入的数据 */
export function getFileProductImportApi(
  params: ProductImportParams & FetchNewPage,
) {
  return request<AxiosResponse<ProductImportTableData>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

/** 产品库 - 确认导入 */
export function postFileImportProductApi(data: {
  fileUrl: string;
  fileName?: string;
}) {
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/upload`,
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

/** 快速核算 - 确认导入 */
export function postFileImportAccountEmissionApi(data: {
  fileUrl: string;
  accountId?: string;
  fileName?: string;
}) {
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/upload?accountId=${data.accountId}`,
    data: FD,
  });
}
