import I18N from '@src/lang/I18N';

export const EMISSION_TYPE = {
  GENERAL: 0,
  REFRIGERANTS: 1,
  FIRE_EXTINGUISHERS: 2,
  DOMESTIC_WASTEWATER: 3,
  INDUSTRIAL_WASTEWATER: 4,
  PROCESS_EMISSIONS: 5,
  TRANSPORTATION: 6,
  WASTE: 7,
  FUEL: 8,
  ELECTRICITY: 9,
  HEAT: 10,
};

export const EMISSION_TYPE_LABEL = {
  [EMISSION_TYPE.GENERAL]: I18N.enterpriseCarbonAccount2.general,
  [EMISSION_TYPE.REFRIGERANTS]: I18N.enterpriseCarbonAccount2.refrigerant,
  [EMISSION_TYPE.FIRE_EXTINGUISHERS]:
    I18N.enterpriseCarbonAccount2.fireExtinguisher,
  [EMISSION_TYPE.DOMESTIC_WASTEWATER]:
    I18N.enterpriseCarbonAccount2.domesticWastewater,
  [EMISSION_TYPE.INDUSTRIAL_WASTEWATER]:
    I18N.enterpriseCarbonAccount2.industrialWastewater,
  [EMISSION_TYPE.PROCESS_EMISSIONS]:
    I18N.enterpriseCarbonAccount2.processEmissions2,
  [EMISSION_TYPE.TRANSPORTATION]: I18N.carbonFootprint.transport,
  [EMISSION_TYPE.WASTE]: I18N.ModelManagement.waste,
  [EMISSION_TYPE.FUEL]: I18N.enterpriseCarbonAccount2.fuel,
  [EMISSION_TYPE.ELECTRICITY]: I18N.enterpriseCarbonAccount2.power,
  [EMISSION_TYPE.HEAT]: I18N.enterpriseCarbonAccount2.thermalPower,
};

export const PARAM_TYPE = {
  NUMERIC: 0,
  PERCENT: 1,
};

export const PARAM_TYPE_LABEL = {
  [PARAM_TYPE.NUMERIC]: I18N.carbonFootPrintLCA.numericalValue,
  [PARAM_TYPE.PERCENT]: I18N.carbonFootPrintLCA.percentage,
};

export const NEED_DEFAULT = {
  NEED: 1,
  NOT_NEED: 0,
};

export const NEED_DEFAULT_LABEL = {
  [NEED_DEFAULT.NEED]: I18N.carbonNeutral.yes,
  [NEED_DEFAULT.NOT_NEED]: I18N.carbonNeutral.no,
};

export const USER_SIDE_DISPLAY = {
  SHOW: 1,
  HIDE: 0,
};

export const USER_SIDE_DISPLAY_LABEL = {
  [USER_SIDE_DISPLAY.SHOW]: I18N.enterpriseCarbonAccount2.userSideDisplayShow,
  [USER_SIDE_DISPLAY.HIDE]: I18N.enterpriseCarbonAccount2.userSideDisplayHide,
};

export const SYSTEM_TYPE = {
  SYSTEM: 0,
  CUSTOM: 1,
};

export const SYSTEM_TYPE_LABEL = {
  [SYSTEM_TYPE.SYSTEM]: I18N.enterpriseCarbonAccount2.systemDefault,
  [SYSTEM_TYPE.CUSTOM]: I18N.carbonFootprint.custom,
};

export const ENABLE_STATUS = {
  ENABLE: 1,
  DISABLE: 0,
};

export const ENABLE_STATUS_LABEL = {
  [ENABLE_STATUS.DISABLE]: I18N.base.disabled,
  [ENABLE_STATUS.ENABLE]: I18N.base.enable,
};

export const REF_TYPE = {
  NO_REFERENCE: 0,
  REFERENCE: 1,
};

export const REF_TYPE_LABEL = {
  [REF_TYPE.NO_REFERENCE]: I18N.carbonNeutral.no,
  [REF_TYPE.REFERENCE]: I18N.carbonNeutral.yes,
};
