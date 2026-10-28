import { request } from '@/api/request';

export const getUserInfo = (params: { ticket?: string }) =>
  request<{ data: { name: string; waitDealCount: number } }>({
    url: '/enterprise/source/task/info/by/ticket',
    params,
  });
