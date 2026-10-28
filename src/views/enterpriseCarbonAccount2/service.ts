/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-12 18:25:00
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

import {
  AccountListBackTableData,
  BackTableData,
  EnterpriseCategorys,
  SourceCategoryListType,
} from './utils/type';
import { Dicts } from '../emission/Show/type';
import { DataComputationBackData } from '../supplyChain2/carbonDataManage/SupplierCarbonData/type';

export interface PropsType {
  data: any;
  industry?: Dicts[];
  saveData: (values) => void | undefined;
  getData: () => void | undefined;
  pageType: string;
  refreshData?;
  cityList?: any[];
  ISOInfo?: any[];
  GHGInfo?: any[];
  unitMList?: any[];
  setPropCanEdit?: any;
}
interface ListResType {
  code: number;
  msg: string;
  rows: [];
  total: number;
}

/**
 * @description 创建控制计划列表
 * @param params
 * @returns
 */
export function apiEnterprisePlanList(params) {
  return request<ListResType>({
    method: 'get',
    url: '/enterprise/plan/list',
    params,
  });
}
/**
 * 创建控制计划
 */
export function apiEnterprisePlan(data) {
  return request<ListResType>({
    method: 'POST',
    url: '/enterprise/plan',
    data,
  });
}

/**
 * 复制控制计划
 */
export function apiEnterprisePlanCp(data) {
  return request<ListResType>({
    method: 'POST',
    url: '/enterprise/plan/cp',
    data,
  });
}

/**
 * 控制计划详情
 */
export function apiEnterprisePlanDetail(id) {
  return request<ListResType>({
    method: 'GET',
    url: `enterprise/plan/${id}`,
  });
}
/**
 * 删除控制计划详情
 */
export function apiDeletePlane(id) {
  return request<ListResType>({
    method: 'DELETE',
    url: `enterprise/plan/${id}`,
  });
}
/**
 * 编辑控制计划详情
 */
export function apiDeletePlaneEdit(data) {
  return request({
    method: 'PUT',
    url: `enterprise/plan/edit`,
    data,
  });
}
/**
 * 创建编辑主营产品/服务
 * @param method PUT修改 POST新增
 */
export function apiProduct(data, method) {
  return request({
    method,
    url: `enterprise/product`,
    data,
  });
}
/**
 * 删除主营产品/服务
 * @param id
 */
export function apiDeleteProduct(id) {
  return request({
    method: 'DELETE',
    url: `enterprise/product/${id}`,
  });
}
/**
 * 排放分类列表
 *
 */
export function apiClassList() {
  return request({
    method: 'GET',
    url: `enterprise/emission/class/list`,
  });
}
/**
 * 数据管理计划列表
 *
 */
export function apiPlanDataList(params) {
  return request({
    method: 'GET',
    url: `enterprise/plan/data/list`,
    params,
  });
}

/**
 * 数据管理计划详情
 */
export function apiEnterprisePlanDataDetail(id) {
  return request<ListResType>({
    method: 'GET',
    url: `enterprise/plan/data/${id}`,
  });
}

/**
 * 数据管理计划新增
 */
export function apiEnterprisePlanDataAdd(data) {
  return request<ListResType>({
    method: 'POST',
    url: `enterprise/plan/data`,
    data,
  });
}

/**
 * 数据管理计划编辑
 */
export function apiEnterprisePlanDataEdit(data) {
  return request<ListResType>({
    method: 'PUT',
    url: `enterprise/plan/data/edit`,
    data,
  });
}

/**
 * 核算列表
 */
export function apiEnterpriseComputationList(params) {
  return request<BackTableData<AccountListBackTableData> | any>({
    method: 'GET',
    url: `enterprise/computation/list`,
    params,
  });
}

/**
 * 删除核算
 */
export function apiComputationDeleted(id) {
  return request<ListResType>({
    method: 'GET',
    url: `/enterprise/computation/deleted/${id}`,
  });
}
/**
 * 核算详情
 */
export function apiComputationInfo(id) {
  return request<AxiosResponse<DataComputationBackData>>({
    method: 'GET',
    url: `/enterprise/computation/${id}`,
  });
}
/**
 * 分类列表
 */
