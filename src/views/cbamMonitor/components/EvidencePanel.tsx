import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  FormInstance,
  Input,
  message,
  Select,
  Tooltip,
} from 'antd';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FileObjectUpload } from './FileObjectUpload';
import {
  evidencePartOptions,
  evidenceReviewFrequencyOptions,
  evidenceTypeOptions,
  getEvidenceReviewFrequencyLabel,
  getEvidenceTypeLabel,
  sortEvidencesByType,
} from './evidenceOptions';
import evidencePendingRibbon from '../assets/evidence-pending-ribbon.svg';
import evidenceValidRibbon from '../assets/evidence-valid-ribbon.svg';
import { showMonitorDeleteConfirm } from '../deleteConfirm';
import styles from '../plan.module.less';
import {
  createMonitorEvidence,
  createMonitorEvidenceRelation,
  updateMonitorEvidence,
} from '../service';
import {
  FileObj,
  MonitorChildDeleteRequest,
  MonitorEvidence,
  MonitorPlanPayload,
} from '../types';

interface EvidenceEditorValue extends Omit<MonitorEvidence, 'issueDate' | 'expiryDate'> {
  issueDate?: Moment;
  expiryDate?: Moment;
}

const firstFile = (value?: FileObj[]) => value?.[0];

const evidenceRequest = (evidence: MonitorEvidence): MonitorEvidence => ({
  evidenceType: evidence.evidenceType,
  reviewFrequency: evidence.reviewFrequency,
  sourceName: evidence.sourceName,
  evidenceNo: evidence.evidenceNo,
  issueDate: evidence.issueDate,
  expiryDate: evidence.expiryDate,
  remark: evidence.remark,
  file: evidence.file,
});

const evidenceCardStatus = (evidence: MonitorEvidence) => {
  if (!evidence.file?.url) return 'pending';
  const expiryDate = evidence.expiryDate ? moment(evidence.expiryDate) : undefined;
  return expiryDate?.isValid() && expiryDate.endOf('day').isSameOrAfter(moment())
    ? 'valid'
    : 'expired';
};

const formatEvidenceDate = (value?: string) => (
  value && moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : '--'
);

