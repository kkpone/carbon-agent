import I18N from '@src/lang/I18N';

import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';
import { changeTableColumnsNoText } from '@/utils';

export const authorizationSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          modelName: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.modelName,
            type: 'string',
            required: false,
            'x-disabled': true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          modelCode: renderFormItemSchema({
            title: I18N.certificationReviewCenter.modelCoding,
            type: 'string',
            required: false,
            'x-disabled': true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          productName: renderFormItemSchema({
            title: I18N.Factors.productName,
            type: 'string',
            required: false,
            'x-disabled': true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          supplierId: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.authorizedObject,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
          }),
          applyType: renderFormItemSchema({
            title: I18N.carbonFootPrintLCA.authorizationData,
            'x-component': 'Radio.Group',
          }),
          assessmentId: renderFormItemSchema({
            customValidate: I18N.carbonFootPrintLCA.pleaseSelectAModel,
            type: 'array',
            'x-component': 'FormilySelectableTable',
            'x-component-props': {
              columns: changeTableColumnsNoText(
                [
                  {
                    title: I18N.certificationReviewCenter.planName,
                    dataIndex: 'planName',
                    width: 100,
                  },
                  {
                    title: I18N.certificationReviewCenter.evaluationMethods,
                    dataIndex: 'assessmentMethodName',
                    width: 100,
                  },
                  {
                    title: I18N.certificationReviewCenter.evaluatingIndicator,
                    dataIndex: 'assessmentTargetNames',
                    width: 200,
                  },
                ],
                '-',
              ),
              pagination: false,
              scroll: { y: '160px' },
              bordered: true,
              rowSelection: {
                type: 'radio',
              },
            },
          }),
        },
      },
    },
  );
