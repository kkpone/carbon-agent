import { Tooltip } from 'antd';
import { FC } from 'react';

import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import { Indicator } from '../../type';

const FormulaTooltip: FC<{ indicator: Indicator }> = ({ indicator }) => {
  const indicatorFormula = indicator.indicatorFormula || [];

  if (indicatorFormula.length > 0) {
    return (
      <Tooltip title={indicatorFormula.map(({ label }) => label).join('')}>
        <IconAlibaba className={styles.infoIcon} type='icon-icon_info' />
      </Tooltip>
    );
  }

  return null;
};

export default FormulaTooltip;
