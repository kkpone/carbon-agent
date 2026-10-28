import I18N from '@src/lang/I18N';
import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

export const uncertaintyDescriptionSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          uncertaintyDesc: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.uncertaintyDescription,
            type: 'string',
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 2000,
            },
          }),
        },
      },
    },
  );
