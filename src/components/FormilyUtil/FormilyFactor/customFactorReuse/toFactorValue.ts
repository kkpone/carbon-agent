import { MODEL_EMISSION_MATCH_WAY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { FactorPatternType } from '@src/views/emission/utils/index-type';

import type { FactorObjType } from '../Modal/type';
import type { SavedCustomFactor } from './types';

/** 只映射因子字段，换算比例及排放源数量由现有表单处理。 */
export function toFactorValue(record: SavedCustomFactor): FactorObjType {
  const separator = record.unit.indexOf('/');
  return {
    name: record.name,
    factor: record.factor,
    numeratorUnit:
      separator < 0 ? record.unit : record.unit.slice(0, separator),
    denominatorUnit: separator < 0 ? '' : record.unit.slice(separator + 1),
    institution: record.institution,
    year: record.year ?? '',
    factorPattern: FactorPatternType.ordinaryFactor,
    matchWay: MODEL_EMISSION_MATCH_WAY.FACTOR_CREATE,
  };
}
