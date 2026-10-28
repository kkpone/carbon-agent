import { request } from '@/api/request';

import { ESGTask, Indicator } from '../type';

export const getIndicatorTaskList = (params: {
  frameId: string | number;
  orgId: string | number;
}) =>
  request<{ data: Indicator[] }>({
    url: '/esg/task/tree',
    params,
  });

export const getIndicatorTaskDetails = (params: { id: number }) =>
  request<{ data: Indicator }>({
    url: '/esg/task/indicator/info',
    params,
  });

export const submitIndicatorTask = data =>
  request({
    method: 'post',
    url: '/esg/task/indicator/edit',
    data,
  });

export const getOrgTaskFillProgress = (params: {
  frameId: number | string;
  orgId: number | string;
}) =>
  request<{ data: ESGTask }>({
    url: '/esg/task/org/info',
    params,
  });

export const calcIndicatorValue = data =>
  request<{ data: string }>({
    method: 'post',
    url: '/esg/task/indicator/value',
    data,
  });

export const getFilterStandardList = params =>
  request<{ data: { id: number; name: string }[] }>({
    url: '/esg/task/standardList',
    params,
  });
