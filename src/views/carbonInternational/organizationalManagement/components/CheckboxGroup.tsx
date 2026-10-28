/**
 * @file checkbox group
 */

import I18N from '@src/lang/I18N';
import { Checkbox, Form } from 'antd';
import { CheckboxChangeEvent, CheckboxOptionType } from 'antd/lib/checkbox';
import { useEffect, useState } from 'react';
import { BaseProps } from './Selector';

type ValueType = string[] | number[];
type Options = (string | CheckboxOptionType)[];
export type Props = {
  onChange: (arr: ValueType) => void;
  value?: ValueType;
  options?: Options;
  disabled?: boolean;
  showCheckAll?: boolean;
  wrapperClass?: string;
} & BaseProps;

export const RenderCheckboxGroup = ({
  label,
  name,
  disabled,
  onChange,
  rules,
  value,
  options,
  wrapperClass,
  showCheckAll = true,
}: Props) => {
  const [checked, setChecked] = useState<ValueType>([]);
  const isValueType = (options?: Options): options is string[] =>
    typeof options?.[0] === 'string';

  const [indeterminate, setIndeterminate] = useState(false);
  const onCheckAllChange = (ev: CheckboxChangeEvent) => {
    const { checked } = ev.target;
    if (checked) {
      setIndeterminate(false);
      if (isValueType(options)) setChecked(options);
      else {
        setChecked(
          (options as unknown as { value: string }[]).map(({ value }) => value),
        );
      }
    } else {
      setIndeterminate(false);
      setChecked([]);
    }
  };
  const changeCheckbox = (arr: ValueType) => {
    if (!options?.length) {
      setChecked([]);
      setIndeterminate(false);
      return;
    }
    const len = arr.length;
    if (len) {
      const isAll = len === options.length;
      setIndeterminate(!isAll);
    } else {
      setIndeterminate(false);
    }
    setChecked(arr);
  };
  useEffect(() => {
    onChange(checked);
  }, [checked]);
  const isCheckAll = (value || checked).length === options?.length;
  return (
    <Form.Item label={label} name={name} rules={rules}>
      <div className={wrapperClass}>
        {showCheckAll && (
          <Checkbox
            indeterminate={isCheckAll ? false : indeterminate}
            onChange={onCheckAllChange}
            checked={isCheckAll}
            disabled={disabled}
          >
            {I18N.carbonFootprint3.whole}
          </Checkbox>
        )}
        <Checkbox.Group
          options={options}
          disabled={disabled}
          value={value || checked}
          onChange={val => changeCheckbox(val as ValueType)}
        />
      </div>
    </Form.Item>
  );
};
