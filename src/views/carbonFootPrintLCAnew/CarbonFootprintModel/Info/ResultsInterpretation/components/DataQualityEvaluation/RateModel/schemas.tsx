import moment, { Moment } from 'moment';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';
import I18N from '@/lang/I18N';

import style from './index.module.less';
import { RATE_TYPE } from '../constant';

const { TIME, AREA, TECH, DATA } = RATE_TYPE;
/** schemas */
export const schema = (rateType?: number) =>
  renderSchemaWithLayout(
    {
      layout: 'inline',
      labelCol: 3,
      wrapperCol: 30,
    },
    {
      grid: {
        ...renderFromGridSchema({
          columns: 1,
        }),
        properties: {
          sourceName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.process,
            required: false,
            'x-component': 'PreviewText',
          }),
          processDataType_name: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.dataType,
            required: false,
            'x-component': 'PreviewText',
          }),
          '[timeRepresentStart, timeRepresentEnd]': renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.timeRepresentativeness,
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
            'x-visible': rateType === TIME,
          }),
          tir: renderFormItemSchema({
            title: 'TiR',
            'x-decorator-props': {
              className: style.radioGroupWrapper,
            },
            'x-component': 'Radio.Group',
            'x-visible': rateType === TIME,
          }),
          area: {
            type: 'void',
            title: I18N.Factors.geographicalRepresentativeness,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-component-props': {
              className: style.gridWrapper,
            },
            'x-visible': rateType === AREA,
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
              areaRepresent: renderFormItemSchema({
                validateTitle: I18N.Factors.geographicalRepresentativeness,
                type: 'number',
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
                },
              }),
            },
          },
          ger: renderFormItemSchema({
            title: 'GeR',
            'x-decorator-props': {
              className: style.radioGroupWrapper,
            },
            'x-component': 'Radio.Group',
            'x-visible': rateType === AREA,
          }),
          techDescription: renderFormItemSchema({
            title: I18N.carbonFootprint.describe,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-visible': rateType === TECH,
          }),
          ter: renderFormItemSchema({
            title: 'TeR',
            'x-decorator-props': {
              className: style.radioGroupWrapper,
            },
            'x-component': 'Radio.Group',
            'x-visible': rateType === TECH,
          }),
          dataDescription: renderFormItemSchema({
            title: I18N.carbonFootprint.describe,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-visible': rateType === DATA,
          }),
          p: renderFormItemSchema({
            title: 'P',
            'x-decorator-props': {
              className: style.radioGroupWrapper,
            },
            'x-component': 'Radio.Group',
            'x-visible': rateType === DATA,
          }),
        },
      },
    },
  );
