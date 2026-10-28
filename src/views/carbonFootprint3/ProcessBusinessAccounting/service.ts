/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-05 17:11:07
 * @Date: 2023-02-28 16:15:05
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { omit } from 'lodash-es';

import { PostProcessInData } from './VisualizationDrawer/type';
import {
  ProcessBusinessAccountingAddBasicData,
  ProcessBusinessAccountingEmissionParams,
  ProcessBusinessAccountingMenu,
  ProcessBusinessAccountingTableData,
  ProcessBusinessAccountingUpadteScopeData,
} from './type';
import { QuickBusinessAccountingInfo } from '../QuickBusinessAccounting/type';
import {
  ProcessLibData,
  ProcessLibIn,
  ProcessLibOut,
  ProcessLibProduct,
} from '../discharge/process/type';
import { AddFileData, BackTableData } from '../type';

/** 过程核算 - 详情 */
export function getProcessAccountingInfo(params: { id: string }) {
  return request<AxiosResponse<QuickBusinessAccountingInfo>>({
    method: 'get',
    url: `footprint3/account/info`,
    params,
  });
}

/** 过程核算 - 切换生命周期 */
export const postProcessAccountUpadteScope = (
  data: ProcessBusinessAccountingUpadteScopeData,
) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/account/updateScope',
    data,
  });

/** 过程核算 - 列表数据 */
export function getProcessBusinessAccountingTableData(
  params: Partial<ProcessBusinessAccountingEmissionParams> & {
    pageNum: number;
    pageSize: number;
  },
) {
  return request<
    AxiosResponse<BackTableData<ProcessBusinessAccountingTableData>>
  >({
    method: 'get',
    url: `footprint3/account/list`,
    params: { ...params, type: 1 },
  });
}
/** 过程核算 - 复制过程核算基本信息 */
export const postProcessAccountCopyBasicScope = (
  data: ProcessBusinessAccountingAddBasicData,
) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copy',
    data,
  });
/** 过程核算 - 并去建模 */
export const postProcessAccountCopyViewBasicScope = (
  data: ProcessBusinessAccountingAddBasicData,
) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/copyAndView',
    data,
  });

/** 过程核算 - 仅保存 */
export const postProcessBusinessAccountingBasic = (
  data: ProcessBusinessAccountingAddBasicData,
) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/save',
    data,
  });

/** 过程核算 - 保存并建模 */
export const postProcessBusinessAccountingBasicAndView = (
  data: ProcessBusinessAccountingAddBasicData,
) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/saveAndView',
    data,
  });

/** 过程核算 - 去建模 */
export const postProcessBusinessAccountingBasicAddview = (data: {
  id: number | undefined;
}) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/account/addView',
    data,
  });

/** 过程核算 - 菜单初始化 */
export function getProcessBusinessmenu(id: string) {
  return request<AxiosResponse<ProcessBusinessAccountingMenu>>({
    method: 'get',
    url: `footprint3/account/menu`,
    params: { id },
  });
}

/** 过程核算 - 菜单初始化 */
export function postProcessBusinessNextMenu(
  data: ProcessBusinessAccountingMenu,
) {
  return request<AxiosResponse<ProcessBusinessAccountingMenu[]>>({
    method: 'post',
    url: `footprint3/account/nextMenu`,
    data,
  });
}

/** 过程核算 - 过程的明细 */
export const postProcessBusinessAccountingDetails = (
  data: ProcessBusinessAccountingMenu,
) =>
  request<{
    data: {
      processProducts: ProcessLibProduct[];
      processIns: ProcessLibIn[];
      processOuts: ProcessLibOut[];
    };
  }>({
    method: 'get',
    url: '/footprint3/accountProcess/details',
    params: omit(data, 'children'),
  });

/** 过程库输入详情 */
export const postProcessAccountingDetailsInfo = (
  data: ProcessBusinessAccountingMenu,
) =>
  request<{ data: ProcessLibIn }>({
    method: 'get',
    url: '/footprint3/accountProcess/details',
    params: omit(data, 'children'),
  });

/** 查看过程核算产品详情 */
export const getProcessAccountProduct = (params: { id: number }) =>
  request<{ data: ProcessLibProduct }>({
    method: 'get',
    url: '/footprint3/accountProcessProduct/info',
    params,
  });

