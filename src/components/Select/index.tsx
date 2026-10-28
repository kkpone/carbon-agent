/*
 * @@description:补充 ant select 样式
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:40:24
 */

import { Select as SelectAnt, SelectProps } from 'antd';
import classNames from 'classnames';

import styles from './index.module.less';
import { AntdAddedType } from '../Input/type';

export type NewSelectProps<ValueType, OptionType> = Omit<
  // @ts-ignore
  SelectProps<ValueType, OptionType>,
  'aria-label'
> &
  AntdAddedType;

export const { Option } = SelectAnt;

export const Select = <ValueType, OptionType>({
  readonly,
  disabled,
  className,
  ...props
}: NewSelectProps<ValueType, OptionType>) => (
  // @ts-ignore
  <SelectAnt<ValueType, OptionType>
    {...props}
    aria-label={`${props['aria-label']}`}
    popupClassName={classNames(
      props.dropdownClassName,
      `select-dropdown-${props['aria-label']}`,
    )}
    allowClear
    disabled={readonly || disabled}
    className={classNames(className, {
      [styles.selectDisabled]: disabled,
      [styles.selectReadonly]: readonly,
    })}
  />
);
