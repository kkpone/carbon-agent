import { request } from '@api/request';

// 获取申请选项
export function apiQueryByPageType(params: { type: number }) {
  return request({
    method: 'GET',
    url: `/authentication/calculate/queryByPage`,
    params,
  });
}
// 新增申请
export function apiAddProjectInspect(data) {
  return request({
    method: 'POST',
    url: `/authentication/projectInspect/addProjectInspect`,
    data,
  });
}
// 编辑申请
export function apiEditProjectInspect(data) {
  return request({
    method: 'POST',
    url: `/authentication/projectInspect/editProjectInspect`,
    data,
  });
}
