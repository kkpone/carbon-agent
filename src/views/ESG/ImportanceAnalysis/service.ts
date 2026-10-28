import { request } from '@/api/request';

export const getImportanceAnalysisList = (params: {
  pageNum: number;
  pageSize: number;
  [P: string]: any;
}) =>
  request<{ rows: Record<string, any>[]; total: number }>({
    url: '/esg/survey/list',
    params,
  });

export const addImportanceAnalysis = data =>
  request({
    method: 'post',
    url: '/esg/survey/add',
    data,
  });

export const publishImportanceAnalysis = id =>
  request({
    method: 'put',
    url: `/esg/survey/publish/${id}`,
  });

export const closeImportanceAnalysis = id =>
  request({
    method: 'put',
    url: `/esg/survey/close/${id}`,
  });
