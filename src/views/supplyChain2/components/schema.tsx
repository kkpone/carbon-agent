/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-24 15:34:32
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 17:32:50
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilySelect,
  initFormilyCheckBox,
} from '@src/components/FormilyUtil/util';
import { GWPinfo } from '@src/views/enterpriseCarbonAccount2/listInfo/util';

import { footBorderType } from '../schema';

/**
 * 基本信息详情 企业碳核算
 */

export const carbonAccountBaseInfoSchema = (): ISchema => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 1,
          columnGap: 24,
        },
        properties: {
          // companyName: {
          //   ...initFormilyInput('核算名称', false),
          //   type: 'string',
          //   'x-validator': {
          //     max: 100,
          //   },
          // },
          period: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.accountingCycle, false),
          },
          quantizationArr: {
            type: 'string',
            ...initFormilyCheckBox(
              I18N.enterpriseCarbonAccount2.quantitativeMethods,
              false,
              {
                options: [
                  {
                    label: I18N.enterpriseCarbonAccount2.emissionFactorMethod,
                    value: '0',
                  },
                  {
                    label: I18N.enterpriseCarbonAccount2.materialBalanceMethod,
                    value: '1',
                  },
                ],
              },
            ),
          },
          gwp: {
            type: 'string',
            ...initFormilySelect(
              I18N.enterpriseCarbonAccount2.gwpInformation,
              false,
              {
                options: GWPinfo,
              },
            ),
            'x-validator': {
              max: 11,
            },
          },
        },
      },
    },
  };
  return data;
};
/**
 * 基本信息详情 产品碳足迹
 */
export const carbonFootPrintBaseInfoSchema = (timeType: number): ISchema => {
  const data = {
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
          productName: {
            type: 'string',
            ...initFormilySelect(
              I18N.carbonFootprint.accountingProducts,
              true,
              {
                showSearch: true,
              },
            ),
          },
          /** 核算数量 */
          specificationWay2: {
            type: 'void',
            title: I18N.carbonFootprint.accountingQuantity,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'FormGrid',
            properties: {
              amount: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint.quantity,
                  true,
                  {},
                  true,
                ),
                'x-decorator-props': {
                  addonAfter: '/',
                },
              },
              unitName: {
                type: 'string',
                ...initFormilyInput(
                  I18N.carbonFootprint3.accountingUnit,
                  true,
                  {},
                  true,
                ),
              },
            },
          },
          accountName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.functionalUnits, true),
          },
          dateTime: {
            type: 'string',
            ...initFormilyInput(timeType === 1 ? I18N.carbonFootprint.accountingCycle : I18N.carbonFootprint3.accountingYear2, true),
          },
          ...footBorderType,
        },
      },
    },
  };
  return data;
};
