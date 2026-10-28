/* eslint-disable no-restricted-syntax, no-continue, no-await-in-loop -- evidence mutations must preserve dataVersion order */
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tooltip,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import I18N from '@src/lang/I18N';

import {
  CbamDrawerClose,
  CbamDrawerTitle,
} from '@/components/CbamDrawerHeader';
import { EvidenceSelectModal } from '@/views/cbamMonitor/components/EvidenceSelectModal';
import { FileObjectUpload } from '@/views/cbamMonitor/components/FileObjectUpload';
import {
  evidenceReviewFrequencyOptions,
  evidenceTypeOptions,
  getEvidenceReviewFrequencyLabel,
  getEvidenceTypeLabel,
} from '@/views/cbamMonitor/components/evidenceOptions';
import selectEvidenceIcon from '@/views/cbamMonitor/assets/select-evidence.svg';
import evidenceReferenceIcon from '@/views/cbamMonitor/assets/evidence-reference.svg';
import pendingRibbon from '@/views/cbamMonitor/assets/evidence-pending-ribbon.svg';
import validRibbon from '@/views/cbamMonitor/assets/evidence-valid-ribbon.svg';
import { FileObj, MonitorEvidence } from '@/views/cbamMonitor/types';

import {
  addOperationEvidence,
  deleteOperationEvidence,
  editOperationEvidence,
  getOperationEvidences,
  selectOperationEvidence,
  resolveOperationFileUrl,
} from '../../../service';
import {
  EvidenceMutationResult,
  EvidencePayload,
  MonitorEvidenceCandidate,
  OperationEvidence,
  OperationEvidenceList,
} from '../../../types';
import { requestErrorMessage } from '../../../utils';
import styles from './index.module.less';

export interface Co2EvidenceDraft extends MonitorEvidence {
  draftKey: string;
  sourceEvidenceId?: number;
}

interface EvidenceEditorValue
  extends Omit<MonitorEvidence, 'issueDate' | 'expiryDate'> {
  issueDate?: Dayjs;
  expiryDate?: Dayjs;
}

interface Co2EvidenceModalProps {
  open: boolean;
  onClose: () => void;
  operationId?: number | string;
  dataVersion?: number;
  itemKey: string;
  partCode?: string;
  sourceItemKey?: string;
  sourcePartCodes?: string[];
  relatedDataLabel?: string;
  readonly?: boolean;
  sourceEvidences: MonitorEvidence[];
  drafts: Co2EvidenceDraft[];
  onDraftChange: (value: Co2EvidenceDraft[]) => void;
  onMutation: (value: EvidenceMutationResult) => Promise<void>;
}

export const evidenceValues = (
  value: MonitorEvidence | OperationEvidence,
): Omit<EvidencePayload, 'operationId' | 'dataVersion' | 'evidenceId'> => ({
  evidenceType: value.evidenceType || '',
  reviewFrequency: value.reviewFrequency,
  sourceName: value.sourceName,
  evidenceNo: value.evidenceNo,
  issueDate: value.issueDate,
  expiryDate: value.expiryDate,
  remark: value.remark,
  file: value.file,
});

const formatDate = (value?: string) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '--';

