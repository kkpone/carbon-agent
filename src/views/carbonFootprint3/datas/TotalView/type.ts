import { DatasFiltrateListData } from '../type';

/**
 * @description: 功能单位的下拉列表接口返回
 */
export type AccountNameListData = {
  id: number;
  accountName: string;
  accountList: DatasFiltrateListData[];
};

/**
 * @description: 功能单位的下拉列表接口返回
 */
export type AccountNameListApi = AccountNameListData[];

export type AccountMaxCardTotal = {
  /** 排放量 */
  emissionTotal: string;

  /** 最大排放环节 */
  stage: string;
  /** 环节排放量 */
  stageEmissions: string;

  /** 最大排放类型 */
  type: string;
  /** 类型排放量 */
  typeEmissions: string;

  /** 最大排放源 */
  emission: string;
  /** 排放源排放量 */
  emissions: string;
};

/** 排放量分布对比 - 生命周期列表比例数据 */
export type EmissionTotalComparisonData = {
  /** 标识 */
  code: number;
  /** 名称 */
  name: string;
  /** 总量 */
  total: string;
  /** 比例 */
  rate: number;
};

/** 排放量分布对比 - 生命周期列表比例数据 - 每个视图数据 */
export type EmissionTotalComparisonChartData = {
  /** 排放总量 */
  emissionTotal: string;
  byTypes: EmissionTotalComparisonChartList[];
};
type EmissionTotalComparisonChartList = {
  code: number;
  name: string;
  total: string;
  rate: number;
};

/** 排放量TOP10排名 */
export type EmissionTotalRankingChartData = {
  code: number;
  name: string;
  total: string;
  rate: number;
};

/** 排放量表格数据列表 */
export type EmissionTotalListData = {
  id: null;
  stage: string;
  name: string;
  type: string;
  amount: string;
  unitName: string;
  amountUnit: string;
  emissionTotal: string;
  emissionData: string;
  percentage: string;
  factor: string;
  factorUnit: string;
  factorUnitName: string;
  rate: number;
};

/** 桑葚图 */
export type SankeyChartData = {
  stageList: SankeyChartList[];
  emissionTotal: string;
};

export type SankeyChartList = {
  name: string;
  code?: number;
  total: string;
  rate: number;
  emissionId: number;
  typeList: SankeyChartList[];
  emissionList: SankeyChartList[];
  sankeyTarget: string;
};

/** 绿色供应商 */
export interface PageReturn<T> {
  list: T[];
  total: number;
}

export interface GreenSupplierListParams {
  /**
   * 减排类别
   */
  category?: number;
  /**
   * 分类
   */
  likeClassify?: string;
  /**
   * 企业名称
   */
  likeEnterpriseName?: string;
  /**
   * 页码
   */
  pageNum?: number;
  /**
   * 每页条数
   */
  pageSize?: number;
  /**
   * 是否展示
   */
  onShow?: string;
}
export interface GreenSupplierInfo {
  /**
   * 适用场景
   */
  applyScene?: string;
  /**
   * 减排属性描述
   */
  attributeDesc?: number;
  /**
   * 分类
   */
  classify?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 服务客户
   */
  customer?: string;

  /**
   * 企业明称
   */
  enterpriseName?: string;
  /**
   * 减排商品类别
   */
  goodsClassify?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 减排类别
   */
  reductionCategory?: number;
  /**
   * 是否在官网展示
   */
  show?: boolean;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
}
