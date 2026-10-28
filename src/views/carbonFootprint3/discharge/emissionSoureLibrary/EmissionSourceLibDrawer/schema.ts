/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * @@description:
 */

import { ISchema } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyInput,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_MATCH_WAY_LABEL,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { DefaultOptionType } from 'antd/lib/cascader';

const { FACTOR } = MODEL_EMISSION_MATCH_WAY;

const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

/** 排放源下拉类型 */
const TypeDataSource = Object.keys(ALL_EMISSION_LABEL()).map(emission => ({
  label: ALL_EMISSION_LABEL()[emission],
  value: Number(emission),
}));

export const genEmissionBasicSchema: (
  onBasicNameChange: (name: string, needNew: boolean) => void,
) => ISchema = onBasicNameChange => {
  const schema: ISchema = {
    type: 'void',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          columnGap: 24,
        },
        properties: {
          type: {
            type: 'number',
            ...initFormilySelect(I18N.carbonFootprint.type, true, {
              options: TypeDataSource,
            }),
          },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.name, true, {
              onBlur: val => {
                if (val.target.value) {
                  onBasicNameChange(val.target.value, true);
                }
              },
            }),
            'x-reactions': {
              target: 'factorObjNameString',
              when: '{{$self.visible}}',
              fulfill: {
                state: {
                  value: 'km',
                },
              },
            },
            maxLength: 100,
          },
          amountColumn: {
            type: 'void',
            title: I18N.carbonFootprint.unit,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            'x-decorator-props': {
              asterisk: true,
            },
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
            // 'x-reactions': [
            //   {
            //     dependencies: ['type'],
            //     fulfill: {
            //       schema: {
            //         'x-visible': `{{$deps[0] !== ${ALL_EMISSION.TRANS}}}`,
            //       },
            //     },
            //   },
            // ],
            properties: {
              unitCode: {
                type: 'number',
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
                  '{{useFieldUnitDictSource("factorUnitM")}}',
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
                ...initFormilyCascader(
                  '',
                  true,
                  {
                    placeholder: I18N.carbonFootprint.unit,
                    displayRender: (labels: string[]) => labels?.[1],
                    allowClear: false,
                    showSearch: (
                      inputValue: string,
                      path: DefaultOptionType[],
                    ) =>
                      path.some(
                        option =>
                          (option.label as string)
                            .toLowerCase()
                            .indexOf(inputValue.toLowerCase()) > -1,
                      ),
                  },
                  true,
                ),
              },
            },
          },
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
            // 'x-reactions': [
            //   {
            //     dependencies: ['type'],
            //     fulfill: {
            //       schema: {
            //         'x-visible': `{{$deps[0] !== ${ALL_EMISSION.TRANS}}}`,
            //       },
            //     },
            //   },
            // ],
          },
        },
      },
    },
  };

  return schema;
};

/**
 * @description: 选择因子和新建因子的按钮
 */
export const genEmissionMatchWaySchema: () => ISchema = () => ({
  type: 'void',
  properties: {
    matchWay: {
      type: 'number',
      enum: [
        {
          value: FACTOR,
          label: MODEL_EMISSION_MATCH_WAY_LABEL()[FACTOR],
          icon: FACTOR_ICON,
        },
      ],
      default: FACTOR,
      'x-component': 'FormilyButtonSelect',
      'x-reactions': [
        {
          dependencies: ['grid.type'],
          fulfill: {
            schema: {
              'x-hidden': `{{$deps[0] === 7}}`,
            },
          },
        },
      ],
    },
  },
});
