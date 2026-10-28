import { connect } from '@formily/react';
import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';

import styles from './index.module.less';

type Value = string | number;
const CustomSelect: FC<{
  className?: string;
  multiple?: boolean;
  value?: Value | Value[];
  style?: React.CSSProperties;
  options?: { value: number | string; label: string; [P: string]: any }[];
  optionRender?: (
    opt: { value: number | string; label: string; [P: string]: any },
    selected: boolean,
  ) => ReactNode;
  onChange: (val: Value | Value[]) => void;
}> = props => {
  const { className, options, value, multiple, style, optionRender, onChange } =
    props;

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.content, className)} style={style}>
        {options?.map(option => {
          const selected = multiple
            ? (value instanceof Array ? value : []).includes(option.value)
            : value === option.value;

          return (
            <div
              onClick={() => {
                if (multiple) {
                  const newVal = value instanceof Array ? value : [];
                  onChange(
                    selected
                      ? newVal.filter(v => v !== option.value)
                      : [...newVal, option.value],
                  );
                } else {
                  onChange(option.value);
                }
              }}
            >
              {optionRender?.(option, selected) || (
                <div
                  className={classNames(styles.option, {
                    [styles.selectedOption]: selected,
                  })}
                >
                  {option.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default connect(CustomSelect);
