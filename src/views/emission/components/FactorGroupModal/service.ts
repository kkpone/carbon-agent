import { request } from '@/api/request';

export const getFactorGroup = params =>
  request<{ data: string[] }>({
    url: '/management/system/company/getFactorGroup',
    params,
  });
