import { request } from '@src/api/request';

import { BatchTaskPayload } from './type';

/** 保存批量解析建模任务 POST /footprint3/batchTask/saveTask */
export const saveBatchTask = (data: BatchTaskPayload) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/saveTask',
    data,
  });

/** 开始解析批量建模文件 POST /footprint3/batchTask/parseFile */
export const parseBatchTaskFile = (data: BatchTaskPayload) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/parseFile',
    data,
  });
