import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';

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

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(fromGrid),
        properties: {
          infoTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.dataQualityAnd,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 5,
            },
          }),
          generalInformation: renderFormItemSchema({
            title: I18N.cbam.theQualityOfData,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
          }),
          emptyOne: renderEmptySchema(),
          defaultReason: renderFormItemSchema({
            title: I18N.cbam.useDefaultValues,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
          }),
          emptyTwo: renderEmptySchema(),
          qualityAssurance: renderFormItemSchema({
            title: I18N.cbam.qualityAssuranceLetter,
            required: false,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
          }),
          emptyThree: renderEmptySchema(),
          otherTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.other,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 5,
            },
          }),
          carbonPrice: renderFormItemSchema({
            title: I18N.cbam.explanationOfCarbonPrice,
            required: false,
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 10000,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
          }),
          emptyFour: renderEmptySchema(),
          supplement: renderFormItemSchema({
            title: I18N.cbam.otherSupplements,
            required: false,
            'x-component': 'TextArea',
            'x-component-props': {
              maxLength: 10000,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
          }),
        },
      },
    },
  );
