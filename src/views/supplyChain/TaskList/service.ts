import { request } from '@/api/request';

export const getTaskList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    method: 'get',
    url: '/chain/data/submit/list',
    params,
  });

export const getOverviewInfo = () =>
  request<{ data: Record<string, number> }>({
    url: '/chain/data/fillInfo',
  });
