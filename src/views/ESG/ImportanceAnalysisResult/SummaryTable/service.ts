import { request } from '@/api/request';

export const getSummaryTableData = params =>
  request<{ rows: Record<string, any>[]; total: number }>({
    url: '/esg/surveyResult/list',
    params,
  });

export const toggleStatus = id =>
  request({
    method: 'PUT',
    url: `/esg/surveyResult/status/${id}`,
  });
