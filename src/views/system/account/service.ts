import apiPath from '@api/config';
import { request } from '@api/request';
import { Companys, JavaPageResponse } from '@src/api/types';

interface AddCompanyType {
  userId: string;
  companyName: string;
  companyInfo: string;
  companyNum: string;
}
interface CompanyListType {
  userId: string | number;
  page: string | number;
  size: string | number;
}

// 创建公司,同时自动赋角色和权限
export function apiAddCompany(data: AddCompanyType) {
  return request<JavaPageResponse<{ total: number; page: string; data: [] }>>({
    method: 'POST',
    url: `${apiPath()}/company/addCompany`,
    data,
  });
}
// 查询公司列表
export function apiCompanyList(data: CompanyListType) {
  return request<JavaPageResponse<Companys>>({
    method: 'POST',
    url: `${apiPath()}/company/queryByPage`,
    data,
  });
}
// 切换公司
// export function apiSwitchoverCompany(data: SwitchConpany) {
//   return request({
//     method: 'POST',
//     url: '/companyList',
//     data,
//   });
// }

export enum BindType {
  phone = '1',
  email = '2',
}

export const sendBinding = (params: {
  bindContent: string;
  bindType: BindType;
}) =>
  request<{ code: number; msg: string }>({
    method: 'get',
    url: `/auth/token/sendBinding`,
    params,
  });

export const sendUnBinding = (params: { bindType: BindType }) =>
  request<{ code: number; msg: string }>({
    method: 'get',
    url: `/auth/token/sendUnBinding`,
    params,
  });

export const checkBinding = (data: {
  bindContent: string;
  code: string;
  bindType: BindType;
}) =>
  request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/user/checkBinding`,
    data,
  });

export const checkUnBinding = (params: { code: string; bindType: BindType }) =>
  request<{ code: number; msg: string }>({
    method: 'get',
    url: `/management/user/checkUnBinding`,
    params,
  });

export interface Info {
  email: string;
  mobile: string;
  userName: string;
  password: string;
  nickName: string;
}

export const getUserInfoByUserName = (params: { userName }) =>
  request<{ code: number; msg: string; data: Info }>({
    method: 'get',
    url: `/management/user/getUserInfo`,
    params,
  });

export const editUserDetail = (data: { nickName: string }) =>
  request<{ code: number; msg: string; data: Info }>({
    method: 'post',
    url: `/management/user/editUserDetail`,
    data,
  });
