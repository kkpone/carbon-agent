import { request } from '@/api/request';

export const createAiModel = (data: {
  computationId: string;
  computationPeriod: string;
  fileUrl: { url: string }[];
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/createModel',
    data,
  });

export const downloadTemplate = (params: { computationId: string }) =>
  request<{ data: { path: string } }>({
    url: '/enterprise/source/temp/export/template',
    params,
  });
