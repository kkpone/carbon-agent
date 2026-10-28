// import I18N from '@src/lang/I18N';

import I18N from '@src/lang/I18N';

export const schema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        labelAlign: 'left',
        labelCol: 6,
        wrapperCol: 18,
        colon: true,
        layout: 'vertical',
      },
      properties: {
        grid: {
          type: 'void',
          'x-component': 'FormGrid',
          'x-component-props': {
            maxColumns: 3,
            minColumns: 3,
            columnGap: 24,
          },
          properties: {
            corporateName: {
              type: 'string',
              title: I18N.cbam.corporateName,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: I18N.base.pleaseEnter,
              },
            },
            year: {
              type: 'string',
              title: I18N.enterpriseCarbonAccount2.disclosurePeriod,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                options: [],
              },
            },
            reportVersion: {
              type: 'string',
              title: I18N.enterpriseCarbonAccount2.questionnaireType,
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                options: [
                  { label: 'SME', value: '2' },
                  {
                    label: I18N.enterpriseCarbonAccount2.fullVersion,
                    value: '1',
                  },
                ],
              },
            },
            business: {
              type: 'string',
              title: I18N.enterpriseCarbonAccount2.questionnaireIndustry,
              required: true,
              'x-decorator': 'FormItem',
              'x-decorator-props': { gridSpan: 1 },
              'x-component': 'Select',
              'x-component-props': {
                placeholder: I18N.carbonFootprint.pleaseSelect,
              },
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
              // 'x-validator': (value: string[]) => {
              //   if (!value || value.length === 0) {
              //     return I18N.enterpriseCarbonAccount2.theHighestEarning;
              //   }
              //   if (value.length > 3) {
              //     return I18N.enterpriseCarbonAccount2.maximumSelectionOptions;
              //   }
              //   return '';
              // },
            },
          },
        },
      },
    },
  },
};
