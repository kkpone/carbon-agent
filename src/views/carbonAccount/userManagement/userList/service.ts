/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-22 18:13:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-12 11:54:04
 */
import { request } from '@src/api/request';
import { Robject } from '@src/sdks/java/carbonAccount';
import { AxiosResponse } from 'axios';

import {
  ApiGetUserListItem,
  ApiGetUserSceneList,
  CarbonAccountUserSceneListGetParams,
  UserListAddUser,
  UserListBlackListUser,
  UserListEditUser,
  UserListImportFile,
  UsersSearchParams,
} from './type';

// 用户管理 的 详情的用户碳币记录
export function ApicarbonAccountUserScoreListGet(
  params: CarbonAccountUserSceneListGetParams,
) {
  return request<ApiGetUserSceneList>({
    method: 'get',
    url: `/carbonAccount/score/user/page`,
    params,
  });
}

// 用户详情
export function ApicarbonAccountUserListItemGet(id: number) {
  return request<AxiosResponse<ApiGetUserListItem>>({
    method: 'get',
    url: `/carbonAccount/user/info`,
    params: { id },
  });
}

// 新增用户
export function ApicarbonAccountUserListAdd(data: UserListAddUser) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/user/audit/add`,
    data,
  });
}

// 编辑用户
export function ApicarbonAccountUserListEdit(data: UserListEditUser) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/user/edit`,
    data,
  });
}

// 黑名单恢复和拉入
export function ApicarbonAccountUserListBlackList(data: UserListBlackListUser) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/user/updateStatus`,
    data,
  });
}

// 下载模板

// 上传模板
export function ApicarbonAccountUserListImportFile(data: FormData) {
  return request<{
    code: number;
    msg: string;
    data: UserListImportFile | null;
  }>({
    method: 'post',
    url: `/carbonAccount/user/import`,
    data,
  });
}
// 审核
export function ApicarbonAccountUserAudit(data: any) {
  return request<{
    code: number;
    msg: string;
    data: UserListImportFile | null;
  }>({
    method: 'post',
    url: `/carbonAccount/user/audit`,
    data,
  });
}
// 批量审核
export function ApicarbonAccountUserAuditBatch(data: any) {
  return request<{
    code: number;
    msg: string;
    data: UserListImportFile | null;
  }>({
    method: 'post',
    url: `/carbonAccount/user/audit/batch`,
    data,
  });
}
// 用户导入列表

export function ApicarbonAccountUserExcelList(params: any) {
  return request<ApiGetUserSceneList>({
    method: 'get',
    url: `/carbonAccount/user/excel/list`,
    params,
  });
}
// 用户导入

export function ApicarbonAccountUserImportUser(data: FormData) {
  return request<ApiGetUserSceneList>({
    method: 'POST',
    url: `/carbonAccount/user/import/user`,
    data,
  });
}

export function apiExportuserList(params: {
  excelName: string;
  orgIds: number[];
  realName?: string;
  userStatus?: number;
  mobile?: string;
}) {
  const orgId = params?.orgIds?.map(t => `&orgIds=${t}`);
  const orgIdstring = orgId?.join(',').replaceAll(',', '');

  return request({
    method: 'GET',
    url: `/carbonAccount/user/export/excel/?mobile=${
      params?.mobile || ''
    }&realName=${params?.realName || ''}&excelName=${params.excelName}${
      orgIdstring ? `&${orgIdstring}` : ''
    }${params.userStatus ? `&userStatus=${params.userStatus}` : ''}`,
  });
}

export const getUserList = (
  params: Omit<UsersSearchParams, 'orgIds'> & { orgIds?: string },
) =>
  request<Robject>({
    method: 'GET',
    url: '/carbonAccount/user/list',
    params,
  });
