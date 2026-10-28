import { FACTORY_LEVEL_ENUM } from '../../constant';

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

/** 合并单元格 */
export const sharedOnCell = (record: { emissionElement?: number }) => {
  if (record.emissionElement === FACTORY_LEVEL_ENUM.REASON_USE_DEFAULT) {
    return { colSpan: 0 };
  }

  return {};
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
