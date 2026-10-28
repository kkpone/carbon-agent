import I18N from '@src/lang/I18N';
import emptyImg from '@src/assets/svg/empty.svg';
import classNames from 'classnames';

import styles from './index.module.less';

const Empty = ({
  className,
  emptyTip,
}: {
  className?: string;
  emptyTip?: string;
}) => (
  <div className={classNames(styles.empty, className)}>
    <img className={styles.emptyImg} alt='' src={emptyImg} />
    <div className={styles.emptyTip}>
      {emptyTip || I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
    </div>
  </div>
);

export default Empty;
