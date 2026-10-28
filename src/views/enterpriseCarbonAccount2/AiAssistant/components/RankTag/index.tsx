import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';

const ScoresTag: FC<{ scores: string }> = ({ scores }) => (
  <div
    className={classNames(styles.companyRankTag, {
      [styles.companyRankTagAA]: scores === 'A',
      [styles['companyRankTagA-']]: scores === 'A-',
      [styles.companyRankTagBB]: scores === 'B',
      [styles['companyRankTagB-']]: scores === 'B-',
      [styles.companyRankTagCC]: scores === 'C',
      [styles['companyRankTagC-']]: scores === 'C-',
      [styles.companyRankTagDD]: scores === 'D',
      [styles['companyRankTagD-']]: scores === 'D-',
      [styles.companyRankTagOther]: scores === I18N.carbonFootprint3.other,
    })}
  >
    {scores}
  </div>
);

export default ScoresTag;
