// 审批请求状态 (reqType)
import I18N from '@src/lang/I18N';

export const APPROVAL_REQ_STATUS = {
  PENDING: '1', // 待审批
  REJECTED: '2', // 已驳回
  COMPLETED: '3', // 已完成
  CANCELLED: '4', // 已取消
} as const;

export const APPROVAL_REQ_STATUS_LABEL = {
  [APPROVAL_REQ_STATUS.PENDING]: I18N.cbam.pendingApproval,
  [APPROVAL_REQ_STATUS.REJECTED]: I18N.components.rejected,
  [APPROVAL_REQ_STATUS.COMPLETED]: I18N.components.completed,
  [APPROVAL_REQ_STATUS.CANCELLED]: I18N.components.canceled,
} as const;

// 审批状态 (status 字段)
export const APPROVAL_STATUS = {
  CANCELLED: 0, // 取消
  COMPLETED: 1, // 完成
  BE_FILLED: 2, // 待填报
  SUBMITTED: 3, // 已提交
  APPROVING: 4, // 审批中
  REJECTED: 5, // 已驳回
  APPROVED: 6, // 已完成
} as const;

export const APPROVAL_STATUS_LABEL = {
  [APPROVAL_STATUS.CANCELLED]: I18N.carbonFootprint.cancel,
  [APPROVAL_STATUS.COMPLETED]: I18N.DomesticVersion.complete,
  [APPROVAL_STATUS.BE_FILLED]: I18N.enterpriseCarbonAccount2.toBeFilledOut,
  [APPROVAL_STATUS.SUBMITTED]: I18N.supplyChain.submitted,
  [APPROVAL_STATUS.APPROVING]: I18N.enterpriseCarbonAccount2.underReview,
  [APPROVAL_STATUS.REJECTED]: I18N.components.rejected,
  [APPROVAL_STATUS.APPROVED]: I18N.components.completed,
} as const;
