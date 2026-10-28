/**
 * @description 外购产品信息
 * @description 字段是动态的，且需要保证固定的布局，所以拆开写
 */
import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderSchemaWithLayout,
  renderFromGridSchema,
} from '@/components/formily/utils';

import { CALCINE_OPTIONS } from './constant';

const inputNumberFormatter = (
  value: string | number | undefined,
  info: { userTyping: boolean; input: string },
) => {
  if (info.userTyping) return info.input;
  if (value === undefined || value === '') return '';
  return String(value).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
};

/** 大于等于0小于等于999999999.999999，保留6位小数数字 */
const numberPropsData = {
  precision: 6,
  min: 0,
  max: 999999999.999999,
  formatter: inputNumberFormatter,
};

/** 大于等于0小于等于100的数字，保留6位小数 */
const numberPropsPercent = {
  min: 0,
  max: 100,
  precision: 6,
  formatter: inputNumberFormatter,
};

export const schemaOne = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          processId: renderFormItemSchema({
            title: I18N.cbam.processName,
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
          productName: renderFormItemSchema({
            title: I18N.Factors.productName,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
          }),
          cnCode: renderFormItemSchema({
            title: I18N.cbam.cnClassificationName,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            'x-reactions': [
              `{{ useAsyncCNDataSource() }}`,
              {
                dependencies: ['processId'],
                fulfill: {
                  state: {
                    disabled: `{{ !$deps[0] || $form.readPretty }}`,
                  },
                },
              },
            ],
          }),
          // 以下为非固定展示字段
          reducing: renderFormItemSchema({
            title: I18N.cbam.theMainPrecursor,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
              allowClear: true,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          steelCode: renderFormItemSchema({
            title: I18N.cbam.steelMillIdentificationNumber,
            'x-component': 'Input',
            'x-component-props': {
              maxLength: 100,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          mnPer: renderFormItemSchema({
            title: I18N.cbam.manganeseElementRatio,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            required: false,
            'x-visible': false,
          }),
          crPer: renderFormItemSchema({
            title: I18N.cbam.chromiumElementRatio,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            required: false,
            'x-visible': false,
          }),
          niPer: renderFormItemSchema({
            title: I18N.cbam.nickelElementRatio,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            required: false,
            'x-visible': false,
          }),
          alloyPer: renderFormItemSchema({
            title: I18N.cbam.otherAlloyRatios,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaTwo = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          cper: renderFormItemSchema({
            title: I18N.cbam.carbonContent2,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          materialPer: renderFormItemSchema({
            title: I18N.cbam.otherMaterialsAccountFor,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaThree = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          steelScrap: renderFormItemSchema({
            title: I18N.cbam.usagePerTonOfSteel,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          wasteMaterial: renderFormItemSchema({
            title: I18N.cbam.preConsumptionWaste,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaFour = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          alUse: renderFormItemSchema({
            title: I18N.cbam.usagePerTonOfAluminum,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          nonAl: renderFormItemSchema({
            title: I18N.cbam.nonAluminumElementsAccountFor,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaFive = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          clinker: renderFormItemSchema({
            title: I18N.cbam.clinkerParameters,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsData,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          calcine: renderFormItemSchema({
            title: I18N.cbam.whetherToCalcineOrNot,
            enum: CALCINE_OPTIONS,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'label',
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          solution: renderFormItemSchema({
            title: I18N.cbam.concentratedAqueousSolution,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          nitric: renderFormItemSchema({
            title: I18N.cbam.nitricAcidRatio,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 4,
            },
            required: false,
            'x-visible': false,
          }),

          urea: renderFormItemSchema({
            title: I18N.cbam.urea,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          nitrogen: renderFormItemSchema({
            title: I18N.cbam.nitrogenContent,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaSix = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          ammonium: renderFormItemSchema({
            title: I18N.cbam.nIsAmmoniumNitrogen,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          noPer: renderFormItemSchema({
            title: I18N.cbam.nAsNitrate,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );

// 以下为非固定展示字段
export const schemaSeven = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema({
          columns: 4,
        }),
        properties: {
          urPer: renderFormItemSchema({
            title: I18N.cbam.nIsInTheFormOfUrea,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
          organic: renderFormItemSchema({
            title: I18N.cbam.nInOtherForms,
            'x-component': 'NumberPicker',
            'x-component-props': {
              ...numberPropsPercent,
            },
            'x-decorator-props': {
              gridSpan: 2,
            },
            required: false,
            'x-visible': false,
          }),
        },
      },
    },
  );
