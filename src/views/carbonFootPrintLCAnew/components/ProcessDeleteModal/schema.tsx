import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

export const processDelSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          inputText: renderFormItemSchema({
            validateTitle: '',
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
        },
      },
    },
  );
