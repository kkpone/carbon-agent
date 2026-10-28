/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 16:25:26
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-03 17:19:36
 */

import {
  inputSchema,
  selectSchema,
  textareaSchema,
} from '@components/FormilyUtil/util';
import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';

const { innerWidth } = window;

const isMinWindow = innerWidth <= 1700;

export const basicSchema = (): ISchema => ({
  type: 'object',

  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        rowGap: 8,
        columnGap: 20,
      },
      properties: {
        accountId: {
          ...selectSchema(I18N.carbonFootprint.accountingProducts, true, {
            maxLength: 100,
          }),
        },
        companyProfile: inputSchema(
          I18N.carbonFootprint3.companyIntroduction,
          true,
          {
            maxLength: 1000,
          },
        ),
        suppose: textareaSchema(
          I18N.carbonFootprint3.carbonFootprintVerification3,
          true,
          {
            maxLength: 2000,
          },
        ),
      },
    },
  },
});

export const dataSchema = (): ISchema => ({
  type: 'object',
  properties: {
    reportActivityList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        className: 'add-report-table-form-item',
      },
      'x-component-props': {
        pagination: false,
      },
      required: true,
      items: {
        type: 'object',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataCategory,
              width: 130,
            },
            properties: {
              dataType: {
                ...selectSchema('', true, {}, true),
                'x-read-pretty': true,
              },
            },
          },
          col2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.activityDataDescription,
            },
            properties: {
              descs: inputSchema(
                I18N.carbonFootprint3.activityDataDescription,
                true,
                {
                  maxLength: 200,
                },
                true,
              ),
            },
          },
          col3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.activityDataClass,
            },
            properties: {
              activityType: selectSchema(
                I18N.carbonFootprint3.activityDataClass,
                true,
                {},
                true,
              ),
            },
          },
        },
      },
    },
  },
});
export const emissiondataSchema = (): ISchema => ({
  type: 'object',
  properties: {
    reportFactoryList: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        className: 'add-report-table-form-item',
      },
      'x-component-props': {
        pagination: false,
        scroll: {
          x: 'max-content',
        },
      },
      required: true,
      items: {
        type: 'object',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataCategory,
              width: 130,
              fixed: 'left',
            },
            properties: {
              dataType: {
                ...selectSchema('', true, {}, true),
                'x-read-pretty': true,
              },
            },
          },
          col2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.emissionFactorDescription,
              width: 192,
            },
            properties: {
              div: {
                type: 'void',
                'x-component': props => (
                  <div style={{ width: 192 }}>{props.children}</div>
                ),
                properties: {
                  descs: inputSchema(
                    I18N.carbonFootprint3.emissionFactorDescription,
                    true,
                    {
                      maxLength: 200,
                    },
                    true,
                  ),
                },
              },
            },
          },
          col3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.timeCorrelation,
            },
            properties: {
              times: selectSchema(
                I18N.carbonFootprint3.timeCorrelation,
                true,
                {
                  allowClear: true,
                },
                true,
              ),
            },
          },
          col4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.regionalRelevance,
            },
            properties: {
              region: selectSchema(
                I18N.carbonFootprint3.regionalRelevance,
                true,
                {
                  allowClear: true,
                  optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                },
                true,
              ),
            },
          },
          col5: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.technicalRelevance,
            },
            properties: {
              technology: selectSchema(
                I18N.carbonFootprint3.technicalRelevance,
                true,
                {
                  allowClear: true,
                  optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                },
                true,
              ),
            },
          },
          col6: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.dataAccuracy,
            },
            properties: {
              datas: selectSchema(
                I18N.carbonFootprint3.dataAccuracy,
                true,
                {
                  allowClear: true,
                  optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                },
                true,
              ),
            },
          },
          col7: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: I18N.carbonFootprint3.methodologySuitability2,
            },
            properties: {
              methodology: selectSchema(
                I18N.carbonFootprint3.methodologySuitability2,
                true,
                {
                  allowClear: true,
                  optionLabelProp: isMinWindow ? 'labelSlice' : 'label',
                },
                true,
              ),
            },
          },
        },
      },
    },
  },
});
