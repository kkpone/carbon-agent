import { request } from '@src/api/request';

export const getMatchEmissionCount = (params: { name: string }) =>
  request<{ data: number }>({
    method: 'get',
    url: 'enterprise/model/source/match/count',
    params,
  });
