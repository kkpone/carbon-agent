import { request } from '@/api/request';
import { ComputationYear } from './type';

export const getComputationYearList = () =>
  request<{ data: ComputationYear[] }>({
    method: 'get',
    url: '/enterprise/computation/yearList',
  });
