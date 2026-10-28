/*
 * @@description:
 */
import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyInput,
  initFormilySelect,
  initFormilyRadio,
  initFormilyInputTextArea,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { checkEmail } from '@src/utils';
import {
  MODEL_EMISSION_BORDER_TYPE,
  MODEL_EMISSION_BORDER_TYPE_LABEL,
  MODEL_EMISSION_DATA_TYPE,
  MODEL_EMISSION_DATA_TYPE_LABEL,
  MODEL_EMISSION_MATCH_WAY_ICON,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
// import { TRANS_ENUM } from '@src/views/carbonFootprint3/constant';
import {
  // CALC_WAY,
  // CALC_WAY_LABEL,
  // EMISSION_TYPE_OPTIONS,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  MAX_DECIMAL_PLACE,
  AMOUNT,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import { genNumberValidator } from '@src/views/carbonFootprint3/util';
import { DefaultOptionType } from 'antd/lib/cascader';
import moment, { Moment } from 'moment';

import { EMISSION_TYPE_OPTIONS } from '@/views/subModules/CarbonFootprintModel/constant';

const { FACTOR, SUPPLIER } = MATCH_WAY;
// const { PRODUCT_WEIGHT, ENERGY_CONSUMPTION, BEARING_RATIO } = CALC_WAY;
const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;
const { MAX } = AMOUNT;

export const genSupplierSchema: (isShare?: boolean) => ISchema = isShare => {
  const supplierDataIdReaction: SchemaReactions = {
    dependencies: ['supplierObj.id'],
    fulfill: {
      state: {
        componentProps: {
          disabled: `{{$deps[0] != void 0}}`,
        },
      },
    },
  };
  const supplierExpireTimeReaction: SchemaReactions = {
    dependencies: ['supplierObj.id'],
    fulfill: {
      schema: {
        required: `{{$deps[0] == void 0}}`,
      },
      state: {
        componentProps: {
          placeholder: I18N.carbonFootprint3.depsv,
        },
      },
    },
  };
  return {
    type: 'void',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 50,
        },
        properties: {
          supplierObj: {
            type: 'object',
            'x-reactions': [
              {
                dependencies: ['grid.type', 'matchWay'],
                fulfill: {
                  schema: {
                    'x-hidden': `{{$deps[0] === ${EMISSION_TYPE_OPTIONS.TRANS} || $deps[1] !== ${SUPPLIER}}}`,
                  },
                },
              },
            ],
            properties: {
              id: {
                type: 'string',
              },
              factor: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.unitProductScheduling,
                  false,
                  {
                    disabled: true,
                  },
                ),
              },
              unitColumn: {
                type: 'void',
                title: I18N.carbonFootprint.unit,
                'x-decorator': 'FormItem',
                'x-component': 'FormGrid',
                properties: {
                  numeratorUnit: {
                    type: 'number',
                    ...initFormilySelect(
                      I18N.carbonFootprint3.molecularUnit,
                      false,
                      { disabled: true },
                      true,
                    ),
                    'x-decorator-props': {
                      addonAfter: '/',
                    },
                    'x-reactions': `{{useFieldFlattenUnitDictSource('factorUnitZ')}}`,
                  },
                  denominatorUnit: {
                    type: 'string',
                    ...initFormilyCascader(
                      I18N.carbonFootprint3.denominatorUnit,
                      false,
                      {
                        disabled: true,
                        displayRender: (label: string[]) => {
                          if (!label) return '';
                          if (label.length === 2) {
                            return [label[1]];
                          }
                          return label;
                        },
                        showSearch: (
                          inputValue: string,
                          path: DefaultOptionType[],
                        ) =>
                          path.some(
                            option =>
                              (option.label as string)
                                .toLowerCase()
                                .indexOf(inputValue.toLowerCase()) > -1,
                          ),
                      },
                    ),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                    ],
                  },
                },
              },
              year: {
                type: 'string',
                title: I18N.carbonFootprint3.accountingYear2,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  disabled: true,
                  picker: 'year',
                },
              },
              supplierId: {
                type: 'string',
                ...initFormilySelect(I18N.carbonFootprint3.supplierName, true),
                'x-reactions': isShare
                  ? []
                  : ['{{useFieldSupplierSource({status: 1})}}'],
                'x-validator': [
                  (value: unknown) =>
                    typeof value === 'string' && value.length > 100
                      ? I18N.carbonFootprint3.lengthOrEntry
                      : '',
                ],
              },
              email: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint3.eMail, true),
                'x-validator': [
                  {
                    maxLength: 50,
                  },
                  (value: string) =>
                    checkEmail(value)
                      ? ''
                      : I18N.carbonFootprint3.pleaseInputCorrectly,
                ],
              },
              expireTime: {
                type: 'string',
                title: I18N.carbonFootprint3.deadline,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'DatePicker',
                'x-component-props': {
                  disabledDate: (date: Moment) =>
                    !moment(date.format('YYYY-MM-DD')).isSameOrAfter(
                      moment(moment().format('YYYY-MM-DD')),
                    ),
                },
                'x-validator': {
                  required: true,
                  message: I18N.carbonFootprint3.pleaseSelectADeadline,
                },
                'x-reactions': [
                  supplierDataIdReaction,
                  supplierExpireTimeReaction,
                ],
              },
              dataType: {
                type: 'number',
                ...initFormilyRadio(
                  I18N.carbonFootprint3.requestDataClass,
                  true,
                ),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                default: MODEL_EMISSION_DATA_TYPE.RESULT,
                enum: [
                  {
                    value: MODEL_EMISSION_DATA_TYPE.RESULT,
                    label:
                      MODEL_EMISSION_DATA_TYPE_LABEL[
                        MODEL_EMISSION_DATA_TYPE.RESULT
                      ],
                  },
                  {
                    value: MODEL_EMISSION_DATA_TYPE.PROCESS,
                    label:
                      MODEL_EMISSION_DATA_TYPE_LABEL[
                        MODEL_EMISSION_DATA_TYPE.PROCESS
                      ],
                  },
                ],
                'x-reactions': supplierDataIdReaction,
              },
              footBorderType: {
                type: 'number',
                ...initFormilyRadio(
                  I18N.carbonFootprint3.theSystemBoundaryNeedsTo,
                  true,
                ),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                default: MODEL_EMISSION_BORDER_TYPE.HALF,
                enum: [
                  {
                    value: MODEL_EMISSION_BORDER_TYPE.HALF,
                    label:
                      MODEL_EMISSION_BORDER_TYPE_LABEL[
                        MODEL_EMISSION_BORDER_TYPE.HALF
                      ],
                  },
                  {
                    value: MODEL_EMISSION_BORDER_TYPE.WHOLE,
                    label:
                      MODEL_EMISSION_BORDER_TYPE_LABEL[
                        MODEL_EMISSION_BORDER_TYPE.WHOLE
                      ],
                  },
                ],
                'x-reactions': supplierDataIdReaction,
              },
              descr: {
                type: 'string',
                ...initFormilyInputTextArea(
                  I18N.carbonFootprint3.dataRequirementDescription,
                  false,
                ),
                'x-decorator-props': {
                  gridSpan: 3,
                },
                'x-validator': {
                  maxLength: 1000,
                },
                'x-reactions': supplierDataIdReaction,
              },
            },
          },
        },
      },
    },
  };
};

