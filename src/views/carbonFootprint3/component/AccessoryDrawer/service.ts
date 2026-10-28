import { request } from '@src/api/request';
import { CancelToken } from 'axios';

/**
 * 过程核算,过程库输出Drawer中因子单位换算比例
 * @param params
 * @returns
 */
export const getUnitRate = (params: { unitOne: string; unitTwo: string }) =>
  request<{ data: { unitValue: string } }>({
    method: 'get',
    url: '/management/system/unit/unitExchangeEnum',
    params,
  });

/**  自动填写换算比例 */
export function getFactorUnitRate(
  params: {
    unitName: string;
    factorUnit: string;
    // 排放源名称
    name?: string;
  },
  cancelToken?: CancelToken,
) {
  return request<{ code: number; data: number }>({
    method: 'get',
    url: `footprint3/factor/unitRate`,
    params,
    cancelToken,
  });
}
