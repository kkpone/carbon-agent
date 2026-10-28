import I18N from '@src/lang/I18N';

export const MEASURES_TYPE = {
  ENERGY_EFFICIENCY_IMPROVEMENT: 1,
  EMISSION_SOURCE_SUBSTITUTION: 2,
  SUPPLY_CHAIN_EMISSIONS_REDUCTION: 3,
  RECYCLING: 4,
  OTHER: 5,
};

export const MEASURES_TYPE_LABEL = {
  [MEASURES_TYPE.ENERGY_EFFICIENCY_IMPROVEMENT]:
    I18N.enterpriseCarbonAccount2.energyEfficiencyImprovement,
  [MEASURES_TYPE.EMISSION_SOURCE_SUBSTITUTION]:
    I18N.enterpriseCarbonAccount2.substitutionOfEmissionSources,
  [MEASURES_TYPE.SUPPLY_CHAIN_EMISSIONS_REDUCTION]:
    I18N.enterpriseCarbonAccount2.supplyChainEmissionsReduction,
  [MEASURES_TYPE.RECYCLING]: I18N.enterpriseCarbonAccount2.recycling,
  [MEASURES_TYPE.OTHER]: I18N.carbonFootprint3.other,
};

export const MEASURES_CHANNEL_TYPE = {
  SYSTEM: 1,
  CUSTOM: 2,
  APPLY: 3,
};

export const MEASURES_SETTING_TYPE = {
  SIMPLE: 1,
  ADVANCED: 2,
};

export const FEASIBILITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const FEASIBILITY_LABEL = {
  [FEASIBILITY.HIGH]: I18N.carbonAccount.high,
  [FEASIBILITY.MEDIUM]: I18N.carbonAccount.in,
  [FEASIBILITY.LOW]: I18N.carbonAccount.low,
};

export const PARAM_TYPE = {
  ABSOLUTE: 1,
  PERCENT: 2,
};

export const PARAM_TYPE_LABEL = {
  [PARAM_TYPE.ABSOLUTE]: I18N.enterpriseCarbonAccount2.absoluteValue,
  [PARAM_TYPE.PERCENT]: I18N.enterpriseCarbonAccount2.percentage,
};

export const REDUCTION_EFFECT_UNIT = {
  [PARAM_TYPE.ABSOLUTE]: I18N.enterpriseCarbonAccount2.tcOeYear,
  [PARAM_TYPE.PERCENT]: I18N.enterpriseCarbonAccount2.year11,
};

export const SIMPLE_REDUCTION_EFFECT_UNIT = {
  [PARAM_TYPE.ABSOLUTE]: I18N.enterpriseCarbonAccount2.tcOeYear,
  [PARAM_TYPE.PERCENT]: I18N.enterpriseCarbonAccount2.year11,
};

export const COST_EARN_UNIT = {
  COST: I18N.enterpriseCarbonAccount2.tenThousandYuan,
  EARN: I18N.enterpriseCarbonAccount2.inTheFirstYearOfTheWannianEra,
};
