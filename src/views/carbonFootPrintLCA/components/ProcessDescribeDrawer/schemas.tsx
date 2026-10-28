import I18N from '@src/lang/I18N';
import moment, { Moment } from 'moment';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

import { DATA_TYPE, REPORT_DISCLOSURE } from './constant';
import style from './index.module.less';

/** 过程描述schemas-基本信息 */
export const processSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          lifeCycleId: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.lifeCycleStage,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Radio.Group',
          }),
          processName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.processName,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          processDesc: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.processDescription,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 1000,
            },
          }),
        },
      },
    },
  );

/** 过程描述schemas-其他非必填项 */
export const otherSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          systemBoundary: renderFormItemSchema({
            title: I18N.Factors.systemBoundary,
            required: false,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 200,
            },
          }),
          '[timeRepresentStart, timeRepresentEnd]': renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.timeRepresentativeness,
            required: false,
            'x-component': 'DatePicker.RangePicker',
            'x-component-props': {
              placeholder: [
                I18N.carbonData.startingYear,
                I18N.carbonData.endYear,
              ],
              className: style.datePicker,
              picker: 'year',
              disabledDate: (current: Moment) =>
                (current && current < moment('1990')) ||
                (current && current > moment()),
            },
          }),
          area: {
            type: 'void',
            title: I18N.Factors.geographicalRepresentativeness,
            required: false,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            properties: {
              areaRepresent: renderFormItemSchema({
                validateTitle: I18N.Factors.geographicalRepresentativeness,
                type: 'number',
                required: false,
                'x-component': 'Select',
                'x-component-props': {
                  showSearch: true,
                  optionFilterProp: 'label',
                  allowClear: true,
                },
              }),
              areaRepresentDetail: renderFormItemSchema({
                validateTitle: I18N.Factors.detailedAddress,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: 100,
                  placeholder: I18N.Factors.detailedAddress,
                },
              }),
            },
          },
          techRepresent: renderFormItemSchema({
            title: I18N.Factors.technicalRepresentativeness,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          multiOutputType: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.multiOutputAllocation2,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              allowClear: true,
              maxLength: 200,
            },
          }),
          processDataType: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.dataType,
            'x-component': 'Radio.Group',
            default: DATA_TYPE.REALISTIC_DATA,
          }),
          dataSource: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.dataSources,
            required: false,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          reportFlag: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.reportDisclosure,
            required: false,
            'x-component': 'Radio.Group',
            enum: [
              {
                label: I18N.eca.yes,
                value: REPORT_DISCLOSURE.YES,
              },
              {
                label: I18N.eca.no,
                value: REPORT_DISCLOSURE.NO,
              },
            ],
            default: REPORT_DISCLOSURE.YES,
          }),
        },
      },
    },
  );
