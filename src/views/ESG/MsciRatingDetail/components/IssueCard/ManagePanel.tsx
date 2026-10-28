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

interface ManageDataItem {
  id?: number | string;
  name?: string;
  score?: string | number;
  content?: string;
  suggestion?: string;
  description?: string;
}

interface ManagePanelProps {
  title?: string;
  score?: string | number;
  items?: ManageDataItem[];
}

const ManagePanel: FC<ManagePanelProps> = ({
  title = I18N.esg.managementDimension,
  score,
  items = [],
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
              suggestion={item.suggestion}
              description={item.description}
            />
          ))}
    </div>
  );
};

export default ManagePanel;
