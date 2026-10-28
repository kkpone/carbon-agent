/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 11:24:40
 * @Date: 2023-03-14 11:17:07
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
  PROCESS_PRODUCT_TYPE_LABEL,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import {
  genNumberValidator,
  RegFActorObjRate,
} from '@src/views/carbonFootprint3/util';
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

/**
 * 基本信息
 */
export const getProcessBasicSchema: (
  isProcessAccountRoot?: boolean,
  isOnlyDetail?: boolean,
) => ISchema = (isProcessAccountRoot, isOnlyDetail) => ({
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
        id: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.processId, false),
          'x-hidden': true,
        },
        reSelect: {
          type: 'string',
          ...initFormilyInput(
            I18N.carbonFootprint3.afterTheSelectionProcess,
            false,
          ),
          'x-hidden': true,
        },
        name: {
          type: 'string',
          ...initFormilyInput(
            I18N.carbonFootprint3.processName,
            !isProcessAccountRoot,
          ),
          'x-validator': [
            genRequiredValidator({ title: I18N.carbonFootprint3.processName }),
            genLengthValidator({ max: 100 }),
          ],
          'x-read-pretty': isOnlyDetail || isProcessAccountRoot || false,
        },
        productErea: {
          type: 'string',
          ...initFormilyInput(I18N.carbonFootprint3.producingArea, false),
          'x-validator': [
            genRequiredValidator({
              title: I18N.carbonFootprint3.producingArea,
            }),
            genLengthValidator({ max: 100 }),
          ],
        },
      },
    },
  },
});

/**
 * 产品信息 - 主产品
 */
export const getProcessMainProductSchema: (
  isProcessAccountRoot?: boolean,
  isProcessLibRoot?: boolean,
  isProcess?: boolean,
  isOnlyDetail?: boolean,
) => ISchema = (
  isProcessAccountRoot,
  isProcessLibRoot,
  isProcess,
  isOnlyDetail,
) => {
  const titleText = isProcessAccountRoot
    ? I18N.carbonFootprint3.product
    : I18N.carbonFootprint3.output2;

  const amountText = isProcessAccountRoot
    ? I18N.carbonFootprint.quantity
    : I18N.carbonFootprint3.outputQuantity;

  const mainReadPretty = isOnlyDetail || isProcessAccountRoot || false;

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
          name: {
            type: 'string',
            ...initFormilyInput(
              I18N.template(I18N.carbonFootprint3.mainTitle, {
                val1: titleText,
              }),
              true,
            ),
            'x-validator': [
              genRequiredValidator({
                title: I18N.template(I18N.carbonFootprint3.mainTitle, {
                  val1: titleText,
                }),
              }),
              genLengthValidator({ max: 100 }),
            ],
            'x-read-pretty': mainReadPretty,
          },
          amountColumn: {
            type: 'void',
            title: amountText,
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
                ...initFormilyInput(amountText, true),
                title: false,
                'x-validator': [
                  genRequiredValidator({ title: amountText }),
                  genNumberValidator({
                    max: MAX,
                    decimalPlace: MAX_DECIMAL_PLACE,
                  }),
                ],
                'x-read-pretty': mainReadPretty,
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
                'x-read-pretty': mainReadPretty,
              },
            },
          },

          shareRate: {
            type: 'string',
            ...initFormilyInput('', false, {
              placeholder: I18N.carbonFootprint3.partitionCoefficient2,
            }),
            default: 100,
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
  };
};

