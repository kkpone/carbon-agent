/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-24 09:57:09
 * @Date: 2023-03-23 10:53:34
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  PostAccessorProductsListData,
  PostProcessProductsListDataAdd,
} from './type';

/** 过程核算 - 抽屉 - 产品列表详细信息 */
export function postProcessVisualizationProductsList(data: {
  dataId: number;
  parentId: string;
}) {
  return request<AxiosResponse<PostAccessorProductsListData>>({
    method: 'post',
    url: `footprint3/accountProcessProduct/processProducts`,
    data,
  });
}

/** 过程核算 - 可视化 - 保存产品列表 */
export function postProcessVisualizationProductsAdd(
  data: PostProcessProductsListDataAdd,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/accountProcessProduct/saveBatch`,
    data,
  });
}
