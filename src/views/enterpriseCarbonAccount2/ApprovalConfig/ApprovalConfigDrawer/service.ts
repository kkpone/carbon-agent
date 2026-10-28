import { request } from '@/api/request';

export type Employ = {
  userId?: number;
  employName?: string;
  employEmail?: string;
};

export const getEmployList = (params: {
  searchName: string;
  ticket?: string;
}) =>
  request<{ data: Employ[] }>({
    method: 'GET',
    url: '/management/companyOrg/getUserListByCompanyId',
    params,
  });
