import { request } from '@src/api/request';

import { YearType, OverviewInfo, YearEmission, EmissionRow } from './type';

export const getOverviewInfo = (data: {
  id: number;
  scopeValues: string[][];
  orgValues?: string[][];
}) =>
  request<{ data: OverviewInfo }>({
    method: 'post',
    url: '/enterprise/plan/overview/info',
    data,
  });

export const getYearEmissionList = (data: {
  id: number;
  orgValues?: string[][];
  scopeValues?: string[][];
  choose?: YearType;
}) =>
  request<{ data: YearEmission[] }>({
    method: 'post',
    url: '/enterprise/plan/overview/chart',
    data,
  });

export const getEmissionRows = (data: { id: number; year: string }) =>
  request<{ data: EmissionRow[] }>({
    method: 'post',
    url: '/enterprise/plan/overview/detailList',
    data,
  });

export const getReducingPlanYears = (data: { id: number }) =>
  request<{ data: { year: string; choose: boolean }[] }>({
    method: 'post',
    url: '/enterprise/reduction/plan/data/detail/years',
    data,
  });
