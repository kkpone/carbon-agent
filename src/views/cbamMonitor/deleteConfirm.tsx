import { ExclamationCircleFilled } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { ReactNode } from 'react';

import styles from './deleteConfirm.module.less';

interface MonitorDeleteConfirmOptions {
  title: string;
  content: ReactNode;
  onOk: () => void | Promise<void>;
}

export const showMonitorDeleteConfirm = ({
  title,
  content,
  onOk,
}: MonitorDeleteConfirmOptions) => {
  Modal.confirm({
    className: styles.deleteConfirmModal,
    wrapClassName: styles.deleteConfirmWrap,
    centered: true,
    width: 444,
    icon: null,
    closable: true,
    title,
    content: (
      <div className={styles.deleteConfirmContent}>
        <ExclamationCircleFilled className={styles.deleteConfirmIcon} />
        <span>{content}</span>
      </div>
    ),
    okText: I18N.cbamMonitor.confirm,
    cancelText: I18N.cbamMonitor.cancel,
    onOk,
  });
};
