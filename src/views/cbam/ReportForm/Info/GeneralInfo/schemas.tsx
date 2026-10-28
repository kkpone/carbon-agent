import I18N from '@src/lang/I18N';
import moment, { Moment } from 'moment';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';

import { INCLUDE_EL_ENUM, INCLUDE_EL_OPTIONS } from './constant';
import style from './index.module.less';

const { FALSE } = INCLUDE_EL_ENUM;

/** 公共的布局 */
const fromGrid = {
  'x-component-props': {
    maxColumns: 5,
    minColumns: 5,
    columnGap: 30,
    rowGap: 2,
    colWrap: true,
  },
};

/** 基础信息的schemas */
export const baseSchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(fromGrid),
        properties: {
          reportName: renderFormItemSchema({
            title: I18N.cbam.reportName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          orgId: renderFormItemSchema({
            title: I18N.carbonData.affiliatedOrganization,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          emptyOne: renderEmptySchema(),
          '[startDate, endDate]': renderFormItemSchema({
            title: I18N.cbam.reportCycle,
            'x-component': 'DatePicker.RangePicker',
            'x-component-props': {
              placeholder: [
                I18N.carbonFootPrintLCA.startDate,
                I18N.carbonFootPrintLCA.endDate,
              ],
              className: style.datePicker,
              format: 'DD.MM.YYYY',
              disabledDate: (current: Moment) =>
                (current && current < moment('1990')) ||
                (current && current > moment()),
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          include: renderFormItemSchema({
            title: I18N.cbam.doesItIncludeHeat,
            default: FALSE,
            'x-component': 'Radio.Group',
            enum: INCLUDE_EL_OPTIONS,
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
        },
      },
    },
  );

/** 工厂信息的schemas */
export const factorySchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(fromGrid),
        properties: {
          factoryId: renderFormItemSchema({
            title: I18N.cbam.chooseAFactory,
            customValidate: I18N.cbam.pleaseSelectAFactory,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
        },
      },
    },
  );

const inputMaxLength100 = 100;

/** 生成标题公共scheme */
const generateTitleScheme = (title: string) =>
  renderEmptySchema(
    {
      type: 'string',
      'x-decorator-props': {
        gridSpan: 5,
        style: {
          height: '20px',
        },
      },
    },
    { showVal: () => <h4>{title}</h4> },
  );

/** 验证机构的schemas */
export const verificationAgencySchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(fromGrid),
        properties: {
          verification: {
            type: 'object',
            properties: {
              aTitle: generateTitleScheme(I18N.cbam.reportVerification),
              corporateName: renderFormItemSchema({
                title: I18N.cbam.corporateName,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              detailedAddress: renderFormItemSchema({
                title: I18N.carbonFootPrintLCA.detailedAddress,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptyTwo: renderEmptySchema(),
              city: renderFormItemSchema({
                title: I18N.cbam.city,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              postalCode: renderFormItemSchema({
                title: I18N.cbam.postalCode,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptyThree: renderEmptySchema(),
              country: renderFormItemSchema({
                title: I18N.cbam.country,
                required: false,
                'x-component': 'Select',
                'x-component-props': {
                  showSearch: true,
                  optionFilterProp: 'label',
                  allowClear: true,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptyFour: renderEmptySchema({
                'x-decorator-props': {
                  gridSpan: 5,
                },
              }),

              bTitle: generateTitleScheme(I18N.cbam.bVerifierAwarded),
              fullName: renderFormItemSchema({
                title: I18N.system.name,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              email: renderFormItemSchema({
                title: I18N.cbam.eMail,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptyFive: renderEmptySchema(),
              mobile: renderFormItemSchema({
                title: I18N.cbam.phoneNumber,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              fax: renderFormItemSchema({
                title: I18N.cbam.fax,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptySix: renderEmptySchema(),

              cTitle: generateTitleScheme(I18N.cbam.cVerifierRecognition),
              memberState: renderFormItemSchema({
                title: I18N.cbam.certifiedMemberLetter,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              certificationName: renderFormItemSchema({
                title: I18N.cbam.nationalCertificationMachine,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
              emptySeven: renderEmptySchema(),
              registrationNo: renderFormItemSchema({
                title: I18N.cbam.certificationBodyIssues,
                required: false,
                'x-component': 'Input',
                'x-component-props': {
                  maxLength: inputMaxLength100,
                },
                'x-decorator-props': {
                  gridSpan: 2,
                },
              }),
            },
          },
        },
      },
    },
  );
