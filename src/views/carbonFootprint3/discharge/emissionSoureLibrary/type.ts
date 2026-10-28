import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { FetchNewPage } from '@src/components/TableUtil/types/util';

export type EmissionLibImportParams = {
  type: 2;
} & FetchNewPage;

/** 导入记录表格每一列数据 */
export interface EmissionLibImportTableList {
  id: number;
  companyId: number;
  module: number;
  module_name: string;
  name: string;
  totalRows: number;
  normalRows: number;
  errorRows: number;
  url: string;
  urlError: string;
  status: number;
  status_name: string;
  createTime: string;
  createBy: number;
  createByName: string;
  fail: number;
  failUrl: string;
}

export interface EmissionSoureLibraryAddForm extends Object {
  /** 排放源描述，上限200字，独立于备注。 */
  emissionSourceDescription?: string;
  factor: string;
  factorUnit: string;
  institution: string;
  year: string;
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

export interface EmissionSoureLibraryEditForm
  extends EmissionSoureLibraryAddForm {
  id: string | number;
}

/** 排放源库 - 搜索参数 */
export interface EmissionSoureLibraryTableParams {
  type?: number;
  /** 排放源库的名称 */
  name?: string;
}

/** 排放源库 - 菜单返回值 */
export type EmissionSoureLibraryMenuData = {
  code: number;
  name: string;
  count: number;
  orderNum: number;
};

/**
 * @description: 排放源库 - 列表
 */
export interface EmissionSoureLibraryTableData {
  id: number;
  source: number;
  source_name: string;
  companyId: number;
  name: string;
  type: number;
  unitCode: string;
  unitName: string;
  typeExtra: TypeExtra;
  rate: string;
  matchWay: number;
  matchWay_name: string;
  matchId: null;
  matchName: null;
  factor: string;
  factorUnit: string;
  institution: string;
  year: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  remark: string;
  /** 排放源描述，上限200字，独立于备注。 */
  emissionSourceDescription?: string;
  delFlag: number;
  matchObject: MatchObject;
  factorObj: SerachCarbonFactorResult;
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

interface MatchObject {
  id: number;
  name: string;
  unit: string;
  factor: string;
}

interface TypeExtra {
  way: number;
  amount?: number;
  distance?: number;
  unitCode?: string;
  unitName: string;
  distUnitCode?: string;
  distUnitName?: string;
}
