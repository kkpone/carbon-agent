import I18N from '@src/lang/I18N';

export const ACTIVITY_TYPE = {
  EMISSION_FACTOR: 0,
  FORMULA: 1,
};

export const ACTIVITY_TYPE_LABEL = {
  [ACTIVITY_TYPE.EMISSION_FACTOR]:
    I18N.enterpriseCarbonAccount2.emissionFactorMethod,
  [ACTIVITY_TYPE.FORMULA]:
    I18N.enterpriseCarbonAccount2.formulaCalculationMethod,
};

export const ACCOUNT_REFERENCE_WAY = {
  MODEL: 1,
  RESULT: 2,
} as const;