export function apiCategoryList(id: string | number) {
  return request<AxiosResponse<EnterpriseCategorys[]>>({
    method: 'GET',
    url: `/enterprise/category/list/${id}`,
    // headers: {
    //   authorization: '05cb0491-6c05-4485-88ad-e162a4f77ee4+1000001609567572',
    // },
  });
}
/**
 * 获取分类下的了排放源列表
 */
export function apiSourceList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/list`,
    params,
    // headers: {
    //   authorization: '05cb0491-6c05-4485-88ad-e162a4f77ee4+1000001609567572',
    // },
  });
}
/**
 * 新增排放源
 */
export function apiSourceAdd(data) {
  return request({
    method: 'POST',
    url: `/enterprise/source/add`,
    data,
  });
}
/**
 * 编辑排放源
 */
export function apiSourceEdit(data) {
  return request<AxiosResponse<any>>({
    method: 'POST',
    url: `/enterprise/source/edit`,
    data,
  });
}

/**
 * 排放源详情
 */
export function apiSourceQueryInfo(id) {
  return request({
    method: 'GET',
    url: `/enterprise/source/info/${id}`,
  });
}
/**
 * 排放源详情
 */
export function apiSourceQueryChianInfo(id) {
  return request({
    method: 'GET',
    url: `chain/data/outer/enterprise/source/info?id=${id}`,
  });
}
/**
 * 排放源详情
 */
export function apiSourceQueryCopy(id) {
  return request({
    method: 'GET',
    url: `/enterprise/source/copy/${id}`,
  });
}

/**
 * 选择排放因子列表
 */
export function apiSourceQueryFactor(data) {
  return request({
    method: 'POST',
    url: `/enterprise/source/queryFactor`,
    data,
  });
}
/**
 * 选择添加排放源
 */
export function apiSourceListGas(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/list/gas`,
    params,
  });
}

/**
 * 因子详情
 */
export function apiFactorDetail(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/factor/detail`,
    params,
  });
}
/**
 * 修改活动数据
 */
export function apiEditActivityData(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/edit/activityData`,
    params,
  });
}

/**
 * 删除排放源
 */
export function apiSourceDeleted(id) {
  return request({
    method: 'GET',
    url: `/enterprise/source/deleted/${id}`,
  });
}

export enum UpdateFlag {
  add,
  update,
}
/**
 * 模型切换分类
 */
export function asyncToDict(params: {
  sourceId: number;
  updateFlag: UpdateFlag;
}) {
  return request({
    method: 'GET',
    url: `/enterprise/source/syncToDict`,
    params,
  });
}

/**
 * 保存为模型
 */
export function apiToModel(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/to/model`,
    params,
  });
}
/**
 * 单位转换
 */
export function apiUnitExchange(params) {
  return request({
    method: 'GET',
    url: `/management/system/unit/unitExchange`,
    params,
  });
}
/**
 * 排放源识别表->活动数据收集表->排放因子选择表
 */
export function apiRecognition(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/recognition`,
    params,
  });
}

export function apiEmissionRecognition(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/emissionSelected`,
    params,
  });
}

export function apiActivityDataRecognition(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/activityDataCollect`,
    params,
  });
}
/**
 * 组织运营边界调查表
 */
export function apiSurveyGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/survey`,
    params,
  });
}
/**
 * 排放量计算表
 */
export function apiComputationEmission(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/emission`,
    params,
  });
}
/**
 * 温室气体排放清单GHG
 */
export function apiInventoryGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/inventory/ghg`,
    params,
  });
}
/**
 * 温室气体排放清单ISO
 */
export function apiInventoryIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/inventory/iso`,
    params,
  });
}
/**
 * 清册ghg
 */
export function apiInventoryReportGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/inventory/ghg`,
    params,
  });
}
/**
 * 清册ISO
 */
export function apiInventoryReportIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/inventory/iso`,
    params,
  });
}
/**
 * 完整报告ISO标准
 */
export function apiInventoryReportWordIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/word/iso`,
    params,
  });
}
/**
 * 简版报告ISO标准
 */
export function apiInventoryReportSimpleIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/word/simple/iso`,
    params,
  });
}
/**
 * 完整报告GHG标准
 */
