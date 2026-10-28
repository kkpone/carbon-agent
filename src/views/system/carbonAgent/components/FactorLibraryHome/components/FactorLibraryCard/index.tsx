import { CopyOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { copyToClipboard } from '@src/utils/clipboard';
import { message, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import { parseCcdbFactorSnapshot } from '../../../../ccdbFactor';
import type { FactorLibraryItem, FactorLibraryRecord } from '../../types';
import factorIcon from './factor.png';
import styles from './index.module.less';

interface Props {
  item?: FactorLibraryItem;
  record?: FactorLibraryRecord;
  onOpen: (item: FactorLibraryItem) => void;
}

export default function FactorLibraryCard({
  item: providedItem,
  record,
  onOpen,
}: Props) {
  const item = useMemo(() => {
    if (!record) return providedItem;
    try {
      return parseCcdbFactorSnapshot(record.factorSnapshotJson);
    } catch {
      return undefined;
    }
  }, [providedItem, record]);
  const [copying, setCopying] = useState(false);

  const copy = () => {
    if (copying || !item) return;
    setCopying(true);
    copyToClipboard(
      `${item.name || I18N.ccdb.emissionFactor}: ${item.cValue ?? '—'} ${
        item.unit || ''
      }`.trim(),
    )
      .then(() => {
        message.success(I18N.ccdb.libraryCopied);
      })
      .catch(() => {
        message.error(I18N.ccdb.copyError);
      })
      .finally(() => setCopying(false));
  };

  if (!item)
    return (
      <article className={styles.wrapper} role='alert'>
        {I18N.ccdb.librarySnapshotInvalid}
      </article>
    );
  const name = item.name || I18N.ccdb.emissionFactor;
  const actionLabels: Record<string, string> = {
    SEARCH: I18N.ccdb.libraryActionSearch,
    VIEW: I18N.ccdb.libraryActionView,
    REFERENCE: I18N.ccdb.libraryActionReference,
    USE: I18N.ccdb.libraryActionUse,
  };

  return (
    <article className={styles.wrapper}>
      <div className={styles.card}>
        <button
          type='button'
          className={styles.open}
          onClick={() => onOpen(item)}
          aria-label={I18N.template(I18N.ccdb.libraryOpenFactor, {
            name,
          })}
        >
          <img
            src={factorIcon}
            className={styles.icon}
            alt=''
            aria-hidden='true'
          />
          <span className={styles.info}>
            <strong className={styles.name} title={name}>
              {name}
            </strong>
            <span className={styles.value}>
              {item.cValue ?? '—'}{' '}
              <span className={styles.unit}>{item.unit || '—'}</span>
            </span>
          </span>
        </button>
        <div className={styles.actions}>
          <Tooltip title={I18N.ccdb.numberOfReplicationFactors}>
            <button
              type='button'
              disabled={copying}
              aria-busy={copying}
              aria-label={I18N.ccdb.numberOfReplicationFactors}
              onClick={copy}
            >
              <CopyOutlined />
            </button>
          </Tooltip>
        </div>
        <button
          type='button'
          className={styles.source}
          onClick={() => onOpen(item)}
          aria-label={I18N.template(I18N.ccdb.libraryOpenFactor, {
            name,
          })}
        >
          <span title={item.institution || undefined}>
            {item.institution || '—'}
          </span>
          <span>{item.year ?? '—'}</span>
        </button>
      </div>
      {record?.occurredAt && (
        <p className={styles.activity}>
          {actionLabels[record.actionType] || record.actionType} ·{' '}
          {dayjs(record.occurredAt).format('YYYY-MM-DD HH:mm')}
        </p>
      )}
    </article>
  );
}
