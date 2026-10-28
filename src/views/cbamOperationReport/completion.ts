import {
  JsonObject,
  OperationCompletionGroup,
  OperationDirectEmissionItem,
  OperationReportPayload,
} from './types';

export const OPERATION_SECTION_CODES = [
  'REPORT_INFO',
  'ASSOCIATION_INFO',
  'OPERATOR_INFO',
  'PROCESS_BOUNDARY',
  'PROCESS_INFO',
  'CBAM_PRODUCT',
  'PRECURSOR',
  'DIRECT_EMISSION',
  'NON_CBAM_PRODUCT',
  'ELECTRICITY_CONSUMPTION',
  'HEAT_FLOW',
  'WASTE_GAS',
  'ZERO_RATED_FUEL',
  'FACILITY_ELECTRICITY',
  'CO2_STAGE',
  'QUALITY',
  'DATA_GAP',
] as const;

export type OperationSectionCode = typeof OPERATION_SECTION_CODES[number];
type PreviewPayload = Partial<OperationReportPayload> & {
  factoryId?: number;
  sourcePlan?: JsonObject;
};
type FieldValue = [path: string, value: unknown];
type ApplicableValue = { sourcePresent?: boolean; applicable?: boolean };

const objectValue = (value: unknown): JsonObject | undefined =>
  value && !Array.isArray(value) && typeof value === 'object'
    ? value as JsonObject
    : undefined;

const filled = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return Boolean(value.trim());
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const group = (sectionCode: OperationSectionCode, fields: FieldValue[]): OperationCompletionGroup => {
  const missingFields = fields.filter(([, value]) => !filled(value)).map(([path]) => path);
  return {
    sectionCode,
    completed: missingFields.length === 0,
    requiredCount: fields.length,
    filledRequiredCount: fields.length - missingFields.length,
    missingFields,
    blockingMissingFields: missingFields,
  };
};

const rowsGroup = <T>(
  sectionCode: OperationSectionCode,
  path: string,
  rows: T[] | undefined,
  fields: (item: T) => FieldValue[],
  additionalFields: FieldValue[] = [],
) => group(sectionCode, [
  ...additionalFields,
  ...(!rows?.length ? [[path, undefined] as FieldValue] : []),
  ...(rows || []).flatMap((item, rowIndex) =>
    fields(item).map(([fieldPath, value]) => [`${path}[${rowIndex}].${fieldPath}`, value] as FieldValue)),
]);

const normalizedSet = (values: (string | undefined)[] | undefined) =>
  [...new Set((values || []).map(value => value?.trim()).filter(Boolean))].sort().join('\u0000');

