/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-03 16:15:32
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-12 18:26:38
 */
import { request } from '@src/api/request';
import { AxiosResponse } from '@src/api/types';

import {
  ProcessLibData,
  ProcessLibProduct,
  ProcessLibIn,
  ProcessLibOut,
  Dicts,
  ProcessInExpandData,
} from './type';
import { PostProcessProductsListData } from '../../ProcessBusinessAccounting/VisualizationDrawer/type';
import { Emission } from '../../component/AccessoryDrawer/EmissionDrawer/type';
import { PostAccessorOutPutsListData } from '../../component/AccessoryDrawer/OutPutDrawer/type';

/** 查询过程库列表 */
export const getProcessLibList = (
  params: Partial<Pick<ProcessLibData, 'name' | 'type' | 'status'>> & {
    pageNum: number;
    pageSize: number;
  },
) =>
  request<{ data: { total: number; rows: ProcessLibData[] } }>({
    method: 'get',
    url: '/footprint3/libProcess/list',
    params,
  });

/** 删除过程库 */
export const postProcessLibDelete = (data: Pick<ProcessLibData, 'id'>) =>
  request({
    method: 'post',
    url: '/footprint3/libProcess/delete',
    data,
  });

/** 新增过程库 */
export const postProcessLibAdd = (data: ProcessLibData) =>
  request<{ code: number; msg: string; data: number }>({
    method: 'post',
    url: '/footprint3/libProcess/add',
    data,
  });

/** 查询过程库详情 */
export const getProcessLibDetails = (params: { id: number }) =>
  request<{
    code: number;
    msg: string;
    data: {
      libProcessProducts: ProcessLibProduct[];
      libProcessIns: ProcessLibIn[];
      libProcessOuts: ProcessLibOut[];
    };
  }>({
    method: 'get',
    url: '/footprint3/libProcess/details',
    params,
  });

/** 新增过程库产品 */
export const postProcessLibProductAdd = (data: Partial<ProcessLibProduct>) =>
  request({
    method: 'post',
    url: '/footprint3/libProcessProduct/add',
    data,
  });

/** 查看过程库产品详情 */
export const getProcessLibProduct = (params: { id: number }) =>
  request<{ data: ProcessLibProduct }>({
    method: 'get',
    url: '/footprint3/libProcessProduct/info',
    params,
  });

/** 编辑过程库产品 */
export const postProcessLibProductEdit = (data: Partial<ProcessLibProduct>) =>
  request({
    method: 'post',
    url: '/footprint3/libProcessProduct/edit',
    data,
  });

/** 获取单位换算比例  */
export const getUnitRate = (params: {
  unitName: string;
  factorUnit: string;
  name?: string;
}) =>
  request<{ data: string }>({
    method: 'get',
    url: '/footprint3/factor/unitRate',
    params,
  });

export const getCheckProcessProduct = (params: {
  id: number;
  oldProcessId?: number;
}) =>
  request<{ data: string }>({
    method: 'get',
    url: '/footprint3/factor/checkProcessProduct',
    params,
  });

export const getDictList = <T extends string = 'factorUnitM'>(params: {
  dictTypes: string;
}) =>
  request<{ data: { [key in T]: Dicts[] } }>({
    method: 'GET',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params,
  });

/** 过程库新接口 */

/** 过程库 - 添加过程 */
export function postProcessAdd(data: Record<string, any>) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: 'footprint3/libProcess/addView',
    data,
  });
}

/** 过程库 - 添加排放源 */
export function postEmissionAdd(
  data: Partial<Emission> & { processId: number },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/add',
    data,
  });
}

/** 过程库 - 获取排放源详情 */
export function getEmissionInfo(params: { id: number }) {
  return request<{ code: number; msg: string; data: Emission }>({
    method: 'get',
    url: 'footprint3/libProcessIn/info',
    params,
  });
}

/** 过程库 - 编辑排放源 */
export function postEmissionEdit(
  data: Partial<Emission> & { processId: number; id: number },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/edit',
    data,
  });
}

/** 过程库 - 添加单元过程 */
export function postUnitProcessAdd(
  data: { dataId: number; parentId: string } & Record<string, any>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/addNextBatch',
    data,
  });
}

/** 过程库 - 添加单元过程 */
export function postUnitProcessCopy(
  data: { dataId: number; parentId: string } & Record<string, any>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/copyBatch',
    data,
  });
}

/** 过程库 - 编辑单元过程 */
export function postUnitProcessEdit(
  data: { dataId: number; parentId: string } & Record<string, any>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/saveBatch',
    data,
  });
}

/** 过程库 - 获取单元过程详情 */
export function getUnitProcessInfo(data: {
  dataId: number;
  parentId: string | number;
}) {
  return request<{ code: number; msg: string; data: Record<string, any> }>({
    method: 'post',
    url: 'footprint3/libProcessIn/processInDetail',
    data,
  });
}

/** 过程库 - 获取产出物列表 */
export function getProcessOutputs(data: { dataId: number; parentId: string }) {
  return request<AxiosResponse<PostAccessorOutPutsListData>>({
    method: 'post',
    url: 'footprint3/libProcessProduct/processProducts',
    data,
  });
}

/** 过程库 - 编辑产出物 */
export function postProcessOutputsEdit(data) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessProduct/saveBatch',
    data,
  });
}

/** 过程核算 - 输入列表展开 */
export const getAccountProcessInExpand = (params: { matchTypeId: number }) =>
  request<AxiosResponse<ProcessInExpandData[]>>({
    method: 'get',
    url: '/footprint3/accountProcessIn/matchProducts',
    params,
  });

/** 过程库 - 输入列表展开 */
export const getProcessInExpand = (params: { matchTypeId: number }) =>
  request<AxiosResponse<ProcessInExpandData[]>>({
    method: 'get',
    url: '/footprint3/libProcessIn/matchProducts',
    params,
  });

/** 过程库 - 获取输出列表 */
export function getProcessExports(data: {
  dataId: string | number;
  parentId: string;
}) {
  return request<AxiosResponse<PostProcessProductsListData>>({
    method: 'post',
    url: `footprint3/libProcessOut/processOuts`,
    data,
  });
}

/** 过程库 - 编辑输出 */
export function postProcessExportsEdit(data: {
  dataId: string | number;
  parentId: string;
  processOuts: Record<string, any>[];
}) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/libProcessOut/saveBatch`,
    data,
  });
}

/** 过程库 - 可视化获取节点 */
export const getProcessView = (params: { id: number }) =>
  request<{ data: Record<string, unknown> }>({
    method: 'get',
    url: '/footprint3/libProcess/processView',
    params,
  });

/** 过程库 - 可视化获取下级节点 */
export function getProcessNextView(params: { dataId: number }) {
  return request<{ data: Record<string, any> }>({
    method: 'get',
    url: 'footprint3/libProcess/nextView',
    params,
  });
}

/** 过程库 - 修改节点折叠状态 */
export function postProcessViewNodeStatus(data: {
  id: number;
  status: number;
}) {
  return request({
    method: 'post',
    url: 'footprint3/libProcessIn/updateStatus',
    data,
  });
}

/** 过程库 删除输入 */
export function postProcessInDelete(data: { id: number }) {
  return request<{ code: number }>({
    method: 'post',
    url: 'footprint3/libProcessIn/delete',
    data,
  });
}
