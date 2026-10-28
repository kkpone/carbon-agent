/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 19:09:25
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  CarbonAccountSceneManageSubNew,
  CarbonAccountSceneManageTable,
  CarbonAccountSceneManageTableGetParams,
} from './type';

// 场景管理的列表
export function ApicarbonSceneManagementListGet(
  params: CarbonAccountSceneManageTableGetParams,
) {
  return request<AxiosResponse<CarbonAccountSceneManageTable>>({
    method: 'get',
    url: `/carbonAccount/scene/list`,
    params,
  });
}

// 场景管理-默认场景

// 场景管理-新增场景
export function ApicarbonSceneManagementListPost(
  data: CarbonAccountSceneManageSubNew,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/scene/add`,
    data,
  });
}

// 场景管理-停用启用
export function ApicarbonSceneManagementListPostUpdateStatus(
  data: Pick<CarbonAccountSceneManageTable, 'id' | 'sceneStatus'>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/scene/updateStatus`,
    data,
  });
}

// 场景管理-获取枚举值
export function ApicarbonSceneManagementEnums(params: { enumName: string }) {
  return request<{
    code: number;
    data: { code: number; name: string }[];
    msg: string;
  }>({
    method: 'get',
    url: `/carbonAccount/enums/${params.enumName}`,
    params,
  });
}

export const deleteScene = (params: { id: number }) =>
  request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/scene/deleted`,
    params,
  });
