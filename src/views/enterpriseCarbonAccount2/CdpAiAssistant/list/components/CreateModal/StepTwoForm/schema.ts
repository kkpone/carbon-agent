import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';
import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';
import { isUndefined } from 'lodash-es';
import moment from 'moment';

export interface IStepTwoFormValues {
  reportStart: string;
  reportEnd: string;
  baseYearStart: string;
  baseYearEnd: string;
  totalRevenue: string;
  currency: string;
  scope1Emissions: string;
  scope2EmissionsLocation: string;
  scope2EmissionsMarket: string;
  scope3Emission: string[];
  scope4E: {
    [key: string]: string;
  };
}

/** 基本信息Schema */
export const baseInfoSchema = (params: {
  scopeThreeCategoryList?: {
    dictLabel: string;
    dictValue: string;
  }[];
}) => {
  const { scopeThreeCategoryList } = params;
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 32,
        },
        properties: {
          '[reportStart,reportEnd]': {
            type: ' string',
            title: I18N.enterpriseCarbonAccount2.annualReportingCycle,
            default: [
              moment(new Date(new Date().getFullYear() - 1, 0, 1)).format(
                'YYYY-MM-DD',
              ),
              moment(new Date(new Date().getFullYear() - 1, 11, 31)).format(
                'YYYY-MM-DD',
              ),
            ],
            'x-decorator': 'FormItem',
            'x-component': 'DatePicker.RangePicker',
          },
          '[baseYearStart,baseYearEnd]': {
            type: ' string',
            title: I18N.enterpriseCarbonAccount2.baseYearCycle,
            'x-decorator': 'FormItem',
            'x-component': 'DatePicker.RangePicker',
          },
          '[totalRevenue, currency]': {
            type: 'string',
            title: I18N.enterpriseCarbonAccount2.reportYearTotalBusiness,
            'x-decorator': 'FormItem',
            'x-component': 'InputGroup',
            'x-reactions': [
              '{{useFieldFlattenUnitDictSource("cdp_currency")}}',
            ],
            'x-validator': [
              {
                triggerType: 'onBlur',
                validator: (v: [string, string]) =>
                  isUndefined(v[0]) ||
                  (Number(v[0]) >= 0 && Number(v[0]) <= 999999999999),
                message:
                  I18N.enterpriseCarbonAccount2
                    .thisValueShouldBeWithinTheRangeOf,
              },
            ],
          },
          scope1Emissions: {
            type: 'string',
            title: I18N.enterpriseCarbonAccount2.reportYearScope4,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              addonAfter: 'tCO₂e',
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterTheReport2,
              max: 999999999999,
              min: 0,
            },
            'x-validator': [
              {
                triggerType: 'onBlur',
                validator: (v: string) =>
                  isUndefined(v) ||
                  (Number(v) >= 0 && Number(v) <= 999999999999),
                message:
                  I18N.enterpriseCarbonAccount2
                    .thisValueShouldBeWithinTheRangeOf,
              },
            ],
          },
          scope2EmissionsLocation: {
            type: 'string',
            'x-decorator-props': { gridSpan: 2 },
            title: titleTip(
              I18N.enterpriseCarbonAccount2.reportYearScope3,
              undefined,
              undefined,
              I18N.enterpriseCarbonAccount2.basedOnPositionalReality,
            ),
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              max: 999999999999,
              min: 0,
              addonAfter: 'tCO₂e',
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterTheReport,
            },
            'x-validator': [
              {
                triggerType: 'onBlur',
                validator: (v: string) =>
                  isUndefined(v) ||
                  (Number(v) >= 0 && Number(v) <= 999999999999),
                message:
                  I18N.enterpriseCarbonAccount2
                    .thisValueShouldBeWithinTheRangeOf,
              },
            ],
          },
          scope2EmissionsMarket: {
            type: 'string',
            'x-decorator-props': { gridSpan: 2 },
            title: titleTip(
              I18N.enterpriseCarbonAccount2.reportYearScope3,
              undefined,
              undefined,
              I18N.enterpriseCarbonAccount2.basedOnMarketRanking,
            ),
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              addonAfter: 'tCO₂e',
              placeholder: I18N.enterpriseCarbonAccount2.pleaseEnterTheReport,
              max: 999999999999,
              min: 0,
            },
            'x-validator': [
              {
                triggerType: 'onBlur',
                validator: (v: string) =>
                  isUndefined(v) ||
                  (Number(v) >= 0 && Number(v) <= 999999999999),
                message:
                  I18N.enterpriseCarbonAccount2
                    .thisValueShouldBeWithinTheRangeOf,
              },
            ],
          },
          scope3Emission: {
            type: 'string',
            'x-decorator-props': { gridSpan: 2 },
            title: I18N.enterpriseCarbonAccount2.scopeThree2,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              mode: 'multiple',
              disabled: 'true',
              placeholder:
                I18N.enterpriseCarbonAccount2.pleaseSelectTheOneThatInvolves,
            },
            enum: scopeThreeCategoryList?.map(item => ({
              label: item.dictLabel,
              value: item.dictValue,
            })),
          },
          scope4E: {
            type: 'object',
            'x-decorator-props': { gridSpan: 2 },
            properties: scopeThreeCategoryList?.reduce((acc, item) => {
              acc[item.dictValue] = {
                type: 'string',
                title: item.dictLabel,
                'x-decorator': 'FormItem',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  addonAfter: 'tCO₂e',
                  max: 999999999999,
                  min: 0,
                },
                'x-reactions': {
                  dependencies: ['..scope3Emission'],
                  fulfill: {
                    state: {
                      display: `{{$deps[0]?.includes('${item.dictValue}') ? "visible": "hidden"}}`,
                    },
                  },
                },
                'x-validator': [
                  {
                    triggerType: 'onBlur',
                    validator: (v: string) =>
                      isUndefined(v) ||
                      (Number(v) >= 0 && Number(v) <= 999999999999),
                    message:
                      I18N.enterpriseCarbonAccount2
                        .thisValueShouldBeWithinTheRangeOf,
                  },
                ],
              };
              return acc;
            }, {}),
          },
        },
      },
    },
  };
  return data;
};
