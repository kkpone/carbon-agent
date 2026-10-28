import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyCascader,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';

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
          companyName: {
            type: 'string',
            ...initFormilyInput(I18N.dashborad.enterpriseName, true, {
              placeholder: I18N.dashborad.pleaseEnterTheCompany,
              maxLength: 100,
            }),
          },
          industry: {
            type: 'string',
            ...initFormilyCascader(I18N.dashborad.industry, true, {
              placeholder: I18N.dashborad.pleaseSelectTheAffiliation,
            }),
          },
          scale: {
            type: 'string',
            ...initFormilySelect(I18N.dashborad.enterpriseScale, true, {
              placeholder: I18N.dashborad.pleaseSelectACompany,
              fieldNames: { label: 'dictLabel', value: 'dictValue' },
            }),
          },
          area: {
            type: 'string',
            ...initFormilyCascader(I18N.dashborad.countryRegion, true, {
              placeholder: I18N.dashborad.pleaseSelectTheLocation,
            }),
          },
          detailedAddr: {
            type: 'string',
            ...initFormilyInput(I18N.dashborad.detailedAddress, false, {
              placeholder: I18N.dashborad.pleaseEnterDetails,
              maxLength: 100,
            }),
          },
        },
      },
    },
  };
  return data;
};

/** 基本信息Schema */
export const contactInfoSchema = () => {
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
          linkmanUserid: {
            type: 'string',
            ...initFormilySelect(I18N.carbonFootprint.contacts, true, {
              placeholder: I18N.dashborad.pleaseSelectContact,
            }),
            'x-component-props': {
              showSearch: true,
              filterOption: (input: string, option: { label: string }) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            },
          },
        },
      },
    },
  };
  return data;
};
