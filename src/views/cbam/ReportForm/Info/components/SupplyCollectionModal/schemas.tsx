import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

/** 选择供应商表单 */
export const supplySchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          supplyOrgId: renderFormItemSchema({
            title: I18N.carbonFootprint3.selectSupplier,
            customValidate: I18N.cbam.pleaseSelectTheSupply,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
          }),
          deadline: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.deadline,
            'x-component': 'DatePicker',
            'x-component-props': {
              showToday: false,
            },
          }),
        },
      },
    },
  );

/** 其他信息表单 */
export const otherSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          remark: renderFormItemSchema({
            title: I18N.components.remark,
            required: false,
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 200,
              style: {
                height: 100,
                alignItems: 'flex-start',
              },
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          title: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.certificationReviewCenter.proofMaterials,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          supportFile: renderFormItemSchema({
            required: false,
            type: 'array',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'FormilyFileUpload',
          }),
        },
      },
    },
  );
