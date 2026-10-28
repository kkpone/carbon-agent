import { request } from '@/api/request';
import { Province, ProvinceLevel, GreenEnergyPolicy } from './type';

export const getProvinceList = (params: { level: number }) =>
  request<{ data: Province[] }>({
    url: '/management/address/addressTree',
    method: 'GET',
    params,
  });

export const getProvinceLevel = () =>
  request<{ data: ProvinceLevel[] }>({
    url: '/management/elecPolicy/elecMapData',
    method: 'GET',
  });

export const getGreenEnergyPolicy = (
  params: {
    areaCode: string;
    pageNum: number;
    pageSize: number;
    status: number;
  },
  signal: AbortSignal,
) =>
  request<{ data: { rows: GreenEnergyPolicy[]; total: number } }>({
    url: '/management/elecPolicy/list',
    method: 'GET',
    params,
    signal,
  });
