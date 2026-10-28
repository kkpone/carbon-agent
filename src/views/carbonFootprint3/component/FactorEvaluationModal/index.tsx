import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC } from 'react';

import styles from './index.module.less';

export interface FactorEvaluationModalProps {
  visible: boolean;
  items: string[];
  onClose: () => void;
}

const FactorEvaluationModal: FC<FactorEvaluationModalProps> = ({
  visible,
  items,
  onClose,
}) => (
  <Modal
    open={visible}
    footer={null}
    closable={false}
    width={520}
    centered
    onCancel={onClose}
    className={styles.modal}
  >
    <div className={styles.header}>
      <span className={styles.title}>
        {I18N.carbonFootprint3.factorEvaluationDetail}
      </span>
      <CloseOutlined className={styles.closeIcon} onClick={onClose} />
    </div>
    <ul className={styles.list}>
      {(items || []).map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  </Modal>
);

export default FactorEvaluationModal;
