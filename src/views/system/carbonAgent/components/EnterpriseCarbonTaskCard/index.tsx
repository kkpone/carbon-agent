import {
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import taskProductFootprintSelectIcon from '@src/assets/images/carbonAgent/icons/task-product-footprint-select.svg';
import modelDetailsIcon from '@src/assets/svg/model_details.svg';
import I18N from '@src/lang/I18N';
import { Button, message, Spin, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import FileUploadDrawer from '@/components/FileUploadDrawer';
import NumberInputTableCell from '@/components/NumberInputTableCell';
import { useMobile } from '@/hooks/use-mobile';
import { isNumberInputWithinDigitLimits } from '@/utils/limitNumberInputDigits';

import styles from './index.module.less';
import AgentProductFootprintAccountSelector, {
  type AgentProductFootprintAccountSelection,
} from '../AgentProductFootprintAccountSelector';
import { ENTERPRISE_CARBON_TASK_STATUS_LABELS } from '../EnterpriseCarbonProjectTasks/status';
import { ENTERPRISE_CARBON_TASK_TYPE } from '../EnterpriseCarbonProjectTasks/type';
import type {
  EnterpriseCarbonTask,
  EnterpriseCarbonTaskAccountingFactor,
  EnterpriseCarbonTaskAttachment,
  EnterpriseCarbonTaskDirectOperation,
  EnterpriseCarbonTaskOperation,
  EnterpriseCarbonTaskOptionValue,
  EnterpriseCarbonTaskSavePayload,
  EnterpriseCarbonTaskSubmitPayload,
} from '../EnterpriseCarbonProjectTasks/type';
import {
  getExpertReviewSnapshotModelAccountId,
  getExpertReviewSnapshotModelUrl,
} from '../expertReviewSnapshotOrigin';

type ActivityValue = string | number | null;

const ACTIVITY_DIGIT_LIMITS = {
  maxDecimals: 10,
  maxIntegerDigits: 9,
};

const MAX_TASK_ATTACHMENTS = 10;

type EnterpriseCarbonTaskCardProps = {
  busy: boolean;
  reportingEnabled: boolean;
  onSaveTask: (
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSavePayload,
  ) => Promise<void>;
  onSelectProductFootprintAccount: (
    taskId: EnterpriseCarbonTaskOptionValue,
    accountId: EnterpriseCarbonTaskOptionValue,
  ) => Promise<void>;
  onViewProductFootprintAccount?: (accountId: string) => void;
  onDownloadFile: (
    assetId: EnterpriseCarbonTaskOptionValue,
    fileName: string,
  ) => Promise<void>;
  onSubmitTask: (
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSubmitPayload,
  ) => Promise<void>;
  onTaskAction: (
    taskId: EnterpriseCarbonTaskOptionValue,
    operation: EnterpriseCarbonTaskDirectOperation,
  ) => Promise<void>;
  onTaskReject: (taskId: EnterpriseCarbonTaskOptionValue) => void;
  onUploadFile: (
    taskId: EnterpriseCarbonTaskOptionValue,
    file: File,
  ) => Promise<EnterpriseCarbonTaskAttachment>;
  task: EnterpriseCarbonTask;
};

const hasValue = (value: ActivityValue | undefined): value is string | number =>
  value !== undefined && value !== null && value !== '';

const normalizeValue = (
  value: string | number | null | undefined,
): ActivityValue => value ?? null;

const hasAccountingFactor = (
  accountingFactor?: EnterpriseCarbonTaskAccountingFactor,
) =>
  Boolean(
    accountingFactor &&
      (hasValue(accountingFactor.accountId) ||
        accountingFactor.accountName ||
        hasValue(accountingFactor.factor) ||
        accountingFactor.productName),
  );

const getTaskTypeLabel = (task: EnterpriseCarbonTask) =>
  task.taskType === ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION
    ? I18N.carbonAgent.enterpriseCanvasCarbonFootprintTask
    : I18N.carbonAgent.enterpriseCanvasActivityDataTask;

const isValidActivityValue = (value: ActivityValue | undefined) => {
  if (!hasValue(value)) {
    return true;
  }

  const numericValue = Number(value);

  return (
    Number.isFinite(numericValue) &&
    numericValue >= 0 &&
    isNumberInputWithinDigitLimits(value, ACTIVITY_DIGIT_LIMITS)
  );
};

const actionLabels: Record<EnterpriseCarbonTaskOperation, string> = {
  approve: I18N.carbonAgent.enterpriseTaskApprove,
  delete: I18N.carbonAgent.delete,
  reject: I18N.carbonAgent.enterpriseTaskReject,
  submit: I18N.carbonAgent.submit,
};

const actionIcons = {
  approve: <CheckOutlined />,
  delete: <DeleteOutlined />,
  reject: <CloseOutlined />,
  submit: <CheckOutlined />,
};

const EnterpriseCarbonTaskCard = ({
  busy,
  onDownloadFile,
  onSaveTask,
  onSelectProductFootprintAccount,
  onSubmitTask,
  onTaskAction,
  onTaskReject,
  onUploadFile,
  onViewProductFootprintAccount,
  reportingEnabled,
  task,
}: EnterpriseCarbonTaskCardProps) => {
  const isMobile = useMobile();
  const [activityValue, setActivityValue] = useState<ActivityValue>(
    normalizeValue(task.activityData),
  );
  const [attachments, setAttachments] = useState(task.attachments);
  const [accountingSelectorOpen, setAccountingSelectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const savedActivityValueRef = useRef<ActivityValue>(
    normalizeValue(task.activityData),
  );
  const canEditActivity = reportingEnabled && task.actions.includes('edit');
  const canEditAttachments =
    reportingEnabled && task.actions.includes('upload');
  const isAccountingFactorTask =
    task.taskType === ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION;
  const { accountingFactor } = task;

  useEffect(() => {
    const activityData = normalizeValue(task.activityData);

    setActivityValue(activityData);
    savedActivityValueRef.current = activityData;
  }, [task.activityData]);

  useEffect(() => {
    setAttachments(task.attachments);
  }, [task.attachments]);

  const uploadFile = async (file: File) => {
    setUploadingCount(current => current + 1);
    try {
      return await onUploadFile(task.id, file);
    } finally {
      setUploadingCount(current => current - 1);
    }
  };

  const saveTask = async (payload: EnterpriseCarbonTaskSavePayload) => {
    setSaving(true);
    try {
      await onSaveTask(task.id, payload);
    } finally {
      setSaving(false);
    }
  };

  const handleAccountingFactorConfirm = async (
    selected: AgentProductFootprintAccountSelection,
  ) => {
    if (!hasValue(selected.id)) {
      return;
    }

    await onSelectProductFootprintAccount(task.id, selected.id);
  };

  const handleActivityBlur = async (value: ActivityValue | undefined) => {
    const nextValue = normalizeValue(value);
    const savedValue = savedActivityValueRef.current;
    const nextValueEmpty = !hasValue(nextValue);
    const savedValueEmpty = !hasValue(savedValue);

    if (nextValueEmpty) {
      message.warning(I18N.carbonAgent.enterpriseTaskActivityRequired);
      setActivityValue(savedValue);
      return;
    }

    if (
      !isValidActivityValue(nextValue) ||
      (!savedValueEmpty && Number(nextValue) === Number(savedValue))
    ) {
      return;
    }

    try {
      await saveTask({
        activityData: Number(nextValue),
      });
      savedActivityValueRef.current = nextValue;
    } catch {
      setActivityValue(savedValue);
    }
  };

  const handleAttachmentsChange = async (
    nextAttachments: EnterpriseCarbonTaskAttachment[],
  ) => {
    await saveTask({
      fileIds: nextAttachments.map(file => file.id),
    });
    setAttachments(nextAttachments);
  };

  const handleAttachmentsUpload = async (
    files: EnterpriseCarbonTaskAttachment[],
  ) => {
    await handleAttachmentsChange([...attachments, ...files]);
  };

  const handleAttachmentsDelete = async (
    files: EnterpriseCarbonTaskAttachment[],
  ) => {
    await handleAttachmentsChange(
      attachments.filter(
        attachment => !files.some(file => file.id === attachment.id),
      ),
    );
  };

  const handleTaskAction = async (operation: EnterpriseCarbonTaskOperation) => {
    if (operation === 'submit') {
      if (!reportingEnabled) {
        return;
      }

      if (isAccountingFactorTask) {
        if (!hasValue(accountingFactor?.accountId)) {
          message.warning(
            I18N.carbonAgent.enterpriseTaskProductFootprintRequired,
          );
          return;
        }

        await onSubmitTask(task.id, {
          supplyAccountId: accountingFactor.accountId,
        });
        return;
      }

      if (!hasValue(activityValue)) {
        message.warning(I18N.carbonAgent.enterpriseTaskActivityRequired);
        return;
      }
      if (!isValidActivityValue(activityValue)) {
        message.warning(
          I18N.carbonAgent.enterpriseCarbonActivityDataDigitLimit,
        );
        return;
      }
      await onSubmitTask(task.id, {
        activityData: Number(activityValue),
        ...(attachments.length
          ? { fileIds: attachments.map(file => file.id) }
          : {}),
      });
      return;
    }
    if (operation === 'reject') {
      onTaskReject(task.id);
      return;
    }
    await onTaskAction(task.id, operation);
  };

  const showAttachments =
    !isAccountingFactorTask && (canEditAttachments || attachments.length > 0);
  const accountingFactorSelected = hasAccountingFactor(accountingFactor);
  const taskStatusLabel = ENTERPRISE_CARBON_TASK_STATUS_LABELS[task.status];
  const taskTypeLabel = getTaskTypeLabel(task);
  const accountingFactorName =
    accountingFactor?.accountName || accountingFactor?.productName || '-';
  const accountingFactorEmission = `${accountingFactor?.factor ?? '-'}${
    accountingFactor?.factorUnit || ''
  }`;
  const accountingFactorAccountId = getExpertReviewSnapshotModelAccountId(
    accountingFactor?.accountId,
  );
  const accountingFactorDetailUrl = getExpertReviewSnapshotModelUrl(
    accountingFactor?.accountId,
  );

  return (
    <Spin spinning={saving}>
      <article className={styles.taskCard}>
        <header className={styles.taskCardHeader}>
          <div className={styles.taskTitleGroup}>
            <span
              className={`${styles.statusTag} ${
                styles[`status-${task.status}`]
              }`}
              title={taskStatusLabel}
            >
              {taskStatusLabel}
            </span>
            <strong
              className={styles.emissionSourceName}
              title={task.emissionSourceName || '-'}
            >
              {task.emissionSourceName || '-'}
            </strong>
            <span
              className={styles.categoryTag}
              title={task.categoryDisplayName || '-'}
            >
              {task.categoryDisplayName || '-'}
            </span>
            <span className={styles.taskTypeTag} title={taskTypeLabel}>
              {taskTypeLabel}
            </span>
          </div>
          <div className={styles.taskActions}>
            {task.actions.map(action => {
              if (action === 'edit' || action === 'upload') {
                return null;
              }
              return (
                <Button
                  key={action}
                  className={`${styles.actionButton} ${
                    styles[`action-${action}`]
                  }`}
                  disabled={
                    busy ||
                    saving ||
                    uploadingCount > 0 ||
                    (action === 'submit' && !reportingEnabled)
                  }
                  icon={actionIcons[action]}
                  loading={busy}
                  type='text'
                  onClick={() => handleTaskAction(action)}
                >
                  {actionLabels[action]}
                </Button>
              );
            })}
          </div>
        </header>

        <div
          className={`${styles.taskDetails} ${
            isAccountingFactorTask ? styles.taskDetailsAccountingFactor : ''
          }`}
        >
          {isAccountingFactorTask ? (
            <div className={styles.productFootprintField}>
              <div className={styles.productFootprintLabel}>
                <span className={styles.fieldLabel}>
                  {I18N.carbonAgent.enterpriseTaskProductFootprint}
                </span>
                {hasValue(accountingFactor?.accountId) ? (
                  <Tooltip
                    placement='top'
                    title={
                      isMobile
                        ? null
                        : I18N.carbonAgent.enterpriseTaskViewProductFootprint
                    }
                  >
                    <button
                      aria-label={
                        I18N.carbonAgent.enterpriseTaskViewProductFootprint
                      }
                      className={styles.productFootprintDetailButton}
                      type='button'
                      onClick={() => {
                        if (
                          onViewProductFootprintAccount &&
                          accountingFactorAccountId
                        ) {
                          onViewProductFootprintAccount(
                            accountingFactorAccountId,
                          );
                          return;
                        }

                        if (accountingFactorDetailUrl) {
                          window.open(
                            accountingFactorDetailUrl,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        }
                      }}
                    >
                      <img alt='' src={modelDetailsIcon} />
                    </button>
                  </Tooltip>
                ) : null}
              </div>
              {accountingFactorSelected ? (
                <div className={styles.productFootprintValue}>
                  <span
                    title={`${I18N.carbonAgent.enterpriseTaskEmissionName}：${accountingFactorName}`}
                  >
                    {I18N.carbonAgent.enterpriseTaskEmissionName}：
                    {accountingFactorName}
                  </span>
                  <span
                    title={`${I18N.carbonAgent.enterpriseTaskUnitEmission}：${accountingFactorEmission}`}
                  >
                    {I18N.carbonAgent.enterpriseTaskUnitEmission}：
                    {accountingFactorEmission}
                  </span>
                </div>
              ) : (
                <button
                  className={styles.productFootprintSelectButton}
                  disabled={busy || saving || !canEditActivity}
                  type='button'
                  onClick={() => setAccountingSelectorOpen(true)}
                >
                  <img alt='' src={taskProductFootprintSelectIcon} />
                  <span>
                    {I18N.carbonAgent.enterpriseTaskSelectProductFootprint}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className={styles.activityField}>
              <span className={styles.fieldLabel}>
                {I18N.carbonAgent.enterpriseTaskActivityData}
              </span>
              <NumberInputTableCell
                className={styles.activityInput}
                addonAfter={task.activityUnitName || '-'}
                controls={false}
                digitLimitMessage={
                  I18N.carbonAgent.enterpriseCarbonActivityDataDigitLimit
                }
                digitLimitMode='validate'
                disabled={busy || saving || !canEditActivity}
                maxDecimals={ACTIVITY_DIGIT_LIMITS.maxDecimals}
                maxIntegerDigits={ACTIVITY_DIGIT_LIMITS.maxIntegerDigits}
                min={0}
                placeholder={I18N.carbonFootprint3.activityData}
                stringMode
                value={activityValue}
                onBlur={handleActivityBlur}
                onChange={value => setActivityValue(normalizeValue(value))}
              />
            </div>
          )}
          {isAccountingFactorTask ? (
            <>
              <div className={styles.infoField}>
                <span className={styles.fieldLabel}>
                  {I18N.carbonAgent.enterpriseTaskScope}
                </span>
                <strong title={task.scopeName || '-'}>
                  {task.scopeName || '-'}
                </strong>
              </div>
              <div className={styles.infoField}>
                <span className={styles.fieldLabel}>
                  {I18N.carbonAgent.enterpriseTaskAccountingSubject}
                </span>
                <strong title={task.accountingSubjectName || '-'}>
                  {task.accountingSubjectName || '-'}
                </strong>
              </div>
            </>
          ) : (
            <>
              <div className={styles.infoField}>
                <span className={styles.fieldLabel}>
                  {I18N.carbonAgent.enterpriseTaskAccountingSubject}
                </span>
                <strong title={task.accountingSubjectName || '-'}>
                  {task.accountingSubjectName || '-'}
                </strong>
              </div>
              <div className={styles.infoField}>
                <span className={styles.fieldLabel}>
                  {I18N.carbonAgent.enterpriseTaskScope}
                </span>
                <strong title={task.scopeName || '-'}>
                  {task.scopeName || '-'}
                </strong>
              </div>
            </>
          )}
          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>
              {I18N.carbonAgent.projectTaskAssignee}
            </span>
            <strong title={task.responsibleName || '-'}>
              {task.responsibleName || '-'}
            </strong>
          </div>
          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>
              {I18N.carbonAgent.enterpriseTaskReviewer}
            </span>
            <strong title={task.reviewerName || '-'}>
              {task.reviewerName || '-'}
            </strong>
          </div>
          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>
              {I18N.carbonAgent.enterpriseTaskExpectedCompletionTime}
            </span>
            <strong title={task.expectedCompletionTime || '-'}>
              {task.expectedCompletionTime || '-'}
            </strong>
          </div>
        </div>

        {isAccountingFactorTask &&
        accountingFactorSelected &&
        canEditActivity &&
        !busy &&
        !saving ? (
          <div className={styles.productFootprintActions}>
            <button
              className={styles.productFootprintSelectButton}
              type='button'
              onClick={() => setAccountingSelectorOpen(true)}
            >
              <img alt='' src={taskProductFootprintSelectIcon} />
              <span>
                {I18N.carbonAgent.enterpriseTaskReselectProductFootprint}
              </span>
            </button>
          </div>
        ) : null}

        {showAttachments && (
          <footer className={styles.taskCardFooter}>
            <FileUploadDrawer
              files={attachments}
              disabled={busy || saving || !canEditAttachments}
              drawerWidth='min(560px, 100vw)'
              footerMode={canEditAttachments ? 'default' : 'close'}
              maxCount={MAX_TASK_ATTACHMENTS}
              showPreview={false}
              uploadFile={uploadFile}
              onDownload={file =>
                file.assetId === undefined
                  ? undefined
                  : onDownloadFile(file.assetId, file.name)
              }
              onSuccess={handleAttachmentsUpload}
              onDelete={
                canEditAttachments ? handleAttachmentsDelete : undefined
              }
            >
              {attachments.length > 0 ? (
                <div className={styles.attachmentLink}>
                  <CloudUploadOutlined />
                  <span title={attachments[0].name}>{attachments[0].name}</span>
                  {attachments.length > 1 && <em>+{attachments.length - 1}</em>}
                </div>
              ) : (
                <div className={styles.attachmentLink}>
                  <CloudUploadOutlined />
                  <span>{I18N.components.uploadAttachments}</span>
                </div>
              )}
            </FileUploadDrawer>
          </footer>
        )}

        {task.rejectReason && (
          <div className={styles.rejectReason}>
            <span>{I18N.carbonAgent.enterpriseTaskRejectReason}：</span>
            <span>{task.rejectReason}</span>
          </div>
        )}

        {isAccountingFactorTask ? (
          <AgentProductFootprintAccountSelector
            open={accountingSelectorOpen}
            onCancel={() => setAccountingSelectorOpen(false)}
            onConfirm={handleAccountingFactorConfirm}
          />
        ) : null}
      </article>
    </Spin>
  );
};

export default EnterpriseCarbonTaskCard;
