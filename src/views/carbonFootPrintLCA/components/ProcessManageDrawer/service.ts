/**
 * @description 单位换算比例
 */

import { ResponseData, request } from '@/api/request';

export const getUnitConvert = (params: { unitOne: string; unitTwo: string }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'GET',
    url: '/management/system/unit/unitExchangeEnum',
    params,
  });
