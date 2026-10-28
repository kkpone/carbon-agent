export interface MonitorPlanLimitViolation {
  actual: number;
  fieldPath: string;
  max: number;
  type: 'array' | 'string';
}

const TEXT_LIMITS: Record<string, number> = {
  itemKey: 64,
  planName: 100,
  versionNo: 40,
  changeReason: 200,
  operatorName: 100,
  registNo: 40,
  activityOverview: 1000,
  additionalDescription: 1000,
  processDescription: 1000,
  cnCode: 40,
  productName: 40,
  functionalUnit: 40,
  precursorName: 40,
  supplierName: 40,
  sourceFacility: 40,
  originCountry: 40,
  verificationPeriod: 40,
  processName: 40,
  productionRoute: 40,
  processItemKey: 64,
  goodsName: 40,
  boundaryDescription: 1000,
  sourceFlowName: 40,
  ghgType: 40,
  dataSource: 40,
  equipment: 40,
  location: 40,
  uncertainty: 10,
  calibration: 200,
  missingDataMethod: 1000,
  formulaCode: 40,
  processMonitorItemKey: 64,
  acquisitionPath: 40,
  sourceName: 40,
  sourceVersion: 40,
  samplingPlan: 200,
  laboratory: 40,
  laboratoryMethod: 1000,
  technology: 40,
  counterparty: 40,
  meteringPoint: 100,
  generationMode: 40,
  energyProperty: 40,
  meteringAllocationMethod: 100,
  wasteGasType: 40,
  positionName: 40,
  responsibility: 200,
  title: 40,
  referenceNo: 40,
  positionOrDepartment: 40,
  recordLocation: 40,
  mainRisk: 200,
  medium: 40,
  writtenRiskAssessmentRef: 200,
  notApplicableReason: 100,
  evidenceType: 64,
  reviewFrequency: 64,
  evidenceNo: 40,
  remark: 200,
};

const includesPath = (path: (string | number)[], field: string) => path.includes(field);

const textLimit = (path: (string | number)[]) => {
  const field = path[path.length - 1];
  if (typeof field === 'number') {
    const listField = path[path.length - 2];
    return listField === 'productItemKeys' || listField === 'precursorItemKeys' ? 64 : undefined;
  }
  if (field === 'description') {
    return includesPath(path, 'processJson') && includesPath(path, 'processes') ? 200 : 1000;
  }
  if (field === 'allocationMethod') {
    return includesPath(path, 'nonCbamGoodsJson') ? 200 : 100;
  }
  if (field === 'method') {
    return includesPath(path, 'wasteGasFlows') ? 100 : undefined;
  }
  if (includesPath(path, 'files') || includesPath(path, 'file')) {
    return ({ name: 255, size: 20, unit: 20, url: 600 } as Record<string, number>)[field];
  }
  return TEXT_LIMITS[field];
};

const fieldPath = (path: (string | number)[]) => path.reduce<string>((result, part) => (
  typeof part === 'number' ? `${result}[${part}]` : `${result}${result ? '.' : ''}${part}`
), '');

export const findMonitorPlanLimitViolation = (
  payload: unknown,
): MonitorPlanLimitViolation | undefined => {
  const visit = (value: unknown, path: (string | number)[]): MonitorPlanLimitViolation | undefined => {
    if (typeof value === 'string') {
      const max = textLimit(path);
      return max !== undefined && value.length > max
        ? { actual: value.length, fieldPath: fieldPath(path), max, type: 'string' }
        : undefined;
    }
    if (Array.isArray(value)) {
      if (path[path.length - 1] === 'files' && value.length > 5) {
        return { actual: value.length, fieldPath: fieldPath(path), max: 5, type: 'array' };
      }
      return value.reduce<MonitorPlanLimitViolation | undefined>(
        (result, child, index) => result || visit(child, [...path, index]),
        undefined,
      );
    }
    if (value && typeof value === 'object') {
      return Object.entries(value).reduce<MonitorPlanLimitViolation | undefined>(
        (result, [key, child]) => result || visit(child, [...path, key]),
        undefined,
      );
    }
    return undefined;
  };
  return visit(payload, []);
};
