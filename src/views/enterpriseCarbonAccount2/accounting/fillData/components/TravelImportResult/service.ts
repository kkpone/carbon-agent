import { request } from '@/api/request';

export const getImportResult = params =>
  request<{
    data: { travel: Record<string, any>[]; hotel: Record<string, any>[] };
  }>({
    url: 'enterprise/business/travel/list',
    params,
  });

export const editImportResult = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/edit',
    data,
  });

export const cancelImportResult = params =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/cancelModel',
    params,
  });

export const submitImportResult = params =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/submitModel',
    params,
  });

export const getDetails = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    method: 'get',
    url: '/enterprise/business/travel/detail',
    params,
  });

export const editDetails = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/detailEdit',
    data,
  });
