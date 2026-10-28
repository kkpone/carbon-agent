/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-15 16:35:47
 * @Date: 2023-05-12 15:35:48
 * @@description:
 */
import { request } from '@src/api/request';
import { withShareEditSnapFlag } from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import {
  SerachCarbonFactorEmissionParams,
  SerachCarbonFactorResult,
} from '@src/components/SearchFactor/type';
import { PostProcessInDrawerInfoData } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/type';
import { QuickBusinessAccountingSource } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';
import { AxiosResponse } from 'axios';

import { AddFileData, Emission } from './type';

export function getEmissionType(params: { stage?: number }) {
  return request<{ code: number; data: { value: number; label: string }[] }>({
    method: 'get',
    url: `footprint3/accountProcessIn/processInTypes`,
    params,
  });
}

/** 快速核算 - 排放源类型 */
export function getQuickEmissionType(params: { stage?: number }) {
  return request<{ code: number; data: { value: number; label: string }[] }>({
    method: 'get',
    url: `footprint3/accountEmission/emissionTypes`,
    params,
  });
}

/** 过程核算 - 输入 - 过程信息 */
export function getProcessAccountInDetail(data: {
  dataId: string | number;
  parentId: string | number;
}) {
  return request<{ data: PostProcessInDrawerInfoData }>({
    method: 'get',
    url: `footprint3/accountProcessIn/processInDetail`,
    params: data,
  });
}

/** 过程核算 - 输入 - 排放源信息 */
export function getProcessAccountEmissionInfo(params: { id: number }) {
  return request<AxiosResponse<Emission>>({
    method: 'get',
    url: `footprint3/accountProcessIn/info`,
    params,
  });
}

/** 新增过程核算输入 - 排放源 */
export const postProcessAccountEmissionInAdd = (
  data: Partial<Emission> & {
    accountId?: number;
    processId?: number;
    files?: AddFileData[];
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/add',
    data,
  });

export const postProcessAccountInAddAndRequest = (
  data: Partial<Emission> & {
    accountId?: number;
    processId?: number;
    files?: AddFileData[];
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/addAndRequest',
    data,
  });

/** 编辑过程核算输入 - 排放源 */
export const postProcessAccountInEmissionEdit = (
  data: Partial<Emission> & {
    processId?: number;
    accountId?: number;
    files?: AddFileData[];
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/edit',
    data,
  });

export const postProcessAccountInEditAndRequest = (
  data: Partial<Emission> & {
    accountId?: number;
    processId?: number;
    files?: AddFileData[];
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/accountProcessIn/editAndRequest',
    data,
  });

/** 删除过程核算输入 */
export const postProcessAccountInDelete = (data: Pick<Emission, 'id'>) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/accountProcessIn/delete',
    data,
  });

/** 自动匹配因子 */
export const postAutoMatchFactor = (
  data: Omit<SerachCarbonFactorEmissionParams, 'pageNum' | 'pageSize'> & {
    /** 当前排放源描述，独立透传，选填且最长200字。 */
    emissionSourceDescription?: string;
  },
) => {
  const searchParams = new URLSearchParams(window.location.search);
  const accountId = searchParams.get('accountId') || undefined;

  return request<{ code: number; data: SerachCarbonFactorResult }>({
    method: 'post',
    url: '/footprint3/factor/matchFactor',
    data: withShareEditSnapFlag({
      ...data,
      accountId: accountId ? Number(accountId) : data.accountId,
    }),
  });
};

/** 核算 -  复制排放源 */
export function postAccountingEmissionCopy(
  data: QuickBusinessAccountingSource,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/add`,
    data,
  });
}
