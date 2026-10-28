import I18N from '@src/lang/I18N';

import {
  renderFormItemSchema,
  renderFromGridSchema,
  renderSchemaWithLayout,
} from '@/components/formily/utils';

/** 公共的布局 */
const fromGrid = {
  'x-component-props': {
    maxColumns: 1,
    minColumns: 1,
    columnGap: 30,
    rowGap: 1,
    colWrap: true,
  },
};

/** 数据质量的一般信息code码  */
export const GeneralInformation = {
  /** 大多数默认值由欧盟委员会提供code值 */
  majorityCode: 5,
};

export const SelectUtils = {
  allowClear: true,
  showSearch: true,
  filterOption: (input: string, option: { label: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
};

/** 结果汇总-数据质量和质量保障信息表单 */
export const dataQualitySchema = () =>
  renderSchemaWithLayout(
    {},
    {
      grid: {
        ...renderFromGridSchema(fromGrid),
        properties: {
          generalInformation: renderFormItemSchema({
            title: I18N.cbam.theQualityOfData,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'name',
              allowClear: true,
              fieldNames: { label: 'name', value: 'code' },
              style: {
                width: 500,
              },
            },
          }),
          defaultReason: renderFormItemSchema({
            title: I18N.cbam.useDefaultValues,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'name',
              allowClear: true,
              fieldNames: { label: 'name', value: 'code' },
              style: {
                width: 500,
              },
            },
            'x-reactions': {
              dependencies: ['generalInformation'],
              fulfill: {
                state: {
                  disabled: `{{ ($deps[0] === ${GeneralInformation.majorityCode})}}`,
                  required: `{{ ($deps[0] !== ${GeneralInformation.majorityCode})}}`,
                  value: `{{ $deps[0] === ${GeneralInformation.majorityCode} ? '' : $self.value}}`,
                },
              },
            },
          }),
          qualityAssurance: renderFormItemSchema({
            title: I18N.cbam.qualityAssuranceLetter,
            'x-component': 'Select',
            'x-component-props': {
              showSearch: true,
              optionFilterProp: 'name',
              allowClear: true,
              fieldNames: { label: 'name', value: 'code' },
              style: {
                width: 500,
              },
            },
          }),
        },
      },
    },
  );
