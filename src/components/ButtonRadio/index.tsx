import { CheckboxOptionType } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';

interface IButtonRadioProps {
  options: Array<CheckboxOptionType>;
  value?: string | number;
  onChange: (e: string | number) => void;
}

export const ButtonRadio: FC<IButtonRadioProps> = props => {
  const { onChange, value, options } = props;
  return (
    <div className={styles.wrapper}>
      {options.map(option => (
        <div
          className={classNames(styles.item, {
            [styles.checked]: value === option.value,
          })}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};
