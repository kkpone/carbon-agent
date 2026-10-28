import { FC } from 'react';
import {
  InputProps,
  Input,
  InputNumber,
  InputNumberProps,
  DatePicker,
  DatePickerProps,
  Radio,
  RadioGroupProps,
  SelectProps,
  Select,
  Cascader,
  CascaderProps,
  Checkbox,
  Upload,
  UploadProps,
  Table,
  TabPaneProps,
  TreeSelect,
  TreeSelectProps,
} from 'antd';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import { TextAreaProps } from 'antd/lib/input';

const { TextArea } = Input;
/**
 * ComstomInput
 * 输入框 文本输入框
 * **/
export const ComstomInput: FC<InputProps> = ({ ...props }) => (
  <Input {...props} />
);

/**
 * ComstomInputNumber
 * 输入框 数字输入框
 * ***/
export const ComstomInputNumber: FC<InputNumberProps> = ({ ...props }) => (
  <InputNumber stringMode {...props} controls={false} />
);

/**
 * ComstomDatePicker
 * 日期组件
 * **/
export const ComstomDatePicker: FC<DatePickerProps> = ({ ...props }) => (
  <DatePicker style={{ width: '100%' }} {...props} />
);
/**
 * ComstomRadio
 * RadioGroup 组件
 * **/
export const ComstomRadioGroup: FC<RadioGroupProps> = ({ ...props }) => (
  <Radio.Group {...props} />
);
/**
 * ComstomSelect
 * Select 组件
 * **/
export const ComstomSelect: FC<SelectProps> = ({ ...props }) => (
  <Select style={{ width: 120 }} {...props} />
);
export const ComstomTreeSelect: FC<TreeSelectProps> = ({ ...props }) => (
  <TreeSelect style={{ width: 120 }} {...props} />
);
/**
 * ComstomCascader
 * Cascader组件
 * **/
export const ComstomCascader: FC<
  CascaderProps<
    | { dictValue: string; dictLabel: string }
    | {
        label: string;
        value: string;
        children?: { label: string; value: string }[];
      }
  >
> = ({ ...props }) => <Cascader {...props} />;
/** *
 * ComstomCheckboxGroup：
 * CheckboxGroup： 组件
 * **/
export const ComstomCheckboxGroup: FC<CheckboxGroupProps> = ({ ...props }) => (
  <Checkbox.Group {...props} />
);

/**
 * TextArea
 * **/
export const ComstomTextArea: FC<TextAreaProps> = ({ ...props }) => (
  <TextArea {...props} />
);

/**
 * 图片上传组件
 * **/
export const ComstomUploada: FC<UploadProps> = ({ ...props }) => (
  <Upload {...props}>{props.children}</Upload>
);

/**
 * 表格
 * **/
export const ComstomTable: FC<TabPaneProps> = ({ ...props }) => (
  <>
    <Table {...props} />
    {props.children}
  </>
);
