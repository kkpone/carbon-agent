import apiPath from '@api/config';
import { request } from '../../../api/request';

interface DepartmentAddType {
  departmentName: string;
  parentId?: string | number;
  id?: string | number;
}
interface DepartmentEditType {
  departmentName: string;
  parentId?: string | number;
  id?: string | number;
  departmentId: string | number;
}
interface DepartmentDelType {
  departmentId: string;
}
export interface ChildrenItem {
  departmentName?: string;
  title?: string;
  departmentId?: string;
  children?: ChildrenItem[];
  id: number | string;
  parentId: number | string;
}

// 部门列表
export function apiQueryByPageType(params: { companyId: number }) {
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
export function apiDepartmentAdd(data: DepartmentAddType) {
  return request<{ code: number; data: []; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/department/add`,
    data,
  });
}
// 编辑部门
export function apiDepartmentEdit(data: DepartmentEditType) {
  return request<{ code: number; data: []; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/department/edit`,
    data,
  });
}
// 删除
export function apiDepartmentDele(data: DepartmentDelType) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/department/deleteByDepartmentId`,
    data,
  });
}

// department/
export function apiSetTop(data: { id: number | string }) {
  return request<{ code: number; msg: string }>({
    method: 'POST',
    url: `${apiPath()}/department/setTop`,
    data,
  });
}
