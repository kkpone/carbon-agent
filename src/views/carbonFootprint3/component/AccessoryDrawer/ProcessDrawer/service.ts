/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-23 16:02:56
 * @Date: 2023-03-23 10:53:34
 * @@description:
 */
import { request } from '@src/api/request';
import {
  PostProcessInData,
  PostProcessProductsListData,
} from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';
import { AxiosResponse } from 'axios';

/** 过程核算 - 可视化 - 过程新增 */
export function postProcessVisualizationInAdd(
  data: PostProcessInData & {
    dataId: string | number;
    parentId: string;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/accountProcessIn/addNextBatch`,
    data,
  });
}

/** 过程核算 - 可视化 - 过程复制 */
export function postProcessVisualizationInCopy(
  data: PostProcessInData & {
    dataId: string | number;
    parentId: string;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/accountProcessIn/copyBatch`,
    data,
  });
}

/** 过程核算 - 可视化 - 选择过程 */
export function getProcessVisualizationDetailData(params: {
  processId: number;
}) {
  return request<AxiosResponse<PostProcessProductsListData>>({
    method: 'get',
    url: `footprint3/factor/processDetail`,
    params,
  });
}
