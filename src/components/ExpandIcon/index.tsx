import classNames from 'classnames';

import styles from './index.module.less';
import { IconAlibaba } from '../iconfont';

const ExpandIcon = ({
  expanded,
  onClick,
}: {
  expanded?: boolean;
  onClick?: () => void;
}) => (
  <IconAlibaba
    className={classNames(styles.expandArrow, {
      [styles.activeExpandArrow]: expanded,
    })}
    type='icon-icon_arrow_rioght'
    onClick={onClick}
  />
);

export default ExpandIcon;
