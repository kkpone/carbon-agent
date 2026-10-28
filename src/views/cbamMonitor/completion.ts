import {
  MonitorPlanPayload,
  MonitorSectionCode,
} from './types';

export type MonitorNavKey = 'identity' | 'goods' | 'direct' | 'condition' | 'control';

interface CompletionPreviewGroup {
  sectionCode: MonitorSectionCode;
  completed: boolean;
  requiredCount: number;
  filledRequiredCount: number;
}

interface CountResult {
  requiredCount: number;
  filledRequiredCount: number;
}

export const NAV_SECTION_CODES: Record<MonitorNavKey, MonitorSectionCode[]> = {
  identity: ['PLAN_IDENTITY', 'FACILITY'],
  goods: [
    'PRODUCT_COMPOSITION',
    'PROCESS_GOODS',
    'NON_CBAM_GOODS',
    'CBAM_BENCHMARK',
    'SYSTEM_BOUNDARY',
    'PRECURSOR_SUPPLIER_ORIGIN',
  ],
  direct: [
    'DATA_MONITOR_METHOD',
    'FACTOR_SAMPLING',
    'SOURCE_EMISSION_LIST',
    'CALCULATION_MASS_BALANCE_SOURCE',
    'MEASUREMENT_SOURCE',
    'PFC_MONITOR',
  ],
  condition: [
    'ZERO_RATED_FUEL',
    'MEASURABLE_HEAT',
    'FACILITY_ELECTRICITY',
    'ELECTRICITY_FACTOR',
    'IMPORTED_ELECTRICITY_EVIDENCE',
    'WASTE_GAS',
    'CO2_STAGE',
  ],
  control: ['DATA_QUALITY_CONTROL'],
};

const SYSTEM_BOUNDARY_MAX_BYTES = 50 * 1024 * 1024;
const filled = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const valuesCount = (values: unknown[]): CountResult => ({
  requiredCount: values.length,
  filledRequiredCount: values.filter(filled).length,
});

const rowsCount = <T>(rows: T[] | undefined, fields: (row: T) => unknown[]): CountResult => {
  const validRows = (rows || []).filter(Boolean);
  if (validRows.length === 0) return { requiredCount: 1, filledRequiredCount: 0 };
  return validRows.reduce<CountResult>((result, row) => {
    const current = valuesCount(fields(row));
    return {
      requiredCount: result.requiredCount + current.requiredCount,
      filledRequiredCount: result.filledRequiredCount + current.filledRequiredCount,
    };
  }, { requiredCount: 0, filledRequiredCount: 0 });
};

const optionalRowsCount = <T>(rows: T[] | undefined, fields: (row: T) => unknown[]): CountResult =>
  (rows || []).filter(Boolean).reduce<CountResult>((result, row) => {
    const current = valuesCount(fields(row));
    return {
      requiredCount: result.requiredCount + current.requiredCount,
      filledRequiredCount: result.filledRequiredCount + current.filledRequiredCount,
    };
  }, { requiredCount: 0, filledRequiredCount: 0 });

const combine = (...counts: CountResult[]): CountResult => counts.reduce<CountResult>(
  (result, current) => ({
    requiredCount: result.requiredCount + current.requiredCount,
    filledRequiredCount: result.filledRequiredCount + current.filledRequiredCount,
  }),
  { requiredCount: 0, filledRequiredCount: 0 },
);

const group = (sectionCode: MonitorSectionCode, count: CountResult): CompletionPreviewGroup => ({
  sectionCode,
  completed: count.requiredCount === count.filledRequiredCount,
  ...count,
});

const completedGroup = (sectionCode: MonitorSectionCode): CompletionPreviewGroup => group(
  sectionCode,
  { requiredCount: 0, filledRequiredCount: 0 },
);

