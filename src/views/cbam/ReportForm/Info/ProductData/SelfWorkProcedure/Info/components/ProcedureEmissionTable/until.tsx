import { DEFAULT_ENUM } from '../../../../constant';
import { ELEMENT_ENUM, EXISTS_ENUM } from '../../constant';

const { EXISTS, NOT_EXISTS } = EXISTS_ENUM;
const { YES } = DEFAULT_ENUM;

const {
  DIRECT_EMISSION,
  THERMAL_INPUT_OUTPUT,
  INPUT_RECOVERY_GAS,
  EL_USAGE,
  POWER_OUTPUT,
} = ELEMENT_ENUM;

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
export const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
};

/** 初始电力计算配置数据 */
export const initEleCalculatorList = (
  cbamId?: number,
  productProcessId?: number,
) => [
  {
    coefficient: null,
    eleValue: null,
    cbamId,
    productProcessId,
  },
  {
    coefficient: null,
    eleValue: null,
    cbamId,
    productProcessId,
  },
  {
    coefficient: null,
    eleValue: null,
    cbamId,
    productProcessId,
  },
  {
    coefficient: null,
    eleValue: null,
    cbamId,
    productProcessId,
  },
  {
    coefficient: null,
    eleValue: null,
    cbamId,
    productProcessId,
  },
];

/** 初始dataSource */
export const initProductAttributionList = (cbamId?: number) => [
  {
    emissionElement: DIRECT_EMISSION,
    cbamId,
    isProcess: YES,
  },
  {
    emissionElement: THERMAL_INPUT_OUTPUT,
    cbamId,
    isProcess: YES,
    isExists: NOT_EXISTS,
  },
  {
    emissionElement: INPUT_RECOVERY_GAS,
    cbamId,
    isProcess: YES,
    isExists: NOT_EXISTS,
  },
  {
    emissionElement: EL_USAGE,
    cbamId,
    isProcess: YES,
  },
  {
    emissionElement: POWER_OUTPUT,
    cbamId,
    isProcess: YES,
    isExists: EXISTS,
  },
];
