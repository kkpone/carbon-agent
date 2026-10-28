/**
 * @file 当数据加载中时展示的loading
 */

import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import IconFont from '../iconfont';
import styles from './index.module.scss';

type Props = {
  className?: string;
  tipWord?: string;
};

export const EmptyPage = ({
  className,
  tipWord = I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable,
}: Props) => (
  <div className={classNames(styles.emptyLoadingWrapper, className)}>
    <IconFont className={styles.icon} type='icon-icon-zanmoshuju-1' />
    <span className={styles.tipWord}>{tipWord}</span>
  </div>
);
