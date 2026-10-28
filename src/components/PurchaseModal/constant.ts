export const GOODS_MODE = {
  TIME: 0,
  COUNT: 1,
} as const;

export const GOODS_ONLINE = {
  OFFLINE: 0,
  ONLINE: 1,
} as const;

export const SKU_LIMIT = {
  LIMIT: 0,
  NOT_LIMIT: 1,
} as const;

export const PAY_STATUS = {
  WAIT_PAY: '0',
  SUCCESS: '1',
  CANCEL: '2',
} as const;

export const GOODS_STATUS = {
  ENABLED: '0',
  DISABLED: '1',
} as const;
