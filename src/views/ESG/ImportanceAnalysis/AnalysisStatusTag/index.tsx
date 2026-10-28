import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';
import {
  IMPORTANCE_ANALYSIS_STATUS,
  IMPORTANCE_ANALYSIS_STATUS_LABEL,
} from '../constant';

const AnalysisStatusTag: FC<{ status: number }> = ({ status }) => (
  <div
    className={classNames(styles.statusTag, {
      [styles.unPublishedTag]:
        status === IMPORTANCE_ANALYSIS_STATUS.UN_PUBLISHED,
      [styles.publishedTag]: status === IMPORTANCE_ANALYSIS_STATUS.PUBLISHED,
      [styles.closedTag]: status === IMPORTANCE_ANALYSIS_STATUS.CLOSED,
    })}
  >
    {IMPORTANCE_ANALYSIS_STATUS_LABEL[status]}
  </div>
);

export default AnalysisStatusTag;
