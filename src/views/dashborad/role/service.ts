import apiPath from '@api/config';
import { request } from '../../../api/request';

interface AddRoleType {
  roleName: string | null;
  roleInfo: string | null;
  type: number; // 预置角色 0 不可更改，自定义角色1
  permissionIds: number | string[] | null;
  half: string[];
}
interface EditRoleType extends AddRoleType {
  id: number | string;
  roleId: number | string;
}
interface QueryByPageType {
  page: number;
  size: number;
}
interface GetRoleInfoType {
  id: number | string;
}
// 2、添加角色
export function apiAddRole(data: AddRoleType) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/role/add`,
    data,
  });
}
// 角色列表
export function apiRoleList(data: QueryByPageType) {
  return request<{
    code: number;
    page: string;
    data: { rows: []; total: number };
  }>({
    method: 'POST',
    url: `${apiPath()}/role/list`,
    data,
  });
}
// 组织权限列表
export function apiGetPermissions(params: { companyId: number }) {
  return request<{ total: number; page: string; data: []; code: number }>({
    method: 'GET',
    url: `${apiPath()}/permission/getPermissions`,
    params,
  });
}
// 角色分配权限
// 3、详情和编辑
export function apiGetRoleInfo(params: GetRoleInfoType) {
  return request<{
    code: number;
    msg: string;
    role: {
      roleName: string;
      roleInfo: string;
      permissionIds: string[];
      half: string[];
    };
  }>({
    method: 'GET',
    url: `${apiPath()}/role/getInfo/${params.id}`,
  });
}
// 编辑保存
export function apiRoleEdit(data: EditRoleType) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/role/edit`,
    data,
  });
}
// 删除
export function apiRoleDele(data: GetRoleInfoType) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/role/delete/${data.id}`,
  });
}
