/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-10 09:38:05
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-01-17 09:46:30
 */

import { request } from '@src/api/request';

import { ProcessProduct, ProcessProductParams } from './type';

export const getProcessProductList = (
  params: ProcessProductParams & {
    pageNum: number;
    pageSize: number;
    selfId?: number;
  },
) =>
  request<{
    code: number;
    msg: string;
    data: { total: number; rows: ProcessProduct[] };
  }>({
    method: 'get',
    url: '/footprint3/factor/processList',
    params,
  });
