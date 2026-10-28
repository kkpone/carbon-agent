import I18N from '@src/lang/I18N';

export const IMPORT_STATUS = {
  IMPORTING: 0,
  SUCCESS: 1,
  FAIL: 2,
  PARTIAL_SUCCESS: 3,
} as const;

export const SUPPLY_CHAIN_IMPORT_TYPE = {
  SUPPLIER: 0,
  PURCHASE_PRODUCT: 1,
} as const;

export const INVITE_SUPPLIER_STATUS = {
  ENABLED: '0',
  DISABLED: '1',
} as const;

export const INVITE_SUPPLIER_STATUS_LABEL = {
  [INVITE_SUPPLIER_STATUS.ENABLED]: I18N.supplyChain.toBeInvited,
  [INVITE_SUPPLIER_STATUS.DISABLED]: I18N.supplyChain.unableToInvite,
} as const;

export const CARBON_DATA_REQ_DATA_TYPE = {
  QUICK_ACCOUNT: 0,
  PROCESS_ACCOUNT: 1,
  ENTERPRISE: 2,
  SUPPLIER: 3,
};

export const CARBON_DATA_REQ_TYPE = {
  FOOTPRINT: 3,
  ENTERPRISE: 4,
} as const;

export const CARBON_DATA_REQ_TYPE_LABEL = {
  [CARBON_DATA_REQ_TYPE.FOOTPRINT]:
    I18N.carbonFootprint.carbonFootprintVerification2,
  [CARBON_DATA_REQ_TYPE.ENTERPRISE]:
    I18N.carbonFootprint3.enterpriseCarbonAccounting,
} as const;

export const CARBON_DATA_BORDER_TYPE = {
  FULL: 1,
  HALF: 0,
  /** 自定义生命周期 */
  CUSTOM: 2,
} as const;

export const CARBON_DATA_BORDER_TYPE_LABEL = {
  [CARBON_DATA_BORDER_TYPE.FULL]: I18N.carbonFootprint3.fullLifecycle2,
  [CARBON_DATA_BORDER_TYPE.HALF]: I18N.carbonFootprint3.halfLifeCycle2,
  [CARBON_DATA_BORDER_TYPE.CUSTOM]: I18N.carbonFootprint3.customLifeCycle2,
} as const;

export const CARBON_DATA_FILL_TYPE = {
  MATCH: 1,
  FILL: 2,
  /** 模型共享：只读，跳转查看共享副本核算模型 */
  MODEL_SHARE: 3,
} as const;

/** 填报方式文案 */
export const CARBON_DATA_FILL_TYPE_LABEL = {
  [CARBON_DATA_FILL_TYPE.MATCH]: () => I18N.supplyChain.systemMatching,
  [CARBON_DATA_FILL_TYPE.FILL]: () => I18N.supplyChain.manuallyFillIn,
  [CARBON_DATA_FILL_TYPE.MODEL_SHARE]: () =>
    I18N.supplyChain.modelShareFillType,
} as const;

export const CARBON_DATA_DATA_TYPE = {
  RESULT: 1,
  PROCESS: 2,
} as const;

export const CARBON_DATA_DATA_TYPE_LABEL = {
  [CARBON_DATA_DATA_TYPE.RESULT]:
    I18N.enterpriseCarbonAccount2.accountingResults,
  [CARBON_DATA_DATA_TYPE.PROCESS]: I18N.supplyChain.accountingProcess,
} as const;

export const CARBON_DATA_SUBMIT_TYPE = {
  SAVE: 1,
  SAVE_SUBMIT: 2,
} as const;

// new
export const INVITE_STATUS = {
  NOT_INVITE: 0,
  INVITING: 1,
  REJECT: 2,
  COMPLETE: 3,
};

export const INVITE_STATUS_LABEL = {
  [INVITE_STATUS.NOT_INVITE]: I18N.supplyChain.notInvited,
  [INVITE_STATUS.INVITING]: I18N.supplyChain.invitingIn,
  [INVITE_STATUS.REJECT]: I18N.carbonDataManagemen.rejected,
  [INVITE_STATUS.COMPLETE]: I18N.supplyChain.invitationCompleted,
};

export const SUPPLIER_STATUS = {
  ENABLED: 1,
  DISABLED: 0,
} as const;

export const SUPPLIER_STATUS_LABEL = {
  [SUPPLIER_STATUS.ENABLED]: I18N.carbonFootprint.enable,
  [SUPPLIER_STATUS.DISABLED]: I18N.carbonFootprint.disabled,
} as const;

export const CARBON_DATA_STATUS = {
  NOT_FILL: 0,
  FILLING: 1,
  PENDING: 2,
  APPROVED: 3,
  DISAPPROVED: 4,
} as const;

export const SUPPLIER_CARBON_DATA_STATUS_LABEL = {
  [CARBON_DATA_STATUS.NOT_FILL]: I18N.carbonFootprint3.toBeSubmitted,
  [CARBON_DATA_STATUS.FILLING]: I18N.carbonFootprint3.fillingIn,
  [CARBON_DATA_STATUS.PENDING]: I18N.carbonFootprint3.pendingReview,
  [CARBON_DATA_STATUS.APPROVED]: I18N.carbonFootprint3.approved,
  [CARBON_DATA_STATUS.DISAPPROVED]: I18N.carbonFootprint3.reviewFailed2,
} as const;

export const CLIENT_STATUS = {
  PENDING: 1,
  REJECTED: 2,
  RESOLVED: 3,
};
