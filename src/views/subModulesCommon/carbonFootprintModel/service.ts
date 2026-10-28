import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { omit } from 'lodash-es';

import { withShareEditSnapFlag } from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';

import { request } from '@/api/request';
import {
  ProcessAccounMenu,
  ProcessIn,
  ProcessLibData,
  ProcessTableProduct,
} from '@/views/subModules/CarbonFootprintModel/BuildModel/ProcessList/type';
import { Factors } from '@/views/subModules/CarbonFootprintModel/components/Factor/FactorDetail/index-type';
import {
  ProcessProduct,
  ProcessProductParams,
} from '@/views/subModules/CarbonFootprintModel/components/ModalProcessLib/type';
import { PostAccessorOutPutsListData } from '@/views/subModules/CarbonFootprintModel/components/OutputDrawer/type';
import {
  PostAccessorProductsListData,
  PostProcessProductsListDataAdd,
} from '@/views/subModules/CarbonFootprintModel/components/ProductDrawer/type';
import {
  EmissionFormDataSource,
  EmissionImportParams,
  EmissionImportTableList,
  InfoData,
  MenuData,
  ModelEmissionData,
  ModelEmissionDataParams,
  UpadteScopeParams,
} from '@/views/subModules/CarbonFootprintModel/type';

import {
  ApiBasicFormData,
  BackTableData,
  BackendResponse,
  Dicts,
  EmissionSoureListData,
  FactorUsageRecor,
  FactorUse,
  ListALLByDictTypeBatchEnum,
  PostProcessProductsListData,
  SerachCarbonFactorEmissionParams,
  SerachCarbonFactorResult,
} from './type';

/**
 * 保存模型基本信息
 */
export const postSaveSubBasicInfo = (data: ApiBasicFormData) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/model/add',
    data,
  });

/**
 * 编辑 - 保存基本模型
 */
export const postSaveEditSubBasicInfo = (
  data: ApiBasicFormData & { id: number },
) =>
  request<{ code: number; data: string; msg: string }>({
    method: 'post',
    url: '/footprint3/model/edit',
    data,
  });

/**
 * 去建模
 */
export const postAddviewSubBasicInfo = (data: ApiBasicFormData) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/model/addView',
    data,
  });

/**
 * 去建模
 */
export const postCopyViewSubBasicInfo = (data: ApiBasicFormData) =>
  request<{ code: number; data: number; msg: string }>({
    method: 'post',
    url: '/footprint3/model/copyAccount',
    data,
  });

/** 过程核算 - 切换生命周期 */
export const postAccountUpadteScope = (data: UpadteScopeParams) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/model/updateScope',
    data,
  });

/** 获取菜单数据 */
export function getQuickListMenu(params: Record<string, any>) {
  return request<{ code: number; data: MenuData[] }>({
    method: 'get',
    url: `/footprint3/model/menu`,
    params,
  });
}

/** 获取过程菜单信息 */
export function getProcessListMenu(params: Record<string, any>) {
  return request<{ code: number; data: ProcessAccounMenu }>({
    method: 'get',
    url: `/footprint3/model/menu`,
    params,
  });
}

/** 获取过程菜单信息 */
export function getProcessLibListMenu(params: Record<string, any>) {
  return request<{ code: number; data: ProcessAccounMenu }>({
    method: 'get',
    url: `/footprint3/libProcess/menu`,
    params,
  });
}

/** 过程核算 - 子级 -  菜单初始化 */
export function postProcessNextMenu(data: ProcessAccounMenu) {
  return request<AxiosResponse<ProcessAccounMenu[]>>({
    method: 'post',
    url: `footprint3/model/nextMenu`,
    data,
  });
}

/** 过程库 - 获取左侧可展开节点树形结构 */
export function postProcessLibNextMenu(data: ProcessAccounMenu) {
  return request<AxiosResponse<ProcessAccounMenu[]>>({
    method: 'post',
    url: `footprint3/libProcess/nextMenu`,
    data,
  });
}

/** 删除过程核算输入 */
export const postProcessAccountInDelete = (data: { id: number }) =>
  request<{ code: number; data: number }>({
    method: 'post',
    url: '/footprint3/modelProcessIn/delete',
    data,
  });

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

/** 过程核算 - 输入 - 过程信息 */
export function getProcessAccountInDetail(data: {
  dataId: string | number;
  parentId: string | number;
}) {
  return request<{ data: Record<string, any> }>({
    method: 'get',
    url: `footprint3/modelProcessIn/processInDetail`,
    params: data,
  });
}

