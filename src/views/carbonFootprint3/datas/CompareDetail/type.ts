// 账户信息类型
type AccountInfo = {
  id: number; // 目标产品id
  companyId: number;
  type: number; // 核算类型 0快速，1过程
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  specification: null;
  productPic: string;
  startTime: string; // 核算周期-开始时间
  endTime: string; // 核算周期-结束时间
  amount: string;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: null | number;
  scope: number;
  scopeValue: string;
  stageObjs: null;
  purpose: null;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: string;
  status: number;
  aiStatus: number;
  inStatus: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null;
  updateTime: string;
  delFlag: number;
  productIds: null;
  accountStatusList: null;
  files: null;
  productNameLike: null;
  emissionTotalTmp: null;
  excludeIds: null;
  companyName: null;
  companyNum: null;
  demo: number;
};

// 基准产品账户信息类型
type AccountCompareInfo = {
  id: number; // 基准产品核算id
  companyId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  specification: null;
  productPic: string;
  startTime: string; // 基准产品核算周期-开始时间
  endTime: string; // 核算周期-结束时间
  amount: string;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: number;
  scope: number;
  scopeValue: string;
  stageObjs: null;
  purpose: null;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: string;
  status: number;
  aiStatus: number;
  inStatus: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null;
  updateTime: string;
  delFlag: number;
  productIds: null;
  accountStatusList: null;
  files: null;
  productNameLike: null;
  emissionTotalTmp: null;
  excludeIds: null;
  companyName: null;
  companyNum: null;
  demo: number;
};

// 排放概览数据类型
type CardData = {
  emissionTotal: string; // 总排放量
  stage: string; // 最大排放环节
  stageEmissions: string; // 环节排放量
  type: string; // 最大排放类型
  typeEmissions: string; // 类型排放量
  emission: string; // 最大排放源
  emissions: string; // 排放源排放量
  diffRate: null;
  diffTrend: null;
};

// 基准产品排放概览数据类型
type CardCompareData = {
  emissionTotal: string; // 基准产品总排放量
  stage: string; // 基准产品最大排放环节
  stageEmissions: string; // 基准产品环节排放量
  type: string; // 最大排放类型
  typeEmissions: string; // 类型排放量
  emission: string; // 最大排放源
  emissions: string; // 排放源排放量
  diffRate: null;
  diffTrend: null;
};

// 排放周期数据项类型
type ByStageItem = {
  code: number; // 标识
  name: string; // 周期名称
  total: number; // 汇总排放量
  rate: number; // 比例
  emissionList: null;
  totalTrans: number; // 运输排放量
  rateTrans: number; // 运输比例
  nameCompare: string; // 基准产品周期名称
  totalCompare: number;
  rateCompare: number;
  emissionListCompare: null;
  totalTransComapare: number;
  rateTransCompare: number;
  reduction: string;
  reductionRate: string;
};

// 排放源类型数据项类型
export type ByTypeItem = {
  code: number;
  name: string;
  total: number;
  rate: number;
  emissionList: null;
  totalTrans: number;
  rateTrans: number;
  nameCompare: string;
  totalCompare: number;
  rateCompare: number;
  emissionListCompare: null;
  totalTransComapare: number;
  rateTransCompare: number;
  reduction: string;
  reductionRate: string;
};

// 排放源清单项类型
export type TopEmissionItem = {
  code: number; // 标识
  name: string; // 名称
  total: number; // 汇总
  rate: number; // 比例
  emissionList: null;
  totalTrans: null | number; // 运输排放量
  rateTrans: null | number; // 运输比例
};

// 基准产品排放源清单项类型
type TopEmissionsCompareItem = {
  code: number;
  name: string;
  total: number;
  rate: number;
  emissionList: null;
  totalTrans: null;
  rateTrans: null;
};

// 详细数据类型
type DetailData = {
  account: AccountInfo; // 账户
  accountCompare: AccountCompareInfo;
  card: CardData; // 排放概览数据
  cardCompare: CardCompareData; // 基准产品排放概览数据
  byStages: ByStageItem[]; // 排放周期数据
  byTypes: ByTypeItem[]; // 排放源类型数据
  topEmissions: TopEmissionItem[]; // 排放源清单
  topEmissionsCompare: TopEmissionsCompareItem[]; // 基准产品排放源清单
  totalReduction: string; // 总减排量
  totalReductionRate: string; // 总减排比例
};

// 整体返回数据类型
export type ResponseDataType = {
  detail: DetailData;
};
