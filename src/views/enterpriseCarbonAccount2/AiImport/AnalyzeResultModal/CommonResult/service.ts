import { request } from '@/api/request';

import { TempData } from './type';

export const getAnalyzeList = params =>
  request<{
    rows: TempData[];
    total: number;
    waitDealTotal: number;
    sumTotal: number;
  }>({
    url: '/enterprise/source/temp/list',
    params,
  });

export const editTempData = (data: Partial<TempData>) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/updateList',
    data,
  });

export const deleteTempData = (id: number) =>
  request({
    method: 'delete',
    url: `/enterprise/source/temp/delete/${id}`,
  });

export const batchDeleteTempData = data =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/deleteBatch',
    data,
  });
