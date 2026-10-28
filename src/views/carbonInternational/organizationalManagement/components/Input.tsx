/**
 * @file input
 */

import I18N from '@src/lang/I18N';
import { Form } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import { Rule } from 'antd/lib/form';
import { Input, NewInputProps } from '@src/components/Input';
import { BaseProps } from './Selector';
import style from './formItems.module.less';

export type Props = {
  placeholder?: string;
  // type 为 number 时，输入 - 返回的是空值，无法正常判断，要避免这种使用
  // type?: InputProps['type'];
  onChange: (val: string) => void;
  disabled?: boolean;
  prop2?: {
    name: NamePath;
    label?: string;
    rules?: Rule[];
  };
} & BaseProps &
  Omit<NewInputProps, 'name' | 'aria-label'>;

export const RenderInput = ({
  label,
  name,
  rules,
  placeholder,
  onChange,
  prop2,
  ...props
}: Props) => (
  <>
    <Form.Item label={label} name={name} rules={rules}>
      <Input
        {...props}
        aria-label={String(typeof name === 'object' ? name.join('-') : name)}
        placeholder={placeholder ?? I18N.components.pleaseFillIn}
        onChange={ev => onChange(ev.target.value)}
      />
    </Form.Item>
    {prop2 && (
      <Form.Item
        className={style.hiddenFormItem}
        label={prop2.label}
        name={prop2.name}
        rules={prop2?.rules}
      />
    )}
  </>
);
