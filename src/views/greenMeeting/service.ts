import { request } from '@api/request';
import { AxiosResponse } from 'axios';

interface ListType {
  page: number;
  size: number;
  actName?: string;
  status?: number | null; // 0未开始 1进行中 2已结束
  accountingName?: string;
}
interface ListResType {
  code: number;
  msg: string;
  data: { rows: any[] };
  total: number;
}
// 活动列表和搜索
export function apiActivityList(
  params: ListType,
): Promise<AxiosResponse<ListResType>> {
  return request<ListResType>({
    method: 'GET',
    url: `/meeting/activity/list`,
    params,
  });
}

// 新增活动
export function apiActivityAdd(data) {
  return request({
    method: 'POST',
    url: `/meeting/activity/add`,
    data,
  });
}

// 新增活动
export function apiActivityEdit(data) {
  return request({
    method: 'POST',
    url: `/meeting/activity/edit`,
    data,
  });
}
// 活动详情
export function apiActivityInfo(params) {
  return request({
    method: 'get',
    url: `/meeting/activity/info`,
    params,
  });
}

// 删除活动
export function apiActivityDelete(data) {
  return request({
    method: 'post',
    url: `/meeting/activity/delete`,
    data,
  });
}

// 碳核算列表和搜索
export function apiCarbonAccountingList(params: ListType) {
  return request<ListResType>({
    method: 'get',
    url: `/meeting/carbonAccounting/list`,
    params,
  });
}

// 新增碳核算
export function apiCarbonAccountingAdd(data) {
  return request<ListResType>({
    method: 'POST',
    url: `/meeting/carbonAccounting/add`,
    data,
  });
}

// 编辑碳核算
export function apiCarbonAccountingEdit(data) {
  return request<ListResType>({
    method: 'POST',
    url: `/meeting/carbonAccounting/edit`,
    data,
  });
}

// 碳核算数据管理详情
export function apiCarbonAccountingInfo(params) {
  return request<any>({
    method: 'GET',
    url: `/meeting/carbonAccounting/info`,
    params,
  });
}

// 模型列表-新增碳核算时
export function apiCarbonAccountingTplModels(params: ListType) {
  return request<ListResType>({
    method: 'get',
    url: `/meeting/carbonAccounting/tplModels`,
    params,
  });
}

// 编辑初始化
export function apiCarbonAccountingInit(params) {
  return request<ListResType>({
    method: 'get',
    url: `/meeting/carbonAccounting/init`,
    params,
  });
}
// 保存碳核算数据
export function apiCarbonAccountingData(data) {
  return request({
    method: 'POST',
    url: `/meeting/carbonAccounting/saveData`,
    data,
  });
}
// 删除碳核算数据
export function apiCarbonAccountingDelete(data) {
  return request({
    method: 'POST',
    url: `/meeting/carbonAccounting/delete`,
    data,
  });
}
// 数据统计
export function apiCarbonAccountingStatistics(params) {
  return request({
    method: 'get',
    url: `/meeting/carbonAccounting/statistics`,
    params,
  });
}
// 地址树
export function apiAddressTree(params) {
  return request({
    method: 'get',
    url: `management/address/addressTree`,
    params,
  });
}

// 碳核算报告列表
export function apiAccountingReportList(params) {
  return request({
    method: 'get',
    url: `/meeting/accountingReport/list`,
    params,
  });
}

// 新增碳核算报告
export function apiAccountingReportAdd(data) {
  return request({
    method: 'POST',
    url: `/meeting/accountingReport/add`,
    data,
  });
}

// 编辑碳核算报告
export function apiAccountingReportEdit(data) {
  return request({
    method: 'POST',
    url: `/meeting/accountingReport/edit`,
    data,
  });
}

// 删除碳核算报告
export function apiAccountingReportDelete(data) {
  return request({
    method: 'POST',
    url: `/meeting/accountingReport/delete`,
    data,
  });
}

// 碳核算报告详情
export function apiAccountingReportInfo(params) {
  return request({
    method: 'GET',
    url: `/meeting/accountingReport/info`,
    params,
  });
}

// 生成碳核算报告
export function apiAccountingReportGenerate(data) {
  return request({
    method: 'POST',
    url: `/meeting/accountingReport/generate`,
    data,
  });
}
