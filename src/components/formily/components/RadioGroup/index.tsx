import { connect, mapProps } from '@formily/react';
import { CheckboxOptionType } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import checkedSvg from './checked.svg';
import styles from './index.module.less';

interface IRadioGroupProps {
  options: Array<CheckboxOptionType>;
  value?: string | number;
  onChange: (e: string | number) => void;
  disabled?: boolean;
  extraNode?: React.ReactNode;
}

const RadioGroupComponent: FC<IRadioGroupProps> = props => {
  const { onChange, value, options, disabled, extraNode } = props;
  return (
    <>
      <div className={styles.wrapper}>
        {options.map(option => (
          <div
            className={classNames(styles.item, {
              [styles.checked]: value === option.value,
              [styles.disabled]: disabled,
              [styles.disabledChecked]: disabled || option.disabled,
            })}
            onClick={() => {
              if (disabled || option.disabled) return;
              onChange(option.value);
            }}
          >
            {option.label}
            {value === option.value && (
              <img className={styles.checkedIcon} src={checkedSvg} alt='' />
            )}
          </div>
        ))}
      </div>
      {extraNode}
    </>
  );
};

export const RadioGroup = connect(
  RadioGroupComponent,
  mapProps({
    dataSource: 'options',
  }),
);
