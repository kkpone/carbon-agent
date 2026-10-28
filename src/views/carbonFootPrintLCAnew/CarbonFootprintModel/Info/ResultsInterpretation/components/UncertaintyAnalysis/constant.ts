/** 执行状态 */
import I18N from '@src/lang/I18N';

export const EXECUTIVE_STATUS = {
  /** 未执行 */
  UNEXECUTED: 0,
  /** 执行中 */
  IN_PROGRESS: 1,
  /** 执行完成 */
  EXECUTION_COMPLETED: 2,
};

const { UNEXECUTED, IN_PROGRESS, EXECUTION_COMPLETED } = EXECUTIVE_STATUS;

/** 执行状态对应的文本 */
export const EXECUTIVE_STATUS_TEXT = {
  /** 未执行 */
  [UNEXECUTED]: I18N.carbonFootPrintLCA.implement,
  /** 执行中 */
  [IN_PROGRESS]: I18N.carbonFootPrintLCA.inProgress,
  /** 执行完成 */
  [EXECUTION_COMPLETED]: I18N.carbonFootPrintLCA.reExecute,
};
