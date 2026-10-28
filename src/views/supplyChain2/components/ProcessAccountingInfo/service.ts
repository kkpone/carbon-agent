import { request } from '@src/api/request';

import {
  Process,
  ProcessAccountInfo,
  ProcessAccounting,
  ProcessIn,
  ProcessOut,
  ProcessProduct,
} from './type';

export const getProcessAccountingInfo = (params: {
  id: string;
  flag?: boolean;
}) =>
  request<{ data: ProcessAccountInfo }>({
    method: 'get',
    url: '/chain/process/account/info',
    params,
  });

export const getProcessAccounting = (params: {
  id: number | string;
  flag?: boolean;
}) =>
  request<{ data: Omit<ProcessAccounting, 'key'> }>({
    method: 'get',
    url: '/chain/process/menu',
    params,
  });

export const getProcessAccountingNext = (data: {
  id: string;
  matchType: number;
  flag?: boolean;
}) =>
  request<{ data: Omit<ProcessAccounting, 'key'>[] }>({
    method: 'post',
    url: '/chain/process/nextMenu',
    data,
  });

export const getProcessInfo = (params: { id: string; flag?: boolean }) =>
  request<{ code: number; msg: string; data: Process }>({
    method: 'get',
    url: '/chain/process/info',
    params,
  });

export const getProcessDetails = (data: {
  id: string;
  matchType: number;
  flag?: boolean;
}) =>
  request<{
    data: {
      processIns: ProcessIn[];
      processOuts: ProcessOut[];
      processProducts: ProcessProduct[];
    };
  }>({
    method: 'post',
    url: '/chain/process/details',
    data,
  });

export const getProcessMatchProducts = (params: {
  id: number;
  flag?: boolean;
}) =>
  request<{ data: Record<string, any>[] }>({
    method: 'get',
    url: '/chain/process/accountProcessIn/matchProducts',
    params,
  });

export const getProductList = (params: { processId: number; flag?: boolean }) =>
  request<{ data: unknown }>({
    method: 'get',
    url: '/chain/process/supplyAccountProcess/processProducts',
    params,
  });

export const getOutputList = (params: { id: number; flag?: boolean }) =>
  request<{ data: unknown }>({
    method: 'get',
    url: '/chain/process/supplyAccountProcess/processOuts',
    params,
  });

export const getEmissionInfo = (params: { id: number; flag?: boolean }) =>
  request<{ data: unknown }>({
    method: 'get',
    url: '/chain/process/accountProcessIn/info',
    params,
  });

export const getProcessInDetails = (params: { id: number; flag?: boolean }) =>
  request<{ data: unknown }>({
    method: 'get',
    url: '/chain/process/supplyAccountProcess/processInDetail',
    params,
  });

export const getOutInfo = (params: { id: number; flag?: boolean }) =>
  request<{ data: unknown }>({
    method: 'get',
    url: '/chain/process/accountProcessOut/info',
    params,
  });
