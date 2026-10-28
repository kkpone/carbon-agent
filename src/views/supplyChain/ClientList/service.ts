import { request } from '@/api/request';

export const getClientList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    url: '/chain/supplier/apply/audit/list',
    params,
  });

export const replayInvite = params =>
  request({
    url: '/chain/supplier/audit/reply',
    params,
  });
