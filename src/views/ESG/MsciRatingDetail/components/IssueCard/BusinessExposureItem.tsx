import ReferIcon from '@assets/svg/refer.svg';
import I18N from '@src/lang/I18N';
import { FC, useState } from 'react';

import styles from './index.module.less';

const formatNumber = (
  val: string | number | undefined | null,
  fallback = '--',
) =>
  val === undefined || val === null || val === ''
    ? fallback
    : Number.isNaN(Number(val))
    ? String(val)
    : Number(val);

export interface BusinessExposureItemProps {
  name?: string;
  score?: string | number;
  content?: string;
  suggestion?: string;
  description?: string;
}

export const BusinessExposureItem: FC<BusinessExposureItemProps> = ({
  name,
  score,
  content,
  suggestion,
  description,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.bizItem}>
      <div className={styles.bizHeader} onClick={() => setOpen(prev => !prev)}>
        <span className={styles.bizChevron}>▾</span>
        <span className={styles.bizTitle}>{name || I18N.esg.businessItem}</span>
        <span className={styles.bizScore}>{formatNumber(score)}</span>
      </div>
      {!open ? null : (
        <div className={styles.bizBox}>
          <div className={styles.bizContentRow}>
            <div className={styles.bizBullet}>
              <img src={ReferIcon} alt='' />
            </div>
            <div className={styles.bizContentText}>{content || '—'}</div>
          </div>
          {suggestion ? (
            <div className={styles.bizSuggestion}>
              <div className={styles.bizSuggestionTag}>
                {I18N.carbonFootprint3.optimizationSuggestions}
              </div>
              {description ? (
                <div className={styles.bizSuggestionText}>{description}</div>
              ) : null}
              <div className={styles.bizSuggestionText}>{suggestion}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BusinessExposureItem;
