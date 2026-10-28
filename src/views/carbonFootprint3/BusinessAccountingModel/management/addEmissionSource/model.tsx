/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-10 11:34:05
 * @Date: 2023-01-08 11:23:30
 * @@description: 排放源的Schema
 */
import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilySelect,
  initFormilyRadio,
  initFormilyInput,
  initFormilyCascader,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import {
  addEmissionSourceClasses,
  RegFActorObjRate,
} from '@src/views/carbonFootprint3/util';
import { MODEL_EMISSION_FACTOR_UNIT } from '@src/views/carbonFootprint3/util/constant';
import { Moment } from 'moment';

import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_LABEL,
} from '../../constant';

const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

const basicFieldReactions: SchemaReactions = {
  dependencies: ['typeExtraWay'],
  fulfill: {
    schema: {
      'x-visible': '{{$deps[0] === 1}}',
    },
  },
};

/** JSON Schema数据 - 基本信息 */
export const addEmissionSourceSchema = (stage: string): ISchema => {
  const data = {
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
            type: 'number',
            enum: addEmissionSourceClasses(Number(stage)),
            ...initFormilySelect(I18N.carbonFootprint.type, true),
          },
          typeExtraWay: {
            type: 'number',
            enum: [
              { label: I18N.carbonFootprint3.productByMileage, value: 1 },
              {
                label: I18N.carbonFootprint3.loadCapacityBasedOnMileage,
                value: 2,
              },
              {
                label: I18N.carbonFootprint3.accordingToEnergyConsumption,
                value: 3,
              },
            ],
            default: 1,
            'x-reactions': {
              dependencies: ['type'],
              fulfill: {
                schema: {
                  'x-visible': '{{$deps[0] === 7}}',
                },
              },
            },
            ...initFormilyRadio(I18N.carbonFootprint3.calculationMethod, true),
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.emissionSourceName, true),
            maxLength: 100,
          },
          unitData: {
            type: 'number',
            'x-reactions': [
              // '{{useFieldUnitDictSource ("factorUnitM")}}',
              {
                dependencies: ['type', 'typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible': '{{$deps[0] !== 7 || $deps[1] === 3}}',
                  },
                },
              },
            ],
            ...initFormilyCascader(
              I18N.carbonFootprint3.consumptionQuantity,
              true,
              {
                displayRender: (label: string[]) => {
                  if (!label) return '';
                  if (label.length === 2) {
                    return [label[1]];
                  }
                  return label;
                },
              },
            ),
          },
          /** 运输 - 产品重量 */
          specificationWay2: {
            type: 'void',
            title: I18N.carbonFootprint3.consumptionQuantity,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none',
            },
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
              basicFieldReactions,
            ],
            properties: {
              specificationWay2Numerator: {
                type: 'string',
                enum: [
                  { label: 't', value: 't' },
                  { label: 'kg', value: 'kg' },
                  { label: 'g', value: 'g' },
                ],
                title: false,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-validator': {
                  required: true,
                  message: I18N.carbonFootprint.pleaseSelect,
                },
                'x-component-props': {
                  placeholder: I18N.carbonFootprint.unit,
                },
              },
              specificationWay2Denominator: {
                type: 'string',
                enum: [
                  {
                    label: I18N.carbonFootprint3.kilometre,
                    value: I18N.carbonFootprint3.kilometre,
                  },
                ],
                default: I18N.carbonFootprint3.kilometre,
                title: false,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-disabled': true,
              },
            },
          },
          /** 运输 - 载重比 */
          specificationWay3: {
            type: 'void',
            title: I18N.carbonFootprint3.consumptionQuantity,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none',
            },
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
              {
                dependencies: ['typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible': '{{$deps[0] === 2}}',
                  },
                },
              },
            ],
            properties: {
              specificationWay3Numerator: {
                type: 'string',
                enum: [{ label: '%', value: '%' }],
                default: '%',
                title: false,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-disabled': true,
              },
              specificationWay3Denominator: {
                type: 'string',
                enum: [
                  {
                    label: I18N.carbonFootprint3.kilometre,
                    value: I18N.carbonFootprint3.kilometre,
                  },
                ],
                default: I18N.carbonFootprint3.kilometre,
                title: false,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-disabled': true,
              },
            },
          },
        },
      },
    },
  };
  return data;
};

