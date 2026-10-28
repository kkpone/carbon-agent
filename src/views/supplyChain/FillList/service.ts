import { request } from '@/api/request';

export const getFillList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    url: '/chain/data/list',
    params,
  });

export const getOverviewInfo = () =>
  request<{ data: Record<string, number> }>({
    url: '/chain/data/taskInfo',
  });

export const initiateFill = data =>
  request({
    method: 'post',
    url: '/chain/data/add',
    data,
  });
