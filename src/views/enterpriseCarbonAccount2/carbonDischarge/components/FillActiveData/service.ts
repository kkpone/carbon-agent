import { request } from '@src/api/request';

export const assignSubmitter = (data: { id: number; userIds: number[] }) =>
  request({
    method: 'post',
    url: '/enterprise/source/allot-appoint-user',
    data,
  });
