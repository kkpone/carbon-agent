import { request } from '@src/api/request';

import { GraphAccountLifeCycleData } from './type';
import { BuildModelVisualChangeType } from '../constant';

export const getGraphAccountView = (params: {
  id: number | string;
  groupType: BuildModelVisualChangeType;
  lang?: string;
}) =>
  request<{ data: GraphAccountLifeCycleData }>({
    method: 'get',
    url: '/footprint3/account/accountView',
    params,
  });

/** 快速核算  - 删除排放源 */
export function postQuickAccountEmissionDelete(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/delete`,
    data,
  });
}

/** AI 建模 删除临时排放源列表 */
export function postAIQuickAccountEmissionDelete(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/deleteTmp`,
    data,
  });
}

/** 快速核算 - 保存到库 */
export function postQuickAccounEmissionInStore(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/inStore`,
    data,
  });
}

/** 将当前 Excel 各 sheet 的 index/name/id 同步到后端，用于绑定 wpsSheetId */
export type SyncWpsSheetMapRow = {
  index: string;
  name: string;
  id: string;
};

export type SyncWpsSheetMapDeltaType = 'add' | 'update' | 'delete';

export type SyncWpsSheetMapDeltaPayload = {
  accountId: number;
  type: SyncWpsSheetMapDeltaType;
  sheet: SyncWpsSheetMapRow;
};

export function postAccountEmissionSyncWpsSheetMap(data: {
  accountId: number;
  sheetList: SyncWpsSheetMapRow[];
}) {
  return request<{ code?: number; data?: unknown; message?: string }>({
    method: 'post',
    url: 'footprint3/accountEmission/syncWpsSheetMap',
    data,
  });
}

export function postAccountEmissionSyncWpsSheetMapDelta(
  data: SyncWpsSheetMapDeltaPayload,
) {
  return request<{ code?: number; data?: unknown; message?: string }>({
    method: 'post',
    url: 'footprint3/accountEmission/syncWpsSheetMapDelta',
    data,
  });
}

/** 排放源复用 sheet 组 */
export function postAccountEmissionEditEmissionSheet(data: {
  emissionId: number;
  wpsSheetId: string;
}) {
  return request<{ code?: number; data?: unknown; message?: string }>({
    method: 'post',
    url: 'footprint3/accountEmission/editEmissionSheet',
    data,
  });
}

export type AccountEmissionAlysisResult = {
  mergeReason?: string;
  logic?: string[];
  finalValue?: string;
  finalValueUnit?: string;
};

/** 排放源 AI 解析 */
export function postAccountEmissionAlysisEmissionSheet(data: {
  emissionId: number;
}) {
  return request<{
    code?: number;
    msg?: string;
    data?: AccountEmissionAlysisResult;
  }>({
    method: 'post',
    url: 'footprint3/accountEmission/alysisEmissionSheet',
    data,
  });
}

/** 排放源明细数据填入 */
export function postAccountEmissionEditEmissionData(data: {
  id: number;
  amount: string;
  unitName: string;
}) {
  return request<{ code?: number; msg?: string; data?: unknown }>({
    method: 'post',
    url: 'footprint3/accountEmission/editEmissionData',
    data,
  });
}
