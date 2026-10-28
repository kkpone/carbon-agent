/** 核算标签类型 0 碳足迹标签 1 减碳标签 2 碳中和标签 */
import I18N from '@src/lang/I18N';

export const ApplyForLabelType = {
  ACCOUNT: 0,
  REDUCE: 1,
  OFFSET: 2,
};

/** 核算标签类型 0 碳足迹标签 1 减碳标签 2 碳中和标签 */
export const ApplyForLabelTypeText = {
  [ApplyForLabelType.ACCOUNT]: I18N.carbonFootprint3.carbonFootprintLabel,
  [ApplyForLabelType.REDUCE]: I18N.carbonFootprint3.carbonReductionLabel,
  [ApplyForLabelType.OFFSET]: I18N.carbonFootprint3.carbonNeutralityLabel,
};

/** 状态：0待提交，1待审核，2审核通过，3审核未通过 4提交中 5提交失败*/
export const ApplyForAccountStatus = {
  TO_BE_SUB: 0,
  TO_BE_REVIEWED: 1,
  PASS: 2,
  NOT_PASS: 3,
  REVIEWED_ING: 4,
  REVIEWED_ERR: 5,
};

export const ApplyForAccountStatusLabel = {
  [ApplyForAccountStatus.TO_BE_SUB]: I18N.carbonFootprint3.toBeSubmitted,
  [ApplyForAccountStatus.TO_BE_REVIEWED]: I18N.carbonFootprint3.underReview,
  [ApplyForAccountStatus.PASS]: I18N.carbonFootprint3.passed,
  [ApplyForAccountStatus.NOT_PASS]: I18N.carbonFootprint3.notPassed,
  [ApplyForAccountStatus.REVIEWED_ING]: I18N.carbonFootprint3.submitting,
  [ApplyForAccountStatus.REVIEWED_ERR]: I18N.carbonFootprint.submissionFailed,
};

/** 0 boss 1 sass */
export const AuditForSource = {
  BOSS: 0,
  SAAS: 1,
};
