/**
 * @file
 */
import { Form } from 'antd';
import { Rule } from 'antd/lib/form';
import { NamePath } from 'antd/lib/form/interface';
import {
  Selector,
  Props as SelectorProps,
  filterOption,
} from '../../carbonManagement/Selector';

export type BaseProps = {
  label: string;
  rules?: Rule[];
  name: NamePath;
};
export type Props = BaseProps & Omit<SelectorProps, 'aria-label'>;

export const RenderSelect = ({ label, rules, name, ...props }: Props) => (
  <Form.Item label={label} name={name} rules={rules}>
    <Selector
      {...props}
      aria-label={typeof name === 'object' ? name.join('-') : name}
      filterOption={filterOption}
    />
  </Form.Item>
);
