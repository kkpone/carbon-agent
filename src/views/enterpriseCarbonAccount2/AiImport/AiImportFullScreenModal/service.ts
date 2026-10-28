import { request } from '@/api/request';

import { EmissionSource, SearchParams } from './type';

export const cancelAiModel = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/cancelModel',
    params,
  });

export const getTempList = (params: SearchParams) =>
  request<{ rows: EmissionSource[]; total: number }>({
    url: '/enterprise/source/temp/list',
    params,
  });

export const editTempEmissionSource = (data: Partial<EmissionSource>) =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/updateList',
    data,
  });

export const deleteTempEmissionSource = (id: number) =>
  request({
    method: 'delete',
    url: `/enterprise/source/temp/delete/${id}`,
  });

export const getGHGList = () =>
  request<{
    data: {
      id: string;
      name: string;
      children: { id: string; name: string }[];
    }[];
  }>({
    url: '/enterprise/category/list/category',
  });

export const importTempData = (params: {
  computationId: string;
  computationPeriod: string;
}) =>
  request<{ data: { errorCode: number; errorMsg: string } }>({
    method: 'post',
    url: 'enterprise/source/temp/submitModel',
    params,
  });