const directEmissionFields = (item: OperationDirectEmissionItem): FieldValue[] => {
  const fields: FieldValue[] = [
    ['applicableStartDate', item.applicableStartDate],
    ['applicableEndDate', item.applicableEndDate],
  ];
  const processMethod = String(item.processMethod || '');
  const monitorMethod = String(item.monitorMethod || '').toUpperCase();
  const monitorSourceType = String(item.monitorSourceType || '').toUpperCase();
  const pfcMethod = String(item.pfcMethod || '').toUpperCase();
  const activity = () => fields.push(['activityData', item.activityData], ['activityUnit', item.activityUnit]);
  const standard = () => {
    fields.push(
      ['emissionCoefficient', item.emissionCoefficient],
      ['emissionCoefficientUnit', item.emissionCoefficientUnit],
    );
    if (String(item.emissionCoefficientUnit || '').toUpperCase().includes('/TJ')) {
      fields.push(['lowHeat', item.lowHeat]);
    }
  };
  const measurement = () => fields.push(
    ['biomassContent', item.biomassContent],
    ['lowHeat', item.lowHeat],
    ['emissionCoefficient', item.emissionCoefficient],
    ['conversionRate', item.conversionRate],
  );
  const pfc = (slope: boolean) => {
    fields.push(['activityData', item.activityData], ['oxRate', item.oxRate]);
    if (slope) {
      fields.push(
        ['lowHeat', item.lowHeat],
        ['emissionCoefficient', item.emissionCoefficient],
        ['conversionRate', item.conversionRate],
      );
    } else {
      fields.push(
        ['biomassContent', item.biomassContent],
        ['carbonFossil', item.carbonFossil],
        ['carbonBiological', item.carbonBiological],
      );
    }
  };
  if (['Burning', '1'].includes(processMethod)) {
    activity();
    standard();
    fields.push(['oxRate', item.oxRate]);
  } else if (['Process_Emissions', '2'].includes(processMethod)) {
    activity();
    standard();
    fields.push(['conversionRate', item.conversionRate]);
  } else if (['Material_Balance', '3'].includes(processMethod)) {
    activity();
    fields.push(['carbon', item.carbon]);
  } else if (['Slope_method', '4'].includes(processMethod)) {
    pfc(true);
  } else if (['Overpressure_method', '5'].includes(processMethod)) {
    pfc(false);
  } else if (['N2O', 'CO2', '6', '7'].includes(processMethod)) {
    measurement();
  } else if (pfcMethod) {
    pfc(['SLOPE_METHOD', '4'].includes(pfcMethod));
  } else if (monitorMethod === 'STANDARD_CALCULATION') {
    activity();
    standard();
    if (['COMBUSTION', 'COMBUSTION_FLOW'].includes(monitorSourceType)) {
      fields.push(['oxRate', item.oxRate]);
    } else if (['PROCESS', 'PROCESS_FLOW'].includes(monitorSourceType)) {
      fields.push(['conversionRate', item.conversionRate]);
    }
  } else if (monitorMethod === 'MASS_BALANCE') {
    activity();
    fields.push(['carbon', item.carbon]);
  } else if (monitorMethod === 'MEASUREMENT_CEMS') {
    measurement();
  }
  return fields;
};

