/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 17:57:52
 * @Date: 2023-03-16 17:47:48
 * @@description:
 */
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyCascader,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { MODEL_EMISSION_MATCH_WAY_ICON } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import RateTitleTooltip from '@src/views/carbonFootprint3/component/RateTitleTooltip';
import { FOOTPRINT3_TOOLTIP_DETAIL } from '@src/views/carbonFootprint3/constant';
import {
  AMOUNT,
  MATCH_WAY,
  MATCH_WAY_LABEL,
  MAX_DECIMAL_PLACE,
  PROCESS_PRODUCT_OUTPUT_TYPE_LABEL,
  PROCESS_PRODUCT_TYPE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import {
  genNumberValidator,
  RegFActorObjRate,
} from '@src/views/carbonFootprint3/util';

import CommonTitleTooltip from '../../CommonTitleTooltip';

const { MAX } = AMOUNT;

const { BY, RECYCLED } = PROCESS_PRODUCT_TYPE;

const { FACTOR, PROCESS_LIB, PROCESS_CREATE } = MATCH_WAY;
const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

type FactorSourceRangeConfig = {
  enableFactorSourceRange?: boolean;
  factorPrefId?: number | string;
};

/** 编辑产品 - 主产品 */
export const getAccessoryMainProductSchema: () => ISchema = () => ({
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
          ...initFormilyInput(I18N.carbonFootprint3.mainProductName2, true),
          'x-validator': [
            genRequiredValidator({
              title: I18N.carbonFootprint3.mainProductName2,
            }),
            genLengthValidator({ max: 100 }),
          ],
          'x-read-pretty': true,
        },
        amountColumn: {
          type: 'void',
          title: I18N.carbonFootprint.quantity,
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
              ...initFormilyInput(I18N.carbonFootprint.quantity, true),
              title: false,
              'x-validator': [
                genRequiredValidator({ title: I18N.carbonFootprint.quantity }),
                genNumberValidator({
                  max: MAX,
                  decimalPlace: MAX_DECIMAL_PLACE,
                }),
              ],
              'x-read-pretty': true,
            },
            unitCode: {
              type: 'string',
              ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
                displayRender: (labels: string[]) => labels?.[1],
              }),
              title: false,
              'x-reactions': [
                '{{useFieldUnitDictSource ("factorUnitM")}}',
                '{{useFieldSetValueByLabel}}',
              ],
              'x-read-pretty': true,
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

/** 编辑产品 - 其他产品 */
export const getAccessoryOtherProductSchema: (
  arrIndex: number,
  onBasicNameChange: (name: string, parentKey: string) => Promise<void>,
  options?: FactorSourceRangeConfig,
) => ISchema = (arrIndex, onBasicNameChange, options) => {
  const { enableFactorSourceRange, factorPrefId } = options || {};

  const factorVisibleReactions = {
    dependencies: [
      `otherProduct${arrIndex}.matchWay`,
      `otherProduct${arrIndex}.type`,
    ],
    fulfill: {
      schema: {
        'x-visible': `{{ $deps[0] != ${PROCESS_LIB} && $deps[1] == ${RECYCLED} }}`,
      },
    },
  };

  const processVisibleReactions = {
    dependencies: [
      `otherProduct${arrIndex}.type`,
      `otherProduct${arrIndex}.matchWay`,
    ],
    fulfill: {
      schema: {
        'x-visible': `{{$deps[1] == ${PROCESS_LIB} && $deps[0] == ${RECYCLED}}}`,
      },
    },
  };

  const processFieldDisabledReactions = {
    dependencies: [
      `otherProduct${arrIndex}.matchWay`,
      `otherProduct${arrIndex}.type`,
    ],
    fulfill: {
      schema: {
        'x-component-props': {
          disabled: `{{$deps[0] !== ${PROCESS_CREATE} && $deps[1] == ${RECYCLED}}}`,
        },
      },
    },
  };
  return {
    type: 'object',
    properties: {
      [`otherProduct${arrIndex}`]: {
        type: 'object',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 20,
        },
        properties: {
          type: {
            type: 'number',
            enum: [
              { value: BY, label: PROCESS_PRODUCT_OUTPUT_TYPE_LABEL[BY] },
              {
                value: RECYCLED,
                label: PROCESS_PRODUCT_OUTPUT_TYPE_LABEL[RECYCLED],
              },
            ],
            ...initFormilySelect(I18N.carbonFootprint3.productType, true),
            default: BY,
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.productName, true, {
              onBlur: val => {
                if (val.target.value) {
                  onBasicNameChange(
                    val.target.value,
                    `otherProduct${arrIndex}`,
                  );
                }
              },
            }),
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
                  genRequiredValidator({
                    title: I18N.carbonFootprint.quantity,
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
                }),
                title: false,
                'x-reactions': [
                  {
                    target: `otherProduct${arrIndex}.factorObjUnitString`,
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
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-reactions': {
              dependencies: [`otherProduct${arrIndex}.type`],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${RECYCLED}  }}`,
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
              dependencies: [`otherProduct${arrIndex}.type`],
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
                ...initFormilyInput(I18N.carbonFootprint.productName, true, {
                  maxLength: 100,
                }),
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
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
                  '{{useFieldSetValueByLabel}}',
                ],
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
              dependencies: [`otherProduct${arrIndex}.type`],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] !== ${RECYCLED} }}`,
                },
              },
            },
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
                `otherProduct${arrIndex}.matchWay`,
                `otherProduct${arrIndex}.type`,
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
