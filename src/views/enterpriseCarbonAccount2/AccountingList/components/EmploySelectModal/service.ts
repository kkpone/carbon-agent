import { request } from '@src/api/request';

import { Employ } from '../../type';

export const getEmployList = (params: { searchName: string }) =>
  request<{ data: Employ[] }>({
    method: 'get',
    url: '/management/userCompany/getCompanyUserList',
    params,
  });
