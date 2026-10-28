/* eslint-disable no-restricted-syntax */
/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-05 11:50:44
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-24 11:54:31
 */
import { Form, FormPathPattern, onFieldValueChange } from '@formily/core';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyRadio,
  initFormilyCascader,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { MODEL_EMISSION_FACTOR_UNIT } from '@src/views/carbonFootprint3/util/constant';
import { changeDicts2Options } from '@src/views/utils';
import { uniqBy } from 'lodash-es';
import moment, { Moment } from 'moment';

import {
  PROCESS_PRODUCT_TYPE,
  PROCESS_PRODUCT_TYPE_LABEL,
  AMOUNT,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  PROCESS_LIB_ACCESSORY,
  MAX_DECIMAL_PLACE,
} from './constant';
import { getDictList, getUnitRate } from './service';
import { ProcessLibAccessory, Dicts } from './type';
import {
  EMISSION_TYPE_OPTIONS,
  TRANS_EMISSION_UNIT_LABEL,
} from '../../constant';
import { RegFActorObjRate, genNumberValidator } from '../../util';

const { MAIN, RECYCLED } = PROCESS_PRODUCT_TYPE;

const { MAX } = AMOUNT;

const { FACTOR, FACTOR_CREATE, PROCESS_LIB, PROCESS_CREATE, SUPPLIER } =
  MATCH_WAY;

export const deleteUrlSearchParams = (key: string) => {
  const searchParams = new URLSearchParams(location.search);
  searchParams.delete(key);
  window.history.replaceState(null, '', `?${searchParams.toString()}`);
};
export const onFieldsValueChange = (
  form: Form,
  fieldPathList: FormPathPattern[],
  callback: () => void,
) => {
  const effectId = '__INIT_EFFECT__';
  const fieldValueChangeRecord: Record<string, boolean> = {};

  const checkFieldRecord = () =>
    Object.values(fieldValueChangeRecord).reduce(
      (prev, record) => prev && record,
      true,
    );
  fieldPathList.forEach(fieldPath => {
    const key = fieldPath.toString();
    if (key) {
      fieldValueChangeRecord[fieldPath.toString()] = false;
    }
  });

  if (fieldPathList.length > 0) {
    form.addEffects(effectId, () => {
      fieldPathList.forEach(fieldPath => {
        const key = fieldPath.toString();
        if (key) {
          onFieldValueChange(fieldPath, () => {
            fieldValueChangeRecord[fieldPath.toString()] = true;
            if (checkFieldRecord()) {
              form.removeEffects(effectId);
              callback();
            }
          });
        }
      });
    });
  }
};

export const getUnitValueByLabel = async (unitLabel: string) => {
  let denominatorUnitValue = '';
  let parentDenominatorUnitValue = '';
  try {
    const { data } = await getDictList({ dictTypes: 'factorUnitM' });
    const unitDicts = data.data.factorUnitM;
    const unitOptions: Dicts[] = uniqBy(
      unitDicts.map(u => ({
        ...u,
        label: u.sourceName,
        value: u.sourceType,
        sourceType: u.sourceType,
        children: changeDicts2Options(
          unitDicts.filter(d => d.sourceType === u.sourceType),
        ) as Dicts[] | undefined,
      })),
      'value',
    );
    for (const dict of unitOptions) {
      for (const childDict of dict.children || []) {
        if (childDict.label === unitLabel) {
          denominatorUnitValue = childDict.value;
          parentDenominatorUnitValue = dict.value;
        }
      }
    }
  } catch {}
  return [parentDenominatorUnitValue, denominatorUnitValue];
};

