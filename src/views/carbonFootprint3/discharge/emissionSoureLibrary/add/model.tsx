/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 18:59:12
 * @Date: 2022-12-27 11:19:21
 * @@description: 新增排放源 - model数据
 */
import { ISchema } from '@formily/react';
import {
  initFormilyCascader,
  // initFormilyCascader,
  initFormilyInput,
  initFormilySelect,
  schemaGridColumns,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_MATCH_WAY_LABEL,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
// import { ALL_EMISSION } from '@src/views/carbonFootprint3/constant';

// import { ALL_EMISSION } from '@/views/carbonFootprint3/constant';
import { EMISSION_TYPE_OPTIONS } from '@/views/subModules/CarbonFootprintModel/constant';

const { FACTOR } = MODEL_EMISSION_MATCH_WAY;

const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

/** JSON Schema数据 - 基本信息 */
export const emissionSoureLibraryBasicSchema = (): ISchema => {
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
          type: schemaGridColumns('type', {
            type: 'number',
            ...initFormilySelect(I18N.carbonFootprint.type, true),
          }),
          name: schemaGridColumns('name', {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.emissionSourceName, true),
            maxLength: 100,
          }),
          unitData: {
            type: 'number',
            ...initFormilyCascader(I18N.carbonFootprint.unit, true),
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
              // {
              //   dependencies: ['type', 'typeExtraWay'],
              //   fulfill: {
              //     schema: {
              //       'x-visible': `{{$deps[0] !== ${ALL_EMISSION.TRANS} || $deps[1] === 3}}`,
              //     },
              //   },
              // },
            ],
          },
          // unitDataGrid: schemaGridColumns(
          //   'unitData',
          //   {
          //     type: 'number',
          //     ...initFormilyCascader('数量单位', true),
          //   },
          //   {
          //     'x-reactions': [
          //       {
          //         dependencies: ['type', 'typeExtraWay'],
          //         fulfill: {
          //           schema: {
          //             'x-visible': `{{$deps[0] !== ${ALL_EMISSION.TRANS} || $deps[1] === 3}}`,
          //           },
          //         },
          //       },
          //     ],
          //   },
          // ),
        },
      },
    },
  };
  return data;
};

/**
 * @description: 选择因子和新建因子的按钮
 */
export const getemissionSoureLibrarySchema: () => ISchema = () => ({
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
      'x-reactions': [
        {
          dependencies: ['type'],
          fulfill: {
            schema: {
              'x-hidden': `{{$deps[0] === ${EMISSION_TYPE_OPTIONS.TRANS}}}`,
            },
          },
        },
      ],
      'x-component': 'FormilyButtonSelect',
    },
  },
});
