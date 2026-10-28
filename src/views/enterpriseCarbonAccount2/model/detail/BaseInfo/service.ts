import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

/**
 *新增模型
 */
export function apiAccountModeAdd(data) {
  return request<AxiosResponse<{ modelId: number }>>({
    method: 'POST',
    url: `/enterprise/model/add`,
    data,
  });
}
/**
 *编辑模型
 */
export function apiAccountModeEdit(data) {
  return request({
    method: 'POST',
    url: `/enterprise/model/edit`,
    data,
  });
}
