import I18N from '@src/lang/I18N';

export const evidenceTypeOptions = [
  { value: 'calibration', label: I18N.cbamMonitor.meteringEquipmentCalibrationCertificate },
  { value: 'lab_analysis', label: I18N.cbamMonitor.laboratoryAnalysisSamplingReport },
  { value: 'electricity_factor', label: I18N.cbamMonitor.actualElectricityEmissionFactorEvidence },
  { value: 'precursor_report', label: I18N.cbamMonitor.precursorVerificationReport },
  { value: 'equipment_maintenance', label: I18N.cbamMonitor.monitoringEquipmentMaintenanceRecord },
  { value: 'data_quality_review', label: I18N.cbamMonitor.dataQualityReviewRecord },
  { value: 'other', label: I18N.cbamMonitor.otherEvidence },
];

export const evidenceReviewFrequencyOptions = [
  { value: 'batch', label: I18N.cbamMonitor.batch },
  { value: 'monthly', label: I18N.cbamMonitor.evidenceMonthly },
  { value: 'quarterly', label: I18N.cbamMonitor.evidenceQuarterly },
  { value: 'reporting_year', label: I18N.cbamMonitor.reportingYear },
  { value: 'annual_calibration', label: I18N.cbamMonitor.afterAnnualCalibration },
  { value: 'method_change', label: I18N.cbamMonitor.afterBatchMethodChange },
  { value: 'supplier_update', label: I18N.cbamMonitor.afterBatchSupplierUpdate },
];

export const evidencePartOptions = [
  { value: 1, code: 'PROCESS_MONITOR', label: I18N.cbamMonitor.processMonitoringMethods },
  { value: 2, code: 'FACTOR_SAMPLING', label: I18N.cbamMonitor.calculationFactorsAndSamplingPlans },
  { value: 3, code: 'PFC_MONITOR', label: I18N.cbamMonitor.pfcMonitoring },
  { value: 4, code: 'ZERO_RATED_FUEL', label: I18N.cbamMonitor.zeroRatedFuels },
  { value: 5, code: 'MEASURABLE_HEAT', label: I18N.cbamMonitor.measurableHeatFlows },
  { value: 6, code: 'FACILITY_ELECTRICITY', label: I18N.cbamMonitor.onsiteElectricityEvidence },
  { value: 7, code: 'WASTE_GAS', label: I18N.cbamMonitor.wasteGasTransfers },
  { value: 8, code: 'CO2_STAGE', label: I18N.cbamMonitor.co2CaptureUse },
];

const optionLabel = (options: { label: string; value: string }[], value?: string) => (
  options.find(option => option.value === value)?.label || value
);

export const getEvidenceTypeLabel = (value?: string) => optionLabel(evidenceTypeOptions, value);
export const getEvidenceReviewFrequencyLabel = (value?: string) => (
  optionLabel(evidenceReviewFrequencyOptions, value)
);
export const getEvidencePartLabel = (value?: number | string) => (
  evidencePartOptions.find(option => option.value === value || option.code === value)?.label
);
export const sortEvidencesByType = <T extends { evidenceType?: string; id?: number }>(values: T[]) => (
  [...values].sort((left, right) => {
    const leftIndex = evidenceTypeOptions.findIndex(option => option.value === left.evidenceType);
    const rightIndex = evidenceTypeOptions.findIndex(option => option.value === right.evidenceType);
    const leftOrder = leftIndex < 0 ? evidenceTypeOptions.length : leftIndex;
    const rightOrder = rightIndex < 0 ? evidenceTypeOptions.length : rightIndex;
    return leftOrder - rightOrder || (right.id || 0) - (left.id || 0);
  })
);