/** 查询过程库 */
export const getAccountProcess = (params: { id: string }) =>
  request<{ code: number; msg: string; data: ProcessLibData }>({
    method: 'get',
    url: '/footprint3/accountProcess/info',
    params,
  });

/** 编辑过程核算 */
export const postProcessAccountEdit = (data: ProcessLibData) =>
  request<{ code: number; msg: string; data: number }>({
    method: 'post',
    url: '/footprint3/accountProcess/edit',
    data,
  });

/** 新增过程核算产品 */
export const postProcessAccountProductAdd = (
  data: Partial<ProcessLibProduct> & { accountId: number },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessProduct/add',
    data,
  });

/** 编辑过程核算产品 */
export const postProcessAccountProductEdit = (
  data: Partial<ProcessLibProduct>,
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessProduct/edit',
    data,
  });

/** 编辑过程核算输入 */
export const postProcessAccountInEdit = (
  data: Partial<ProcessLibIn> & { accountId?: string; files?: AddFileData[] },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/edit',
    data,
  });

export const postProcessAccountInEditAndRequest = (
  data: Partial<ProcessLibIn> & { accountId?: string; files?: AddFileData[] },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/editAndRequest',
    data,
  });

/** 编辑过程核算输出 */
export const postProcessAccountOutInEdit = (
  data: Partial<ProcessLibIn> & { accountId?: string; files?: AddFileData[] },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessOut/edit',
    data,
  });

/** 生成碳足迹报告 */
export const postProcessAccountFinish = (data: { id: string | number }) =>
  request({
    method: 'post',
    url: '/footprint3/account/finish',
    data,
  });

/** 过程核算 - 可视化 - 编辑输入和排放源的值 */
export function postProcessVisualizationInEdit(
  data: PostProcessInData & {
    dataId: string | number;
    parentId: string;
    reSelect?: number;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/accountProcessIn/saveBatch`,
    data,
  });
}

/** 过程库 - 获取左侧树形结构 */
export function getProcessMenu(id: string) {
  return request<AxiosResponse<ProcessBusinessAccountingMenu>>({
    method: 'get',
    url: `footprint3/libProcess/menu`,
    params: { id },
  });
}

/** 过程库 - 获取左侧可展开节点树形结构 */
export function postProcessNextMenu(data: ProcessBusinessAccountingMenu) {
  return request<AxiosResponse<ProcessBusinessAccountingMenu[]>>({
    method: 'post',
    url: `footprint3/libProcess/nextMenu`,
    data,
  });
}

/** 过程库 - 过程的明细 */
export const postProcessDetails = (data: ProcessBusinessAccountingMenu) =>
  request<{
    data: {
      libProcessProducts: ProcessLibProduct[];
      libProcessIns: ProcessLibIn[];
      libProcessOuts: ProcessLibOut[];
    };
  }>({
    method: 'post',
    url: '/footprint3/libProcess/details',
    data,
  });

/** 过程库 - 过程详情 */
export const getProcess = (params: { id: string }) =>
  request<{ code: number; msg: string; data: ProcessLibData }>({
    method: 'get',
    url: '/footprint3/libProcess/info',
    params,
  });

/** 过程库 - 过程编辑 */
export const postProcessEdit = (data: ProcessLibData) =>
  request<{ code: number; msg: string; data: number }>({
    method: 'post',
    url: '/footprint3/libProcess/edit',
    data,
  });

/** 过程库 - 输入/输出详情 */
export const postProcessDetailsInfo = (data: ProcessBusinessAccountingMenu) =>
  request<{ data: ProcessLibIn }>({
    method: 'post',
    url: '/footprint3/libProcess/details',
    data,
  });

/** 过程库 - 编辑输入 */
export const postProcessInEdit = (
  data: Partial<ProcessLibIn> & { files?: AddFileData[] },
) =>
  request({
    method: 'post',
    url: '/footprint3/libProcessIn/edit',
    data,
  });

/** 过程库 - 编辑输出 */
export const postProcessOutEdit = (
  data: Partial<ProcessLibIn> & { accountId?: string; files?: AddFileData[] },
) =>
  request({
    method: 'post',
    url: '/footprint3/libProcessOut/edit',
    data,
  });
