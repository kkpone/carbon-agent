/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 22:08:46
 * @Date: 2022-12-27 10:34:47
 * @@description: 过程库- 列表搜索
 */
import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';
import { initFormilyInput } from '@src/components/FormilyUtil/util';

import { genLengthValidator, genRequiredValidator } from './utils';

/**
 * 碳足迹核算3.0 - 过程库
 */
export const carbonFootprintProcessSearchForm = (): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitInput('', 'name', false),
      props: {
        placeholder: I18N.carbonFootprint3.processName,
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      style: { width: '200px' },
      ...back.props,
    };
    return back;
  });
};

/**
 *
 * @returns 过程库基本信息 formily schema
 */
export const processSourceLibraryBasicSchema = (params: {
  isEdit?: boolean;
  isProcessBusinessAccount?: boolean;
  isProcessAccountRoot?: boolean;
}): ISchema => {
  const { isProcessAccountRoot } = params;

  const disabled = !params.isEdit;
  const required = !!params.isEdit;
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
          // type: {
          //   type: 'number',
          //   enum: classesProcessAccountLeiBie(),
          //   ...initFormilySelect('类别', required),
          //   'x-visible': isProcessBusinessAccount,
          //   'x-disabled': disabled,
          // },
          name: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.processName, required),
            'x-validator': [
              genRequiredValidator({
                title: I18N.carbonFootprint3.processName,
              }),
              genLengthValidator({ max: 100 }),
            ],
            'x-disabled': disabled || isProcessAccountRoot,
          },
          productErea: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.producingArea, false),
            'x-validator': [
              genRequiredValidator({
                title: I18N.carbonFootprint3.producingArea,
              }),
              genLengthValidator({ max: 100 }),
              { required: false },
            ],
          },
        },
      },
    },
  };
  return data;
};
