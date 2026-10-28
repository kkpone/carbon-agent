import { connect, mapProps } from '@formily/react';
import classNames from 'classnames';
import React, { FC } from 'react';

import checkSvg from './check.svg';
import styles from './index.module.less';

type RadioCardProps = {
  disabled?: boolean;
  options?: { label: string; value: string }[];
  onChange?: (value: string) => void;
  value: string;
};

const RadioCard: FC<RadioCardProps> = props => {
  const { options, disabled, onChange, value } = props;

  const clickCard = (cardValue: string) => {
    if (disabled) {
      return;
    }
    onChange?.(cardValue);
  };
  return (
    <div className={styles.wrapper}>
      {options?.map(item => (
        <div
          className={classNames(styles.card, {
            [styles.checked]: item.value === value,
          })}
          onClick={() => clickCard(item.value)}
        >
          {item.label}
          {item.value === value && (
            <img className={styles.checkSvg} src={checkSvg} alt='' />
          )}
        </div>
      ))}
    </div>
  );
};

export const FormilyRadioCard = connect(
  RadioCard,
  mapProps({
    dataSource: 'options',
  }),
);
