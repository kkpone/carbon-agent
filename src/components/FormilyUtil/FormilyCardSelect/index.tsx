import selectImg from '@assets/svg/tabSelect.svg';
import { Field } from '@formily/core';
import { connect, mapProps } from '@formily/react';
import { IconAlibaba } from '@src/components/iconfont';
import classNames from 'classnames';

import styles from './index.module.less';

type FormilyCardSelectProps<T extends number | string = number> = {
  value: T;
  options: {
    value: T;
    title: string;
    icon?: string;
    iconSelect?: string;
    desc?: string;
  }[];
  onChange: (value: T) => void;
};

const FormilyCardSelect = ({
  value,
  options,
  onChange,
}: FormilyCardSelectProps) => (
  <div className={styles.cardSelectContainer}>
    {options.map(({ value: optionValue, title, icon, iconSelect, desc }) => {
      const selected = optionValue === value;
      const iconName = selected ? iconSelect : icon ?? icon;

      return (
        <div
          className={classNames(styles.card, {
            [styles.cardSelected]: selected,
          })}
          key={optionValue}
          onClick={() => onChange(optionValue)}
        >
          <div className={styles.cardTitleContent}>
            {iconName && (
              <IconAlibaba className={styles.cardIcon} type={iconName} />
            )}
            <div
              className={classNames(styles.cardTitle, {
                [styles.cardTitleSelected]: selected,
              })}
            >
              {title}
            </div>
          </div>
          <div className={styles.cardDesc}>{desc}</div>
          {selected && (
            <img className={styles.selectedImg} src={selectImg} alt='' />
          )}
        </div>
      );
    })}
  </div>
);

export default connect(
  FormilyCardSelect,
  mapProps({ value: true }, (props, field) => ({
    ...props,
    options:
      ((field as Field).dataSource as FormilyCardSelectProps['options']) || [],
  })),
);
