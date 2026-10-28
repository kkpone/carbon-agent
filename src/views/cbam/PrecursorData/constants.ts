import I18N from '@src/lang/I18N';

export const PRECURSOR_DATA_STATUS = {
  /** 未填报 */
  NOT_FILLED: 0,
  /** 填报中 */
  FILLING: 1,
  /** 已填报 */
  FILLED: 2,
  /** 待审批 */
  PENDING_APPROVAL: 3,
  /** 审批通过 */
  APPROVAL_PASSED: 4,
  /** 审批不通过 */
  APPROVAL_FAILED: 5,
  /** 已撤回 */
  WITHDRAWN: 6,
  /** 已关闭 */
  CLOSED: 7,
};

const {
  NOT_FILLED,
  FILLING,
  FILLED,
  PENDING_APPROVAL,
  APPROVAL_PASSED,
  APPROVAL_FAILED,
  WITHDRAWN,
  CLOSED,
} = PRECURSOR_DATA_STATUS;

export const PRECURSOR_DATA_STATUS_LIST = [
  {
    label: I18N.cbam.notFilledIn,
    value: NOT_FILLED,
  },
  {
    label: I18N.cbam.fillingIn,
    value: FILLING,
  },
  {
    label: I18N.supplyChainCarbonManagement.reported,
    value: FILLED,
  },
  {
    label: I18N.cbam.pendingApproval,
    value: PENDING_APPROVAL,
  },
  {
    label: I18N.eca.approved,
    value: APPROVAL_PASSED,
  },
  {
    label: I18N.eca.reviewFailed,
    value: APPROVAL_FAILED,
  },
  {
    label: I18N.certificationReviewCenter.withdrawn,
    value: WITHDRAWN,
  },
  {
    label: I18N.cbam.closed,
    value: CLOSED,
  },
];

/** 后端要求 */
export const defaultProps = {
  companyName: '',
  pageNum: 1,
  pageSize: 10,
  preName: '',
  supplyName: '',
  type: 0,
};
