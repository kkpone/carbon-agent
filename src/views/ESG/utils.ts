import { Dicts } from '@/hooks/useScope';
import { findUnitLabel } from '@/utils';

import { INDICATOR_UNIT_TYPE } from './constant';
import { Indicator } from './type';

export const getParamUnitLabel = ({
  unitType,
  unit,
  unitDict,
}: {
  unitType: number;
  unit: string[][];
  unitDict: Dicts[];
}) => {
  let unitString = '';

  if (unitType === INDICATOR_UNIT_TYPE.SINGLE) {
    unitString = findUnitLabel(unit[0], unitDict);
  } else if (unitType === INDICATOR_UNIT_TYPE.MULTIPLE) {
    unitString = `${findUnitLabel(unit[0], unitDict)}/${findUnitLabel(
      unit[1],
      unitDict,
    )}`;
  } else if (unitType === INDICATOR_UNIT_TYPE.PERCENT) {
    unitString = '%';
  }

  return unitString;
};

export const isModelIndicator = (indicator: Indicator) => indicator.level === 1;

export const isTopicIndicator = (indicator: Indicator) => indicator.level === 2;

export const isGroupIndicator = (indicator: Indicator) => indicator.level <= 2;

export const isTopLevelIndicator = (indicator: Indicator) =>
  indicator.level === 3;

export const isLeafIndicator = (indicator: Indicator) =>
  indicator.level > 2 && (indicator.children || []).length === 0;