export const calcUnitRate = async (
  form: Form,
  baseUnitFieldPattern?: FormPathPattern,
  setUnitName?: string,
) => {
  const { name, matchWay, type, typeExtra } = form.values;
  const path = baseUnitFieldPattern || 'unitCode';
  let unitName =
    (
      form.getFieldState(path).inputValues as {
        label: string;
      }[][]
    )?.[1]?.[1]?.label || form.getFieldState(path).value;

  // 单独处理运输情况下的tkm kgkm等问题
  if (
    type === EMISSION_TYPE_OPTIONS.TRANS &&
    typeExtra &&
    typeExtra.way === 1
  ) {
    unitName = `${TRANS_EMISSION_UNIT_LABEL[unitName]}km`;
  }

  if (
    matchWay === MATCH_WAY.PROCESS_LIB ||
    matchWay === MATCH_WAY.PROCESS_CREATE
  ) {
    const unitField = form.getFieldState(['processProduct', 'unitCode']);
    const fieldValue: string[] = unitField.value;

    const localDict = localStorage.getItem('FactorUnitDict');
    const localDictPar: Dicts[] = localDict ? JSON.parse(localDict) : undefined;
    const dicInfo = localDictPar.find(dic => dic.dictValue === fieldValue[1]);

    const processLibUnit: string | undefined = dicInfo?.dictLabel;
    if (setUnitName) {
      try {
        const {
          data: { data },
        } = await getUnitRate({
          unitName: setUnitName,
          factorUnit: `/${processLibUnit}`,
          name,
        });
        form.setValuesIn('processProduct.rate', data || undefined);
      } catch {}
    } else if (unitName && typeof unitName === 'string' && processLibUnit) {
      try {
        const {
          data: { data },
        } = await getUnitRate({
          unitName,
          factorUnit: `/${processLibUnit}`,
          name,
        });
        form.setValuesIn('processProduct.rate', data || undefined);
      } catch {}
    }
  } else {
    const unitField = form.getFieldState(['factorObj', 'denominatorUnit']);
    const localDict = localStorage.getItem('FactorUnitDict');
    const fieldValue: string[] = unitField.value;
    const localDictPar: Dicts[] = localDict ? JSON.parse(localDict) : undefined;
    const dicInfo = localDictPar.find(dic => dic.dictValue === fieldValue[1]);

    const factorUnit: string | undefined = dicInfo?.dictLabel;
    if (setUnitName) {
      try {
        const {
          data: { data },
        } = await getUnitRate({
          unitName: setUnitName,
          factorUnit: `/${factorUnit}`,
          name,
        });
        form.setValuesIn('factorObj.rate', data || undefined);
      } catch {}
    } else if (unitName && typeof unitName === 'string' && factorUnit) {
      try {
        const {
          data: { data },
        } = await getUnitRate({
          unitName,
          factorUnit: `/${factorUnit}`,
          name,
        });
        form.setValuesIn('factorObj.rate', data || undefined);
      } catch {}
    }
  }
};

export const genLengthValidator =
  (options: { max: number } | { min: number } | { max: number; min: number }) =>
  (value: string) => {
    const len = value?.length;
    if ('max' in options && 'min' in options) {
      return len <= options.max && len >= options.min
        ? ''
        : I18N.template(I18N.carbonFootprint3.lengthBetweenO, {
            val1: options.min,
            val2: options.max,
          });
    }
    if ('max' in options) {
      return len > options.max
        ? I18N.template(I18N.carbonFootprint3.longestOpt, { val1: options.max })
        : '';
    }
    return len < options.min
      ? I18N.template(I18N.carbonFootprint3.minimumOpt, { val1: options.min })
      : '';
  };

export const genRequiredValidator = (options: {
  title: string;
  isSelect?: boolean;
}) => ({
  required: true,
  message: options.isSelect
    ? I18N.template(I18N.carbonFootprint3.pleaseSelectOp, {
        val1: options.title,
      })
    : I18N.template(I18N.carbonFootprint3.pleaseFillInOp, {
        val1: options.title,
      }),
});

