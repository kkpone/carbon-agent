/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 14:52:00
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-07 17:42:22
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
  request<{ data: { accountList: Emission[] } }>({
    method: 'get',
    url: '/footprint3/account/detailed/list',
    params,
  });

export const getAccountExportResult = (params: { accountId: number }) =>
  request<{ data: string }>({
    method: 'get',
    url: '/footprint3/account/export/detailed/excel',
    params,
  });

/**
 * type: 0 快速核算 1 过程核算
 * hasModel 0没有模型，1有模型
 */
export const getHasModelNum = (params: { type: 0 | 1 }) =>
  request<{ data: { hasModel: 0 | 1 } }>({
    method: 'get',
    url: 'footprint3/model/init',
    params,
  });
