import { ISchema } from '@formily/react';
import { initFormilyInput } from '@src/components/FormilyUtil/util';
import I18N from 'src/lang/I18N';

/** 基本信息Schema */
export const baseInfoSchema = () => {
  const data: ISchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 2,
          minColumns: 2,
          columnGap: 32,
        },
        properties: {
          orgName: {
            type: 'string',
            ...initFormilyInput(I18N.system.companyOrganization, true, {
              placeholder: I18N.carbonFootprint.pleaseEnter,
              maxLength: 30,
            }),
          },
          clientName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.contacts, true, {
              placeholder: I18N.carbonFootprint.pleaseEnter,
              maxLength: 20,
            }),
          },
          phonenumber: {
            type: 'string',
            title: I18N.carbonFootprint.contactPhoneNumber,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-validator': ['phone'],
          },
          email: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.mailbox, true, {
              maxLength: 50,
            }),
            'x-validator': ['email'],
          },
          remark: {
            type: 'string',
            title: I18N.carbonFootprint.leaveAMessage,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              showCount: true,
              maxLength: 300,
              placeholder: I18N.system.pleaseEnterAMessage,
              autoSize: {
                minRows: 5,
                maxRows: 8,
              },
            },
            'x-decorator-props': { gridSpan: 2 },
          },
        },
      },
    },
  };
  return data;
};