export const EvidencePanel = ({
  form,
  createRequest,
  editRequest,
  initialPartCode,
  initialItemKey,
  onCreated,
  onDeleteChild,
  ensurePlanId,
  onPersistenceChanged,
  readonly = false,
  visible = true,
}: {
  form: FormInstance<MonitorPlanPayload>;
  createRequest?: number;
  editRequest?: { evidenceId: number; sequence: number };
  initialPartCode?: number;
  initialItemKey?: string;
  onCreated?: (evidenceId: number) => void;
  onDeleteChild?: (request: Omit<MonitorChildDeleteRequest, 'dataVersion'>) => Promise<void>;
  ensurePlanId: () => Promise<number>;
  onPersistenceChanged: (planId: number) => Promise<void>;
  readonly?: boolean;
  visible?: boolean;
}) => {
  const looseForm = form as FormInstance;
  const watchedEvidences = Form.useWatch('evidences', { form, preserve: true });
  const watchedRelations = Form.useWatch('evidenceRelations', { form, preserve: true });
  const evidences = useMemo(() => watchedEvidences || [], [watchedEvidences]);
  const sortedEvidences = useMemo(() => sortEvidencesByType(evidences), [evidences]);
  const relations = useMemo(() => watchedRelations || [], [watchedRelations]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number>();
  const [creatingForBusiness, setCreatingForBusiness] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingFileId, setUpdatingFileId] = useState<number>();
  const [editor] = Form.useForm<EvidenceEditorValue>();
  const nameByCode = useMemo(
    () => new Map(evidencePartOptions.map(item => [item.value, item.label])),
    [],
  );
  useEffect(() => {
    if (!createRequest || readonly) return;
    setEditingId(undefined);
    setCreatingForBusiness(true);
    editor.resetFields();
    setDrawerOpen(true);
  }, [createRequest, editor, readonly]);

  const openEditor = useCallback((evidence?: MonitorEvidence) => {
    const evidenceId = evidence?.id;
    setEditingId(evidenceId);
    setCreatingForBusiness(false);
    editor.resetFields();
    editor.setFieldsValue({
      ...evidence,
      issueDate: evidence?.issueDate && moment(evidence.issueDate).isValid()
        ? moment(evidence.issueDate)
        : undefined,
      expiryDate: evidence?.expiryDate && moment(evidence.expiryDate).isValid()
        ? moment(evidence.expiryDate)
        : undefined,
    });
    setDrawerOpen(true);
  }, [editor]);
  useEffect(() => {
    if (!editRequest || readonly) return;
    const currentEvidences = form.getFieldValue('evidences') as MonitorEvidence[] | undefined;
    const evidence = currentEvidences?.find(item => item.id === editRequest.evidenceId);
    if (evidence) openEditor(evidence);
  }, [editRequest, form, openEditor, readonly]);

  const submit = async () => {
    if (readonly) return;
    const values = await editor.validateFields();
    const { issueDate, expiryDate, ...evidenceValues } = values;
    const evidencePayload: MonitorEvidence = {
      ...evidenceValues,
      issueDate: issueDate?.format('YYYY-MM-DD'),
      expiryDate: expiryDate?.format('YYYY-MM-DD'),
    };
    if (editingId) {
      setSubmitting(true);
      try {
        const planId = await ensurePlanId();
        const currentEvidence = evidences.find(item => item.id === editingId);
        const response = await updateMonitorEvidence(
          planId,
          editingId,
          evidenceRequest({ ...currentEvidence, ...evidencePayload, id: editingId }),
        );
        const persistedEvidence = response.data?.data;
        if (!persistedEvidence?.id || persistedEvidence.id !== editingId) {
          throw new Error(I18N.cbamMonitor.evidenceUpdateFailed);
        }
        form.setFieldValue('evidences', evidences.map(item => (
          item.id === editingId ? { ...item, ...persistedEvidence, id: editingId } : item
        )));
        await onPersistenceChanged(planId);
        setDrawerOpen(false);
        setEditingId(undefined);
        editor.resetFields();
      } catch (error) {
        const requestError = error as {
          data?: { msg?: string };
          response?: { data?: { msg?: string; message?: string } };
        };
        message.error(
          requestError.data?.msg
          || requestError.response?.data?.msg
          || requestError.response?.data?.message
          || I18N.cbamMonitor.evidenceUpdateFailed,
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setSubmitting(true);
    try {
      const planId = await ensurePlanId();
      const evidenceResponse = await createMonitorEvidence(planId, evidencePayload);
      const evidenceId = evidenceResponse.data?.data;
      if (!evidenceId) throw new Error('Missing evidenceId');
      const nextEvidence = { ...evidencePayload, id: evidenceId };
      form.setFieldValue('evidences', [...evidences, nextEvidence]);
      if (creatingForBusiness && initialPartCode !== undefined && initialItemKey) {
        const relationResponse = await createMonitorEvidenceRelation(planId, {
          evidenceId,
          partCode: initialPartCode,
          itemKey: initialItemKey,
        });
        form.setFieldValue('evidenceRelations', [
          ...relations,
          {
            id: relationResponse.data?.data,
            evidenceId,
            partCode: initialPartCode,
            itemKey: initialItemKey,
          },
        ]);
        onCreated?.(evidenceId);
      }
      await onPersistenceChanged(planId);
      setDrawerOpen(false);
      editor.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setEditingId(undefined);
    setCreatingForBusiness(false);
    editor.resetFields();
  };

  const replaceEvidenceFile = async (evidence: MonitorEvidence, file: FileObj) => {
    if (!evidence.id) return;
    setUpdatingFileId(evidence.id);
    try {
      const planId = await ensurePlanId();
      const requestEvidence = { ...evidence, file };
      const response = await updateMonitorEvidence(
        planId,
        evidence.id,
        evidenceRequest(requestEvidence),
      );
      const persistedEvidence = response.data?.data;
      if (!persistedEvidence?.file?.url || persistedEvidence.file.url !== file.url) {
        throw new Error(I18N.cbamMonitor.evidenceFileUpdateFailed);
      }
      const nextEvidence = { ...evidence, ...persistedEvidence, id: evidence.id };
      form.setFieldValue('evidences', evidences.map(item => (
        item.id === evidence.id ? nextEvidence : item
      )));
      await onPersistenceChanged(planId);
      message.success(I18N.cbamMonitor.evidenceFileUpdated);
    } catch (error) {
      const requestError = error as {
        data?: { msg?: string };
        response?: { data?: { msg?: string; message?: string } };
      };
      message.error(
        requestError.data?.msg
        || requestError.response?.data?.msg
        || requestError.response?.data?.message
        || I18N.cbamMonitor.evidenceFileUpdateFailed,
      );
    } finally {
      setUpdatingFileId(undefined);
    }
  };

  const removeEvidenceReferences = (evidenceId?: number) => {
    if (evidenceId === undefined) return;
    const directPaths = [
      ['directEmission', 'processMonitorJson', 'methods'],
      ['directEmission', 'factorSamplingJson', 'factors'],
      ['directEmission', 'pfcMonitorJson', 'methods'],
      ['condition', 'measurableHeatJson', 'heatFlows'],
      ['condition', 'facilityElectricityJson', 'generators'],
      ['condition', 'wasteGasJson', 'wasteGasFlows'],
    ] as const;
    directPaths.forEach(path => {
      const items = (looseForm.getFieldValue(path) || []) as Array<{ evidenceIds?: number[] }>;
      looseForm.setFieldValue(path, items.map(item => ({
        ...item,
        evidenceIds: (item.evidenceIds || []).filter(id => id !== evidenceId),
      })));
    });
    [
      'zeroRatedFuelJson',
      'measurableHeatJson',
      'facilityElectricityJson',
      'electricityFactorJson',
      'wasteGasJson',
      'co2StageJson',
    ].forEach(key => {
      const path = ['condition', key, 'evidenceIds'];
      const evidenceIds = (looseForm.getFieldValue(path) || []) as number[];
      looseForm.setFieldValue(path, evidenceIds.filter(id => id !== evidenceId));
    });
  };

  const hasEvidenceReferences = (evidenceId?: number) => {
    if (evidenceId === undefined) return false;
    if (relations.some(item => item.evidenceId === evidenceId)) return true;
    const directPaths = [
      ['directEmission', 'processMonitorJson', 'methods'],
      ['directEmission', 'factorSamplingJson', 'factors'],
      ['directEmission', 'pfcMonitorJson', 'methods'],
      ['condition', 'measurableHeatJson', 'heatFlows'],
      ['condition', 'facilityElectricityJson', 'generators'],
      ['condition', 'wasteGasJson', 'wasteGasFlows'],
    ] as const;
    if (directPaths.some(path => {
      const items = (looseForm.getFieldValue(path) || []) as Array<{ evidenceIds?: number[] }>;
      return items.some(item => item.evidenceIds?.includes(evidenceId));
    })) return true;
    return [
      'zeroRatedFuelJson',
      'measurableHeatJson',
      'facilityElectricityJson',
      'electricityFactorJson',
      'wasteGasJson',
      'co2StageJson',
    ].some(key => {
      const evidenceIds = (looseForm.getFieldValue(['condition', key, 'evidenceIds']) || []) as number[];
      return evidenceIds.includes(evidenceId);
    });
  };

  const remove = (evidence: MonitorEvidence) => {
    if (readonly) return;
    const related = hasEvidenceReferences(evidence.id);
    const evidenceName = evidence.evidenceNo
      || getEvidenceTypeLabel(evidence.evidenceType)
      || evidence.file?.name
      || I18N.cbamMonitor.unnamedEvidence;
    showMonitorDeleteConfirm({
      title: I18N.cbamMonitor.confirmDeleteEvidence,
      content: `${related ? I18N.cbamMonitor.relatedEvidenceDeletePrefix : ''}${
        I18N.template(I18N.cbamMonitor.deleteEvidenceTip, { name: evidenceName })
      }`,
      onOk: async () => {
        if (evidence.id && evidence.id > 0) {
          await onDeleteChild?.({ target: 'EVIDENCE', evidenceId: evidence.id });
        }
        form.setFieldValue('evidences', evidences.filter(item => item.id !== evidence.id));
        form.setFieldValue('evidenceRelations', relations.filter(item => item.evidenceId !== evidence.id));
        removeEvidenceReferences(evidence.id);
      },
    });
  };
  let editorPartCodes: number[] = [];
  if (editingId) {
    editorPartCodes = Array.from(new Set(relations
      .filter(item => item.evidenceId === editingId)
      .map(item => item.partCode)));
  } else if (creatingForBusiness && initialPartCode !== undefined) {
    editorPartCodes = [initialPartCode];
  }
  const editorRelatedData = editorPartCodes
    .map(code => nameByCode.get(code) || `Part ${code}`)
    .join(' / ');

  return (
    <div className={styles.evidencePanel} hidden={!visible}>
      <div className={styles.evidenceToolbar}>
        <h2>{I18N.cbamMonitor.evidenceList}</h2>
        <button type='button' className={styles.evidenceAddAction} disabled={readonly} onClick={() => openEditor()}>
          <PlusOutlined />
          <span>{I18N.cbamMonitor.addEvidence}</span>
        </button>
      </div>
      <div className={styles.evidenceGrid}>
        {sortedEvidences.map((evidence, index) => {
          const partCodes = Array.from(new Set(relations
            .filter(item => item.evidenceId === evidence.id)
            .map(item => item.partCode)));
          const partName = partCodes.map(code => nameByCode.get(code) || `Part ${code}`).join(' / ');
          const status = evidenceCardStatus(evidence);
          let statusName = I18N.cbamMonitor.pendingUpload;
          if (status === 'valid') statusName = I18N.cbamMonitor.valid;
          if (status === 'expired') statusName = I18N.cbamMonitor.expired;
          return (
            <article className={styles.evidenceCard} key={evidence.id || index}>
              <div className={styles.evidenceCardBody}>
                <div className={styles.evidenceStatusRibbon}>
                  <img
                    src={status === 'valid' ? evidenceValidRibbon : evidencePendingRibbon}
                    alt=''
                  />
                  <span>{statusName}</span>
                </div>
                <div className={styles.evidenceCardHeading}>
                  <strong title={getEvidenceTypeLabel(evidence.evidenceType)}>
                    {getEvidenceTypeLabel(evidence.evidenceType) || I18N.cbamMonitor.unnamedEvidence}
                  </strong>
                  <div className={styles.evidenceSummary}>
                    <span>{evidence.evidenceNo || I18N.cbamMonitor.evidenceNumberMissing}</span>
                    <i>·</i>
                    <span>{evidence.file?.name || I18N.cbamMonitor.evidenceFileMissing}</span>
                  </div>
                </div>
                <div className={styles.evidenceDetails}>
                  <div><span>{I18N.cbamMonitor.source}</span><b>{evidence.sourceName || '--'}</b></div>
                  <div><span>{I18N.cbamMonitor.reviewFrequency}</span><b>{getEvidenceReviewFrequencyLabel(evidence.reviewFrequency) || '--'}</b></div>
                  <div>
                    <span>{I18N.cbamMonitor.relatedData}</span>
                    <Tooltip title={partName || I18N.cbamMonitor.notRelated}>
                      <b>{partName || I18N.cbamMonitor.notRelated}</b>
                    </Tooltip>
                  </div>
                  <div><span>{I18N.cbamMonitor.issueDate}</span><b>{formatEvidenceDate(evidence.issueDate)}</b></div>
                  <div><span>{I18N.cbamMonitor.expiryDate}</span><b>{formatEvidenceDate(evidence.expiryDate)}</b></div>
                </div>
              </div>
              <div className={styles.evidenceCardActions}>
                <button type='button' className={styles.evidenceAction} disabled={readonly} onClick={() => openEditor(evidence)}>
                  <EditOutlined />
                  <span>{I18N.cbamMonitor.edit}</span>
                </button>
                <FileObjectUpload
                  value={[]}
                  maxCount={1}
                  maxSize={100}
                  disabled={readonly || !evidence.id || updatingFileId === evidence.id}
                  variant='evidenceAction'
                  buttonIcon={<SyncOutlined spin={updatingFileId === evidence.id} />}
                  onChange={files => {
                    if (files[0]) replaceEvidenceFile(evidence, files[0]);
                  }}
                />
                <button type='button' className={`${styles.evidenceAction} ${styles.evidenceDeleteAction}`} disabled={readonly} onClick={() => remove(evidence)}>
                  <DeleteOutlined />
                  <span>{I18N.cbamMonitor.delete}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!evidences.length && <div className={styles.emptyEvidence}>{I18N.cbamMonitor.noEvidence}</div>}
      <Drawer
        width={724}
        zIndex={1100}
        rootClassName={styles.evidenceDrawer}
        title={<span className={styles.evidenceDrawerTitle}>{editingId ? I18N.cbamMonitor.editEvidence : I18N.cbamMonitor.addEvidence}</span>}
        open={drawerOpen}
        closable={false}
        destroyOnClose
        forceRender
        onClose={closeEditor}
        extra={(
          <button type='button' aria-label='close' className={styles.evidenceDrawerClose} onClick={closeEditor}>
            <CloseOutlined />
          </button>
        )}
        footer={<div className={styles.drawerActions}><Button onClick={closeEditor}>{I18N.cbamMonitor.cancel}</Button><Button type='primary' loading={submitting} onClick={submit}>{I18N.cbamMonitor.confirm}</Button></div>}
      >
        <Form disabled={readonly} form={editor} layout='vertical'>
          <div className={styles.evidenceFormGrid}>
            <Form.Item name='evidenceType' label={I18N.cbamMonitor.evidenceType} rules={[{ required: true, max: 64 }]}>
              <Select
                allowClear
                options={evidenceTypeOptions}
                optionFilterProp='label'
                placeholder={I18N.cbamMonitor.select}
                showSearch
              />
            </Form.Item>
            <Form.Item name='reviewFrequency' label={I18N.cbamMonitor.reviewFrequency} rules={[{ max: 64 }]}>
              <Select allowClear options={evidenceReviewFrequencyOptions} placeholder={I18N.cbamMonitor.select} />
            </Form.Item>
            <Form.Item name='sourceName' label={I18N.cbamMonitor.source} rules={[{ max: 40 }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item label={I18N.cbamMonitor.relatedData}>
              <Tooltip title={editorRelatedData || undefined}>
                <Input
                  className={styles.evidenceRelationField}
                  readOnly
                  placeholder={I18N.cbamMonitor.noRelatedData}
                  value={editorRelatedData}
                />
              </Tooltip>
            </Form.Item>
            <Form.Item name='evidenceNo' label={I18N.cbamMonitor.number} rules={[{ max: 40 }]}>
              <Input maxLength={40} placeholder={I18N.cbamMonitor.enter} />
            </Form.Item>
            <Form.Item name='issueDate' label={I18N.cbamMonitor.issueDate}>
              <DatePicker format='YYYY-MM-DD' placeholder='YYYY-MM-DD' />
            </Form.Item>
            <Form.Item name='expiryDate' label={I18N.cbamMonitor.expiryDate}>
              <DatePicker format='YYYY-MM-DD' placeholder='YYYY-MM-DD' />
            </Form.Item>
            <Form.Item name='remark' label={I18N.cbamMonitor.remark} rules={[{ max: 200 }]} className={styles.fullField}>
              <Input.TextArea maxLength={200} rows={3} placeholder={I18N.cbamMonitor.evidenceRemarkPlaceholder} />
            </Form.Item>
            <Form.Item
              name='file'
              label={I18N.cbamMonitor.evidenceFile}
              className={styles.fullField}
              getValueFromEvent={firstFile}
              getValueProps={(value?: FileObj) => ({ value: value ? [value] : [] })}
            >
              <FileObjectUpload
                disabled={readonly}
                maxCount={1}
                maxSize={100}
                variant='evidence'
                onDelete={async () => {
                  if (editingId && editingId > 0) {
                    await onDeleteChild?.({ target: 'EVIDENCE_FILE', evidenceId: editingId });
                    form.setFieldValue('evidences', evidences.map(evidence => (
                      evidence.id === editingId ? { ...evidence, file: undefined } : evidence
                    )));
                  }
                }}
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};
