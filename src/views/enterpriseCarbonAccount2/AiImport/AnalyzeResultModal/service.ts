import { request } from '@/api/request';

import { ComputationSource } from './type';

export const cancelAiModel = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/cancelModel',
    params,
  });

export const cancelTravelAiModel = params =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/cancelModel',
    params,
  });

export const submitCommon = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request<{ data: { errorCode: number; errorMsg: string } }>({
    method: 'post',
    url: 'enterprise/source/temp/submitModel',
    params,
  });

export const submitTravel = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request<{ data: { errorCode: number; errorMsg: string } }>({
    method: 'post',
    url: '/enterprise/business/travel/submitModel',
    params,
  });

export const getComputationSourceList = params =>
  request<{ data: ComputationSource[] }>({
    url: '/enterprise/source/list',
    params,
  });

export const getUnitConversionRatio = params =>
  request<{ data: { unitValue: string } }>({
    method: 'GET',
    url: `/management/system/unit/unitExchangeEnum`,
    params,
  });
