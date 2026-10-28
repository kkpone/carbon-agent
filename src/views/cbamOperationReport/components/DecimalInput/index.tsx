import { Form, Input } from 'antd';
import type { InputProps } from 'antd';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import I18N from '@src/lang/I18N';

import styles from './index.module.less';

export interface DecimalInputLimit {
  decimalPlaces?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  allowNegative?: boolean;
}

interface DecimalInputProps
  extends Omit<InputProps, 'value' | 'onChange' | 'maxLength' | 'inputMode'>,
    DecimalInputLimit {
  value?: string | number;
  onValueChange: (value: string) => void;
}

export const QUANTITY_INPUT_LIMIT: DecimalInputLimit = {
  min: 0,
  maxLength: 40,
};
export const NON_NEGATIVE_SIX_DECIMAL_LIMIT: DecimalInputLimit = {
  min: 0,
  max: '999999999.999999',
  decimalPlaces: 6,
  maxLength: 16,
};
export const SIGNED_SIX_DECIMAL_LIMIT: DecimalInputLimit = {
  min: '-999999999.999999',
  max: '999999999.999999',
  decimalPlaces: 6,
  maxLength: 17,
  allowNegative: true,
};
export const PERCENT_SIX_DECIMAL_LIMIT: DecimalInputLimit = {
  min: 0,
  max: 100,
  decimalPlaces: 6,
  maxLength: 10,
};
export const PERCENT_TWO_DECIMAL_LIMIT: DecimalInputLimit = {
  min: 0,
  max: 100,
  decimalPlaces: 2,
  maxLength: 6,
};
export const RATIO_SIX_DECIMAL_LIMIT: DecimalInputLimit = {
  min: 0,
  max: 1,
  decimalPlaces: 6,
  maxLength: 8,
};
export const NON_CBAM_QUANTITY_LIMIT: DecimalInputLimit = {
  min: 0,
  decimalPlaces: 4,
  maxLength: 20,
};

const valueText = (value?: string | number) =>
  value === undefined || value === null ? '' : String(value);

const DecimalInput = ({
  value,
  onValueChange,
  decimalPlaces,
  maxLength = 40,
  min,
  max,
  allowNegative = false,
  onBlur,
  ...inputProps
}: DecimalInputProps) => {
  const [rejected, setRejected] = useState(false);
  const decimalPattern =
    decimalPlaces === undefined ? '\\d*' : `\\d{0,${decimalPlaces}}`;
  const pattern = new RegExp(
    `^${allowNegative ? '-?' : ''}\\d*(?:\\.${decimalPattern})?$`,
  );
  const minValue = min === undefined ? undefined : new BigNumber(min);
  const maxValue = max === undefined ? undefined : new BigNumber(max);
  const hint =
    min !== undefined && max !== undefined
      ? I18N.template(I18N.cbamOperationReport.decimalRangeInputHint, {
          min: valueText(min),
          max: valueText(max),
          decimalPlaces: decimalPlaces ?? '-',
        })
      : decimalPlaces === undefined
      ? I18N.template(I18N.cbamOperationReport.numberInputHint, { maxLength })
      : I18N.template(I18N.cbamOperationReport.decimalInputHint, {
          decimalPlaces,
        });

  const isAllowedValue = (candidate: string, allowIntermediate = false) => {
    if (!candidate) return true;
    if (candidate.length > maxLength || !pattern.test(candidate)) return false;
    if (allowIntermediate && candidate === '-') return allowNegative;
    const comparableValue = candidate.endsWith('.')
      ? candidate.slice(0, -1)
      : candidate;
    if (!comparableValue || comparableValue === '-') return false;
    const numberValue = new BigNumber(comparableValue);
    return (
      numberValue.isFinite() &&
      !(minValue && numberValue.isLessThan(minValue)) &&
      !(maxValue && numberValue.isGreaterThan(maxValue))
    );
  };
  const currentValue = valueText(value);
  const invalid = Boolean(currentValue) && !isAllowedValue(currentValue);
  const showError = invalid || rejected;

  useEffect(() => {
    setRejected(false);
  }, [currentValue]);

  return (
    <div style={{ width: '100%' }}>
      <Form.Item
        className={showError ? styles.errorField : undefined}
        validateStatus={showError ? 'error' : undefined}
        help={showError ? hint : null}
        style={{ marginBottom: 0 }}
      >
        <Input
          {...inputProps}
          value={currentValue}
          inputMode='decimal'
          placeholder={undefined}
          status={showError ? 'error' : inputProps.status}
          aria-invalid={showError}
          onChange={event => {
            const nextValue = event.target.value;
            if (isAllowedValue(nextValue, true)) {
              setRejected(false);
              onValueChange(nextValue);
            } else {
              setRejected(true);
            }
          }}
          onBlur={onBlur}
        />
      </Form.Item>
    </div>
  );
};

export default DecimalInput;
