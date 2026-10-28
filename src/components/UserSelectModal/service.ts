import { request } from '@src/api/request';

import { User } from './type';

export const getUserList = (params?: {
  searchName?: string;
  orgId?: number | string | null;
}) =>
  request<{ data: User[] }>({
    method: 'get',
    url: '/management/companyOrg/getUserListByCompanyId',
    params,
  });
