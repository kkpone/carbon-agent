import I18N from '@src/lang/I18N';

export const EMISSION_SOURCE_TYPE = {
  RAW_MATERIAL: 1,
  ENERGY: 2,
  WATER_CONSUMPTION: 3,
  TRANSPORTATION: 4,
  MACHINING: 5,
  DS: 6,
  FORTH_PUTTING: 7,
  DISPOSAL: 8,
} as const;

export const EMISSION_SOURCE_TYPE_LABEL = {
  [EMISSION_SOURCE_TYPE.RAW_MATERIAL]: I18N.carbonFootprint3.rawMaterial,
  [EMISSION_SOURCE_TYPE.ENERGY]: I18N.carbonFootprint3.energy,
  [EMISSION_SOURCE_TYPE.WATER_CONSUMPTION]:
    I18N.carbonFootprint3.waterConsumption,
  [EMISSION_SOURCE_TYPE.TRANSPORTATION]: I18N.carbonFootprint.transport,
  [EMISSION_SOURCE_TYPE.MACHINING]: I18N.carbonFootprint3.machining,
  [EMISSION_SOURCE_TYPE.DS]: I18N.carbonFootprint3.distributionAndStorage2,
  [EMISSION_SOURCE_TYPE.FORTH_PUTTING]: I18N.carbonFootprint3.apply,
  [EMISSION_SOURCE_TYPE.DISPOSAL]: I18N.carbonFootprint.abandonedDisposal,
} as const;
