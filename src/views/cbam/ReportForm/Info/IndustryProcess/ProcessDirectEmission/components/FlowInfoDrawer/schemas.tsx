import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

import { ACTIVITY_UNIT_OPTIONS, METHOD_ENUM } from './constant';

const { BURNING, PROCESS_EMISSION, MATERIAL_BALANCE } = METHOD_ENUM;

/** 大于等于0小于等于1，保留6位小数数字 */
const numberPropsData6 = {
  min: 0,
  max: 1,
  precision: 6,
};

/** 大于等于-999999999.999999小于等于999999999.999999，保留6位小数数字 */
const numberPropsData = {
  min: -999999999.999999,
  max: 999999999.999999,
  precision: 6,
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
          processMethod: renderFormItemSchema({
            title: I18N.cbam.method,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
          }),
          sourceName: renderFormItemSchema({
            title: I18N.cbam.sourceName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
          }),
          activityData: renderFormItemSchema({
            title: I18N.eca.activityData,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
          }),
          activityUnit: renderFormItemSchema({
            title: I18N.eca.activityDataSheet,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
            enum: ACTIVITY_UNIT_OPTIONS,
          }),
          lowHeat: renderFormItemSchema({
            title: I18N.cbam.lowHeatGeneration2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['emissionCoefficientUnit'],
              fulfill: {
                schema: {
                  required: `{{ $deps[0] === 'tCO2/TJ' }}`,
                },
              },
            },
          }),
          lowHeatUnit: renderFormItemSchema({
            title: I18N.cbam.lowHeatGeneration,
            required: false,
            'x-component': 'Input',
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['activityUnit'],
              fulfill: {
                schema: {
                  'x-value': `{{ $deps[0] ? 'GJ/' + $deps[0] : '' }}`,
                },
              },
            },
          }),
          emissionCoefficient: renderFormItemSchema({
            title: I18N.cbam.emissionCoefficient,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${BURNING} || $deps[0] === ${PROCESS_EMISSION} }}`,
                },
              },
            },
          }),
          emissionCoefficientUnit: renderFormItemSchema({
            title: I18N.cbam.emissionCoefficientSheet,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${BURNING} || $deps[0] === ${PROCESS_EMISSION} }}`,
                },
              },
            },
          }),
          oxRate: renderFormItemSchema({
            title: I18N.cbam.carbonOxidationRate,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${BURNING} }}`,
                },
              },
            },
          }),
          conversionRate: renderFormItemSchema({
            title: I18N.cbam.conversionCoefficient,
            default: 100,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${PROCESS_EMISSION} }}`,
                },
              },
            },
          }),
          conversionRateUnit: renderFormItemSchema({
            default: '%',
            required: false,
            'x-component': 'Input',
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${BURNING} || $deps[0] === ${PROCESS_EMISSION} }}`,
                },
                state: {
                  title: `{{ $deps[0] === ${BURNING} ? textMap?.carbonOxidationRateUnit : textMap?.conversionCoefficientUnit }}`,
                },
              },
            },
          }),
          carbon: renderFormItemSchema({
            title: I18N.cbam.carbonContent,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData6,
            },
            'x-reactions': {
              dependencies: ['processMethod'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${MATERIAL_BALANCE} }}`,
                },
              },
            },
          }),
          carbonUnit: renderFormItemSchema({
            title: I18N.cbam.carbonContentUnit,
            required: false,
            default: I18N.cbam.tcActivityCount,
            'x-component': 'Input',
            'x-disabled': true,
            'x-reactions': {
              dependencies: ['processMethod', 'activityUnit'],
              fulfill: {
                schema: {
                  'x-visible': `{{ $deps[0] === ${MATERIAL_BALANCE} }}`,
                  'x-value': `{{ $deps[1] ? 'tC/' + $deps[1] : '' }}`,
                },
              },
            },
          }),
          biomassContent: renderFormItemSchema({
            title: I18N.cbam.biomassContent3,
            required: false,
            default: 0,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
          }),
          biomassContentUnit: renderFormItemSchema({
            title: I18N.cbam.biomassContent2,
            default: '%',
            required: false,
            'x-component': 'Input',
            'x-disabled': true,
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
