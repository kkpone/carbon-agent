import taskDialogCalendarIcon from '@src/assets/images/carbonAgent/icons/task-dialog-calendar.svg';
import taskDialogChevronIcon from '@src/assets/images/carbonAgent/icons/task-dialog-chevron.svg';
import taskDialogCloseIcon from '@src/assets/images/carbonAgent/icons/task-dialog-close.svg';
import taskDialogResizerIcon from '@src/assets/images/carbonAgent/icons/task-dialog-resizer.svg';
import I18N, { LocaleType, serviceLangMap } from '@src/lang/I18N';
import { DatePicker, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';
import style from '../index.module.less';
import {
  createAgentProjectTask,
  fetchAgentProjectConfig,
  fetchAgentProjectMembers,
  type AgentProjectConfig,
  type AgentProjectMember,
  type AgentProjectTask,
  type AgentProjectTaskCompareContext,
  type AgentProjectTaskSourceType,
} from '../service';

export type ProjectTaskCreateContext = {
  compareContext?: AgentProjectTaskCompareContext;
  initialTaskDescription?: string;
  initialTaskTitle?: string;
  relatedObjectLabel: string;
  sourceAccountId?: number | string;
  sourceObjectId?: string;
  sourceObjectType: string;
  sourceSessionId?: string;
  sourceType: AgentProjectTaskSourceType;
};

type ProjectTaskCreateDialogProps = {
  context?: ProjectTaskCreateContext;
  locale: LocaleType;
  onCancel: () => void;
  onCreated: (task: AgentProjectTask) => void;
  open: boolean;
  projectId: string;
};

type ProjectTaskStatus = 'doing' | 'done' | 'todo';

const TASK_TITLE_MAX_LENGTH = 20;
const TASK_DESCRIPTION_MAX_LENGTH = 500;
const DEFAULT_TASK_STATUS: ProjectTaskStatus = 'todo';
const MANUAL_TASK_OBJECT_TYPES = new Set([
  'project_collaboration',
  'project_file_organize',
  'project_session_follow',
]);
const ACCOUNT_ANALYSIS_TASK_SOURCE_TYPES = new Set<AgentProjectTaskSourceType>([
  'emission_source',
  'hotspot',
]);
const PROJECT_TASK_STATUS_CODES = new Set<ProjectTaskStatus>([
  'todo',
  'doing',
  'done',
]);

const loadProjectTaskCreateOptions = (
  projectId: string,
  locale: LocaleType,
  signal: AbortSignal,
) =>
  Promise.allSettled([
    fetchAgentProjectConfig(serviceLangMap[locale] || 'zh', signal),
    fetchAgentProjectMembers(projectId, signal),
  ]);

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const requestError = error as {
    data?: { msg?: unknown };
    response?: { data?: { msg?: unknown } };
  };
  const responseData = requestError.response?.data || requestError.data;

  return typeof responseData?.msg === 'string' && responseData.msg.trim()
    ? responseData.msg
    : fallback;
};

