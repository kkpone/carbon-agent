import { useRequest } from 'ahooks';
import classNames from 'classnames';
import React, { useContext, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { MaterialProvider } from '@/components/MaterialProvider';
import { LocaleType } from '@/lang/I18N';
import type { AgentLoginTriggerEntry } from '@/views/system/carbonAgent/acquisition';

import styles from './index.module.less';
import { ModuleType } from './type';
import { getShowLanguageSwitch, SwitchState } from '../../service';
import { CompanyType, Login, ProductSource } from '../Login';
import { ResetPassword } from '../ResetPassword';

interface LoginWrapperProps {
  // children: React.ReactNode;
  companyType: CompanyType;
  logoSrc?: string;
  title?: React.ReactNode;
  showWechatLogin?: boolean;
  productSource?: ProductSource;
  skipCompanyBootstrap?: boolean;
  agentLoginTriggerEntry?: AgentLoginTriggerEntry;
  hideLogo?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  isLoginPage?: boolean;
}

const getNextLocale = (locale: LocaleType) =>
  locale === LocaleType.enUS ? LocaleType.zhCN : LocaleType.enUS;

const getLanguageButtonLabel = (locale: LocaleType) =>
  locale === LocaleType.enUS ? '中' : 'EN';

const LoginLanguageButton = () => {
  const { locale, changeLocale } = useContext(LocaleContext);
  const { data } = useRequest(() => getShowLanguageSwitch());

  const showSwitch = data?.data?.data?.multi_switch === SwitchState.show;

  if (!showSwitch) {
    return null;
  }

  const nextLocale = getNextLocale(locale);

  return (
    <button
      type='button'
      className={styles.languageButton}
      aria-label='Switch language'
      onClick={() =>
        changeLocale({
          currentLocale: nextLocale,
          onlyFeSwitch: true,
          syncUrl: true,
        })
      }
    >
      {getLanguageButtonLabel(locale)}
    </button>
  );
};

const LoginWrapper: React.FC<LoginWrapperProps> = ({
  companyType,
  logoSrc,
  title,
  showWechatLogin,
  productSource,
  skipCompanyBootstrap,
  agentLoginTriggerEntry,
  hideLogo,
  onSuccess,
  onCancel,
  isLoginPage = false,
}) => {
  // const { locale } = useContext(LocaleContext);
  const [moduleType, setModuleType] = useState<ModuleType>(ModuleType.login);
  const resolvedCompanyType =
    !isLoginPage && companyType !== CompanyType.agent
      ? CompanyType.person
      : companyType;
  const isAgentLoginModal = !isLoginPage && companyType === CompanyType.agent;
  const isResetPassword = moduleType === ModuleType.resetPassWord;

  return (
    <MaterialProvider>
      <div
        className={classNames(styles.wrapper, {
          [styles.agentLoginModal]: isAgentLoginModal && !isResetPassword,
          [styles.loginPage]: isLoginPage && !isResetPassword,
        })}
      >
        {!isLoginPage && <LoginLanguageButton />}
        {moduleType === ModuleType.login && (
          <Login
            toggleModuleType={setModuleType}
            productSource={productSource}
            companyType={resolvedCompanyType}
            logoSrc={logoSrc}
            title={title}
            showWechatLogin={showWechatLogin || false}
            skipCompanyBootstrap={skipCompanyBootstrap}
            agentLoginTriggerEntry={agentLoginTriggerEntry}
            hideLogo={hideLogo}
            onSuccess={onSuccess}
            onCancel={onCancel}
            isLoginPage={isLoginPage}
          />
        )}
        {moduleType === ModuleType.resetPassWord && (
          <ResetPassword toggleModuleType={setModuleType} />
        )}
      </div>
    </MaterialProvider>
  );
};

export default LoginWrapper;
