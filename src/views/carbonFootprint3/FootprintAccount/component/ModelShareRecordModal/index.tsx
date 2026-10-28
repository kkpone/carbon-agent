import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { getModelShareRecords } from '@src/views/carbonFootprint3/FootprintAccount/service';
import { ModelShareRecord } from '@src/views/carbonFootprint3/FootprintAccount/type';
import {
  getAccountShareTypeText,
  getModelShareRecordStatusMeta,
} from '@src/views/carbonFootprint3/share';
import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table/interface';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { ModelShareRecordModalProps } from './type';

const TABLE_ROW_HEIGHT = 48;
/** 超过 10 行才出现纵向滚动条 */
const TABLE_SCROLL_MAX_ROWS = 10;
/** 与操作人列同宽 */
const OPERATOR_COLUMN_WIDTH = 100;
/** 弹窗宽度 = 原宽度 + 状态列宽 */
const MODAL_WIDTH = 920 + OPERATOR_COLUMN_WIDTH;

const STATUS_CLASS_MAP = {
  pendingFill: 'statusPendingFill',
  pendingReview: 'statusPendingReview',
  done: 'statusDone',
  rejected: 'statusRejected',
} as const;

const formatRecordTime = (time?: string) => {
  if (!time) return '-';
  const parsed = moment(time);
  return parsed.isValid() ? parsed.format('YYYY/M/D HH:mm:ss') : time;
};

const normalizeRecords = (resp: any): ModelShareRecord[] => {
  const payload = resp?.data?.data ?? resp?.data ?? [];
  if (Array.isArray(payload)) return payload;
  return payload?.rows ?? [];
};

const ModelShareRecordModal = ({
  open,
  account,
  onClose,
}: ModelShareRecordModalProps) => {
  const [records, setRecords] = useState<ModelShareRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const tableScroll = useMemo(() => {
    if (records.length > TABLE_SCROLL_MAX_ROWS) {
      return { y: TABLE_ROW_HEIGHT * TABLE_SCROLL_MAX_ROWS };
    }
    return undefined;
  }, [records.length]);

  useEffect(() => {
    if (!open || !account?.id) {
      setRecords([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    getModelShareRecords({ accountId: account.id })
      .then(resp => {
        if (cancelled) return;
        setRecords(normalizeRecords(resp));
      })
      .catch(() => {
        // 获取共享记录失败时静默降级为空列表
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, account?.id]);

  const columns: ColumnsType<ModelShareRecord> = useMemo(
    () => [
      {
        title: I18N.carbonFootprint3.shareWay,
        dataIndex: 'shareType',
        width: 140,
        ellipsis: true,
        render: (shareType: number) => getAccountShareTypeText(shareType),
      },
      {
        title: I18N.carbonFootprint3.supplierName,
        dataIndex: 'supplierCompanyName',
        width: 200,
        ellipsis: true,
        render: (text?: string) => text || '-',
      },
      {
        title: I18N.carbonFootprint3.modelShareSupplierCode,
        dataIndex: 'supplierCompanyNum',
        width: 220,
        ellipsis: true,
        render: (text?: string) => text || '-',
      },
      {
        title: I18N.carbonFootprint3.shareStatus,
        dataIndex: 'status',
        width: OPERATOR_COLUMN_WIDTH,
        render: (status?: number | null) => {
          const meta = getModelShareRecordStatusMeta(status);
          if (!meta.showTag || !meta.className) {
            return null;
          }
          return (
            <span
              className={classNames(
                styles.statusTag,
                styles[STATUS_CLASS_MAP[meta.className]],
              )}
            >
              {meta.label}
            </span>
          );
        },
      },
      {
        title: I18N.carbonFootprint3.batchTaskOperator,
        dataIndex: 'updateByName',
        width: OPERATOR_COLUMN_WIDTH,
        ellipsis: true,
        render: (text?: string) => text || '-',
      },
      {
        title: I18N.carbonFootprint3.shareRecordOperationTime,
        dataIndex: 'updateTime',
        ellipsis: true,
        render: (text?: string) => formatRecordTime(text),
      },
    ],
    [],
  );

  return (
    <Modal
      open={open}
      footer={null}
      centered
      destroyOnClose
      maskClosable={false}
      width={MODAL_WIDTH}
      className={styles.modelShareRecordModal}
      onCancel={onClose}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.title}>
            {I18N.carbonFootprint3.sharedRecord}
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
            <Table<ModelShareRecord>
              rowKey={record => `${record.id}-${record.supplierId ?? 0}`}
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

export default ModelShareRecordModal;
