import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
} from '@/components/formily/utils';

import {
  ACTIVITY_UNIT_ENUM,
  ACTIVITY_UNIT_OPTIONS,
  METHOD_ENUM,
} from './constant';

const { T } = ACTIVITY_UNIT_ENUM;

const { SLOPE, OVERPRESSURE } = METHOD_ENUM;

/** 大于等于-999999999.999999小于等于999999999.999999），保留6位小数数字 */
const numberPropsDataNegative = {
  min: -999999999.999999,
  max: 999999999.999999,
  precision: 6,
};

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

/** 大于等于0小于等于1的数字，保留6位小数 */
const numberProps6 = {
  min: 0,
  max: 1,
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
          processMethod: renderFormItemSchema({
            title: I18N.cbam.method,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
          }),
          sourceName: renderFormItemSchema({
            title: I18N.cbam.technicalType,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          activityData: renderFormItemSchema({
            title: I18N.eca.activityData,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsDataNegative,
            },
          }),
          activityUnit: renderFormItemSchema({
            title: I18N.eca.activityDataSheet,
            default: T,
            required: false,
            'x-disabled': true,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
            enum: ACTIVITY_UNIT_OPTIONS,
          }),
          lowHeat: renderFormItemSchema({
            title: I18N.cbam.theAnodicEffect2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SLOPE} }}`,
                },
              },
            },
          }),
          emissionCoefficient: renderFormItemSchema({
            title: I18N.cbam.theAnodicEffect,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SLOPE} }}`,
                },
              },
            },
          }),
          conversionRate: renderFormItemSchema({
            title: I18N.cbam.slopeEmissionSystem,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${SLOPE} }}`,
                },
              },
            },
          }),
          biomassContent: renderFormItemSchema({
            title: I18N.cbam.theAnodeEffectHasPassed2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${OVERPRESSURE} }}`,
                },
              },
            },
          }),
          carbonFossil: renderFormItemSchema({
            title: I18N.cbam.theAnodeEffectHasPassed,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${OVERPRESSURE} }}`,
                },
              },
            },
          }),
          carbonBiological: renderFormItemSchema({
            title: I18N.cbam.overvoltageCoefficient,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${OVERPRESSURE} }}`,
                },
              },
            },
          }),
          oxRate: renderFormItemSchema({
            title: I18N.cbam.carbonHexafluoride,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberProps6,
            },
          }),
          carbon: renderFormItemSchema({
            title: I18N.cbam.collectUnorganizedData,
            required: false,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
              min: 0.01,
            },
          }),
          empty: renderEmptySchema({
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ !!$deps[0] }}`,
                },
              },
            },
          }),
          title: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.supplyChainCarbonManagement.evidenceMaterials,
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
