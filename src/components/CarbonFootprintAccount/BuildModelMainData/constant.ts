/**
 * @description 自定义参数 - 引入核算的外层自定义参数
 */
export const API_EXTRA_PARAMS_SNAPFLAG = {
  /** 供应链对应 */
  SUPPLY: 1,
  /** 分享对应 */
  SHARE: 2,
  /** SaaS分享对应 */
  SAASSHARE: 3,
  /** 分享链接可编辑快照 supply_account */
  ACCOUNT_SHARE_EDIT: 8,
} as const;
