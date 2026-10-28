import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { connect, mapProps, ISchema } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Checkbox, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/cascader';
import type { KeyboardEvent } from 'react';

import { factorPublishYear } from '@/views/subModules/CarbonFootprintModel/components/Factor/util';
import type { FactorSourceId } from '@/views/carbonFootprint3/FootprintAccount/component/GlobalFactorPreference/type';

const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some(
    option =>
      (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) >
      -1,
  );

// 带 Tooltip 的 Checkbox 组件
const CheckboxWithTooltipBase = ({
  value,
  onChange,
  disabled,
  children,
  tooltipTitle,
  ...props
}: any) => {
  const checkboxElement = (
    <Checkbox
      checked={value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    >
      {children}
    </Checkbox>
  );

  if (disabled && tooltipTitle) {
    return <Tooltip title={tooltipTitle}>{checkboxElement}</Tooltip>;
  }

  return checkboxElement;
};

export const CheckboxWithTooltip = connect(
  CheckboxWithTooltipBase,
  mapProps({
    value: 'checked',
  }),
);

export const schema = ({
  emissionClassify,
  enableFactorSourceRange,
  factorSourceOptions = [],
  enableEcoinventGeography = false,
}: {
  emissionClassify?: string;
  enableFactorSourceRange?: boolean;
  factorSourceOptions?: { label: string; value: FactorSourceId }[];
  enableEcoinventGeography?: boolean;
}): ISchema => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 24,
          minColumns: 24,
          columnGap: 16,
        },

        properties: {
          factorType: {
            type: 'string',
          },
          sourceIds: {
            type: 'array',
            'x-hidden': true,
          },
          name: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 10,
            },
            'x-component': 'SelectInput',
            'x-component-props': {
              placeholder: I18N.components.pleaseEnterTheFactor,
              defaultActiveFirstOption: false,
              suffixIcon: null,
              filterOption: false,
              showSearch: true,
              notFoundContent: null,
              emissionClassify,
              enableFactorSourceRange,
              factorSourceOptions,
            },
          },
          description: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 8,
            },
            'x-component': 'Input',
            'x-component-props': {
              placeholder: I18N.components.pleaseEnterApplicable,
              allowClear: true,
            },
          },
          useAi: {
            type: 'boolean',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'CheckboxWithTooltip',
            'x-reactions': [
              {
                dependencies: ['.name'],
                when: '{{$deps[0]?.length}}',
                fulfill: {
                  schema: {
                    'x-component-props': {
                      disabled: false,
                      children: I18N.components.aiRecommendation,
                      tooltipTitle: null,
                    },
                  },
                },
                otherwise: {
                  schema: {
                    'x-component-props': {
                      disabled: true,
                      children: I18N.components.aiRecommendation,
                      tooltipTitle: I18N.components.pleaseEnterSearchFirst,
                    },
                  },
                },
              },
            ],
          },
          Submit: {
            type: 'void',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Submit',
            'x-component-props': {
              children: I18N.components.search,
              type: 'primary',
              icon: <SearchOutlined />,
              style: {
                width: '100%',
              },
            },
          },
          Reset: {
            type: 'void',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 2,
            },
            'x-component': 'Reset',
            'x-component-props': {
              children: I18N.utils.reset,
              type: 'default',
              icon: <RedoOutlined />,
              style: {
                width: '100%',
              },
            },
          },
          year: {
            // 年份
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 6,
            },
            'x-component': 'Select',
            'x-component-props': {
              placeholder: I18N.carbonFootprint3.pleaseSelectPublish,
              allowClear: true,
              options: [
                ...factorPublishYear().map(y => ({
                  label: y.toString(),
                  value: y.toString(),
                })),
              ],
            },
          },
          factorUnitM: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 6,
            },
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.carbonFootprint.pleaseSelectAUnit,
              showSearch: {
                filter,
              },
              allowClear: true,
              displayRender: label => {
                if (label.length === 2) {
                  return label[label.length - 1];
                }
                return (
                  <span
                    style={{
                      color: '#b5b8bb',
                    }}
                  >
                    {I18N.carbonFootprint.pleaseSelectAUnit}
                  </span>
                );
              },
            },
            'x-reactions': [
              // '{{useFieldUnitDictSource("factorUnitM")}}',
              // '{{useFieldSetValueByLabel}}',
            ],
          },
          institution: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 6,
            },
            'x-component': 'Select',
            'x-component-props': {
              placeholder: I18N.components.pleaseChooseToPublish2,
              allowClear: true,
            },
          },
          countries: {
            type: 'string',
            title: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              gridSpan: 6,
            },
            'x-component': 'Cascader',
            'x-component-props': {
              placeholder: I18N.components.pleaseChooseToPublish,
              allowClear: true,
              displayRender: label => {
                if (label.length === 2) {
                  return label[label.length - 1];
                }
                return (
                  <span
                    style={{
                      color: '#b5b8bb',
                    }}
                  >
                    {I18N.components.pleaseChooseToPublish}
                  </span>
                );
              },
            },
          },
        },
      },
    },
  };
  if (!enableEcoinventGeography) return data;

  const { year, factorUnitM, institution, countries, ...primaryFields } =
    data.properties.grid.properties;
  const filters: Record<string, ISchema> = {};
  Object.entries({ year, factorUnitM, institution, countries }).forEach(
    ([name, field]) => {
      filters[name] = { ...field, 'x-decorator-props': { gridSpan: 1 } };
    },
  );

  return {
    ...data,
    properties: {
      grid: {
        ...data.properties.grid,
        properties: {
          ...primaryFields,
          filters: {
            type: 'void',
            'x-component': 'FormGrid',
            'x-component-props': {
              minColumns: 4,
              maxColumns: 4,
              columnGap: 16,
              'data-grid-span': 24,
              style: { gridColumn: 'span 24' },
            },
            properties: {
              ...filters,
              ecoinventGeographies: {
                type: 'array',
                default: [],
                'x-visible': false,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  placeholder: I18N.components.pleaseSelectEcoinventGeography,
                  mode: 'multiple',
                  allowClear: true,
                  showSearch: true,
                  fieldNames: { label: 'dictLabel', value: 'dictValue' },
                  optionFilterProp: 'dictLabel',
                  maxTagCount: 'responsive',
                  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === 'Enter') event.stopPropagation();
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};
