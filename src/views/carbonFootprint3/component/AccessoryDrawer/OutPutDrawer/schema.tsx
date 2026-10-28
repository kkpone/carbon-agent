/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 20:14:52
 * @Date: 2023-03-16 17:47:48
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyCascader,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import { MODEL_EMISSION_MATCH_WAY_ICON } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { FOOTPRINT3_TOOLTIP_DETAIL } from '@src/views/carbonFootprint3/constant';
import {
  AMOUNT,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  MAX_DECIMAL_PLACE,
  PROCESS_PRODUCT_TYPE,
  PROCESS_PRODUCT_TYPE_LABEL,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import { genNumberValidator } from '@src/views/carbonFootprint3/util';
import { DefaultOptionType } from 'antd/lib/cascader';

import CommonTitleTooltip from '../../CommonTitleTooltip';

const { MAX } = AMOUNT;

const { BY, RECYCLED } = PROCESS_PRODUCT_TYPE;

const { FACTOR, PROCESS_LIB, PROCESS_CREATE } = MATCH_WAY;

const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

type FactorSourceRangeConfig = {
  enableFactorSourceRange?: boolean;
  factorPrefId?: number | string;
};

/** 编辑产出物 - 主产出物 */
export const getAccessoryMainOutPutSchema: (
  isProcess?: boolean,
) => ISchema = isProcess => ({
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
        name: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.mainProductName, true),
          'x-validator': [
            genRequiredValidator({
              title: I18N.carbonFootprint3.mainProductName,
            }),
            genLengthValidator({ max: 100 }),
          ],
        },
        amountColumn: {
          type: 'void',
          title: I18N.carbonFootprint3.outputQuantity,
          'x-decorator': 'FormItem',
          'x-component': 'FormGrid',
          'x-reactions': [
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
            amount: {
              type: 'number',
              ...initFormilyInput(I18N.carbonFootprint3.outputQuantity, true),
              title: false,
              'x-validator': [
                genRequiredValidator({
                  title: I18N.carbonFootprint3.outputQuantity,
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
              }),
              title: false,
              'x-reactions': [
                '{{useFieldUnitDictSource ("factorUnitM")}}',
                '{{useFieldSetValueByLabel}}',
              ],
            },
          },
        },
        shareRate: {
          type: 'string',
          ...initFormilyInput('', false, {
            placeholder: I18N.carbonFootprint3.partitionCoefficient2,
          }),
          title: (
            <CommonTitleTooltip
              title={I18N.carbonFootprint3.partitionCoefficient2}
              tooltip={FOOTPRINT3_TOOLTIP_DETAIL.RATE}
            />
          ),
          default: 100,
          'x-validator': [
            genNumberValidator({
              max: 100,
              decimalPlace: 6,
              includeMax: true,
            }),
          ],
        },
        superiorAmountAndUnit: {
          type: 'void',
          title: I18N.carbonFootprint3.iAmASuperior,
          'x-visible': false,
          'x-decorator': 'FormItem',
          'x-component': 'FormGrid',
          'x-decorator-props': {
            asterisk: false,
          },
          'x-reactions': [
            {
              target: 'noData',
              when: '{{ $self.visible }}',
              fulfill: {
                schema: {
                  state: {
                    visible: false,
                  },
                },
              },
              otherwise: {
                schema: {
                  state: {
                    visible: true,
                  },
                },
              },
            },
          ],
          properties: {
            useAmount: {
              type: 'number',
              ...initFormilyInput(I18N.carbonFootprint3.actualUsage, false),
              title: false,
              'x-validator': [
                genNumberValidator({
                  max: undefined,
                  decimalPlace: 2,
                  includeMax: true,
                }),
              ],
            },
            superiorUnitCode: {
              type: 'string',
              ...initFormilyCascader(I18N.carbonFootprint.unit, false, {
                displayRender: (labels: string[]) => labels?.[1],
                showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                  path.some(
                    option =>
                      (option.label as string)
                        .toLowerCase()
                        .indexOf(inputValue.toLowerCase()) > -1,
                  ),
              }),
              'x-read-pretty': true,
              title: false,
              'x-reactions': [
                '{{useFieldUnitDictSource("factorUnitM")}}',
                '{{useFieldSetValueByLabel}}',
                {
                  dependencies: ['unitCode'],
                  fulfill: {
                    schema: {
                      'x-value': `{{ $deps[0] }}`,
                    },
                  },
                },
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
});

/** 编辑产出物 - 其他产出物 */
export const getAccessoryOtherOutPutSchema: (
  arrIndex: number,
  onBasicNameChange: (name: string, parentKey: string) => Promise<void>,
  options?: {
    isProcess?: boolean;
    isRoot?: boolean;
  } & FactorSourceRangeConfig,
) => ISchema = (arrIndex, onBasicNameChange, options) => {
  const { isProcess, isRoot, enableFactorSourceRange, factorPrefId } =
    options || {};

  const factorVisibleReactions = {
    dependencies: [
      `otherOutPut${arrIndex}.matchWay`,
      `otherOutPut${arrIndex}.type`,
    ],
    fulfill: {
      schema: {
        'x-visible': `{{ $deps[0] != ${PROCESS_LIB} && $deps[1] == ${RECYCLED} }}`,
      },
    },
  };

  return {
    type: 'object',
    properties: {
      [`otherOutPut${arrIndex}`]: {
        type: 'object',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 20,
        },
        properties: {
          parentNodeName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.actualSuperior, true),
            'x-hidden': true,
          },
          type: {
            type: 'number',
            enum: [
              { value: BY, label: PROCESS_PRODUCT_TYPE_LABEL[BY] },
              { value: RECYCLED, label: PROCESS_PRODUCT_TYPE_LABEL[RECYCLED] },
            ],
            ...initFormilySelect(I18N.carbonFootprint3.outputType, true),
            default: BY,
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.nameOfOutput, true, {
              onBlur: val => {
                if (val.target.value) {
                  onBasicNameChange(val.target.value, `otherOutPut${arrIndex}`);
                }
              },
            }),
            'x-validator': [
              genRequiredValidator({
                title: I18N.carbonFootprint3.nameOfOutput,
              }),
              genLengthValidator({ max: 100 }),
            ],
          },
          amountColumn: {
            type: 'void',
            title: I18N.carbonFootprint3.outputQuantity,
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
                ...initFormilyInput(I18N.carbonFootprint3.outputQuantity, true),
                'x-validator': [
                  genRequiredValidator({
                    title: I18N.carbonFootprint3.outputQuantity,
                  }),
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
                    target: `otherOutPut${arrIndex}.factorObjUnitString`,
                    when: '{{$self.value?.length > 0}}',
                    fulfill: {
                      state: {
                        value: '{{$self.value}}',
                      },
                    },
                  },
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
              },
            },
          },
          shareRate: {
            type: 'string',
            ...initFormilyInput('', false, {
              placeholder: I18N.carbonFootprint3.partitionCoefficient2,
            }),
            title: (
              <CommonTitleTooltip
                title={I18N.carbonFootprint3.partitionCoefficient2}
                tooltip={FOOTPRINT3_TOOLTIP_DETAIL.RATE}
              />
            ),
            'x-validator': [
              genNumberValidator({
                max: 100,
                decimalPlace: 6,
                includeMax: true,
              }),
            ],
            'x-reactions': {
              dependencies: [`otherOutPut${arrIndex}.type`],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] !== ${RECYCLED} }}`,
                },
              },
            },
          },
          superiorAmountAndUnit: {
            type: 'void',
            title: I18N.carbonFootprint3.iAmASuperior,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: false,
            },
            'x-visible': false,
            'x-reactions': [
              {
                target: 'noData2',
                when: '{{ $self.visible }}',
                fulfill: {
                  schema: {
                    state: {
                      visible: false,
                    },
                  },
                },
                otherwise: {
                  schema: {
                    state: {
                      visible: true,
                    },
                  },
                },
              },
              {
                dependencies: [
                  `otherOutPut${arrIndex}.type`,
                  `otherOutPut${arrIndex}.parentNodeName`,
                ],
                fulfill: {
                  schema: {
                    'x-visible': `{{ $deps[0] !== ${RECYCLED} && $deps[1] && $deps[1] !== 'undefined' }}`,
                  },
                },
              },
            ],
            properties: {
              useAmount: {
                type: 'number',
                ...initFormilyInput(I18N.carbonFootprint3.actualUsage, false),
                title: false,
                'x-validator': [
                  genNumberValidator({
                    max: undefined,
                    decimalPlace: 2,
                    includeMax: true,
                  }),
                ],
              },
              superiorUnitCode: {
                type: 'string',
                ...initFormilyCascader(I18N.carbonFootprint.unit, false, {
                  displayRender: (labels: string[]) => labels?.[1],
                  showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                    path.some(
                      option =>
                        (option.label as string)
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) > -1,
                    ),
                }),
                'x-read-pretty': true,
                title: false,
                'x-reactions': [
                  '{{useFieldUnitDictSource("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                  {
                    dependencies: [`otherOutPut${arrIndex}.unitCode`],
                    fulfill: {
                      schema: {
                        'x-value': `{{ $deps[0] }}`,
                      },
                    },
                  },
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
            'x-reactions': {
              dependencies: [`otherOutPut${arrIndex}.type`],
              fulfill: {
                schema: {
                  'x-visible': `{{ ($deps[0] === ${BY} && ${isRoot}) ? false : true  }}`,
                },
              },
            },
          },
          selectBtn: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: [`otherOutPut${arrIndex}.type`],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] == ${RECYCLED} }}`,
                },
              },
            },
            properties: {
              matchWay: {
                type: 'number',
                enum: [
                  {
                    value: FACTOR,
                    label: MATCH_WAY_LABEL[FACTOR],
                    icon: FACTOR_ICON,
                  },
                ],
                default: FACTOR,
                'x-component': 'FormilyButtonSelect',
              },
            },
          },
          factorObj: {
            type: 'object',
            'x-reactions': factorVisibleReactions,
            'x-component': 'FormilyFactor',
            'x-component-props': {
              isElementProcess: true,
              enableFactorSourceRange,
              factorPrefId,
            },
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          factorObjUnitString: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.needToBeReplaced, false),
            'x-hidden': true,
          },

          noData2: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-reactions': {
              dependencies: [
                `otherOutPut${arrIndex}.matchWay`,
                `otherOutPut${arrIndex}.type`,
              ],
              fulfill: {
                schema: {
                  'x-visible': `{{ ($deps[0] == ${PROCESS_LIB} || $deps[0] == ${PROCESS_CREATE}) && $deps[1] == ${RECYCLED} }}`,
                },
              },
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
                type: 'Array',
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
