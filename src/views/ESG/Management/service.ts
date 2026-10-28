import { request } from '@/api/request';

import { Indicator, IndicatorSystem } from '../type';

export const addIndicatorSystem = (data: IndicatorSystem) =>
  request<{ data: number }>({
    url: '/esg/frame/frame/add',
    method: 'post',
    data,
  });

export const getIndicatorSystemList = () =>
  request<{ data: IndicatorSystem[] }>({
    url: '/esg/frame/frame/list',
  });

export const editIndicatorSystem = (data: IndicatorSystem) =>
  request({
    method: 'post',
    url: '/esg/frame/frame/edit',
    data,
  });

export const getIndicatorList = (params: {
  frameId: number;
  name?: string;
  indicatorType?: string;
  standardIds?: string;
  orgIds?: string;
  disclose?: string;
}) =>
  request<{ data: Indicator[] }>({
    url: '/esg/frame/indicator/tree',
    params,
  });

export const deleteIndicator = (data: { ids: string[] }) =>
  request({
    method: 'post',
    url: '/esg/frame/indicator/delete',
    data,
  });

export const batchUpdateIndicator = (data: {
  ids: string[];
  orgIds?: string;
  fillRequire?: string;
  disclose?: number;
}) =>
  request({
    method: 'post',
    url: '/esg/frame/indicator/batchUpdate',
    data,
  });

export const initiateTask = (params: { id: number }) =>
  request({
    method: 'PUT',
    url: '/esg/frame/frame/submit',
    params,
  });

export const getOrgEntityList = () =>
  request<{ data: { id: number; orgName: string }[] }>({
    url: '/esg/frame/frame/orgList',
  });

export const getFilterStandardList = (params: { frameId: number }) =>
  request<{ data: { id: number; name: string }[] }>({
    url: '/esg/frame/topic/standardList',
    params,
  });

export const addIndicator = data =>
  request({
    method: 'post',
    url: '/esg/frame/indicator/add',
    data,
  });
