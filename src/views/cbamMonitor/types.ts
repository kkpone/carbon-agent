export type MonitorPlanStatus = 0 | 1 | 2;
export type MonitorSaveType = 0 | 1;
export type MonitorChildDeleteType =
  | 'PRODUCT'
  | 'PRECURSOR'
  | 'PROCESS'
  | 'NON_CBAM_GOODS'
  | 'PROCESS_MONITOR'
  | 'FACTOR_SAMPLING'
  | 'PFC_MONITOR'
  | 'MEASURABLE_HEAT'
  | 'FACILITY_ELECTRICITY'
  | 'WASTE_GAS'
  | 'RESPONSIBILITY'
  | 'MANAGE_EVALUATE_PROCEDURE'
  | 'DATA_FLOW_PROCEDURE'
  | 'CONTROL_ACTIVITY_PROCEDURE'
  | 'OTHER_PROCEDURE'
  | 'SYSTEM_BOUNDARY_FILE'
  | 'EVIDENCE'
  | 'EVIDENCE_FILE'
  | 'EVIDENCE_RELATION';

export interface MonitorChildDeleteRequest {
  dataVersion?: number;
  target: MonitorChildDeleteType;
  itemKey?: string;
  fileUrl?: string;
  fileName?: string;
  uploadTime?: string;
  evidenceId?: number;
  relationId?: number;
}
export type MonitorSectionCode =
  | 'PLAN_IDENTITY'
  | 'FACILITY'
  | 'PRODUCT_COMPOSITION'
  | 'PROCESS_GOODS'
  | 'NON_CBAM_GOODS'
  | 'CBAM_BENCHMARK'
  | 'DATA_MONITOR_METHOD'
  | 'FACTOR_SAMPLING'
  | 'SOURCE_EMISSION_LIST'
  | 'CALCULATION_MASS_BALANCE_SOURCE'
  | 'MEASUREMENT_SOURCE'
  | 'PFC_MONITOR'
  | 'SYSTEM_BOUNDARY'
  | 'PRECURSOR_SUPPLIER_ORIGIN'
  | 'ZERO_RATED_FUEL'
  | 'MEASURABLE_HEAT'
  | 'FACILITY_ELECTRICITY'
  | 'ELECTRICITY_FACTOR'
  | 'IMPORTED_ELECTRICITY_EVIDENCE'
  | 'WASTE_GAS'
  | 'CO2_STAGE'
  | 'DATA_QUALITY_CONTROL';

export interface FileObj {
  name?: string;
  size?: string;
  unit?: string;
  url?: string;
  uploadTime?: string;
}

export interface JsonItem {
  itemKey?: string;
  sortNo?: number;
}

export interface ApplicableJson {
  itemKey?: string;
  applicable?: boolean;
  notApplicableReason?: string;
  evidenceIds?: number[];
}

export interface FacilityJson {
  operatorName?: string;
  registNo?: string;
  activityOverview?: string;
  processDescription?: string;
}

export interface ProductItem extends JsonItem {
  cnCode?: string;
  productName?: string;
  functionalUnit?: string;
  productType?: 'SOLD_PRODUCT' | 'INTERMEDIATE_PRODUCT';
}

export interface ProductJson {
  products?: ProductItem[];
}

export interface PrecursorItem extends JsonItem {
  sourceId?: number;
  cnCode?: string;
  precursorName?: string;
  emissionBasis?: 'MEASURED_VALUE' | 'DEFAULT_VALUE';
  supplierName?: string;
  sourceFacility?: string;
  originCountry?: string;
  verificationPeriod?: string;
  embeddedEmission?: number;
}

export interface PrecursorJson {
  precursors?: PrecursorItem[];
}

export interface ProcessItem extends JsonItem {
  processName?: string;
  productItemKeys?: string[];
  precursorItemKeys?: string[];
  productionRoute?: string;
  description?: string;
}

export interface ProcessJson {
  processes?: ProcessItem[];
}

export interface NonCbamGoodsItem extends JsonItem {
  processItemKey?: string;
  goodsName?: string;
  allocationMethod?: string;
  allocationRate?: number;
}

export interface NonCbamGoodsJson {
  goods?: NonCbamGoodsItem[];
}

export interface SystemBoundaryJson {
  boundaryDescription?: string;
  files?: FileObj[];
}