export function apiInventoryReportWordGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/word/ghg`,
    params,
  });
}
/**
 * 简版报告GHG标准
 */
export function apiInventoryReportSimpleGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/word/simple/ghg`,
    params,
  });
}
/**
 * 数据分类评价ISO
 */
export function apiDataIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/data/iso`,
    params,
  });
}
/**
 * 组织不确定性评估ISO
 */
export function apiOrgDataIso(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/data/iso`,
    params,
  });
}
/**
 * 根据气体 -> 获取gwp数值
 */
export function apiGwpInfo(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/gwp/info`,
    params,
  });
}

/**
 * 数据分类评价ISO
 */
export function apiDataGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/data/ghg`,
    params,
  });
}
/**
 * 组织不确定性评估GHG
 */
export function apiOrgDataGhg(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/data/ghg`,
    params,
  });
}

/**
 * 下载排放源导入模板
 */
export function apiExportTemplate(params) {
  return request<{ data: { path: string } }>({
    method: 'GET',
    url: `/enterprise/source/export/template`,
    params,
  });
}
/**
 * 导入历史
 */
export function apiExcelList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/source/excel/list`,
    params,
  });
}
/**
 * 导入排放源
 */
export function apiImportSource(data) {
  return request<{ code: number }>({
    method: 'POST',
    url: `/enterprise/source/import/source`,
    data,
  });
}

/**
 * 核算报告列表
 */
export function apiReportList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/record/list`,
    params,
  });
}

export function reGenerateReport(params: { reportFileRecordId: string }) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/reGenerate`,
    params,
  });
}

/**
 * 创建核算报告
 */
export function apiCalculateReport(data) {
  return request({
    method: 'POST',
    url: `/enterprise/calculate/report`,
    data,
  });
}
/**
 * 核算报告详情
 */
export function apiCalculateInfo(id) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/${id}`,
  });
}
/**
 * 更新核算报告
 */
export function apiCalculateEdit(data) {
  return request({
    method: 'PUT',
    url: `/enterprise/calculate/report/edit`,
    data,
  });
}
/**
 * 删除核算报告
 */
export function apiCalculateDelete(id) {
  return request({
    method: 'DELETE',
    url: `/enterprise/calculate/report/${id}`,
  });
}

/**
 * 删除核算报告
 */
export function deleteReport(params: { reportFileRecordId: string | number }) {
  return request({
    method: 'GET',
    url: `/enterprise/calculate/report/delete/report/record`,
    params,
  });
}
/**
 * 减排场景列表
 */
export function apiEmissionList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/emission/list`,
    params,
  });
}

export interface ModelItem {
  name: string;
  description: string;
  modelId: number;
  useCount: number;
}

/**
 * 模型列表
 */
export function apiAccountModelList(params: {
  pageNum?: number;
  pageSize?: number;
  name?: string;
}) {
  return request<{ total: number; rows: ModelItem[] }>({
    method: 'GET',
    url: `/enterprise/model/list`,
    params,
  });
}

/**
 * 删除核算模型
 */
export function apiModelDelete(id) {
  return request({
    method: 'GET',
    url: `/enterprise/model/deleted/${id}`,
  });
}
/**
 *新增模型
 */
export function apiAccuntModeAdd(data) {
  return request({
    method: 'POST',
    url: `/enterprise/model/add`,
    data,
  });
}
/**
 *编辑模型
 */
export function apiAccuntModeEdit(data) {
  return request({
    method: 'POST',
    url: `/enterprise/model/edit`,
    data,
  });
}

/**
 *复制模型
 */
export function apiAccountModeCopy(data) {
  return request({
    method: 'POST',
    url: `/enterprise/model/copy`,
    data,
  });
}

/**
 * 字典排放源详情
 */
export function apiModelSourceQueryInfo(params) {
  return request<any>({
    method: 'GET',
    url: `/enterprise/model/source/info`,
    params,
  });
}
/**
 * 删除字典排放源
 */
export function apiModelSourceDeleted(id) {
  return request({
    method: 'GET',
    url: `/enterprise/model/source/deleted/${id}`,
  });
}

