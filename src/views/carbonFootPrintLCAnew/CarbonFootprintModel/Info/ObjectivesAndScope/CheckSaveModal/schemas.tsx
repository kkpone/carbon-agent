import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

/** 系统边界变更校验弹窗 */
export const systemSchema = () =>
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
