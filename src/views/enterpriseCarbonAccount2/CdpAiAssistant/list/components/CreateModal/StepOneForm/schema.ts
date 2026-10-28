import { ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';
import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';

export interface IStepOneFormValues {
  orgId: string;
  industry: string;
  year: string;
  business: string;
  reportVersion: string;
  otherContent: string[];
  question_module: string[];
}

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
          orgId: {
            type: ' string',
            title: I18N.enterpriseCarbonAccount2.organizationalScope,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'TreeSelect',
            'x-component-props': {
              placeholder:
                I18N.enterpriseCarbonAccount2.pleaseSelectAnOrganization,
            },
          },
          industry: {
            type: 'string',
            title: I18N.dashborad.industry,
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              placeholder: I18N.dashborad.pleaseSelectTheAffiliation,
            },
            'x-reactions': [
              '{{useFieldFlattenUnitDictSource("cdp_industry")}}',
            ],
          },
          year: {
            title: I18N.enterpriseCarbonAccount2.yearOfDisclosure,
            'x-disabled': true,
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-decorator-props': { gridSpan: 2 },
            'x-component-props': {
              placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
            },
            type: 'string',
          },
          reportVersion: {
            title: titleTip(
              I18N.enterpriseCarbonAccount2.questionnaireVersion,
              I18N.enterpriseCarbonAccount2.fullVersionApplicable,
            ),
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'FormilyRadioCard',
            type: 'string',
            enum: [
              {
                label: I18N.enterpriseCarbonAccount2.fullVersion,
                value: '1',
              },
              {
                label:
                  I18N.enterpriseCarbonAccount2.smallAndMediumSizedEnterpriseS,
                value: '2',
              },
            ],
          },
          business: {
            type: 'string',
            title: titleTip(
              I18N.enterpriseCarbonAccount2.theHighestEarning2,
              I18N.enterpriseCarbonAccount2.theQuestionnaireWillBeBasedOn,
              undefined,
            ),
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'Radio.Group',
            'x-reactions': [
              '{{useFieldFlattenUnitDictSource("cdp_business")}}',
              {
                dependencies: ['.reportVersion'],
                fulfill: {
                  state: {
                    visible: `{{$deps[0] === '1'}}`,
                  },
                },
              },
            ],
            'x-validator': (value: string) => {
              if (!value || value.length === 0) {
                return I18N.enterpriseCarbonAccount2.theHighestEarning;
              }
              return '';
            },
          },
          otherContent: {
            type: 'string',
            title: titleTip(
              I18N.enterpriseCarbonAccount2.withinOtherQuestionnaires,
              undefined,
              undefined,
              I18N.enterpriseCarbonAccount2.basedOnTheActualSituation,
            ),
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'Checkbox.Group',
          },
          question_module: {
            type: 'string',
            title: titleTip(
              I18N.enterpriseCarbonAccount2.questionnaireModule,
              undefined,
              undefined,
              I18N.enterpriseCarbonAccount2.basedOnTheActualSituation,
            ),
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'Checkbox.Group',
          },
        },
      },
    },
  };
  return data;
};
