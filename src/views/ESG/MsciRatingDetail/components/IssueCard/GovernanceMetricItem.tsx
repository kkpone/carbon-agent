import I18N from '@src/lang/I18N';
import { DownOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';
import referSvg from '@assets/svg/refer.svg';

import styles from './index.module.less';

interface GovernanceMetricItemProps {
  name?: string;
  score?: string | number;
  content?: string;
  suggestion?: string;
}

const GovernanceMetricItem: FC<GovernanceMetricItemProps> = ({
  name,
  score,
  content,
  suggestion,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.metricItem}>
      <div
        className={styles.metricHeader}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.metricChevron}>
          <DownOutlined rotate={open ? 180 : 0} />
        </span>
        <span className={styles.metricTitle}>
          {name || I18N.esg.governanceIndicators}
          {score !== undefined && score !== null ? `：${score}` : ''}
        </span>
      </div>
      {!open ? null : (
        <div className={styles.metricBox}>
          <div className={styles.metricContentRow}>
            <div className={styles.bulletWrap}>
              <img src={referSvg} alt='' />
            </div>
            <div className={styles.metricContentText}>{content || '—'}</div>
          </div>
          {suggestion ? (
            <div className={styles.metricSuggestion}>
              <div className={styles.metricSuggestionTag}>
                {I18N.carbonFootprint3.optimizationSuggestions}
              </div>
              <div className={styles.metricSuggestionText}>{suggestion}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GovernanceMetricItem;