export const genProductBasicSchema: (options?: {}) => ISchema = () => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        columnGap: 20,
      },
      properties: {
        processId: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.processId2, false, {
            disabled: true,
          }),
          'x-hidden': true,
        },
        processLibName: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.processName, false, {
            disabled: true,
          }),
        },
        type: {
          type: 'number',
          enum: [
            { value: MAIN, label: PROCESS_PRODUCT_TYPE_LABEL[MAIN] },
            { value: RECYCLED, label: PROCESS_PRODUCT_TYPE_LABEL[RECYCLED] },
          ],
          ...initFormilyRadio(I18N.carbonFootprint3.productType, true),
          default: MAIN,
        },
        name: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint.productName, true),
          'x-validator': [
            genRequiredValidator({ title: I18N.carbonFootprint.productName }),
            genLengthValidator({ max: 100 }),
          ],
        },
        amountColumn: {
          type: 'void',
          title: I18N.carbonFootprint.quantity,
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'FormGrid',
          'x-reactions': {
            fulfill: {
              schema: {
                'x-decorator-props': {
                  asterisk: `{{!$form.readPretty}}`,
                },
              },
            },
          },
          properties: {
            amount: {
              type: 'number',
              ...initFormilyInput(I18N.carbonFootprint.quantity, true),
              'x-validator': [
                genRequiredValidator({ title: I18N.carbonFootprint.quantity }),
                genNumberValidator({
                  max: MAX,
                  decimalPlace: MAX_DECIMAL_PLACE,
                }),
              ],
              title: false,
            },
            unitCode: {
              type: 'string',
              ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                displayRender: (labels: string[]) => labels?.[1],
              }),
              title: false,
              'x-reactions': [
                '{{useFieldUnitDictSource("factorUnitM")}}',
                '{{useFieldSetValueByLabel}}',
              ],
            },
          },
        },
      },
    },
  },
});

export const genMatchWaySchema: (
  processLibAccessory: ProcessLibAccessory,
) => ISchema = processLibAccessory => {
  let reactions: ISchema['x-reactions'];
  if (processLibAccessory === PROCESS_LIB_ACCESSORY.PRODUCT) {
    reactions = {
      dependencies: ['type'],
      fulfill: {
        schema: {
          'x-visible': `{{$deps[0] == ${RECYCLED}}}`,
        },
      },
    };
  }
  return {
    type: 'void',
    properties: {
      matchWay: {
        type: 'number',
        enum: [
          { value: FACTOR, label: MATCH_WAY_LABEL[FACTOR] },
          { value: PROCESS_LIB, label: MATCH_WAY_LABEL[PROCESS_LIB] },
          { value: FACTOR_CREATE, label: MATCH_WAY_LABEL[FACTOR_CREATE] },
        ],
        default: FACTOR,
        'x-component': 'FormilyButtonSelect',
        'x-reactions': reactions,
      },
    },
  };
};

