/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-10 15:06:03
 * @Date: 2022-12-26 11:14:57
 * @@description: 产品属性
 */
import I18N from '@src/lang/I18N';
import {
  initFormilyInput,
  initFormilyRadio,
} from '@src/components/FormilyUtil/util';
import { REGEXP_MORE_ZERO_INTEGER } from '@src/utils/regs';

/** JSON Schema数据 - 新增属性 */
export const ProductAttributeAddSchema = () => {
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
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.attributeName, true),
          },
          type: {
            type: 'number',
            default: 0,
            enum: [
              { label: I18N.carbonFootprint3.inputType2, value: 0 },
              { label: I18N.carbonFootprint3.selective, value: 1 },
            ],
            ...initFormilyRadio(I18N.carbonFootprint.type, true),
          },
          required: {
            type: 'number',
            default: 1,
            enum: [
              { label: I18N.carbonFootprint3.optionalItems, value: 0 },
              { label: I18N.carbonFootprint3.required, value: 1 },
            ],
            ...initFormilyRadio(
              I18N.carbonFootprint3.selectionRestrictions,
              true,
            ),
          },
          orderNum: {
            type: 'number',
            ...initFormilyInput(I18N.carbonFootprint3.sort, true),
            'x-validator': value => {
              if (!value) return '';

              if (
                !REGEXP_MORE_ZERO_INTEGER.test(`${Number(value)}`) ||
                Number(value) > 9999 ||
                `${value}`.includes('.')
              ) {
                return I18N.carbonFootprint3.onlyWholeNumbersCanBeEntered;
              }

              return '';
            },
          },
          status: {
            type: 'number',
            default: 0,
            enum: [
              { label: I18N.carbonFootprint.enable, value: 0 },
              { label: I18N.carbonFootprint.disabled, value: 1 },
            ],
            ...initFormilyRadio(I18N.carbonFootprint.state, true),
          },
        },
      },
    },
  };
  return data;
};
