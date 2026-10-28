import { request } from '@/api/request';

import { MeasuresType } from './type';

export const addMeasures = (data: MeasuresType & { targetId: number }) =>
  request({
    method: 'post',
    url: '/enterprise/reduce/measure/custom/add',
    data,
  });

export const validateFormula = (
  data: {
    formulaString: string;
    variateIds: string[];
  },
  controller?: AbortController,
) =>
  request<{ data: boolean }>({
    signal: controller?.signal,
    method: 'post',
    url: '/enterprise/reduce/measure/validate/formula',
    data,
  });

export const getMeasuresList = params =>
  request<{ data: MeasuresType[] }>({
    url: '/enterprise/reduce/measure/choose/list',
    params,
  });

export const deleteMeasures = (params: { id: number }) =>
  request({
    url: '/enterprise/reduce/measure/deleted',
    params,
  });

export const getMeasures = (params: { id: number; category?: string }) =>
  request<{ data: MeasuresType }>({
    url: '/enterprise/reduce/measure/info',
    params,
  });

export const applyMeasures = (data: {
  id: number;
  targetId: number;
  [P: string]: number | string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/reduce/measure/use/template',
    data,
  });

export const getApplyMeasuresList = data =>
  request<{ data: MeasuresType[] }>({
    method: 'post',
    url: '/enterprise/reduce/measure/list',
    data,
  });

export const editMeasures = data =>
  request({
    method: 'post',
    url: '/enterprise/reduce/measure/custom/edit',
    data,
  });

export const getMeasuresOverviewDta = data =>
  request<{
    data: {
      measureCount: string;
      predictReduce: string;
      predictCost: string;
      predictEarnings: string;
      investYear: string;
    };
  }>({
    method: 'post',
    url: '/enterprise/reduce/measure/info/card',
    data,
  });

export const getFinancialYearList = () =>
  request<{ data: { yearList: string[]; accountWay: number } }>({
    url: '/enterprise/reduction/plan/custom/year',
  });
