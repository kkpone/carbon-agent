import { request } from '@/api/request';

export const getFormulaList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    method: 'GET',
    url: '/enterprise/method/list',
    params,
  });

export const getParamList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    method: 'GET',
    url: '/enterprise/methodParam/list',
    params,
  });

export const addParam = (data: Record<string, any>) =>
  request({
    method: 'POST',
    url: '/enterprise/methodParam/add',
    data,
  });

export const editParam = (data: Record<string, any>) =>
  request({
    method: 'POST',
    url: '/enterprise/methodParam/edit',
    data,
  });

export const getParamDetail = params =>
  request<{ data: Record<string, any> }>({
    method: 'GET',
    url: '/enterprise/methodParam/info',
    params,
  });

export const toggleParamStatus = id =>
  request({
    method: 'PUT',
    url: `/enterprise/methodParam/updateStatus/${id}`,
  });

export const addFormula = data =>
  request({
    method: 'POST',
    url: '/enterprise/method/add',
    data,
  });

export const editFormula = data =>
  request({
    method: 'POST',
    url: '/enterprise/method/edit',
    data,
  });

export const getFormulaDetail = params =>
  request<{
    data: {
      name: string;
      paramItem: { id: number; name: string }[];
      formula: { type: number; value: string; label: string }[];
    };
  }>({
    method: 'GET',
    url: '/enterprise/method/info',
    params,
  });

export const toggleFormulaStatus = id =>
  request({
    method: 'PUT',
    url: `/enterprise/method/updateStatus/${id}`,
  });
