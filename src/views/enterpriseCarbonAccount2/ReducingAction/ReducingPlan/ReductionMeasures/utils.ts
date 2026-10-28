import I18N from '@src/lang/I18N';
import { AxiosError } from 'axios';
import { ValueOf } from 'type-fest';

import { INPUT_CHAR_PREFIX, PARAM_CHART_SIGN } from '@/components/FormulaInput';

import { validateFormula } from './service';

let formulaValidateReqController: AbortController;

export const formulaValidator = async (
  val: { value: string; label: string }[],
) => {
  if (!val || val.length === 0) {
    return '';
  }

  formulaValidateReqController?.abort();
  formulaValidateReqController = new AbortController();

  try {
    const { data } = await validateFormula(
      {
        variateIds: val
          .filter(({ value }) => !value.startsWith(INPUT_CHAR_PREFIX))
          .map(({ value }) => value.split(PARAM_CHART_SIGN)[0]),
        formulaString: val
          .map(({ value, label }) =>
            value.startsWith(INPUT_CHAR_PREFIX)
              ? label
              : value.split(PARAM_CHART_SIGN)[0],
          )
          .join(''),
      },
      formulaValidateReqController,
    );

    return data.data ? '' : I18N.enterpriseCarbonAccount2.theFormulaIsIllegal;
  } catch (err) {
    if ((err as AxiosError).code === 'ERR_CANCELED') {
      return '';
    }
    throw err;
  }
};

export const findDepDictByValue = (
  dict: { [Key: string]: any }[],
  value: string | number,
  keyMapOpt?: {
    label: string;
    value: string;
    children: string;
  },
) => {
  const keyMap =
    keyMapOpt ||
    ({
      label: 'label',
      value: 'value',
      children: 'children',
    } as const);
  let result = {};
  dict.forEach(item => {
    if (item[keyMap.value] === value) {
      result = item;
      return;
    }
    const children = item[keyMap.children] as { [Key: string]: any }[];
    if (Array.isArray(item[keyMap.children]) && children?.length > 0) {
      children.forEach(child => {
        if (child[keyMap.value] === value) {
          result = child;
        }
      });
    }
  });
  return result as { [Key in ValueOf<typeof keyMap>]: any };
};

export const findCascadeValue = (
  dict: { [Key: string]: any }[],
  value: (string | number)[],
  keyMapOpt?: {
    label: string;
    value: string;
    children: string;
  },
) => {
  const keyMap = keyMapOpt || {
    label: 'label',
    value: 'value',
    children: 'children',
  };
  const category = dict.find(item => item[keyMap.value] === value?.[0]);
  const classify = (
    category?.[keyMap.children] as { [Key: string]: any }[]
  )?.find(item => item[keyMap.value] === value?.[1]);

  return [category, classify];
};
