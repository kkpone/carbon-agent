import I18N from '@src/lang/I18N';
import { InputProps } from 'antd';
import { ReactNode } from 'react';
import { FromItemProps, SearchFormTypes } from './type';

/**
 * 表单初始化中有些自定义属性和参数
 */
export const formPropsInit = () => ({
  preserve: false,
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
});

/**
 * 初始化输入框的item，减少重复代码
 * @param label 描述
 * @param name 表单name
 * @param rules 默认不传递就是true
 * @returns 返回定义好的数据
 */
type FormItemInputSchema = {
  label?: string | ReactNode;
  name: string;
  placeholder?: string;
  rules?: boolean;
  props?: InputProps;
  col?: number;
};
export const formItemInputSchema = ({
  label,
  name,
  rules,
  props,
  placeholder,
  col,
}: FormItemInputSchema): FromItemProps<'input'> => ({
  type: 'input',
  rules: !!rules,
  label,
  name,
  col,
  props: {
    allowClear: true,
    placeholder:
      placeholder ||
      (typeof label === 'string' ? label : I18N.carbonFootprint.pleaseEnter),
    ...props,
  },
});
export const formItemInitInput = (
  label: React.ReactNode,
  name: string,
  rules: boolean,
) => formItemInputSchema({ label, name, rules });

/**
 * 初始化类型减少重复的代码
 * @param type 当前的类型
 * @param label 描述
 * @param name 表单name
 * @param rules 是否限制类型
 * @returns 自定义的格式
 */
export const formItemInitType = (
  type: SearchFormTypes,
  label: React.ReactNode,
  name: string,
  rules: boolean,
  other?: Omit<FromItemProps<any>, 'type' | 'label' | 'name' | 'rules'>,
) => ({
  type,
  rules,
  label,
  name,
  ...other,
});
