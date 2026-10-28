import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';
import { ShowText } from '@/views/cbam/components/ShowText';

import style from './index.module.less';

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
};

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          activityTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.eca.activityData,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          processListIsDefault: {
            type: 'array',
            title: I18N.cbam.factoryProductionVolume,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-component-props': {
              pagination: false,
            },
            'x-decorator-props': {
              gridSpan: 2,
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
            default: [],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.productionRouteName,
                  },
                  properties: {
                    processName: renderEmptySchema(
                      { type: 'string' },
                      {
                        showVal: row => <ShowText text={row.processName} />,
                      },
                    ),
                  },
                },
                columns2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.output,
                  },
                  properties: {
                    emission: renderFormItemSchema({
                      validateTitle: I18N.cbam.output,
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        ...numberPropsData,
                      },
                    }),
                  },
                },
                columns3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.Factors.unit,
                  },
                  properties: {
                    unit: renderFormItemSchema({
                      validateTitle: I18N.Factors.unit,
                      required: false,
                      'x-component': 'PreviewText.Input',
                      'x-reactions': {
                        dependencies: ['unit'],
                        fulfill: {
                          state: {
                            value: `{{ $deps[0] }}`,
                          },
                        },
                      },
                    }),
                  },
                },
              },
            },
          },
          totalVolume: renderFormItemSchema({
            title: I18N.cbam.totalProductionVolume,
            required: false,
            'x-disabled': true,
            'x-component': 'NumberPicker',
            'x-component-props': {
              precision: 6,
              placeholder: I18N.cbam.totalProductionVolume,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['unit'],
              fulfill: {
                state: {
                  title: `{{ textMap?.totalProductionVolume + '（' + $deps[0] + '）' }}`,
                },
              },
            },
          }),
          salesVolume: renderFormItemSchema({
            title: I18N.cbam.externalSalesVolume2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['totalVolume', 'unit'],
              fulfill: {
                schema: {
                  'x-component-props': {
                    max: `{{ $deps[0] }}`,
                  },
                },
                state: {
                  title: `{{ textMap?.externalSalesVolume +'（' + $deps[1] + '）' }}`,
                },
              },
            },
          }),
          salesRatio: renderFormItemSchema({
            title: I18N.cbam.externalSalesRatio2,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.cbam.externalSalesRatio,
            },
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['salesVolume', 'totalVolume'],
              fulfill: {
                state: {
                  value: `{{ ($deps[0] || $deps[0] === 0) && $deps[1] ? $deps[0] / $deps[1] * 100 : '' }}`,
                },
              },
            },
          }),
          processListNotDefault: {
            type: 'array',
            title: I18N.cbam.otherFactoryEmployees,
            'x-component': 'ArrayTable',
            'x-decorator': 'FormItem',
            'x-component-props': {
              pagination: false,
              rowKey: 'relationId',
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            default: [],
            required: false,
            items: {
              type: 'object',
              properties: {
                columns1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.otherProductionWorkers,
                    width: 250,
                  },
                  properties: {
                    processName: renderEmptySchema(
                      { type: 'string' },
                      {
                        showVal: row => <ShowText text={row.processName} />,
                      },
                    ),
                  },
                },
                columns2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.cbam.consumptionAmount,
                  },
                  properties: {
                    emission: renderFormItemSchema({
                      validateTitle: I18N.cbam.consumptionAmount,
                      'x-component': 'NumberPicker',
                      'x-component-props': {
                        ...numberPropsData,
                      },
                      'x-reactions': {
                        dependencies: ['salesRatio'],
                        fulfill: {
                          schema: {
                            'x-disabled': `{{ $deps[0] === 100  || $form.readPretty}}`,
                          },
                          state: {
                            value: `{{ $deps[0] === 100 ? 0 : $self.value }}`,
                          },
                        },
                      },
                    }),
                  },
                },
                columns3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: I18N.Factors.unit,
                  },
                  properties: {
                    unit: renderFormItemSchema({
                      validateTitle: I18N.Factors.unit,
                      required: false,
                      'x-component': 'PreviewText.Input',
                      'x-reactions': {
                        dependencies: ['unit'],
                        fulfill: {
                          state: {
                            value: `{{ $deps[0] }}`,
                          },
                        },
                      },
                    }),
                  },
                },
              },
            },
          },
          nonProduct: renderFormItemSchema({
            title: I18N.cbam.nonCWithinTheFactory2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['salesRatio', 'unit'],
              fulfill: {
                schema: {
                  'x-disabled': `{{ $deps[0] === 100  || $form.readPretty}}`,
                },
                state: {
                  title: `{{ textMap?.nonCWithinTheFactory + '（' + $deps[1] + '）' }}`,
                  value: `{{ $deps[0] === 100 ? 0 : $self.value }}`,
                },
              },
            },
          }),

          errorTips: renderEmptySchema(
            {
              type: 'string',
              'x-decorator-props': {
                gridSpan: 2,
              },
              'x-hidden': true,
            },
            {
              showVal: () => (
                <div className={style.errorTips}>
                  {I18N.cbam.theTotalProductionVolumeShould}
                </div>
              ),
            },
          ),

          emissionTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.eca.emissionData,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          productAttributionList: renderFormItemSchema({
            validateTitle: I18N.eca.emissionData,
            required: false,
            'x-component': 'FormilyProcedureEmissionTable',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),

          fileTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.supplyChainCarbonManagement.evidenceMaterials,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          supportFile: renderFormItemSchema({
            required: false,
            type: 'array',
            'x-component': 'FormilyFileUpload',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),

          unit: renderFormItemSchema({
            title: I18N.Factors.unit,
            required: false,
            default: I18N.Factors.unit,
            'x-component': 'Input',
            'x-disabled': false,
            'x-hidden': true,
          }),
          directEmission: renderFormItemSchema({
            title: I18N.cbam.directEmissions,
            required: false,
            'x-component': 'NumberPicker',
            'x-disabled': false,
            'x-hidden': true,
          }),
          productCategoryId: renderFormItemSchema({
            title: I18N.cbam.productCategoryI,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              precision: 0,
            },
            'x-disabled': false,
            'x-hidden': true,
          }),
          eleCalculatorList: renderFormItemSchema({
            title: I18N.cbam.powerCalculationAndDistribution,
            type: 'array',
            required: false,
            'x-component': 'ArrayTable',
            'x-disabled': false,
            'x-hidden': true,
          }),
          productProcessId: renderFormItemSchema({
            title: I18N.cbam.processId,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              precision: 0,
            },
            'x-disabled': false,
            'x-hidden': true,
          }),
        },
      },
    },
  );
