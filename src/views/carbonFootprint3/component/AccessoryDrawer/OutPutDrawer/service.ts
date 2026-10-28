/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-11 17:01:44
 * @Date: 2023-03-23 10:53:34
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { PostAccessorOutPutsListData } from './type';

/** 过程核算 - 抽屉 - 产品列表详细信息 */
export function postProcessVisualizationOutPutsList(data: {
  dataId: number;
  parentId: string;
}) {
  return request<AxiosResponse<PostAccessorOutPutsListData>>({
    method: 'post',
    url: `footprint3/accountProcessProduct/processProducts`,
    data,
  });
}
