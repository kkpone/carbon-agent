import I18N, { initLocale } from '@src/lang/I18N';
import {
  CopyOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, Spin, Switch, Tooltip, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { copyToClipboard } from '@src/utils/clipboard';
import { CCDB_SETTINGS_MODAL_Z_INDEX } from '../ccdb/uiConstants';

import {
  changeCcdbApiKeyStatus,
  createCcdbApiKey,
  fetchCcdbApiKeys,
  rotateCcdbApiKey,
  type CcdbApiKey,
  type CcdbApiKeySecret,
  type CreateCcdbApiKeyPayload,
} from '../ccdbAccessService';
import style from './CcdbAccessPanel.module.less';

type CcdbApiKeyPanelProps = {
  active: boolean;
  showTitle?: boolean;
};

const formatDateTime = (
  value?: string | null,
  emptyText = I18N.ccdb.neverUsed,
) => {
  if (!value) {
    return emptyText;
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
    second: '2-digit',
    year: 'numeric',
  }).format(date);
};

// 列表只展示短识别前缀，不展示或补取密钥明文，也不按密钥长度铺满掩码。
const compactMaskedKey = (masked?: string | null) => {
  const prefix = masked?.split(/[*•]/, 1)[0] || '';
  return prefix ? `${prefix.slice(0, 12)}••••••` : '••••••••';
};