export const genFactorOrProcessSchema: (
  processLibAccessory: ProcessLibAccessory,
  isProcessBusinessAccount?: boolean,
) => ISchema = (processLibAccessory, isProcessBusinessAccount) => {
  const factorVisibleReactions = {
    dependencies: ['type', 'matchWay'],
    fulfill: {
      schema: {
        'x-visible': `{{${
          processLibAccessory !== PROCESS_LIB_ACCESSORY.PRODUCT
            ? true
            : `$deps[0] == ${RECYCLED}`
        } && $deps[1] != ${PROCESS_LIB}}}`,
      },
    },
  };

  const factorVisibleProcessReactions = {
    dependencies: ['type', 'matchWay'],
    fulfill: {
      schema: {
        'x-visible': `{{ $deps[1] != ${PROCESS_LIB} && $deps[1] != ${PROCESS_CREATE} && $deps[1] != ${SUPPLIER} }}`,
      },
    },
  };

  const factorFieldDisabledReactions = {
    dependencies: ['matchWay'],
    fulfill: {
      schema: {
        'x-component-props': {
          disabled: `{{$deps[0] == ${FACTOR}}}`,
        },
      },
    },
  };

  const processVisibleReactions = {
    dependencies: ['type', 'matchWay'],
    fulfill: {
      schema: {
        'x-visible': `{{${
          processLibAccessory !== PROCESS_LIB_ACCESSORY.PRODUCT
            ? true
            : `$deps[0] == ${RECYCLED}`
        } && $deps[1] == ${PROCESS_LIB}}}`,
      },
    },
  };

  const processAccountVisibleReactions = {
    dependencies: ['type', 'matchWay'],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[1] != ${FACTOR} && $deps[1] != ${FACTOR_CREATE} && $deps[1] != ${SUPPLIER}}}`,
      },
    },
  };

  const processFieldDisabledReactions = {
    dependencies: ['matchWay'],
    fulfill: {
      schema: {
        'x-component-props': {
          disabled: `{{$deps[0] !== ${PROCESS_CREATE}}}`,
        },
      },
    },
  };

  return {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 20,
        },
        properties: {
          factorObj: {
            type: 'object',
            'x-reactions': isProcessBusinessAccount
              ? factorVisibleProcessReactions
              : factorVisibleReactions,
            properties: {
              name: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.emissionFactorName,
                  true,
                ),
                'x-reactions': factorFieldDisabledReactions,
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.emissionFactorName,
                  }),
                  genLengthValidator({ max: 100 }),
                ],
              },
              factor: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.numberOfEmissionFactors,
                  true,
                ),
                'x-reactions': factorFieldDisabledReactions,
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.numberOfEmissionFactors,
                  }),
                  RegFActorObjRate,
                ],
              },
              unitColumn: {
                type: 'void',
                title: I18N.carbonFootprint3.emissionFactorSheet,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'FormGrid',
                'x-reactions': [
                  factorFieldDisabledReactions,
                  {
                    fulfill: {
                      schema: {
                        'x-decorator-props': {
                          asterisk: `{{!$form.readPretty}}`,
                        },
                      },
                    },
                  },
                ],
                properties: {
                  numeratorUnit: {
                    type: 'string',
                    ...initFormilySelect(
                      I18N.carbonFootprint3.molecularUnit,
                      true,
                    ),
                    title: false,
                    'x-component-props': {
                      placeholder: I18N.carbonFootprint3.molecularUnit,
                    },
                    'x-decorator-props': {
                      addonAfter: '/',
                    },
                    enum: MODEL_EMISSION_FACTOR_UNIT,
                    'x-reactions': [factorFieldDisabledReactions],
                  },
                  denominatorUnit: {
                    type: 'string',
                    ...initFormilyCascader(
                      I18N.carbonFootprint3.denominatorUnit,
                      true,
                      {
                        displayRender: (labels: string[]) => labels?.[1],
                      },
                    ),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                      factorFieldDisabledReactions,
                    ],
                  },
                },
              },
              rate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.unitConversionRatio,
                  true,
                ),
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint.unitConversionRatio4,
                  }),
                  RegFActorObjRate,
                ],
              },
              institution: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.emissionFactors2,
                  true,
                ),
                'x-reactions': factorFieldDisabledReactions,
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint.emissionFactors2,
                  }),
                  genLengthValidator({ max: 100 }),
                ],
              },
              year: {
                type: 'string',
                title: I18N.carbonFootprint.yearOfPublication,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  picker: 'year',
                  disabledDate: (value: Moment) =>
                    !(
                      value.isSameOrAfter('1990') &&
                      value.isSameOrBefore(String(moment().year() + 1))
                    ),
                },
                'x-validator': {
                  required: true,
                  message: I18N.carbonFootprint3.pleaseSelectPublish,
                },
                'x-reactions': factorFieldDisabledReactions,
              },
            },
          },
          processProduct: {
            type: 'object',
            'x-reactions': isProcessBusinessAccount
              ? processAccountVisibleReactions
              : processVisibleReactions,
            properties: {
              processName: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.processName, true),
                'x-reactions': processFieldDisabledReactions,
              },
              productName: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint.productName, true),
                'x-reactions': processFieldDisabledReactions,
              },
              unitCode: {
                type: 'string',
                ...initFormilyCascader(
                  I18N.carbonFootprint3.productUnit,
                  true,
                  {
                    displayRender: (labels: string[]) => labels?.[1],
                  },
                ),
                'x-reactions': [
                  processFieldDisabledReactions,
                  '{{useFieldUnitDictSource("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
              rate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.unitConversionRatio,
                  true,
                ),
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint.unitConversionRatio4,
                  }),
                  RegFActorObjRate,
                ],
              },
              accountYear: {
                type: 'string',
                title: I18N.carbonFootprint3.accountingYear,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  picker: 'year',
                  disabledDate: (value: Moment) =>
                    !(
                      value.isSameOrAfter('1990') &&
                      value.isSameOrBefore(String(moment().year() + 1))
                    ),
                },
                'x-reactions': processFieldDisabledReactions,
                'x-validator': genRequiredValidator({
                  title: I18N.carbonFootprint3.accountingYear,
                }),
              },
            },
          },
        },
      },
    },
  };
};
