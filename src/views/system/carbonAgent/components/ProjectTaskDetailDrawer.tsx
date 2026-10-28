import projectUploadIcon from '@src/assets/images/carbonAgent/icons/project-home-upload.svg';
import taskCalendarIcon from '@src/assets/images/carbonAgent/icons/task-dialog-calendar.svg';
import taskChevronIcon from '@src/assets/images/carbonAgent/icons/task-dialog-chevron.svg';
import taskCloseIcon from '@src/assets/images/carbonAgent/icons/task-dialog-close.svg';
import taskResizerIcon from '@src/assets/images/carbonAgent/icons/task-dialog-resizer.svg';
import I18N from '@src/lang/I18N';
import { DatePicker, message as antdMessage, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import saveAs from 'file-saver';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';
import style from './ProjectTaskDetailDrawer.module.less';
import {
  FEISHU_COLLECTION_CHANGE_EVENT,
  type FeishuCollectedCandidate,
  getProjectFeishuGroupState,
  markFeishuCandidateAdopted,
} from '../feishuCollectionStore';
import {
  type AgentProjectFile,
  type AgentProjectMember,
  type AgentProjectTaskDetail,
  fetchAgentProjectMembers,
  fetchAgentProjectFileDownloadUrl,
  fetchAgentProjectTaskDetail,
  replyAgentProjectTask,
  updateAgentProjectTask,
  uploadAgentProjectFile,
} from '../service';

type ProjectTaskDetailDrawerProps = {
  onCancel: () => void;
  onChanged: () => void;
  onConversationStart?: (taskId: string) => void;
  open: boolean;
  projectId: string;
  taskId: string;
};

type ProjectTaskStatus = 'doing' | 'done' | 'todo';

const TASK_TITLE_MAX_LENGTH = 20;
const TASK_DESCRIPTION_MAX_LENGTH = 500;
const TASK_REPLY_MAX_LENGTH = 500;
const MAX_TASK_ATTACHMENTS = 10;
const MAX_TASK_ATTACHMENT_SIZE = 20 * 1024 * 1024;
const PROJECT_TASK_STATUS_CODES = new Set<ProjectTaskStatus>([
  'todo',
  'doing',
  'done',
]);

const loadProjectTaskDrawerData = (
  projectId: string,
  taskId: string,
  signal: AbortSignal,
) =>
  Promise.allSettled([
    fetchAgentProjectTaskDetail(projectId, taskId, signal),
    fetchAgentProjectMembers(projectId, signal),
  ] as const);

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const requestError = error as {
    data?: { msg?: unknown };
    message?: unknown;
    response?: { data?: { msg?: unknown } };
  };
  const responseData = requestError.response?.data || requestError.data;

  if (typeof responseData?.msg === 'string' && responseData.msg.trim()) {
    return responseData.msg;
  }

  return typeof requestError.message === 'string' && requestError.message.trim()
    ? requestError.message
    : fallback;
};

const normalizeTaskStatus = (status?: string): ProjectTaskStatus =>
  PROJECT_TASK_STATUS_CODES.has(status as ProjectTaskStatus)
    ? (status as ProjectTaskStatus)
    : 'todo';

const getProjectFileKey = (file: AgentProjectFile) =>
  file.fileId || String(file.assetId);

const formatDueTime = (value: Dayjs | null) =>
  value ? value.format('YYYY-MM-DD HH:mm:ss') : null;

const isSameId = (
  left: number | string | null | undefined,
  right: number | string | null | undefined,
) =>
  left !== undefined &&
  left !== null &&
  right !== undefined &&
  right !== null &&
  String(left) === String(right);

