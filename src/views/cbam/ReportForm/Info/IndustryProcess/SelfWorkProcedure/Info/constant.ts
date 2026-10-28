/** 前置工序是否自动获取枚举 */
import I18N from '@src/lang/I18N';

export const PRE_WAY_ENUM = {
  /** 自动获取 */
  AUTO: 0,
  /** 手动填写 */
  MANUAL: 1,
} as const;

/** 前置工序是否自动获取option */
export const PRE_WAY_OPTIONS = [
  {
    label: I18N.cbam.automaticAcquisition,
    value: PRE_WAY_ENUM.AUTO,
  },
  {
    label: I18N.cbam.manuallyFillIn,
    value: PRE_WAY_ENUM.MANUAL,
  },
];
