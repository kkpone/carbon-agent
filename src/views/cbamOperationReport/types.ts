export type OperationReportStatus = 0 | 1;
export type DataGapStatus = 0 | 1 | 2;
export type JsonObject = Record<string, unknown>;

export interface FileObj {
  name?: string;
  size?: string;
  unit?: string;
  url?: string;
  uploadTime?: string;
}

export interface OperationOption {
  id: number;
  name: string;
  orgId?: number;
  factoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface OperationOverview {
  totalCount: number;
  completedCount: number;
  fillingCount: number;
}

export interface OperationReportQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  factoryId?: number;
  planId?: number;
  status?: OperationReportStatus;
}

export interface OperationReportListItem {
  operationId: number | string;
  dataVersion: number;
  reportName?: string;
  startDate?: string;
  endDate?: string;
  factoryId: number;
  factoryName?: string;
  planId: number;
  planName?: string;
  planVersionNo?: string;
  status: OperationReportStatus;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  updateByName?: string;
  updateTime?: string;
}

export interface OperationReportPage {
  pageNum: number;
  pageSize: number;
  total: number;
  records: OperationReportListItem[];
}

export interface PendingItem {
  index: number;
  sectionCode: string;
  name: string;
  /** 中文名称。 */
  nameZh: string;
  /** 英文名称。 */
  nameEn: string;
}

export interface OperationCompletion {
  completedCount: number;
  totalCount: number;
  completionRate: number;
  pendingGroups?: string[];
  groupStats?: OperationCompletionGroup[];
  pendingItems: PendingItem[];
}

export interface OperationCompletionGroup {
  sectionCode: string;
  completed: boolean;
  requiredCount: number;
  filledRequiredCount: number;
  missingFields: string[];
  blockingMissingFields: string[];
}

export interface OperationRouteItem {
  itemKey: string;
  sourceItemKey?: string;
  routeName?: string;
  productionQuantity?: string;
  unit?: string;
  sortNo?: number;
}

export interface OperationProcessItem {
  itemKey: string;
  sourceItemKey?: string;
  accountingProcessId?: number;
  processName?: string;
  description?: string;
  productItemKeys?: string[];
  precursorItemKeys?: string[];
  sourceRouteNames?: string[];
  routeChangeDesc?: string;
  routes: OperationRouteItem[];
  sortNo?: number;
}

export interface OperationAccountingProcess {
  id?: number;
  processName?: string;
  productionRoute?: string;
  processProductType?: string;
  productCategoryId?: number;
  totalVolume?: string;
  salesVolume?: string;
  nonCbamConsumption?: string;
  unit?: string;
  unitName?: string;
  nonDirect?: string;
  nonIndirect?: string;
  outPower?: string;
  inputPower?: string;
  directEmission?: string;
  indirectEmission?: string;
  totalEmission?: string;
}

export interface OperationProcessJson {
  processes: OperationProcessItem[];
  productProcesses: OperationAccountingProcess[];
  processRelations: OperationAccountingProcessRelation[];
  reportProcessDescription?: string;
  reportBoundaryDescription?: string;
  reportBoundaryFiles: FileObj[];
}

/** 核算任务工序关系的运营报告副本。 */
export interface OperationAccountingProcessRelation {
  relationId?: number;
  productProcessId?: number;
  isDefault?: number;
  isProcess?: number;
  emission?: string;
}

export interface OperationProcessConsumption {
  itemKey?: string;
  targetProcessItemKey?: string;
  targetProcessName?: string;
  quantity?: string;
}

export interface OperationProductReportItem {
  itemKey?: string;
  processItemKey?: string;
  productItemKey?: string;
  externalSalesQuantity?: string;
  processConsumptions?: OperationProcessConsumption[];
  monitorStartDate?: string;
  monitorEndDate?: string;
  unit?: string;
}

export interface OperationCbamProductJson {
  saleProducts: OperationAccountingProduct[];
  productResults: OperationAccountingResult[];
  reportItems: OperationProductReportItem[];
  hiddenProductKeys: string[];
}

