import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
  renderEmptySchema,
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
          editData: {
            type: 'object',
            properties: {
              fuelIn: renderFormItemSchema({
                title: I18N.cbam.fuelInputT,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsData,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              hotOut: renderFormItemSchema({
                title: I18N.cbam.thermalOutputT,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsData,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              eleOut: renderFormItemSchema({
                title: I18N.cbam.powerOutputT,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsData,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              emptyOne: renderEmptySchema({
                'x-decorator-props': {
                  gridSpan: 5,
                },
              }),
              fuelOut: renderFormItemSchema({
                title: I18N.cbam.fuelInputExhaust,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsData,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              smokeOut: renderFormItemSchema({
                title: I18N.cbam.smokePurificationExhaust,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsData,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              hotPer: renderFormItemSchema({
                title: I18N.cbam.thermalProductionEfficiency,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsPercent,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              elePer: renderFormItemSchema({
                title: I18N.cbam.electricityProductionEfficiency,
                'x-component': 'NumberPicker',
                'x-component-props': {
                  ...numberPropsPercent,
                },
                'x-decorator-props': {
                  gridSpan: 1,
                },
              }),
              emptyTwo: renderEmptySchema({
                'x-decorator-props': {
                  gridSpan: 5,
                },
              }),
            },
          },
          otherTitle: renderFormItemSchema({
            required: false,
            'x-component': 'InfoTitle',
            'x-component-props': {
              title: I18N.cbam.combinedHeatAndPowerGeneration2,
              isFormily: true,
              borderLeft: false,
            },
            'x-decorator-props': {
              gridSpan: 5,
            },
          }),
          outPower: renderFormItemSchema({
            title: I18N.cbam.outputHeatDissipation2,
            required: false,
            'x-disabled': true,
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.cbam.outputHeatDissipation,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          emptyThree: renderEmptySchema({
            'x-decorator-props': {
              gridSpan: 5,
            },
          }),
          outFactor: renderFormItemSchema({
            title: I18N.cbam.outputPowerGrid2,
            required: false,
            'x-disabled': true,
            'x-component': 'NumberPicker',
            'x-component-props': {
              placeholder: I18N.cbam.outputPowerGrid,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
        },
      },
    },
  );
