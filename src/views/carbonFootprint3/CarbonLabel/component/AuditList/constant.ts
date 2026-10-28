/** 0 提交申请 1 撤销申请 2 审核通过 3 审核未通过 */
import I18N from '@src/lang/I18N';

export const AuditStatusType = {
  SUB: 0,
  ANNUL: 1,
  PASS: 2,
  NOT: 3,
};

export const AuditStatusTypeText = {
  [AuditStatusType.SUB]: I18N.carbonFootprint3.submitApplication,
  [AuditStatusType.ANNUL]: I18N.carbonFootprint3.revokeApplication,
  [AuditStatusType.PASS]: I18N.carbonFootprint3.approved,
  [AuditStatusType.NOT]: I18N.carbonFootprint3.reviewFailed,
};
