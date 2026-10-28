/*
 * @@description:
 */
import { Form } from '@formily/core';

import { ORG_STATUS } from '@/utils/const';

interface FieldConfig {
  fieldName: string;
  dataList?: any[];
  labelKey?: string;
  valueKey?: string;
  isDisabled?: boolean;
  dataSource?: any[];
}
/**
 * 用来循环处理表单字段数据源和禁用状态方法
 * @param {IForm} form - The Formily form instance.
 * @param {FieldConfig[]} fieldsConfig - An array of configurations for form fields.
 */
export const updateFormFieldStates = (
  form: Form,
  fieldsConfig: FieldConfig[],
) => {
  fieldsConfig.forEach(
    ({
      fieldName,
      dataList,
      dataSource,
      labelKey,
      valueKey,
      isDisabled = false,
    }) => {
      form.setFieldState(fieldName, state => {
        state.dataSource =
          dataSource ||
          dataList?.map?.(item => ({
            label: labelKey && item[labelKey],
            value: valueKey && item[valueKey],
            disabled: item.orgStatus === ORG_STATUS.DISABLE,
          }));
        state.disabled = isDisabled;
      });
    },
  );
};
