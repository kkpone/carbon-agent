import { request } from '@/api/request';

export const editImportanceAnalysisInfo = data =>
  request({
    method: 'post',
    url: '/esg/survey/edit',
    data,
  });

export const getImportanceAnalysisInfo = params =>
  request<{ data: Record<string, any> }>({
    method: 'get',
    url: `/esg/survey/info`,
    params,
  });

export const translateText = params =>
  request<{ data: string }>({
    url: '/esg/survey/transText',
    params,
  });