export const calculateOperationCompletionPreview = (
  payload: PreviewPayload,
): OperationCompletionGroup[] => {
  const monitorPlanSelected = payload.planId !== undefined && payload.planId !== null;
  const sourceCondition = objectValue(payload.sourcePlan?.condition);
  const conditionNotApplicable = (
    value: ApplicableValue | undefined,
    sourceValue: ApplicableValue | undefined,
  ) => {
    if (value?.sourcePresent === false || value?.applicable === false) return true;
    if (value?.applicable === true) return false;
    if (payload.operationId !== undefined) return value !== undefined;
    return payload.sourcePlan !== undefined
      && (sourceValue === undefined || sourceValue.applicable !== true);
  };
  const processJson = payload.processData?.processJson;
  const processFields: FieldValue[] = [];
  const productionQuantityFields: FieldValue[] = [];
  if (!processJson?.processes?.length) {
    processFields.push(['processData.processJson.processes', undefined]);
  }
  (processJson?.processes || []).forEach((process, processIndex) => {
    const path = `processData.processJson.processes[${processIndex}]`;
    processFields.push([`${path}.description`, process.description]);
    if (!process.routes?.length) processFields.push([`${path}.routes`, undefined]);
    (process.routes || []).forEach((route, routeIndex) => {
      processFields.push([`${path}.routes[${routeIndex}].routeName`, route.routeName]);
      productionQuantityFields.push(
        [`${path}.routes[${routeIndex}].productionQuantity`, route.productionQuantity],
      );
    });
    if (normalizedSet(process.sourceRouteNames) !== normalizedSet(
      (process.routes || []).map(route => route.routeName),
    )) {
      processFields.push([`${path}.routeChangeDesc`, process.routeChangeDesc]);
    }
  });
  const zeroRatedFuel = payload.condition?.zeroRatedFuelJson;
  const zeroRatedFields: FieldValue[] = !monitorPlanSelected
    ? [['planId', undefined]]
    : conditionNotApplicable(zeroRatedFuel, objectValue(sourceCondition?.zeroRatedFuelJson)) ? [] : [
      ['condition.zeroRatedFuelJson.applicable', zeroRatedFuel?.applicable],
      ['condition.zeroRatedFuelJson.consumption', zeroRatedFuel?.consumption],
      ['condition.zeroRatedFuelJson.biomassRatio', zeroRatedFuel?.biomassRatio],
      ['condition.zeroRatedFuelJson.zeroEmissionRatio', zeroRatedFuel?.zeroEmissionRatio],
    ];
  const facilityElectricity = payload.condition?.facilityElectricityJson;
  const facilityFields: FieldValue[] = !monitorPlanSelected
    ? [['planId', undefined]]
    : conditionNotApplicable(
      facilityElectricity,
      objectValue(sourceCondition?.facilityElectricityJson),
    ) ? []
    : [['condition.facilityElectricityJson.applicable', facilityElectricity?.applicable]];
  if (monitorPlanSelected && !conditionNotApplicable(
    facilityElectricity,
    objectValue(sourceCondition?.facilityElectricityJson),
  )) {
    if (!facilityElectricity?.generators?.length) {
      facilityFields.push(['condition.facilityElectricityJson.generators', undefined]);
    }
    (facilityElectricity?.generators || []).forEach((item, index) => facilityFields.push(
      [`condition.facilityElectricityJson.generators[${index}].generationAmount`, item.generationAmount],
      [`condition.facilityElectricityJson.generators[${index}].outputAmount`, item.outputAmount],
      [`condition.facilityElectricityJson.generators[${index}].emissionFactor`, item.emissionFactor],
    ));
  }
  const co2Stage = payload.condition?.co2StageJson;
  const co2Fields: FieldValue[] = !monitorPlanSelected
    ? [['planId', undefined]]
    : conditionNotApplicable(co2Stage, objectValue(sourceCondition?.co2StageJson)) ? []
      : [['condition.co2StageJson.applicable', co2Stage?.applicable]];
  if (monitorPlanSelected && !conditionNotApplicable(
    co2Stage,
    objectValue(sourceCondition?.co2StageJson),
  )) {
    if (!co2Stage?.projects?.length) co2Fields.push(['condition.co2StageJson.projects', undefined]);
    (co2Stage?.projects || []).forEach((item, index) => co2Fields.push(
      [`condition.co2StageJson.projects[${index}].projectName`, item.projectName],
      [`condition.co2StageJson.projects[${index}].receivedAmount`, item.receivedAmount],
      [`condition.co2StageJson.projects[${index}].outputAmount`, item.outputAmount],
      [`condition.co2StageJson.projects[${index}].sourceDestination`, item.sourceDestination],
      [`condition.co2StageJson.projects[${index}].purpose`, item.purpose],
      [`condition.co2StageJson.projects[${index}].responsiblePerson`, item.responsiblePerson],
      [`condition.co2StageJson.projects[${index}].contactInfo`, item.contactInfo],
      [`condition.co2StageJson.projects[${index}].claimedDeductionAmount`, item.claimedDeductionAmount],
    ));
  }
  const noDataGapConfirmed = payload.quality?.noDataGap === true;
  const hasDataGaps = Boolean(payload.dataGaps?.length);
  const qualityFields: FieldValue[] = [
    ['quality.compileDate', payload.quality?.compileDate],
    ['quality.compilerName', payload.quality?.compilerName],
  ];
  if (!noDataGapConfirmed && !hasDataGaps) {
    qualityFields.push(['quality.noDataGap', undefined]);
  }
  const qualityCompletion = group('QUALITY', qualityFields);
  const dataGapCompletion = noDataGapConfirmed
    ? group('DATA_GAP', [])
    : hasDataGaps ? rowsGroup('DATA_GAP', 'dataGaps', payload.dataGaps, item => [
      ['parameterName', item.parameterName], ['processItemKey', item.processItemKey],
      ['gapStartDate', item.gapStartDate], ['gapEndDate', item.gapEndDate],
      ['missingAmount', item.missingAmount], ['status', item.status], ['reason', item.reason],
      ['substituteSource', item.substituteSource], ['estimationMethod', item.estimationMethod],
      ['estimationResult', item.estimationResult], ['impactAssessment', item.impactAssessment],
      ['correctiveAction', item.correctiveAction],
    ]) : group('DATA_GAP', [['quality.noDataGap', undefined]]);
  const heatFlow = payload.processData?.heatFlowJson;
  const heatFlowCompletion = !monitorPlanSelected
    ? group('HEAT_FLOW', [['planId', undefined]])
    : conditionNotApplicable(heatFlow, objectValue(sourceCondition?.measurableHeatJson))
      ? group('HEAT_FLOW', [])
      : rowsGroup('HEAT_FLOW', 'processData.heatFlowJson.items', heatFlow?.items,
        item => [['heatAmount', item.heatAmount], ['emissionFactor', item.emissionFactor]]);
  const wasteGas = payload.processData?.wasteGasJson;
  const wasteGasCompletion = !monitorPlanSelected
    ? group('WASTE_GAS', [['planId', undefined]])
    : conditionNotApplicable(wasteGas, objectValue(sourceCondition?.wasteGasJson))
      ? group('WASTE_GAS', [])
      : rowsGroup('WASTE_GAS', 'processData.wasteGasJson.items', wasteGas?.items,
        item => [['wasteGasAmount', item.wasteGasAmount], ['emissionFactor', item.emissionFactor]]);
  return [
    group('REPORT_INFO', [
      ['reportName', payload.reportName], ['startDate', payload.startDate], ['endDate', payload.endDate],
      ['versionNo', payload.versionNo], ['submitTarget', payload.submitTarget],
    ]),
    group('ASSOCIATION_INFO', [['factoryId', payload.factoryId], ['planId', payload.planId]]),
    group('OPERATOR_INFO', [
      ['contactName', payload.contactName], ['contactEmail', payload.contactEmail],
      ['contactPhone', payload.contactPhone], ['detailedAddress', payload.detailedAddress],
    ]),
    group('PROCESS_BOUNDARY', [
      ['processData.processJson.reportProcessDescription', processJson?.reportProcessDescription],
      ['processData.processJson.reportBoundaryDescription', processJson?.reportBoundaryDescription],
    ]),
    group('PROCESS_INFO', processFields),
    rowsGroup('CBAM_PRODUCT', 'processData.cbamProductJson.reportItems',
      payload.processData?.cbamProductJson?.reportItems, item => [
        ['externalSalesQuantity', item.externalSalesQuantity], ['monitorStartDate', item.monitorStartDate],
        ['monitorEndDate', item.monitorEndDate], ...(item.processConsumptions || []).map((row, index) =>
          [`processConsumptions[${index}].quantity`, row.quantity] as FieldValue),
      ], productionQuantityFields),
    rowsGroup('PRECURSOR', 'processData.precursorJson.reportItems',
      payload.processData?.precursorJson?.reportItems, item => [
        ['directEmission', item.directEmission], ['indirectEmission', item.indirectEmission],
        ...(item.emissionBasis === 'DEFAULT_VALUE'
          ? [['defaultCnId', item.defaultCnId] as FieldValue] : []),
        ['monitorStartDate', item.monitorStartDate],
        ['monitorEndDate', item.monitorEndDate],
        ...(!item.routeQuantities?.length ? [['routeQuantities', undefined] as FieldValue] : []),
        ...(item.routeQuantities || []).map((row, index) =>
          [`routeQuantities[${index}].quantity`, row.quantity] as FieldValue),
      ]),
    rowsGroup('DIRECT_EMISSION', 'processData.directEmissionJson.items',
      payload.processData?.directEmissionJson?.items, directEmissionFields),
    rowsGroup('NON_CBAM_PRODUCT', 'processData.nonCbamProductJson.items',
      payload.processData?.nonCbamProductJson?.items, item => [
        ['productionQuantity', item.productionQuantity], ['allocationMethod', item.allocationMethod],
        ['allocationRate', item.allocationRate],
      ]),
    rowsGroup('ELECTRICITY_CONSUMPTION', 'processData.electricityJson.items',
      payload.processData?.electricityJson?.items, item => [
        ['useStartDate', item.useStartDate], ['useEndDate', item.useEndDate],
        ['electricityConsumption', item.electricityConsumption], ['emissionFactor', item.emissionFactor],
      ]),
    heatFlowCompletion,
    wasteGasCompletion,
    group('ZERO_RATED_FUEL', zeroRatedFields),
    group('FACILITY_ELECTRICITY', facilityFields),
    group('CO2_STAGE', co2Fields),
    qualityCompletion,
    dataGapCompletion,
  ];
};
