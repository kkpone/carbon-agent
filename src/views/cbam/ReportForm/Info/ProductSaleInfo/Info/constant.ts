import I18N from '@src/lang/I18N';

/** 是否煅烧枚举 */
export const CALCINE_ENUM = {
  /** 是 */
  TRUE: 1,
  /** 否 */
  FALSE: 2,
} as const;
const { TRUE, FALSE } = CALCINE_ENUM;

/** 是否煅烧枚举options */
export const CALCINE_OPTIONS = [
  {
    label: I18N.eca.yes,
    value: TRUE,
  },
  {
    label: I18N.eca.no,
    value: FALSE,
  },
];

/** 非固定字段名称 */
export enum ConfigFields {
  'reducing',
  'steelCode',
  'mnPer',
  'crPer',
  'niPer',
  'alloyPer',
  'cper',
  'materialPer',
  'steelScrap',
  'wasteMaterial',
  'alUse',
  'nonAl',
  'clinker',
  'calcine',
  'solution',
  'nitric',
  'urea',
  'nitrogen',
  'ammonium',
  'noPer',
  'urPer',
  'organic',
}

/** 非固定字段名称 */
export const configFieldsArray = Object.values(ConfigFields).filter(
  field => typeof field === 'string',
);