/** 过程库 - 获取排放源详情 */
export function getEmissionInfo(params: { id: number }) {
  return request<{ code: number; msg: string; data: EmissionFormDataSource }>({
    method: 'get',
    url: 'footprint3/libProcessIn/info',
    params,
  });
}

/** 过程核算 - 输入 - 排放源信息 */
export function getProcessAccountEmissionInfo(params: { id: number }) {
  return request<AxiosResponse<EmissionFormDataSource>>({
    method: 'get',
    url: `footprint3/modelProcessIn/info`,
    params,
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

/** 查询过程库 */
export const getAccountProcess = (params: { id: string }) =>
  request<{ code: number; msg: string; data: ProcessLibData }>({
    method: 'get',
    url: '/footprint3/modelProcess/info',
    params,
  });

/** 查询过程库 */
export const getAccountProcessLib = (params: { id: string }) =>
  request<{ code: number; msg: string; data: ProcessLibData }>({
    method: 'get',
    url: '/footprint3/libProcess/info',
    params,
  });

/** 过程库 - 过程的明细 */
export const postProcessDetails = (data: ProcessAccounMenu) =>
  request<{
    data: {
      libProcessProducts: ProcessTableProduct[];
      libProcessIns: ProcessIn[];
    };
  }>({
    method: 'post',
    url: '/footprint3/libProcess/details',
    data,
  });

/** 过程核算 - 过程的明细 */
export const postProcessBusinessAccountingDetails = (data: ProcessAccounMenu) =>
  request<{
    data: {
      processProducts: ProcessTableProduct[];
      processIns: ProcessIn[];
    };
  }>({
    method: 'get',
    url: '/footprint3/modelProcess/details',
    params: omit(data, 'children'),
  });

/** 查询过程库详情 */
export const getProcessLibDetails = (params: { id: number }) =>
  request<{
    code: number;
    msg: string;
    data: {
      libProcessProducts: ProcessTableProduct[];
      libProcessIns: ProcessIn[];
    };
  }>({
    method: 'get',
    url: '/footprint3/libProcess/details',
    params,
  });

/** 过程库 - 添加排放源 */
export function postEmissionAdd(
  data: Partial<EmissionFormDataSource> & { processId: number },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/add',
    data,
  });
}

/** 过程库 - 编辑排放源 */
export function postEmissionEdit(
  data: Partial<EmissionFormDataSource> & { processId: number },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/edit',
    data,
  });
}

/** 新增过程核算输入 - 排放源 */
export const postProcessAccountEmissionInAdd = (
  data: Partial<EmissionFormDataSource> & {
    modelId?: number;
    processId?: number;
    id?: number;
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/modelProcessIn/add',
    data,
  });

/** 编辑过程核算输入 - 排放源 */
export const postProcessAccountInEmissionEdit = (
  data: Partial<EmissionFormDataSource> & {
    processId?: number;
    modelId?: number;
    id?: number;
  },
) =>
  request({
    method: 'post',
    url: '/footprint3/modelProcessIn/edit',
    data,
  });

/** 过程库 - 获取产出物列表 */
export function getProcessOutputs(data: { dataId: number; parentId: string }) {
  return request<AxiosResponse<PostAccessorOutPutsListData>>({
    method: 'post',
    url: 'footprint3/libProcessProduct/processProducts',
    data,
  });
}

/** 过程核算 - 抽屉 - 产品列表详细信息 */
export function postProcessVisualizationProductsList(data: {
  dataId: number;
  parentId: string;
}) {
  return request<AxiosResponse<PostAccessorProductsListData>>({
    method: 'post',
    url: `footprint3/modelProcessProduct/processProducts`,
    data,
  });
}

/** 过程核算 - 可视化 - 保存产品列表 */
export function postProcessProductsAdd(data: PostProcessProductsListDataAdd) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/modelProcessProduct/saveBatch`,
    data,
  });
}

/** 过程库 - 编辑产出物 */
export function postProcessOutputsEdit(data: Record<string, any>) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessProduct/saveBatch',
    data,
  });
}

/** 过程库 - 添加单元过程 */
export function postUnitProcessCopy(
  data: { dataId?: number; parentId: string | number } & Record<string, any>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/copyBatch',
    data,
  });
}

/** 过程核算 - 可视化 - 过程复制 */
export function postProcessVisualizationInCopy(
  data: Record<string, any> & {
    dataId: string | number;
    parentId: string | number;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/modelProcessIn/copyBatch`,
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

export function postUnitProcessEdit(
  data: { dataId: number; parentId: string | number } & Record<string, any>,
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: 'footprint3/libProcessIn/saveBatch',
    data,
  });
}

