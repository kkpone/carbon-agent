import { ISchema } from '@formily/react';
import I18N from 'src/lang/I18N';

import { initFormilyInput } from '@/components/FormilyUtil/util';

/** 基本信息Schema */
export const baseSchema = (type?: 'feedback' | 'mark') => {
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
            'x-decorator-props': {
              colon: false,
            },
          },
          clientName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.contacts, true),
            'x-decorator-props': {
              colon: false,
            },
          },
          phonenumber: {
            type: 'string',
            required: true,
            title: I18N.carbonFootprint.contactPhoneNumber,
            'x-decorator': 'FormItem',
            'x-component': 'FormilyAreaCodeInput',
            'x-decorator-props': {
              colon: false,
            },
            'x-reactions': {
              dependencies: ['employEmail', 'employPhone'],
              fulfill: {
                state: {
                  selfErrors: [],
                },
              },
            },
          },
          email: {
            type: 'string',
            ...initFormilyInput(I18N.ccdb.contactEmail, true, {
              placeholder: I18N.dashborad.pleaseEnterYourEmailAddress,
              maxLength: 50,
            }),
            'x-decorator-props': {
              colon: false,
            },
            'x-validator': ['email'],
          },
          remark: {
            type: 'string',
            title:
              type === 'mark'
                ? I18N.carbonFootprint.leaveAMessage
                : I18N.ccdb.requiredFactors,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
              colon: false,
            },
            'x-component': 'Input.TextArea',
            'x-component-props': {
              showCount: true,
              maxLength: 300,
              placeholder:
                type === 'mark'
                  ? I18N.system.pleaseEnterAMessage
                  : I18N.ccdb.pleaseEnterTheFactor,
            },
          },
        },
      },
    },
  } as const satisfies ISchema;
  return data;
};
