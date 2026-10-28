import { Form } from '@formily/core';
import { ISchema } from '@formily/react';
import {
  initFormilyCascader,
  initFormilyDatePicker,
  initFormilyInput,
  initFormilySelect,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { RegAccountValue } from '@src/views/carbonFootprint3/util';
import { DebouncedFunc } from 'lodash-es';

/** JSON Schema数据 - 基本信息 */
export const FootprintAccountingBasicSchema = (
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
          scopeTypeGrid: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 3,
            },
            required: true,
            properties: {
              type: {
                type: 'number',
                default: 0,
                'x-decorator': 'FormItem',
                title: uitlNodeTitle(I18N.carbonFootprint3.accountingMethod),
                'x-validator': {
                  required: true,
                },
                'x-component': 'FormilyAccountTypeRadio',
              },
            },
          },
          productName: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint3.accountingProductName,
              true,
            ),
            'x-hidden': true,
          },
          productId: {
            type: 'string',
            ...initFormilySelect(
              I18N.carbonFootprint.accountingProducts,
              true,
              {
                showSearch: true,
                onBlur: () => {
                  const getFieldProductCode = form.getFieldState('productId');

                  // 如果不是自己手动输入的， 直接返回信息
                  const getInfoByCode = getFieldProductCode.dataSource?.find(
                    source => source.value === getFieldProductCode.value,
                  );
                  if (
                    getInfoByCode &&
                    !productSearchRef.current.productSearchValue
                  ) {
                    return;
                  }

                  const inputValue =
                    productSearchRef.current.productSearchValue;
                  if (getFieldProductCode.dataSource && inputValue) {
                    form.setFieldState('productId', {
                      dataSource: [
                        ...getFieldProductCode.dataSource,
                        {
                          label: inputValue,
                          value: inputValue,
                          isCustom: true,
                        },
                      ],
                      value: inputValue,
                    });
                    form.setValuesIn('productId', inputValue);
                    productSearchRef.current.productSearchValue = '';
                  }
                },
                onSelect: (val, info) => {
                  form.setValuesIn('productName', info.label);
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
            'x-read-pretty': true,
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
                ...initFormilyInput(I18N.carbonFootprint.quantity, true, {
                  onBlur: e => {
                    const isOk = RegAccountValue(e.target.value);
                    if (!isOk) {
                      callbackFunc(form);
                    }
                  },
                }),
                title: false,
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
              unitName: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.accountingUnitName,
                  true,
                ),
                'x-hidden': true,
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
          specification: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint.specificationAndModel,
              false,
            ),
          },
          noData: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
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
          scopeValue: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.customCycle, false),
            'x-hidden': true,
          },
          filesGrid: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 3,
            },
            properties: {
              files: {
                type: 'number',
                'x-decorator': 'FormItem',
                title: I18N.carbonFootprint.systemBoundaryEngineer,
                'x-decorator-props': {
                  gridSpan: 3,
                },
                'x-validator': {
                  required: false,
                },
                'x-component': 'FormilyImgUpload',
              },
            },
          },
        },
      },
    },
  };
  return data;
};
