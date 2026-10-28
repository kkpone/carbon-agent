/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 14:52:00
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-03 16:17:44
 */
import { request } from '@src/api/request';

import { AccountChartData, Emission } from './type';

export const getAccountResult = (params: { id: number }) =>
  request<{ data: AccountChartData }>({
    method: 'get',
    url: 'footprint3/account/result',
    params,
  });

export const getAccountTableInfo = (params: { accountId: number }) =>
  request<{
    data: {
      accountProcessInOutList: Emission[];
      accountProcessProductList: Emission[];
    };
  }>({
    method: 'get',
    url: '/footprint3/account/detailed/list',
    params,
  });

export const getAccountExportResult = (params: { accountId: number }) =>
  request<{
    data: {
      url: string;
      name: string;
    };
  }>({
    method: 'get',
    url: '/footprint3/account/export/detailed/excel',
    params,
  });
