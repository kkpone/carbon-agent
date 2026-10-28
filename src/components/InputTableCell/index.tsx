import { Input, InputProps } from 'antd';
import { memo, useEffect, useState } from 'react';

const InputTableCell = memo(
  (
    props: Omit<InputProps, 'onBlur'> & {
      onBlur?: (val: InputProps['value']) => void;
    },
  ) => {
    const { value, onChange, onBlur, ...restProps } = props;
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    return (
      <Input
        {...restProps}
        value={internalValue}
        onChange={e => {
          setInternalValue(e.target.value);
          onChange?.(e);
        }}
        onBlur={() => onBlur?.(internalValue)}
      />
    );
  },
);

export default InputTableCell;
