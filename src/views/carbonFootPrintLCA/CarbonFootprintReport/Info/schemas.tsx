import I18N from '@src/lang/I18N';

import {
  renderEmptySchema,
  renderFormItemSchema,
  renderFromGridSchema,
  renderSchemaWithLayout,
} from '@/components/formily/utils';
// import { SearchSchemaSelectUtils } from '@/utils/schema';

const initModelCaseDisabledAndRequired = {
  required: false,
  'x-disabled': true,
  'x-component-props': {
    placeholder: '-',
  },
};
/** 环境足迹报告模型方案-schemas */
export const modelCaseSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          modelName: renderFormItemSchema({
            type: 'string',
            title: I18N.carbonFootPrintLCA.modelName,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            ...initModelCaseDisabledAndRequired,
          }),
          modelCode: renderFormItemSchema({
            type: 'string',
            title: I18N.certificationReviewCenter.modelCoding,
            'x-component': 'Input',
            ...initModelCaseDisabledAndRequired,
          }),
          // orgId: renderFormItemSchema({
          //   required: false,
          //   title: I18N.carbonData.affiliatedOrganization,
          //   'x-disabled': true,
          //   'x-component': 'Select',
          //   'x-component-props': {
          //     ...SearchSchemaSelectUtils,
          //     placeholder: '-',
          //   },
          // }),
          funcUnit: renderFormItemSchema({
            type: 'string',
            title: I18N.carbonFootPrintLCA.functionalUnits,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            ...initModelCaseDisabledAndRequired,
          }),
          planName: renderFormItemSchema({
            type: 'string',
            title: I18N.certificationReviewCenter.planName,
            ...initModelCaseDisabledAndRequired,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          assessmentMethodName: renderFormItemSchema({
            type: 'string',
            title: I18N.certificationReviewCenter.evaluationMethods,
            ...initModelCaseDisabledAndRequired,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          }),
          assessmentTargetNames: renderFormItemSchema({
            type: 'string',
            title: I18N.certificationReviewCenter.evaluatingIndicator,
            ...initModelCaseDisabledAndRequired,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              placeholder: '-',
              maxLength: 1000,
              style: {
                height: 100,
                alignItems: 'flex-start',
              },
            },
          }),
        },
      },
    },
  );

/** 环境足迹报告报告信息-schemas */
export const reportInfoSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          reportName: renderFormItemSchema({
            type: 'string',
            title: I18N.carbonFootPrintLCA.reportName,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          empty: renderEmptySchema(),
          ending: renderFormItemSchema({
            required: false,
            title: I18N.carbonFootPrintLCA.conclusionLimitationsAnd,
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 2000,
              style: {
                height: 100,
                alignItems: 'flex-start',
              },
            },
          }),
        },
      },
    },
  );