export interface ProcessMonitorItem extends JsonItem {
  evidenceIds?: number[];
  processItemKey?: string;
  sourceFlowName?: string;
  sourceType?: 'combustion' | 'process' | 'emission_source';
  ghgType?: 'CO₂' | 'N₂O';
  monitorMethod?:
    | 'standard_calculation'
    | 'mass_balance'
    | 'measurement_cems';
  dataSource?: string;
  frequency?: MonitorFrequency;
  equipment?: string;
  location?: string;
  uncertainty?: string;
  calibration?: string;
  missingDataMethod?: string;
  formulaCode?: string;
}

export interface ProcessMonitorJson {
  methods?: ProcessMonitorItem[];
}

export type MonitorFrequency =
  | 'CONTINUOUS'
  | 'SHIFT'
  | 'DAILY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL';

export interface FactorSamplingItem extends JsonItem {
  evidenceIds?: number[];
  /** 旧详情兼容字段；新保存只提交 sourceFlowName。 */
  processMonitorItemKey?: string;
  sourceFlowName?: string;
  factorType?: string;
  acquisitionPath?: string;
  sourceName?: string;
  sourceVersion?: string;
  samplingPlan?: string;
  laboratory?: string;
  laboratoryMethod?: string;
}

export interface FactorSamplingJson {
  factors?: FactorSamplingItem[];
}

export interface PfcMonitorItem extends JsonItem {
  evidenceIds?: number[];
  processItemKey?: string;
  technology?: string;
  method?: 'SLOPE_METHOD' | 'OVERVOLTAGE_METHOD';
  frequency?: MonitorFrequency;
  dataSource?: string;
  equipment?: string;
  location?: string;
  uncertainty?: string;
  calibration?: string;
  missingDataMethod?: string;
  formulaCode?: string;
}

export interface PfcMonitorJson extends ApplicableJson {
  methods?: PfcMonitorItem[];
}

export interface ZeroRatedFuelJson extends ApplicableJson {
  description?: string;
  additionalDescription?: string;
}

export interface HeatFlowItem extends JsonItem {
  direction?: 'INPUT' | 'OUTPUT';
  medium?: string;
  counterparty?: string;
  processItemKey?: string;
  allocationMethod?: string;
  meteringPoint?: string;
  evidenceIds?: number[];
}

export interface MeasurableHeatJson extends ApplicableJson {
  heatFlows?: HeatFlowItem[];
}

export interface FacilityElectricityItem extends JsonItem {
  generationMode?: string;
  energyProperty?: string;
  includedInOutputBoundary?: boolean;
  processItemKey?: string;
  meteringAllocationMethod?: string;
  evidenceIds?: number[];
}

export interface FacilityElectricityJson extends ApplicableJson {
  generators?: FacilityElectricityItem[];
}

export interface ElectricityFactorJson extends ApplicableJson {
  description?: string;
  additionalDescription?: string;
}

export interface WasteGasItem extends JsonItem {
  wasteGasType?: string;
  flowModes?: ('PRODUCE' | 'USE' | 'INPUT' | 'OUTPUT')[];
  counterparty?: string;
  processItemKey?: string;
  method?: string;
  evidenceIds?: number[];
}

export interface WasteGasJson extends ApplicableJson {
  wasteGasFlows?: WasteGasItem[];
}

export interface Co2StageJson extends ApplicableJson {
  description?: string;
}

export interface ResponsibilityItem extends JsonItem {
  positionName?: string;
  responsibility?: string;
}

export interface ProcedureItem extends JsonItem {
  title?: string;
  referenceNo?: string;
  positionOrDepartment?: string;
  frequency?: MonitorFrequency;
  recordLocation?: string;
  mainRisk?: string;
  description?: string;
  procedureType?: string;
}

export interface DivideWorkJson {
  responsibilities?: ResponsibilityItem[];
}

export interface ProcedureJson {
  procedures?: ProcedureItem[];
}

export interface ControlActivityJson extends ProcedureJson {
  writtenRiskAssessmentRef?: string;
  includedInEnvironmentalManagementSystem?: boolean;
}