const createDraftKey = () =>
  `local:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const Co2EvidenceModal = ({
  open,
  onClose,
  operationId,
  dataVersion,
  itemKey,
  partCode = 'CO2_STAGE',
  sourceItemKey,
  sourcePartCodes = [partCode],
  relatedDataLabel = I18N.cbamOperationReport.co2ProjectGroupTitle,
  readonly,
  sourceEvidences,
  drafts,
  onDraftChange,
  onMutation,
}: Co2EvidenceModalProps) => {
  const [editor] = Form.useForm<EvidenceEditorValue>();
  const [data, setData] = useState<OperationEvidenceList>();
  const [currentVersion, setCurrentVersion] = useState(dataVersion);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [editingDraftKey, setEditingDraftKey] = useState<string>();
  const [editingEvidenceId, setEditingEvidenceId] = useState<number>();
  const [submitting, setSubmitting] = useState(false);
  const eligibleCandidates = (data?.monitorCandidates || []).filter(
    item => !item.relatedToCurrentItem,
  );
  const eligibleSourceEvidences: MonitorEvidence[] = operationId
    ? eligibleCandidates.map(item => ({
        ...item,
        id: item.sourceEvidenceId,
      }))
    : sourceEvidences.filter(
        item => !drafts.some(draft => draft.sourceEvidenceId === item.id),
      );
  const linkedEvidences = (data?.evidences || []).filter(
    item => item.relatedToCurrentItem,
  );
  const displayedEvidences = operationId ? linkedEvidences : drafts;

  const load = useCallback(async () => {
    if (!operationId) return;
    setLoading(true);
    try {
      const response = await getOperationEvidences({
        operationId,
        partCode,
        itemKey,
      });
      setData(response.data?.data);
      setCurrentVersion(response.data?.data?.dataVersion);
    } catch (error) {
      message.error(
        requestErrorMessage(error, I18N.cbamOperationReport.evidenceLoadFailed),
      );
    } finally {
      setLoading(false);
    }
  }, [operationId, partCode, itemKey]);

  useEffect(() => {
    if (open && operationId) load();
  }, [open, operationId, load]);

  useEffect(() => setCurrentVersion(dataVersion), [dataVersion]);

  const finish = async (value: EvidenceMutationResult) => {
    setCurrentVersion(value.dataVersion);
    await onMutation(value);
    await load();
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingDraftKey(undefined);
    setEditingEvidenceId(undefined);
    editor.resetFields();
  };

  const openEditor = (value?: Co2EvidenceDraft | OperationEvidence) => {
    setEditingDraftKey(
      value && 'draftKey' in value ? value.draftKey : undefined,
    );
    setEditingEvidenceId(
      value && 'evidenceId' in value ? value.evidenceId : undefined,
    );
    editor.resetFields();
    editor.setFieldsValue(
      value
        ? {
            ...value,
            issueDate: value.issueDate ? dayjs(value.issueDate) : undefined,
            expiryDate: value.expiryDate ? dayjs(value.expiryDate) : undefined,
          }
        : {},
    );
    setEditorOpen(true);
  };

  const saveEditor = async () => {
    const values = await editor.validateFields();
    const patch: MonitorEvidence = {
      ...values,
      issueDate: values.issueDate?.format('YYYY-MM-DD'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
    };
    if (!operationId) {
      onDraftChange(
        editingDraftKey
          ? drafts.map(item =>
              item.draftKey === editingDraftKey ? { ...item, ...patch } : item,
            )
          : [...drafts, { ...patch, draftKey: createDraftKey() }],
      );
      closeEditor();
      return;
    }
    if (currentVersion == null) return;
    setSubmitting(true);
    try {
      if (editingEvidenceId) {
        const response = await editOperationEvidence({
          operationId,
          dataVersion: currentVersion,
          evidenceId: editingEvidenceId,
          ...evidenceValues(patch),
        });
        const result = response.data?.data;
        if (result) await finish(result);
      } else {
        const response = await addOperationEvidence({
          operationId,
          dataVersion: currentVersion,
          ...evidenceValues(patch),
        });
        const created = response.data?.data;
        if (!created?.evidenceId)
          throw new Error(I18N.cbamOperationReport.emptySaveResult);
        const relationResponse = await selectOperationEvidence({
          operationId,
          dataVersion: created.dataVersion,
          evidenceId: created.evidenceId,
          partCode,
          itemKey,
        });
        const related = relationResponse.data?.data;
        if (related) await finish(related);
      }
      closeEditor();
    } catch (error) {
      message.error(
        requestErrorMessage(error, I18N.cbamOperationReport.evidenceSaveFailed),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const select = async (ids: number[]) => {
    if (!operationId) {
      const existing = new Set(drafts.map(item => item.sourceEvidenceId));
      const additions = eligibleSourceEvidences
        .filter(
          item =>
            item.id != null && ids.includes(item.id) && !existing.has(item.id),
        )
        .map(item => ({
          ...item,
          draftKey: `source:${item.id}`,
          sourceEvidenceId: item.id,
        }));
      onDraftChange([...drafts, ...additions]);
      setSelectOpen(false);
      return;
    }
    if (currentVersion == null) return;
    setSubmitting(true);
    try {
      let version = currentVersion;
      let last: EvidenceMutationResult | undefined;
      for (const sourceEvidenceId of ids) {
        const candidate: MonitorEvidenceCandidate | undefined =
          eligibleCandidates.find(
            item => item.sourceEvidenceId === sourceEvidenceId,
          );
        if (!candidate) continue;
        const response = await selectOperationEvidence({
          operationId,
          dataVersion: version,
          ...(candidate.copiedEvidenceId
            ? { evidenceId: candidate.copiedEvidenceId }
            : { sourceEvidenceId }),
          partCode,
          itemKey,
        });
        last = response.data?.data;
        if (!last) throw new Error(I18N.cbamOperationReport.emptySaveResult);
        version = last.dataVersion;
      }
      if (last) await finish(last);
      setSelectOpen(false);
    } catch (error) {
      message.error(
        requestErrorMessage(
          error,
          I18N.cbamOperationReport.evidenceRelateFailed,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (value: Co2EvidenceDraft | OperationEvidence) => {
    Modal.confirm({
      title: I18N.cbamOperationReport.deleteEvidence,
      content: I18N.template(
        I18N.cbamOperationReport.confirmRemoveEvidenceRelation,
        { name: relatedDataLabel },
      ),
      okText: I18N.cbamOperationReport.delete,
      okButtonProps: { danger: true },
      cancelText: I18N.cbamOperationReport.cancel,
      onOk: async () => {
        if (!operationId && 'draftKey' in value) {
          onDraftChange(
            drafts.filter(item => item.draftKey !== value.draftKey),
          );
          return;
        }
        if (!operationId || currentVersion == null || !('evidenceId' in value))
          return;
        const relation = value.relations?.find(
          item =>
            (item.partCode === partCode && item.itemKey === itemKey) ||
            (sourcePartCodes.includes(item.partCode) &&
              (Boolean(sourceItemKey && item.itemKey === sourceItemKey) ||
                item.itemKey.startsWith('monitor-relation-'))),
        );
        if (!relation) return;
        try {
          const response = await deleteOperationEvidence({
            operationId,
            dataVersion: currentVersion,
            evidenceId: value.evidenceId,
            relationId: relation.relationId,
          });
          const result = response.data?.data;
          if (result) await finish(result);
        } catch (error) {
          message.error(
            requestErrorMessage(
              error,
              I18N.cbamOperationReport.evidenceDeleteFailed,
            ),
          );
        }
      },
    });
  };

  return (
    <>
      <Modal
        centered
        open={open}
        onCancel={onClose}
        width={1208}
        className={styles.modal}
        rootClassName={styles.modal}
        title={I18N.cbamOperationReport.evidenceManagement}
        footer={
          <div className={styles.footer}>
            <Button onClick={onClose}>{I18N.cbamOperationReport.cancel}</Button>
            <Button type='primary' onClick={onClose}>
              {I18N.cbamOperationReport.confirm}
            </Button>
          </div>
        }
      >
        <div className={styles.toolbar}>
          <strong>{I18N.cbamOperationReport.evidenceList}</strong>
          {!readonly && (
            <div className={styles.toolbarActions}>
              <button type='button' onClick={() => setSelectOpen(true)}>
                <img src={selectEvidenceIcon} alt='' />
                {I18N.cbamMonitor.selectEvidence}
              </button>
              <button type='button' onClick={() => openEditor()}>
                <PlusOutlined />
                {I18N.cbamMonitor.addEvidence}
              </button>
            </div>
          )}
        </div>
        <div className={styles.cards} aria-busy={loading}>
          {displayedEvidences.map(value => {
            const key =
              'draftKey' in value ? value.draftKey : String(value.evidenceId);
            const referenced =
              'sourceEvidenceId' in value
                ? Boolean(value.sourceEvidenceId)
                : value.sourceType === 1;
            const fileReady = Boolean(value.file?.url);
            const expiryDate = value.expiryDate
              ? dayjs(value.expiryDate)
              : undefined;
            const valid =
              fileReady &&
              Boolean(
                expiryDate?.isValid() &&
                  !expiryDate.endOf('day').isBefore(dayjs()),
              );
            const statusName = !fileReady
              ? I18N.cbamMonitor.pendingUpload
              : valid
              ? I18N.cbamMonitor.valid
              : I18N.cbamMonitor.expired;
            const summary = [
              value.evidenceNo || I18N.cbamMonitor.evidenceNumberMissing,
              value.remark || '--',
              value.file?.name || I18N.cbamMonitor.evidenceFileMissing,
            ].join(' · ');
            return (
              <article className={styles.card} key={key}>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeading}>
                    <div className={styles.titleLine}>
                      <Tooltip title={getEvidenceTypeLabel(value.evidenceType)}>
                        <strong>
                          {getEvidenceTypeLabel(value.evidenceType) ||
                            I18N.cbamMonitor.unnamedEvidence}
                        </strong>
                      </Tooltip>
                      {referenced && (
                        <Tooltip
                          title={
                            I18N.cbamOperationReport
                              .referencedFromMonitoringPlan
                          }
                        >
                          <span className={styles.referenceBadge}>
                            <img src={evidenceReferenceIcon} alt='' />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <Tooltip title={summary}>
                      <p>{summary}</p>
                    </Tooltip>
                  </div>
                  <div className={styles.cardDetails}>
                    <div>
                      <span>{I18N.cbamMonitor.source}</span>
                      <b>{value.sourceName || '--'}</b>
                    </div>
                    <div>
                      <span>{I18N.cbamMonitor.reviewFrequency}</span>
                      <b>
                        {getEvidenceReviewFrequencyLabel(
                          value.reviewFrequency,
                        ) || '--'}
                      </b>
                    </div>
                    <div>
                      <span>{I18N.cbamMonitor.relatedData}</span>
                      <b>{relatedDataLabel}</b>
                    </div>
                    <div>
                      <span>{I18N.cbamMonitor.issueDate}</span>
                      <b>{formatDate(value.issueDate)}</b>
                    </div>
                    <div>
                      <span>{I18N.cbamMonitor.expiryDate}</span>
                      <b>{formatDate(value.expiryDate)}</b>
                    </div>
                  </div>
                  <img
                    className={styles.ribbon}
                    src={valid ? validRibbon : pendingRibbon}
                    alt=''
                  />
                  <span className={styles.ribbonText}>{statusName}</span>
                </div>
                <div className={styles.cardActions}>
                  <button type='button' onClick={() => openEditor(value)}>
                    <EyeOutlined />
                    {I18N.cbamOperationReport.view}
                  </button>
                  {!readonly && (
                    <button type='button' onClick={() => remove(value)}>
                      <DeleteOutlined />
                      {I18N.cbamOperationReport.delete}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {!displayedEvidences.length && (
          <div className={styles.empty}>{I18N.cbamMonitor.noEvidence}</div>
        )}
      </Modal>
      <EvidenceSelectModal
        evidences={eligibleSourceEvidences}
        open={selectOpen}
        onCancel={() => setSelectOpen(false)}
        onConfirm={select}
      />
      <Drawer
        width={724}
        rootClassName={styles.evidenceDrawer}
        zIndex={1100}
        open={editorOpen}
        closable={false}
        destroyOnClose
        onClose={closeEditor}
        title={
          <CbamDrawerTitle>
            {editingDraftKey || editingEvidenceId
              ? I18N.cbamMonitor.editEvidence
              : I18N.cbamMonitor.addEvidence}
          </CbamDrawerTitle>
        }
        extra={<CbamDrawerClose onClick={closeEditor} />}
        footer={
          !readonly && (
            <div className={styles.drawerFooter}>
              <Button onClick={closeEditor}>{I18N.cbamMonitor.cancel}</Button>
              <Button type='primary' loading={submitting} onClick={saveEditor}>
                {I18N.cbamMonitor.confirm}
              </Button>
            </div>
          )
        }
      >
        <Form form={editor} layout='vertical' disabled={readonly}>
          <div className={styles.editorGrid}>
            <Form.Item
              name='evidenceType'
              label={I18N.cbamMonitor.evidenceType}
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp='label'
                options={evidenceTypeOptions}
              />
            </Form.Item>
            <Form.Item
              name='reviewFrequency'
              label={I18N.cbamMonitor.reviewFrequency}
            >
              <Select
                allowClear
                options={evidenceReviewFrequencyOptions}
              />
            </Form.Item>
            <Form.Item name='sourceName' label={I18N.cbamMonitor.source}>
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item label={I18N.cbamMonitor.relatedData}>
              <Input
                className={styles.relationField}
                readOnly
                value={relatedDataLabel}
              />
            </Form.Item>
            <Form.Item name='evidenceNo' label={I18N.cbamMonitor.number}>
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item name='issueDate' label={I18N.cbamMonitor.issueDate}>
              <DatePicker format='YYYY-MM-DD' placeholder='' />
            </Form.Item>
            <Form.Item name='expiryDate' label={I18N.cbamMonitor.expiryDate}>
              <DatePicker format='YYYY-MM-DD' placeholder='' />
            </Form.Item>
            <Form.Item
              name='remark'
              label={I18N.cbamMonitor.remark}
              className={styles.fullField}
            >
              <Input.TextArea
                maxLength={200}
                rows={3}
              />
            </Form.Item>
            <Form.Item
              name='file'
              label={I18N.cbamMonitor.evidenceFile}
              className={styles.fullField}
              getValueFromEvent={(files?: FileObj[]) => files?.[0]}
              getValueProps={(file?: FileObj) => ({
                value: file ? [file] : [],
              })}
            >
              <FileObjectUpload
                maxCount={1}
                maxSize={100}
                variant='evidence'
                resolveUrl={url => resolveOperationFileUrl(operationId, url)}
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export default Co2EvidenceModal;
