import { request } from '@/api/request';

export const getSummaryAnalysis = params =>
  request<{ data: Record<string, any> }>({
    url: '/esg/survey/chartData',
    params,
  });

export const updateSummaryAnalysis = data =>
  request({
    method: 'POST',
    url: '/esg/survey/updateChart',
    data,
  });

export const updateScore = data =>
  request({
    method: 'POST',
    url: '/esg/survey/updateScore',
    data,
  });

export const resetScore = data =>
  request({
    method: 'POST',
    url: '/esg/survey/restore',
    data,
  });
