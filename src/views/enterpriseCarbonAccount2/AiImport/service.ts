import { request } from '@/api/request';

export const getImportStatus = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request<{ data: number }>({
    url: '/enterprise/source/temp/aiProcess',
    params,
  });

export const getTravelImportStatus = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request<{ data: number }>({
    url: '/enterprise/business/travel/aiProcess',
    params,
  });

export const downloadTemplate = (params: { computationId: string }) =>
  request<{ data: { path: string } }>({
    url: '/enterprise/source/temp/export/template',
    params,
  });

export const createAiModel = (data: {
  computationId: string;
  computationPeriod: string;
  fileUrl: { url: string }[];
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/createModel',
    data,
  });

export const createTravelAiModel = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/createModel',
    data,
  });
