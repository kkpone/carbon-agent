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
import { FC } from 'react';

import FileUpload from '@/components/FileUpload';
import useFieldFlattenUnitDictSource from '@/hooks/useFieldFlattenUnitDataSource';

import styles from './index.module.less';

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
const FactorSource: FC<{
  form: FormType;
  sourceFileList: { name: string; uid: string; url: string }[];
  disabled?: boolean;
  setSourceFileList: (
    val: { name: string; uid: string; url: string }[],
  ) => void;
}> = props => {
  const { form, disabled, sourceFileList, setSourceFileList } = props;

  // 生成从今年往前50年的年份选项（包括今年）
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    {
      label: I18N.components.unlimited,
      value: I18N.components.unlimited,
    },
    ...Array.from({ length: 50 }, (_, index) => {
      const year = currentYear - index;
      return {
        label: `${year}`,
        value: `${year}`,
      };
    }),
  ];

  return (
    <Form
      className={styles.factorSource}
      layout='vertical'
      form={form}
      colon={false}
      previewTextPlaceholder='-'
    >
      <SchemaField
        scope={{ useFieldFlattenUnitDictSource, yearOptions }}
        schema={{
          type: 'object',
          properties: {
            sourceGrid: {
              type: 'void',
              'x-component': 'FormGrid',
              'x-component-props': {
                maxColumns: 3,
                columnGap: 24,
              },
              properties: {
                documentType: {
                  type: 'string',
                  title: I18N.components.sourceFileCategory,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.components.sourceFileCategory,
                    disabled,
                    allowClear: true,
                  },
                  'x-reactions': [
                    '{{useFieldFlattenUnitDictSource("documentType")}}',
                  ],
                },
                sourceLevel: {
                  type: 'string',
                  title: I18N.ccdb.sourceAnalogy,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.ccdb.sourceAnalogy,
                    disabled,
                    allowClear: true,
                  },
                  'x-reactions': [
                    '{{useFieldFlattenUnitDictSource("sourceLevel")}}',
                  ],
                },
                source: {
                  type: 'string',
                  title: I18N.components.sourceFileName,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.components.sourceFileName,
                    disabled,
                  },
                },
                institution: {
                  type: 'string',
                  title: I18N.carbonFootprint.publishingInstitution,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.carbonFootprint.publishingInstitution,
                    disabled,
                  },
                },
                gwp: {
                  type: 'string',
                  title: I18N.components.gwpConversion,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.components.gwpConversion,
                    disabled,
                    allowClear: true,
                  },
                  'x-reactions': [
                    '{{useFieldFlattenUnitDictSource("gwpVersion")}}',
                  ],
                },
                year: {
                  type: 'string',
                  title: I18N.carbonFootprint.yearOfPublication,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.carbonFootprint.yearOfPublication,
                    picker: 'year',
                    disabled,
                  },
                },
                publishDate: {
                  type: 'string',
                  title: I18N.components.releaseDate,
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.components.releaseDate,
                    disabled,
                  },
                },
                applyYear: {
                  type: 'string',
                  title: I18N.components.dataValidityYear3,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    disabled,
                    placeholder: disabled
                      ? ''
                      : I18N.components.dataValidityYear2,
                    options: '{{yearOptions}}',
                  },
                },
                applyYearEnd: {
                  type: 'string',
                  title: I18N.components.dataValidityYear,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    disabled,
                    placeholder: disabled
                      ? ''
                      : I18N.components.dataValidityYear,
                    options: '{{yearOptions}}',
                  },
                },
                countries: {
                  type: 'string',
                  title: I18N.components.releaseInstitutionLocation,
                  required: !disabled,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: disabled
                      ? ''
                      : I18N.components.releaseInstitutionLocation,
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
                url: {
                  type: 'string',
                  title: I18N.emission.websiteResources,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    gridSpan: 3,
                  },
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: disabled ? '' : I18N.emission.websiteResources,
                    disabled,
                  },
                },
              },
            },
          },
        }}
      />
      <div>
        <div className={styles.fileTitle}>
          {I18N.carbonFootprint.sourceFile}
        </div>
        {!disabled && (
          <div className={styles.fileTip}>{I18N.components.supportPdf2}</div>
        )}
      </div>
      <FileUpload
        disabled={disabled}
        fileList={sourceFileList}
        onChange={setSourceFileList}
      />
    </Form>
  );
};

export default FactorSource;
