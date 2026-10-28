import { request } from '@src/api/request';

export const acceptInvitation = (params: { supplyTicket: string }) =>
  request({
    method: 'GET',
    url: '/chain/invitation/accept',
    params,
  });
