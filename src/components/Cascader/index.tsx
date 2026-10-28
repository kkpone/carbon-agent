/*
 * @@description:补充 ant cascader 样式
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:39:10
 */

import I18N from '@src/lang/I18N';
import { Cascader as CascaderAnt, CascaderProps } from 'antd';
import classNames from 'classnames';

import { AntdAddedType } from '../Input/type';
import styles from '../Select/index.module.less';

type NewCascaderProps<DataNodeType> = CascaderProps<DataNodeType> &
  AntdAddedType;

export const Cascader = <DataNodeType,>({
  readonly,
  disabled,
  className,
  ...props
}: NewCascaderProps<DataNodeType>) => (
  // @ts-ignore
  <CascaderAnt
    {...props}
    placeholder={props?.placeholder || I18N.carbonFootprint.pleaseSelect}
    disabled={readonly || disabled}
    popupClassName={classNames(
      props.dropdownClassName,
      `cascader-dropdown-${props['aria-label']}`,
    )}
    className={classNames(className, {
      [styles.selectDisabled]: disabled,
      [styles.selectReadonly]: readonly,
    })}
  />
);
