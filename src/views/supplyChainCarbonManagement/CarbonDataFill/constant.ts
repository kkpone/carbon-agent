import I18N from '@src/lang/I18N';

import { APPLY_TYPE } from '../utils/constant';

/** 审批填报状态 */
export const APPLY_STATUS = {
  /** 未填报 */
  NOT_FILLED_IN: 0,
  /** 填报中 */
  FILLING_IN: 1,
  /** 待审批 */
  TO_BE_REVIEWED: 3,
  /** 审批通过 */
  APPROVED: 4,
  /** 审批不通过 */
  REVIEW_FAILED: 5,
  /** 已撤回 */
  WITHDRAWN: 6,
  /** 已填报 */
  REPORTED: 2,
  /** 已关闭 */
  CLOSED: 7,
};

const { ONLY_RESULT, ALL_PROCESS } = APPLY_TYPE;
/** 提交/撤回 数据请求类型对应的文案 */
export const APPLY_TYPE_TEXT = {
  /** 仅结果 */
  [ONLY_RESULT]: I18N.supplyChainCarbonManagement.onlyResultData,
  /** 全部核算过程 */
  [ALL_PROCESS]: I18N.supplyChainCarbonManagement.allHaveBeenAccountedFor,
};
