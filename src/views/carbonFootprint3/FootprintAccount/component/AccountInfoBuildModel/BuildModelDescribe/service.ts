import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  AddAiModelData,
  AiDataListApiData,
  AiDataListApiParams,
  AiDataSubApiBack,
  AiEditDataListApiData,
  CheckModelData,
  EmissionImportParams,
  EmissionImportTableList,
} from './type';

/** 模型检查 */
export function getModelCheck(params: { accountId: number }) {
  return request<AxiosResponse<CheckModelData>>({
    method: 'get',
    url: `/footprint3/account/modelCheck`,
    params,
  });
}

/** 模型检查 - 计算质量平衡检查 */
export function postCheckcalcMassBalance(data: CheckModelData) {
  return request<AxiosResponse<CheckModelData>>({
    method: 'post',
    url: `footprint3/account/calcMassBalance`,
    data,
  });
}

/** 快速核算 - 导出排放源 */
export function postQuickAccounEmissionExportExcel(params: {
  id: string | number;
}) {
  return request<{ code: number; data: { name: string; url: string } }>({
    method: 'get',
    url: `footprint3/account/export/excel/`,
    params,
  });
}

/**
 * 获取导入模态文件的接口
 * 该函数没有参数
 *
 * @returns 返回一个Promise，其resolve的值是一个对象，包含以下属性：
 * - code: 数字，表示接口返回码
 * - data: 对象，包含文件的名称和下载地址
 */
export function getImportModalFile(params: { id: string | number }) {
  return request<{
    code: number;
    data: {
      name: string;
      url: string;
    };
  }>({
    method: 'get',
    url: `footprint3/accountEmission/exportEmission`,
    params,
  });
}

/** 初始化核算明细 Excel（无 excelUrl 时用于生成明细地址） */
export function postInitAccountExcel(data: { accountId: number }) {
  return request<{ code: number; data?: unknown; msg?: string }>({
    method: 'post',
    url: `footprint3/accountEmission/initAccountExcel`,
    data,
  });
}

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

/** 将当前 Excel 各 sheet 的 index/name/id 同步到后端 */
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

/** 增量同步 sheet 映射（新增/重命名/删除） */
export function postAccountEmissionSyncWpsSheetMapDelta(
  data: SyncWpsSheetMapDeltaPayload,
) {
  return request<{ code?: number; data?: unknown; message?: string }>({
    method: 'post',
    url: 'footprint3/accountEmission/syncWpsSheetMapDelta',
    data,
  });
}

/** 获取排放源导入的数据 */
export function getFileEmissionImportApi(params: EmissionImportParams) {
  return request<AxiosResponse<EmissionImportTableList[]>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

/** 快速核算 - 导入排放源 - 确认导入 */
export function postFileImportAccountEmissionApi(data: {
  fileUrl: string;
  accountId?: number;
  fileName?: string;
}) {
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/upload?accountId=${data.accountId}`,
    data: FD,
  });
}

/** ai建模临时列表数据 */
export function getAiDataList(params: AiDataListApiParams) {
  return request<AxiosResponse<{ rows: AiDataListApiData[]; total: number }>>({
    method: 'get',
    url: `/footprint3/accountEmission/listTmp`,
    params,
  });
}

/** AI 建模 编辑临时排放源列表 */
export function postAiEditTmp(data: AiEditDataListApiData) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editTmp`,
    data,
  });
}

/** AI 建模 编辑临时排放源列表 */
export function postAiEditTmpAi(data: AiEditDataListApiData) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/editTmpAi`,
    data,
  });
}

export function postAddModel(
  data:
    | {
        fileUrl: {
          url: string;
        }[];
      }
    | {
        content: string;
      },
  params: {
    accountId: number;
    modelType: number;
  },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/createModel`,
    data: {
      ...data,
      ...params,
    },
  });
}

/** AI 建模 删除临时排放源列表 */
export function postAiDeleteTmp(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/deleteTmp`,
    data,
  });
}

/**
 * 获取AI弹窗提示状态
 * 该函数用于向服务器发送GET请求，以获取AI模型弹窗提示的显示状态。
 *
 * @returns 返回一个Promise，其解析值为一个Axios响应，包含一个布尔值，指示AI模型弹窗提示是否应显示。
 */
export function getAiPopoverStatus() {
  // 发送GET请求，请求AI模型弹窗提示的显示状态
  return request<AxiosResponse<boolean>>({
    method: 'get',
    url: `/footprint3/tipUserSetting/showFlag`,
    params: {
      // 指定请求的特性代码为AIModel
      featureCode: 'AIModel',
    },
  });
}

/** AI 提示框不再提醒 */
export function postAiClosePopover() {
  const FD = new FormData();
  FD.append('featureCode', 'AIModel');

  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/tipUserSetting/close`,
    data: FD,
  });
}

/** ai建模开始建模 */
export const postAddAiModel = (data: AddAiModelData) => {
  const FD = new FormData();
  FD.append('accountId', String(data.accountId));
  FD.append('content', data.content || '');

  return request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/accountEmission/addModel',
    data: FD,
  });
};

/** 确认建模 - AI 建模 临时排放源列表 */
export function postAiDeleteSub(data: {
  accountId: string | number;
  modelType: number;
}) {
  const FD = new FormData();
  FD.append('accountId', String(data.accountId));
  FD.append('modelType', String(data.modelType));

  return request<{ code: number; data: AiDataSubApiBack }>({
    method: 'post',
    url: `footprint3/accountEmission/submitModel`,
    data: FD,
  });
}

/**
 * 提交AI临时数据关闭数据请求
 * @param data 包含核算id的对象，核算ID可以是字符串或数字
 * @returns 返回一个Promise对象，其解析值为一个包含代码和数据的对象。其中代码为数字，数据也为数字。
 */
export function postAiCloseData(data: { accountId: string | number }) {
  const FD = new FormData();
  FD.append('accountId', String(data.accountId));

  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountEmission/cancelModel`,
    data: FD,
  });
}

/**
 * 判断当前ai动画是否执行完毕
 */
export function getAiProcessStatus(params: { accountId: string | number }) {
  // 发送GET请求，请求AI模型弹窗提示的显示状态
  return request<{ data: number }>({
    method: 'get',
    url: `/footprint3/accountEmission/aiProcess`,
    params,
  });
}
