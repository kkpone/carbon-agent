/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-28 16:09:45
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 16:29:27
 * @Date: 2023-01-05 20:20:13
 * @@description: 核算模型新增基本信息
 */
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilyRadio,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';

/** JSON Schema数据 - 基本信息 */
export const BusinessAccountinModelBasicSchema = (): ISchema => {
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
          modelName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.modelName, true),
            maxLength: 100,
          },
          accountName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.functionalUnits, true),
            maxLength: 100,
          },
          type: {
            type: 'number',
            default: 0,
            enum: [
              {
                label: I18N.carbonFootprint3.quickAccounting,
                value: 0,
              },
              {
                label: I18N.carbonFootprint3.processAccounting,
                value: 1,
              },
            ],
            ...initFormilyRadio(I18N.carbonFootprint3.accountingMethod, true),
          },
        },
      },
    },
  };
  return data;
};
/** JSON Schema数据 - 基本信息 */
export const BusinessAccountinModelBasicRadioSchema = (
  modalDetail?: boolean,
) => {
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
          scope: {
            type: 'number',
            enum: [
              {
                label: (
                  <>
                    <span>{I18N.carbonFootprint3.halfLifeCycle}</span>
                    <span style={{ color: '#999EA4' }}>
                      {I18N.carbonFootprint3.fromResourceExtraction2}
                    </span>
                  </>
                ),
                value: 0,
              },
              {
                label: (
                  <>
                    <span>{I18N.carbonFootprint3.fullLifecycle}</span>
                    <span
                      style={{
                        color: '#999EA4',
                        display: 'inline-block',
                        marginTop: 16,
                      }}
                    >
                      {I18N.carbonFootprint3.fromResourceExtraction}
                    </span>
                  </>
                ),
                value: 1,
              },
            ],
            'x-decorator-props': {
              gridSpan: 3,
            },
            default: 0,
            ...initFormilyRadio(
              I18N.carbonFootprint.systemBoundary,
              true,
              !modalDetail
                ? {
                    style: {
                      display: 'grid',
                    },
                  }
                : {},
            ),
          },
          description: {
            type: 'string',
            'x-decorator-props': {
              gridSpan: !modalDetail ? 2 : 3,
            },
            ...initFormilyInputTextArea(
              I18N.carbonFootprint.modelDescription2,
              false,
              {
                rows: 4,
              },
            ),
            maxLength: 1000,
          },
        },
      },
    },
  };
  return data;
};
