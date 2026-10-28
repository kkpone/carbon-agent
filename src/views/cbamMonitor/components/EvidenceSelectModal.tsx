import I18N from '@src/lang/I18N';
import { Modal, Table, TableColumnsType, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { getEvidenceTypeLabel } from './evidenceOptions';
import styles from '../plan.module.less';
import { MonitorEvidence } from '../types';

const formatDate = (value?: string) => (
  value && moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : '--'
);

export const EvidenceSelectModal = ({
  evidences,
  open,
  onCancel,
  onConfirm,
}: {
  evidences: MonitorEvidence[];
  open: boolean;
  onCancel: () => void;
  onConfirm: (evidenceIds: number[]) => void;
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    if (!open) setSelectedIds([]);
  }, [open]);
  const columns: TableColumnsType<MonitorEvidence> = [
    {
      title: I18N.cbamMonitor.evidenceType,
      dataIndex: 'evidenceType',
      width: 180,
      ellipsis: true,
      render: value => getEvidenceTypeLabel(value) || '--',
    },
    {
      title: I18N.cbamMonitor.source,
      dataIndex: 'sourceName',
      width: 180,
      ellipsis: true,
      render: value => value || '--',
    },
    {
      title: I18N.cbamMonitor.issueDate,
      dataIndex: 'issueDate',
      width: 125,
      render: formatDate,
    },
    {
      title: I18N.cbamMonitor.expiryDate,
      dataIndex: 'expiryDate',
      width: 125,
      render: formatDate,
    },
    {
      title: I18N.cbamMonitor.file,
      dataIndex: 'file',
      width: 224,
      render: file => {
        if (!file?.name) {
          return <span className={styles.evidenceSelectPendingFile}>{I18N.cbamMonitor.evidenceFileMissing}</span>;
        }
        const icon = /\.xlsx?$/i.test(file.name) ? '/images/icon-excel.png' : '/images/file-icon.svg';
        return (
          <div className={styles.evidenceSelectFile}>
            <img src={icon} alt='' />
            <Tooltip title={file.name}>
              <span>{file.name}</span>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  return (
    <Modal
      centered
      className={styles.evidenceSelectModal}
      rootClassName={styles.evidenceSelectModal}
      destroyOnClose
      open={open}
      title={I18N.cbamMonitor.selectEvidence}
      width={946}
      onCancel={onCancel}
      cancelText={I18N.cbamMonitor.cancel}
      okButtonProps={{ disabled: selectedIds.length === 0 }}
      okText={I18N.cbamMonitor.confirm}
      onOk={() => onConfirm(selectedIds)}
    >
      <Table<MonitorEvidence>
        columns={columns}
        dataSource={evidences}
        locale={{ emptyText: I18N.cbamMonitor.noData }}
        pagination={false}
        rowKey={record => record.id || 0}
        rowSelection={{
          columnWidth: 48,
          selectedRowKeys: selectedIds,
          onChange: keys => setSelectedIds(keys.map(Number)),
        }}
        scroll={{ x: 882 }}
      />
    </Modal>
  );
};
