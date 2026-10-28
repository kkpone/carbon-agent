/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-04-03 14:27:51
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-03 14:28:55
 */
import I18N from '@src/lang/I18N';
import emptyImg from '@src/assets/svg/empty.svg';

import styles from './index.module.less';

const Empty = () => (
  <div className={styles.empty}>
    <img src={emptyImg} alt='' />
    <span className={styles.emptyText}>
      {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
    </span>
  </div>
);

export default Empty;