/** 产品信息 - 其他产品 */
export const getProcessOtherProductSchema: (
  arrIndex: number,
  onBasicNameChange: (name: string, parentKey: string) => Promise<void>,
  options?: {
    isProcessAccountRoot?: boolean;
    isProcessLibRoot?: boolean;
    isProcess?: boolean;
    isOnlyDetail?: boolean;
  } & FactorSourceRangeConfig,
) => ISchema = (arrIndex, onBasicNameChange, options) => {
  const {
    isProcessAccountRoot,
    isProcessLibRoot,
    isProcess,
    enableFactorSourceRange,
    factorPrefId,
  } = options || {};

  const titleText = isProcessAccountRoot
    ? I18N.carbonFootprint3.product
    : I18N.carbonFootprint3.output2;

  const amountText = isProcessAccountRoot
    ? I18N.carbonFootprint.quantity
    : I18N.carbonFootprint3.outputQuantity;
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
        'x-read-pretty': `{{$deps[0] !== ${PROCESS_CREATE} && $deps[1] == ${RECYCLED}}}`,
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
          parentNodeName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.actualSuperior, true),
            'x-hidden': true,
          },
          type: {
            type: 'number',
            enum: isProcessAccountRoot
              ? [
                  { value: BY, label: PROCESS_PRODUCT_OUTPUT_TYPE_LABEL[BY] },
                  {
                    value: RECYCLED,
                    label: PROCESS_PRODUCT_OUTPUT_TYPE_LABEL[RECYCLED],
                  },
                ]
              : [
                  { value: BY, label: PROCESS_PRODUCT_TYPE_LABEL[BY] },
                  {
                    value: RECYCLED,
                    label: PROCESS_PRODUCT_TYPE_LABEL[RECYCLED],
                  },
                ],
            ...initFormilySelect(
              I18N.template(I18N.carbonFootprint3.title2, { val1: titleText }),
              true,
            ),
            default: BY,
          },
          name: {
            type: 'string',
            ...initFormilyInput(
              I18N.template(I18N.carbonFootprint3.title, { val1: titleText }),
              true,
              {
                onBlur: val => {
                  if (val.target.value) {
                    onBasicNameChange(
                      val.target.value,
                      `otherProduct${arrIndex}`,
                    );
                  }
                },
              },
            ),

            'x-validator': [
              genRequiredValidator({
                title: I18N.template(I18N.carbonFootprint3.title, {
                  val1: titleText,
                }),
              }),
              genLengthValidator({ max: 100 }),
            ],
          },
          amountColumn: {
            type: 'void',
            title: amountText,
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
                ...initFormilyInput(amountText, true),
                'x-validator': [
                  genRequiredValidator({ title: amountText }),
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
                    target: `otherProduct${arrIndex}.factorObjUnitString`,
                    when: '{{$self.value && $self.value.length > 0}}',
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
              dependencies: [`otherProduct${arrIndex}.type`],
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
            'x-reactions': {
              dependencies: [
                `otherProduct${arrIndex}.type`,
                `otherProduct${arrIndex}.parentNodeName`,
              ],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] == ${BY} && $deps[1] && $deps[1] !== 'undefined' }}`,
                },
              },
            },
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
                    dependencies: [`otherProduct${arrIndex}.unitCode`],
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
          noData3: {
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
                  'x-visible': `{{ $deps[0] === ${RECYCLED} }}`,
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
            properties: {
              noMatchFactor: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.firstTimeMismatch,
                  false,
                ),
                'x-hidden': true,
              },
              name: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.emissionFactorName,
                  false,
                ),
                'x-hidden': true,
              },
              factor: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.numberOfEmissionFactors,
                  false,
                ),
                'x-hidden': true,
              },
              numeratorUnit: {
                type: 'number',
                ...initFormilyInput(I18N.carbonFootprint3.molecularUnit, false),
                'x-hidden': true,
              },
              denominatorUnit: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.denominatorUnit,
                  false,
                ),
                'x-hidden': true,
              },
              unit: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.integrateMolecularComponents,
                  false,
                ),
                'x-hidden': true,
              },
              rate: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.unitConversionRatio4,
                  false,
                ),
                'x-hidden': true,
              },
              institution: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.emissionFactors2,
                  false,
                ),
                'x-hidden': true,
              },
              year: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.yearOfPublication,
                  false,
                ),
                'x-hidden': true,
              },
              matchWay: {
                type: 'number',
                ...initFormilyInput(
                  I18N.carbonFootprint3.matchingMethod,
                  false,
                ),
                'x-hidden': true,
              },
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
          noData2: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
            'x-reactions': {
              dependencies: [
                `otherProduct${arrIndex}.type`,
                `otherProduct${arrIndex}.superiorAmountAndUnit`,
              ],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] !== ${RECYCLED} && ${!isProcessAccountRoot} && ${!isProcessLibRoot} && ${!isProcess} }}`,
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