/** 核算任务外售产品的运营报告计算副本。 */
export interface OperationAccountingProduct {
  id?: number;
  processId?: number;
  processName?: string;
  cnCode?: string;
  cnName?: string;
  cbamName?: string;
  productName?: string;
  unit?: string;
  unitName?: string;
  reducing?: string;
  steelCode?: string;
  mnPer?: string;
  crPer?: string;
  niPer?: string;
  alloyPer?: string;
  cPer?: string;
  materialPer?: string;
  steelScrap?: string;
  wasteMaterial?: string;
  alUse?: string;
  nonAl?: string;
  clinker?: string;
  calcine?: string;
  solution?: string;
  nitric?: string;
  urea?: string;
  nitrogen?: string;
  ammonium?: string;
  noPer?: string;
  urPer?: string;
  organic?: string;
  emission?: string;
  outPower?: string;
  inputPower?: string;
  inputAll?: string;
  defaultPer?: string;
  updateVersion?: number;
  calVersion?: string;
}

/** 核算任务结果汇总的运营报告副本。 */
export interface OperationAccountingResult {
  id?: number;
  generalInformation?: string;
  defaultReason?: string;
  qualityAssurance?: string;
  carbonPrice?: string;
  supplement?: string;
  unit?: string;
  productCategoryName?: string;
}

/** 按生产路线记录的一条外购前体数量。 */
export interface OperationPrecursorRouteQuantity {
  itemKey?: string;
  routeName?: string;
  quantity?: string;
}

/** 运营报告中的一条外购前体填报记录。 */
export interface OperationPrecursorReportItem {
  itemKey?: string;
  processItemKey?: string;
  precursorItemKey?: string;
  accountingPrecursorId?: number;
  precursorName?: string;
  cnCode?: string;
  emissionBasis?: string;
  supplierName?: string;
  routeQuantities: OperationPrecursorRouteQuantity[];
  processConsumptions: OperationProcessConsumption[];
  embeddedEmission?: string;
  directEmission?: string;
  indirectEmission?: string;
  defaultCnId?: number;
  monitorStartDate?: string;
  monitorEndDate?: string;
  unit?: string;
}

/** 核算任务前体的运营报告计算副本。 */
export interface OperationAccountingPrecursor {
  id?: number;
  precursorItemKey?: string;
  preName?: string;
  productCategoryId?: number;
  productCategoryName?: string;
  countryCode?: string;
  countryName?: string;
  purchaseVolume?: string;
  productRoute?: string;
  productRouteNames?: string;
  unit?: string;
  linkId?: number;
  supplierName?: string;
  isDefault?: number;
  defaultReason?: number;
  outPower?: string;
  inputPower?: string;
}

export interface OperationPrecursorJson {
  productPrecursors: OperationAccountingPrecursor[];
  reportItems: OperationPrecursorReportItem[];
}

/** 一条直接排放填报或核算源流副本。 */
export interface OperationDirectEmissionItem {
  itemKey?: string;
  /** 报告实例关联的 operation_evidence.id，不是 monitor_evidence.id。 */
  evidenceIds?: number[];
  sourceItemKey?: string;
  processItemKey?: string;
  id?: number;
  productProcessId?: number;
  sourceName?: string;
  sourceType?: string;
  monitorSourceType?: string;
  greenhouseGasType?: string;
  processMethod?: string;
  monitorMethod?: string;
  pfcMethod?: string;
  dataSource?: string;
  applicableStartDate?: string;
  applicableEndDate?: string;
  activityData?: string;
  activityUnit?: string;
  lowHeat?: string;
  lowHeatUnit?: string;
  emissionCoefficient?: string;
  emissionCoefficientUnit?: string;
  conversionRate?: string;
  oxRate?: string;
  carbon?: string;
  carbonUnit?: string;
  conversionRateUnit?: string;
  biomassContent?: string;
  biomassContentUnit?: string;
  carbonFossil?: string;
  carbonBiological?: string;
  energyFossil?: string;
}

