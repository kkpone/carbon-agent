import { Modal } from 'antd';
import { FC, PropsWithChildren } from 'react';

import styles from './index.module.less';

export const AnimationFullscreenModal: FC<
  PropsWithChildren<{ open: boolean }>
> = ({ children, open = true }) => (
  <Modal
    destroyOnClose
    open={open}
    style={{ zIndex: 1055 }}
    wrapClassName={styles.wrap}
    className={styles.fullscreenModal}
    width='100%'
    title={undefined}
    footer={null}
    closable={false}
  >
    {children}
  </Modal>
);
