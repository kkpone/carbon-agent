import { request } from '@/api/request';

export const submitImportanceAnalysis = data =>
  request({
    method: 'post',
    url: '/esg/surveyResult/add',
    data,
  });
