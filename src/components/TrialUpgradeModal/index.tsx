import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

import styles from './index.module.less';

interface TrialUpgradeModalOptions {
  onUpgrade?: () => void;
  onCancel?: () => void;
}

interface TrialUpgradeModalContextType {
  openTrialUpgradeModal: (options?: TrialUpgradeModalOptions) => void;
  closeTrialUpgradeModal: () => void;
}

const TrialUpgradeModalContext =
  createContext<TrialUpgradeModalContextType | null>(null);

/**
 * 全局试用升级提示弹窗 Provider
 */
export const TrialUpgradeModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<TrialUpgradeModalOptions>({});

  const openTrialUpgradeModal = useCallback(
    (modalOptions?: TrialUpgradeModalOptions) => {
      setOptions(modalOptions || {});
      setOpen(true);
    },
    [],
  );

  const closeTrialUpgradeModal = useCallback(() => {
    if (options.onCancel) {
      options.onCancel();
    }
    setOpen(false);
  }, [options]);

  const handleUpgrade = useCallback(() => {
    setOpen(false);
    if (options.onUpgrade) {
      options.onUpgrade();
    }
  }, [options]);

  const handleCancel = useCallback(() => {
    closeTrialUpgradeModal();
  }, [closeTrialUpgradeModal]);

  const contextValue = useMemo(
    () => ({ openTrialUpgradeModal, closeTrialUpgradeModal }),
    [openTrialUpgradeModal, closeTrialUpgradeModal],
  );

  return (
    <TrialUpgradeModalContext.Provider value={contextValue}>
      {children}
      <Modal
        open={open}
        onCancel={handleCancel}
        centered
        destroyOnClose
        closable={false}
        footer={null}
        maskClosable={false}
        width={520}
        keyboard={false}
        styles={{
          content: {
            padding: 0,
            borderRadius: 12,
          },
        }}
        className={styles.trialUpgradeModal}
      >
        <div className={styles.trialUpgradeModalContent}>
          {/* 标题栏 */}
          <div className={styles.trialUpgradeModalHeader}>
            <h2 className={styles.trialUpgradeModalTitle}>
              {I18N.carbonFootprint.prompt}
            </h2>
            <CloseOutlined
              className={styles.trialUpgradeModalClose}
              onClick={handleCancel}
            />
          </div>

          {/* 提示内容 */}
          <div className={styles.trialUpgradeModalBody}>
            <ExclamationCircleOutlined
              className={styles.trialUpgradeModalIcon}
            />
            <p className={styles.trialUpgradeModalText}>
              {I18N.components.currentNumberOfProducts}
            </p>
          </div>

          {/* 按钮组 */}
          <div className={styles.trialUpgradeModalFooter}>
            <Button
              className={styles.trialUpgradeModalCancelBtn}
              onClick={handleCancel}
            >
              {I18N.components.abandoningThisConstructionProject}
            </Button>
            <Button
              type='primary'
              className={styles.trialUpgradeModalConfirmBtn}
              onClick={handleUpgrade}
            >
              {I18N.components.upgrade}
            </Button>
          </div>
        </div>
      </Modal>
    </TrialUpgradeModalContext.Provider>
  );
};

/**
 * Hook: 使用全局试用升级提示弹窗
 * @example
 * const { openTrialUpgradeModal } = useTrialUpgradeModal();
 * openTrialUpgradeModal({
 *   onUpgrade: () => { openSubscriptionModal(...) },
 *   onCancel: () => { history.push(...) }
 * });
 */
export const useTrialUpgradeModal = () => {
  const context = useContext(TrialUpgradeModalContext);
  if (!context) {
    throw new Error(
      'useTrialUpgradeModal must be used within TrialUpgradeModalProvider',
    );
  }
  return context;
};