const ProjectTaskCreateDialog = ({
  context,
  locale,
  onCancel,
  onCreated,
  open,
  projectId,
}: ProjectTaskCreateDialogProps) => {
  const [config, setConfig] = useState<AgentProjectConfig>();
  const [members, setMembers] = useState<AgentProjectMember[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [sourceObjectType, setSourceObjectType] = useState<string>();
  const [status, setStatus] = useState<ProjectTaskStatus>(DEFAULT_TASK_STATUS);
  const [assigneeMemberId, setAssigneeMemberId] = useState<string>();
  const [dueTime, setDueTime] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTaskTitle(
      (context?.initialTaskTitle || '').slice(0, TASK_TITLE_MAX_LENGTH),
    );
    setTaskDescription(
      (context?.initialTaskDescription || '').slice(
        0,
        TASK_DESCRIPTION_MAX_LENGTH,
      ),
    );
    setSourceObjectType(context?.sourceObjectType);
    setStatus(DEFAULT_TASK_STATUS);
    setAssigneeMemberId(undefined);
    setDueTime(null);
    setSubmitting(false);
    setSubmitError('');

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  }, [context, open, projectId]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setOptionsLoading(true);
    setOptionsError('');

    loadProjectTaskCreateOptions(
      projectId,
      locale,
      abortController.signal,
    ).then(([configResult, memberResult]) => {
      if (cancelled) {
        return;
      }

      if (configResult.status === 'fulfilled') {
        setConfig(configResult.value);
      } else {
        setConfig(undefined);
      }

      if (memberResult.status === 'fulfilled') {
        const nextMembers = memberResult.value;
        setMembers(nextMembers);
        setAssigneeMemberId(currentAssigneeMemberId => {
          if (currentAssigneeMemberId) {
            return currentAssigneeMemberId;
          }

          const defaultMember =
            nextMembers.find(member => member.currentUser) || nextMembers[0];
          return defaultMember ? String(defaultMember.memberId) : undefined;
        });
      } else {
        setMembers([]);
      }

      if (
        configResult.status === 'rejected' ||
        memberResult.status === 'rejected'
      ) {
        setOptionsError(I18N.carbonAgent.projectTaskOptionsLoadFailed);
      }

      setOptionsLoading(false);
    });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [locale, open, projectId, retryKey]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open, submitting]);

  const sourceObjectOptions = useMemo(
    () =>
      (config?.taskObjectTypes || [])
        .filter(
          option => option.enabled && MANUAL_TASK_OBJECT_TYPES.has(option.code),
        )
        .map(option => ({
          label: option.name,
          value: option.code,
        })),
    [config],
  );
  const statusOptions = useMemo(() => {
    const configuredOptions = (config?.taskStatuses || [])
      .filter(
        option =>
          option.enabled &&
          PROJECT_TASK_STATUS_CODES.has(option.code as ProjectTaskStatus),
      )
      .map(option => ({
        label: option.name,
        value: option.code as ProjectTaskStatus,
      }));

    return configuredOptions.length
      ? configuredOptions
      : [
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
        ];
  }, [config]);
  const memberOptions = useMemo(
    () =>
      members.map(member => ({
        label: member.currentUser
          ? I18N.template(I18N.carbonAgent.projectTaskCurrentMember, {
              val1: member.userName,
            })
          : member.departmentNames?.length
          ? `${member.userName} · ${member.departmentNames.join(' / ')}`
          : member.userName,
        value: String(member.memberId),
      })),
    [members],
  );
  const relatedObjectOptions = context
    ? [
        {
          label: context.relatedObjectLabel,
          value: context.sourceObjectType,
        },
      ]
    : sourceObjectOptions;
  const taskSourceType = context?.sourceType || 'manual';
  const sourceAccountId = context?.sourceAccountId;
  const sourceObjectId = context?.sourceObjectId?.trim();
  const validSourceObjectId =
    sourceObjectId &&
    sourceObjectId !== 'null' &&
    sourceObjectId !== 'undefined'
      ? sourceObjectId
      : undefined;
  const compareContext = context?.compareContext;
  const hasSourceAccountId =
    sourceAccountId !== undefined &&
    sourceAccountId !== null &&
    sourceAccountId !== '';
  const hasCompareContext = Boolean(
    compareContext &&
      compareContext.accountIds.length >= 2 &&
      compareContext.dimension &&
      compareContext.focusCategoryCode !== undefined &&
      compareContext.focusCategoryCode !== null &&
      compareContext.focusCategoryCode !== '',
  );
  const requiresSourceAccountId =
    ACCOUNT_ANALYSIS_TASK_SOURCE_TYPES.has(taskSourceType);
  const hasSourceObjectId = Boolean(validSourceObjectId);
  const requiresSourceObjectId = taskSourceType === 'emission_source';
  const requiresCompareContext = taskSourceType === 'compare_difference';
  const hasAssignableMember = Boolean(
    assigneeMemberId &&
      memberOptions.some(option => option.value === assigneeMemberId),
  );
  const canSubmit = Boolean(
    taskTitle.trim() &&
      taskTitle.trim().length <= TASK_TITLE_MAX_LENGTH &&
      sourceObjectType &&
      status &&
      hasAssignableMember &&
      (!requiresSourceAccountId || hasSourceAccountId) &&
      (!requiresSourceObjectId || hasSourceObjectId) &&
      (!requiresCompareContext || hasCompareContext) &&
      !optionsLoading &&
      !submitting,
  );

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const assignee = members.find(
        member => String(member.memberId) === assigneeMemberId,
      );
      if (!assignee || !sourceObjectType) {
        setSubmitting(false);
        return;
      }

      const task = await createAgentProjectTask(projectId, {
        assigneeMemberId: assignee.memberId,
        ...(compareContext ? { compareContext } : {}),
        ...(dueTime ? { dueTime: dueTime.format('YYYY-MM-DD HH:mm:ss') } : {}),
        ...(hasSourceAccountId ? { sourceAccountId } : {}),
        ...(validSourceObjectId ? { sourceObjectId: validSourceObjectId } : {}),
        ...(context?.sourceSessionId
          ? { sourceSessionId: context.sourceSessionId }
          : {}),
        sourceObjectType,
        sourceType: taskSourceType,
        status,
        taskDescription: taskDescription.trim(),
        taskTitle: taskTitle.trim(),
      });

      onCreated(task);
    } catch (error) {
      setSubmitError(
        getRequestErrorMessage(error, I18N.carbonAgent.projectTaskCreateFailed),
      );
      setSubmitting(false);
    }
  };

  const selectSuffixIcon = (
    <Icon
      className={style.projectTaskDialogChevron}
      src={taskDialogChevronIcon}
    />
  );

  return createPortal(
    <div className={style.projectTaskDialogBackdrop}>
      <button
        className={style.projectTaskDialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={submitting}
        onClick={onCancel}
      />
      <form
        className={style.projectTaskDialog}
        role='dialog'
        aria-modal='true'
        aria-label={I18N.carbonAgent.projectTaskCreateTitle}
        aria-busy={optionsLoading || submitting}
        onSubmit={event => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className={style.projectTaskDialogHeader}>
          <h2>{I18N.carbonAgent.projectTaskCreateTitle}</h2>
          <button
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={submitting}
            onClick={onCancel}
          >
            <Icon src={taskDialogCloseIcon} />
          </button>
        </div>

        <div className={style.projectTaskDialogBody}>
          {optionsError ? (
            <div className={style.projectTaskDialogError} role='alert'>
              <span>{optionsError}</span>
              <button
                type='button'
                onClick={() => setRetryKey(value => value + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          ) : null}

          <div className={style.projectTaskDialogField}>
            <label htmlFor='carbon-agent-project-task-title'>
              <b aria-hidden='true'>*</b>
              {I18N.carbonAgent.projectTaskTitle}
            </label>
            <input
              id='carbon-agent-project-task-title'
              ref={titleInputRef}
              value={taskTitle}
              maxLength={TASK_TITLE_MAX_LENGTH}
              placeholder={I18N.carbonAgent.pleaseEnter}
              disabled={submitting}
              onChange={event =>
                setTaskTitle(
                  event.currentTarget.value.slice(0, TASK_TITLE_MAX_LENGTH),
                )
              }
            />
          </div>

          <div className={style.projectTaskDialogField}>
            <label htmlFor='carbon-agent-project-task-description'>
              {I18N.carbonAgent.projectTaskDescription}
            </label>
            <div className={style.projectTaskDialogTextarea}>
              <textarea
                id='carbon-agent-project-task-description'
                value={taskDescription}
                maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                placeholder={I18N.carbonAgent.pleaseEnter}
                disabled={submitting}
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
              <Icon src={taskDialogResizerIcon} />
            </div>
          </div>

          <div className={style.projectTaskDialogGrid}>
            <div className={style.projectTaskDialogField}>
              <label htmlFor='carbon-agent-project-task-related-object'>
                <b aria-hidden='true'>*</b>
                {I18N.carbonAgent.projectTaskRelatedObject}
              </label>
              <Select
                id='carbon-agent-project-task-related-object'
                className={style.projectTaskDialogSelect}
                disabled={Boolean(context) || optionsLoading || submitting}
                options={relatedObjectOptions}
                placeholder={I18N.carbonAgent.pleaseSelect}
                popupClassName={style.projectTaskDialogPopup}
                suffixIcon={selectSuffixIcon}
                value={sourceObjectType}
                onChange={setSourceObjectType}
              />
            </div>
            <div className={style.projectTaskDialogField}>
              <label htmlFor='carbon-agent-project-task-status'>
                <b aria-hidden='true'>*</b>
                {I18N.carbonAgent.projectTaskStatus}
              </label>
              <Select
                id='carbon-agent-project-task-status'
                className={style.projectTaskDialogSelect}
                disabled={optionsLoading || submitting}
                options={statusOptions}
                placeholder={I18N.carbonAgent.pleaseSelect}
                popupClassName={style.projectTaskDialogPopup}
                suffixIcon={selectSuffixIcon}
                value={status}
                onChange={setStatus}
              />
            </div>
            <div className={style.projectTaskDialogField}>
              <label htmlFor='carbon-agent-project-task-assignee'>
                <b aria-hidden='true'>*</b>
                {I18N.carbonAgent.projectTaskAssignee}
              </label>
              <Select
                id='carbon-agent-project-task-assignee'
                className={style.projectTaskDialogSelect}
                disabled={optionsLoading || submitting}
                loading={optionsLoading}
                options={memberOptions}
                placeholder={I18N.carbonAgent.pleaseSelect}
                popupClassName={style.projectTaskDialogPopup}
                suffixIcon={selectSuffixIcon}
                value={assigneeMemberId}
                onChange={setAssigneeMemberId}
              />
            </div>
            <div className={style.projectTaskDialogField}>
              <label htmlFor='carbon-agent-project-task-due-time'>
                {I18N.carbonAgent.projectTaskDueTime}
              </label>
              <DatePicker
                id='carbon-agent-project-task-due-time'
                allowClear
                className={style.projectTaskDialogDatePicker}
                disabled={submitting}
                format='YYYY-MM-DD HH:mm:ss'
                inputReadOnly
                placeholder={I18N.carbonAgent.pleaseSelect}
                popupClassName={style.projectTaskDialogPopup}
                showTime={{ format: 'HH:mm:ss' }}
                suffixIcon={
                  <Icon
                    className={style.projectTaskDialogCalendar}
                    src={taskDialogCalendarIcon}
                  />
                }
                value={dueTime}
                onChange={setDueTime}
              />
            </div>
          </div>

          {submitError ? (
            <div className={style.projectTaskDialogError} role='alert'>
              {submitError}
            </div>
          ) : null}
        </div>

        <div className={style.projectTaskDialogFooter}>
          <button
            className={style.projectTaskDialogCancel}
            type='button'
            disabled={submitting}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={style.projectTaskDialogConfirm}
            type='submit'
            disabled={!canSubmit}
          >
            {submitting
              ? I18N.carbonAgent.projectTaskCreating
              : I18N.carbonAgent.projectTaskCreateAction}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default ProjectTaskCreateDialog;
