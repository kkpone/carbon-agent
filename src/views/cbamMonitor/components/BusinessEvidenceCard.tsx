import I18N from '@src/lang/I18N';
import { Button, Tooltip } from 'antd';
import moment from 'moment';

import { getEvidenceReviewFrequencyLabel, getEvidenceTypeLabel } from './evidenceOptions';
import styles from '../plan.module.less';
import { MonitorEvidence } from '../types';

const formatEvidenceDate = (value?: string) => {
  if (!value) return '--';
  return moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : value;
};

export const BusinessEvidenceCard = ({
  evidence,
  onEdit,
  onDelete,
}: {
  evidence: MonitorEvidence;
  onEdit: (evidenceId: number) => void;
  onDelete: (evidenceId: number) => void;
}) => {
  if (evidence.id === undefined) return null;
  const evidenceName = evidence.file?.name
    || evidence.evidenceNo
    || getEvidenceTypeLabel(evidence.evidenceType)
    || I18N.cbamMonitor.unnamedEvidence;
  return (
    <div className={styles.processMonitorEvidenceCard}>
      <div className={styles.processMonitorEvidenceCardHeader}>
        <div className={styles.processMonitorEvidenceCardPrimary}>
          <span className={styles.configuredTag}>{I18N.cbamMonitor.configured}</span>
          <Tooltip title={evidenceName}>
            <strong className={styles.processMonitorEvidenceFileName}>{evidenceName}</strong>
          </Tooltip>
        </div>
        <div className={styles.processMonitorEvidenceActions}>
          <Button
            className={`${styles.processMonitorEvidenceActionButton} ${styles.processMonitorEvidenceEditButton}`}
            type='text'
            onClick={() => onEdit(evidence.id as number)}
          >
            {I18N.cbamMonitor.edit}
          </Button>
          <Button
            className={`${styles.processMonitorEvidenceActionButton} ${styles.processMonitorEvidenceDeleteTextButton}`}
            danger
            type='text'
            onClick={() => onDelete(evidence.id as number)}
          >
            {I18N.cbamMonitor.delete}
          </Button>
        </div>
      </div>
      <div className={styles.processMonitorEvidenceDetails}>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.evidenceType}：</span>
          <strong>{getEvidenceTypeLabel(evidence.evidenceType) || '--'}</strong>
        </div>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.source}：</span>
          <strong>{evidence.sourceName || '--'}</strong>
        </div>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.number}：</span>
          <strong>{evidence.evidenceNo || '--'}</strong>
        </div>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.issueDate}：</span>
          <strong>{formatEvidenceDate(evidence.issueDate)}</strong>
        </div>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.expiryDate}：</span>
          <strong>{formatEvidenceDate(evidence.expiryDate)}</strong>
        </div>
        <div className={styles.processMonitorEvidenceDetail}>
          <span>{I18N.cbamMonitor.reviewFrequency}：</span>
          <strong>{getEvidenceReviewFrequencyLabel(evidence.reviewFrequency) || '--'}</strong>
        </div>
      </div>
    </div>
  );
};
