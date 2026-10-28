/**
 * @description 过程管理的支撑材料
 */

import { ResponseData, request } from '@/api/request';

/**
 * @description 过程管理的支撑材料-编辑
 */
export const postProcessManageSupportFilesEdit = (data: {
  id: number;
  supportFile?: string;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/lca2/process/supportFile/edit`,
    data,
  });
