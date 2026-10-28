import I18N from '@src/lang/I18N';
import { withCurrentLocalePrefix } from '@src/router/localePath';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import agentLogo from '@src/assets/images/carbonAgent/icons/agent-logo.svg';
import { Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useMobile } from '@/hooks/use-mobile';
import { getToken } from '@/utils/cookie';

import style from './AuthorizationPage.module.less';
import {
  ccdbProtocolErrorMessage,
  decideCcdbDeviceAuthorization,
  fetchCcdbDeviceAuthorizeContext,
  type CcdbDeviceAuthorizeContext,
} from '../ccdbAccessService';
import AgentLoginDialog from '../components/AgentLoginDialog';

type PageState = 'authorize' | 'cancelled' | 'entry' | 'error' | 'success';

type ProtocolError = {
  error?: string;
  error_description?: string;
};

const normalizeCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

const displayCode = (value: string) => {
  const normalized = normalizeCode(value);
  return normalized.length > 4
    ? `${normalized.slice(0, 4)}-${normalized.slice(4)}`
    : normalized;
};

const readProtocolError = (error: unknown): ProtocolError => {
  if (!error || typeof error !== 'object') {
    return {};
  }

  return (
    (error as { response?: { data?: ProtocolError } }).response?.data || {}
  );
};

const DeviceAuthorizationPage = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const queryCode = useMemo(
    () => new URLSearchParams(location.search).get('user_code') || '',
    [location.search],
  );
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [loginOpen, setLoginOpen] = useState(false);
  const [userCode, setUserCode] = useState(() => displayCode(queryCode));
  const [context, setContext] = useState<CcdbDeviceAuthorizeContext>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageState, setPageState] = useState<PageState>('entry');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultClientName, setResultClientName] = useState('Carbon CLI');

  const loadContext = useCallback((code: string) => {
    const normalized = displayCode(code);
    if (normalizeCode(normalized).length !== 8) {
      setErrorMessage(I18N.ccdb.deviceCodeRequired);
      setPageState('entry');
      return Promise.resolve();
    }

    setUserCode(normalized);
    if (!getToken()) {
      setAuthenticated(false);
      setLoginOpen(true);
      return Promise.resolve();
    }

    setLoading(true);
    setErrorMessage('');
    return fetchCcdbDeviceAuthorizeContext(normalized)
      .then(value => {
        setContext(value);
        setResultClientName(value.clientName || 'Carbon CLI');
        setPageState('authorize');
      })
      .catch(error => {
        const protocol = readProtocolError(error);
        if (protocol.error === 'login_required') {
          setAuthenticated(false);
          setLoginOpen(true);
          return;
        }
        setErrorMessage(
          ccdbProtocolErrorMessage(protocol, I18N.ccdb.invalidDeviceCode),
        );
        setPageState('error');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // URL 预填码只在进入页面或链接变化时读取；登录完成后使用当前输入码。
    if (queryCode && getToken()) {
      loadContext(queryCode);
    }
  }, [loadContext, queryCode]);

  const handleDecision = (approved: boolean) => {
    if (!context || submitting) {
      return;
    }

    setSubmitting(true);
    decideCcdbDeviceAuthorization(context.userCode || userCode, approved)
      .then(result => {
        setResultClientName(result.clientName || context.clientName);
        setPageState(approved ? 'success' : 'cancelled');
      })
      .catch(error => {
        const protocol = readProtocolError(error);
        setErrorMessage(
          ccdbProtocolErrorMessage(protocol, I18N.ccdb.deviceDecisionError),
        );
        setPageState('error');
      })
      .finally(() => setSubmitting(false));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={style.loading} role='status'>
          <Spin /> {I18N.ccdb.checkingDevice}
        </div>
      );
    }

    if (pageState === 'success' || pageState === 'cancelled') {
      const success = pageState === 'success';
      return (
        <div className={style.stateCard}>
          <span className={style.stateIcon}>
            {success ? (
              <span className={style.okText}>OK</span>
            ) : (
              <CloseOutlined />
            )}
          </span>
          <h1 className={style.title}>
            {success ? I18N.ccdb.authSuccess : I18N.ccdb.authCancelled}
          </h1>
          <p className={style.stateText}>
            {success
              ? I18N.template(I18N.ccdb.deviceAuthorizedMessage, {
                  name: resultClientName,
                })
              : I18N.template(I18N.ccdb.deviceDeniedMessage, {
                  name: resultClientName,
                })}
          </p>
          {success ? (
            <div className={style.stateActions}>
              <a
                className={style.linkButton}
                href={withCurrentLocalePrefix(
                  '/system/carbonAgent?settings=authorizations',
                )}
              >
                {I18N.ccdb.viewApps}
              </a>
            </div>
          ) : null}
        </div>
      );
    }

    if (pageState === 'error') {
      return (
        <div className={style.stateCard}>
          <span className={`${style.stateIcon} ${style.errorIcon}`}>
            <ExclamationCircleOutlined />
          </span>
          <h1 className={style.title}>{I18N.ccdb.cannotAuthorizeDevice}</h1>
          <p className={style.stateText}>{errorMessage}</p>
          <div className={style.stateActions}>
            <button
              className={style.primaryButton}
              type='button'
              onClick={() => {
                setContext(undefined);
                setErrorMessage('');
                setUserCode('');
                setPageState('entry');
              }}
            >
              {I18N.ccdb.otherDeviceCode}
            </button>
          </div>
        </div>
      );
    }

    if (pageState === 'entry' || !context) {
      const hasPrefilledCode = Boolean(queryCode && userCode);
      return (
        <div>
          <div className={style.appBridge} aria-hidden='true'>
            <span className={`${style.appLogo} ${style.deviceAppLogo}`}>C</span>
            <span className={style.bridgeLine} />
            <img className={style.carbonLogo} src={agentLogo} alt='' />
          </div>
          <p className={style.eyebrow}>{I18N.ccdb.deviceStepOne}</p>
          <h1 className={style.title}>{I18N.ccdb.enterDeviceCode}</h1>
          <p className={style.lead}>
            {hasPrefilledCode
              ? I18N.ccdb.prefilledDeviceHint
              : I18N.ccdb.deviceCodeHint}
          </p>
          <form
            className={style.codeForm}
            onSubmit={event => {
              event.preventDefault();
              loadContext(userCode);
            }}
          >
            <span className={style.codeLabel}>{I18N.ccdb.deviceCode}</span>
            <input
              aria-label={I18N.ccdb.deviceCode}
              autoCapitalize='characters'
              autoComplete='one-time-code'
              className={style.codeInput}
              id='ccdb-device-code'
              inputMode='text'
              maxLength={9}
              placeholder='XXXX-XXXX'
              value={userCode}
              onChange={event => setUserCode(displayCode(event.target.value))}
            />
            {errorMessage ? (
              <p className={style.stateText} role='alert'>
                {errorMessage}
              </p>
            ) : null}
            <div className={style.stateActions}>
              <button className={style.primaryButton} type='submit'>
                {authenticated
                  ? I18N.ccdb.viewPermissions
                  : I18N.ccdb.loginViewPermissions}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <>
        <div className={style.appBridge} aria-hidden='true'>
          {context.logoUrl ? (
            <img className={style.appLogo} src={context.logoUrl} alt='' />
          ) : (
            <span className={`${style.appLogo} ${style.deviceAppLogo}`}>
              {context.clientName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className={style.bridgeLine} />
          <img className={style.carbonLogo} src={agentLogo} alt='' />
        </div>
        <p className={style.eyebrow}>{I18N.ccdb.deviceAuthorization}</p>
        <h1 className={style.title}>
          {I18N.template(I18N.ccdb.allowAppTitle, { name: context.clientName })}
        </h1>
        <div className={style.deviceCode}>
          <span className={style.deviceLabel}>{I18N.ccdb.deviceCode}</span>
          <strong className={style.deviceValue}>
            {displayCode(context.userCode)}
          </strong>
          <span className={style.deviceHelp}>{I18N.ccdb.matchDeviceCode}</span>
        </div>
        <p className={style.lead}>
          <strong>{context.clientName}</strong> {I18N.ccdb.appPermissionsLead}
        </p>
        <div className={style.permissions}>
          {context.scopes
            .filter(scope => scope.code !== 'offline_access')
            .map((scope, index) => (
              <div className={style.permission} key={scope.code}>
                <span className={style.permissionIcon}>
                  {index === 0 ? 'R' : 'D'}
                </span>
                <div>
                  <strong>{scope.name}</strong>
                  <p>{scope.description}</p>
                </div>
              </div>
            ))}
        </div>
        <p className={style.privacy}>
          {context.privacyNotice || I18N.ccdb.devicePrivacy}
        </p>
        <div className={style.actions}>
          <button
            className={style.secondaryButton}
            disabled={submitting}
            type='button'
            onClick={() => handleDecision(false)}
          >
            {I18N.ccdb.cancel}
          </button>
          <button
            className={style.primaryButton}
            disabled={submitting}
            type='button'
            onClick={() => handleDecision(true)}
          >
            {submitting ? I18N.ccdb.authorizing : I18N.ccdb.allowAccess}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className={style.page}>
      <header className={style.topbar}>
        <a
          className={style.brand}
          href={withCurrentLocalePrefix('/system/carbonAgent')}
        >
          <img className={style.brandLogo} src={agentLogo} alt='' />
          <span className={style.brandText}>Carbon Agent</span>
        </a>
        <a
          className={style.homeLink}
          href={withCurrentLocalePrefix('/system/carbonAgent')}
        >
          {I18N.ccdb.returnAgent}
        </a>
      </header>
      <main className={style.main}>
        <section className={style.card}>{renderContent()}</section>
      </main>
      <AgentLoginDialog
        authenticated={authenticated}
        isMobile={isMobile}
        open={loginOpen}
        triggerEntry='other'
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          const loggedIn = Boolean(getToken());
          setAuthenticated(loggedIn);
          setLoginOpen(false);
          if (loggedIn && userCode) {
            loadContext(userCode);
          }
        }}
      />
    </div>
  );
};

export default DeviceAuthorizationPage;
