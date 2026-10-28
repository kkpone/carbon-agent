import { request } from '@/api/request';

export const questionnaireSubmit = data =>
  request<{ data: number }>({
    method: 'post',
    url: '/management/question/submit',
    data,
  });

export const getQuestionnaireOverview = params =>
  request<{ data: Record<string, any> }>({
    method: 'get',
    url: '/management/question/result/info',
    params,
  });
