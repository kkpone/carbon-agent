import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';

interface ICustomRadioProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const CustomRadio: FC<ICustomRadioProps> = props => {
  const { items, value, onChange } = props;
  return (
    <div className={styles.radioGroup}>
      {items.map(item => (
        <div
          key={item.value}
          className={classNames(styles.item, {
            [styles.checked]: item.value === value,
          })}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};