export interface MonitorPlanPayload {
  id?: number;
  factoryId?: number;
  planName?: string;
  planDate?: string;
  versionNo?: string;
  year: number;
  effectiveDate?: string;
  changeReason?: string;
  dataVersion?: number;
  saveType?: MonitorSaveType;
  completedCount?: number;
  publishTime?: string;
  facility: { facilityJson?: FacilityJson };
  goodsBoundary: {
    productJson?: ProductJson;
    precursorJson?: PrecursorJson;
    processJson?: ProcessJson;
    nonCbamGoodsJson?: NonCbamGoodsJson;
    systemBoundaryJson?: SystemBoundaryJson;
  };
  directEmission: {
    processMonitorJson?: ProcessMonitorJson;
    factorSamplingJson?: FactorSamplingJson;
    pfcMonitorJson?: PfcMonitorJson;
  };
  condition: {
    zeroRatedFuelJson?: ZeroRatedFuelJson;
    measurableHeatJson?: MeasurableHeatJson;
    facilityElectricityJson?: FacilityElectricityJson;
    electricityFactorJson?: ElectricityFactorJson;
    wasteGasJson?: WasteGasJson;
    co2StageJson?: Co2StageJson;
  };
  controlConfirmation: {
    divideWorkJson?: DivideWorkJson;
    manageEvaluateJson?: ProcedureJson;
    dataFlowJson?: ProcedureJson;
    controlActivityJson?: ControlActivityJson;
    otherProcedureJson?: ProcedureJson;
  };
  evidences: MonitorEvidence[];
  evidenceRelations: MonitorEvidenceRelation[];
}

export interface MonitorEvidence {
  id?: number;
  evidenceType?: string;
  reviewFrequency?: string;
  sourceName?: string;
  evidenceNo?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  file?: FileObj;
  fileStatus?: string;
  partCodes?: number[];
  partName?: string;
  relatedStatus?: string;
}

export interface MonitorEvidenceRelation {
  id?: number;
  evidenceId: number;
  partCode: number;
  itemKey: string;
}

export interface CompletionGroup {
  sectionCode: MonitorSectionCode;
  completed: boolean;
  requiredCount: number;
  filledRequiredCount: number;
  missingFields: string[];
  blockingMissingFields: string[];
}

export interface CompletionResult {
  completedCount: number;
  totalCount: 22;
  completionRate: number;
  pendingGroups: MonitorSectionCode[];
  groupStats: CompletionGroup[];
}

export interface MonitorPlanSaveResult extends CompletionResult {
  id: number;
  dataVersion: number;
  saveType: MonitorSaveType;
  status: MonitorPlanStatus;
  statusName: string;
}

export interface MonitorPlanDetail extends MonitorPlanPayload {
  status?: MonitorPlanStatus;
  statusName?: string;
  completion?: CompletionResult;
}

export interface MonitorPlanListItem {
  id: number;
  planName?: string;
  versionNo?: string;
  year: number;
  products?: string[];
  status: MonitorPlanStatus;
  statusName: string;
  completedCount: number;
  totalCount: 22;
  completionRate: number;
  updateTime?: string;
}

export interface MonitorFactoryGroup {
  factoryId: number;
  factoryName: string;
  orgId?: number;
  factoryCode?: string;
  country?: string;
  city?: string;
  locationCode?: string;
  plans: MonitorPlanListItem[];
}

export interface MonitorPlanPage {
  pageNum: number;
  pageSize: number;
  total: number;
  records: MonitorFactoryGroup[];
}

export interface MonitorOverview {
  totalCount: number;
  editingCount: number;
  effectiveCount: number;
  archivedCount: number;
}

export interface MonitorPlanQuery {
  pageNum: number;
  pageSize: number;
  name?: string;
  status?: MonitorPlanStatus;
  year?: number;
}

export interface FactoryOption {
  id?: number;
  orgId?: number;
  orgName?: string;
  factorName?: string;
  factoryNameEn?: string;
  factoryCode?: string;
  locationCode?: string;
  postalCode?: string;
  country?: string;
  countryName?: string;
  city?: string;
  detailedAddress?: string;
  addressEn?: string;
  longitude?: string;
  latitude?: string;
  ePrtrCode?: string;
}

export interface MonitorCnOption {
  defaultCode?: string;
  defaultName?: string;
}

export interface MonitorPrecursorQuery {
  pageNum: number;
  pageSize: number;
  applyStatus: 'APPROVED';
  type: number;
  cnCode?: string;
  supplyName?: string;
  preName?: string;
}

export interface MonitorPrecursorOption {
  id?: number;
  productPrecursorId?: number;
  cnCode?: string;
  declarationName?: string;
  companyName?: string;
  precursorName?: string;
  supplyName?: string;
  sourceFacility?: string;
  countryValue?: string;
  countryName?: string;
  applyTime?: string;
  submitTime?: string;
  verificationPeriod?: string;
  embeddedEmission?: number | string;
}
