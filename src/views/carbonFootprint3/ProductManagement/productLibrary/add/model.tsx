/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-03 09:38:19
 * @Date: 2022-12-23 16:52:39
 * @@description:
 */

import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilySelect,
  uitlNodeTitle,
} from '@src/components/FormilyUtil/util';
import { ProductExtra } from '../../type';

/** JSON Schema数据 - 基本信息 */
export const productLibraryBasicSchema = (): ISchema => {
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
          productName: {
            ...initFormilyInput(I18N.carbonFootprint.productName, true),
            type: 'string',
            'x-validator': {
              max: 100,
            },
          },
          productCode: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.productCode, true),
            'x-validator': {
              max: 50,
            },
          },
          specification: {
            type: 'string',
            ...initFormilyInput(
              I18N.carbonFootprint.specificationAndModel,
              false,
            ),
            'x-validator': {
              max: 100,
            },
          },
          files: {
            type: 'number',
            'x-decorator': 'FormItem',
            title: uitlNodeTitle(I18N.carbonFootprint3.productProductionWorker),
            'x-decorator-props': {
              gridSpan: 3,
            },
            'x-validator': {
              required: false,
            },
            'x-component': 'FormilyImgUpload',
          },
          techDesc: {
            type: 'string',
            ...initFormilyInputTextArea(
              I18N.carbonFootprint3.productProductionWorker2,
              false,
              {
                rows: 4,
              },
            ),
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': {
              max: 1000,
            },
          },
          productDescOther: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
          productDesc: {
            type: 'string',
            'x-decorator-props': {
              gridSpan: 2,
            },
            ...initFormilyInputTextArea(
              I18N.carbonFootprint3.productDescription,
              false,
              {
                rows: 4,
              },
            ),
            'x-validator': {
              max: 1000,
            },
          },
          productDescOther2: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': '',
            'x-decorator-props': {
              gridSpan: 1,
            },
          },
        },
      },
    },
  };
  return data;
};
/** JSON Schema数据 - 基本信息 */
export const productLibraryAttributeSchema = (
  productExtras: ProductExtra[],
  isDetail: boolean,
): ISchema => {
  const extras = {};
  productExtras.forEach(ex => {
    // 输入值
    if (ex.type === 0) {
      let exName = ex.value;
      if (isDetail && ex.value) {
        exName =
          ex.value.length > 30 ? `${ex.value.slice(0, 30)}...` : ex.value;
      }

      extras[`${ex.extraId}_KEY`] = {
        type: 'string',
        default: exName,
        ...initFormilyInput(ex.name, ex.required === 1),
        'x-validator': {
          maxLength: 200,
        },
      };
    }
    // 下拉值
    if (ex.type === 1) {
      const extraEnumsData = ex.extraEnums
        ? ex.extraEnums
            .filter(exEnum => exEnum.status === 0)
            .map(exEnum => ({ label: exEnum.name, value: exEnum.id }))
        : [];

      extras[`${ex.extraId}_KEY`] = {
        type: 'number',
        default: ex.value ? Number(ex.value) : undefined,
        enum: extraEnumsData,
        ...initFormilySelect(ex.name, ex.required === 1, {
          showSearch: true,
          filterOption: (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        }),
      };
    }
  });

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
          ...extras,
        },
      },
    },
  };

  return data;
};
