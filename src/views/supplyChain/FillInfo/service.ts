import { request } from '@src/api/request';

export const carbonDataAudit = (params: {
  id: number;
  result: number;
  content?: string;
}) =>
  request({
    method: 'get',
    url: '/chain/data/audit',
    params,
  });
