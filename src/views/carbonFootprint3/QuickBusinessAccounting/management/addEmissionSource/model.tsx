/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-30 18:16:33
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-28 18:41:27
 * @Date: 2023-01-08 11:23:30
 * @@description: 排放源的Schema
 */
import { ISchema, SchemaReactions } from '@formily/react';
import {
  initFormilySelect,
  initFormilyRadio,
  initFormilyInput,
  initFormilyCascader,
  schemaGridColumns,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import {
  addEmissionSourceClasses,
  RegAccountValue,
  RegFActorObjRate,
} from '@src/views/carbonFootprint3/util';
import { MODEL_EMISSION_FACTOR_UNIT } from '@src/views/carbonFootprint3/util/constant';
import { Moment } from 'moment';

const basicFieldReactions: SchemaReactions = {
  dependencies: ['typeExtraWay'],
  fulfill: {
    schema: {
      'x-visible': '{{$deps[0] === 1}}',
    },
  },
};

/** JSON Schema数据 - 基本信息 */
export const addEmissionSourceSchema = (
  stage: string,
  typeExtraWayWidth?: number,
): ISchema => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: typeExtraWayWidth === 2 ? 26 : 50,
        },
        properties: {
          type1: schemaGridColumns('type', {
            type: 'number',
            enum: addEmissionSourceClasses(Number(stage)),
            ...initFormilySelect(I18N.carbonFootprint.type, true),
          }),
          typeExtraWay: schemaGridColumns(
            'typeExtraWay',
            {
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
              ...initFormilyRadio(
                I18N.carbonFootprint3.calculationMethod,
                true,
              ),
              'x-decorator': 'FormItem',
            },
            {
              'x-reactions': [
                {
                  dependencies: ['type'],
                  fulfill: {
                    schema: {
                      'x-visible': '{{$deps[0] === 7}}',
                    },
                  },
                },
              ],
              'x-component-props': {
                gridSpan: typeExtraWayWidth || 1,
              },
            },
          ),
          name: schemaGridColumns(
            'name',
            {
              type: 'string',

              ...initFormilyInput(I18N.carbonFootprint.name, true),
              maxLength: 100,
            },
            {
              'x-reactions': {
                dependencies: ['type', 'typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible': '{{$deps[0] !== 7 || $deps[1] === 3}}',
                  },
                },
              },
            },
          ),
          selectName: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint.name, true, {
              placeholder: I18N.carbonFootprint3.pleaseSelectOrEnter,
            }),
            'x-reactions': [
              {
                dependencies: ['type', 'typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible':
                      '{{$deps[0] === 7 && [1, 2].includes($deps[1])}}',
                  },
                },
              },
              '{{useAsyncProductDataSource()}}',
            ],
          },
          specification: schemaGridColumns(
            'specification',
            {
              type: 'void',
              title: I18N.carbonFootprint3.consumptionQuantity,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'FormGrid',
              'x-decorator-props': {
                asterisk: true,
                feedbackLayout: 'none',
              },

              properties: {
                amount: {
                  ...initFormilyInput(
                    '',
                    true,
                    {
                      placeholder: I18N.carbonFootprint.quantity,
                    },
                    true,
                  ),
                  'x-validator': value => RegAccountValue(value),
                },
                unitData: {
                  type: 'number',
                  // 'x-reactions': ['{{useFieldUnitDictSource ("factorUnitM")}}'],
                  ...initFormilyCascader(
                    '',
                    true,
                    {
                      placeholder: I18N.carbonFootprint.unit,
                    },
                    true,
                  ),
                },
              },
            },
            {
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
                  dependencies: ['type', 'typeExtraWay'],
                  fulfill: {
                    schema: {
                      'x-visible': '{{$deps[1] !== 2 && $deps[1] !== 1}}',
                    },
                  },
                },
              ],
            },
          ),
          /** 运输 - 产品重量 */
          specificationWay2: schemaGridColumns(
            'specificationWay2',
            {
              type: 'void',
              title: I18N.carbonFootprint3.productWeight,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'FormGrid',

              properties: {
                amount2: {
                  ...initFormilyInput(
                    '',
                    true,
                    {
                      placeholder: I18N.carbonFootprint.weight,
                    },
                    true,
                  ),
                  'x-validator': value => RegAccountValue(value),
                },
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
              },
            },
            {
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
            },
          ),
          carryingCapacity: schemaGridColumns(
            'carryingCapacity',
            {
              ...initFormilyInput(I18N.carbonFootprint3.loadRatio, true, {
                addonAfter: '%',
              }),
              'x-validator': value => RegAccountValue(value),
            },
            {
              'x-reactions': {
                dependencies: ['type', 'typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible': '{{$deps[0] === 7 && $deps[1] === 2}}',
                  },
                },
              },
            },
          ),
          distance: schemaGridColumns(
            'distance',
            {
              ...initFormilyInput(
                I18N.carbonFootprint.transportationMileage,
                true,
                {
                  addonAfter: I18N.carbonFootprint3.kilometre,
                },
              ),
              'x-validator': value => RegAccountValue(value),
            },
            {
              'x-reactions': {
                dependencies: ['type', 'typeExtraWay'],
                fulfill: {
                  schema: {
                    'x-visible':
                      '{{$deps[0] === 7 && [1, 2].includes($deps[1])}}',
                  },
                },
              },
            },
          ),
        },
      },
    },
  };
  return data;
};

export const getAccountEmissionFactorSchema: () => ISchema = () => ({
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
            },
            factor: {
              type: 'string',
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
