/** 元素枚举 */
import I18N from '@src/lang/I18N';

export const ELEMENT_ENUM = {
  /** 直接排放量 */
  DIRECT_EMISSION: 1,
  /** 热力的输入输出 */
  THERMAL_INPUT_OUTPUT: 2,
  /** 尾气的投入和回收 */
  INPUT_RECOVERY_GAS: 3,
  /** 电力使用 */
  EL_USAGE: 4,
  /** 电力输出 */
  POWER_OUTPUT: 5,
};
const {
  DIRECT_EMISSION,
  THERMAL_INPUT_OUTPUT,
  INPUT_RECOVERY_GAS,
  EL_USAGE,
  POWER_OUTPUT,
} = ELEMENT_ENUM;

/** 元素枚举名称 */
export const ELEMENT_NAME = {
  [DIRECT_EMISSION]: I18N.cbam.directEmissions2,
  [THERMAL_INPUT_OUTPUT]: I18N.cbam.heatInput,
  [INPUT_RECOVERY_GAS]: I18N.cbam.inputOfExhaustGas,
  [EL_USAGE]: I18N.cbam.electricityUsage,
  [POWER_OUTPUT]: I18N.cbam.powerOutput,
};

/** 是否存在 */
export const EXISTS_ENUM = {
  /** 存在 */
  EXISTS: 1,
  /** 不存在 */
  NOT_EXISTS: 2,
};

/** 是否存在 */
export const EXISTS_OPTION = [
  {
    label: I18N.eca.yes,
    value: EXISTS_ENUM.EXISTS,
  },
  {
    label: I18N.eca.no,
    value: EXISTS_ENUM.NOT_EXISTS,
  },
];

/** 电力来源 */
export const EL_SOURCE_ENUM = {
  /** 单一电力来源 */
  EXISTS: 1,
  /** 多个电力来源 */
  NOT_EXISTS: 2,
};

/** 电力来源 */
export const EL_SOURCE_OPTION = [
  {
    label: I18N.cbam.singlePowerSource,
    value: EL_SOURCE_ENUM.EXISTS,
  },
  {
    label: I18N.cbam.multipleSourcesOfElectricity,
    value: EL_SOURCE_ENUM.NOT_EXISTS,
  },
];

/** 基于非同一来源获取的电力 */
export const EL_SOURCE_DISABLED = '7';
