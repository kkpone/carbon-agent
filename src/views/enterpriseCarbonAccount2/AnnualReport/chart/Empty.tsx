/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-24 14:13:57
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-30 19:00:00
 */
import I18N from '@src/lang/I18N';
import emptyImg from '@src/assets/svg/empty.svg';
import classNames from 'classnames';
import { ReactNode } from 'react';

import styles from '../index.module.less';

export default (props: { className?: string; text?: ReactNode }) => (
  <div className={classNames(styles.empty, props.className)}>
    <img src={emptyImg} alt='' />
    <span className={styles.emptyText}>{props.text ?? I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}</span>
  </div>
);
