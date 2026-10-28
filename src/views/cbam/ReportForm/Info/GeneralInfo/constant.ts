/** 是否包含热电联产枚举 */
import I18N from '@src/lang/I18N';

export const INCLUDE_EL_ENUM = {
  /** 是 */
  TRUE: 0,
  /** 否 */
  FALSE: 1,
} as const;

/** 是否包含热电联产option */
export const INCLUDE_EL_OPTIONS = [
  {
    label: I18N.eca.yes,
    value: INCLUDE_EL_ENUM.TRUE,
  },
  {
    label: I18N.eca.no,
    value: INCLUDE_EL_ENUM.FALSE,
  },
];
