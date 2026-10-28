import { request } from '@/api/request';

import { TempData } from './type';

export const getImportStatus = () =>
  request<{ data: number }>({
    url: '/enterprise/source/fillTemp/aiProcess',
  });

export const createAiModel = data =>
  request({
    method: 'post',
    url: '/enterprise/source/fillTemp/createModel',
    data,
  });

export const getAnalyzeList = params =>
  request<{
    rows: TempData[];
    total: number;
    waitDealTotal: number;
    sumTotal: number;
  }>({
    url: '/enterprise/source/fillTemp/list',
    params,
  });

export const cancelAiModel = () =>
  request({
    method: 'post',
    url: '/enterprise/source/fillTemp/cancelModel',
  });

export const submitAiModel = () =>
  request<{ data: { errorCode: number; errorMsg: string } }>({
    method: 'post',
    url: 'enterprise/source/fillTemp/submitModel',
  });

export const editTempData = (data: Partial<TempData>) =>
  request({
    method: 'post',
    url: '/enterprise/source/fillTemp/edit',
    data,
  });

export const deleteTempData = (id: number) =>
  request({
    method: 'delete',
    url: `/enterprise/source/fillTemp/delete/${id}`,
  });

export const batchDeleteTempData = data =>
  request({
    method: 'post',
    url: '/enterprise/source/fillTemp/deleteBatch',
    data,
  });
