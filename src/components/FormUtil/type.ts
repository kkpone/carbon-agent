import { InputNumberProps, TreeSelectProps } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import { NamePath } from 'antd/es/form/interface';
import { CascaderProps } from 'antd/lib/cascader';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import { PickerProps } from 'antd/lib/date-picker/generatePicker';
import { FormProps, Rule } from 'antd/lib/form';
import { RadioGroupProps } from 'antd/lib/radio';
import { Moment } from 'moment';

import { NewInputProps, NewTextAreaProps } from '../Input';
import { SearchInputProps } from '../SearchInput';
import { NewSelectProps } from '../Select';

/** 表单中Form组件调用参数限制 */
export interface FromUtilProps {
  antdFormProps: FormProps & { readonly?: boolean }; // Form 内置的参数
  formItems: FromItemProps<any>[]; // 配置的default数据
  paddRight?: number; // 自定义距离右侧边距
  renderRuleTip?: string;
}

export type SearchFormTypes = keyof FromItemTypeBack | 'render';

/** 表单每一项Item的参数 */
export interface FromItemProps<T extends keyof FromItemTypeBack> {
  className?: string;
  /** 表单文字显示 */
  label: string | React.ReactNode;
  /** 表单对应值的key键 */
  name: string;
  /** 当前使用的表单类型 */
  type: SearchFormTypes;
  /** 默认只是判断是否必填的校验规则 --- 要拓展自己的校验规则就在下方自定义校验规则中添加即可 */
  rules: boolean;
  /** 表单每一项需要的参数 */
  props?: Pick<FromItemTypeBack, T>[T];
  /** 自定义提示内容 */
  placeholder?: string;
  /** 自定义校验规则 */
  rulesCustom?: Rule[];
  /** 布局占用的空间大小 */
  col?: number;
  /** col 标签的className */
  colClassName?: string;
  /** 距离左侧的布局距离 */
  offset?: number;
  /** 占据右侧空间  --- 生成空白元素占据右侧空间 */
  rightOff?: number;
  /** 需要筛选的数据 */
  optionsData?: FromItemOptions[];
  /** 自定义的返回渲染的内容 */
  render?: () => JSX.Element;
  /** 边距 */
  padding?: string;
  dependencies?: NamePath[];

  /** 不显示元素 */
  noShow?: boolean;
}
/** 一般筛选项所拥有的数据格式 */
interface FromItemOptions {
  label: string;
  value: any;
}

/** 表单中可选项的对应类型 */
export interface FromItemTypeBack {
  input: Omit<NewInputProps, 'aria-label'>; // 输入框对应定义的参数
  inputNumber: InputNumberProps; // 数字输入框
  date: PickerProps<Moment>; // 日期对应参数
  textArea: Omit<NewTextAreaProps, 'aria-label'>; // textArea对应参数
  select: Omit<NewSelectProps<any, any>, 'aria-label'>; // 下拉框的参数: 传入的泛型是下拉值的类型
  radio: RadioGroupProps; // 单选的参数
  cascader: CascaderProps<any>; // 联级
  checkbox: CheckboxGroupProps;
  dateRange: RangePickerProps<Moment>;
  treeSelect: TreeSelectProps;
  searchInput: SearchInputProps;
}
