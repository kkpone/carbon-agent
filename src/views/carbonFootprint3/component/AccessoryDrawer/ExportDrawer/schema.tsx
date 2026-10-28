/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 19:42:07
 * @Date: 2023-03-16 16:33:57
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyCascader,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import RateTitleTooltip from '@src/views/carbonFootprint3/component/RateTitleTooltip';
import { ALL_EMISSION } from '@src/views/carbonFootprint3/constant';
import {
  AMOUNT,
  CORRECT_RATE_MAX_DECIMAL_PLACE,
  CORRECT_RATE_RANGE,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  MAX_DECIMAL_PLACE,
  RECYCLE_RATE_MAX_DECIMAL_PLACE,
  RECYCLE_RATE_RANGE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import {
  genNumberValidator,
  RegFActorObjRate,
} from '@src/views/carbonFootprint3/util';
import { MODEL_EMISSION_FACTOR_UNIT } from '@src/views/carbonFootprint3/util/constant';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { DefaultOptionType } from 'antd/lib/cascader';
import moment, { Moment } from 'moment';

const { MAX } = AMOUNT;

const { FACTOR, FACTOR_CREATE, PROCESS_LIB, PROCESS_CREATE } = MATCH_WAY;

/** 输出 - 输入信息 */
export const getProcessOutPutSchema: (
  arrIndex: number,
  options?: {
    isProcess?: boolean;
    onUnitChange?: () => void;
  },
) => ISchema = (arrIndex, options) => {
  const { isProcess } = options || {};

  const typeExtraFieldReactions: SchemaReactions = {
    dependencies: [`outArr${arrIndex}.type`],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${ALL_EMISSION.RECYCLED_WASTE}}}`,
      },
    },
  };
  const factorVisibleReactions = {
    dependencies: [`outArr${arrIndex}.matchWay`],
    fulfill: {
      schema: {
        'x-visible': `{{ $deps[0] != ${PROCESS_LIB} }}`,
      },
    },
  };

  const factorFieldDisabledReactions = {
    dependencies: [`outArr${arrIndex}.matchWay`],
    fulfill: {
      schema: {
        'x-component-props': {
          disabled: `{{$deps[0] == ${FACTOR}}}`,
        },
      },
    },
  };

  const processVisibleReactions = {
    dependencies: [`outArr${arrIndex}.matchWay`],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[0] == ${PROCESS_LIB}}}`,
      },
    },
  };

  const processFieldDisabledReactions = {
    dependencies: [`outArr${arrIndex}.matchWay`],
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
      processLibId: {
        type: 'string',
        ...initFormilyInput(I18N.carbonFootprint3.selectProcessLibrary, false, {
          disabled: true,
        }),
        'x-hidden': true,
      },
      [`outArr${arrIndex}`]: {
        type: 'object',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 20,
        },
        properties: {
          type: {
            type: 'number',
            ...initFormilySelect(I18N.carbonFootprint3.typeOfOutput, true),
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.outputName, true),
            'x-validator': [
              genRequiredValidator({ title: I18N.carbonFootprint3.enterName }),
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
                title: false,
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint.quantity,
                  }),
                  genNumberValidator({
                    max: MAX,
                    decimalPlace: MAX_DECIMAL_PLACE,
                  }),
                ],
              },
              unitCode: {
                type: 'string',
                ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                  displayRender: (labels: string[]) => labels?.[1],
                  showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                    path.some(
                      option =>
                        (option.label as string)
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) > -1,
                    ),
                  onChange: options?.onUnitChange,
                }),
                title: false,
                'x-reactions': [
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
            },
          },
          typeExtra: {
            type: 'object',
            'x-reactions': typeExtraFieldReactions,
            properties: {
              recycleRate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.regenerationRecoveryRate2,
                  true,
                ),
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.regenerationRecoveryRate,
                  }),
                  genNumberValidator({
                    max: RECYCLE_RATE_RANGE.MAX,
                    decimalPlace: RECYCLE_RATE_MAX_DECIMAL_PLACE,
                    includeMax: true,
                  }),
                ],
              },
              correctRate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.recycledItemQuality,
                  true,
                ),
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.recycledItemQuality,
                  }),
                  genNumberValidator({
                    max: CORRECT_RATE_RANGE.MAX,
                    decimalPlace: CORRECT_RATE_MAX_DECIMAL_PLACE,
                    includeMax: true,
                  }),
                ],
              },
            },
          },
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          selectBtn: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 2,
            },
            properties: {
              matchWay: {
                type: 'number',
                enum: [
                  { value: FACTOR, label: MATCH_WAY_LABEL[FACTOR] },
                  {
                    value: FACTOR_CREATE,
                    label: MATCH_WAY_LABEL[FACTOR_CREATE],
                  },
                ],
                default: FACTOR,
                'x-component': 'FormilySelectAndButton',
                'x-component-props': {
                  onFactorSelect: options?.onUnitChange,
                },
              },
            },
          },
          factorObj: {
            type: 'object',
            'x-reactions': factorVisibleReactions,
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
                required: true,
                title: I18N.carbonFootprint3.numberOfEmissionFactors,
                'x-decorator': 'FormItem',
                'x-component': 'CustomInput',
                'x-component-props': {
                  placeholder: I18N.carbonFootprint3.numberOfEmissionFactors,
                },
                'x-reactions': [
                  factorFieldDisabledReactions,
                  {
                    dependencies: ['.factorPattern', '.ecoinventValueVisible'],
                    fulfill: {
                      schema: {
                        'x-component-props': {
                          hideValue: `{{$deps[0] === "${FactorPatternType.eCoinVent}" && $deps[1] !== true}}`,
                        },
                      },
                    },
                  },
                ],
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
                        onChange: options?.onUnitChange,
                      },
                    ),
                    title: false,
                    'x-reactions': [
                      '{{useFieldUnitDictSource ("factorUnitM")}}',
                      '{{useFieldSetValueByLabel}}',
                      factorFieldDisabledReactions,
                    ],
                  },
                },
              },
              rate: {
                type: 'string',
                ...initFormilyInput('', true, {
                  placeholder: I18N.carbonFootprint.unitConversionRatio4,
                }),
                title: <RateTitleTooltip />,
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
              factorPattern: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-hidden': true,
              },
              ecoinventValueVisible: {
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-hidden': true,
              },
            },
          },
          processProduct: {
            type: 'object',
            'x-reactions': processVisibleReactions,
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
                'x-reactions': [
                  processFieldDisabledReactions,
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
              rate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.unitConversionRatio4,
                  true,
                  {
                    placeholder: I18N.carbonFootprint.unitConversionRatio4,
                  },
                ),
                title: <RateTitleTooltip />,
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
                },
                'x-reactions': processFieldDisabledReactions,
                'x-validator': genRequiredValidator({
                  title: I18N.carbonFootprint3.accountingYear,
                }),
              },
            },
          },
          noData2: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-reactions': {
              dependencies: [`outArr${arrIndex}.matchWay`],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[1] === ${PROCESS_LIB} }}`,
                },
              },
            },
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          filesGrid: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 2,
            },
            'x-visible': !isProcess,
            properties: {
              files: {
                type: 'number',
                'x-decorator': 'FormItem',
                title: uitlNodeTitle(I18N.carbonFootprint3.supportingMaterials),
                'x-validator': {
                  required: false,
                },
                'x-component': 'FormilyFileUpload',
              },
            },
          },
        },
      },
    },
  };
};
