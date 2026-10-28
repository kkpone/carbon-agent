import { CloseOutlined } from '@ant-design/icons';
import { copyToClipboard } from '@src/utils';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  getSysShareRecordList,
  postSysShareNewModel,
  postSysShareSyncModel,
} from '@src/views/carbonFootprint3/FootprintAccount/service';
import { SysShareRecord } from '@src/views/carbonFootprint3/FootprintAccount/type';
import {
  buildSysShareCopyText,
  formatSysShareUpdateTime,
  getSysShareCopyExpiredTip,
  getSysShareEditPermitText,
  getSysShareEditTypeText,
  getSysShareSyncDisabledTip,
  getSysShareValidityText,
  isSysShareLinkValid,
  isSysShareSyncActionAvailable,
} from '@src/views/carbonFootprint3/sysShare';
import { Modal, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/lib/table/interface';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { SysShareRecordModalProps } from './type';

const TABLE_ROW_HEIGHT = 48;
/** 超过 10 行出现纵向滚动条，与 Figma / PRD 一致 */
const TABLE_SCROLL_MAX_ROWS = 10;
/** 固定列宽：密码 120px、是否支持编辑 200px；多余宽度并入有效期列 */
const COLUMN_SHARE_LINK_WIDTH = 320;
const COLUMN_PASSWORD_WIDTH = 120;
const COLUMN_EDIT_TYPE_WIDTH = 200;
const COLUMN_EDIT_PERMIT_WIDTH = 200;
/** 纵向滚动条占位并入有效期列，避免表格右侧留白 */
const TABLE_VERTICAL_SCROLLBAR_GUTTER = 32;
const COLUMN_VALIDITY_WIDTH = 160 + TABLE_VERTICAL_SCROLLBAR_GUTTER;
const COLUMN_UPDATE_TIME_WIDTH = 180;
const COLUMN_ACTION_WIDTH = 280;
/** 弹框可视区域列宽（不含新增列），保持原 1208px 弹框宽度不变 */
const TABLE_VIEWPORT_WIDTH =
  COLUMN_SHARE_LINK_WIDTH +
  COLUMN_PASSWORD_WIDTH +
  COLUMN_EDIT_TYPE_WIDTH +
  COLUMN_VALIDITY_WIDTH +
  COLUMN_ACTION_WIDTH;
/** 表格内容总宽（含新增列），超出可视区域时出现横向滚动条 */
const TABLE_SCROLL_X =
  TABLE_VIEWPORT_WIDTH + COLUMN_EDIT_PERMIT_WIDTH + COLUMN_UPDATE_TIME_WIDTH;
const MODAL_BODY_PADDING_X = 64;
const MODAL_WIDTH =
  TABLE_VIEWPORT_WIDTH + MODAL_BODY_PADDING_X + TABLE_VERTICAL_SCROLLBAR_GUTTER;

const normalizeRecords = (resp: unknown): SysShareRecord[] => {
  const payload = (resp as any)?.data?.data ?? (resp as any)?.data ?? [];
  if (Array.isArray(payload)) return payload;
  return payload?.rows ?? [];
};

/** 分享记录弹框，布局对齐 Figma node 4147:15520 */
const SysShareRecordModal = ({
  open,
  account,
  onClose,
  refreshKey = 0,
}: SysShareRecordModalProps) => {
  const [records, setRecords] = useState<SysShareRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const resp = await getSysShareRecordList({ accountId: account.id });
      setRecords(normalizeRecords(resp));
    } catch {
      // 获取分享记录失败时静默降级为空列表
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [account?.id]);

  useEffect(() => {
    if (!open || !account?.id) {
      setRecords([]);
      return undefined;
    }
    fetchRecords();
    return undefined;
  }, [open, account?.id, refreshKey, fetchRecords]);

  const tableScroll = useMemo(() => {
    const scroll: { x?: number; y?: number } = { x: TABLE_SCROLL_X };
    if (records.length > TABLE_SCROLL_MAX_ROWS) {
      scroll.y = TABLE_ROW_HEIGHT * TABLE_SCROLL_MAX_ROWS;
    }
    return scroll;
  }, [records.length]);

  const handleSyncModel = useCallback(
    async (record: SysShareRecord) => {
      if (!isSysShareSyncActionAvailable(record)) return;
      setActionLoadingId(record.id);
      try {
        await postSysShareSyncModel({ id: record.id });
        Toast('success', I18N.carbonFootprint3.sysShareSyncSuccess);
        await fetchRecords();
      } catch {
        // 后端错误信息由 request 拦截器 toast 展示
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchRecords],
  );

  const handleNewModel = useCallback(
    async (record: SysShareRecord) => {
      if (!isSysShareSyncActionAvailable(record)) return;
      setActionLoadingId(record.id);
      try {
        await postSysShareNewModel({ id: record.id });
        Toast('success', I18N.carbonFootprint3.sysShareNewModelSuccess);
        await fetchRecords();
      } catch {
        // 后端错误信息由 request 拦截器 toast 展示
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchRecords],
  );

  const handleCopyLink = useCallback(async (record: SysShareRecord) => {
    if (!isSysShareLinkValid(record)) return;
    const text = buildSysShareCopyText(record);
    if (!text) {
      Toast('warn', I18N.carbonFootprint3.sysShareCopyEmptyTip);
      return;
    }
    await copyToClipboard(text);
    Toast('success', I18N.carbonFootprint3.copySuccessful);
  }, []);

  /** 操作列文案，对齐 Figma 4147:17166 — 纯文本 #026961，非 link Button */
  const renderActionItem = (
    label: string,
    enabled: boolean,
    disabledTip: string,
    onClick: () => void,
    loading: boolean,
  ) => {
    if (!enabled) {
      return (
        <Tooltip title={disabledTip}>
          <span className={styles.actionDisabled}>{label}</span>
        </Tooltip>
      );
    }
    return (
      <span
        className={classNames(styles.actionText, {
          [styles.actionLoading]: loading,
        })}
        onClick={loading ? undefined : onClick}
      >
        {label}
      </span>
    );
  };

  const columns: ColumnsType<SysShareRecord> = useMemo(
    () => [
      {
        title: I18N.carbonFootprint3.shareLink,
        dataIndex: 'shareUrl',
        width: 320,
        ellipsis: true,
        render: (_: unknown, record) => {
          const url = record.shareUrl || record.url || '-';
          return (
            <Tooltip title={url === '-' ? undefined : url}>
              <div className={styles.linkCell}>{url}</div>
            </Tooltip>
          );
        },
      },
      {
        title: I18N.carbonFootprint3.password,
        dataIndex: 'password',
        width: COLUMN_PASSWORD_WIDTH,
        ellipsis: true,
        render: (text?: string, record) => {
          if (record.type === 0) return I18N.carbonFootprint3.noPassword;
          return text || '-';
        },
      },
      {
        title: I18N.carbonFootprint3.supportEditAndDataSync,
        dataIndex: 'editType',
        width: COLUMN_EDIT_TYPE_WIDTH,
        render: (editType: number) => getSysShareEditTypeText(editType),
      },
      {
        title: I18N.carbonFootprint3.shareRecordEditPermitConfig,
        dataIndex: 'editPermit',
        width: COLUMN_EDIT_PERMIT_WIDTH,
        ellipsis: true,
        render: (_: unknown, record) =>
          getSysShareEditPermitText(record.editType, record.editPermit),
      },
      {
        title: I18N.carbonFootprint3.validityPeriod,
        dataIndex: 'expireTime',
        width: COLUMN_VALIDITY_WIDTH,
        ellipsis: true,
        render: (_: unknown, record) => getSysShareValidityText(record),
      },
      {
        title: I18N.carbonFootprint3.shareRecordChangeTime,
        dataIndex: 'updateTime',
        width: COLUMN_UPDATE_TIME_WIDTH,
        ellipsis: true,
        render: (text?: string) => formatSysShareUpdateTime(text),
      },
      {
        title: I18N.carbonFootprint.operation,
        key: 'action',
        width: COLUMN_ACTION_WIDTH,
        fixed: 'right',
        render: (_: unknown, record) => {
          const syncAvailable = isSysShareSyncActionAvailable(record);
          const linkValid = isSysShareLinkValid(record);
          const rowLoading = actionLoadingId === record.id;

          return (
            <div className={styles.actionsCell}>
              {renderActionItem(
                I18N.carbonFootprint3.syncModel,
                syncAvailable,
                getSysShareSyncDisabledTip(),
                () => handleSyncModel(record),
                rowLoading,
              )}
              {renderActionItem(
                I18N.carbonFootprint3.newModelFromShare,
                syncAvailable,
                getSysShareSyncDisabledTip(),
                () => handleNewModel(record),
                rowLoading,
              )}
              {renderActionItem(
                I18N.carbonFootprint3.copyLinkAnd,
                linkValid,
                getSysShareCopyExpiredTip(),
                () => handleCopyLink(record),
                false,
              )}
            </div>
          );
        },
      },
    ],
    [actionLoadingId, handleCopyLink, handleNewModel, handleSyncModel],
  );

  return (
    <Modal
      open={open}
      footer={null}
      centered
      destroyOnClose
      maskClosable={false}
      width={MODAL_WIDTH}
      className={styles.sysShareRecordModal}
      onCancel={onClose}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.title}>
            {I18N.carbonFootprint3.shareRecord}
          </div>
          <div className={styles.closeBtn} onClick={onClose}>
            <CloseOutlined />
          </div>
        </div>

        <div className={styles.body}>
          <div
            className={classNames(styles.tableWrap, {
              [styles.tableWrapScrollable]:
                records.length > TABLE_SCROLL_MAX_ROWS,
            })}
          >
            <Table<SysShareRecord>
              rowKey='id'
              columns={columns}
              dataSource={records}
              loading={loading}
              pagination={false}
              tableLayout='fixed'
              scroll={tableScroll}
              locale={{ emptyText: I18N.carbonFootprint3.noData }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SysShareRecordModal;
