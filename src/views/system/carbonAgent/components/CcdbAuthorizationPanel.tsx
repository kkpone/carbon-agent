import I18N, { initLocale } from '@src/lang/I18N';
import {
  AppstoreOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Modal, Spin, Switch, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { CCDB_SETTINGS_MODAL_Z_INDEX } from '../ccdb/uiConstants';

import {
  fetchCcdbOAuthGrants,
  revokeCcdbOAuthGrant,
  type CcdbOAuthGrant,
} from '../ccdbAccessService';
import style from './CcdbAccessPanel.module.less';

type CcdbAuthorizationPanelProps = {
  active: boolean;
  showTitle?: boolean;
};

const channelLabels: Record<string, string> = {
  CONNECTOR: I18N.ccdb.remoteConnector,
  DEVICE: I18N.ccdb.localTool,
  CLI: I18N.ccdb.localTool,
  MCP: I18N.ccdb.mcpService,
  SKILL: 'Agent Skill',
  WEB: I18N.ccdb.webApp,
  OTHER: I18N.ccdb.thirdPartyApp,
};

const scopeLabels: Record<string, string> = {
  'ccdb.factor.search': I18N.ccdb.searchFactors,
  'ccdb.factor.read': I18N.ccdb.readFactor,
  offline_access: I18N.ccdb.stayConnected,
  'factor:detail': I18N.ccdb.readFactor,
  'factor:read': I18N.ccdb.readFactor,
  'factor:search': I18N.ccdb.searchFactors,
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return I18N.ccdb.neverUsed;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(initLocale, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const normalizeScopes = (value?: string[] | string | null) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[\s,]+/)
    .map(item => item.trim())
    .filter(Boolean);
};

const showReauthorizeNotice = () => {
  Modal.info({
    zIndex: CCDB_SETTINGS_MODAL_Z_INDEX,
    centered: true,
    content: I18N.ccdb.reauthorizeHint,
    okText: I18N.ccdb.gotIt,
    title: I18N.ccdb.reauthorizeRequired,
  });
};

const CcdbAuthorizationPanel = ({
  active,
  showTitle = true,
}: CcdbAuthorizationPanelProps) => {
  const [grants, setGrants] = useState<CcdbOAuthGrant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [detail, setDetail] = useState<CcdbOAuthGrant>();

  const loadGrants = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    return fetchCcdbOAuthGrants(signal)
      .then(rows => setGrants(Array.isArray(rows) ? rows : []))
      .catch(error => {
        if (!signal?.aborted) {
          setLoadError(true);
          message.error(I18N.ccdb.grantsLoadError);
        }
        return Promise.reject(error);
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const controller = new AbortController();
    loadGrants(controller.signal).catch(() => undefined);

    return () => controller.abort();
  }, [active, loadGrants]);

  const handleRevoke = (row: CcdbOAuthGrant) => {
    Modal.confirm({
      zIndex: CCDB_SETTINGS_MODAL_Z_INDEX,
      cancelText: I18N.ccdb.cancel,
      centered: true,
      content: I18N.ccdb.revokeHint,
      okButtonProps: { danger: true },
      okText: I18N.ccdb.confirmRevoke,
      title: I18N.template(I18N.ccdb.revokeTitle, { name: row.clientName }),
      onOk: () => {
        setBusyId(row.grantId);
        return revokeCcdbOAuthGrant(row.grantId)
          .then(() => {
            setGrants(current =>
              current.map(item =>
                item.grantId === row.grantId
                  ? {
                      ...item,
                      revokedAt: new Date().toISOString(),
                      status: 'REVOKED',
                    }
                  : item,
              ),
            );
            message.success(I18N.ccdb.grantRevoked);
          })
          .catch(error => {
            message.error(I18N.ccdb.revokeError);
            return Promise.reject(error);
          })
          .finally(() => setBusyId(undefined));
      },
    });
  };

  return (
    <section className={style.panel} aria-labelledby='ccdb-grant-title'>
      <div className={style.header}>
        <div className={style.headerText}>
          {showTitle ? (
            <h2 className={style.title} id='ccdb-grant-title'>
              {I18N.ccdb.authorizationManagement}
            </h2>
          ) : null}
          <p className={style.subtitle}>{I18N.ccdb.authorizationSubtitle}</p>
        </div>
      </div>

      <aside className={style.notice}>
        <SafetyCertificateOutlined className={style.noticeIcon} />
        <div>
          <strong>{I18N.ccdb.explicitAccess}</strong>
          <p>{I18N.ccdb.revokeNotice}</p>
        </div>
      </aside>

      {loading ? (
        <div className={style.loading} role='status'>
          <Spin />
          {I18N.ccdb.loadingGrants}
        </div>
      ) : loadError ? (
        <div className={style.empty} role='alert'>
          {I18N.ccdb.grantsLoadFailed}
          <button
            type='button'
            className={style.secondaryButton}
            onClick={() => loadGrants().catch(() => undefined)}
          >
            {I18N.ccdb.retry}
          </button>
        </div>
      ) : grants.length ? (
        <div className={style.grantList}>
          {grants.map(row => {
            const activeGrant = row.status === 'ACTIVE';
            const scopes = normalizeScopes(row.scopes);
            const channel =
              channelLabels[String(row.channelType || '').toUpperCase()] ||
              row.channelType ||
              (row.authMethod === 'DEVICE_CODE'
                ? I18N.ccdb.localTool
                : I18N.ccdb.thirdPartyApp);

            return (
              <article
                className={`${style.grantRow} ${
                  activeGrant ? '' : style.revoked
                }`}
                key={row.grantId}
              >
                <div className={style.grantIdentity}>
                  {row.logoUrl ? (
                    <img className={style.grantLogo} src={row.logoUrl} alt='' />
                  ) : (
                    <span className={style.grantLogo} aria-hidden='true'>
                      {row.clientName.trim().slice(0, 1).toUpperCase() || (
                        <AppstoreOutlined />
                      )}
                    </span>
                  )}
                  <div>
                    <h3 className={style.grantName}>{row.clientName}</h3>
                    <p className={style.grantDescription}>
                      {row.clientDescription || I18N.ccdb.appAccessDescription}
                    </p>
                    <div className={style.tagList}>
                      {(scopes.length
                        ? scopes
                        : ['ccdb.factor.search', 'ccdb.factor.read']
                      ).map(scope => (
                        <span className={style.tag} key={scope}>
                          {scopeLabels[scope] || scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`${style.statusCell} ${style.grantActions}`}>
                  <button
                    className={style.textButton}
                    type='button'
                    onClick={() => setDetail(row)}
                  >
                    {I18N.ccdb.viewDetails}
                  </button>
                  <Switch
                    checked={activeGrant}
                    loading={busyId === row.grantId}
                    onChange={checked => {
                      if (checked) {
                        showReauthorizeNotice();
                      } else {
                        handleRevoke(row);
                      }
                    }}
                  />
                  <span className={style.statusText}>
                    {activeGrant ? I18N.ccdb.active : I18N.ccdb.revoked}
                  </span>
                  {!activeGrant ? (
                    <button
                      className={style.textButton}
                      type='button'
                      onClick={showReauthorizeNotice}
                    >
                      {I18N.ccdb.reauthorize}
                    </button>
                  ) : null}
                </div>
                <div className={style.grantMetadata}>
                  <div className={style.grantChannel}>
                    <span className={style.channel}>{channel}</span>
                    <span>
                      {row.authMethod === 'DEVICE_CODE'
                        ? I18N.ccdb.deviceAuth
                        : 'OAuth 2.0 + PKCE'}
                    </span>
                  </div>
                  <div className={style.grantTimes}>
                    <span>
                      {I18N.ccdb.authorizedAt}
                      {formatDateTime(row.grantedAt)}
                    </span>
                    <span>
                      {I18N.ccdb.lastUsed}
                      {formatDateTime(row.lastUsedAt)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={style.empty}>
          <span className={style.emptyIcon}>
            <SafetyCertificateOutlined />
          </span>
          <span>{I18N.ccdb.noGrants}</span>
        </div>
      )}

      <p className={style.footnote}>
        <LinkOutlined />
        {I18N.ccdb.revokedFootnote}
      </p>

      <Modal
        zIndex={CCDB_SETTINGS_MODAL_Z_INDEX}
        centered
        cancelButtonProps={{ style: { display: 'none' } }}
        okText={I18N.ccdb.gotIt}
        open={Boolean(detail)}
        title={I18N.ccdb.grantDetails}
        onCancel={() => setDetail(undefined)}
        onOk={() => setDetail(undefined)}
      >
        {detail ? (
          <div>
            <p>
              <strong>{I18N.ccdb.appLabel}</strong>
              {detail.clientName}
            </p>
            <p>
              <strong>Client ID: </strong>
              {detail.clientId}
            </p>
            <p>
              <strong>{I18N.ccdb.authMethodLabel}</strong>
              {detail.authMethod === 'DEVICE_CODE'
                ? I18N.ccdb.deviceAuth
                : 'OAuth 2.0 + PKCE'}
            </p>
            <p>
              <strong>{I18N.ccdb.permissionsLabel}</strong>
              {normalizeScopes(detail.scopes)
                .map(scope => scopeLabels[scope] || scope)
                .join(', ') || I18N.ccdb.defaultScopes}
            </p>
            <p>
              <strong>{I18N.ccdb.statusLabel}</strong>
              {detail.status === 'ACTIVE'
                ? I18N.ccdb.active
                : I18N.ccdb.revoked}
            </p>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default CcdbAuthorizationPanel;