/** 核算任务工序归因排放副本。 */
export interface OperationAttributionItem {
  id?: number;
  isProcess?: number;
  productProcessId?: number;
  emissionElement?: string;
  isExists?: string;
  inputPower?: string;
  inputFactor?: string;
  outPower?: string;
  outFactor?: string;
  emissionSource?: string;
  eleSource?: string;
  eleChoose?: number;
  cnCode?: string;
  defaultCnId?: number;
}

/** 运营报告计算生成的一条投入产出关系。 */
export interface OperationInputOutputItem {
  processId?: number;
  relationId?: number;
  direct?: string;
  indirect?: string;
  isProcess?: number;
  relationPer?: string;
}

export interface OperationDirectEmissionJson {
  items: OperationDirectEmissionItem[];
  sourceFlows: OperationDirectEmissionItem[];
  productAttributions: OperationAttributionItem[];
  inputOutputs: OperationInputOutputItem[];
  calculation?: { ruleVersion?: string; calculated?: boolean };
}

/** 一条非CBAM产物填报记录。 */
export interface OperationNonCbamProductItem {
  itemKey?: string;
  sourceItemKey?: string;
  processItemKey?: string;
  goodsName?: string;
  plannedAllocationMethod?: string;
  plannedAllocationRate?: string;
  productionQuantity?: string;
  allocationMethod?: string;
  allocationRate?: string;
}

export interface OperationNonCbamProductJson {
  items: OperationNonCbamProductItem[];
}

/** 一条工序电力消耗填报或核算副本。 */
export interface OperationElectricityItem {
  itemKey?: string;
  evidenceIds?: number[];
  sourceItemKey?: string;
  processItemKey?: string;
  id?: number;
  productProcessId?: number;
  electricitySource?: string;
  useStartDate?: string;
  useEndDate?: string;
  electricityConsumption?: string;
  emissionFactor?: string;
  powerFacility?: string;
}

export interface OperationElectricityJson {
  eleCalculators: OperationElectricityItem[];
  items: OperationElectricityItem[];
}

/** 一条运营报告热流填报记录。 */
export interface OperationHeatFlowItem {
  itemKey?: string;
  evidenceIds?: number[];
  sourceItemKey?: string;
  processItemKey?: string;
  id?: number;
  productProcessId?: number;
  medium?: string;
  direction?: string;
  counterpartyFacility?: string;
  allocationMethod?: string;
  meteringPoint?: string;
  heatAmount?: string;
  emissionFactor?: string;
}

/** 核算任务热电联产计算副本。 */
export interface OperationAccountingHeatItem {
  id?: number;
  productProcessId?: number;
  fuelOut?: string;
  fuelIn?: string;
  hotOut?: string;
  hotPer?: string;
  eleOut?: string;
  smokeOut?: string;
  elePer?: string;
  inputFactor?: string;
  outPower?: string;
  outFactor?: string;
}

export interface OperationHeatFlowJson {
  sourcePresent?: boolean;
  applicable?: boolean;
  notApplicableReason?: string;
  itemKey?: string;
  sourceItemKey?: string;
  evidenceIds?: number[];
  hotEle: OperationAccountingHeatItem[];
  items: OperationHeatFlowItem[];
}

/** 一条运营报告废气填报记录。 */
export interface OperationWasteGasItem {
  itemKey?: string;
  evidenceIds?: number[];
  sourceItemKey?: string;
  processItemKey?: string;
  wasteGasType?: string;
  method?: string;
  counterpartyFacility?: string;
  monitoringAllocationMethod?: string;
  meteringPoint?: string;
  wasteGasAmount?: string;
  emissionFactor?: string;
}

export interface OperationWasteGasJson {
  sourcePresent?: boolean;
  applicable?: boolean;
  notApplicableReason?: string;
  itemKey?: string;
  sourceItemKey?: string;
  evidenceIds?: number[];
  items: OperationWasteGasItem[];
}

