/**
 * @description 贡献度分析表格的百分比
 */

import { Progress, Tooltip } from 'antd';

import { formatScientific } from '@/utils';

import styles from './index.module.less';

interface ContributionProgressProps {
  percent: number;
  value?: number;
  showPercent: boolean;
}

export const ContributionProgress = ({
  percent,
  value,
  showPercent,
}: ContributionProgressProps) => {
  const showValue = value
    ? value.toLocaleString('en-US', {
        maximumFractionDigits: 20,
        useGrouping: false,
      })
    : value;

  return (
    <div className={styles.contributionProgressWrapper}>
      <Progress
        strokeColor='#fda633'
        size='small'
        showInfo={false}
        percent={percent ? Math.abs(percent) : 0}
      />
      <Tooltip title={showValue}>
        <span className={styles.values}>
          {showPercent ? `${percent ?? '-'}%` : formatScientific(value, true)}
        </span>
      </Tooltip>
    </div>
  );
};
