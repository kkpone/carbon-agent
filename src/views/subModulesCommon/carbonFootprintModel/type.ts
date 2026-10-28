import { ProcessIn } from '@/views/subModules/CarbonFootprintModel/BuildModel/ProcessList/type';
import {
  ProcessApiProduct,
  ProcessDetailVisualization,
} from '@/views/subModules/CarbonFootprintModel/components/ProcessDrawer/type';
import { FactorPatternType } from '@/views/subModules/CarbonFootprintModel/constant';

export type Dicts = {
  label: string;
  value: string;
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: number;
  sourceName: string;
  dictType: string;
  children?: Dicts[];
  relatedValue?: string;
  enumList?: Dicts[];
};

export type PostProcessInData = {
  processProducts: Record<string, any>[];
  process: Record<string, any>;
  processIn?: Record<string, any>;
};

/**
 * 1 自有因子 2 收藏因子 3 碳因子
 */
export enum FactorUse {
  'carbonstop' = '2',
  'organization' = '1',
  'all' = '3',
}

export type FactorUsageRecor = {
  //	是	因子id
  factorId: string | number;
  //	是	因子名称
  factorName: string | number;
  //	是	1 因子库因子 2 组织因子
  factorSource: string | number;

  // 因子搜索来源 - boss / saas
  plateform?: string;
};

export interface ListALLByDictTypeBatchEnum {
  [k: string]: Dicts[];
}

/**
 * @file 全局共用ts response 类型
 */
export interface BackendResponse<T> {
  code: number;
  data: T;
  msg: string;
  status?: string;
}

/**
 * 填写基本信息表单的展示
 */
export interface FormilyBasicFormData {
  type: number;
  accountName: string;
  modelName: string;
  unitName: string;
  unitCode: string[];
  amount: number;
  industry: string[][];
  scope: number;
  scopeValue: string;
}

/**
 * 接口提交需要的参数
 */
export interface ApiBasicFormData {
  unitCodeArr?: string;
  type: number;
  accountName: string;
  modelName: string;
  unitName: string;
  unitCode: string;
  amount: number;
  // 转换成JSON
  industry: string;
  scope: number;
  scopeValue: string;
}

export interface BackTableData<TableData> {
  currSize: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  rows: TableData[];
  total: number;
}

/** 查询因子参数 */
export interface SerachCarbonFactorEmissionParams {
  page?: number;
  size?: number;
  pageNum: number;
  pageSize: number;
  productId?: string;
  factorUnitM?: string[];
  /** 排放因子 组织因子 */
  factorType: string;
  /** 当前搜索因子名称 */
  name?: string;
  /** 发布国家/组织 */
  countries?: string;
  /** 发布年份 */
  year?: string;
  /** 排放源名称 */
  emissionType?: string;
  sourceType?: string;
  transportFuel?: string;
  transportTool?: string;
  transportType?: string;
  way?: string;
}

/** 查询因子表格数据 */
export interface SerachCarbonFactorResult {
  factorPattern?: FactorPatternType;
  fdType: number;
  area?: string;
  business: string;
  factorSource: string;
  year: string;
  isCollectFactor: string;
  description: string;
  updateTime: string;
  sourceLevel: string;
  factorValue: string;
  factorUnitName: string;
  factorSourceName: string;
  factorPublic: string;
  countries: string;
  remake: null;
  url?: string;
  rate?: number;
  institution: string;
  unit: string;
  createTime: string;
  cValue: string;
  name?: string;
  factorType: string;
  otherName: string;
  factorUse: string;
  id: string;
  facilities: string;
  factor?: string | number;
  matchResult?: string | number;
  matchResultName?: string;
  jmatchResultUnit?: string;
  numeratorUnit?: string;
  denominatorUnit?: string;
  /** 1 使用过 0 未使用 */
  useStatus?: 0 | 1;
  factorShow?: 0 | 1;
}

export interface EmissionSoureListData {
  id: number;
  /** 为null时该数据不可删除，不展示删除按钮 */
  companyId: number;
  type: 0;
  /** 排放源名称 */
  name: string;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
}

export type PostProcessProductsListData = {
  processProducts: ProcessApiProduct[];
  processIn: ProcessIn;
  process: ProcessDetailVisualization;
};
