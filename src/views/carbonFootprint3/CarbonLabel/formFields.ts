import type { ISchema } from '@formily/react';
import { initFormilyInput } from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';

/** 旧申请页与 Agent 共同使用的字段规则，不包含任何页面布局结构。 */
export const carbonLabelBrandField = (): ISchema => {
  const field = initFormilyInput(I18N.carbonFootprint3.brandName, true);
  return {
    type: 'string',
    ...field,
    'x-validator': [
      field['x-validator'],
      (value: unknown) =>
        typeof value === 'string' && value.length > 10
          ? I18N.carbonFootprint3.enterUpTo
          : '',
    ],
  };
};

export const carbonLabelProductImageField = (): ISchema => ({
  type: 'number',
  'x-decorator': 'FormItem',
  title: I18N.carbonFootprint3.productImages,
  'x-decorator-props': { gridSpan: 2 },
  'x-validator': { required: true },
  'x-component': 'FormilyUploadCrop',
  'x-component-props': {
    noDescribe: true,
    description: I18N.carbonFootprint3.supportPng,
  },
});
