import IconFont from '@src/components/iconfont';
import { Modal } from 'antd';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

import { ProductSource } from '@/views/system/login/component/Login';

import { SubscriptionContent } from './SubscriptionContent';
import styles from './index.module.less';

interface SubscriptionServiceModalContextType {
  openSubscriptionModal: (options?: SubscriptionModalOptions) => void;
  closeSubscriptionModal: () => void;
}

interface SubscriptionModalOptions {
  // 可以根据需要添加配置选项
  productSource: ProductSource;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** 打开弹窗后勾选专业服务：goodsName 包含该关键字的首条商品 */
  preselectProfessionalSupportKeyword?: string;
}

const SubscriptionServiceModalContext =
  createContext<SubscriptionServiceModalContextType | null>(null);

/**
 * 全局订阅服务弹窗 Provider
 */
export const SubscriptionServiceModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SubscriptionModalOptions>({
    productSource: ProductSource.product,
  });

  const openSubscriptionModal = useCallback(
    (modalOptions?: SubscriptionModalOptions) => {
      setOptions({
        productSource: ProductSource.product,
        ...modalOptions,
      });
      setOpen(true);
    },
    [],
  );

  const closeSubscriptionModal = useCallback(() => {
    setOpen(false);
    // 执行取消回调
    if (options.onCancel) {
      options.onCancel();
    }
  }, [options]);

  const contextValue = useMemo(
    () => ({ openSubscriptionModal, closeSubscriptionModal }),
    [openSubscriptionModal, closeSubscriptionModal],
  );

  return (
    <SubscriptionServiceModalContext.Provider value={contextValue}>
      {children}
      <Modal
        width={1276}
        open={open}
        onCancel={closeSubscriptionModal}
        centered
        destroyOnClose
        closable={false}
        footer={null}
        maskClosable={false}
        styles={{
          content: {
            padding: 0,
            borderRadius: 12,
          },
        }}
        wrapClassName='subscriptionServiceModal'
      >
        <div className={styles.subscriptionServiceModalBody}>
          {/* 关闭按钮 */}
          <span
            className={`cursorPointerFont ${styles.closeIcon}`}
            onClick={closeSubscriptionModal}
          >
            <IconFont type='icon-icon-shanshu' style={{ fontSize: 32 }} />
          </span>
          {/* 订阅服务内容区域 */}
          <SubscriptionContent
            productSource={options.productSource}
            onSuccess={options.onSuccess}
            preselectProfessionalSupportKeyword={
              options.preselectProfessionalSupportKeyword
            }
          />
        </div>
      </Modal>
    </SubscriptionServiceModalContext.Provider>
  );
};

/**
 * Hook: 使用全局订阅服务弹窗
 * @example
 * const { openSubscriptionModal } = useSubscriptionServiceModal();
 * openSubscriptionModal({ onSuccess: () => console.log('success') });
 */
export const useSubscriptionServiceModal = () => {
  const context = useContext(SubscriptionServiceModalContext);
  if (!context) {
    throw new Error(
      'useSubscriptionServiceModal must be used within SubscriptionServiceModalProvider',
    );
  }
  return context;
};
