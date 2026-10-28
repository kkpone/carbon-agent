/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-05 15:02:11
 * @Date: 2023-06-05 11:41:51
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { DatasFiltrateListApi, DatasFiltrateListParams } from './type';

/** 数据概览 - 菜单筛选 */
export function getDatasFiltrateList(params: DatasFiltrateListParams) {
  return request<AxiosResponse<DatasFiltrateListApi>>({
    method: 'get',
    url: `footprint3/dashboard/account/list`,
    params,
  });
}
