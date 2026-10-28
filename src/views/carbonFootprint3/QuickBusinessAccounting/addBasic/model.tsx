/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:06:24
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 16:29:39
 * @Date: 2023-01-05 20:20:13
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { Form } from '@formily/core';
import { ISchema } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyDatePicker,
  initFormilyInput,
  initFormilySelect,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import { DebouncedFunc } from 'lodash-es';

import { RegAccountValue } from '../../util';

/** JSON Schema数据 - 基本信息 */
export const quickBusinessAccountingBasicSchema = (
  productSearchRef: React.MutableRefObject<{
    productSearchValue: string;
  }>,
  form: Form<any>,
  callbackFunc: DebouncedFunc<(form: Form<any>) => Promise<void>>,
): ISchema => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 3,
          columnGap: 24,
        },

        properties: {
          productCode: {
            type: 'string',
            ...initFormilySelect(
              I18N.carbonFootprint.accountingProducts,
              true,
              {
                showSearch: true,
                onBlur: () => {
                  const getFieldProductCode = form.getFieldState('productCode');

                  // 如果不是自己手动输入的， 直接返回信息
                  if (
                    getFieldProductCode.dataSource?.find(
                      source => source.value === getFieldProductCode.value,
                    ) &&
                    !productSearchRef.current.productSearchValue
                  ) {
                    return;
                  }

                  const inputValue =
                    productSearchRef.current.productSearchValue;
                  if (getFieldProductCode.dataSource && inputValue) {
                    form.setFieldState('productCode', {
                      dataSource: [
                        ...getFieldProductCode.dataSource,
                        {
                          label: inputValue,
                          value: inputValue,
                        },
                      ],
                      value: inputValue,
                    });
                    productSearchRef.current.productSearchValue = '';
                  }
                },
                onSelect: () => {
                  productSearchRef.current.productSearchValue = '';
                },
                filterOption: (input: string, option: any) => {
                  if (
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  ) {
                    return true;
                  }
                  productSearchRef.current.productSearchValue = input;

                  return false;
                },
              },
            ),
            'x-reactions': ['{{useAsyncProductDataSource()}}'],
          },
          /** 核算数量 */
          specificationWay2: {
            type: 'void',
            title: I18N.carbonFootprint.accountingQuantity,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
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
              amount: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.quantity,
                  true,
                  {
                    onBlur: () => {
                      callbackFunc(form);
                    },
                  },
                  true,
                ),
                'x-validator': value => RegAccountValue(value),
              },
              unitData: {
                type: 'string',
                ...initFormilyCascader(
                  I18N.carbonFootprint3.accountingUnit,
                  true,
                  {},
                  true,
                ),
                'x-reactions': ['{{useFieldUnitDictSource ("factorUnitM")}}'],
              },
            },
          },
          accountName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.functionalUnits, true),
            maxLength: 100,
          },
          dateTime: {
            type: 'string',
            ...initFormilyDatePicker(
              I18N.carbonFootprint.accountingCycle,
              true,
            ),
          },
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 2,
            },
          },
          // files: {
          //   type: 'number',
          //   'x-decorator': 'FormItem',
          //   title: uitlNodeTitle('产品生产工艺图（碳足迹报告用图）'),
          //   'x-decorator-props': {
          //     gridSpan: 3,
          //   },
          //   'x-validator': {
          //     required: false,
          //   },
          //   'x-component': 'FormilyImgUpload',
          // },
          scopeGrid: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 3,
            },
            required: true,
            properties: {
              scope: {
                type: 'number',
                default: 0,
                'x-decorator': 'FormItem',
                title: uitlNodeTitle(I18N.carbonFootprint.systemBoundary),
                'x-validator': {
                  required: true,
                },
                'x-component': 'FormilySystemBoundaryRadio',
              },
            },
          },
        },
      },
    },
  };
  return data;
};
