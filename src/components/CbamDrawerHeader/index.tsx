import { CloseOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

import styles from './index.module.less';

export const CbamDrawerTitle = ({ children }: { children: ReactNode }) => (
  <span className={styles.title}>{children}</span>
);

export const CbamDrawerClose = ({
  onClick,
  label = 'close',
}: {
  onClick: () => void;
  label?: string;
}) => (
  <button
    type='button'
    aria-label={label}
    className={styles.close}
    onClick={onClick}
  >
    <CloseOutlined />
  </button>
);
