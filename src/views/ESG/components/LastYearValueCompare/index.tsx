import { isNil } from 'lodash-es';
import { FC } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';

const LastYearValueCompare: FC<{
  prev?: string | number;
  current?: string | number;
  unitName?: string;
}> = ({ prev, current, unitName }) => {
  const prevValue = Number(prev);
  const currentValue = Number(current);
  const compareValue = Number(
    ((Math.abs(currentValue - prevValue) / prevValue) * 100).toFixed(0),
  );

  return !isNil(prev) && prev !== '' ? (
    <div className={styles.compare}>
      <div className={styles.prev}>
        <div className={styles.prevValue} title={`${prev}`}>
          {prev}
        </div>
        <div className={styles.unitName}>{unitName}</div>
      </div>
      {!Number.isNaN(compareValue) && Number.isFinite(compareValue) && (
        <div className={styles.compareValue}>
          <IconAlibabaNew
            type={currentValue > prevValue ? 'icon-up' : 'icon-down'}
          />
          <span>{compareValue}%</span>
        </div>
      )}
    </div>
  ) : null;
};

export default LastYearValueCompare;
