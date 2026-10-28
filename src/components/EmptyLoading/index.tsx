/**
 * @file 当数据加载中时展示的loading
 */

import { Spin, SpinProps } from 'antd';
import classNames from 'classnames';
import styles from './index.module.scss';

type Props = { size?: SpinProps['size']; className?: string };

export const EmptyLoading = ({ size, className }: Props) => (
  <div className={classNames(styles.emptyLoadingWrapper, className)}>
    <Spin size={size ?? 'large'} />
  </div>
);
