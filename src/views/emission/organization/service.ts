import apiPath from '@api/config';
import { request } from '@api/request';
import { BackendResponse } from '@src/api/types';

// 员工列表
// 获取角色列表

// 获取部门列表
// 部门列表

// 新增部门
// 编辑部门
// 获取部门详情
// 编辑部门
// 删除

//  因子库–>碳迹云-组织因子库-查询碳阻迹组织因子库数据列表
export function apiCompanyListSaas(params: {
  name?: string;
  pageSize?: number;
  pageNum?: number;
  companyId?: number;
}) {
  return request<{
    code: number;
    msg: string;
    rows: [];
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/company/listSaas`,
    params,
  });
}

// 因子库–>碳迹云-组织因子库-删除组织排放因子数据
export function apiCompanyRemove(params: { id?: string }) {
  return request<{
    code: number;
    msg: string;
    rows: [];
    total: number;
  }>({
    method: 'delete',
    url: `${apiPath()}/system/company/remove`,
    params,
  });
}
//  因子库–>碳迹云-因子库-组织收藏/取消收藏因子库记录
export function apiCompanyAddCollect(data: {
  factorId?: string;
  companyId?: number;
  searchId?: string;
}) {
  return request<{
    code: number;
    msg: string;
    rows: [];
    total: number;
  }>({
    method: 'post',
    url: `${apiPath()}/system/collect/addCollect`,
    data,
  });
}

/** *
 * @description saas-获取组织可用查询次数
 **/
export type ApiQueryActivityTimesDataType = {
  companyId: string | null; // 组织id
  queryDegree: number | null; // 可用次数
  countsType: number;
};
export function apiQueryActivityTimes() {
  return request<{
    code: number;
    msg: string;
    data: ApiQueryActivityTimesDataType;
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/company/queryActivityTimes`,
  });
}

// saas 分享因子
export function apiFactorManage(data: {
  factorId: string;
  factorName: string;
  shared: string;
  type: string;
}) {
  return request<{
    code: number;
    msg: string;
    data: ApiQueryActivityTimesDataType;
    total: number;
  }>({
    method: 'post',
    url: `${apiPath()}/factorManage/`,
    data,
  });
}
// 审核列表
export const apiSassOperate = (data: { factorId: string }) =>
  request<BackendResponse<{ operateId?: string; opFlag?: string }[]>>({
    url: `${apiPath()}/operate/queryByPage`,
    method: 'post',
    data,
  });
