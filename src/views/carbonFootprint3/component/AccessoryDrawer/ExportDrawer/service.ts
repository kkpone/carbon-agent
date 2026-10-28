/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-12 09:55:53
 * @Date: 2023-03-23 10:53:34
 * @@description:
 */
import { request } from '@src/api/request';
import { PostProcessProductsListData } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';
import { AxiosResponse } from 'axios';

import { PostProcessOutsListDataAdd } from './type';

/** 过程核算 - 可视化 - 输出列表详细信息 */
export function postProcessVisualizationOutsList(data: {
  dataId: string | number;
  parentId: string;
}) {
  return request<AxiosResponse<PostProcessProductsListData>>({
    method: 'post',
    url: `footprint3/accountProcessOut/processOuts`,
    data,
  });
}

/** 过程核算 - 可视化 - 保存输出列表 */
export function postProcessVisualizationOutsAdd(
  data: PostProcessOutsListDataAdd,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/accountProcessOut/saveBatch`,
    data,
  });
}

/** 过程核算可视化 - 输出的类型 */
export function getFormDataByTypeApi() {
  return request<{ code: number; data: { label: string; value: number }[] }>({
    method: 'get',
    url: `/footprint3/accountProcessOut/outTypes`,
  });
}
