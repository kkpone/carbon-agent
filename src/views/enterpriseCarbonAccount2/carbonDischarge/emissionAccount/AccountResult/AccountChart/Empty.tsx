import I18N from '@src/lang/I18N';
import emptyImg from '@src/assets/svg/empty.svg';
import classNames from 'classnames';

import styles from './index.module.less';

export default (props: { classNames?: string; text?: React.ReactNode }) => (
  <div className={classNames(styles.empty, props.classNames)}>
    <img src={emptyImg} alt='' />
    <span className={styles.emptyText}>{props.text ?? I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}</span>
  </div>
);
