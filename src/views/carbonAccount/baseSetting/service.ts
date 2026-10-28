/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-11-23 18:08:39
 */
import { request } from '@src/api/request';
import { AxiosResponse } from '@src/api/types';
// import { BackendResponse } from '@src/api/types';

// 删除banner
export function ApiBannerDelete(data) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/banner/delete`,
    data,
  });
}

// banner详情
export function ApiBannerDetail(params: { id: string }) {
  return request<AxiosResponse<any>>({
    method: 'get',
    url: `/carbonAccount/banner/detail`,
    params,
  });
}

// banner编辑
export function ApiBannerEdit(data: { id: string }) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/banner/edit`,
    data,
  });
}

// banner添加
export function ApiBannerAdd(data: { id: string }) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/banner/add`,
    data,
  });
}

/**
 *
 * @returns 添加部门
 *
 */
export function ApiOrgAdd(data: {
  id?: number;
  orgName: string;
  pid: number;
  orderNum: number;
}) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/org/add`,
    data,
  });
}
/**
 *
 * @returns 删除部门
 *
 */
export function ApiOrgDelete(data: { id: number }) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/org/delete`,
    data,
  });
}
/**
 *
 * @returns 编辑组织
 *
 */
export function ApiOrgEdit(data: {
  id: number;
  orgName: string;
  pid: number;
  orderNum: number;
}) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/carbonAccount/org/edit`,
    data,
  });
}
// banner详情
export function ApiAuditEdit(params: { audit: number }) {
  return request<AxiosResponse<any>>({
    method: 'get',
    url: `/carbonAccount/company/audit/edit`,
    params,
  });
}
