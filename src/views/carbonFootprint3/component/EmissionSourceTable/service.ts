/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-02 11:53:28
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-02 11:56:25
 */
import { request } from '@src/api/request';

import { EmissionSource } from './type';

export const getEmissionSourceList = (
  params: Partial<Pick<EmissionSource, 'name' | 'type'>> & {
    pageNum: number;
    pageSize: number;
    // 1：输入; 2：输出;  0|null： 全部
    libType?: number;
  },
) =>
  request<{
    data: { total: number; rows: EmissionSource[] };
  }>({
    method: 'get',
    url: '/footprint3/libEmission/list',
    params,
  });
