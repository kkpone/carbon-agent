import I18N from '@src/lang/I18N';
import { FC } from 'react';

import styles from './index.module.less';
import { INDICATOR_FILL_WAY, INDICATOR_TYPE } from '../../constant';
import { Indicator } from '../../type';

const AcIndicatorTag: FC<{ indicator: Indicator }> = ({ indicator }) => {
  const { indicatorType, fillWay } = indicator;

  if (
    indicatorType === INDICATOR_TYPE.NUMERIC &&
    fillWay === INDICATOR_FILL_WAY.AC
  ) {
    return (
      <div className={styles.acTag}>
        {I18N.enterpriseCarbonAccount2.automaticCalculation}
      </div>
    );
  }

  return null;
};

export default AcIndicatorTag;
