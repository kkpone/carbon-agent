import { request } from '@/api/request';

import { TravelRoomTempData } from './type';

export const getTravelImportStatus = (params: {
  computationId: string;
  computationPeriod?: string;
}) =>
  request<{ data: number }>({
    url: '/enterprise/business/travel/aiProcess',
    params,
  });

export const getAnalyzeList = params =>
  request<{
    rows: TravelRoomTempData[];
    total: number;
    waitDealTotal: number;
    sumTotal: number;
  }>({
    url: 'enterprise/business/travel/list',
    params,
  });

export const editTempData = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/edit',
    data,
  });

export const deleteTempData = (id: number) =>
  request({
    method: 'delete',
    url: `/enterprise/business/travel/delete/${id}`,
  });

export const batchDeleteTempData = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/deleteBatch',
    data,
  });