const ProjectTaskDetailDrawer = ({
  onCancel,
  onChanged,
  onConversationStart,
  open,
  projectId,
  taskId,
}: ProjectTaskDetailDrawerProps) => {
  const [detail, setDetail] = useState<AgentProjectTaskDetail>();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [members, setMembers] = useState<AgentProjectMember[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [status, setStatus] = useState<ProjectTaskStatus>('todo');
  const [assigneeMemberId, setAssigneeMemberId] = useState('');
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [attachments, setAttachments] = useState<AgentProjectFile[]>([]);
  const [downloadingFileKey, setDownloadingFileKey] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [feishuCandidates, setFeishuCandidates] = useState<
    FeishuCollectedCandidate[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskIdentity = `${projectId}:${taskId}`;
  const activeTaskIdentityRef = useRef(taskIdentity);
  const openRef = useRef(open);

  activeTaskIdentityRef.current = taskIdentity;
  openRef.current = open;

  useEffect(() => {
    if (!open || !taskId) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setDetail(undefined);
    setMembers([]);
    setLoading(true);
    setLoadError('');
    setTaskTitle('');
    setTaskDescription('');
    setAssigneeMemberId('');
    setDueTime(null);
    setReplyContent('');
    setAttachments([]);
    setDownloadingFileKey(undefined);
    setUploadError('');
    setSubmitError('');
    setUploading(false);
    setSubmitting(false);

    loadProjectTaskDrawerData(projectId, taskId, abortController.signal)
      .then(([detailResult, memberResult]) => {
        if (cancelled) {
          return;
        }

        if (detailResult.status === 'rejected') {
          throw detailResult.reason;
        }

        const nextDetail = detailResult.value;
        const nextTask = nextDetail.task;
        const latestReply = nextDetail.replies[nextDetail.replies.length - 1];
        const nextMembers =
          memberResult.status === 'fulfilled' ? memberResult.value : [];
        const currentMember = nextMembers.find(member => member.currentUser);
        const currentAssigneeId =
          nextTask.assigneeMemberId === undefined ||
          nextTask.assigneeMemberId === null
            ? ''
            : String(nextTask.assigneeMemberId);
        const fallbackAssignee = currentMember || nextMembers[0];
        setDetail(nextDetail);
        setTaskTitle(nextTask.taskTitle);
        setTaskDescription(nextTask.taskDescription || '');
        setReplyContent(
          (latestReply?.content || '').slice(0, TASK_REPLY_MAX_LENGTH),
        );
        setAttachments(latestReply?.files || []);
        setStatus(normalizeTaskStatus(nextTask.status));
        setAssigneeMemberId(
          currentAssigneeId || String(fallbackAssignee?.memberId || ''),
        );
        setDueTime(nextTask.dueTime ? dayjs(nextTask.dueTime) : null);
        setMembers(nextMembers);
      })
      .catch(error => {
        if (!cancelled) {
          setLoadError(
            getRequestErrorMessage(
              error,
              I18N.carbonAgent.projectTaskDetailLoadFailed,
            ),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [open, projectId, retryKey, taskId]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting && !uploading) {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open, submitting, uploading]);

  useEffect(() => {
    if (!open || !projectId) {
      setFeishuCandidates([]);
      return undefined;
    }

    const syncFeishuCandidates = () => {
      const groupState = getProjectFeishuGroupState(projectId);
      const allCandidates = groupState?.candidates || [];
      const matched = allCandidates.filter(
        item => !item.taskId || String(item.taskId) === String(taskId),
      );
      setFeishuCandidates(matched);
    };

    syncFeishuCandidates();
    window.addEventListener(
      FEISHU_COLLECTION_CHANGE_EVENT,
      syncFeishuCandidates,
    );

    return () => {
      window.removeEventListener(
        FEISHU_COLLECTION_CHANGE_EVENT,
        syncFeishuCandidates,
      );
    };
  }, [open, projectId, taskId]);

  const statusOptions = useMemo(
    () => [
      {
        label: I18N.carbonAgent.projectTaskStatusTodo,
        value: 'todo' as const,
      },
      {
        label: I18N.carbonAgent.projectTaskStatusDoing,
        value: 'doing' as const,
      },
      {
        label: I18N.carbonAgent.projectTaskStatusDone,
        value: 'done' as const,
      },
    ],
    [],
  );
  const task = detail?.task;
  const source = detail?.source;
  const currentMember = members.find(member => member.currentUser);
  const currentUserCreatedTask = Boolean(
    task &&
      currentMember &&
      (isSameId(currentMember.memberId, task.creatorMemberId) ||
        isSameId(currentMember.userId, task.creatorUserId)),
  );
  const currentUserIsAssignee = Boolean(
    task &&
      (task.mine ||
        (currentMember &&
          (isSameId(currentMember.memberId, task.assigneeMemberId) ||
            isSameId(currentMember.userId, task.assigneeUserId)))),
  );
  const canEditTaskInfo = Boolean(task?.canEdit && currentUserCreatedTask);
  // A task creator can also be its assignee. In that case they still need to
  // upload attachments and submit a reply, so reply permission is determined
  // solely by the assignee identity.
  const canReplyToTask = Boolean(task && currentUserIsAssignee);
  const memberOptions = useMemo(() => {
    const options = members.map(member => ({
      label: member.currentUser
        ? I18N.template(I18N.carbonAgent.projectTaskCurrentMember, {
            val1: member.userName,
          })
        : member.userName,
      value: String(member.memberId),
    }));
    const currentAssigneeId =
      task?.assigneeMemberId === undefined || task?.assigneeMemberId === null
        ? ''
        : String(task.assigneeMemberId);

    if (
      currentAssigneeId &&
      !options.some(option => option.value === currentAssigneeId)
    ) {
      options.push({
        label: task?.assigneeName || I18N.carbonAgent.projectTaskUnassigned,
        value: currentAssigneeId,
      });
    }

    return options;
  }, [members, task?.assigneeMemberId, task?.assigneeName]);
  const relatedObjectName =
    source?.objectName ||
    task?.sourceObjectName ||
    task?.sourceObjectTypeName ||
    task?.sourceTypeName ||
    I18N.carbonAgent.projectTaskRelatedProject;
  const relatedObjectPath =
    source?.objectPath ||
    task?.sourceObjectPath ||
    task?.sourceObjectTypeName ||
    task?.sourceObjectType ||
    I18N.carbonAgent.projectTaskRelatedProject;
  const accountName = source?.accountName || task?.sourceAccountName || '';
  const sourceName =
    source?.sourceTypeName ||
    task?.sourceTypeName ||
    I18N.carbonAgent.projectTaskUnknownSource;
  const normalizedTaskTitle = taskTitle.trim();
  const normalizedTaskDescription = taskDescription.trim();
  const normalizedReplyContent = replyContent.trim();
  const nextDueTime = formatDueTime(dueTime);
  const originalDueTime = task?.dueTime
    ? dayjs(task.dueTime).format('YYYY-MM-DD HH:mm:ss')
    : null;
  const hasTaskChanges = Boolean(
    canEditTaskInfo &&
      (normalizedTaskTitle !== task.taskTitle ||
        normalizedTaskDescription !== (task.taskDescription || '') ||
        assigneeMemberId !== String(task.assigneeMemberId || '') ||
        nextDueTime !== originalDueTime),
  );
  const canSubmitTaskChanges = Boolean(
    canEditTaskInfo &&
      hasTaskChanges &&
      normalizedTaskTitle &&
      normalizedTaskTitle.length <= TASK_TITLE_MAX_LENGTH &&
      normalizedTaskDescription.length <= TASK_DESCRIPTION_MAX_LENGTH &&
      assigneeMemberId,
  );
  const canSubmitReply = Boolean(
    canReplyToTask &&
      normalizedReplyContent &&
      normalizedReplyContent.length <= TASK_REPLY_MAX_LENGTH &&
      status,
  );
  const canSubmit = Boolean(
    task &&
      !loading &&
      !uploading &&
      !submitting &&
      (canSubmitTaskChanges || canSubmitReply),
  );
  const canUploadAttachments = Boolean(
    canReplyToTask &&
      attachments.length < MAX_TASK_ATTACHMENTS &&
      !uploading &&
      !submitting,
  );

  if (!open || !taskId) {
    return null;
  }

  const handleAdoptFeishuCandidate = (candidate: FeishuCollectedCandidate) => {
    setAttachments(currentAttachments => {
      const nextFiles = new Map(
        currentAttachments.map(file => [getProjectFileKey(file), file]),
      );
      nextFiles.set(getProjectFileKey(candidate.file), candidate.file);
      return Array.from(nextFiles.values());
    });

    const summaryLine = I18N.template(
      I18N.carbonAgent.feishuCollectTaskReplyTemplate,
      {
        val1: candidate.groupName,
        val2: candidate.file.fileName,
        val3: candidate.note,
      },
    );
    setReplyContent(currentReply => {
      const nextText = currentReply.trim()
        ? `${currentReply.trim()}\n${summaryLine}`
        : summaryLine;
      return nextText.slice(0, TASK_REPLY_MAX_LENGTH);
    });

    markFeishuCandidateAdopted(projectId, candidate.id);
    antdMessage.success(I18N.carbonAgent.feishuCollectTaskAdoptSuccess);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';

    if (!canReplyToTask || !selectedFiles.length || uploading) {
      return;
    }

    const remainingSlots = MAX_TASK_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      setUploadError(
        I18N.template(I18N.carbonAgent.maxUploadFiles, {
          val1: MAX_TASK_ATTACHMENTS,
        }),
      );
      return;
    }

    const filesWithinCountLimit = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      setUploadError(
        I18N.template(I18N.carbonAgent.maxUploadFiles, {
          val1: MAX_TASK_ATTACHMENTS,
        }),
      );
    } else {
      setUploadError('');
    }

    const validFiles = filesWithinCountLimit.filter(file => {
      if (file.size <= MAX_TASK_ATTACHMENT_SIZE) {
        return true;
      }

      setUploadError(
        I18N.template(I18N.carbonAgent.fileTooLarge, { val1: file.name }),
      );
      return false;
    });

    if (!validFiles.length) {
      return;
    }

    const uploadIdentity = taskIdentity;
    setUploading(true);

    const results = await Promise.allSettled(
      validFiles.map(file => uploadAgentProjectFile(projectId, file)),
    );

    if (!openRef.current || activeTaskIdentityRef.current !== uploadIdentity) {
      return;
    }

    const uploadedFiles = results.flatMap(result =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
    const failedCount = results.length - uploadedFiles.length;

    if (uploadedFiles.length) {
      setAttachments(currentAttachments => {
        const nextFiles = new Map(
          currentAttachments.map(file => [getProjectFileKey(file), file]),
        );
        uploadedFiles.forEach(file => {
          nextFiles.set(getProjectFileKey(file), file);
        });
        return Array.from(nextFiles.values());
      });
    }

    if (failedCount) {
      setUploadError(I18N.carbonAgent.projectFileUploadFailed);
    }

    setUploading(false);
  };

  const handleAttachmentDownload = async (file: AgentProjectFile) => {
    if (downloadingFileKey) {
      return;
    }

    const downloadIdentity = taskIdentity;
    const fileKey = getProjectFileKey(file);
    setDownloadingFileKey(fileKey);

    try {
      const downloadableFile = await fetchAgentProjectFileDownloadUrl(
        projectId,
        file.assetId,
      );

      if (
        !openRef.current ||
        activeTaskIdentityRef.current !== downloadIdentity
      ) {
        return;
      }

      if (!downloadableFile.downloadUrl) {
        throw new Error(I18N.carbonAgent.projectFileDownloadUnavailable);
      }

      saveAs(
        downloadableFile.downloadUrl,
        downloadableFile.fileName || file.fileName,
      );
    } catch (error) {
      if (
        !openRef.current ||
        activeTaskIdentityRef.current !== downloadIdentity
      ) {
        return;
      }

      antdMessage.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry,
      );
    } finally {
      if (
        openRef.current &&
        activeTaskIdentityRef.current === downloadIdentity
      ) {
        setDownloadingFileKey(currentFileKey =>
          currentFileKey === fileKey ? undefined : currentFileKey,
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !task) {
      return;
    }

    const submitIdentity = taskIdentity;
    setSubmitting(true);
    setSubmitError('');

    try {
      if (canSubmitTaskChanges) {
        const updatedTask = await updateAgentProjectTask(projectId, taskId, {
          assigneeMemberId,
          dueTime: nextDueTime,
          taskDescription: normalizedTaskDescription,
          taskTitle: normalizedTaskTitle,
          version: task.version ?? 0,
        });

        if (
          !openRef.current ||
          activeTaskIdentityRef.current !== submitIdentity
        ) {
          return;
        }

        setDetail(currentDetail =>
          currentDetail
            ? {
                ...currentDetail,
                task: {
                  ...currentDetail.task,
                  ...updatedTask,
                },
              }
            : currentDetail,
        );
      }

      if (canSubmitReply) {
        await replyAgentProjectTask(projectId, taskId, {
          content: normalizedReplyContent,
          fileIds: attachments.map(file => file.fileId),
          status,
        });

        if (
          !openRef.current ||
          activeTaskIdentityRef.current !== submitIdentity
        ) {
          return;
        }

        setReplyContent('');
        setAttachments([]);
      }

      onChanged();
      onCancel();
    } catch (error) {
      if (openRef.current && activeTaskIdentityRef.current === submitIdentity) {
        setSubmitError(
          getRequestErrorMessage(
            error,
            I18N.carbonAgent.projectTaskSubmitFailed,
          ),
        );
      }
    } finally {
      if (openRef.current && activeTaskIdentityRef.current === submitIdentity) {
        setSubmitting(false);
      }
    }
  };

  const selectSuffixIcon = (
    <Icon className={style.projectTaskDrawerChevron} src={taskChevronIcon} />
  );

  return createPortal(
    <div className={style.projectTaskDrawerLayer}>
      <button
        className={style.projectTaskDrawerScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={submitting || uploading}
        onClick={onCancel}
      />
      <aside
        className={style.projectTaskDrawer}
        role='dialog'
        aria-modal='true'
        aria-label={task?.taskTitle || I18N.carbonAgent.projectTaskDetail}
        aria-busy={loading || submitting}
      >
        <header className={style.projectTaskDrawerHeader}>
          <h2>{I18N.carbonAgent.projectTaskDetail}</h2>
          <button
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={submitting || uploading}
            onClick={onCancel}
          >
            <Icon src={taskCloseIcon} />
          </button>
        </header>

        <div className={style.projectTaskDrawerBody}>
          {loading ? (
            <div className={style.projectTaskDrawerState}>
              <Spin />
              <span>{I18N.carbonAgent.projectTaskDetailLoading}</span>
            </div>
          ) : loadError ? (
            <div className={style.projectTaskDrawerState}>
              <span>{loadError}</span>
              <button
                type='button'
                onClick={() => setRetryKey(value => value + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          ) : task ? (
            <>
              <div className={style.projectTaskDrawerField}>
                <label htmlFor='carbon-agent-task-detail-title'>
                  <b aria-hidden='true'>*</b>
                  {I18N.carbonAgent.projectTaskTitle}
                </label>
                <input
                  id='carbon-agent-task-detail-title'
                  className={style.projectTaskDrawerTextInput}
                  value={taskTitle}
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  placeholder={I18N.carbonAgent.pleaseEnter}
                  disabled={!canEditTaskInfo || submitting}
                  onChange={event =>
                    setTaskTitle(
                      event.currentTarget.value.slice(0, TASK_TITLE_MAX_LENGTH),
                    )
                  }
                />
              </div>

              <div className={style.projectTaskDrawerField}>
                <label htmlFor='carbon-agent-task-detail-description'>
                  {I18N.carbonAgent.projectTaskDescription}
                </label>
                <div
                  className={style.projectTaskDrawerTextarea}
                  data-disabled={!canEditTaskInfo || submitting || undefined}
                >
                  <textarea
                    id='carbon-agent-task-detail-description'
                    value={taskDescription}
                    maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                    placeholder={I18N.carbonAgent.pleaseEnter}
                    disabled={!canEditTaskInfo || submitting}
                    onChange={event =>
                      setTaskDescription(
                        event.currentTarget.value.slice(
                          0,
                          TASK_DESCRIPTION_MAX_LENGTH,
                        ),
                      )
                    }
                  />
                  <span>
                    {taskDescription.length}/{TASK_DESCRIPTION_MAX_LENGTH}
                  </span>
                  <Icon src={taskResizerIcon} />
                </div>
              </div>

              <section className={style.projectTaskDrawerRelated}>
                <span>{I18N.carbonAgent.projectTaskRelatedObject}</span>
                <div>
                  <div>
                    <strong>{relatedObjectName}</strong>
                    <small>{relatedObjectPath}</small>
                  </div>
                  {accountName ? (
                    <div>
                      <strong>{accountName}</strong>
                      <small>
                        {source?.available === false
                          ? source.unavailableReason ||
                            I18N.carbonAgent.projectTaskSourceUnavailable
                          : I18N.carbonAgent.projectTaskLiveProjectData}
                      </small>
                    </div>
                  ) : null}
                </div>
              </section>

              <div className={style.projectTaskDrawerGrid}>
                <div className={style.projectTaskDrawerField}>
                  <label htmlFor='carbon-agent-task-detail-status'>
                    <b aria-hidden='true'>*</b>
                    {I18N.carbonAgent.projectTaskStatus}
                  </label>
                  <Select
                    id='carbon-agent-task-detail-status'
                    className={style.projectTaskDrawerSelect}
                    disabled={
                      !canReplyToTask || !task.canChangeStatus || submitting
                    }
                    options={statusOptions}
                    popupClassName={style.projectTaskDrawerPopup}
                    suffixIcon={selectSuffixIcon}
                    value={status}
                    onChange={setStatus}
                  />
                </div>
                <div className={style.projectTaskDrawerField}>
                  <label htmlFor='carbon-agent-task-detail-assignee'>
                    <b aria-hidden='true'>*</b>
                    {I18N.carbonAgent.projectTaskAssignee}
                  </label>
                  <Select
                    id='carbon-agent-task-detail-assignee'
                    className={style.projectTaskDrawerSelect}
                    disabled={!canEditTaskInfo || submitting}
                    options={memberOptions}
                    placeholder={I18N.carbonAgent.pleaseSelect}
                    popupClassName={style.projectTaskDrawerPopup}
                    suffixIcon={selectSuffixIcon}
                    value={assigneeMemberId || undefined}
                    onChange={setAssigneeMemberId}
                  />
                </div>
                <div className={style.projectTaskDrawerField}>
                  <label htmlFor='carbon-agent-task-detail-due-time'>
                    {I18N.carbonAgent.projectTaskDueTime}
                  </label>
                  <DatePicker
                    id='carbon-agent-task-detail-due-time'
                    className={style.projectTaskDrawerDatePicker}
                    disabled={!canEditTaskInfo || submitting}
                    format='YYYY-MM-DD HH:mm:ss'
                    placeholder={I18N.carbonAgent.pleaseSelect}
                    popupClassName={style.projectTaskDrawerPopup}
                    showTime={{ format: 'HH:mm:ss' }}
                    suffixIcon={
                      <Icon
                        className={style.projectTaskDrawerCalendar}
                        src={taskCalendarIcon}
                      />
                    }
                    value={dueTime}
                    onChange={setDueTime}
                  />
                </div>
                <div className={style.projectTaskDrawerField}>
                  <label htmlFor='carbon-agent-task-detail-source'>
                    {I18N.carbonAgent.projectTaskSource}
                  </label>
                  <div
                    className={style.projectTaskDrawerReadonly}
                    id='carbon-agent-task-detail-source'
                  >
                    {sourceName}
                  </div>
                </div>
              </div>

              {feishuCandidates.length ? (
                <section className={style.projectTaskDrawerFeishuSection}>
                  <h3>{I18N.carbonAgent.feishuCollectTaskSectionTitle}</h3>
                  {feishuCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className={style.projectTaskDrawerFeishuCard}
                    >
                      <div className={style.projectTaskDrawerFeishuFileHeader}>
                        <strong title={candidate.file.fileName}>
                          {candidate.file.fileName}
                        </strong>
                        <span
                          className={
                            candidate.adopted
                              ? `${style.projectTaskDrawerFeishuBadge} ${style.projectTaskDrawerFeishuBadgeAdopted}`
                              : style.projectTaskDrawerFeishuBadge
                          }
                        >
                          {candidate.adopted
                            ? I18N.carbonAgent.feishuCollectTaskAdoptedBadge
                            : I18N.carbonAgent.feishuCollectTaskPendingBadge}
                        </span>
                      </div>
                      <div className={style.projectTaskDrawerFeishuMetaGrid}>
                        <span>
                          {I18N.carbonAgent.feishuCollectTaskSourceLabel}
                        </span>
                        <div title={candidate.groupName}>
                          {candidate.groupName} · {candidate.senderName}
                        </div>
                        <span>
                          {I18N.carbonAgent.feishuCollectTaskNoteLabel}
                        </span>
                        <div title={candidate.note}>{candidate.note}</div>
                      </div>
                      <div className={style.projectTaskDrawerFeishuActions}>
                        <button
                          className={style.projectTaskDrawerFeishuGhostBtn}
                          type='button'
                          onClick={() =>
                            handleAttachmentDownload(candidate.file)
                          }
                        >
                          {I18N.carbonAgent.feishuCollectTaskViewOriginal}
                        </button>
                        <div
                          className={style.projectTaskDrawerFeishuActionGroup}
                        >
                          <button
                            className={style.projectTaskDrawerFeishuGhostBtn}
                            type='button'
                            onClick={() =>
                              antdMessage.info(
                                I18N.carbonAgent
                                  .feishuCollectTaskRequestMoreToast,
                              )
                            }
                          >
                            {I18N.carbonAgent.feishuCollectTaskRequestMore}
                          </button>
                          <button
                            className={style.projectTaskDrawerFeishuPrimaryBtn}
                            type='button'
                            disabled={submitting}
                            onClick={() =>
                              handleAdoptFeishuCandidate(candidate)
                            }
                          >
                            {I18N.carbonAgent.feishuCollectTaskAdoptConfirm}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}

              <div className={style.projectTaskDrawerField}>
                <label htmlFor='carbon-agent-task-detail-files'>
                  {I18N.carbonAgent.projectTaskAttachments}
                </label>
                <input
                  id='carbon-agent-task-detail-files'
                  ref={fileInputRef}
                  className={style.projectTaskDrawerFileInput}
                  type='file'
                  multiple
                  disabled={!canUploadAttachments}
                  onChange={handleFileChange}
                />
                <button
                  className={style.projectTaskDrawerUpload}
                  type='button'
                  disabled={!canUploadAttachments}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon src={projectUploadIcon} />
                  {uploading
                    ? I18N.carbonAgent.projectTaskFileUploading
                    : I18N.carbonAgent.projectTaskUploadFile}
                </button>
                {attachments.length ? (
                  <ul className={style.projectTaskDrawerFiles}>
                    {attachments.map(file => {
                      const fileKey = getProjectFileKey(file);
                      const fileDownloading = downloadingFileKey === fileKey;

                      return (
                        <li key={fileKey}>
                          <button
                            className={style.projectTaskDrawerFileDownload}
                            type='button'
                            title={file.fileName}
                            aria-busy={fileDownloading}
                            aria-label={`${file.fileName} ${
                              fileDownloading
                                ? I18N.carbonAgent.projectFileDownloading
                                : I18N.carbonAgent.download
                            }`}
                            disabled={Boolean(downloadingFileKey)}
                            onClick={() => handleAttachmentDownload(file)}
                          >
                            {file.fileName}
                          </button>
                          <button
                            className={style.projectTaskDrawerFileRemove}
                            type='button'
                            aria-label={I18N.template(
                              I18N.carbonAgent.projectTaskRemoveAttachment,
                              { val1: file.fileName },
                            )}
                            disabled={!canReplyToTask || submitting}
                            onClick={() =>
                              setAttachments(currentAttachments =>
                                currentAttachments.filter(
                                  currentFile =>
                                    getProjectFileKey(currentFile) !==
                                    getProjectFileKey(file),
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {uploadError ? (
                  <span className={style.projectTaskDrawerInlineError}>
                    {uploadError}
                  </span>
                ) : null}
              </div>

              <div className={style.projectTaskDrawerField}>
                <label htmlFor='carbon-agent-task-detail-reply'>
                  <b aria-hidden='true'>*</b>
                  {I18N.carbonAgent.projectTaskReplyContent}
                </label>
                <div
                  className={style.projectTaskDrawerTextarea}
                  data-disabled={!canReplyToTask || submitting || undefined}
                >
                  <textarea
                    id='carbon-agent-task-detail-reply'
                    value={replyContent}
                    maxLength={TASK_REPLY_MAX_LENGTH}
                    placeholder={I18N.carbonAgent.projectTaskReplyPlaceholder}
                    disabled={!canReplyToTask || submitting}
                    onChange={event =>
                      setReplyContent(
                        event.currentTarget.value.slice(
                          0,
                          TASK_REPLY_MAX_LENGTH,
                        ),
                      )
                    }
                  />
                  <span>
                    {replyContent.length}/{TASK_REPLY_MAX_LENGTH}
                  </span>
                  <Icon src={taskResizerIcon} />
                </div>
              </div>

              <section className={style.projectTaskDrawerActivity}>
                <h3>{I18N.carbonAgent.projectTaskSubmissionHistory}</h3>
                <ol>
                  {detail.logs.map((log, index) => (
                    <li key={`${log.action}-${log.createTime || index}`}>
                      <i aria-hidden='true' />
                      <strong>
                        {log.actionName ||
                          I18N.carbonAgent.projectTaskCreatedActivity}
                      </strong>
                      <p>
                        {log.action === 'created'
                          ? [
                              sourceName,
                              source?.available === false
                                ? I18N.carbonAgent.projectTaskSourceUnavailable
                                : I18N.carbonAgent.projectTaskLiveProjectData,
                            ].join(' · ')
                          : [log.operatorName, log.createTime]
                              .filter(Boolean)
                              .join(' · ')}
                      </p>
                      {log.toValue && log.action !== 'created' ? (
                        <span>{log.toValue}</span>
                      ) : null}
                    </li>
                  ))}
                  {detail.replies.map(reply => (
                    <li key={String(reply.replyId)}>
                      <i aria-hidden='true' />
                      <strong>
                        {I18N.template(
                          I18N.carbonAgent.projectTaskReplyActivity,
                          {
                            val1:
                              reply.authorName ||
                              I18N.carbonAgent.projectTaskUnassigned,
                          },
                        )}
                      </strong>
                      <p>{reply.createTime}</p>
                      {reply.content ? <span>{reply.content}</span> : null}
                      {reply.files.length ? (
                        <div>
                          {reply.files.map(file => {
                            const fileKey = getProjectFileKey(file);
                            const fileDownloading =
                              downloadingFileKey === fileKey;

                            return (
                              <button
                                className={style.projectTaskDrawerActivityFile}
                                key={fileKey}
                                type='button'
                                title={file.fileName}
                                aria-busy={fileDownloading}
                                aria-label={`${file.fileName} ${
                                  fileDownloading
                                    ? I18N.carbonAgent.projectFileDownloading
                                    : I18N.carbonAgent.download
                                }`}
                                disabled={Boolean(downloadingFileKey)}
                                onClick={() => handleAttachmentDownload(file)}
                              >
                                {file.fileName}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>

              {submitError ? (
                <div className={style.projectTaskDrawerSubmitError}>
                  {submitError}
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className={style.projectTaskDrawerFooter}>
          {task && onConversationStart ? (
            <button
              className={style.projectTaskDrawerCancel}
              type='button'
              disabled={submitting || uploading}
              onClick={() => onConversationStart(String(task.taskId))}
            >
              {I18N.carbonAgent.projectTaskStartConversation}
            </button>
          ) : null}
          <button
            className={style.projectTaskDrawerCancel}
            type='button'
            disabled={submitting || uploading}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={style.projectTaskDrawerSubmit}
            type='button'
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting
              ? canSubmitReply
                ? I18N.carbonAgent.projectTaskReplySubmitting
                : I18N.carbonAgent.saving
              : canSubmitReply
              ? I18N.carbonAgent.projectTaskSubmitReply
              : I18N.carbonAgent.save}
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
};

export default ProjectTaskDetailDrawer;
