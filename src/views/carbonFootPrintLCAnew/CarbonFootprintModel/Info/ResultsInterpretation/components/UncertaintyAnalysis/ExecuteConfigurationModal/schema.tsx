import I18N from '@src/lang/I18N';

import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

export const executeConfigurationSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          countNum: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.numberOfExecutions,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              min: 100,
              max: 10000,
              precision: 0,
            },
            default: 10000,
          }),
        },
      },
    },
  );
