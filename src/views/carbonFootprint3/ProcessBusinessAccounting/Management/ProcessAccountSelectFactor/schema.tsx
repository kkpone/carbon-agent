/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-23 18:31:04
 * @Date: 2023-03-06 15:10:07
 * @@description:
 */
import { ISchema } from '@formily/react';
import {
  initFormilySelect,
  // initFormilyRadio,
  initFormilyInput,
  initFormilyCascader,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { MODEL_EMISSION_MATCH_WAY_ICON } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import {
  ALL_EMISSION,
  ALL_EMISSION_LABEL,
  // TRANS_ENUM,
} from '@src/views/carbonFootprint3/constant';
import {
  AMOUNT,
  // CALC_WAY,
  // CALC_WAY_LABEL,
  MAX_DECIMAL_PLACE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import {
  genLengthValidator,
  genRequiredValidator,
} from '@src/views/carbonFootprint3/discharge/process/utils';
import { genNumberValidator } from '@src/views/carbonFootprint3/util';
import {
  PROCESS_BACCOUNT_EMISSION_MATCH_WAY,
  PROCESS_BACCOUNT_EMISSION_MATCH_WAY_LABEL,
} from '@src/views/carbonFootprint3/util/constant';
import { DefaultOptionType } from 'antd/lib/select';

const { FACTOR, SUPPLIER } = PROCESS_BACCOUNT_EMISSION_MATCH_WAY;

const { MAX } = AMOUNT;

// const { PRODUCT_WEIGHT, BEARING_RATIO, ENERGY_CONSUMPTION } = CALC_WAY;
const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

/** 输入 - 基本信息 */
export const processAccountEmissionSourceSchema: (
  onBasicNameChange: (name: string) => void,
  amountDecimalPlace?: number,
) => ISchema = (onBasicNameChange, amountDecimalPlace = MAX_DECIMAL_PLACE) =>
  // const typeExtraFieldReactions: SchemaReactions = {
  //   dependencies: ['type'],
  //   fulfill: {
  //     schema: {
  //       'x-visible': `{{$deps[0] == ${EMISSION_TYPE_OPTIONS.TRANS}}}`,
  //     },
  //   },
  // };

  // const distanceFieldReactions: SchemaReactions = {
  //   dependencies: ['typeExtra.way'],
  //   fulfill: {
  //     schema: {
  //       'x-visible': `{{$deps[0] && $deps[0] != ${CALC_WAY.ENERGY_CONSUMPTION}}}`,
  //     },
  //   },
  // };

  // const typeExtraUnitFieldReactions: SchemaReactions = {
  //   dependencies: ['typeExtra.way'],
  //   fulfill: {
  //     schema: {
  //       'x-visible': `{{$deps[0] == ${CALC_WAY.ENERGY_CONSUMPTION}}}`,
  //     },
  //   },
  // };

  // const typeExtraWeightUnitFieldReactions: SchemaReactions = {
  //   dependencies: ['typeExtra.way'],
  //   fulfill: {
  //     schema: {
  //       'x-visible': `{{$deps[0] == ${CALC_WAY.PRODUCT_WEIGHT}}}`,
  //     },
  //   },
  // };

  ({
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 50,
        },
        properties: {
          type: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint3.inputType, true),
            enum: Object.values(ALL_EMISSION).map(typeValue => ({
              value: typeValue,
              label: ALL_EMISSION_LABEL()[typeValue],
            })),
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.enterName, true, {
              placeholder: I18N.carbonFootprint.name,
              onBlur: val => {
                if (val.target.value) {
                  onBasicNameChange(val.target.value);
                }
              },
            }),
            'x-validator': [
              genRequiredValidator({ title: I18N.carbonFootprint3.enterName }),
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
                    title: I18N.carbonFootprint.quantity,
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
                    when: '{{$self.value?.length > 0}}',
                    fulfill: {
                      state: {
                        value: '{{$self.value}}',
                      },
                    },
                  },
                  '{{useFieldUnitDictSource ("factorUnitM")}}',
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
          // typeExtra: {
          //   type: 'object',
          //   'x-reactions': typeExtraFieldReactions,
          //   properties: {
          //     way: {
          //       type: 'number',
          //       enum: [
          //         {
          //           value: PRODUCT_WEIGHT,
          //           label: CALC_WAY_LABEL[PRODUCT_WEIGHT],
          //         },
          //         {
          //           value: BEARING_RATIO,
          //           label: CALC_WAY_LABEL[BEARING_RATIO],
          //         },
          //         {
          //           value: ENERGY_CONSUMPTION,
          //           label: CALC_WAY_LABEL[ENERGY_CONSUMPTION],
          //         },
          //       ],
          //       ...initFormilyRadio(
          //         I18N.carbonFootprint3.calculationMethod,
          //         true,
          //       ),
          //       'x-reactions': [
          //         {
          //           target: 'factorObjUnitString',
          //           when: '{{$self.value === 2}}',
          //           fulfill: {
          //             state: {
          //               value: 'km',
          //             },
          //           },
          //         },
          //         typeExtraFieldReactions,
          //       ],
          //       default: PRODUCT_WEIGHT,
          //     },
          //     amountColumn: {
          //       type: 'void',
          //       title: I18N.carbonFootprint3.productWeight,
          //       'x-decorator': 'FormItem',
          //       'x-component': 'FormGrid',
          //       'x-reactions': {
          //         fulfill: {
          //           schema: {
          //             'x-decorator-props': {
          //               asterisk: `{{!$form.readPretty}}`,
          //             },
          //           },
          //         },
          //       },
          //       properties: {
          //         amount: {
          //           type: 'number',
          //           ...initFormilyInput(
          //             I18N.carbonFootprint3.productWeight,
          //             true,
          //           ),
          //           title: false,
          //           'x-decorator-props': {
          //             addonAfter: '/',
          //           },
          //           'x-validator': [
          //             genRequiredValidator({
          //               title: I18N.carbonFootprint3.productWeight,
          //             }),
          //             genNumberValidator({
          //               max: MAX,
          //               decimalPlace: MAX_DECIMAL_PLACE,
          //             }),
          //           ],
          //         },
          //         weightUnitCode: {
          //           type: 'string',
          //           ...initFormilySelect(I18N.carbonFootprint.unit, true),
          //           title: false,
          //           enum: TRANS_ENUM,
          //           'x-reactions': [
          //             {
          //               target: 'factorObjUnitString',
          //               when: '{{$self.value}}',
          //               fulfill: {
          //                 state: {
          //                   value: `{{$self.dataSource.find(sourceArr => sourceArr.value === $self.value) ? $self.dataSource.find(sourceArr => sourceArr.value === $self.value).label + 'km' : undefined}}`,
          //                 },
          //               },
          //             },
          //             typeExtraWeightUnitFieldReactions,
          //           ],
          //         },
          //         unitCode: {
          //           type: 'string',
          //           ...initFormilyCascader(I18N.carbonFootprint.unit, true, {
          //             displayRender: (labels: string[]) => labels?.[1],
          //             showSearch: (
          //               inputValue: string,
          //               path: DefaultOptionType[],
          //             ) =>
          //               path.some(
          //                 option =>
          //                   (option.label as string)
          //                     .toLowerCase()
          //                     .indexOf(inputValue.toLowerCase()) > -1,
          //               ),
          //           }),
          //           title: false,
          //           'x-reactions': [
          //             {
          //               target: 'factorObjUnitString',
          //               when: '{{$self.value?.length > 0}}',
          //               fulfill: {
          //                 state: {
          //                   value: '{{$self.value}}',
          //                 },
          //               },
          //             },
          //             '{{useFieldUnitDictSource ("factorUnitM")}}',
          //             '{{useFieldSetValueByLabel}}',
          //             typeExtraUnitFieldReactions,
          //           ],
          //         },
          //       },
          //     },
          //     distance: {
          //       type: 'string',
          //       ...initFormilyInput(
          //         I18N.carbonFootprint3.transportationDistancePublic,
          //         true,
          //       ),
          //       'x-reactions': distanceFieldReactions,
          //       'x-validator': [
          //         genRequiredValidator({
          //           title: I18N.carbonFootprint3.transportationDistance,
          //         }),
          //         genNumberValidator({
          //           max: MAX,
          //           decimalPlace: MAX_DECIMAL_PLACE,
          //         }),
          //       ],
          //     },
          //   },
          // },
        },
      },
    },
  });

export const getProcessAccountEmissionTypeSchema: (
  isDetail: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
) => ISchema = () => ({
  type: 'void',
  properties: {
    matchWay: {
      type: 'number',
      enum: [
        {
          value: FACTOR,
          label: PROCESS_BACCOUNT_EMISSION_MATCH_WAY_LABEL[FACTOR],
          icon: FACTOR_ICON,
        },
      ],
      default: FACTOR,
      'x-reactions': [
        {
          dependencies: ['grid.type'],
          fulfill: {
            schema: {
              'x-hidden': `{{$deps[0] === 7}}`,
            },
          },
        },
        {
          target: 'factorObj',
          fulfill: {
            schema: {
              'x-visible': `{{$self.value != ${SUPPLIER}}}`,
            },
          },
        },
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
