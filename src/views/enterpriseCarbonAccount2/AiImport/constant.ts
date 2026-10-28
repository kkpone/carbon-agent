import I18N from '@src/lang/I18N';

export const IMPORT_STATUS = {
  NOT_EXIST_OR_FAIL: 0,
  PENDING: 1,
  DONE: 2,
};

export const AI_IMPORT_TYPE = {
  COMMON: 'COMMON',
  TRAVEL: 'TRAVEL',
};

export const ANALYZE_ERROR = {
  LOST_DATA: 1,
  UNIT_NOT_MATCH: 2,
  EMISSION_NOT_BIND: 3,
};

export const ANALYZE_ERROR_LABEL = {
  [ANALYZE_ERROR.LOST_DATA]: I18N.enterpriseCarbonAccount2.activityDataSheet,
  [ANALYZE_ERROR.UNIT_NOT_MATCH]: I18N.enterpriseCarbonAccount2.unitMismatch,
  [ANALYZE_ERROR.EMISSION_NOT_BIND]:
    I18N.enterpriseCarbonAccount2.unboundEmissions,
};

export const TRAVEL_ANALYZE_ERROR_LABEL = {
  [ANALYZE_ERROR.LOST_DATA]: I18N.enterpriseCarbonAccount2.oneWayDistance2,
  [ANALYZE_ERROR.UNIT_NOT_MATCH]: I18N.enterpriseCarbonAccount2.unitMismatch,
};

export const ROOM_ANALYZE_ERROR_LABEL = {
  [ANALYZE_ERROR.LOST_DATA]:
    I18N.enterpriseCarbonAccount2.missingNumberOfNights,
  [ANALYZE_ERROR.UNIT_NOT_MATCH]: I18N.enterpriseCarbonAccount2.unitMismatch,
};
