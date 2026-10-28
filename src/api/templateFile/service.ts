import { request } from '@src/api/request';

/**
 * @description 下载模版文件
 */
export const getDownloadTemplateFile = (params: { templateType: number }) =>
  request<Blob | BlobPart>({
    method: 'GET',
    url: `/file/template/download`,
    params,
    responseType: 'arraybuffer',
  });
