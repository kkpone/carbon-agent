import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 1,
        }),
        properties: {
          auditStatus: renderFormItemSchema({
            title: I18N.supplyChainCarbonManagement.approvalResults,
            'x-component': 'Radio.Group',
            enum: [
              {
                label: I18N.supplyChainCarbonManagement.approved,
                value: '1',
              },
              {
                label: I18N.supplyChainCarbonManagement.approvalNotPassed,
                value: '2',
              },
            ],
          }),
          auditComment: renderFormItemSchema({
            title: I18N.components.remark,
            'x-component': 'TextArea',
            'x-component-props': {
              placeholder: I18N.base.pleaseEnter,
              maxLength: 500,
              style: {
                height: 100,
                alignItems: 'flex-start',
              },
            },
            'x-reactions': {
              dependencies: ['auditStatus'],
              when: `{{$deps[0]==='2'}}`,
              fulfill: {
                schema: {
                  'x-validator': [
                    { required: true, message: I18N.eca.pleaseEnterANote },
                  ],
                },
              },
              otherwise: {
                state: {
                  required: false,
                },
              },
            },
          }),
        },
      },
    },
  );
