import { request } from '@/api/request';

export const getQuestionnaireResultList = params =>
  request<{ data: { rows: Record<string, any>[]; total: number } }>({
    url: '/management/question/resultList',
    params,
  });

export const deleteResult = data =>
  request({
    method: 'post',
    url: '/management/question/result/delete',
    data,
  });

export const exportResult = params =>
  request<Blob>({
    method: 'get',
    url: '/management/question/exportDetail',
    responseType: 'blob',
    params,
  });

export const editEmployeeCount = data =>
  request({
    method: 'post',
    url: '/management/question/updateEmployeeCount',
    data,
  });
