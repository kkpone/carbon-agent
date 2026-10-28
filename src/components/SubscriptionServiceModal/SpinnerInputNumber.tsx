import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, InputNumber } from 'antd';
import { FC } from 'react';

import styles from './index.module.less';

interface SpinnerInputNumberProps {
  value?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  width?: number | string;
  className?: string;
  placeholder?: string;
  // 可选的值列表，如果提供，点击 +/- 时会跳到列表中的下一个/上一个值
  allowedValues?: number[];
}

/**
 * 带增减按钮的数字输入框组件
 * 参考 antd 6.x InputNumber 的 mode: 'spinner'
 */
export const SpinnerInputNumber: FC<SpinnerInputNumberProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  width = 120,
  allowedValues,
  ...restProps
}) => {
  const handleDecrease = () => {
    if (disabled) return;
    const currentValue = value ?? min;
    if (currentValue <= min) return;

    // 如果提供了 allowedValues，找到当前值在列表中的位置，然后跳到上一个值
    if (allowedValues && allowedValues.length > 0) {
      const sortedValues = [...allowedValues].sort((a, b) => a - b);
      // 找到当前值在列表中的位置（找到小于等于当前值的最大值）
      let currentIndex = -1;
      for (let i = sortedValues.length - 1; i >= 0; i--) {
        if (sortedValues[i] <= currentValue) {
          currentIndex = i;
          break;
        }
      }
      // 如果找到了，跳到上一个值；如果没找到或已经是第一个，跳到最小值
      if (currentIndex > 0) {
        onChange?.(sortedValues[currentIndex - 1]);
        return;
      }
      if (currentIndex === 0) {
        // 已经是第一个，跳到 min
        onChange?.(min);
        return;
      }
    }

    // 默认行为：使用 step
    const newValue = currentValue - step;
    const finalValue = Math.max(min, newValue);
    onChange?.(finalValue);
  };

  const handleIncrease = () => {
    if (disabled) return;
    const currentValue = value ?? min;
    if (max !== undefined && currentValue >= max) return;

    // 如果提供了 allowedValues，找到当前值在列表中的位置，然后跳到下一个值
    if (allowedValues && allowedValues.length > 0) {
      const sortedValues = [...allowedValues].sort((a, b) => a - b);
      // 找到当前值在列表中的位置（找到大于等于当前值的最小值）
      let currentIndex = -1;
      for (let i = 0; i < sortedValues.length; i++) {
        if (sortedValues[i] >= currentValue) {
          currentIndex = i;
          break;
        }
      }
      // 如果找到了，跳到下一个值；如果没找到或已经是最后一个，跳到最大值
      if (currentIndex >= 0 && currentIndex < sortedValues.length - 1) {
        onChange?.(sortedValues[currentIndex + 1]);
        return;
      }
      if (currentIndex === sortedValues.length - 1) {
        // 已经是最后一个，跳到 max
        if (max !== undefined) {
          onChange?.(max);
        }
        return;
      }
      if (currentIndex === -1) {
        // 当前值不在列表中，跳到第一个值
        onChange?.(sortedValues[0]);
        return;
      }
    }

    // 默认行为：使用 step
    const newValue = currentValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    onChange?.(finalValue);
  };

  const currentValue = value ?? min;
  const isDecreaseDisabled = disabled || currentValue <= min;
  const isIncreaseDisabled =
    disabled || (max !== undefined && currentValue >= max);

  return (
    <div className={styles.numberInput} style={{ width }}>
      <Button
        className={styles.numberButton}
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        icon={<MinusOutlined />}
      />
      <InputNumber
        className={styles.numberInputField}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={val => onChange?.(typeof val === 'number' ? val : null)}
        controls={false}
        placeholder={restProps.placeholder}
      />
      <Button
        className={styles.numberButton}
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        icon={<PlusOutlined />}
      />
    </div>
  );
};
