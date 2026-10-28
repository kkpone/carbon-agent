/** 方法枚举 */
export const METHOD_ENUM = {
  /** 斜率法 */
  SLOPE: 4,
  /** 超压法 */
  OVERPRESSURE: 5,
} as const;
const { SLOPE, OVERPRESSURE } = METHOD_ENUM;

/** 方法枚举数组 */
export const METHOD_ENUM_ARR = [SLOPE, OVERPRESSURE];

/** 活动数据单位枚举 */
export const ACTIVITY_UNIT_ENUM = {
  /** t */
  T: 't',
  /** 1000Nm³ */
  NM: '1000Nm3',
} as const;
const { T, NM } = ACTIVITY_UNIT_ENUM;

/** 活动数据单位options */
export const ACTIVITY_UNIT_OPTIONS = [
  {
    label: 't',
    value: T,
  },
  {
    label: '1000Nm3',
    value: NM,
  },
];
