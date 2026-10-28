/**
 * @description 抽屉表单标题头
 */
import { FC, ReactNode } from 'react';

import styles from './index.module.less';

interface TitleHeaderProps {
  /** 标题 */
  title: string;
  /** 右侧区域 */
  rightRender?: ReactNode;
}

export const TitleHeader: FC<TitleHeaderProps> = ({ title, rightRender }) => (
  <div className={styles.titleHeaderWrapper}>
    <h4 className={styles.title}>{title}</h4>
    <div>{rightRender}</div>
  </div>
);
