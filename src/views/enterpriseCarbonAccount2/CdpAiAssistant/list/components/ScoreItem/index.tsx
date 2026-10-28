import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';

export interface IScoreItemProps {
  label: string;
  score: string;
  modelType: '1' | '2' | '3' | '4';
  /** 1 完整版 2 中小版 */
  reportVersion: string;
}

export const ScoreItem: FC<IScoreItemProps> = props => {
  const { label, score, modelType, reportVersion } = props;
  return (
    <div className={styles.scoreItem}>
      <div className={styles.label}>{label}: </div>
      <div
        className={classNames(styles.score, {
          [styles.scoreA]: modelType === '1',
          [styles.scoreB]: modelType === '2',
          [styles.scoreC]: modelType === '3',
          [styles.scoreD]: modelType === '4',
        })}
      >
        {reportVersion === '2' ? 'SME' : ''} {score || '-'}
      </div>
    </div>
  );
};
