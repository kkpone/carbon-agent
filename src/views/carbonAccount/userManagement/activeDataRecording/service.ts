import { request } from '@src/api/request';

import {
  ActiveImportFile,
  ActivityRecordSearchParams,
  CarbonAccountActiveDataItemDetail,
  CarbonAccountActiveRollback,
} from './type';

// 活动数据列表详情页
export function ApicarbonAccountActiveDataRecordingDetailGet(params: {
  id: string;
}) {
  return request<{
    code: number;
    msg: string;
    data: CarbonAccountActiveDataItemDetail;
  }>({
    method: 'get',
    url: `/carbonAccount/behavior/detail`,
    params,
  });
}

// 上传模板
export function ApicarbonAccountActiveImportFile(data: FormData) {
  return request<{
    code: number;
    msg: string;
    data: ActiveImportFile | null;
  }>({
    method: 'post',
    url: `/carbonAccount/behavior/upload`,
    data,
  });
}

/** 撤销碳币 */
export function ApicarbonAccountRevocation(data: CarbonAccountActiveRollback) {
  return request<{
    code: number;
    msg: string;
  }>({
    method: 'post',
    url: `/carbonAccount/behavior/rollback`,
    data,
  });
}

// 导出
export function ApiBehaviorExportExcel(params: {
  begTime: string;
  endTime: string;
  excelName: string;
}) {
  return request<{ code: number; msg: string }>({
    method: 'get',
    url: `/carbonAccount/behavior/export/excel`,
    params,
  });
}

export const getActivityList = (
  params: Omit<ActivityRecordSearchParams, 'orgIds'> & { orgIds?: string },
) =>
  request({
    method: 'get',
    url: '/carbonAccount/behavior/page',
    params,
  });

export const batchCancelRevoke = data =>
  request({
    method: 'post',
    url: '/carbonAccount/behavior/cancel/rollback/batch',
    data,
  });