export const genMatchWaySchema: (options?: {
  matchWayOptions?: { value: number; label: string }[];
  defaultMatchWay?: number;
}) => ISchema = options => ({
  type: 'void',
  properties: {
    matchWay: {
      type: 'number',
      enum: options?.matchWayOptions ?? [
        { value: FACTOR, label: MATCH_WAY_LABEL[FACTOR], icon: FACTOR_ICON },
      ],
      default: options?.defaultMatchWay ?? FACTOR,
      'x-reactions': [
        {
          dependencies: ['grid.type'],
          fulfill: {
            schema: {
              'x-hidden': `{{$deps[0] === 7}}`,
            },
          },
        },
        // {
        //   target:
        //     'factorObj.*(name,factor,numeratorUnit,denominatorUnit,institution,year)',
        //   fulfill: {
        //     state: {
        //       componentProps: {
        //         disabled: `{{$self.value == ${FACTOR}}}`,
        //       },
        //     },
        //   },
        // },
        // {
        //   target: 'factorObj',
        //   fulfill: {
        //     schema: {
        //       'x-visible': `{{$self.value != ${SUPPLIER}}}`,
        //     },
        //   },
        // },
        {
          target: 'supplierObj',
          fulfill: {
            schema: {
              'x-visible': `{{$self.value == ${SUPPLIER}}}`,
            },
          },
        },
      ],
      'x-component': 'FormilyButtonSelect',
    },
  },
});

export const genEmissionBasicSchema: (
  onBasicNameChange: (needNew: boolean) => void,
  amountDecimalPlace?: number,
) => ISchema = (onBasicNameChange, amountDecimalPlace = MAX_DECIMAL_PLACE) => ({
  type: 'object',
  properties: {
    emissionId: {
      type: 'string',
    },
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        columnGap: 20,
      },
      properties: {
        type: {
          type: 'string',
          ...initFormilySelect(I18N.carbonFootprint.type, true),
        },
        name: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint.name, true, {
            onBlur: () => onBasicNameChange(true),
          }),
          'x-validator': [
            genRequiredValidator({ title: I18N.carbonFootprint.name }),
            genLengthValidator({ max: 100 }),
          ],
        },
        amountColumn: {
          type: 'void',
          title: I18N.carbonFootprint3.consumptionQuantity,
          'x-decorator': 'FormItem',
          'x-component': 'FormGrid',
          'x-reactions': [
            {
              dependencies: ['.type'],
              fulfill: {
                schema: {
                  'x-decorator-props':
                    '{{$deps[0] === 7 ? {asterisk: false} : { asterisk: true }}}',
                },
              },
            },
          ],
          properties: {
            amount: {
              type: 'number',
              ...initFormilyInput(
                I18N.carbonFootprint3.consumptionQuantity,
                false,
              ),
              title: false,
              'x-validator': [
                genRequiredValidator({
                  title: I18N.carbonFootprint3.consumptionQuantity,
                }),
                genNumberValidator({
                  max: MAX,
                  decimalPlace: amountDecimalPlace,
                }),
              ],
              'x-reactions': [
                {
                  dependencies: ['.type'],
                  fulfill: {
                    schema: {
                      required: '{{$deps[0] === 7 ? false : true }}',
                    },
                  },
                },
              ],
            },
            unitCode: {
              type: 'string',
              ...initFormilyCascader(I18N.carbonFootprint.unit, false, {
                allowClear: false,
                displayRender: (labels: string[]) => labels?.[1],
                showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                  path.some(
                    option =>
                      (option.label as string)
                        .toLowerCase()
                        .indexOf(inputValue.toLowerCase()) > -1,
                  ),
              }),
              title: false,
              'x-reactions': [
                {
                  target: 'factorObjUnitString',
                  when: '{{$self.value && $self.value.length > 0}}',
                  fulfill: {
                    state: {
                      value: '{{$self.value}}',
                    },
                  },
                },
                '{{useFieldUnitDictSource("factorUnitM")}}',
                '{{useFieldSetValueByLabel}}',
                {
                  dependencies: ['.type'],
                  fulfill: {
                    schema: {
                      required: '{{$deps[0] === 7 ? false : true }}',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
});
