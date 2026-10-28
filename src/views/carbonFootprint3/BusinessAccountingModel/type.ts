/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-08 10:51:49
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-26 14:35:20
 */
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { FactorPatternType } from '@src/views/emission/utils/index-type';

interface MatchObject {
  area: string;
  business: string;
  countries: string;
  description: string;
  factor: string;
  factorType: string;
  factorUse: string;
  id: number;
  institution: string;
  name: string;
  sourceLevel: string;
  unit: string;
  year: string;
}

/** 核算模型列表请求参数 */
export interface BusinessAccountingModelTableParams {
  /** 0 快速 1 过程 */
  type: number;
  /** 模型名称 */
  modelName: string;
  /** 评价范围:0-半生命周期;1-全生命周期;2-自定义. */
  scope: number;
}

/**
 * @description: 核算模型列表返回
 */
export interface BusinessAccountingModelTableData {
  id: number;
  source: number;
  companyId: number;
  /** 核算类型：0快速，1过程 */
  type: number;
  modelClass: string;
  modelName: string;
  accountName: string;
  /** 系统边界：0-半生命周期;1-全生命周期 */
  scope: number;
  scopeValue: string;
  description: string;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  delFlag: number;
}

/**
 * @description: 核算模型 新增模型
 */
export interface BusinessAccountingModelAdd {
  /** 核算类型：0快速，1过程 */
  type: number;
  modelName: string;
  accountName: string;
  /** 系统边界：0-半生命周期;1-全生命周期 */
  scope: number;
  description: string;
}

/**
 * @description: 核算模型 编辑模型
 */
export interface BusinessAccountingModelEdit
  extends BusinessAccountingModelAdd {
  id: string;
}

/**
 * @description: 核算模型 复制模型
 */
export interface BusinessAccountingModelCopy
  extends BusinessAccountingModelAdd {
  id: string;
}

/**
 * @description: 菜单返回的列表
 */
export interface QuickModelMenusList {
  code: number;
  name: string;
}

/**
 * @description: 模型信息
 */
export interface BusinessAccountingModelInfo {
  id: number;
  source: number;
  companyId: number;
  type: number;
  modelClass: null;
  modelName: string;
  accountName: string;
  scope: number;
  scopeValue: string;
  description: string;
  createBy: number;
  createTime: Date;
  updateBy: number;
  updateTime: Date;
  delFlag: number;
}

/**
 * @description: 模型排放源列表请求参数
 */
export interface BusinessAccountingModelEmissionParams {
  modelId: string;
  stage: number;
  pageNum?: number;
  pageSize?: number;
}

/**
 * @description: 排放源列表数据
 */
export interface BusinessAccountingModelEmissionData {
  greenhouseGas?: string;
  gwpValue?: string;
  /** 排放源描述，独立于备注，上限200字。 */
  emissionSourceDescription?: string;
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
  id: number;
  companyId: number;
  amount: number;
  modelId: number;
  stage: string;
  name: string;
  type: number;
  unitCode: string;
  unitName: string;
  typeExtra: TypeExtra;
  rate: string;
  matchWay: string;
  matchId: number;
  matchName: string;
  factor: string;
  factorUnit: string;
  institution: string;
  year: string;
  status: number;
  libState: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  remark: string;
  delFlag: number;
  matchObject: MatchObject;
  factorObj: SerachCarbonFactorResult;
  supplierObj?: Record<string, any>;
  businessId?: number;
  emissionTotal: string;
  requestState: number;
}

/**
 * @description: 运输相关的数据
 */
export interface TypeExtra {
  way: number;
  /** 运输单位标识 */
  distUnitCode?: string;
  /** 运输单位名称 */
  distUnitName?: string;
  unitCode?: string;
  unitName: string;
  /** 数量、重量、百分比 */
  amount?: string;
  /** 运输公里 */
  distance?: string;
}

/**
 * @description: 核算模型 - 快速核算 - 新增排放源
 */
export interface AddQuickEmissionSource {
  greenhouseGas?: string;
  gwpValue?: string;
  /** 排放源描述，独立于备注，上限200字。 */
  emissionSourceDescription?: string;
  modelId: string;
  stage: string;
  name: string;
  /** 类别：1原料，2能源，3运输，4加工，5使用，6水耗，7废弃处置 */
  type: number;
  typeExtraWay?: number;
  /** 单位标识 */
  unitCode?: string;
  /** 单位名称 */
  unitName?: string;
  /** 运输信息 */
  typeExtra?: TypeExtra;
  /** 换算比例 */
  rate?: number;
  /** 匹配方式 */
  matchWay: number;
  /** 因子信息 */
  factorObj: SerachCarbonFactorResult;
}

/**
 * @description: 核算模型 - 快速核算 - 排放源详情
 */
export interface QuickEmissionSourceInfo extends AddQuickEmissionSource {
  id: string | number;
}

/**
 * @description: 核算模型 - 快速核算 - 新增排放源 - 表单的返回值
 */
export interface AddQuickEmissionSourceFormData {
  greenhouseGas?: string;
  gwpValue?: string;
  /** 排放源描述，独立于备注，上限200字。 */
  emissionSourceDescription?: string;
  name: string;
  /** 类别：1原料，2能源，3运输，4加工，5使用，6水耗，7废弃处置 */
  type: number;
  /** 数量单位的标识 */
  unitData: number[];
  matchWay: number;
  factorObj: SerachCarbonFactorResult & {
    denominatorUnit?: string[];
    numeratorUnit?: string;
  };

  /** 运输 - 产品重量 */
  specificationWay2Numerator?: string;
  specificationWay2Denominator?: string;

  /** 运输 - 载重比 */
  specificationWay3Numerator?: string;
  specificationWay3Denominator?: string;
}
