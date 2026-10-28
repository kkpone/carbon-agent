import { Tooltip } from 'antd';
import { isNull } from 'lodash-es';
import { FC, useMemo } from 'react';

import styles from './index.module.less';

export interface IProgressItemProps {
  progress: {
    name: string;
    bgColor?: string;
    percent: number;
    score: string;
    /** 1 完整版 2 中小版 */
    reportVersion?: string;
    line1Percent?: number | null;
    line2Percent?: number | null;
    disableBgColor?: string;
    reportScore?: string;
  };
}

const indexArr = [
  'A',
  'A-',
  'B',
  'B-',
  'C',
  'C-',
  'D',
  'D-',
  'E',
  'E-',
  'F',
  'F-',
];

export const ProgressItem: FC<IProgressItemProps> = props => {
  const { progress } = props;

  const {
    percent = 70,
    bgColor = 'red',
    line1Percent,
    line2Percent,
    disableBgColor,
    score,
    reportScore,
  } = progress;

  const index = indexArr.findIndex(item => item === score);

  const reportIndex = indexArr.findIndex(item => item === reportScore);

  const calculateLeft = useMemo(() => {
    // 中小企业版本只有 line1，没有 line2
    if (!isNull(line1Percent) && isNull(line2Percent) && score !== 'A') {
      return `${(line1Percent || 0) / 2 - 8}%`;
    }
    return `${((line1Percent || 0) + (line2Percent || 100)) / 2 - 9}%`;
  }, [line1Percent, line2Percent, score]);

  return (
    <div className={styles.progressItem}>
      <div className={styles.title}>{progress.name}</div>
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{
            backgroundColor:
              (reportIndex <= index && reportIndex !== -1) ||
              reportScore === 'A' ||
              reportScore === 'A-'
                ? bgColor
                : disableBgColor || '#E5E5E5',
            width: `${percent}%`,
          }}
        />
        {!isNull(line1Percent) && line1Percent !== 100 && (
          <Tooltip title={`${line1Percent}%`}>
            <div
              className={styles.lines1}
              style={{ left: `${line1Percent}%` }}
            />
          </Tooltip>
        )}
        {!isNull(line2Percent) && line2Percent !== 100 && (
          <Tooltip title={`${line2Percent}%`}>
            <div
              className={styles.lines2}
              style={{ left: `${line2Percent}%` }}
            />
          </Tooltip>
        )}
      </div>
      <div className={styles.scores}>
        <div
          className={styles.score}
          style={{
            backgroundColor:
              reportIndex <= index + 1 && reportIndex !== -1
                ? bgColor
                : disableBgColor || '#E5E5E5',
            visibility: progress.reportVersion === '2' ? 'hidden' : 'visible',
            left: `${(line1Percent || 0) / 2 - 8}%`,
          }}
        >
          {progress.score}-
        </div>
        <div
          className={styles.score}
          style={{
            backgroundColor:
              reportIndex <= index && reportIndex !== -1
                ? bgColor
                : disableBgColor || '#E5E5E5',
            left: calculateLeft,
          }}
        >
          {progress.score || '-'}
        </div>
      </div>
    </div>
  );
};
