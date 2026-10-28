import { Modal, ModalProps } from 'antd';
import { omit } from 'lodash-es';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';
import LoginWrapper from '@/views/system/login/component/LoginWrapper';

interface GlobalLoginModalContextType {
  openLoginModal: (options?: LoginModalOptions) => void;
  closeLoginModal: () => void;
}

interface LoginModalOptions extends Omit<ModalProps, 'onCancel'> {
  productSource?: ProductSource;
  companyType?: CompanyType;
  showWechatLogin?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GlobalLoginModalContext =
  createContext<GlobalLoginModalContextType | null>(null);

/**
 * 全局登录弹窗 Provider
 */
export const GlobalLoginModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LoginModalOptions>({
    companyType: CompanyType.company,
    productSource: ProductSource.product,
    showWechatLogin: true,
  });

  const openLoginModal = useCallback((modalOptions?: LoginModalOptions) => {
    setOptions({
      companyType: CompanyType.company,
      showWechatLogin: true,
      productSource: ProductSource.product,
      ...modalOptions,
    });
    setOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    if (options.onCancel) {
      options.onCancel();
    }
    setOpen(false);
  }, [options]);

  const contextValue = useMemo(
    () => ({ openLoginModal, closeLoginModal }),
    [openLoginModal, closeLoginModal],
  );

  return (
    <GlobalLoginModalContext.Provider value={contextValue}>
      {children}
      <Modal
        width={476}
        open={open}
        onCancel={closeLoginModal}
        centered
        destroyOnClose
        closable={false}
        footer={null}
        styles={{
          content: {
            padding: 0,
            borderRadius: 12,
          },
        }}
        {...omit(options, [
          'companyType',
          'showWechatLogin',
          'onSuccess',
          'onCancel',
        ])}
      >
        <LoginWrapper
          companyType={options.companyType || CompanyType.company}
          showWechatLogin={options.showWechatLogin}
          productSource={options.productSource}
          onSuccess={() => {
            options.onSuccess?.();
            closeLoginModal();
          }}
          onCancel={options.onCancel}
        />
      </Modal>
    </GlobalLoginModalContext.Provider>
  );
};

/**
 * Hook: 使用全局登录弹窗
 * @example
 * const { openLoginModal } = useGlobalLoginModal();
 * openLoginModal({ companyType: CompanyType.company, showWechatLogin: true });
 */
export const useGlobalLoginModal = () => {
  const context = useContext(GlobalLoginModalContext);
  if (!context) {
    throw new Error(
      'useGlobalLoginModal must be used within GlobalLoginModalProvider',
    );
  }
  return context;
};
