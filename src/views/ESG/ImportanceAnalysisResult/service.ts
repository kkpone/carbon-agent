import { request } from '@/api/request';

export const closeSurvey = id =>
  request({
    method: 'put',
    url: `/esg/survey/close/${id}`,
  });
