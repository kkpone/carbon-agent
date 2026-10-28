import { request } from '@api/request';

import { ArticleData, AuthData, EProductType, IdentityData } from './type';

type ProductData = {
  id: number; // 文章 id
  createBy: null;
  updateBy: null;
  createTime: null;
  updateTime: null;
  productName: string;
  productInfo: string;
  status: '0';
  productMsg: null;
  priority: number;
  delFlag: 0;
  manualUrl: string;
  manualUrlEn: string | null;
};

export function getProductManualData() {
  return request<{ data: ProductData[] }>({
    method: 'GET',
    url: `/management/product/getProductManualData`,
  });
}

export function getContentArticle() {
  return request<{ data: ArticleData[] }>({
    method: 'GET',
    url: `/management/websiteArticle/contentArticle`,
  });
}

export function getCarbonAuthData() {
  return request<{ data: AuthData[] }>({
    method: 'GET',
    url: `/management/product/getCarbonAuthData`,
  });
}

type OrgCategoryData = {
  category: '范围一' | '范围二' | '范围三';
  emissionQuantity: string;
  emissionIntensity: null | any;
};

// 用于表示每个组织的排放相关数据的类型
type OrgEmissionData = {
  orgId: number;
  orgName: string;
  emissionQuantity: string;
  categoryData: OrgCategoryData[];
};

export type EmissionData = {
  // 同比去年百分比
  totalEmissionRatio: string;
  // 范围一排放量
  scopeOne: string;
  // 企业总排放量
  totalEmission: string;
  // 范围二排放量
  scopeTwo: string;
  // 待填报核算总数
  preAccountingCounts: number;
  // 核算填报进度
  accountPercent: string;
  // 年份列表
  yearList: string[];
  // 未开始总数
  unAccountCounts: number;
  // 范围三排放量
  scopeThree: string;
  // 核算主体数
  orgCounts: number;
  // 核填报中数
  accountingCounts: number;
  // 范围二占比
  twoRatio: number;
  // 范围三占比
  threeRatio: number;
  // 核算总数
  sumAccounts: number;
  // 已完成核算数
  finishCounts: number;
  // 0 无法比较/1 上升/2 下降/3 相等
  totalEmissionRatioStatus: number;
  // 范围一占比
  oneRatio: number;
  orgComparisonData: OrgEmissionData[];
  timeType?: string;
};

// 用于表示排放量按类型细分的数据结构
type EmissionByType = {
  code: number;
  name: string;
  total: number;
  rate: number;
  emissionList: null | any[];
  totalTrans: null | number;
  rateTrans: null | number;
};

// 表示charType对象的类型
type CharType = {
  emissionTotal: string;
  byTypes: EmissionByType[];
};

// 用于表示核算账户相关信息的类型
type Account = {
  id: number;
  companyId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  startTime: string;
  endTime: string;
  amount: string;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: number | null;
  scope: number;
  scopeValue: string;
  purpose: null | any;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null | string;
  updateTime: string;
  delFlag: number;
  productIds: null | any[];
  files: null | any[];
  demo: null | any;
};

// 用于表示某个阶段的排放相关信息的类型（在chartStage等结构中使用）
type StageEmission = {
  code: number;
  name: string;
  total: number;
  rate: number;
  emissionList: null | any[];
  totalTrans: null | number;
  rateTrans: null | number;
};

// 用于表示排放桑基图（Sankey）中类型列表里进一步细分的排放相关信息的类型
type EmissionDetail = {
  name: string;
  code: null | number;
  total: number;
  rate: number;
  emissionId: null | number;
  typeList: null | any[];
  emissionList: null | EmissionDetail[];
  sankeyTarget: string;
};

// 用于表示排放桑基图（Sankey）中类型列表的类型
type TypeListInSankey = {
  name: string;
  code: number;
  total: number;
  rate: number;
  emissionId: null | number;
  typeList: null | any[];
  emissionList: EmissionDetail[];
  sankeyTarget: string;
};

// 用于表示排放桑基图（Sankey）中阶段列表的类型
type StageListInSankey = {
  name: string;
  code: number;
  total: string;
  rate: number;
  emissionId: null | number;
  typeList: TypeListInSankey[];
  emissionList: null | any[];
  sankeyTarget: string;
};

// 用于表示排放桑基图（Sankey）整体信息的类型
type EmissionSankey = {
  stageList: StageListInSankey[];
  emissionTotal: string;
};

// 整个返回数据data对象的类型定义
export type TProductData = {
  charType: CharType;
  accountCounts: number;
  accountCard: {
    emissionTotal: string;
    stage: string;
    stageEmissions: string;
    type: string;
    typeEmissions: string;
    emission: string;
    emissions: string;
    diffRate: null | any;
    diffTrend: null | any;
  };
  chartStage: StageEmission[];
  accountList: Account[];
  labelCounts: number;
  emissionSankey: EmissionSankey;
  authCounts: number;
};

export function getWorkbenchDetail(params: { productType?: EProductType }) {
  return request<{ data: EmissionData | TProductData }>({
    method: 'GET',
    url: `/management/product/getWorkbenchDetail`,
    params,
  });
}

export function getWorkbenchDetailByYear(params: { year: string }) {
  return request<{ data: EmissionData }>({
    method: 'GET',
    url: `/management/product/getWorkbenchEnterpriseAccount`,
    params,
  });
}

export function getWorkbenchEnterpriseOrgComparisonByYear(params: {
  year: string;
}) {
  return request<{ data: EmissionData }>({
    method: 'GET',
    url: `/management/product/getWorkbenchEnterpriseOrgComparison`,
    params,
  });
}

export function getWorkbenchAccountByAccountId(params: { accountId: number }) {
  return request<{ data: TProductData }>({
    method: 'GET',
    url: `/management/product/getWorkbenchAccount`,
    params,
  });
}

export function getUserIdentity() {
  return request<{ data: IdentityData }>({
    method: 'GET',
    url: `/management/product/getUserIdentity`,
  });
}