const fileBytes = (size?: string, unit?: string) => {
  if (!size?.trim()) return undefined;
  const value = Number(size.trim());
  if (!Number.isFinite(value)) return undefined;
  const multiplier = ({
    K: 1024,
    KB: 1024,
    M: 1024 ** 2,
    MB: 1024 ** 2,
    G: 1024 ** 3,
    GB: 1024 ** 3,
  } as Record<string, number>)[unit?.trim().toUpperCase() || ''] || 1;
  return value * multiplier;
};

const validFile = (file: { name?: string; url?: string; size?: string; unit?: string } | undefined, maxBytes: number) => {
  if (!file?.name?.trim() || !file.url?.trim()) return false;
  const bytes = fileBytes(file.size, file.unit);
  return bytes === undefined || bytes <= maxBytes;
};

const hasTypedEvidence = (payload: Partial<MonitorPlanPayload>, evidenceIds: number[] | undefined) => {
  const relatedIds = new Set(evidenceIds || []);
  return (payload.evidences || []).some(evidence =>
    evidence.id !== undefined
    && relatedIds.has(evidence.id)
    && Boolean(evidence.evidenceType?.trim()));
};

export const calculateCompletionPreview = (
  payload: Partial<MonitorPlanPayload> | undefined,
): CompletionPreviewGroup[] => {
  const value = payload || {};
  const {
    facility: facilityConfig,
    goodsBoundary: goods,
    directEmission: direct,
    condition,
    controlConfirmation: control,
  } = value;
  const facility = facilityConfig?.facilityJson;
  const products = goods?.productJson?.products;
  const precursors = goods?.precursorJson?.precursors;
  const methods = direct?.processMonitorJson?.methods || [];
  const processFields = (item: typeof methods[number]) => [
    item.processItemKey,
    item.sourceFlowName,
    item.sourceType,
    item.monitorMethod,
    item.dataSource,
    item.frequency,
    item.equipment,
    item.calibration,
  ];
  const applicableGroup = (
    sectionCode: MonitorSectionCode,
    applicable: boolean | undefined,
    count: CountResult,
  ) => applicable === false ? completedGroup(sectionCode) : group(sectionCode, count);
  const procedureFields = (item: {
    title?: string;
    positionOrDepartment?: string;
    frequency?: string;
    recordLocation?: string;
  }) => [item.title, item.positionOrDepartment, item.frequency, item.recordLocation];
  const systemFiles = goods?.systemBoundaryJson?.files || [];
  const controlCount = combine(
    rowsCount(control?.divideWorkJson?.responsibilities, item => [item.positionName]),
    rowsCount(control?.manageEvaluateJson?.procedures, procedureFields),
    rowsCount(control?.dataFlowJson?.procedures, procedureFields),
    rowsCount(control?.controlActivityJson?.procedures, procedureFields),
    optionalRowsCount(control?.otherProcedureJson?.procedures, procedureFields),
  );
  return [
    group('PLAN_IDENTITY', valuesCount([
      value.planName,
      value.planDate,
      value.versionNo,
      value.year,
      value.effectiveDate,
    ])),
    group('FACILITY', valuesCount([
      value.factoryId,
      facility?.operatorName,
      facility?.registNo,
      facility?.activityOverview,
      facility?.processDescription,
    ])),
    group('PRODUCT_COMPOSITION', combine(
      rowsCount(products, item => [item.cnCode, item.productName, item.functionalUnit, item.productType]),
      rowsCount(precursors, item => [
        item.cnCode,
        item.precursorName,
        item.emissionBasis,
        item.supplierName,
        item.sourceFacility,
        item.originCountry,
      ]),
    )),
    group('PROCESS_GOODS', rowsCount(goods?.processJson?.processes, item => [
      item.processName,
      item.productItemKeys,
      item.precursorItemKeys,
      item.productionRoute,
      item.description,
    ])),
    group('NON_CBAM_GOODS', rowsCount(goods?.nonCbamGoodsJson?.goods, item => [
      item.processItemKey,
      item.goodsName,
      item.allocationMethod,
      item.allocationRate,
    ])),
    group('CBAM_BENCHMARK', {
      requiredCount: 1,
      filledRequiredCount: (products || []).some(Boolean) ? 1 : 0,
    }),
    group('DATA_MONITOR_METHOD', rowsCount(methods, processFields)),
    group('FACTOR_SAMPLING', rowsCount(direct?.factorSamplingJson?.factors, item => [
      item.sourceFlowName,
      item.factorType,
      item.sourceName,
      item.samplingPlan,
      item.laboratory,
      item.laboratoryMethod,
    ])),
    group('SOURCE_EMISSION_LIST', rowsCount(methods, processFields)),
    group('CALCULATION_MASS_BALANCE_SOURCE', rowsCount(methods, processFields)),
    group('MEASUREMENT_SOURCE', rowsCount(methods, processFields)),
    applicableGroup('PFC_MONITOR', direct?.pfcMonitorJson?.applicable, rowsCount(
      direct?.pfcMonitorJson?.methods,
      item => [
        item.processItemKey,
        item.technology,
        item.method,
        item.frequency,
        item.dataSource,
        item.equipment,
        item.calibration,
      ],
    )),
    group('SYSTEM_BOUNDARY', valuesCount([
      goods?.systemBoundaryJson?.boundaryDescription,
      systemFiles.some(file => validFile(file, SYSTEM_BOUNDARY_MAX_BYTES)) || undefined,
    ])),
    group('PRECURSOR_SUPPLIER_ORIGIN', rowsCount(precursors, item => [
      item.cnCode,
      item.precursorName,
      item.emissionBasis,
      item.supplierName,
      item.sourceFacility,
      item.originCountry,
    ])),
    applicableGroup('ZERO_RATED_FUEL', condition?.zeroRatedFuelJson?.applicable, valuesCount([
      condition?.zeroRatedFuelJson?.description,
      hasTypedEvidence(value, condition?.zeroRatedFuelJson?.evidenceIds) || undefined,
    ])),
    applicableGroup('MEASURABLE_HEAT', condition?.measurableHeatJson?.applicable, rowsCount(
      condition?.measurableHeatJson?.heatFlows,
      item => [item.direction, item.medium, item.processItemKey, item.allocationMethod, item.meteringPoint],
    )),
    applicableGroup('FACILITY_ELECTRICITY', condition?.facilityElectricityJson?.applicable, rowsCount(
      condition?.facilityElectricityJson?.generators,
      item => [
        item.generationMode,
        item.energyProperty,
        item.includedInOutputBoundary,
        item.processItemKey,
        item.meteringAllocationMethod,
      ],
    )),
    applicableGroup('ELECTRICITY_FACTOR', condition?.electricityFactorJson?.applicable, valuesCount([
      condition?.electricityFactorJson?.description,
      hasTypedEvidence(value, condition?.electricityFactorJson?.evidenceIds) || undefined,
    ])),
    completedGroup('IMPORTED_ELECTRICITY_EVIDENCE'),
    applicableGroup('WASTE_GAS', condition?.wasteGasJson?.applicable, rowsCount(
      condition?.wasteGasJson?.wasteGasFlows,
      item => [item.wasteGasType, item.processItemKey, item.method],
    )),
    applicableGroup('CO2_STAGE', condition?.co2StageJson?.applicable, valuesCount([
      hasTypedEvidence(value, condition?.co2StageJson?.evidenceIds) || undefined,
    ])),
    group('DATA_QUALITY_CONTROL', controlCount),
  ];
};

export const calculateNavPendingCounts = (
  groups: CompletionPreviewGroup[],
): Record<MonitorNavKey, number> => {
  const groupByCode = new Map(groups.map(item => [item.sectionCode, item]));
  const pendingCount = (navKey: MonitorNavKey) => NAV_SECTION_CODES[navKey]
    .filter(sectionCode => groupByCode.get(sectionCode)?.completed === false)
    .length;
  return {
    identity: pendingCount('identity'),
    goods: pendingCount('goods'),
    direct: pendingCount('direct'),
    condition: pendingCount('condition'),
    control: pendingCount('control'),
  };
};
