import { QuestionCircleOutlined } from '@ant-design/icons';
import { ISchema } from '@formily/react';
import {
  initFormilyInput,
  initFormilyCheckBox,
} from '@src/components/FormilyUtil/util';
import { Tooltip } from 'antd';
import { ReactNode } from 'react';
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
          employName: {
            type: 'string',
            ...initFormilyInput(I18N.dashborad.employeeName, true, {
              placeholder: I18N.dashborad.pleaseEnterEmployee,
              maxLength: 100,
            }),
          },
          orgId: {
            type: 'number',
            title: I18N.dashborad.affiliatedOrganization,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'TreeSelect',
            'x-component-props': {
              fieldNames: { label: 'name', value: 'code' },
            },
          },
          employPhone: {
            type: 'string',
            title: I18N.dashborad.mobilePhoneNumber,
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
          employEmail: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.mailbox, false, {
              placeholder: I18N.dashborad.pleaseEnterYourEmailAddress,
              maxLength: 50,
            }),
            'x-validator': ['email'],
          },
        },
      },
    },
  };
  return data;
};

/** 基本信息Schema */
export const RoleIdsSchema = () => {
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
          roleIds: {
            type: 'array',
            ...initFormilyCheckBox(I18N.dashborad.belongingRole, true),
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-validator': [
              (value: string) =>
                value.length > 0
                  ? ''
                  : I18N.dashborad.pleaseSelectTheAffiliation2,
            ],
          },
        },
      },
    },
  };
  return data;
};

/** 数据审批配置Schema */
export const ApprovalConfigSchema = () => {
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
          superApprovalName: {
            type: 'string',
            title: (
              <span>
                {I18N.enterpriseCarbonAccount2.dataApprovalNegative}{' '}
                <Tooltip title={I18N.dashborad.dataApprovalNegative}>
                  <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </span>
            ) as any,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.DomesticVersion.nothing,
              disabled: true,
            },
          },
          approvalConfig: {
            type: 'string',
            title: (
              <span>
                {I18N.dashborad.configureDataReview}{' '}
                <Tooltip title={I18N.dashborad.dataApprovalFor}>
                  <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
              </span>
            ) as any,
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Radio.Group',
            enum: [
              { label: I18N.dashborad.notConfigured, value: 'notConfig' },
              { label: I18N.dashborad.configuration, value: 'config' },
            ],
            default: 'notConfig',
          },
          subApprovalList: {
            type: 'array',
            // title: '审批对象人员',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'ApprovalUserSelect',
            'x-component-props': {
              placeholder: I18N.dashborad.pleaseSelectApproval,
              showSearch: true,
              filterOption: (
                input: string,
                option: { label: string | ReactNode },
              ) => {
                if (typeof option.label === 'string') {
                  return (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase());
                }
                return false;
              },
            },
            'x-reactions': {
              dependencies: ['approvalConfig'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "config"}}',
                  required: '{{$deps[0] === "config"}}',
                },
              },
            },
          },
        },
      },
    },
  };
  return data;
};
