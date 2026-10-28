import { InputNumber, InputNumberProps, Tooltip } from 'antd';
import { isNil } from 'lodash-es';
import { memo, useEffect, useState, useRef, type ReactNode } from 'react';

import {
  isNumberInputWithinDigitLimits,
  limitNumberInputDigits,
} from '@/utils/limitNumberInputDigits';

type DigitLimitMode = 'truncate' | 'validate';

const NumberInputTableCell = memo(
  (
    props: Omit<InputNumberProps, 'onBlur'> & {
      digitLimitMessage?: ReactNode;
      digitLimitMode?: DigitLimitMode;
      maxDecimals?: number;
      maxIntegerDigits?: number;
      onBlur?: (val: InputNumberProps['value']) => void;
    },
  ) => {
    const {
      value,
      digitLimitMessage,
      digitLimitMode = 'truncate',
      maxDecimals,
      maxIntegerDigits,
      onChange,
      onBlur,
      ...restProps
    } = props;
    const [internalValue, setInternalValue] = useState(value);

    const internalValueRef = useRef(internalValue);
    const digitLimits = { maxDecimals, maxIntegerDigits };
    const hasDigitLimitError =
      digitLimitMode === 'validate' &&
      !isNumberInputWithinDigitLimits(internalValue, digitLimits);

    const limitFn =
      digitLimitMode === 'truncate' &&
      (!isNil(maxDecimals) || !isNil(maxIntegerDigits))
        ? (val: string | number | undefined | null) =>
            limitNumberInputDigits(val, digitLimits)
        : undefined;

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    useEffect(() => {
      internalValueRef.current = internalValue;
    }, [internalValue]);

    const input = (
      <InputNumber
        {...restProps}
        value={internalValue}
        formatter={limitFn}
        parser={limitFn}
        status={hasDigitLimitError ? 'error' : restProps.status}
        aria-invalid={hasDigitLimitError}
        onChange={val => {
          setInternalValue(val);
          onChange?.(val);
        }}
        onBlur={() =>
          setTimeout(() => {
            const currentValue = internalValueRef.current;
            if (
              digitLimitMode === 'validate' &&
              !isNumberInputWithinDigitLimits(currentValue, digitLimits)
            ) {
              return;
            }
            onBlur?.(currentValue);
          })
        }
      />
    );

    return digitLimitMode === 'validate' && digitLimitMessage ? (
      <Tooltip
        title={digitLimitMessage}
        placement='topLeft'
        open={hasDigitLimitError}
      >
        {input}
      </Tooltip>
    ) : (
      input
    );
  },
);

export default NumberInputTableCell;
