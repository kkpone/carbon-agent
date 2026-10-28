import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
};

/** 大于等于0小于等于100的数字，保留6位小数 */
const numberPropsPercent = {
  min: 0,
  max: 100,
  precision: 6,
};

export const schema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 2,
        }),
        properties: {
          sourceName: renderFormItemSchema({
            title: I18N.eca.emissionSourceName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          processMethod: renderFormItemSchema({
            title: I18N.cbam.ghgType,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
          }),
          biomassContent: renderFormItemSchema({
            title: I18N.cbam.biomassContent,
            default: 0,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
          }),
          lowHeat: renderFormItemSchema({
            title: I18N.cbam.averagePerHour,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          emissionCoefficient: renderFormItemSchema({
            title: I18N.cbam.operateWithinTheCycle,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          conversionRate: renderFormItemSchema({
            title: I18N.cbam.averageSmokeFlow,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          oxRate: renderFormItemSchema({
            title: I18N.cbam.fossilFuelsContain,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          carbon: renderFormItemSchema({
            title: I18N.cbam.biomassEnergy,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          title: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.certificationReviewCenter.proofMaterials,
              isFormily: true,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          supportFile: renderFormItemSchema({
            required: false,
            type: 'array',
            'x-component': 'FormilyFileUpload',
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
        },
      },
    },
  );
