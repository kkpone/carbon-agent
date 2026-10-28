import I18N from '@src/lang/I18N';

export const AUDIT_STATUS = {
  NOT_FILLED: 0,
  FILLING: 1,
  BE_AUDITED: 2,
  PASSED: 3,
  NOT_PASSED: 4,
} as const;

export const AUDIT_STATUS_LABEL = {
  [AUDIT_STATUS.NOT_FILLED]: I18N.carbonFootprint3.unfilled,
  [AUDIT_STATUS.FILLING]: I18N.carbonFootprint3.fillingIn,
  [AUDIT_STATUS.BE_AUDITED]: I18N.carbonFootprint3.pendingReview,
  [AUDIT_STATUS.PASSED]: I18N.carbonFootprint3.approved,
  [AUDIT_STATUS.NOT_PASSED]: I18N.carbonFootprint3.reviewFailed2,
} as const;
