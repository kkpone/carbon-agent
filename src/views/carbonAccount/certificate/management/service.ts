import { request } from '@src/api/request';
import { Certificate } from './type';

// 场景管理-新增场景
export function addCertificate(data: Certificate) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/certificate/add`,
    data,
  });
}

export function certificateList(params?: {
  name?: string;
  page?: number;
  size?: number;
}) {
  return request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/certificate/list`,
    params,
  });
}

export function certificateDelete(params?: { id: number }) {
  return request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/certificate/deleted`,
    params,
  });
}

export function certificateUpdate(data: Certificate) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/carbonAccount/certificate/edit`,
    data,
  });
}
