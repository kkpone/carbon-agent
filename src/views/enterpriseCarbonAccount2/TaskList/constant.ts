import I18N from '@src/lang/I18N';

export const TASK_REQ_STATUS = {
  PENDING: '0',
  ALL: '1',
  APPROVING: '2',
  COMPLETED: '3',
  CANCELED: '4',
} as const;

export const TASK_REQ_STATUS_LABEL = () =>
  ({
    [TASK_REQ_STATUS.PENDING]: I18N.enterpriseCarbonAccount2.toBeFilledOut,
    [TASK_REQ_STATUS.ALL]: I18N.enterpriseCarbonAccount2.allRequests,
    [TASK_REQ_STATUS.APPROVING]: I18N.enterpriseCarbonAccount2.underReview,
    [TASK_REQ_STATUS.COMPLETED]: I18N.components.completed,
    [TASK_REQ_STATUS.CANCELED]: I18N.components.canceled,
  } as const);

export const TASK_STATUS = {
  CANCEL: 0,
  CLOSE: 1,
  BE_FILLED: 2,
  FILLED: 3,
  APPROVING: 4,
  REJECTED: 5,
  COMPLETED: 6,
  /** 已关闭 */
  CLOSED: 7,
} as const;

export const TASK_STATUS_LABEL = () =>
  ({
    [TASK_STATUS.CANCEL]: I18N.components.canceled,
    [TASK_STATUS.CLOSE]: I18N.components.completed,
    [TASK_STATUS.BE_FILLED]: I18N.supplyChain.toBeFilledOut,
    [TASK_STATUS.FILLED]: I18N.enterpriseCarbonAccount2.reported,
    [TASK_STATUS.APPROVING]: I18N.enterpriseCarbonAccount2.underReview,
    [TASK_STATUS.REJECTED]: I18N.components.rejected,
    [TASK_STATUS.COMPLETED]: I18N.components.completed,
    [TASK_STATUS.CLOSED]: I18N.cbam.closed,
  } as const);
