import { Modal } from 'antd';
import { FC, PropsWithChildren } from 'react';

import styles from './index.module.less';

export const FullscreenModal: FC<
  PropsWithChildren<{ open?: boolean; style?: React.CSSProperties }>
> = ({ children, open = true, style }) => (
  <Modal
    destroyOnClose
    open={open}
    style={{ zIndex: 1055, ...style }}
    wrapClassName={styles.wrap}
    className={styles.fullscreenModal}
    width='100%'
    title={undefined}
    footer={null}
    closable={false}
    transitionName=''
  >
    {children}
  </Modal>
);
