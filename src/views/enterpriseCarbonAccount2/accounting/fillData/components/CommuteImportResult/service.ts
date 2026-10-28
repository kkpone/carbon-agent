import { request } from '@/api/request';

export const questionnaireImport = (params: {
  questionId: number;
  employeeCount?: number;
}) =>
  request<{
    data: {
      employeeCount: number;
      submitCount: number;
      sourceList: Record<string, any>[];
    };
  }>({
    url: '/management/question/sourceList',
    params,
  });

export const getEmissionSourceDetails = (params: {
  pageNum: number;
  pageSize: number;
  transType: number;
  questionId: number;
}) =>
  request<{ data: { total: number; rows: Record<string, any>[] } }>({
    url: '/management/question/sourceDetail',
    params,
  });

export const submitImportResult = data =>
  request({
    method: 'post',
    url: '/enterprise/source/submitQuestionSource',
    data,
  });
