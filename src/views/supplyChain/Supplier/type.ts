export type SupplierProductFilterOptions = {
  id: number | string;
  name: string;
  specification: string;
}[];

export type ProductEmissionCompareProduct = {
  purchaseGoodsId: number;
  purchaseGoodsName: string;
  specification?: string | null;
  computationUnit?: string | null;
  taskCount?: number;
};

export type ProductEmissionCompareStage = {
  key: string;
  name: string;
  defaultShow?: boolean | null;
  emission?: number | string | null;
};

export type ProductEmissionCompareRecord = {
  supplierDataId: number;
  supplierId: number;
  supplierName?: string | null;
  purchaseGoodsId: number;
  purchaseGoodsName?: string | null;
  fillName?: string | null;
  fillType?: number | null;
  fillTypeDesc?: string | null;
  dataType?: number | null;
  dataTypeDesc?: string | null;
  reqDataType?: number | null;
  reqDataTypeDesc?: string | null;
  fillDeadline?: string | null;
  accountingStartTime?: string | null;
  accountingEndTime?: string | null;
  compareTime?: string | null;
  compareTimeType?: string | null;
  compareTimeTypeDesc?: string | null;
  emission?: number | string | null;
  stages?: ProductEmissionCompareStage[];
};

export type ProductEmissionCompareResult = {
  supplierId: number;
  supplierName?: string | null;
  purchaseGoodsId: number;
  purchaseGoodsName?: string | null;
  unit?: string | null;
  stages?: ProductEmissionCompareStage[];
  records?: ProductEmissionCompareRecord[];
};

export enum SupplierProductEmissionOverviewType {
  QUICK = 0,
  PROCESS = 1,
  MANUAL = 2,
}

export type SupplierProductEmissionOverviewAccount = {
  id: number;
  supplierDataId: number;
  supplierId?: number;
  supplierName?: string | null;
  purchaseGoodsId?: number | null;
  productCode?: string | null;
  productName?: string | null;
  purchaseGoodsName?: string | null;
  type: SupplierProductEmissionOverviewType;
  typeDesc?: string | null;
  fillType?: number | null;
  reqDataType?: number | null;
  accountName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  amount?: number | string | null;
  unitName?: string | null;
  scope?: number | null;
  scopeValue?: string | null;
  emissionTotal?: string | null;
};

export type SupplierProductEmissionOverviewAccountName = {
  accountName: string;
  accountList: SupplierProductEmissionOverviewAccount[];
};

export type SupplierProductEmissionOverviewSummary = {
  code: number;
  name: string;
  total: string;
  rate?: number | string | null;
};

export type SupplierProductEmissionOverviewCard = {
  emissionTotal?: string | null;
  stage?: string | null;
  stageEmissions?: string | null;
  type?: string | null;
  typeEmissions?: string | null;
  emission?: string | null;
  emissions?: string | null;
};

export type SupplierProductEmissionOverviewChart = {
  emissionTotal: string;
  byTypes: SupplierProductEmissionOverviewSummary[];
};

export type SupplierProductEmissionOverviewEmissionRow = {
  id?: number | null;
  stage?: string | null;
  name?: string | null;
  type?: string | null;
  amount?: string | null;
  unitName?: string | null;
  amountUnit?: string | null;
  emissionTotal?: string | null;
  emissionData?: string | null;
  percentage?: string | null;
  factor?: string | null;
  factorUnit?: string | null;
  factorUnitName?: string | null;
  rate?: number | string | null;
};

export type SupplierProductEmissionOverviewSankeyNode = {
  name: string;
  code?: number;
  total: string;
  rate?: number | string | null;
  emissionId?: number | null;
  typeList?: SupplierProductEmissionOverviewSankeyNode[];
  emissionList?: SupplierProductEmissionOverviewSankeyNode[];
  sankeyTarget?: string | null;
};

