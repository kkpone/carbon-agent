import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';
import { ShowText } from '@/views/cbam/components/ShowText';

import { USE_DEFAULT_ENUM, USE_DEFAULT_OPTIONS } from './constant';
import style from './index.module.less';
import { FILL_WAY_ENUM, FILL_WAY_OPTIONS } from '../../../constant';

const { SUPPLY_FILL } = FILL_WAY_ENUM;

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
};

export const schema = (cbamId?: number) =>
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
            title: I18N.cbam.differentProductionRoutes,
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
                    title: I18N.cbam.orderQuantity,
                  },
                  properties: {
                    emission: renderFormItemSchema({
                      validateTitle: I18N.cbam.orderQuantity,
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
              dependencies: ['unit'],
              fulfill: {
                state: {
                  title: `{{ textMap?.factoryTitle+'（' + $deps[0] + '）' }}`,
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
                  {I18N.cbam.theTotalUsageShouldBe}
                </div>
              ),
            },
          ),

          emissionTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.implicitExclusionOfPrecursors,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          supplierName: renderFormItemSchema({
            title: I18N.carbonFootprint3.supplierName,
            required: false,
            'x-component': 'Input',
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                state: {
                  hidden: `{{ $deps[0] !== ${SUPPLY_FILL} }}`,
                },
              },
            },
          }),
          fillStatus_name: renderFormItemSchema({
            title: I18N.cbam.fillInStatus,
            required: false,
            'x-component': 'Input',
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                state: {
                  hidden: `{{ $deps[0] !== ${SUPPLY_FILL} }}`,
                },
              },
            },
          }),
          isDefault: renderFormItemSchema({
            title: I18N.cbam.whetherToUseMo,
            'x-component': 'Radio.Group',
            enum: USE_DEFAULT_OPTIONS,
            default: USE_DEFAULT_ENUM.NOT_USE,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                state: {
                  disabled: `{{ $deps[0] === ${SUPPLY_FILL} || $form.readPretty }}`,
                },
              },
            },
          }),
          productAttributionList: renderFormItemSchema({
            validateTitle: I18N.eca.emissionData,
            required: false,
            'x-component': 'FormilyPrecursorEmissionTable',
            'x-component-props': {
              cbamId,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-reactions': {
              dependencies: ['manual'],
              fulfill: {
                state: {
                  disabled: `{{ $deps[0] === ${SUPPLY_FILL}|| $form.readPretty  }}`,
                },
              },
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
          manual: renderFormItemSchema({
            title: I18N.cbam.fillInMethod,
            required: false,
            enum: FILL_WAY_OPTIONS,
            'x-component': 'Radio.Group',
            'x-disabled': false,
            'x-hidden': true,
          }),
          defaultReason: renderFormItemSchema({
            title: I18N.cbam.useDefaultValues3,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              precision: 0,
            },
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
        },
      },
    },
  );
