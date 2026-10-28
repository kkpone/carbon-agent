/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-06 15:15:45
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-28 15:15:30
 */
// import selectImg from '@assets/images/tabSelect.png';
import { Field } from '@formily/core';
import { connect, mapProps, mapReadPretty, useField } from '@formily/react';
import { IconAlibaba } from '@src/components/iconfont';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_ICON,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { MATCH_WAY_LABEL } from '@src/views/carbonFootprint3/discharge/process/constant';
import classNames from 'classnames';

import styles from './index.module.less';

const { FACTOR_CREATE, FACTOR } = MODEL_EMISSION_MATCH_WAY;
const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

type FormilyButtonSelectProps = {
  value: number | string;
  options: { value: number | string; label: number | string; icon?: string }[];
  disabled: boolean;
  variant?: 'button' | 'tab';
  onChange: (value: number | string) => void;
};

const FormilyButtonSelect = ({
  value,
  options,
  disabled,
  variant = 'button',
  onChange,
}: FormilyButtonSelectProps) => {
  let valueChange = value;

  // 产品碳足迹3.5.5版本中去除了新建因子按钮，但是保留新建因子功能所以单独处理,将新建因子转换为因子按钮的值
  if (value === FACTOR_CREATE) {
    valueChange = FACTOR;
  }

  // 处理兼容供应商填报的逻辑，因为供应商是传递了一个新建因子
  // 但是产品碳足迹3.5.5版本优化开始，只允许一个因子信息的按钮，新建因子信息在内部手动填写设置
  if (
    options.length === 1 &&
    options.find(opt => opt.value === FACTOR_CREATE)
  ) {
    options = [
      {
        value: FACTOR,
        label: MATCH_WAY_LABEL[FACTOR],
        icon: FACTOR_ICON,
      },
    ];
  }

  return (
    <div
      className={classNames(styles.buttonSelectContainer, {
        [styles.tabSelectContainer]: variant === 'tab',
      })}
    >
      {options.map(({ value: optionValue, label, icon }) => (
        <div
          className={classNames(styles.defaultBtn, {
            [styles.activeBtn]: valueChange === optionValue,
            [styles.disabledBtn]: disabled,
            [styles.tabBtn]: variant === 'tab',
            [styles.tabActiveBtn]:
              variant === 'tab' && valueChange === optionValue,
          })}
          key={optionValue}
          onClick={() => {
            if (!disabled && valueChange !== optionValue) {
              onChange(optionValue);
            }
          }}
        >
          {icon && (
            <IconAlibaba
              type={icon}
              className={classNames(styles.defaultIcon, {
                [styles.activeIcon]: valueChange === optionValue,
              })}
            />
          )}

          <span>{label}</span>
          {/* {valueChange === optionValue && (
            // <img className={styles.selectImg} src={selectImg} alt='' />
          )} */}
        </div>
      ))}
    </div>
  );
};

const FormilyButtonSelectReadPretty = (props: { value: number }) => {
  let valueChange = props.value;

  // 产品碳足迹3.5.5版本中去除了新建因子按钮，但是保留新建因子功能所以单独处理,将新建因子转换为因子按钮的值
  if (props.value === FACTOR_CREATE) {
    valueChange = FACTOR;
  }
  const field = useField<Field>();
  const options = field.dataSource
    ? (field.dataSource as { label: string; value: number; icon?: string }[])
    : [];
  return (
    <div className={styles.buttonSelectContainer}>
      {options.map(({ value: optionValue, label, icon }) => (
        <div
          className={classNames(styles.defaultBtn, {
            [styles.activeBtn]: valueChange === optionValue,
          })}
          key={optionValue}
          style={{ cursor: 'default' }}
        >
          {icon && (
            <IconAlibaba
              type={icon}
              className={classNames(styles.defaultIcon, {
                [styles.activeIcon]: valueChange === optionValue,
              })}
            />
          )}

          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default connect(
  FormilyButtonSelect,
  mapProps({ value: true }, (props, field) => ({
    ...props,
    options:
      ((field as Field).dataSource as FormilyButtonSelectProps['options']) ||
      [],
  })),
  mapReadPretty(FormilyButtonSelectReadPretty),
);
