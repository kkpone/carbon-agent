/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field } from '@formily/core';
import { connect, mapProps, mapReadPretty, useField } from '@formily/react';
import { GetComponentProps } from '@src/utils/utilTypes';
import { Select } from 'antd';
import { BaseOptionType } from 'antd/lib/select';
import { useEffect, useRef, useState } from 'react';

type InputSelectValue = {
  id: string | number;
  name: string | number;
  isManualInput?: boolean;
};

type InputSelectProps = Omit<
  GetComponentProps<typeof Select>,
  'value' | 'onChange'
> & {
  value?: InputSelectValue;
  onChange: (val: InputSelectValue | undefined) => void;
};

const InputSelect = (props: InputSelectProps) => {
  const searchValueRef = useRef('');

  const [innerOptions, setInnerOptions] = useState<BaseOptionType[]>([]);

  const { value, fieldNames, options, onChange, ...restProps } = props;

  const valueKey = fieldNames?.value || 'value';
  const labelKey = fieldNames?.label || 'label';

  const onSelectChange = (opt: BaseOptionType | undefined) => {
    if (opt) {
      onChange({
        id: opt[valueKey],
        name: opt[labelKey],
        isManualInput: opt.isManualInput,
      });
    } else {
      onChange(opt);
    }
  };

  const onSearch = (searchVal: string) => {
    setTimeout(() => {
      searchValueRef.current = searchVal;
    });
  };

  const onBlur = () => {
    const searchVal = searchValueRef.current.trim();

    if (searchVal) {
      const opt = innerOptions.find(item => item[labelKey] === searchVal);
      if (opt) {
        onChange({
          id: opt[valueKey],
          name: opt[labelKey],
          isManualInput: opt.isManualInput,
        });
      } else {
        onChange({
          id: searchVal,
          name: searchVal,
          isManualInput: true,
        });
        setInnerOptions([
          ...innerOptions,
          { [labelKey]: searchVal, [valueKey]: searchVal, isManualInput: true },
        ]);
      }
    }
  };

  useEffect(() => {
    setInnerOptions(options || []);
  }, [options]);

  return (
    <Select
      {...restProps}
      value={value?.id}
      fieldNames={fieldNames}
      options={innerOptions}
      showSearch
      onSearch={onSearch}
      onBlur={onBlur}
      onChange={(_, opt) => onSelectChange(opt)}
    />
  );
};

const InputSelectReadPretty = (props: { value?: InputSelectValue }) => {
  const { value } = props;
  const { dataSource, componentProps } = useField<Field>();

  return <div className='ant-form-text'>{value?.name ?? '-'}</div>;
};

const FormilyInputSelect = connect(
  InputSelect,
  mapProps({ value: true }, (props, field) => ({
    ...props,
    options: (field as Field).dataSource || props.options,
  })),
  mapReadPretty(InputSelectReadPretty),
);

export default FormilyInputSelect;
