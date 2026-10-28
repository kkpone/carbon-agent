import { request } from '@src/api/request';

import { ReducingForecastSetting, ReducingForecastData } from './type';

export const getReducingForecastData = (data: {
  id: number;
  scopeValues: string[][];
  orgValues: string[][];
}) =>
  request<{ data: ReducingForecastData }>({
    method: 'post',
    url: '/enterprise/forecast/chart',
    data,
  });

export const getReducingForecastSetting = (params: { id: number }) =>
  request<{ data: ReducingForecastSetting | null }>({
    method: 'get',
    url: '/enterprise/forecast/info',
    params,
  });

export const editReducingForecastSetting = (
  data: ReducingForecastSetting & { id: number },
) =>
  request({
    method: 'post',
    url: '/enterprise/forecast/config/update',
    data,
  });

export const getForecastDataRefresh = (params: { id: number }) =>
  request({
    method: 'get',
    url: '/enterprise/forecast/update/chart',
    params,
  });
