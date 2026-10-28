import I18N from '@src/lang/I18N';
import { FC } from 'react';

import styles from './index.module.less';

/** 模型共享标识（Figma 3977-12132） */
const ModelShareBadge: FC = () => (
  <span className={styles.badge}>
    <span className={styles.text}>{I18N.carbonFootprint3.modelShare}</span>
  </span>
);

export default ModelShareBadge;
