import { AxiosPromise } from 'axios';
import { Key } from 'react';

import {
  ApiResultIPageEmissionSource,
  getComputationEmissionSourcePageProps,
} from '@/sdks/computation/computationV2ApiDocs';

import { ResponseData, request } from './request';
import { ResponseTreeType } from './type';

// 查询枚举值（忽略大小写）
export const getEnumsApi = (
  enumName: string,
): AxiosPromise<{ data: { code: number; name: string }[] }> =>
  request<{ data: { code: number; name: string }[] }>({
    url: `/system/enums/${enumName}`,
    method: 'GET',
  });
// 批量删除排放源
export const postEnumsApi = (data: {
  idList: React.Key[];
}): AxiosPromise<{ message: string }> =>
  request<{ message: string }>({
    url: `/computation/emissionSource/batchDelete`,
    method: 'POST',
    data,
  });
// 启用  禁用
export const postUpdateStatusApi = (data: {
  id: React.Key[];
  status: number;
}): AxiosPromise<{ message: string }> =>
  request<{ message: string }>({
    url: `/computation/emissionSource/updateStatus`,
    method: 'POST',
    data,
  });
// 批量 启用/禁用
export const postUpdateStatusBatchApi = (data: {
  idList: React.Key[];
  status: number;
}): AxiosPromise<{ message: string }> =>
  request<{ message: string }>({
    url: `/computation/emissionSource/updateStatusBatch`,
    method: 'POST',
    data,
  });
// 排放源列表-树形
export const getSourceTreeApi = (params: {
  computationDataId: string;
  relateEmission: string;
}): AxiosPromise<ResponseTreeType> =>
  request<ResponseTreeType>({
    url: `/computation/data/source/tree`,
    method: 'GET',
    params,
  });
// GWP版本
export const getGwpTypeListApi = (): AxiosPromise<{ data: [] }> =>
  request<{ data: [] }>({
    url: `/computation/lib/gwp/typeList`,
    method: 'GET',
  });
// 计算并保存排放量
export const postCalcAndSaveApi = (data: {
  reqList: any[];
}): AxiosPromise<{ data: [] }> =>
  request<{ data: [] }>({
    url: `/computation/data/calcAndSave`,
    method: 'POST',
    data: data.reqList,
  });
// 填报数据 导入模版
export const getImportTemplateApi = (params: {
  computationId: string;
  computationDataId: string;
}): AxiosPromise<{ data: Blob | MediaSource }> =>
  request<{ data: Blob | MediaSource }>({
    url: `/computation/data/exportTemplate`,
    method: 'POST',
    params,
    responseType: 'blob',
  });
// 周期导入排放源
export const getImportTreeListApi = (data: {
  computationDataId: string;
  fileName: string;
  fileUrl: string;
}): AxiosPromise<{ code: number }> =>
  request<{ code: number }>({
    url: `/computation/data/importTreeList`,
    method: 'POST',
    // responseType: 'blob',
    data,
  });
//
export const getChoseEmissionSourceListApi = (
  params: getComputationEmissionSourcePageProps & { computationId: string },
): AxiosPromise<ApiResultIPageEmissionSource> =>
  request<ApiResultIPageEmissionSource>({
    url: `/computation/computation/emissionSource/choseEmissionSourceList`,
    method: 'GET',
    // responseType: 'blob',
    params,
  });
// 填报 - 批量删除排放源
export const postDeleteEmissionSourceApi = (data: {
  emissionSourceIds: string;
  id: string;
  delType: number;
}): AxiosPromise<{
  message: string;
  code: number;
}> =>
  request<{ message: string; code: number }>({
    url: `/computation/computation/emissionSource/delete`,
    method: 'POST',
    data,
  });
// 碳排放核算 批量删除

export const postDeleteComputationDeleteApi = (data: {
  idList?: Key[];
  id?: string;
}): AxiosPromise<{
  message: string;
  code: number;
}> =>
  request({
    url: `/computation/computation/delete`,
    method: 'POST',
    data,
  });
// 导出排放源-树形到下载管理中
export const getExportDataSourceTreeApi = (params: {
  computationDataId?: Key;
}): AxiosPromise<{
  message: string;
  code: number;
}> =>
  request({
    url: `/computation/data/source/exportDataSourceTree`,
    method: 'GET',
    params,
  });
export const getReport = (params: {
  computationId?: Key;
  pageNum: number;
  pageSize: number;
}): AxiosPromise<{
  message: string;
  code: number;
  data: {
    list: any[];
  };
}> =>
  request({
    url: `/computation/report/page`,
    method: 'GET',
    params,
  });
// 校验排放源删除
export const emissionVerifyDeleteApi = (data: { idList: any[] }) =>
  request({
    url: `/computation/emissionSource/verifyDelete`,
    method: 'POST',
    data,
  });
// 核算模型 - 排放源列表

export const choseModelEmissionSourceListApi = (
  params: getComputationEmissionSourcePageProps & {
    modelId: string;
    ghg: string | undefined;
    iso: string | undefined;
  },
): AxiosPromise<ApiResultIPageEmissionSource> =>
  request<ApiResultIPageEmissionSource>({
    url: `/computation/model/emissionSource/choseEmissionSourceList`,
    method: 'GET',
    // responseType: 'blob',
    params,
  });
// 批量删除核算校验
export const computationVerifyApi = (data: {
  idList: any[];
}): AxiosPromise<ApiResultIPageEmissionSource> =>
  request<ApiResultIPageEmissionSource>({
    url: `/computation/computation/verify`,
    method: 'POST',
    data,
  });
/**
 * 评价方案详情
 */
export interface AssessmentInfo {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价方法
   */
  assessmentMethodName?: string;
  /**
   * 评价指标。|分割
   */
  assessmentTargetList?: string;
  /**
   * 评价指标
   */
  assessmentTargetNames?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 功能单位
   */
  funcUnit?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 所属组织
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 方案名称
   */
  planName?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新者名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 模型版本号
   */
  version?: number;
  [property: string]: any;
}

/**
 * 查询评价方案
 */
export const getAssessmentInfo = (params: { id: number }) =>
  request<ResponseData<AssessmentInfo>>({
    method: 'GET',
    url: `/lca/assessment/${params.id}`,
    params,
  });
// 复制添加填报排放源
export const getcopyComputationData = (params: { id: string }) =>
  request<ResponseData<AssessmentInfo>>({
    method: 'GET',
    url: `/computation/data/copyComputationData`,
    params,
  });
// 更改核算是否主要
export const getUpdateMainComputation = (params: { id?: number }) =>
  request<ResponseData<AssessmentInfo>>({
    method: 'GET',
    url: `/computation/computation/updateMainComputation/${params.id}`,
    params,
  });
// 年份对应的主要核算

export const getMainComputationList = (params: {
  orgId?: number;
  startYear?: string;
  endYear?: string;
}) =>
  request<{ data: [] }>({
    method: 'GET',
    url: `/computation/dataDashboard/getMainComputationList`,
    params,
  });
// 认证中已经提交了的排放源详情
export const getAuthInfo = (params: {
  authNo?: string;
  emissionSourceId?: number;
}) =>
  request<{ data: any }>({
    method: 'GET',
    url: `/computation/emissionSource/getAuthInfo`,
    params,
  });
