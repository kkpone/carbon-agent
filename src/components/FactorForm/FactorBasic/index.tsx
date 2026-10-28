import {
  FormItem,
  Input,
  Select,
  Cascader,
  Form,
  FormGrid,
  DatePicker,
} from '@formily/antd-v5';
import { Form as FormType } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Dispatch, FC } from 'react';

import useFieldFlattenUnitDictSource from '@/hooks/useFieldFlattenUnitDataSource';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';

import styles from './index.module.less';
import { NUMBER_FACTOR_TYPE } from '../constant';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Cascader,
    FormGrid,
    DatePicker,
  },
});
const FactorBasic: FC<{
  form: FormType;
  disabled?: boolean;
  showEmissionLabel?: boolean;
  setGasList?: Dispatch<React.SetStateAction<Record<string, any>[]>>;
}> = props => {
  const { form, disabled, showEmissionLabel = true, setGasList } = props;

  return (
    <Form
      className={styles.factorBasic}
      layout='vertical'
      form={form}
      colon={false}
      previewTextPlaceholder='-'
    >
      <SchemaField
        scope={{ useFieldUnitDictSource, useFieldFlattenUnitDictSource }}
        schema={{
          type: 'object',
          properties: {
            basicGrid: {
              type: 'void',
              'x-component': 'FormGrid',
              'x-component-props': {
                maxColumns: 3,
                columnGap: 24,
              },
              properties: {
                name: {
                  type: 'string',
                  title: I18N.carbonFootprint.factorName,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.carbonFootprint.factorName,
                    disabled,
                  },
                },
                sourceLanguageName: {
                  type: 'string',
                  title: I18N.components.factorNameSource,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.components.factorNameSource,
                    disabled,
                  },
                },
                unit: {
                  type: 'string',
                  title: I18N.carbonFootprint.unit,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Cascader',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.carbonFootprint.unit,
                    disabled,
                    displayRender: (label: string[]) =>
                      [...(label || [])].pop(),
                    onChange: (val: string[]) => {
                      setGasList?.(gasList =>
                        gasList.map(gas => ({
                          ...gas,
                          factorUnitM: val?.join(','),
                        })),
                      );
                    },
                  },
                  'x-reactions': [
                    '{{useFieldUnitDictSource("factorUnitM")}}',
                    {
                      dependencies: ['factorType'],
                      fulfill: {
                        state: {
                          visible: `{{!$deps[0] || $deps[0] == ${NUMBER_FACTOR_TYPE}}}`,
                        },
                      },
                    },
                  ],
                },
                unitEmpty: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-reactions': [
                    {
                      dependencies: ['factorType'],
                      fulfill: {
                        state: {
                          visible: `{{!!$deps[0] && $deps[0] != ${NUMBER_FACTOR_TYPE}}}`,
                        },
                      },
                    },
                  ],
                },
                similar: {
                  type: 'string',
                  title: I18N.components.productSynonyms,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    gridSpan: 2,
                  },
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.components.productSynonyms,
                    disabled,
                  },
                },
                business: {
                  type: 'string',
                  title: I18N.emission.industry,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.emission.industry,
                    disabled,
                  },
                  'x-reactions': ['{{useFieldUnitDictSource("business")}}'],
                },
                emissionLabel: {
                  type: 'string',
                  title: I18N.carbonFootprint.emissionSourceType,
                  'x-visible': showEmissionLabel,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.emission.industry,
                    disabled,
                  },
                },
                scope: {
                  type: 'string',
                  title: I18N.components.ghgRange,
                  'x-decorator': 'FormItem',
                  'x-component': 'Cascader',
                  'x-component-props': {
                    multiple: true,
                    placeholder: disabled ? '' : I18N.components.ghgRange,
                    disabled,
                    fieldNames: {
                      value: 'dictValue',
                    },
                  },
                  'x-reactions': ['{{useFieldUnitDictSource("ghg_type")}}'],
                },
                boundary: {
                  type: 'string',
                  title: I18N.components.lcaStage,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.components.lcaStage,
                    disabled,
                    mode: 'multiple',
                    allowClear: true,
                  },
                  'x-reactions': [
                    '{{useFieldFlattenUnitDictSource("boundary")}}',
                  ],
                },
                specification: {
                  type: 'string',
                  title: I18N.carbonFootprint.specificationAndModel,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.carbonFootprint.specificationAndModel,
                    disabled,
                  },
                },
                areaRepresent: {
                  type: 'string',
                  title: I18N.supplyChain.area,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.supplyChain.area,
                    disabled,
                    showSearch: true,
                    filterOption: (input: string, option: { label: string }) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  },
                  'x-reactions': [
                    '{{useFieldFlattenUnitDictSource("reportCountries")}}',
                  ],
                },
                basicEmpty: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    gridSpan: showEmissionLabel ? 1 : 2,
                  },
                },
                description: {
                  type: 'string',
                  title: I18N.components.factorSupplement,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    gridSpan: 2,
                  },
                  'x-component': 'Input.TextArea',
                  'x-component-props': {
                    style: { minHeight: 160 },
                    placeholder: disabled
                      ? ''
                      : I18N.components.pleaseEnterTheFactor2,
                    disabled,
                  },
                },
              },
            },
          },
        }}
      />
    </Form>
  );
};

export default FactorBasic;