export const distributeLibEmission = data =>
  request({
    method: 'POST',
    url: `/enterprise/source/distribute`,
    data,
  });

export const batchDeleteLibEmission = data =>
  request({
    method: 'POST',
    url: `/enterprise/model/source/deleteBatch`,
    data,
  });
/**
 * 排放源库
 */
export function apiModelSourceLists(params) {
  return request({
    method: 'GET',
    url: `/enterprise/model/source/list`,
    params,
  });
}

/**
 * 字典导入
 */
export function apiModelImport(data) {
  return request<{ code: number }>({
    method: 'POST',
    url: `/enterprise/model/import/dictSource`,
    data,
  });
}
/**
 * 排放基准列表
 */
export function apiStandardList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/standard/emission/list`,
    params,
  });
}
/**
 * 排放基准详情
 */
export function apiStandardInfo(id) {
  return request({
    method: 'GET',
    url: `/enterprise/standard/emission/${id}`,
  });
}
/**
 * 排放基准修改
 */
export function apiStandardEdit(data) {
  return request({
    method: 'PUT',
    url: `/enterprise/standard/emission`,
    data,
  });
}
/**
 * 获取编辑中排放基准列表
 */
export function apiComputationEmissionList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/emissionList`,
    params,
  });
}
/**
 * 创建排放基准
 */
export function apiStandardAdd(data) {
  return request({
    method: 'post',
    url: `/enterprise/standard/emission`,
    data,
  });
}
/**
 * 减排场景详情
 */
export function apiEmissionInfo(id) {
  return request({
    method: 'GET',
    url: `/enterprise/emission/${id}`,
  });
}
/**
 * 修改减排场景
 */
export function apiEmissionEdit(data) {
  return request({
    method: 'PUT',
    url: `/enterprise/emission`,
    data,
  });
}
/**
 * 创建减排场景
 */
export function apiEmissionAdd(data) {
  return request({
    method: 'POST',
    url: `/enterprise/emission`,
    data,
  });
}
/**
 * 删除减排场景
 */
export function apiEmissionDelete(id) {
  return request({
    method: 'DELETE',
    url: `/enterprise/emission/${id}`,
  });
}

/**
 * 根据排放源活动数据计算排放量
 */
export function apiComputationCacl(params) {
  return request({
    method: 'GET',
    url: `/enterprise/computation/cacl`,
    params,
  });
}
/**
 * 获取默认排放id
 */
export function apiSourceDefaultValue() {
  return request({
    method: 'GET',
    url: `/enterprise/source/default/value`,
  });
}
/**
 * 枚举值列表
 */
export function apiLabelList(params) {
  return request({
    method: 'GET',
    url: `/enterprise/label/list`,
    params,
  });
}
/**
 * 枚举值添加
 */
export function apiAddLabel(data) {
  return request({
    method: 'POST',
    url: `/enterprise/label/add`,
    data,
  });
}

/**
 * 枚举值删除
 */
export function apiRemoveLabel(params) {
  return request({
    method: 'GET',
    url: `/enterprise/label/remove`,
    params,
  });
}

/**
 * 新增排放源 -> 供应商数据
 */
export function apiSourceSupplierAdd(data) {
  return request({
    method: 'POST',
    url: `/enterprise/source/supplier/add`,
    data,
  });
}
/**
 * 编辑排放源 -> 供应商数据
 */
export function apiSourceSupplierEdit(data) {
  return request({
    method: 'POST',
    url: `/enterprise/source/supplier/edit`,
    data,
  });
}
/**
 * 排放源库-排放源GHG分类树
 */
export function apiModelSourceCategoryList(params: {
  name?: string;
  facility?: string;
  activityUnit?: string;
}) {
  return request<
    AxiosResponse<{ list: SourceCategoryListType[]; total: number }>
  >({
    method: 'GET',
    url: `/enterprise/model/source/category/tree`,
    params,
  });
}

/**
 * @description 获取企业是否购买供应链
 * @returns
 */
export function isBuySupplier() {
  return request<{ data: boolean }>({
    method: 'get',
    url: '/management/companyProduct/buy/supplier',
  });
}
