import { request, ResponseData } from '@src/api/request';

/**
 * @description 导入
 */
export const postImport = (data: {
  fileName?: string;
  fileUrl?: string;
  modelId?: number;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca/model/bomUUID`,
    data,
  });
