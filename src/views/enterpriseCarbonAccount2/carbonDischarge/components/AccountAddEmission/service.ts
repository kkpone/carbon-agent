import { request } from '@src/api/request';

import { DictSource } from '../AddEmission/types';

export const getMatchEmissionCount = (data: {
  name: string;
  computationId: number;
  ghgClassify: string;
}) =>
  request<{ data: number }>({
    method: 'post',
    url: 'enterprise/source/match/count',
    data,
  });

export const getMatchEmissionList = (data: {
  name: string;
  computationId: number;
  ghgClassify: number;
}) =>
  request<{ total: number; rows: DictSource[] }>({
    method: 'post',
    url: 'enterprise/source/match/result',
    data,
  });

export const getFormulaList = () =>
  request<{ data: Record<string, any>[] }>({
    method: 'get',
    url: 'enterprise/method/dropList',
  });

export type EmissionGroup = {
  id: number;
  groupName: string;
  categoryId: number;
};

export const getEmissionGroupsByCategory = (params: {
  ghgClassify: string | number;
  computationId: string | number;
}) =>
  request<{ data: EmissionGroup[] }>({
    method: 'get',
    url: '/enterprise/emissionGroup/listByCategory',
    params,
  });
