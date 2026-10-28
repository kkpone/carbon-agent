/** 方法枚举 */
export const METHOD_ENUM = {
  /** 燃烧 */
  BURNING: 1,
  /** 工艺排放 */
  PROCESS_EMISSION: 2,
  /** 物料平衡 */
  MATERIAL_BALANCE: 3,
} as const;
const { BURNING, PROCESS_EMISSION, MATERIAL_BALANCE } = METHOD_ENUM;
/** 方法枚举数组 */
export const METHOD_ENUM_ARR = [BURNING, PROCESS_EMISSION, MATERIAL_BALANCE];

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

/** 排放系数单位options-当活动数据单位选t时 */
export const EMISSION_FACTOR_UNIT_OPTIONS_T = [
  {
    label: 'tCO2/t',
    value: 'tCO2/t',
  },
  {
    label: 'tCO2/TJ',
    value: 'tCO2/TJ',
  },
];

/** 排放系数单位options-当活动数据单位选1000Nm³时 */
export const EMISSION_FACTOR_UNIT_OPTIONS_N = [
  {
    label: 'tCO2/1000Nm3',
    value: 'tCO2/1000Nm3',
  },
  {
    label: 'tCO2/TJ',
    value: 'tCO2/TJ',
  },
];
