import { request } from '@/api/request';

import { Org } from '../type';

export const getOrgAccountYearList = () =>
  request<{ data: { yearList: { year: string }[] } }>({
    url: '/enterprise/fiscal/year/info',
  });

export const getOrgList = (params: { cYear: string }) =>
  request<{ data: Org[] }>({
    url: '/enterprise/computation/task/dataBoard/orgTreeAuth',
    params,
  });
