import { request } from '@src/api/request';

import { DictSource } from '../AddEmission/types';

export const getMatchEmissionList = (params: {
  name: string;
  pageNum: number;
  pageSize: number;
}) =>
  request<{ total: number; rows: DictSource[] }>({
    method: 'get',
    url: 'enterprise/model/source/match/result',
    params,
  });
