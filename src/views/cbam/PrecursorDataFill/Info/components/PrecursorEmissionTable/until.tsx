import {
  FACTORY_LEVEL_ENUM,
  SOURCE_ENUM,
} from '@/views/cbam/ReportForm/Info/ProductData/OutsourcedPrecursor/Info/constant';

const { MEASURE } = SOURCE_ENUM;

const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
} = FACTORY_LEVEL_ENUM;

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
export const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
};

/** 生成对应单位 */
export const generateUnit = (unit: string, emissionElement?: number) => {
  switch (emissionElement) {
    case IMPLIED_EMISSION_DIRECT:
      return `tCO2e/${unit}`;
    case EL_USAGE:
      return `MWh/${unit}`;
    case EL_EMISSION_COEFFICIENT:
      return `tCO2e/MWh`;
    case IMPLIED_EMISSION_INDIRECT:
      return `tCO2e/${unit}`;
    default:
      return '-';
  }
};

/** 初始dataSource */
export const initProductAttributionList = [
  {
    emissionElement: IMPLIED_EMISSION_DIRECT,
    emissionSource: MEASURE,
  },
  {
    emissionElement: EL_USAGE,
    emissionSource: MEASURE,
  },
  {
    emissionElement: EL_EMISSION_COEFFICIENT,
  },
  {
    emissionElement: IMPLIED_EMISSION_INDIRECT,
  },
];
