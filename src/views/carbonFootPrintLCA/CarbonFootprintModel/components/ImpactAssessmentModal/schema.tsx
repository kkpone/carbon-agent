import I18N from '@src/lang/I18N';

import {
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderFormItemSchema,
} from '@/components/formily/utils';

import { impactAssessmentColumns } from './columns';

export const impactAssessmentSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          planName: renderFormItemSchema({
            title: I18N.certificationReviewCenter.planName,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          assessmentMethod: renderFormItemSchema({
            title: I18N.certificationReviewCenter.evaluationMethods,
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
          }),
        },
      },
    },
  );

export const assessmentTargetSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(),
        properties: {
          assessmentTargetList: renderFormItemSchema({
            customValidate: I18N.carbonFootPrintLCA.pleaseSelectAtLeast,
            type: 'array',
            'x-component': 'FormilySelectableTable',
            'x-component-props': {
              columns: impactAssessmentColumns(),
              pagination: false,
              scroll: { y: '160px' },
              bordered: true,
              rowKey: 'value',
            },
          }),
        },
      },
    },
  );
