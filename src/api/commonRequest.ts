/**
 * @description 下载文件（文件流）
 */

import { request } from '@src/api/request';

import { downloadFileFactor } from '@/utils/fileUtil';

export const getDownloadBlobFile = (params: { file: string }) =>
  request<{ data: Blob | MediaSource }>({
    method: 'POST',
    url: `/file/fileapi/downloadFile`,
    params,
    responseType: 'blob',
  });

// 文件下载（文件流）
export const commonRequestDownloadFile = async (
  url: string,
  fileName: string,
  preview = false,
) => {
  const response = await getDownloadBlobFile({ file: url });
  downloadFileFactor(response?.data, response, fileName, preview, url);
};
