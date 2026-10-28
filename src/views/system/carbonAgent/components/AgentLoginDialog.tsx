import I18N from '@src/lang/I18N';
import { Modal } from 'antd';

import {
  CompanyType,
  ProductSource,
} from '@/views/system/login/component/Login';
import LoginWrapper from '@/views/system/login/component/LoginWrapper';

import type { AgentLoginTriggerEntry } from '../acquisition';
import style from './AgentLoginDialog.module.less';
import MobileLoginSheet from './MobileLoginSheet';

type AgentLoginDialogProps = {
  isMobile: boolean;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  triggerEntry: AgentLoginTriggerEntry;
};

const AgentLoginDialog = ({
  isMobile,
  onClose,
  onSuccess,
  open,
  triggerEntry,
}: AgentLoginDialogProps) => {
  if (isMobile) {
    return (
      <MobileLoginSheet
        open={open}
        companyType={CompanyType.agent}
        productSource={ProductSource.product}
        skipCompanyBootstrap
        triggerEntry={triggerEntry}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <Modal
      className={style.dialog}
      width='fit-content'
      open={open}
      centered
      destroyOnClose
      footer={null}
      closable
      maskClosable
      onCancel={onClose}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
        },
      }}
    >
      <LoginWrapper
        agentLoginTriggerEntry={triggerEntry}
        companyType={CompanyType.agent}
        hideLogo
        productSource={ProductSource.product}
        showWechatLogin
        skipCompanyBootstrap
        title={I18N.carbonAgent.loginCarbonCloud}
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default AgentLoginDialog;
