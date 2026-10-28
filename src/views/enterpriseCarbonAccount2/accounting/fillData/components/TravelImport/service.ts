import { request } from '@/api/request';

export const createTravelAiModel = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/createModel',
    data,
  });

export const getImportStatus = (params: {
  computationId: string;
  computationPeriod?: string;
}) =>
  request<{ data: number }>({
    url: '/enterprise/business/travel/aiProcess',
    params,
  });
