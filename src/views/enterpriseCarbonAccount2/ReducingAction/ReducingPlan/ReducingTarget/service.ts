import { request } from '@src/api/request';

import { TargetStage, TargetStageItem } from './type';

export const getYearList = (params: { id: number }) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/enterprise/reduction/plan/years',
    params,
  });

export const editReducingPlanBaseYear = (data: {
  id: number;
  standardYear: string;
}) =>
  request<{
    data: { firstTwoCategoryEmissions: string; thirdCategoryEmissions: string };
  }>({
    method: 'post',
    url: '/enterprise/reduction/plan/edit/target/year',
    data,
  });

export const getTargetYearList = (params: { id: number; stageId?: number }) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/enterprise/reduction/plan/list/target/year',
    params,
  });

export const addTargetStage = (data: TargetStage & { id: number }) =>
  request({
    method: 'post',
    url: '/enterprise/reduction/plan/add/stage',
    data,
  });

export const editTargetStage = (data: TargetStage) =>
  request({
    method: 'post',
    url: '/enterprise/reduction/plan/edit/stage',
    data,
  });

export const deleteTargetStage = (params: { stageId: number }) =>
  request({
    method: 'get',
    url: '/enterprise/reduction/plan/deleted/stage',
    params,
  });
export const getTargetStageList = (params: { id: number }) =>
  request<{ data: TargetStageItem[] }>({
    method: 'get',
    url: '/enterprise/reduction/plan/list/stage',
    params,
  });

export const getTargetStageDetails = (params: { stageId: number }) =>
  request<{ data: Omit<TargetStage, 'stageId'> & { id: number } }>({
    method: 'get',
    url: '/enterprise/reduction/plan/info/stage',
    params,
  });

export const getReducingTargetChartData = (data: {
  id: number;
  scopeValues: string[][];
  orgValues: string[][];
}) =>
  request<{
    data: {
      chart: { year: string; predictEmissions: number; emissions: number }[];
    };
  }>({
    method: 'post',
    url: '/enterprise/reduction/plan/chart/v2',
    data,
  });

export const calcReducingPercentage = (data: {
  id: number;
  targetYear: string;
  targetStage: number;
}) =>
  request<{ data: { generalRatio: number } }>({
    method: 'post',
    url: '/enterprise/plan/overview/cacl/ratio',
    data,
  });

export const calcTargetStage = (data: {
  id: number;
  targetYear: string;
  percentage: Record<string, number>;
}) =>
  request<{ data: { targetStage: number } }>({
    method: 'post',
    url: '/enterprise/plan/overview/cacl/target',
    data,
  });