const CcdbApiKeyPanel = ({
  active,
  showTitle = true,
}: CcdbApiKeyPanelProps) => {
  const [form] = Form.useForm<CreateCcdbApiKeyPayload>();
  const [keys, setKeys] = useState<CcdbApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number>();
  const [secret, setSecret] = useState<CcdbApiKeySecret>();

  const ccdbKeys = useMemo(
    () => keys.filter(item => item.keyType === 'CCDB_AGENT'),
    [keys],
  );

  const loadKeys = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    return fetchCcdbApiKeys(signal)
      .then(rows => setKeys(Array.isArray(rows) ? rows : []))
      .catch(error => {
        if (!signal?.aborted) {
          setLoadError(true);
          message.error(I18N.ccdb.keyLoadError);
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
    loadKeys(controller.signal).catch(() => undefined);

    return () => controller.abort();
  }, [active, loadKeys]);

  const handleCreate = async () => {
    let values: CreateCcdbApiKeyPayload;

    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    createCcdbApiKey({
      name: values.name.trim(),
      purpose: values.purpose.trim(),
    })
      .then(created => {
        setCreateOpen(false);
        form.resetFields();
        setSecret(created);
        // 创建已成功，列表刷新失败不能提示用户重复创建或丢失一次性展示。
        return loadKeys().catch(() => undefined);
      })
      .catch(() => message.error(I18N.ccdb.createError))
      .finally(() => setSubmitting(false));
  };

  const handleCopyId = (keyId: string) => {
    copyToClipboard(keyId)
      .then(() => message.success(I18N.ccdb.keyIdCopied))
      .catch(() => message.error(I18N.ccdb.copyManually));
  };

  const handleStatus = (row: CcdbApiKey, enabled: boolean) => {
    const nextStatus = enabled ? 1 : 0;
    const action = enabled ? I18N.ccdb.enable : I18N.ccdb.disable;
    let statusSubmitting = false;
    const confirmation = Modal.confirm({
      zIndex: CCDB_SETTINGS_MODAL_Z_INDEX,
      cancelText: I18N.ccdb.cancel,
      centered: true,
      content: enabled ? I18N.ccdb.keyEnableHint : I18N.ccdb.keyDisableHint,
      okText: I18N.template(I18N.ccdb.confirmAction, { action }),
      title: I18N.template(I18N.ccdb.keyActionTitle, {
        action,
        name: row.name,
      }),
      onOk: close => {
        if (statusSubmitting) {
          return;
        }
        statusSubmitting = true;
        setBusyId(row.id);
        confirmation.update({
          cancelButtonProps: { disabled: true },
          keyboard: false,
          okButtonProps: { loading: true },
        });
        // 手动关闭弹窗，失败留在原处重试，避免向 Modal 传播已处理的拒绝。
        changeCcdbApiKeyStatus(row.id, nextStatus)
          .then(() => {
            setKeys(current =>
              current.map(item =>
                item.id === row.id ? { ...item, status: nextStatus } : item,
              ),
            );
            message.success(
              enabled ? I18N.ccdb.keyEnabled : I18N.ccdb.keyDisabled,
            );
            close();
          })
          .catch(() => {
            message.error(I18N.ccdb.statusError);
            confirmation.update({
              cancelButtonProps: { disabled: false },
              keyboard: true,
              okButtonProps: { loading: false },
            });
          })
          .finally(() => {
            statusSubmitting = false;
            setBusyId(undefined);
          });
      },
    });
  };

  const handleRotate = (row: CcdbApiKey) => {
    Modal.confirm({
      zIndex: CCDB_SETTINGS_MODAL_Z_INDEX,
      cancelText: I18N.ccdb.cancel,
      centered: true,
      content: I18N.ccdb.keyRotateHint,
      okText: I18N.ccdb.confirmReset,
      title: I18N.template(I18N.ccdb.resetKeyTitle, { name: row.name }),
      onOk: () => {
        setBusyId(row.id);
        return rotateCcdbApiKey(row.id)
          .then(rotated => {
            setSecret(rotated);
            message.success(I18N.ccdb.keyReset);
            // 重置已生效，刷新列表失败不应重新执行重置。
            return loadKeys().catch(() => undefined);
          })
          .catch(error => {
            message.error(I18N.ccdb.resetError);
            return Promise.reject(error);
          })
          .finally(() => setBusyId(undefined));
      },
    });
  };

  return (
    <section className={style.panel} aria-labelledby='ccdb-api-key-title'>
      <div className={style.header}>
        <div className={style.headerText}>
          {showTitle ? (
            <h2 className={style.title} id='ccdb-api-key-title'>
              {I18N.ccdb.apiKeyManagement}
            </h2>
          ) : null}
          <p className={style.subtitle}>{I18N.ccdb.apiKeySubtitle}</p>
        </div>
        <button
          className={style.primaryButton}
          type='button'
          onClick={() => setCreateOpen(true)}
        >
          <PlusOutlined />
          {I18N.ccdb.createApiKey}
        </button>
      </div>

      <aside className={style.notice}>
        <KeyOutlined className={style.noticeIcon} />
        <div>
          <strong>{I18N.ccdb.apiKeyWhen}</strong>
          <p>{I18N.ccdb.apiKeyUsage}</p>
          <p>{I18N.ccdb.keySaveHint}</p>
        </div>
      </aside>

      {loading ? (
        <div className={style.loading} role='status'>
          <Spin />
          {I18N.ccdb.loadingKeys}
        </div>
      ) : loadError ? (
        <div className={style.empty} role='alert'>
          {I18N.ccdb.keysLoadFailed}
          <button
            type='button'
            className={style.secondaryButton}
            onClick={() => loadKeys().catch(() => undefined)}
          >
            {I18N.ccdb.retry}
          </button>
        </div>
      ) : ccdbKeys.length ? (
        <div className={style.list}>
          <div className={style.listHeader} aria-hidden='true'>
            <span>{I18N.ccdb.namePurpose}</span>
            <span>Key ID</span>
            <span>API Key</span>
            <span>{I18N.ccdb.status}</span>
            <span>{I18N.ccdb.actions}</span>
            <span>{I18N.ccdb.lastUsed}</span>
            <span>{I18N.ccdb.createdAt}</span>
          </div>
          {ccdbKeys.map(row => {
            const enabled = row.status === 1;
            const busy = busyId === row.id;

            return (
              <article className={style.keyRow} key={row.id}>
                <div className={style.keyIdentity}>
                  <Tooltip
                    title={row.name}
                    placement='topLeft'
                    trigger={['hover', 'focus', 'click']}
                    overlayClassName={style.textTooltip}
                    zIndex={CCDB_SETTINGS_MODAL_Z_INDEX}
                  >
                    <h3 className={`${style.keyName} ${style.twoLineText}`}>
                      {row.name}
                    </h3>
                  </Tooltip>
                  <Tooltip
                    title={row.purpose || I18N.ccdb.noPurpose}
                    placement='topLeft'
                    trigger={['hover', 'focus', 'click']}
                    overlayClassName={style.textTooltip}
                    zIndex={CCDB_SETTINGS_MODAL_Z_INDEX}
                  >
                    <p className={`${style.purpose} ${style.twoLineText}`}>
                      {row.purpose || I18N.ccdb.noPurpose}
                    </p>
                  </Tooltip>
                </div>
                <div className={style.keyIdCell} data-label='Key ID'>
                  <span className={style.keyId}>{row.keyId}</span>
                  <button
                    aria-label={I18N.template(I18N.ccdb.copyNamedKeyId, {
                      name: row.name,
                    })}
                    className={style.copyIdButton}
                    title={I18N.ccdb.keyIdHint}
                    type='button'
                    onClick={() => handleCopyId(row.keyId)}
                  >
                    <CopyOutlined />
                  </button>
                </div>
                <div className={style.maskedKeyCell} data-label='API Key'>
                  <code className={style.maskedKey}>
                    {compactMaskedKey(row.apiKeyMasked)}
                  </code>
                </div>
                <div className={style.statusCell} data-label={I18N.ccdb.status}>
                  <Switch
                    aria-label={I18N.template(I18N.ccdb.keyStatusLabel, {
                      name: row.name,
                    })}
                    checked={enabled}
                    disabled={busy}
                    loading={busy}
                    onChange={checked => handleStatus(row, checked)}
                  />
                  <span className={style.statusText}>
                    {enabled ? I18N.ccdb.enabled : I18N.ccdb.disabled}
                  </span>
                </div>
                <div className={style.actions}>
                  <button
                    className={style.textButton}
                    disabled={busy}
                    type='button'
                    onClick={() => handleRotate(row)}
                  >
                    <ReloadOutlined /> {I18N.ccdb.reset}
                  </button>
                </div>
                <div className={style.timeCell}>
                  <span className={style.timeLabel}>{I18N.ccdb.lastUsed}</span>
                  <span className={style.timeText}>
                    {formatDateTime(row.lastUsedAt)}
                  </span>
                </div>
                <div className={style.timeCell}>
                  <span className={style.timeLabel}>{I18N.ccdb.createdAt}</span>
                  <span className={style.timeText}>
                    {formatDateTime(row.createTime, '—')}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={style.empty}>
          <span className={style.emptyIcon}>
            <KeyOutlined />
          </span>
          <span>{I18N.ccdb.noKeys}</span>
        </div>
      )}

      <Modal
        zIndex={CCDB_SETTINGS_MODAL_Z_INDEX}
        centered
        cancelText={I18N.ccdb.cancel}
        destroyOnClose
        okText={I18N.ccdb.create}
        open={createOpen}
        title={I18N.ccdb.createApiKey}
        confirmLoading={submitting}
        onCancel={() => {
          if (!submitting) {
            setCreateOpen(false);
            form.resetFields();
          }
        }}
        onOk={handleCreate}
      >
        <Form form={form} layout='vertical' requiredMark>
          <Form.Item
            label={I18N.ccdb.name}
            name='name'
            rules={[
              {
                required: true,
                whitespace: true,
                message: I18N.ccdb.nameRequired,
              },
              { max: 64, message: I18N.ccdb.nameMax },
            ]}
          >
            <Input placeholder={I18N.ccdb.namePlaceholder} />
          </Form.Item>
          <Form.Item
            label={I18N.ccdb.purpose}
            name='purpose'
            rules={[
              {
                required: true,
                whitespace: true,
                message: I18N.ccdb.purposeRequired,
              },
              { max: 200, message: I18N.ccdb.purposeMax },
            ]}
          >
            <Input.TextArea
              maxLength={200}
              placeholder={I18N.ccdb.purposePlaceholder}
              rows={4}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        zIndex={CCDB_SETTINGS_MODAL_Z_INDEX}
        centered
        width={560}
        className={style.secretModal}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText={I18N.ccdb.savedKey}
        maskClosable={false}
        destroyOnClose
        open={Boolean(secret)}
        title={I18N.ccdb.keyGenerated}
        onCancel={() => setSecret(undefined)}
        onOk={() => setSecret(undefined)}
      >
        <p className={style.secretHint}>{I18N.ccdb.secretSaveHint}</p>
        {secret ? (
          <div className={style.secretBox}>
            <span className={style.secretLabel}>{secret.name}</span>
            <code className={style.secretValue}>{secret.apiKey}</code>
            <div className={style.secretActions}>
              <button
                className={style.secondaryButton}
                type='button'
                onClick={() => {
                  copyToClipboard(secret.apiKey)
                    .then(() => message.success(I18N.ccdb.secretCopied))
                    .catch(() => message.error(I18N.ccdb.copyManually));
                }}
              >
                <CopyOutlined /> {I18N.ccdb.copySecret}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default CcdbApiKeyPanel;
