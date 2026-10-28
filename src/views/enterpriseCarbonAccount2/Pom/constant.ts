import I18N from '@src/lang/I18N';

export const ORG_DIMENSION_TYPE = {
  ENTERPRISE: 1,
  PART: 2,
};

export const ORG_DIMENSION_TYPE_LABEL = {
  [ORG_DIMENSION_TYPE.ENTERPRISE]: I18N.enterpriseCarbonAccount2.overallGroup,
  [ORG_DIMENSION_TYPE.PART]: I18N.enterpriseCarbonAccount2.eachAccountingEntity,
};

export const ORG_INDICATOR_TYPE = {
  YEAR: '1',
  QUARTER: '2',
  MONTH: '3',
};

export const ORG_INDICATOR_TYPE_LABEL = {
  [ORG_INDICATOR_TYPE.YEAR]: I18N.carbonDataManagemen.year,
  [ORG_INDICATOR_TYPE.QUARTER]: I18N.carbonDataManagemen.quarter,
  [ORG_INDICATOR_TYPE.MONTH]: I18N.carbonDataManagemen.monthly,
};
