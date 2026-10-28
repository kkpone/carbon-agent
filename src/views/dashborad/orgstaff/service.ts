import apiPath from '@api/config';

import { UserDelPayload, UserStatusChange } from './type';
import { request } from '../../../api/request';

interface QueryByPageType {
  page: number;
  size: number;
  departmentId?: number;
  departmentName?: string;
  userName?: string;
  nickName?: string;
  employName?: string; // 员工搜索的员工姓名-ljh
}
interface Column {
  companyId: null | string | number;
  delflag: number;
  depId: null | number;
  departmentId: number;
  departmentName: string;
  email: null | string;
  id: number;
  nickName: string;
  page: number;
  password: string;
  permissionSet: null | number;
  permissions: null | number;
  roleId: null | number;
  roleIds: null | number;
  roleName: null | number;
  roles: {
    id: null | string;
    roleId: number;
    roleName: string;
    roleInfo: null | string;
  }[];
  salt: null;
  sex: null;
  size: number;
  sort: null;
  status: number;
  ucStatus: number;
  userId: number;
  userName: string;
  ucType: number;
  udId: null | string;
}

export interface FormilyUserType extends AddUserType {
  employPhone: {
    areaCode: string;
    phone_number: string;
  };
}

interface EditUserType extends AddUserType {
  id: string;
  userId: string;
  udId: string | number | null;
  updateUser: string;
  type: number | string;
}
export interface SubApprovalItem {
  id: number;
  userId: number;
  companyId: number;
}

export interface AddUserType {
  userName: string | null;
  nickName: string | null;
  employEmail: string | null;
  roleIds: string[];
  departmentId: string | null;
  employPhone:
    | null
    | string
    | number
    | {
        areaCode: string;
        phone_number: string;
      };
  employName: null | string | number;
  updateUser: string;
  employPhoneCode: string | null;
  subApprovalList?: SubApprovalItem[];
}

// 员工列表
export function apiQueryByPageType(data: QueryByPageType) {
  return request<{
    code: number;
    msg: string;
    data: {
      total: number;
      rows: Column[];
    };
  }>({
    method: 'POST',
    url: `${apiPath()}/user/queryByPage`,
    data,
  });
}

interface Role {
  id: number;
  roleId: number;
  roleName: string;
  roleInfo: string | null;
  delflag: number;
  type: number;
  companyId: number;
  count: number;
  permissionIds: number[] | null;
  half: string | null;
  updateTime: string;
}

// 获取角色列表
export function apiRoleList(data: { size: number; page: number }) {
  return request<{
    page: string;
    data: { total: number; rows: Role[] };
    code: number;
  }>({
    method: 'POST',
    url: `${apiPath()}/role/list`,
    data,
  });
}

// 获取部门列表
// 部门列表
export function apiDepartmentPageType(params: { companyId: number }) {
  return request<{
    code: number;
    msg: string;
    data: [];
  }>({
    method: 'get',
    url: `${apiPath()}/department/list`,
    params,
  });
}

// 新增部门
export function apiAddUser(data: AddUserType) {
  return request<{ code: number; data: []; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/user/addUser`,
    data,
  });
}
// 编辑部门
export function apiEditUser(data: EditUserType) {
  return request<{ code: number; data: []; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/user/editUser`,
    data,
  });
}
// 获取部门详情
// 编辑部门
// 删除

/* 删除  员工 修改员工状态 */
export function apiBanUserFlag(data: UserStatusChange | UserDelPayload) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/userCompany/deleteUserCompany`,
    data,
  });
}
// 审批负责人数据
export interface SuperApprovalData {
  id: number;
  userId: number;
  companyId: number;
  type: number;
  status: number;
  delflag: number;
  employEmail: string;
  employName: string;
  employPhone: string;
  superApproval: number | null;
}

// user/employInfo
export function apiEmployInfo(data: { id: string }) {
  return request<{
    code: number;
    msg: string;
    data: {
      employPhone: string;
      userName: string;
      roleIds: string[];
      employName: string;
      orgId: string;
      employEmail: string;
      employPhoneCode: string;
      superApproval: number | null;
      subApprovalList: SubApprovalItem[] | null;
      superApprovalData?: SuperApprovalData;
    };
  }>({
    method: 'POST',
    url: `${apiPath()}/user/employInfo`,
    data,
  });
}

// 获取下级员工列表（用于配置审批对象）
export interface EmployeeListItem {
  id: number;
  userId: number;
  companyId: number;
  employName: string;
  employPhone: string;
  employEmail: string | null;
  employPhoneCode: string | null;
  superApproval: number | null;
  isChoose: string; // "0" 表示已被其他人配置，"1" 表示可选
}

export function apiGetUserCompanyList(params: {
  userId?: number;
  searchName?: string;
}) {
  return request<{
    code: number;
    msg: string;
    data: EmployeeListItem[];
  }>({
    method: 'GET',
    url: `${apiPath()}/companyOrg/getUserCompanyList`,
    params,
  });
}
