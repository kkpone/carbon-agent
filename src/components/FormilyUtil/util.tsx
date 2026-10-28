/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-04 17:56:57
 * @LastEditTime: 2023-03-28 16:12:43
 * @Date: 2022-12-23 17:25:49
 * @@description:
 */

import I18N from '@src/lang/I18N';
import { ISchema } from '@formily/react';
import { DatePickerProps, InputProps, SelectProps } from 'antd';
import { TextAreaProps } from 'antd/es/input/TextArea';

import { InitFormilyProps } from './type';
import { TextProps } from '../formily/components/Text/types';
import { createI18nLabelMap } from '@/lang/createI18nLabelMap';

export { Text } from '@components/formily/components/Text';

/**
 * @description: 根据不同的组件显示不同的提示内容
 */
const validatorMessageByComponentName = createI18nLabelMap({
  Input: () => I18N.components.pleaseFillIn,
  'Input.TextArea': () => I18N.components.pleaseFillIn,
  Select: () => I18N.carbonFootprint.pleaseSelect,
  'Radio.Group': () => I18N.carbonFootprint.pleaseSelect,
  Cascader: () => I18N.carbonFootprint.pleaseSelect,
  'DatePicker.RangePicker': () => I18N.carbonFootprint.pleaseSelect,
});
/**
 * @description: 获取校验必填的提示内容
 * @param {string} componentName 传入的组件名称
 * @param {string} titleName 字段名称
 * @return {string} 返回对应的提示内容
 */
const getValidatorMessage = (componentName: string, titleName: string) => {
  const keys = Object.keys(validatorMessageByComponentName);
  if (keys.includes(componentName)) {
    return validatorMessageByComponentName[componentName] + titleName;
  }
  return I18N.template(I18N.components.noComp, { val1: componentName });
};
/**
 * @description: 设置表单的表头的通用事件
 * @param {string} name 传递表单label名字
 * @return {ReactNode} 返回自定义好的表头
 */
export const uitlNodeTitle = (name: string) => {
  const styleSet: React.CSSProperties = {
    display: 'inline-block',
  };
  return <span style={styleSet}>{name}</span>;
};

/**
 * @description: 组底层的工具，后续拓展的工具需要在该工厂中叠加，轻易不可改动
 * @param {InitFormilyProps} props 基本传参
 */
const initFormily = (props: InitFormilyProps) => {
  const { titleName, required, componentName, componentProps, noShowTitle } =
    props;
  const defaultProps = {
    title: noShowTitle ? false : uitlNodeTitle(titleName),
    required: required || false,
    'x-decorator': 'FormItem',
    'x-component': componentName,
    'x-validator': {
      required: required || false,
      message: getValidatorMessage(componentName, titleName),
    },
    'x-component-props': {
      ...componentProps,
    },
  };
  return defaultProps;
};

/**
 * @description formily 文本渲染组件
 */
export const getTextSchema = ({
  title,
  componentProps,
}: {
  title?: string;
  componentProps?: TextProps;
}) => ({
  ...initFormily({
    titleName: title || '',
    componentName: 'Text',
    componentProps,
  }),
  type: 'string',
});

/**
 * @description: 输入框的表单默认展示
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyInput = (
  titleName: string,
  required?: boolean,
  componentProps?: InputProps,
  noShowTitle?: boolean,
) => {
  const setProps = {
    placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Input',
    componentProps: setProps,
    required,
    noShowTitle,
  });
};
/**
 * @description: 输入框的表单默认展示
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const inputSchema: typeof initFormilyInput = (...props) => ({
  ...initFormilyInput(...props),
  type: 'string',
});

/**
 * @description: 文本框类型
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyInputTextArea = (
  titleName: string,
  required?: boolean,
  componentProps?: TextAreaProps,
  noShowTitle?: boolean,
) => {
  const setProps = {
    placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Input.TextArea',
    componentProps: setProps,
    required,
    noShowTitle,
  });
};
/**
 * @description: 文本框类型
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const textareaSchema: typeof initFormilyInputTextArea = (...props) => ({
  ...initFormilyInputTextArea(...props),
  type: 'string',
});

/**
 * @description: 下拉框类型
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilySelect = (
  titleName: string,
  required?: boolean,
  componentProps?: SelectProps,
  noShowTitle?: boolean,
) => {
  const setProps = {
    placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Select',
    componentProps: setProps,
    required,
    noShowTitle,
  });
};
/**
 * @description: 下拉框类型
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const selectSchema: typeof initFormilySelect = (...props) => ({
  ...initFormilySelect(...props),
  type: 'string',
});
/**
 * @description: 单选框
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyRadio = (
  titleName: string,
  required?: boolean,
  componentProps?: any,
  noShowTitle?: boolean,
) => {
  const setProps = {
    placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Radio.Group',
    componentProps: setProps,
    required,
    noShowTitle,
  });
};

/**
 * @description: 联动选择
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyCascader = (
  titleName: string,
  required?: boolean,
  componentProps?: any,
  noShowTitle?: boolean,
) => {
  const setProps = {
    placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Cascader',
    componentProps: setProps,
    required,
    noShowTitle,
  });
};

/**
 * @description: 日期选择范围
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyDatePicker = (
  titleName: string,
  required?: boolean,
  componentProps?: DatePickerProps,
) => {
  const setProps = {
    // placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'DatePicker.RangePicker',
    componentProps: setProps,
    required,
  });
};
/**
 * @description: 日期选择范围
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const dateRangeSchema: typeof initFormilyDatePicker = (...props) => ({
  ...initFormilyDatePicker(...props),
  type: 'string',
});
/** gridSpan item  */
export const gridColumnSchema = (
  gridSpan: number,
  properties?: ISchema['properties'],
  props?: ISchema,
): ISchema => ({
  type: 'void',
  'x-component': 'FormGrid.GridColumn',
  'x-component-props': {
    gridSpan,
    // fix 防止gridSpan 属性不生效
    style: {
      gridColumn: `span ${gridSpan} / auto`,
    },
  },
  properties,
  ...props,
});

/** 使用 gridColumns 包裹字段
 * @deprecated use gridColumnSchema instead
 */
export const schemaGridColumns = (
  name: string,
  subSchemas: ISchema,
  gridShemas?: ISchema,
) => ({
  type: 'void',
  'x-component': 'FormGrid.GridColumn',
  ...gridShemas,
  properties: {
    [name]: subSchemas,
  },
});

/**
 * @description: 日期选择
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyDate = (
  titleName: string,
  required?: boolean,
  componentProps?: any,
) => {
  const setProps = {
    // placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'DatePicker',
    componentProps: setProps,
    required,
  });
};
/**
 * @description: 多选
 * @param {string} titleName 当前的label
 * @param {boolean} required 是否校验必填
 * @param {any} componentProps 组件的props
 */
export const initFormilyCheckBox = (
  titleName: string,
  required?: boolean,
  componentProps?: any,
) => {
  const setProps = {
    // placeholder: titleName,
    ...componentProps,
  };
  return initFormily({
    titleName,
    componentName: 'Checkbox.Group',
    componentProps: setProps,
    required,
  });
};
