import { ISchema } from '@formily/react';
import I18N from 'src/lang/I18N';

import { initFormilyInput } from '@/components/FormilyUtil/util';

/** 基本信息Schema */
export const baseInfoSchema = () => {
  const data = {
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
            ...initFormilyInput(I18N.carbonFootprint.corporateStructure, true),
          },
          phonenumber: {
            type: 'string',
            required: true,
            title: I18N.carbonFootprint.contactPhoneNumber,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyAreaCodeInput',
            'x-reactions': {
              dependencies: ['employEmail', 'employPhone'],
              fulfill: {
                state: {
                  selfErrors: [],
                },
              },
            },
          },
          clientName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.contacts, true),
          },
          email: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.mailbox, true, {
              placeholder: I18N.dashborad.pleaseEnterYourEmailAddress,
              maxLength: 50,
            }),
            'x-validator': ['email'],
          },
          remark: {
            type: 'string',
            title: I18N.carbonFootprint.leaveAMessage,
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Input.TextArea',
          },
        },
      },
    },
  } as const satisfies ISchema;
  return data;
};