/** 一条CBAM产物行业参数；行业参数不参与17项完整度。 */
export interface OperationIndustryParameterItem {
  itemKey?: string;
  productItemKey?: string;
  productName?: string;
  cnCode?: string;
  productType?: string;
  functionalUnit?: string;
  productCategoryId?: number;
  reducing?: string;
  steelCode?: string;
  mnPer?: string;
  crPer?: string;
  niPer?: string;
  alloyPer?: string;
  cPer?: string;
  materialPer?: string;
  steelScrap?: string;
  wasteMaterial?: string;
  alUse?: string;
  nonAl?: string;
  clinker?: string;
  calcine?: string;
  solution?: string;
  nitric?: string;
  urea?: string;
  nitrogen?: string;
  ammonium?: string;
  noPer?: string;
  urPer?: string;
  organic?: string;
}

export interface OperationIndustryParameterJson {
  items: OperationIndustryParameterItem[];
}

/** 核算任务外售产品的动态行业参数字段配置。 */
export interface OperationIndustryFieldConfig {
  /** 字段中文名称。 */
  defaultName?: string;
  /** 字段英文名称。 */
  defaultNameEn?: string;
  /** 是否必填：0必填，1非必填。 */
  isRequired?: number;
  /** 是否展示：0展示，1不展示。 */
  isShow?: number;
  /** 对应外售产品及运营报告行业参数的属性名。 */
  link?: string;
  /** 所属产品分类ID。 */
  productCategoryId?: number;
}

/** CN编码所属产品分类查询结果。 */
export interface OperationDefaultCnCategory {
  id?: number;
  productCategoryId?: number;
  defaultCode?: string;
}

export interface OperationZeroRatedFuelJson {
  sourcePresent?: boolean;
  itemKey?: string;
  sourceItemKey?: string;
  evidenceIds?: number[];
  applicable?: boolean;
  description?: string;
  notApplicableReason?: string;
  consumption?: string;
  biomassRatio?: string;
  zeroEmissionRatio?: string;
  verificationStartDate?: string;
  verificationEndDate?: string;
}

export interface OperationFacilityElectricityJson {
  sourcePresent?: boolean;
  itemKey?: string;
  sourceItemKey?: string;
  evidenceIds?: number[];
  applicable?: boolean;
  notApplicableReason?: string;
  generators: OperationGeneratorItem[];
}

/** 一条内部发电实际数据。 */
export interface OperationGeneratorItem {
  itemKey?: string;
  evidenceIds?: number[];
  sourceItemKey?: string;
  generationMode?: string;
  energyProperty?: string;
  includedInOutputBoundary?: boolean;
  meteringAllocationMethod?: string;
  generationAmount?: string;
  outputAmount?: string;
  emissionFactor?: string;
  nonCbamAmount?: string;
}

export interface OperationCo2StageJson {
  sourcePresent?: boolean;
  itemKey?: string;
  sourceItemKey?: string;
  evidenceIds?: number[];
  applicable?: boolean;
  notApplicableReason?: string;
  projects: OperationCo2ProjectItem[];
}

/** 一条CO2捕集、转移、使用或封存项目。 */
export interface OperationCo2ProjectItem {
  itemKey?: string;
  projectName?: string;
  receivedAmount?: string;
  outputAmount?: string;
  sourceDestination?: string;
  purpose?: string;
  responsiblePerson?: string;
  contactInfo?: string;
  claimedDeductionAmount?: string;
  sortNo?: number;
}

export interface ProcessData {
  processJson?: OperationProcessJson;
  cbamProductJson?: OperationCbamProductJson;
  precursorJson?: OperationPrecursorJson;
  directEmissionJson?: OperationDirectEmissionJson;
  nonCbamProductJson?: OperationNonCbamProductJson;
  electricityJson?: OperationElectricityJson;
  heatFlowJson?: OperationHeatFlowJson;
  wasteGasJson?: OperationWasteGasJson;
  schemaVersion?: number;
}

export interface ConditionData {
  industryParameterJson?: OperationIndustryParameterJson;
  zeroRatedFuelJson?: OperationZeroRatedFuelJson;
  facilityElectricityJson?: OperationFacilityElectricityJson;
  co2StageJson?: OperationCo2StageJson;
  schemaVersion?: number;
}

