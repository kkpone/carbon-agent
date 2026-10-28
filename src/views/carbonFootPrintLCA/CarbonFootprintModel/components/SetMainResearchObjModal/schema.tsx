import I18N from '@src/lang/I18N';

import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

// import { IO_TYPE, IO_TYPE_OPTION } from '../../Info/constant';

export const setMainResearchObjSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          productName: renderFormItemSchema({
            title: I18N.Factors.productName,
            type: 'string',
            required: false,
            'x-disabled': true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          // ioType: renderFormItemSchema({
          //   title: I18N.carbonFootPrintLCA.researchObject,
          //   type: 'string',
          //   'x-decorator': 'FormItem',
          //   'x-component': 'Radio.Group',
          //   enum: IO_TYPE_OPTION,
          //   default: IO_TYPE.OUTPUT,
          // }),
          processName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.productOwner,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          lifeCycleId: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.mainProcess,
            'x-component': 'Select',
          }),
        },
      },
    },
  );
