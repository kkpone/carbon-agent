import I18N from '@src/lang/I18N';

import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

/** 截取上游过程集 */
const UPSTREAM_PROCESS = 1;

export const saveProcessLibrarySchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          processLibName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.processSetName,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          processLibType: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.saveProcessSet2,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            default: UPSTREAM_PROCESS,
          }),
        },
      },
    },
  );
