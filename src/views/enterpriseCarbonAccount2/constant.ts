import I18N from '@src/lang/I18N';

export const ORG_TYPE = {
  ENTERPRISE: 1,
  ORG: 2,
  MAIN_PART: 3,
} as const;

export const COMPUTATION_STATUS = {
  NOT_START: 2,
  BE_FILLED: 3,
  FILLING: 0,
  BE_SUBMITTED: 4,
  COMPLETE: 1,
} as const;

export const COMPUTATION_STATUS_LABEL = {
  [COMPUTATION_STATUS.FILLING]: I18N.carbonFootprint3.fillingIn,
  [COMPUTATION_STATUS.COMPLETE]: I18N.components.completed,
  [COMPUTATION_STATUS.NOT_START]: I18N.components.notStartedYet,
  [COMPUTATION_STATUS.BE_FILLED]: I18N.enterpriseCarbonAccount2.toBeFilledOut,
  [COMPUTATION_STATUS.BE_SUBMITTED]: I18N.carbonFootprint3.toBeSubmitted,
} as const;

export const COMPUTATION_PERIOD = {
  MONTH: 2,
  QUARTER: 1,
  YEAR: 0,
};

export const COMPUTATION_PERIOD_LABEL = {
  [COMPUTATION_PERIOD.YEAR]: I18N.DomesticVersion.annually,
  [COMPUTATION_PERIOD.QUARTER]: I18N.DomesticVersion.quarterly,
  [COMPUTATION_PERIOD.MONTH]: I18N.DomesticVersion.monthly,
};