/**
 * @description: 选择因子和新建因子的按钮
 */
export const getModelEmissionTypeSchema: (
  isDetail: boolean,
) => ISchema = isDetail => ({
  type: 'void',
  properties: {
    matchWay: {
      type: 'number',
      enum: [
        {
          value: FACTOR,
          label: MODEL_EMISSION_MATCH_WAY_LABEL()[FACTOR],
        },
        {
          value: FACTOR_CREATE,
          label: MODEL_EMISSION_MATCH_WAY_LABEL()[FACTOR_CREATE],
        },
      ],
      default: FACTOR,
      'x-reactions': {
        target: 'factorObj.*(name,factor,unitColumn,institution,year)',
        when: '{{$self.value === 1}}',
        fulfill: {
          state: {
            disabled: true,
          },
        },
        otherwise: {
          state: {
            disabled: !!isDetail,
          },
        },
      },
      'x-component': 'FormilyButtonSelect',
    },
  },
});

export const getModelEmissionFactorSchema: () => ISchema = () => ({
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
        factorObj: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              ...initFormilyInput(
                I18N.carbonFootprint3.emissionFactorName,
                true,
              ),
              maxLength: 100,
              // 'x-reactions': {
              //   when: '{{$self.value.length > 20 && $form.readPretty}}',
              //   fulfill: {
              //     schema: {
              //       'x-component': data => (
              //         <div
              //           style={{
              //             backgroundColor: '#f7f8f9',
              //             width: '100%',
              //             overflow: 'hidden',
              //             whiteSpace: 'nowrap',
              //             textOverflow: 'ellipsis',
              //             wordBreak: 'break-all',
              //             padding: '0 10px',
              //             fontWeight: 500,
              //           }}
              //         >
              //           <TextOverflowTable value={data.value} maxLength={20} />
              //         </div>
              //       ),
              //     },
              //   },
              // },
            },
            factor: {
              type: 'number',
              ...initFormilyInput(
                I18N.carbonFootprint3.numberOfEmissionFactors,
                true,
              ),
              'x-validator': value => RegFActorObjRate(value),
            },
            unitColumn: {
              type: 'void',
              title: I18N.carbonFootprint3.emissionFactorSheet,
              required: true,
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
                numeratorUnit: {
                  type: 'number',
                  enum: MODEL_EMISSION_FACTOR_UNIT,
                  ...initFormilySelect(
                    I18N.carbonFootprint3.molecularUnit,
                    true,
                    {},
                    true,
                  ),
                  'x-decorator-props': {
                    addonAfter: '/',
                  },
                },
                denominatorUnit: {
                  type: 'string',
                  ...initFormilyCascader(
                    I18N.carbonFootprint3.denominatorUnit,
                    true,
                    {
                      displayRender: (label: string[]) => {
                        if (!label) return '';
                        if (label.length === 2) {
                          return [label[1]];
                        }
                        return label;
                      },
                    },
                  ),
                  title: false,
                  'x-reactions': ['{{useFieldSetValueByLabel}}'],
                },
              },
            },
            rate: {
              type: 'string',
              ...initFormilyInput(
                I18N.carbonFootprint3.unitConversionRatio,
                true,
                {
                  placeholder: I18N.carbonFootprint.unitConversionRatio4,
                },
              ),
              'x-validator': value => RegFActorObjRate(value),
            },
            institution: {
              type: 'string',
              ...initFormilyInput(I18N.carbonFootprint.emissionFactors2, true),
              maxLength: 100,
            },
            year: {
              type: 'string',
              title: I18N.carbonFootprint.yearOfPublication,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'DatePicker',
              'x-component-props': {
                disabledDate: (current: Moment) => {
                  if (current.year() >= 1990) return false;
                  return true;
                },

                picker: 'year',
              },
              'x-validator': {
                required: true,
                message: I18N.carbonFootprint3.pleaseSelectPublish,
              },
            },
          },
        },
      },
    },
  },
});
