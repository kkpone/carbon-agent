/*
 * @@description:
 */

import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { TableProps } from 'antd/es/table';

import { FromItemProps, FromItemTypeBack } from '../FormUtil/type';

export interface FilterState {
  [columnKey: string]: any; // 根据实际筛选条件类型调整
}

/**
 * @description: 搜索因子的参数
 */
export interface SearchFactorProps {
  /** 选择完毕因子后的提交回调 */
  subClick: (data: SerachCarbonFactorResult) => void;
  isEnterprise?: boolean;
  /** 因子名称 */
  factorName?: string;
  /** 排放源名称 */
  emissionType?: string;
  /** 因子单位信息 */
  factorUnitM?: string[];
  tableScrollOptions?: TableProps<any>['scroll'];
  onCancel?: () => Promise<any>;
  AdditionalFormItem?: FromItemProps<keyof FromItemTypeBack>[];
  AdditionalParams?: object & {
    transportType?: number;
  };
  sourceType?: string;
  //   "emissionId": "", //排放源id
  // "emissionName": "", //排放源名称
  // "emissionAmount": "", //排放源数量
  // "emissionUnit": "" //排放源单位
  emissionId?: string;
  emissionName?: string;
  emissionAmount?: string;
  emissionUnit?: string;
  /** ghg 分类 */
  emissionClassify?: string;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 id */
  factorPrefId?: number | string;
}
/** 工艺新增各个环节的返回值参数 */
export interface SerachCarbonFactorResultDataApi {
  rows: SerachCarbonFactorResult[];
  total: number;
}
/** 查询因子表格数据 */
export interface SerachCarbonFactorResult {
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
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
  searchId?: string;
  recommendReason?: string;
  ecoinventGeography?: string | null;
  referenceProductName?: string | null;
}

/**
 * 检索类型 1 用户搜索 2 自动匹配 3 用户搜索-ai排序
 */
export enum MatchTypeEnum {
  basic = '1',
  auto = '2',
  sortByAi = '3',
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
  transportType?: string;
  sortField?: string;
  sortOrder?: string;
  /** 发布机构 */
  institution?: string;
  ecoinventGeographies?: string[];
  matchType?: MatchTypeEnum;
  emissionId?: string;
  emissionName?: string;
  emissionAmount?: string;
  emissionUnit?: string;
  emissionClassify?: string;
  /** 共享编辑 snapFlag=8 */
  snapFlag?: number;
  accountId?: number;
}

type OnChange = NonNullable<TableProps<any>['onChange']>;

type GetSingle<T> = T extends (infer U)[] ? U : never;
export type Sorts = GetSingle<Parameters<OnChange>[2]>;