/** 快速核算  - 删除排放源 */
export function postQuickAccountEmissionDelete(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/delete`,
    data,
  });
}

/** 快速核算 - 保存到库 */
export function postQuickAccounEmissionInStore(data: { id: string | number }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/inStore`,
    data,
  });
}

/** 快速核算 - 核算管理  - 排放源信息 */
export function getQuickBusinessAccountingEmissionInfo(params: { id: number }) {
  return request<AxiosResponse<EmissionFormDataSource>>({
    method: 'get',
    url: `footprint3/modelEmission/info`,
    params,
  });
}

/** 过程核算 - 可视化 - 编辑输入和排放源的值 */
export function postProcessVisualizationInEdit(
  data: Record<string, any> & {
    dataId: string | number;
    parentId: string | number;
    reSelect?: number;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/modelProcessIn/saveBatch`,
    data,
  });
}

/** 过程核算 - 可视化 - 过程新增 */
export function postProcessVisualizationInAdd(
  data: Record<string, any> & {
    dataId: string | number;
    parentId: string | number;
    reSelect?: number;
  },
) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `footprint3/modelProcessIn/addNextBatch`,
    data,
  });
}

/** 快速核算 - 核算管理 - 保存到库 */
export function postProcessBusinessAccountingEmissionInStore(data: {
  id: string | number;
}) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelProcessIn/inStore`,
    data,
  });
}

/** 排放源库 - 列表详情 */
export function getEmissionSoureLibraryTableDataDetail(params: {
  id: string | number;
}) {
  return request<AxiosResponse<EmissionFormDataSource>>({
    method: 'get',
    url: `footprint3/libEmission/info`,
    params,
  });
}

export const getEmissionSourceList = (
  params: Partial<Pick<EmissionFormDataSource, 'name' | 'type'>> & {
    pageNum: number;
    pageSize: number;
    // 1：输入; 2：输出;  0|null： 全部
    libType?: number;
  },
) =>
  request<{
    data: { total: number; rows: EmissionFormDataSource[] };
  }>({
    method: 'get',
    url: '/footprint3/libEmission/list',
    params,
  });

/**
 * 根据因子名称匹配因子
 */
export function associationalFactor(data: { name: string }) {
  return request<AxiosResponse<string[]>>({
    method: 'post',
    url: `/footprint3/factor/associationalFactor`,
    data,
  });
}

/** 快速核算 - 核算管理  - 新增排放源 */
export function postEmissionSourceAdd(data: EmissionFormDataSource) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `/footprint3/modelEmission/add`,
    data,
  });
}

