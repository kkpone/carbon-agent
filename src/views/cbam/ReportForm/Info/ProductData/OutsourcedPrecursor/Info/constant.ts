/** 工厂级别枚举 */
import I18N from '@src/lang/I18N';

export const FACTORY_LEVEL_ENUM = {
  /** 隐含排放（直接） */
  IMPLIED_EMISSION_DIRECT: 1,
  /** 电力使用 */
  EL_USAGE: 4,
  /** 电力排放系数 */
  EL_EMISSION_COEFFICIENT: 5,
  /** 隐含排放（间接） */
  IMPLIED_EMISSION_INDIRECT: 3,
  /** 使用默认值的原因 */
  REASON_USE_DEFAULT: 10,
};
const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
  REASON_USE_DEFAULT,
} = FACTORY_LEVEL_ENUM;

/** 工厂级别枚举名称 */
export const FACTORY_LEVEL_NAME = {
  [IMPLIED_EMISSION_DIRECT]: I18N.cbam.impliedEmissionsDirectly,
  [EL_USAGE]: I18N.cbam.electricityUsage,
  [EL_EMISSION_COEFFICIENT]: I18N.cbam.electricEmissionSystem,
  [IMPLIED_EMISSION_INDIRECT]: I18N.cbam.impliedEmissionRoom,
  [REASON_USE_DEFAULT]: I18N.cbam.useDefaultValues3,
};

/** 来源枚举 */
export const SOURCE_ENUM = {
  /** 测量值 */
  MEASURE: 1,
  /** 默认值 */
  DEFAULT: 2,
};

/** 是否使用默认值计算枚举 */
export const USE_DEFAULT_ENUM = {
  /** 使用默认值计算 */
  USE_DEFAULT: 0,
  /** 不使用默认值计算 */
  NOT_USE: 1,
};

/** 是否使用默认值计算枚举option */
export const USE_DEFAULT_OPTIONS = [
  {
    label: I18N.cbam.doNotUseDefault,
    value: USE_DEFAULT_ENUM.NOT_USE,
  },
  {
    label: I18N.cbam.useDefaultValues2,
    value: USE_DEFAULT_ENUM.USE_DEFAULT,
  },
];
