import I18N from '@src/lang/I18N';

export const MAX_ELLIPSIS_LENGTH = 10;

export const PROCESS_ACCOUNTING_NODE_TYPE = {
  PROCESS: 1,
  EMISSION: 0,
} as const;

export const PROCESS_TYPE = {
  IN: 1,
  OUT: 2,
} as const;

const PROCESS_PRODUCT_TYPE = {
  MAIN: 1,
  BY: 2,
  RECYCLED: 3,
} as const;

export const PROCESS_PRODUCT_TYPE_LABEL = {
  [PROCESS_PRODUCT_TYPE.MAIN]: I18N.carbonFootprint3.mainProducts,
  [PROCESS_PRODUCT_TYPE.BY]: I18N.carbonFootprint3.byproduct,
  [PROCESS_PRODUCT_TYPE.RECYCLED]: I18N.carbonFootprint3.reuseOfOutput,
} as const;

export const PROCESS_IN_TYPE = {
  MAIN_MATERIAL: 1,
  ACCESSORIES: 2,
  PACKAGING_MATERIAL: 3,
  RECYCLED_MATERIAL: 4,
  ENERGY_CONSUMPTION: 5,
  WATER_CONSUMPTION: 6,
  TRANSPORTATION: 7,
  PROCESS: 8,
  SAVE: 9,
  USE: 10,
  ABANDON: 11,
} as const;

export const PROCESS_IN_TYPE_LABEL = {
  [PROCESS_IN_TYPE.MAIN_MATERIAL]: I18N.carbonFootprint.mainMaterials,
  [PROCESS_IN_TYPE.ACCESSORIES]: I18N.carbonFootprint.accessories,
  [PROCESS_IN_TYPE.PACKAGING_MATERIAL]: I18N.carbonFootprint3.packingMaterial,
  [PROCESS_IN_TYPE.RECYCLED_MATERIAL]: I18N.carbonFootprint3.recycledMaterials,
  [PROCESS_IN_TYPE.ENERGY_CONSUMPTION]: I18N.carbonFootprint.energyConsumption2,
  [PROCESS_IN_TYPE.WATER_CONSUMPTION]: I18N.carbonFootprint3.waterConsumption,
  [PROCESS_IN_TYPE.TRANSPORTATION]: I18N.carbonFootprint.transport,
  [PROCESS_IN_TYPE.PROCESS]: I18N.carbonFootprint3.machining,
  [PROCESS_IN_TYPE.SAVE]: I18N.carbonFootprint3.distributionAndStorage2,
  [PROCESS_IN_TYPE.USE]: I18N.carbonFootprint3.apply,
  [PROCESS_IN_TYPE.ABANDON]: I18N.carbonFootprint.abandonedDisposal,
} as const;

export const PROCESS_OUT_TYPE = {
  GAS_WASTE: 21,
  WATER_WASTE: 22,
  SOLID_WASTE: 23,
  RECYCLED_WASTE: 24,
} as const;

export const PROCESS_OUT_TYPE_LABEL = {
  [PROCESS_OUT_TYPE.GAS_WASTE]: I18N.carbonFootprint3.wasteGas,
  [PROCESS_OUT_TYPE.WATER_WASTE]: I18N.carbonFootprint3.wasteWater,
  [PROCESS_OUT_TYPE.SOLID_WASTE]: I18N.carbonFootprint3.solidWaste,
  [PROCESS_OUT_TYPE.RECYCLED_WASTE]: I18N.carbonFootprint3.renewableWaste,
} as const;

export const MATCH_WAY = {
  FACTOR: 1,
  FACTOR_CREATE: 2,
  PROCESS_LIB: 3,
  PROCESS_CREATE: 4,
  SUPPLIER: 5,
} as const;

export const MATCH_WAY_LABEL = {
  [MATCH_WAY.FACTOR]: I18N.carbonFootprint.emissionFactors,
  [MATCH_WAY.FACTOR_CREATE]: I18N.carbonFootprint3.newFactor,
  [MATCH_WAY.PROCESS_LIB]: I18N.carbonFootprint3.processLibrary,
  [MATCH_WAY.PROCESS_CREATE]: I18N.carbonFootprint3.newProcess,
  [MATCH_WAY.SUPPLIER]: I18N.carbonFootprint3.initiateCollection,
} as const;

export const CALC_WAY = {
  PRODUCT_WEIGHT: 1,
  BEARING_RATIO: 2,
  ENERGY_CONSUMPTION: 3,
} as const;

export const CALC_WAY_LABEL = {
  [CALC_WAY.PRODUCT_WEIGHT]: I18N.carbonFootprint3.productByMileage,
  [CALC_WAY.BEARING_RATIO]: I18N.carbonFootprint3.loadCapacityBasedOnMileage,
  [CALC_WAY.ENERGY_CONSUMPTION]:
    I18N.carbonFootprint3.accordingToEnergyConsumption,
} as const;

export const EMISSION_REQUEST_STATE = {
  NOT_SUBMIT: 0,
  WAITING: 1,
  AUDITED: 2,
} as const;

export const EMISSION_TYPE_LABEL = {
  ...PROCESS_IN_TYPE_LABEL,
  ...PROCESS_OUT_TYPE_LABEL,
} as const;

export const SUPPLIER_EMISSION_DATA_TYPE = {
  RESULT: 1,
  PROCESS: 2,
} as const;

export const SUPPLIER_EMISSION_DATA_TYPE_LABEL = {
  [SUPPLIER_EMISSION_DATA_TYPE.RESULT]:
    I18N.carbonFootprint3.carbonFootprintVerification2,
  [SUPPLIER_EMISSION_DATA_TYPE.PROCESS]:
    I18N.carbonFootprint3.carbonFootprintVerification,
} as const;

export const SUPPLIER_EMISSION_BORDER_TYPE = {
  HALF: 1,
  WHOLE: 2,
} as const;

export const SUPPLIER_EMISSION_BORDER_TYPE_LABEL = {
  [SUPPLIER_EMISSION_BORDER_TYPE.HALF]: I18N.carbonFootprint3.halfLifeCycle2,
  [SUPPLIER_EMISSION_BORDER_TYPE.WHOLE]: I18N.carbonFootprint3.fullLifecycle2,
} as const;
