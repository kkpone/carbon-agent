import { request } from '@/api/request';

export const getGasList = () =>
  request<{
    data: { gasData: Record<string, any>[]; formulaData: Record<string, any> };
  }>({
    url: '/management/system/gas/listGas',
  });

export const getFactor = (params: { id: string | number; searchId?: string }) =>
  request<{ data: Record<string, any> }>({
    url: '/management/system/company/querySaas',
    params,
  });

export const addFactor = data =>
  request({
    method: 'post',
    url: '/management/system/company/addSaas',
    data,
  });

export const editFactor = data =>
  request({
    method: 'post',
    url: '/management/system/company/editSaas',
    data,
  });