export type SupplierProductEmissionOverviewSankey = {
  stageList: SupplierProductEmissionOverviewSankeyNode[];
  emissionTotal: string;
};

export type SupplierProductEmissionOverviewDetail = {
  account?: SupplierProductEmissionOverviewAccount;
  card?: SupplierProductEmissionOverviewCard;
  byStages?: SupplierProductEmissionOverviewSummary[];
  chart?: SupplierProductEmissionOverviewChart;
  topEmissions?: SupplierProductEmissionOverviewSummary[];
  emissionList?: SupplierProductEmissionOverviewEmissionRow[];
  sankey?: SupplierProductEmissionOverviewSankey | null;
};

export type SupplierEnterpriseEmissionYearOption = {
  year: string;
  supplierDataId?: number | null;
  fillType?: number | null;
  fillTypeDesc?: string | null;
  manual?: boolean;
  standardLocked?: boolean;
  standards?: number[];
};

export type SupplierEnterpriseEmissionOverviewOptions = {
  years?: SupplierEnterpriseEmissionYearOption[];
  defaultYear?: string | null;
  defaultStandard?: number | null;
};

export type SupplierEnterpriseEmissionManageRecord = {
  supplierDataId: number;
  year?: string | null;
  fillName?: string | null;
  fillType?: number | null;
  fillTypeDesc?: string | null;
  fillSource?: string | null;
  reqDataType?: number | null;
  reqDataTypeDesc?: string | null;
  manual?: boolean;
  updateTime?: string | null;
  updateBy?: string | null;
};

export type SupplierEnterpriseEmissionManageYearGroup = {
  year: string;
  selectedSupplierDataId?: number | null;
  records?: SupplierEnterpriseEmissionManageRecord[];
};

export type SupplierEnterpriseEmissionVisibility = {
  aiAdvice?: boolean;
  intensityTrend?: boolean;
  topTypes?: boolean;
  topEmissions?: boolean;
  childOrg?: boolean;
  sankey?: boolean;
};

export type SupplierEnterpriseEmissionMetric = {
  total?: string | null;
  base?: string | null;
  compare?: string | null;
};

export type SupplierEnterpriseEmissionTrend = {
  year: string;
  total?: string | null;
  scopeOne?: string | number | null;
  scopeTwo?: string | number | null;
  scopeThree?: string | number | null;
};

export type SupplierEnterpriseEmissionIndustry = {
  isShowIndustryData?: string;
  minIndustryData?: string | number;
  maxIndustryData?: string | number;
  avgIndustryData?: string | number;
  medianIndustryData?: string | number;
  ratingCompany?: string;
  ratingPercent?: string | number;
  avgIndustryPercent?: string | number;
  medianIndustryPercent?: string | number;
  emissionCompany?: string | number;
};

export type SupplierEnterpriseEmissionIndicator = {
  indicatorName?: string | null;
  foreignId?: string | number | null;
  unitValue?: string | null;
};

export type SupplierEnterpriseEmissionOverviewDetail = {
  account?: SupplierEnterpriseEmissionManageRecord | null;
  year?: string | null;
  standard?: number | null;
  standardLocked?: boolean;
  manual?: boolean;
  visibility?: SupplierEnterpriseEmissionVisibility;
  emissionMetric?: SupplierEnterpriseEmissionMetric;
  intensityMetric?: SupplierEnterpriseEmissionMetric;
  byScopes?: SupplierProductEmissionOverviewSummary[];
  byTypes?: SupplierProductEmissionOverviewSummary[];
  trend?: SupplierEnterpriseEmissionTrend[];
  topEmissions?: SupplierProductEmissionOverviewSummary[];
  childOrgs?: SupplierProductEmissionOverviewSummary[];
  sankey?: SupplierProductEmissionOverviewSankey | null;
  industry?: SupplierEnterpriseEmissionIndustry | null;
  indicatorList?: SupplierEnterpriseEmissionIndicator[];
};
