/** 方法枚举 */
export const METHOD_ENUM = {
  /** NO2 */
  NO2: 6,
  /** CO2 */
  CO2: 7,
} as const;
const { NO2, CO2 } = METHOD_ENUM;

/** 方法枚举数组 */
export const METHOD_ENUM_ARR = [NO2, CO2];
