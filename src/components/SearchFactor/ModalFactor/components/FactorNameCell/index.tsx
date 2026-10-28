import AiIcon from '@src/assets/icon/ai.svg';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import Typography from 'antd/lib/typography';

import TextWidthOverflow from '@/views/carbonFootprint3/component/TextOverflowTable/byWidth';

import type { SerachCarbonFactorResult } from '../../../type';
import styles from './index.module.less';

const FactorNameCell = ({ factor }: { factor: SerachCarbonFactorResult }) => (
  <div className={styles.cell}>
    <div className={styles.heading}>
      <Tooltip title={factor.name} placement='topLeft'>
        <Typography.Paragraph className={styles.name} ellipsis={{ rows: 2 }}>
          {factor.name}
        </Typography.Paragraph>
      </Tooltip>
      {(!!factor.recommendReason?.length || factor.useStatus === 1) && (
        <div className={styles.badges}>
          {!!factor.recommendReason?.length && (
            <img
              src={AiIcon}
              alt='AI'
              width={20}
              height={20}
              className={styles.aiIcon}
            />
          )}
          {factor.useStatus === 1 && (
            <span className={styles.used}>{I18N.components.used}</span>
          )}
        </div>
      )}
    </div>
    {!!factor.referenceProductName?.trim() && (
      <Tooltip title={factor.referenceProductName} placement='topLeft'>
        <Typography.Text className={styles.referenceProductName} ellipsis>
          {factor.referenceProductName}
        </Typography.Text>
      </Tooltip>
    )}
    {!!factor.recommendReason?.length && (
      <div className={styles.recommendReason}>
        <TextWidthOverflow
          value={I18N.template(I18N.components.aiRecommendationTheory, {
            val1: factor.recommendReason,
          })}
          width={640}
        />
      </div>
    )}
  </div>
);

export default FactorNameCell;
