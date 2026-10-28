import { Form } from '@formily/core';
import { ISchema } from '@formily/react';
import {
  initFormilyDatePicker,
  initFormilyInput,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';

import { CommonProductListData } from '../../type';
import {
  carbonLabelBrandField,
  carbonLabelProductImageField,
} from '../formFields';

/**
 * 碳标签 类型
 */
export const carbonLabelTypeSchema: () => ISchema = () => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        columnGap: 24,
      },
      properties: {
        /** 0 碳足迹核算 1 主动减排 2 碳信用抵消*/
        labelType: {
          type: 'string',
          'x-decorator': 'FormItem',
          title: false,
          'x-validator': {
            required: true,
          },
          'x-component': 'FormilyLabelTabs',
          'x-decorator-props': {
            gridSpan: 3,
          },
        },
      },
    },
  },
});

/**
 * 碳标签 产品信息
 */
export const carbonLabelProductInfoSchema: (
  productList: CommonProductListData[],
  form?: Form<Record<string, any>>,
) => ISchema = (productList, form) => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        columnGap: 24,
      },
      properties: {
        productId: {
          type: 'number',
          enum: productList,
          ...initFormilySelect(I18N.carbonFootprint.productName, true, {
            showSearch: true,
            allowClear: true,
            fieldNames: {
              label: 'productName',
              value: 'id',
            },
            filterOption: (input: string, option: any) => {
              if (
                (option?.productName ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              ) {
                return true;
              }

              return false;
            },
          }),
        },
        specs: {
          type: 'string',
          ...initFormilyInput(
            I18N.carbonFootprint.specificationAndModel,
            false,
          ),
          title: (
            <div>
              <span>{I18N.carbonFootprint.specificationAndModel}</span>
              <IconFont
                type='icon-icon-xianzhi'
                style={{ marginLeft: 5, cursor: 'pointer', fontSize: 14 }}
                onClick={() => {
                  if (form?.readPretty) return;
                  form?.setValuesIn('specsShow', 0);
                }}
              />
            </div>
          ),
          'x-read-pretty': true,
        },
        specsShow: {
          type: 'number',
          ...initFormilyInput(
            I18N.carbonFootprint3.specificationAndModelDisplay,
            false,
          ),
          'x-hidden': true,
        },
        accountId: {
          ...initFormilySelect(I18N.carbonFootprint3.functionalUnits, true, {
            allowClear: true,
            showSearch: true,
            optionLabelProp: 'accountName',
            fieldNames: {
              label: 'accountNameNode',
              value: 'id',
            },
            filterOption: (input, option) =>
              (option?.accountName ?? '').includes(input),
          }),
          'x-read-pretty': true,
        },
        brand: carbonLabelBrandField(),
        productPic: carbonLabelProductImageField(),
      },
    },
  },
});

/**
 * 碳标签 核算信息
 */
export const carbonLabelAccountSchema: (
  form?: Form<Record<string, any>>,
) => ISchema = form => ({
  type: 'object',
  properties: {
    grid: {
      type: 'void',
      'x-component': 'FormGrid',
      'x-component-props': {
        maxColumns: 2,
        columnGap: 24,
      },
      properties: {
        period: {
          type: 'string',
          ...initFormilyDatePicker(I18N.carbonFootprint.accountingCycle, false),
          title: (
            <div>
              <span>{I18N.carbonFootprint.accountingCycle}</span>
              <IconFont
                type='icon-icon-xianzhi'
                style={{ marginLeft: 5, cursor: 'pointer', fontSize: 14 }}
                onClick={() => {
                  if (form?.readPretty) return;
                  form?.setValuesIn('periodShow', 0);
                }}
              />
            </div>
          ),
          'x-read-pretty': true,
        },
        periodShow: {
          type: 'number',
          ...initFormilyInput(
            I18N.carbonFootprint3.accountingCycleDisplay,
            false,
          ),
          'x-hidden': true,
        },
        noData: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': '',
          'x-decorator-props': {
            gridSpan: 1,
          },
        },
        classNameGrid: {
          type: 'void',
          'x-component': 'FormGrid.GridColumn',
          'x-component-props': {
            gridSpan: 2,
          },
          properties: {
            contrastValuesArr: {
              type: 'string',
              'x-decorator': 'FormItem',
              title: (
                <span>
                  <span>{I18N.carbonFootprint3.carbonEmissionCategories}</span>
                  <IconFont
                    type='icon-icon-xianzhi'
                    style={{ marginLeft: 5, cursor: 'pointer', fontSize: 14 }}
                    onClick={() => {
                      if (form?.readPretty) return;
                      form?.setValuesIn('contrastShow', 0);
                    }}
                  />
                </span>
              ),
              'x-validator': {
                required: true,
              },
              'x-component': 'FormilyClassRadios',
            },
          },
        },
        contrastShow: {
          type: 'number',
          ...initFormilyInput(
            I18N.carbonFootprint3.carbonEmissionCategories2,
            false,
          ),
          'x-hidden': true,
        },
      },
    },
  },
});
