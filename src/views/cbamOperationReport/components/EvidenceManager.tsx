import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Spin,
  Tooltip,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import I18N from '@src/lang/I18N';

import { commonRequestDownloadFile } from '@/api/commonRequest';

import {
  CbamDrawerClose,
  CbamDrawerTitle,
} from '@/components/CbamDrawerHeader';
import evidencePendingRibbon from '@/views/cbamMonitor/assets/evidence-pending-ribbon.svg';
import evidenceValidRibbon from '@/views/cbamMonitor/assets/evidence-valid-ribbon.svg';
import {
  evidenceReviewFrequencyOptions,
  evidenceTypeOptions,
  getEvidencePartLabel,
  getEvidenceReviewFrequencyLabel,
  getEvidenceTypeLabel,
} from '@/views/cbamMonitor/components/evidenceOptions';
import { FileObjectUpload } from '@/views/cbamMonitor/components/FileObjectUpload';
import { showMonitorDeleteConfirm } from '@/views/cbamMonitor/deleteConfirm';

import styles from './EvidenceManager.module.less';
import {
  addOperationEvidence,
  deleteOperationEvidence,
  editOperationEvidence,
  getOperationEvidences,
  resolveOperationFileUrl,
} from '../service';
import {
  EvidencePayload,
  EvidenceRelationData,
  FileObj,
  OperationCompletion,
  OperationEvidence,
  OperationEvidenceList,
} from '../types';
import { requestErrorMessage } from '../utils';

const PART_LABELS: Record<string, string> = {
  REPORT_INFO: I18N.cbamOperationReport.reportInformation,
  ASSOCIATION_INFO: I18N.cbamOperationReport.relatedInformation,
  OPERATOR_INFO: I18N.cbamOperationReport.operatorInformation,
  PROCESS_BOUNDARY: I18N.cbamOperationReport.onsiteProcessBoundary,
  PROCESS_INFO: I18N.cbamOperationReport.productionProcessInformation,
  CBAM_PRODUCT: I18N.cbamOperationReport.cbamProducts,
  PRECURSOR: I18N.cbamOperationReport.purchasedPrecursors,
  DIRECT_EMISSION: I18N.cbamOperationReport.directEmissions,
  NON_CBAM_PRODUCT: I18N.cbamOperationReport.nonCbamProducts,
  ELECTRICITY_CONSUMPTION: I18N.cbamOperationReport.electricityConsumption,
  HEAT_FLOW: I18N.cbamOperationReport.heatFlows,
  WASTE_GAS: I18N.cbamOperationReport.wasteGas,
  ZERO_RATED_FUEL: I18N.cbamOperationReport.zeroRatedFuels,
  FACILITY_ELECTRICITY: I18N.cbamOperationReport.onsiteElectricityGeneration,
  CO2_STAGE: I18N.cbamOperationReport.co2CaptureTransferUseStorage,
  QUALITY: I18N.cbamOperationReport.preparationAndQuality,
  DATA_GAP: I18N.cbamOperationReport.dataGaps,
};

const evidenceTypeLabel = (value?: string) =>
  getEvidenceTypeLabel(value) || I18N.cbamMonitor.unnamedEvidence;
const reviewFrequencyLabel = (value?: string) =>
  getEvidenceReviewFrequencyLabel(value) || '--';
const evidenceDateLabel = (value?: string) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '--';
const relatedDataLabel = (relations?: OperationEvidence['relations']) => {
  const values = relations || [];
  const sourceCodes = new Set(values.map(relation => relation.partCode));
  return Array.from(
    new Set(
      values
        .filter(
          relation =>
            !(
              relation.partCode === 'HEAT_FLOW' &&
              sourceCodes.has('MEASURABLE_HEAT')
            ) &&
            !(
              relation.partCode === 'DIRECT_EMISSION' &&
              (sourceCodes.has('PROCESS_MONITOR') ||
                sourceCodes.has('PFC_MONITOR'))
            ),
        )
        .map(
          relation =>
            getEvidencePartLabel(relation.partCode) ||
            PART_LABELS[relation.partCode] ||
            relation.partCode,
        ),
    ),
  ).join(' / ');
};
const evidenceCardStatus = (
  record: OperationEvidence,
): 'pending' | 'valid' | 'expired' => {
  if (!record.file?.url) return 'pending';
  const expiryDate = record.expiryDate ? dayjs(record.expiryDate) : undefined;
  return expiryDate?.isValid() &&
    expiryDate.endOf('day').valueOf() >= Date.now()
    ? 'valid'
    : 'expired';
};

