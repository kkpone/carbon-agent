import { monitorCardCopy } from './materialAdvice';

/** 状态及完成分组复用现有业务文案，避免向用户显示内部代码。 */
export const monitorStatus = (status: string, lang?: string) => {
  const copy = monitorCardCopy(lang);
  return (
    {
      WAITING_MATERIALS: copy.agentWaiting,
      QUEUED: copy.agentQueued,
      PARSING: copy.agentParsing,
      FAILED: copy.agentFailed,
      EXTRACTED: copy.agentExtracted,
      NEEDS_INPUT: copy.agentNeedsInput,
      PENDING: copy.agentPending,
      FINAL_FAILED: copy.agentFailed,
      RETRYABLE_FAILED: copy.agentFailed,
      UNKNOWN: copy.agentUnknown,
      RUNNING: copy.agentApplying,
      SUCCEEDED: copy.agentApplied,
    }[status] || copy.agentPending
  );
};

export const completionGroupName = (code: string, lang?: string) => {
  const copy = monitorCardCopy(lang);
  return (
    (
      {
        PLAN_IDENTITY: copy.completionPlanIdentity,
        FACILITY: copy.completionFacilityProcess,
        PRODUCT_COMPOSITION: copy.completionProductComposition,
        PROCESS_GOODS: copy.completionProcessGoods,
        NON_CBAM_GOODS: copy.completionNonCbamGoods,
        CBAM_BENCHMARK: copy.completionCbamBenchmark,
        DATA_MONITOR_METHOD: copy.completionDataMonitoring,
        FACTOR_SAMPLING: copy.completionFactorSampling,
        SOURCE_EMISSION_LIST: copy.completionSourceEmission,
        CALCULATION_MASS_BALANCE_SOURCE: copy.completionCalculationMassBalance,
        MEASUREMENT_SOURCE: copy.completionMeasurementSource,
        PFC_MONITOR: copy.completionPfcMonitoring,
        SYSTEM_BOUNDARY: copy.completionSystemBoundary,
        PRECURSOR_SUPPLIER_ORIGIN: copy.completionPrecursorOrigin,
        ZERO_RATED_FUEL: copy.completionZeroRatedFuel,
        MEASURABLE_HEAT: copy.completionHeatInputOutput,
        FACILITY_ELECTRICITY: copy.completionFacilityElectricity,
        ELECTRICITY_FACTOR: copy.completionElectricityFactor,
        IMPORTED_ELECTRICITY_EVIDENCE: copy.completionImportedElectricity,
        WASTE_GAS: copy.completionWasteGas,
        CO2_STAGE: copy.completionCo2Stage,
        DATA_QUALITY_CONTROL: copy.completionDataQualityControl,
      } as Record<string, string>
    )[code] || copy.monitoringPlan
  );
};
