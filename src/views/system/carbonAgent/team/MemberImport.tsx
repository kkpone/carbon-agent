import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Space,
  Table,
  Upload,
  message,
} from 'antd';
import { useEffect, useState, useRef } from 'react';

import { teamApi } from './api';
import { errorText, reasonText } from './errors';
import { downloadCsv, csvRecordCount, hasExpired } from './helpers';
import { teamText } from './i18n';
import type { ImportRow } from './types';
import { useWorkspace } from './workspace';

const fields = [
  'userId',
  'name',
  'email',
  'phone',
  'username',
  'orgId',
  'roleId',
  'memberStatus',
] as const;
export const MemberImport = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { key, refresh } = useWorkspace();
  const savedKey = `${key.join(':')}:member-import`;
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const [recoveryRequired, setRecoveryRequired] = useState(false);
  const batchId =
    rows[0]?.batchId || sessionStorage.getItem(savedKey) || undefined;
  const restore = async (id: string) => {
    setRows(await teamApi.importResult(id));
    setRecoveryRequired(false);
    setConfirmed(false);
  };
  useEffect(() => {
    const id = sessionStorage.getItem(savedKey);
    if (!open || !id) return;
    setBusy(true);
    setRecoveryRequired(true);
    restore(id)
      .catch(failure => setError(errorText(failure)))
      .finally(() => setBusy(false));
  }, [open, savedKey]);
  const upload = async (file: File) => {
    if (!/\.csv$/i.test(file.name) || file.size > 1024 * 1024) {
      message.warning(teamText('onlyCsvFilesUpTo1Mb'));
      return;
    }
    setBusy(true);
    setError('');
    setConfirmed(false);
    try {
      if (csvRecordCount(await file.text()) > 1001)
        throw new Error('AGENT_IMPORT_FILE_TOO_LARGE');
      const result = await teamApi.previewImport(file);
      setRows(result);
      if (result[0]?.batchId)
        sessionStorage.setItem(savedKey, result[0].batchId);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  };
  const execute = async () => {
    if (!batchId || busy || lock.current || recoveryRequired || !confirmed)
      return;
    if (hasExpired(rows[0]?.expiresAt)) {
      setError(teamText('thePreviewHasExpiredUploadTheFile'));
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      setRows(await teamApi.executeImport(batchId));
      refresh();
    } catch (failure) {
      setError(errorText(failure));
      setRecoveryRequired(true);
      try {
        await restore(batchId);
      } catch {
        setError(teamText('executionStatusIsNotYetConfirmedQuery'));
      }
    } finally {
      setBusy(false);
      setConfirmed(false);
      lock.current = false;
    }
  };
  const expired = hasExpired(rows[0]?.expiresAt);
  const pending = rows.filter(
    row => row.state === 'PENDING' || row.state === 'FAILED',
  ).length;
  const states = {
    PENDING: teamText('pendingExecution'),
    INVALID: teamText('validationFailed'),
    APPLIED: teamText('completed'),
    FAILED: teamText('executionFailed'),
  };
  return (
    <Modal
      title={teamText('importAndUpdateMembersViaCsv')}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Alert type='info' message={teamText('upTo1000RowsAnd1')} />
      {error && <Alert type='warning' message={error} />}
      {expired && (
        <Alert
          type='warning'
          message={teamText('thePreviewHasExpiredUploadTheFile')}
        />
      )}
      <Space style={{ margin: '16px 0' }} wrap>
        <Button
          onClick={() =>
            downloadCsv(
              teamText('memberImportTemplate'),
              [],
              fields.map(field => ({ title: field, value: () => '' })),
            )
          }
        >
          {teamText('downloadTemplate')}
        </Button>
        <Upload
          accept='.csv'
          showUploadList={false}
          disabled={busy || recoveryRequired}
          beforeUpload={file => {
            upload(file);
            return false;
          }}
        >
          <Button loading={busy}>{teamText('uploadAndPreview')}</Button>
        </Upload>
        <Button
          disabled={!rows.length || busy}
          onClick={() =>
            downloadCsv(teamText('memberImportResults'), rows, [
              ...fields.map(field => ({
                title: field,
                value: (row: ImportRow) => row[field],
              })),
              { title: 'rowNumber', value: row => String(row.rowNumber) },
              { title: 'state', value: row => states[row.state] },
              { title: 'errorCode', value: row => row.errorCode },
            ])
          }
        >
          {teamText('downloadValidationResults')}
        </Button>
        <Button
          disabled={!batchId || busy}
          onClick={() => {
            if (batchId)
              restore(batchId).catch(failure => setError(errorText(failure)));
          }}
        >
          {teamText('refreshBatchResults')}
        </Button>
      </Space>
      <Table
        size='small'
        rowKey='rowNumber'
        loading={busy}
        dataSource={rows}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 20 }}
        columns={[
          { title: teamText('rowNumber'), dataIndex: 'rowNumber' },
          { title: teamText('name'), dataIndex: 'name' },
          { title: teamText('account'), dataIndex: 'username' },
          { title: teamText('email'), dataIndex: 'email' },
          { title: teamText('phoneNumber'), dataIndex: 'phone' },
          {
            title: teamText('status'),
            dataIndex: 'state',
            render: value => states[value as keyof typeof states],
          },
          {
            title: teamText('validationDetails'),
            dataIndex: 'errorCode',
            render: value => (value ? reasonText(value) : '—'),
          },
        ]}
      />
      <Space>
        <Checkbox
          disabled={expired || !pending}
          checked={confirmed}
          onChange={event => setConfirmed(event.target.checked)}
        >
          {teamText('iUnderstandTheImpactOfAddingAnd')}
        </Checkbox>
        <Button
          type='primary'
          loading={busy}
          disabled={!confirmed || expired || !pending || recoveryRequired}
          onClick={execute}
        >
          {teamText('execute')}
          {pending} {teamText('rows')}
        </Button>
      </Space>
    </Modal>
  );
};
