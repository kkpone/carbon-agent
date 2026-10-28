/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-06-30 18:12:04
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 18:02:28
 */
import { request } from '@src/api/request';

import {
  ApiGetLntegralRecordData,
  CarbonAccountActiveDataGetParams,
} from './type';
// 活动数据列表
export function ApicarbonAccountIntegralRecordGet(
  params: CarbonAccountActiveDataGetParams,
) {
  return request<ApiGetLntegralRecordData>({
    method: 'get',
    url: `/carbonAccount/score/page`,
    params: {
      ...params,
    },
  });
}
// 导出
export function ApiScoreExportExcel(params: {
  begTime: string;
  endTime: string;
  excelName: string;
}) {
  return request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/score/export/excel`,
    params,
  });
}