interface EvidenceFormValue
  extends Omit<
    EvidencePayload,
    'operationId' | 'dataVersion' | 'issueDate' | 'expiryDate'
  > {
  issueDate?: Dayjs;
  expiryDate?: Dayjs;
}

interface EvidenceManagerProps {
  operationId: number | string;
  dataVersion: number;
  disabled?: boolean;
  onMutation: (
    dataVersion: number,
    completion: OperationCompletion,
    relations: EvidenceRelationData[],
  ) => void;
}

const EvidenceFileField = ({
  value,
  onChange,
  disabled,
  operationId,
}: {
  value?: FileObj;
  onChange?: (value?: FileObj) => void;
  disabled?: boolean;
  operationId: number | string;
}) => (
  <FileObjectUpload
    resolveUrl={url => resolveOperationFileUrl(operationId, url)}
    value={value ? [value] : []}
    onChange={files => onChange?.(files[0])}
    maxCount={1}
    maxSize={100}
    disabled={disabled}
    variant='evidence'
  />
);

const relationsFrom = (data?: OperationEvidenceList): EvidenceRelationData[] =>
  (data?.evidences || []).flatMap(evidence =>
    (evidence.relations || []).map(relation => ({
      id: relation.relationId,
      evidenceId: evidence.evidenceId,
      partCode: relation.partCode,
      itemKey: relation.itemKey,
    })),
  );