/** 快速核算 - 核算管理  - 编辑排放源 */
export function postEmissionSourceEdit(
  data: EmissionFormDataSource & { id: string | number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/edit`,
    data,
  });
}

/** 快速核算  - 排放源列表 */
export function getModelEmissionData(params: ModelEmissionDataParams) {
  return request<AxiosResponse<BackTableData<ModelEmissionData>>>({
    method: 'get',
    url: `footprint3/modelEmission/list`,
    params,
  });
}

/**
 * @description 碳足迹、再生塑料 添加因子
 */
export const addFactorUsageRecord = (data: FactorUsageRecor) =>
  request<BackendResponse<null>>({
    url: 'system/useRecord/add',
    method: 'post',
    data,
  });

/**
 * 记录因子使用记录
 */
export const addFactorUse = (props: {
  factorSource: FactorUse;
  //	是	因子id
  factorId: string | number;
  //	是	因子名称
  factorName: string | number;
}) => {
  // api save usage
  addFactorUsageRecord({
    ...props,
    plateform: 'boss',
    // 计数接口，不必暴露错误
    // eslint-disable-next-line
  }).catch(err => console.warn('计数接口异常', err));
};

/** 获取因子数据table列表 */
export function getSerachCarbonFactorTable(
  data: SerachCarbonFactorEmissionParams,
) {
  return request<AxiosResponse<SerachCarbonFactorResult[]>>({
    method: 'post',
    url: `/footprint3/factor/queryFactorListSearchNoAuth`,
    data,
  });
}

// 13 根据字典标识查询字典枚举值-批量查询 全部 不分页
export function apiMnumListALLByDictTypeBatch({
  dictTypes,
  ...args
}: {
  dictTypes: string;
} & AxiosRequestConfig) {
  return request<{
    code: number;
    // data: { data: any; enterprise_export_template: { relatedValue: string }[] };
    msg: string;
    page: number;
    pageSize: number;
    data: ListALLByDictTypeBatchEnum;
    total: number;
  }>({
    method: 'get',
    url: `/management/system/enum/listALLByDictTypeBatch`,
    params: { dictTypes },
    ...args,
  });
}

// 因子库–>排放因子-组织排放因子-获取组织排放因子数据详细信息
// /system/enum/listALLByDictTypeData
export function apiListALLByDictTypeData(params: { dictType: string }) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: Dicts[];
    total: number;
  }>({
    method: 'get',
    url: `/management/system/enum/listDictTypeAndDataByType`,
    params,
  });
}

export const listALLByDictTypeBatch = <T extends Record<string, Dicts[]>>({
  dictTypes,
  ...axiosConfig
}: {
  dictTypes: string;
} & AxiosRequestConfig) =>
  request<BackendResponse<T>>({
    url: `/management/system/enum/listALLByDictTypeBatch`,
    method: 'GET',
    params: { dictTypes },
    ...axiosConfig,
  });

/**
 * @description 查 因子详情
 */
export const getFactors = (id: string) =>
  request<BackendResponse<Factors>>({
    url: `/management/system/company/querySaas?id=${id}`,
  });

/** 自动匹配因子（共享编辑 snapFlag=8 时自动携带 snapFlag） */
export const postAutoMatchFactor = (
  data: Omit<SerachCarbonFactorEmissionParams, 'pageNum' | 'pageSize'>,
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

/** 排放源名称列表 */
export function getEmissionSoureListData() {
  return request<BackTableData<EmissionSoureListData>>({
    method: 'get',
    url: `/footprint3/dict/list`,
  });
}

/**  自动填写换算比例 */
export function getFactorUnitRate(params: {
  unitName: string;
  factorUnit: string;
  // 排放源名称
  name?: string;
}) {
  return request<{ code: number; data: number }>({
    method: 'get',
    url: `footprint3/factor/unitRate`,
    params,
  });
}

/** 过程核算 - 输入列表展开 */
export const getAccountProcessInExpand = (params: { matchTypeId: number }) =>
  request<AxiosResponse<BackTableData<ProcessIn>[]>>({
    method: 'get',
    url: '/footprint3/modelProcessIn/matchProducts',
    params,
  });

/** 过程库 - 输入列表展开 */
export const getProcessInExpand = (params: { matchTypeId: number }) =>
  request<AxiosResponse<BackTableData<ProcessIn>[]>>({
    method: 'get',
    url: '/footprint3/libProcessIn/matchProducts',
    params,
  });

/** 快速核算 - 排放源类型 */
export function getQuickEmissionType(params: { stage?: number }) {
  return request<AxiosResponse<{ value: number; label: string }[]>>({
    method: 'get',
    url: `footprint3/accountEmission/emissionTypes`,
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
    url: `footprint3/modelEmission/exportEmission`,
    params,
  });
}

/** 循环调用文件接口数据是否异步导入完毕 */
export function getSysFileStatus(params: { id: number }) {
  return request<{ data: number }>({
    method: 'get',
    url: `/footprint3/sysImportRecord/status`,
    params,
  });
}

/** 快速核算 - 导入排放源 - 确认导入 */
export function postFileImportAccountEmissionApi(data: {
  fileUrl: string;
  modelId?: number;
  fileName?: string;
}) {
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelEmission/upload?modelId=${data.modelId}`,
    data: FD,
  });
}

/** 获取排放源导入的数据 */
export function getFileEmissionImportApi(params: EmissionImportParams) {
  return request<AxiosResponse<EmissionImportTableList[]>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/query`,
    params,
  });
}

/** 快速核算 - 导出排放源 */
export function postQuickAccounEmissionExportExcel(params: {
  id: string | number;
}) {
  return request<{ code: number; data: { name: string; url: string } }>({
    method: 'get',
    url: `footprint3/model/export/excel/`,
    params,
  });
}

export const getProcessProductList = (
  params: ProcessProductParams & {
    pageNum: number;
    pageSize: number;
    selfId?: number;
  },
) =>
  request<{
    code: number;
    msg: string;
    data: { total: number; rows: ProcessProduct[] };
  }>({
    method: 'get',
    url: '/footprint3/libProcess/list',
    params,
  });

/** 过程核算 - 可视化 - 选择过程 */
export function getProcessVisualizationDetailData(params: {
  dataId: number;
  parentId: number;
}) {
  return request<AxiosResponse<PostProcessProductsListData>>({
    method: 'post',
    url: `/footprint3/libProcessIn/processInDetail`,
    data: params,
  });
}

/** 过程库 - 过程详情 */
export const getProcess = (params: { id: string }) =>
  request<{ code: number; msg: string; data: InfoData }>({
    method: 'get',
    url: '/footprint3/libProcess/info',
    params,
  });
