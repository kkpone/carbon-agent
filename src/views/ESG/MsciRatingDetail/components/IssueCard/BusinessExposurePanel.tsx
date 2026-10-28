import I18N from '@src/lang/I18N';
import { FC, useState } from 'react';

import { BusinessExposureItem } from './BusinessExposureItem';
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

interface BusinessExposureDataItem {
  id?: number | string;
  name?: string;
  score?: string | number;
  content?: string;
  suggestion?: string;
}

interface BusinessExposurePanelProps {
  title?: string;
  score?: string | number;
  items?: BusinessExposureDataItem[];
  suggestion?: string;
}

const BusinessExposurePanel: FC<BusinessExposurePanelProps> = ({
  title = I18N.esg.businessExposure,
  score,
  items = [],
  suggestion,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.bizSection}>
      <div
        className={styles.subSectionTitleRow}
        onClick={() => setOpen(prev => !prev)}
      >
        <span>{title}</span>
        <span className={styles.bizSectionScore}>
          {/* <DownOutlined
            className={styles.bizSectionChevron}
            rotate={open ? 180 : 0}
          /> */}
          {formatNumber(score)}
        </span>
      </div>
      {!open
        ? null
        : items.map((item, idx) => (
            <BusinessExposureItem
              key={item.id || idx}
              name={item.name}
              score={item.score}
              content={item.content}
              // suggestion={item.suggestion}
            />
          ))}
      {open && suggestion && (
        <div className={styles.cardLineSuggestion}>
          <div className={styles.cardLineSuggestionTitle}>
            {I18N.carbonFootprint3.optimizationSuggestions}
          </div>
          <div>{suggestion}</div>
        </div>
      )}
    </div>
  );
};

export default BusinessExposurePanel;