const EvidenceManager = ({
  operationId,
  dataVersion,
  disabled,
  onMutation,
}: EvidenceManagerProps) => {
  const [form] = Form.useForm<EvidenceFormValue>();
  const [data, setData] = useState<OperationEvidenceList>();
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<OperationEvidence>();
  const [submitting, setSubmitting] = useState(false);
  const [updatingFileId, setUpdatingFileId] = useState<number>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOperationEvidences({ operationId });
      setData(response.data?.data);
    } finally {
      setLoading(false);
    }
  }, [operationId]);

  useEffect(() => {
    load();
  }, [load]);

  const finish = async (result?: {
    dataVersion: number;
    completion: OperationCompletion;
  }) => {
    const response = await getOperationEvidences({ operationId });
    const latest = response.data?.data;
    setData(latest);
    if (result) {
      onMutation(result.dataVersion, result.completion, relationsFrom(latest));
    }
  };

  const openEdit = (record?: OperationEvidence) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(
      record
        ? {
            evidenceId: record.evidenceId,
            evidenceType: record.evidenceType,
            reviewFrequency: record.reviewFrequency,
            sourceName: record.sourceName,
            evidenceNo: record.evidenceNo,
            issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
            expiryDate: record.expiryDate
              ? dayjs(record.expiryDate)
              : undefined,
            remark: record.remark,
            file: record.file,
          }
        : {},
    );
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setEditing(undefined);
    form.resetFields();
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload: EvidencePayload = {
      ...values,
      operationId,
      dataVersion,
      evidenceId: editing?.evidenceId,
      issueDate: values.issueDate?.format('YYYY-MM-DD'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
    };
    setSubmitting(true);
    try {
      const response = editing
        ? await editOperationEvidence(payload)
        : await addOperationEvidence(payload);
      const result = response.data?.data;
      if (result) await finish(result);
      message.success(
        editing
          ? I18N.cbamOperationReport.evidenceUpdated
          : I18N.cbamOperationReport.evidenceAdded,
      );
      closeEditor();
    } catch (error) {
      message.error(
        requestErrorMessage(error, I18N.cbamOperationReport.evidenceSaveFailed),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const replaceFile = async (record: OperationEvidence, file: FileObj) => {
    setUpdatingFileId(record.evidenceId);
    try {
      const response = await editOperationEvidence({
        operationId,
        dataVersion,
        evidenceId: record.evidenceId,
        evidenceType: record.evidenceType,
        reviewFrequency: record.reviewFrequency,
        sourceName: record.sourceName,
        evidenceNo: record.evidenceNo,
        issueDate: record.issueDate,
        expiryDate: record.expiryDate,
        remark: record.remark,
        file,
      });
      const result = response.data?.data;
      if (result) await finish(result);
      message.success(I18N.cbamOperationReport.evidenceUpdated);
    } catch (error) {
      message.error(
        requestErrorMessage(error, I18N.cbamOperationReport.evidenceSaveFailed),
      );
    } finally {
      setUpdatingFileId(undefined);
    }
  };

  const remove = (record: OperationEvidence) => {
    showMonitorDeleteConfirm({
      title: I18N.cbamOperationReport.deleteEvidence,
      content: I18N.template(I18N.cbamOperationReport.confirmDeleteEvidence, {
        name: record.evidenceNo || record.evidenceType,
      }),
      onOk: async () => {
        const response = await deleteOperationEvidence({
          operationId,
          dataVersion,
          evidenceId: record.evidenceId,
        });
        const result = response.data?.data;
        if (result) await finish(result);
        message.success(I18N.cbamOperationReport.evidenceDeleted);
      },
    });
  };

  const downloadEvidenceFile = async (file?: FileObj) => {
    if (!file?.url) return;
    try {
      const url = await resolveOperationFileUrl(operationId, file.url);
      await commonRequestDownloadFile(
        url,
        file.name || I18N.cbamOperationReport.unnamedFile,
      );
    } catch {
      message.error(I18N.carbonData.downloadFailed);
    }
  };

  const editingRelatedData = relatedDataLabel(editing?.relations);

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <h2>{I18N.cbamOperationReport.evidenceList}</h2>
        {!disabled && (
          <div className={styles.toolbarActions}>
            <Button icon={<PlusOutlined />} onClick={() => openEdit()}>
              {I18N.cbamOperationReport.addEvidence}
            </Button>
          </div>
        )}
      </div>
      <Spin spinning={loading}>
        {data?.evidences?.length ? (
          <div className={styles.grid}>
            {data.evidences.map(record => {
              const status = evidenceCardStatus(record);
              const statusName =
                status === 'valid'
                  ? I18N.cbamMonitor.valid
                  : status === 'expired'
                  ? I18N.cbamMonitor.expired
                  : I18N.cbamMonitor.pendingUpload;
              const typeName = evidenceTypeLabel(record.evidenceType);
              const relatedData =
                relatedDataLabel(record.relations) ||
                I18N.cbamMonitor.notRelated;
              const fileName =
                record.file?.name || I18N.cbamMonitor.evidenceFileMissing;
              return (
                <article className={styles.card} key={record.evidenceId}>
                  <div className={styles.cardBody}>
                    <div className={styles.statusRibbon}>
                      <img
                        src={
                          status === 'valid'
                            ? evidenceValidRibbon
                            : evidencePendingRibbon
                        }
                        alt=''
                      />
                      <span>{statusName}</span>
                    </div>
                    <div className={styles.cardHeading}>
                      <div className={styles.titleLine}>
                        <strong title={typeName}>{typeName}</strong>
                      </div>
                      <div className={styles.summary}>
                        <span>
                          {record.evidenceNo ||
                            I18N.cbamMonitor.evidenceNumberMissing}
                        </span>
                        <i>·</i>
                        {record.file?.url ? (
                          <Button
                            type='link'
                            title={fileName}
                            onClick={() => downloadEvidenceFile(record.file)}
                          >
                            {fileName}
                          </Button>
                        ) : (
                          <span title={fileName}>{fileName}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.details}>
                      <div>
                        <span>{I18N.cbamMonitor.source}</span>
                        <b title={record.sourceName || '--'}>
                          {record.sourceName || '--'}
                        </b>
                      </div>
                      <div>
                        <span>{I18N.cbamMonitor.reviewFrequency}</span>
                        <b title={reviewFrequencyLabel(record.reviewFrequency)}>
                          {reviewFrequencyLabel(record.reviewFrequency)}
                        </b>
                      </div>
                      <div>
                        <span>{I18N.cbamMonitor.relatedData}</span>
                        <Tooltip title={relatedData}>
                          <b>{relatedData}</b>
                        </Tooltip>
                      </div>
                      <div>
                        <span>{I18N.cbamMonitor.issueDate}</span>
                        <b>{evidenceDateLabel(record.issueDate)}</b>
                      </div>
                      <div>
                        <span>{I18N.cbamMonitor.expiryDate}</span>
                        <b>{evidenceDateLabel(record.expiryDate)}</b>
                      </div>
                    </div>
                  </div>
                  {!disabled && (
                    <div className={styles.cardActions}>
                      <button
                        type='button'
                        className={styles.cardAction}
                        onClick={() => openEdit(record)}
                      >
                        <EditOutlined />
                        <span>{I18N.cbamOperationReport.edit}</span>
                      </button>
                      <FileObjectUpload
                        value={[]}
                        maxCount={1}
                        maxSize={100}
                        disabled={updatingFileId !== undefined}
                        variant='evidenceAction'
                        buttonIcon={
                          <SyncOutlined
                            spin={updatingFileId === record.evidenceId}
                          />
                        }
                        onChange={files => {
                          if (files[0]) replaceFile(record, files[0]);
                        }}
                      />
                      <button
                        type='button'
                        className={`${styles.cardAction} ${styles.deleteAction}`}
                        onClick={() => remove(record)}
                      >
                        <DeleteOutlined />
                        <span>{I18N.cbamOperationReport.delete}</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyEvidence}>
            {I18N.cbamMonitor.noEvidence}
          </div>
        )}
      </Spin>
      <Drawer
        width={724}
        zIndex={1100}
        rootClassName={styles.evidenceDrawer}
        closable={false}
        open={drawerOpen}
        destroyOnClose
        title={
          <CbamDrawerTitle>
            {editing
              ? I18N.cbamOperationReport.editEvidence
              : I18N.cbamOperationReport.addEvidence}
          </CbamDrawerTitle>
        }
        onClose={closeEditor}
        extra={<CbamDrawerClose onClick={closeEditor} />}
        footer={
          <div className={styles.drawerActions}>
            <Button onClick={closeEditor}>
              {I18N.cbamOperationReport.cancel}
            </Button>
            <Button type='primary' loading={submitting} onClick={save}>
              {I18N.cbamOperationReport.save}
            </Button>
          </div>
        }
      >
        <Form form={form} layout='vertical'>
          <div className={styles.evidenceFormGrid}>
            <Form.Item
              name='evidenceType'
              label={I18N.cbamOperationReport.evidenceType}
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
              label={I18N.cbamOperationReport.reviewFrequency}
            >
              <Select
                allowClear
                options={evidenceReviewFrequencyOptions}
              />
            </Form.Item>
            <Form.Item
              name='sourceName'
              label={I18N.cbamOperationReport.sourceName}
            >
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item label={I18N.cbamMonitor.relatedData}>
              <Tooltip title={editingRelatedData || undefined}>
                <Input
                  className={styles.evidenceRelationField}
                  readOnly
                  value={editingRelatedData}
                />
              </Tooltip>
            </Form.Item>
            <Form.Item
              name='evidenceNo'
              label={I18N.cbamOperationReport.evidenceNo}
            >
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item
              name='issueDate'
              label={I18N.cbamOperationReport.issueDate}
            >
              <DatePicker format='YYYY-MM-DD' placeholder='' />
            </Form.Item>
            <Form.Item
              name='expiryDate'
              label={I18N.cbamOperationReport.expiryDate}
            >
              <DatePicker format='YYYY-MM-DD' placeholder='' />
            </Form.Item>
            <Form.Item
              name='remark'
              label={I18N.cbamOperationReport.remark}
              className={styles.fullField}
            >
              <Input.TextArea
                maxLength={200}
                rows={3}
              />
            </Form.Item>
            <Form.Item
              name='file'
              label={I18N.cbamOperationReport.evidenceFile}
              className={styles.fullField}
            >
              <EvidenceFileField operationId={operationId} />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default EvidenceManager;
