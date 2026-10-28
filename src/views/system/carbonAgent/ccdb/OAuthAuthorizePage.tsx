import I18N from '@src/lang/I18N';
import { withCurrentLocalePrefix } from '@src/router/localePath';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import agentLogo from '@src/assets/images/carbonAgent/icons/agent-logo.svg';
import { Spin } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useMobile } from '@/hooks/use-mobile';
import { getToken } from '@/utils/cookie';

import style from './AuthorizationPage.module.less';
import { readOAuthCompletion, rememberOAuthDecision } from './oauthCompletion';
import {
  ccdbProtocolErrorMessage,
  decideCcdbOAuthAuthorization,
  fetchCcdbOAuthAuthorizeContext,
  type CcdbOAuthAuthorizeContext,
} from '../ccdbAccessService';
import AgentLoginDialog from '../components/AgentLoginDialog';

type PageState = 'authorize' | 'cancelled' | 'error' | 'success';

type ProtocolError = {
  error?: string;
  error_description?: string;
};

const readProtocolError = (error: unknown): ProtocolError => {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const { response } = error as { response?: { data?: ProtocolError } };
  return response?.data || {};
};

const OAuthAuthorizePage = () => {
  const location = useLocation();
  const completion = useMemo(
    () => readOAuthCompletion(location.hash),
    [location.hash],
  );
  const isMobile = useMobile();
  const returnTimerRef = useRef<number>();
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [loginOpen, setLoginOpen] = useState(!completion && !getToken());
  const [context, setContext] = useState<CcdbOAuthAuthorizeContext>();
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [submitting, setSubmitting] = useState(false);
  const [pageState, setPageState] = useState<PageState>('authorize');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [resultClientName, setResultClientName] = useState(
    I18N.ccdb.thirdPartyApp,
  );

  const authorizeParams = useMemo(() => {
    const values: Record<string, string> = {};
    new URLSearchParams(location.search).forEach((value, key) => {
      values[key] = value;
    });
    return values;
  }, [location.search]);

  const loadContext = useCallback(() => {
    if (!getToken()) {
      setAuthenticated(false);
      setLoginOpen(true);
      setLoading(false);
      return Promise.resolve();
    }

    setLoading(true);
    setErrorMessage('');
    setErrorCode('');
    return fetchCcdbOAuthAuthorizeContext(authorizeParams)
      .then(value => {
        setContext(value);
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
          ccdbProtocolErrorMessage(protocol, I18N.ccdb.invalidAuthRequest),
        );
        setErrorCode(protocol.error || '');
        setPageState('error');
      })
      .finally(() => setLoading(false));
  }, [authorizeParams]);

  useEffect(() => {
    if (authenticated && !completion) {
      loadContext();
    }
  }, [authenticated, completion, loadContext]);

  useEffect(
    () => () => {
      if (returnTimerRef.current) {
        window.clearTimeout(returnTimerRef.current);
      }
    },
    [],
  );

  const returnToClient = (target: string) => {
    if (target) {
      window.location.replace(target);
    }
  };

  const handleDecision = (approved: boolean) => {
    if (!context || submitting) {
      return;
    }

    setSubmitting(true);
    decideCcdbOAuthAuthorization(context.requestId, approved)
      .then(result => {
        rememberOAuthDecision(
          authorizeParams.state,
          result.clientName || context.clientName,
          approved,
        );
        setRedirectUri(result.redirectUri);
        setResultClientName(result.clientName || context.clientName);
        setPageState(approved ? 'success' : 'cancelled');
        returnTimerRef.current = window.setTimeout(
          () => returnToClient(result.redirectUri),
          approved ? 1100 : 500,
        );
      })
      .catch(error => {
        const protocol = readProtocolError(error);
        setErrorMessage(
          ccdbProtocolErrorMessage(protocol, I18N.ccdb.authDecisionError),
        );
        setErrorCode(protocol.error || '');
        setPageState('error');
      })
      .finally(() => setSubmitting(false));
  };

  const renderState = () => {
    if (completion) {
      const success = completion.status === 'success';
      const cancelled = completion.status === 'cancelled';
      const unknown = completion.status === 'unknown';
      return (
        <div
          className={`${style.stateCard} ${style.completionCard}`}
          role='status'
        >
          <span
            className={`${style.stateIcon} ${
              !success && !cancelled ? style.errorIcon : ''
            }`}
          >
            {success ? (
              <span className={style.okText}>OK</span>
            ) : cancelled ? (
              <CloseOutlined />
            ) : (
              <ExclamationCircleOutlined />
            )}
          </span>
          <h1 className={style.title}>
            {success
              ? I18N.ccdb.authSuccess
              : cancelled
              ? I18N.ccdb.authCancelled
              : unknown
              ? I18N.ccdb.checkTerminal
              : I18N.ccdb.connectionIncomplete}
          </h1>
          <p className={style.stateText}>
            {success
              ? I18N.template(I18N.ccdb.connectedMessage, {
                  name: completion.clientName,
                })
              : cancelled
              ? I18N.ccdb.notAuthorizedMessage
              : unknown
              ? I18N.ccdb.completionExpired
              : I18N.ccdb.credentialError}
          </p>
          <div className={style.stateActions}>
            <a
              className={style.linkButton}
              href={withCurrentLocalePrefix('/system/carbonAgent')}
            >
              {I18N.ccdb.returnCarbonAgent}
            </a>
          </div>
        </div>
      );
    }
    if (loading) {
      return (
        <div className={style.loading} role='status'>
          <Spin /> {I18N.ccdb.checkingAuth}
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
            {success ? I18N.ccdb.completingConnection : I18N.ccdb.authCancelled}
          </h1>
          <p className={style.stateText}>
            {success
              ? I18N.template(I18N.ccdb.returningAuthorized, {
                  name: resultClientName,
                })
              : I18N.template(I18N.ccdb.returningDenied, {
                  name: resultClientName,
                })}
          </p>
          <div className={style.stateActions}>
            <button
              className={style.primaryButton}
              type='button'
              onClick={() => returnToClient(redirectUri)}
            >
              {I18N.ccdb.returnNow}
              {resultClientName}
            </button>
          </div>
        </div>
      );
    }

    if (pageState === 'error') {
      const unknownClient = errorCode === 'invalid_client';
      return (
        <div className={style.stateCard}>
          <span className={`${style.stateIcon} ${style.errorIcon}`}>
            <ExclamationCircleOutlined />
          </span>
          <h1 className={style.title}>{I18N.ccdb.cannotAuthorize}</h1>
          <p className={style.stateText}>{errorMessage}</p>
          {unknownClient ? (
            <p className={style.stateText}>{I18N.ccdb.unknownClientHint}</p>
          ) : null}
          <div className={style.stateActions}>
            <a
              className={style.linkButton}
              href={withCurrentLocalePrefix('/system/carbonAgent')}
            >
              {I18N.ccdb.returnCarbonAgent}
            </a>
            {unknownClient ? (
              <a
                className={style.linkButton}
                href={withCurrentLocalePrefix(
                  '/system/carbonAgent?settings=apiKeys',
                )}
              >
                {I18N.ccdb.goToKeys}
              </a>
            ) : null}
            <button
              className={style.secondaryButton}
              type='button'
              onClick={() => loadContext()}
            >
              {I18N.ccdb.checkAgain}
            </button>
          </div>
        </div>
      );
    }

    if (!context) {
      return (
        <div className={style.loading} role='status'>
          <Spin /> {I18N.ccdb.loginToAuthorize}
        </div>
      );
    }

    return (
      <>
        <div className={style.appBridge} aria-hidden='true'>
          {context.logoUrl ? (
            <img className={style.appLogo} src={context.logoUrl} alt='' />
          ) : (
            <span className={style.appLogo}>
              {context.clientName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className={style.bridgeLine} />
          <img className={style.carbonLogo} src={agentLogo} alt='' />
        </div>
        <p className={style.eyebrow}>{I18N.ccdb.thirdPartyAuthorization}</p>
        <h1 className={style.title}>
          {I18N.template(I18N.ccdb.allowAppTitle, { name: context.clientName })}
        </h1>
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
          {context.privacyNotice || I18N.ccdb.privacyNotice}
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
            {submitting ? I18N.ccdb.processing : I18N.ccdb.allowAccess}
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
        <section className={style.card}>{renderState()}</section>
      </main>
      <AgentLoginDialog
        authenticated={authenticated}
        isMobile={isMobile}
        open={!completion && loginOpen}
        triggerEntry='other'
        onClose={() => {
          if (getToken()) {
            setLoginOpen(false);
          }
        }}
        onSuccess={() => {
          setAuthenticated(Boolean(getToken()));
          setLoginOpen(false);
        }}
      />
    </div>
  );
};

export default OAuthAuthorizePage;
