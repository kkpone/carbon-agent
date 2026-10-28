import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { RegFActorObjRate } from '@src/views/carbonFootprint3/util';
import { MODEL_EMISSION_FACTOR_UNIT } from '@src/views/carbonFootprint3/util/constant';
import { DefaultOptionType } from 'antd/lib/select';
import { Moment } from 'moment';

import {
  initFormilyCascader,
  initFormilyInput,
  initFormilySelect,
} from '../../util';

export const emissionFactorSchema: (
  readPretty?: boolean,
) => ISchema = readPretty => {
  const denominatorUnitComponent = readPretty
    ? {
        type: 'string',
        ...initFormilyInput('', true),
      }
    : {
        type: 'string',
        ...initFormilyCascader(I18N.carbonFootprint3.denominatorUnit, true, {
          displayRender: (label: string[]) => {
            if (!label) return '';
            if (label.length === 2) {
              return [label[1]];
            }
            return label;
          },
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
          '{{useFieldUnitDictSource("factorUnitM")}}',
          '{{useFieldSetValueByLabel}}',
        ],
      };
  return {
    type: 'void',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 50,
        },
        properties: {
          factorObj: {
            type: 'void',
            properties: {
              name: {
                type: 'string',
                ...initFormilyInput(I18N.carbonFootprint.factorName, true),
                maxLength: 100,
              },
              factor: {
                type: 'string',
                title: I18N.components.factorValueTwo,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'NumberPicker',
                'x-component-props': {
                  placeholder: I18N.components.factorValueTwo,
                  maxLength: 100,
                },
                'x-validator': value => {
                  if (value === ECOINVENT_TEXT) {
                    return '';
                  }
                  return RegFActorObjRate(value);
                },
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
                  denominatorUnit: denominatorUnitComponent,
                },
              },
              institution: {
                type: 'string',
                ...initFormilyInput(I18N.components.factorSources, true),
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
  };
};
