import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyCascader,
  initFormilySelect,
} from '@src/components/FormilyUtil/util';
import I18N from '@src/lang/I18N';
import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';

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
            ...initFormilyInput(I18N.carbonFootprint3.organizationName, true, {
              placeholder: I18N.dashborad.pleaseEnterTheOrganization,
              maxLength: 100,
            }),
          },
          pid: {
            type: 'number',
            title: titleTip(
              I18N.dashborad.superiorOrganization,
              I18N.dashborad.currentlyNotSupported,
            ),
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'TreeSelect',
            'x-component-props': {
              fieldNames: { label: 'name', value: 'code' },
            },
          },
          superiorsShares: {
            type: 'string',
            title: titleTip(
              I18N.dashborad.sharesHeldBySuperiors,
              I18N.dashborad.namelyTheSuperiorOrganization,
            ),
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'NumberPicker',
            'x-component-props': {
              min: 0,
              max: 100,
              addonAfter: '%',
              style: {
                width: '100%',
              },
            },
          },
        },
      },
    },
  };
  return data;
};

/** 基本信息Schema */
export const additionalInfoSchema = () => {
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
          orgClassify: {
            type: 'string',
            ...initFormilySelect(I18N.dashborad.organizationalType, false, {
              placeholder: I18N.dashborad.pleaseSelectAnOrganization,
              fieldNames: { label: 'dictLabel', value: 'dictValue' },
            }),
          },
          orgIndustry: {
            type: 'string',
            ...initFormilyCascader(I18N.dashborad.industry, false, {
              placeholder: I18N.dashborad.pleaseSelectTheAffiliation,
              // fieldNames: { label: 'dictLabel', value: 'dictValue', children: 'enumList' },
            }),
          },
          orgArea: {
            type: 'string',
            ...initFormilyCascader(I18N.dashborad.countryRegion, false, {
              placeholder: I18N.dashborad.pleaseSelectTheLocation,
            }),
          },
          addrDetail: {
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
            ...initFormilySelect(I18N.carbonFootprint.contacts, false, {
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
