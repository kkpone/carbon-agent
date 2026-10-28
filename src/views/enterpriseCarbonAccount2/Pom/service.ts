import { request } from '@src/api/request';

import { OperateData, OperateIndicator } from './type';

export const getOperateDataList = (params: { id: number }) =>
  request<{ total: number; rows: OperateData[] }>({
    method: 'GET',
    url: '/enterprise/operate/v2/list/indicator/data',
    params,
  });

// 运营数据详情

// 新增运营数据
export const postOperateDataAdd = data =>
  request({
    method: 'POST',
    url: '/enterprise/operate/v2/add/indicator/data',
    data,
  });

// 编辑运营数据
export const postOperateDataEdit = data =>
  request({
    method: 'post',
    url: '/enterprise/operate/v2/edit/indicator/data',
    data,
  });

// 删除运营数据
export const deleteOperateData = (params: { id: number }) =>
  request({
    url: '/enterprise/operate/v2/deleted/indicator/data',
    params,
  });

// 运营指标列表
export const getOperateIndicatorList = () =>
  request<{ data: OperateIndicator[] }>({
    method: 'GET',
    url: '/enterprise/operate/v2/list/indicator',
  });

// 新增运营指标
export const postOperateIndicatorAdd = (
  data: Pick<OperateIndicator, 'name' | 'unit'>,
) =>
  request({
    method: 'POST',
    url: '/enterprise/operate/v2/add/indicator',
    data,
  });

// 编辑运营指标
export const putOperateIndicatorEdit = (
  data: Pick<OperateIndicator, 'name' | 'unit' | 'id'>,
) =>
  request({
    method: 'POST',
    url: '/enterprise/operate/v2/edit/indicator',
    data,
  });

// 删除运营指标
export const deleteOperateIndicator = (params: { id: number }) =>
  request({
    method: 'GET',
    url: '/enterprise/operate/v2/deleted/indicator',
    params,
  });

// 启禁用运营指标

export const getPartList = () =>
  request<{ data: { id: number; orgName: string; orgType: number }[] }>({
    url: '/enterprise/operate/org/main/list',
  });

export const getDataYearList = (params: { id: number }) =>
  request<{ data: { year: string; status: number }[] }>({
    url: '/enterprise/operate/v2/list/year',
    params,
  });

export const getDataDetails = (params: { id: number }) =>
  request<{
    data: {
      indicatorNewId: number;
      year: string;
      companyType: number;
      orgIndicator: Record<number, { type: number; values: number[] }>;
    };
  }>({
    url: '/enterprise/operate/v2/info/indicator/data',
    params,
  });

export const calcIndicatorData = data =>
  request<{
    data: {
      orgIndicator: Record<number, { type: string; values: (number | null)[] }>;
    };
  }>({
    method: 'post',
    url: '/enterprise/operate/v2/calculate/indicator/data',
    data,
  });
