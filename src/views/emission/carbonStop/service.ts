import apiPath from '@api/config';
import { request } from '@api/request';

export interface AddUserType {
  userName: string | null;
  nickName: string | null;
  email: string | null;
  roleIds: string[];
  departmentId: string | null;
  employPhone: null | string | number;
  employName: null | string | number;
  updateUser: string;
}

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
// 因子库–>碳阻迹因子库-查询碳阻迹因子库列表
export function apiListCarbonstopFactor(data: {
  name?: string | number;
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
    method: 'POST',
    url: `${apiPath()}/system/factor/listCarbonstopFactor`,
    data,
  });
}
//  因子库–>碳迹云-因子库-组织收藏/取消收藏因子库记录
export function apiCompanyAddCollect(data: {
  factorId?: string;
  companyId?: number;
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