export interface QualityData {
  compileDate?: string;
  reviewDate?: string;
  compilerName?: string;
  reviewerName?: string;
  methodChangeDesc?: string;
  confidentialDesc?: string;
  noDataGap?: boolean;
}

export interface DataGapData {
  id?: number;
  itemKey: string;
  parameterName: string;
  processItemKey: string;
  gapStartDate: string;
  gapEndDate: string;
  missingAmount: string;
  status: DataGapStatus;
  reason: string;
  substituteSource: string;
  estimationMethod: string;
  estimationResult: string;
  impactAssessment: string;
  correctiveAction: string;
}

export interface EvidenceRelationData {
  id?: number;
  evidenceId: number;
  partCode: string;
  itemKey: string;
}

export interface OperationReportPayload {
  operationId?: number | string;
  dataVersion?: number;
  planId: number;
  accountId?: number;
  reportName?: string;
  startDate?: string;
  endDate?: string;
  versionNo?: string;
  submitTarget?: string;
  deviateDesc?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  detailedAddress?: string;
  postalCode?: string;
  postBox?: string;
  regionCodes?: string[];
  processData?: ProcessData;
  condition?: ConditionData;
  quality?: QualityData;
  dataGaps?: DataGapData[];
  evidenceRelations?: EvidenceRelationData[];
}

export interface OperationReportSaveResult {
  operationId: number | string;
  dataVersion: number;
  status: OperationReportStatus;
  completion: OperationCompletion;
  recalculated: boolean;
}

export interface OperationReportDetail extends OperationReportPayload {
  operationId: number | string;
  dataVersion: number;
  factoryId: number;
  orgId: number;
  status: OperationReportStatus;
  completion: OperationCompletion;
  reports?: FileObj[];
  reportDataVersion?: number;
  /** 运营报告凭证副本；各业务实例通过 evidenceIds 引用这些凭证的 id。 */
  evidences?: OperationEvidenceEntity[];
  monitorPlan?: JsonObject;
  accountingTask?: JsonObject;
}

/** info 接口返回的运营报告凭证表实体。 */
export interface OperationEvidenceEntity {
  id: number;
  operationId: number | string;
  sourceType: 1 | 2;
  sourceId?: number;
  evidenceType: string;
  reviewFrequency?: string;
  sourceName?: string;
  evidenceNo?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  file?: FileObj;
}

export interface EvidenceRelationItem {
  relationId: number;
  partCode: string;
  itemKey: string;
}

export interface OperationEvidence {
  evidenceId: number;
  sourceType: 1 | 2;
  sourceId?: number;
  evidenceType: string;
  reviewFrequency?: string;
  sourceName?: string;
  evidenceNo?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  file?: FileObj;
  fileStatus?: string;
  relatedToCurrentItem?: boolean;
  relations?: EvidenceRelationItem[];
}

export interface MonitorEvidenceCandidate {
  sourceEvidenceId: number;
  copiedEvidenceId?: number;
  evidenceType: string;
  reviewFrequency?: string;
  sourceName?: string;
  evidenceNo?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  file?: FileObj;
  fileStatus?: string;
  copied: boolean;
  relatedToCurrentItem?: boolean;
}

export interface OperationEvidenceList {
  operationId: number | string;
  dataVersion: number;
  evidenceTypes: string[];
  evidences: OperationEvidence[];
  monitorCandidates: MonitorEvidenceCandidate[];
}

export interface EvidenceMutationResult {
  operationId: number | string;
  dataVersion: number;
  status: OperationReportStatus;
  completion: OperationCompletion;
  evidenceId?: number;
  relationId?: number;
  reused?: boolean;
}

export interface EvidencePayload {
  operationId: number | string;
  dataVersion: number;
  evidenceId?: number;
  evidenceType: string;
  reviewFrequency?: string;
  sourceName?: string;
  evidenceNo?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  file?: FileObj;
}
