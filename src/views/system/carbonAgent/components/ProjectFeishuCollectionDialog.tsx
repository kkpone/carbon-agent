import projectDialogCloseIcon from '@src/assets/images/carbonAgent/icons/project-dialog-close.svg';
import projectMemberLink from '@src/assets/images/carbonAgent/icons/project-member-link.svg';
import projectSelectChevronIcon from '@src/assets/images/carbonAgent/icons/project-select-chevron.svg';
import I18N from '@src/lang/I18N';
import { withCurrentLocalePrefix } from '@src/router/localePath';
import { RouteMaps } from '@src/router/route-paths';
import { copyToClipboard } from '@src/utils/clipboard';
import { Select, Switch, message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';
import style from './ProjectFeishuCollectionDialog.module.less';
import {
  type FeishuGroupMemberRole,
  type ProjectFeishuGroupState,
  createProjectFeishuGroup,
  getProjectFeishuGroupState,
  toggleProjectFeishuCollection,
  updateProjectFeishuDefaultTask,
} from '../feishuCollectionStore';
import type { AgentProjectMember } from '../service';

export type FeishuTaskOption = {
  taskId: string;
  taskTitle: string;
};

type ProjectFeishuCollectionDialogProps = {
  open: boolean;
  projectId: string;
  projectMembers: AgentProjectMember[];
  projectName: string;
  tasks: FeishuTaskOption[];
  onCancel: () => void;
  onGroupStateChange: (state: ProjectFeishuGroupState | null) => void;
};

type SetupTab = 'bind' | 'create';

const UNSPECIFIED_TASK_VALUE = '__unspecified__';

const getFeishuMemberRoleBadgeText = (role: FeishuGroupMemberRole) => {
  if (role === 'bot') {
    return I18N.carbonAgent.feishuCollectBotTag;
  }

  if (role === 'customer') {
    return I18N.carbonAgent.feishuCollectCustomerTag;
  }

  if (role === 'owner') {
    return I18N.carbonAgent.feishuCollectOwnerTag;
  }

  return I18N.carbonAgent.feishuCollectStaffTag;
};

const ProjectFeishuCollectionDialog = ({
  open,
  projectId,
  projectMembers,
  projectName,
  tasks,
  onCancel,
  onGroupStateChange,
}: ProjectFeishuCollectionDialogProps) => {
  const [groupState, setGroupState] = useState<ProjectFeishuGroupState | null>(
    () => getProjectFeishuGroupState(projectId),
  );
  const [activeTab, setActiveTab] = useState<SetupTab>('create');
  const [groupName, setGroupName] = useState('');
  const [selectedExistingGroup, setSelectedExistingGroup] = useState('');
  const [ownerMemberId, setOwnerMemberId] = useState('');
  const [defaultTaskId, setDefaultTaskId] = useState(UNSPECIFIED_TASK_VALUE);
  const [creating, setCreating] = useState(false);
  const [creatingStep, setCreatingStep] = useState(0);

  const defaultGroupName = useMemo(
    () => `${projectName}${I18N.carbonAgent.feishuCollectDefaultGroupSuffix}`,
    [projectName],
  );

  const existingGroupOptions = useMemo(
    () => [
      {
        label: I18N.template(
          I18N.carbonAgent.feishuCollectExistingGroupOption1,
          { val1: projectName },
        ),
        value: I18N.template(
          I18N.carbonAgent.feishuCollectExistingGroupOption1,
          { val1: projectName },
        ),
      },
      {
        label: I18N.template(
          I18N.carbonAgent.feishuCollectExistingGroupOption2,
          { val1: projectName },
        ),
        value: I18N.template(
          I18N.carbonAgent.feishuCollectExistingGroupOption2,
          { val1: projectName },
        ),
      },
    ],
    [projectName],
  );

  const ownerOptions = useMemo(() => {
    if (!projectMembers.length) {
      return [
        {
          label: I18N.carbonAgent.feishuCollectOwnerDefault,
          value: 'owner_default',
        },
      ];
    }

    return projectMembers.map(member => ({
      label: member.userName,
      value: String(member.memberId),
    }));
  }, [projectMembers]);

  const taskOptions = useMemo(
    () => [
      {
        label: I18N.carbonAgent.feishuCollectTaskUnspecified,
        value: UNSPECIFIED_TASK_VALUE,
      },
      ...tasks.map(task => ({
        label: task.taskTitle,
        value: String(task.taskId),
      })),
    ],
    [tasks],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const current = getProjectFeishuGroupState(projectId);
    setGroupState(current);
    setCreating(false);
    setCreatingStep(0);
    setGroupName(current?.groupName || defaultGroupName);
    setSelectedExistingGroup(
      existingGroupOptions[0]?.value || defaultGroupName,
    );

    const defaultOwner =
      projectMembers.find(member => member.currentUser) ||
      projectMembers.find(member => member.role === 'owner') ||
      projectMembers[0];
    setOwnerMemberId(
      current?.ownerMemberId ||
        (defaultOwner ? String(defaultOwner.memberId) : 'owner_default'),
    );

    if (current?.defaultTaskId) {
      setDefaultTaskId(current.defaultTaskId);
    } else if (tasks.length === 1) {
      setDefaultTaskId(String(tasks[0].taskId));
    } else {
      setDefaultTaskId(UNSPECIFIED_TASK_VALUE);
    }
  }, [
    defaultGroupName,
    existingGroupOptions,
    open,
    projectId,
    projectMembers,
    tasks,
  ]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !creating) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [creating, onCancel, open]);

  if (!open) {
    return null;
  }

  const handleConfirmCreateOrBind = () => {
    if (creating) {
      return;
    }

    const targetGroupName =
      activeTab === 'create'
        ? groupName.trim() || defaultGroupName
        : selectedExistingGroup.trim() || defaultGroupName;
    const selectedOwner = ownerOptions.find(
      option => option.value === ownerMemberId,
    );
    const resolvedTaskId =
      defaultTaskId === UNSPECIFIED_TASK_VALUE ? '' : defaultTaskId;
    const resolvedTaskTitle =
      tasks.find(item => String(item.taskId) === resolvedTaskId)?.taskTitle ||
      '';

    setCreating(true);
    setCreatingStep(1);

    window.setTimeout(() => {
      setCreatingStep(2);
    }, 320);

    window.setTimeout(() => {
      setCreatingStep(3);
    }, 640);

    window.setTimeout(() => {
      const created = createProjectFeishuGroup({
        defaultTaskId: resolvedTaskId,
        defaultTaskTitle: resolvedTaskTitle,
        groupName: targetGroupName,
        mode: activeTab,
        ownerMemberId,
        ownerName:
          selectedOwner?.label || I18N.carbonAgent.feishuCollectOwnerDefault,
        projectId,
        projectMembers,
        projectName,
      });

      setCreating(false);
      setGroupState(created);
      onGroupStateChange(created);
      antdMessage.success(I18N.carbonAgent.feishuCollectCreatedSuccess);
    }, 950);
  };

  const handleToggleCollecting = (checked: boolean) => {
    const nextState = toggleProjectFeishuCollection(projectId, checked);

    if (nextState) {
      setGroupState(nextState);
      onGroupStateChange(nextState);
    }
  };

  const handleDefaultTaskChange = (nextValue: string) => {
    setDefaultTaskId(nextValue);

    if (!groupState) {
      return;
    }

    const resolvedTaskId =
      nextValue === UNSPECIFIED_TASK_VALUE ? '' : nextValue;
    const resolvedTaskTitle =
      tasks.find(item => String(item.taskId) === resolvedTaskId)?.taskTitle ||
      '';
    const nextState = updateProjectFeishuDefaultTask(
      projectId,
      resolvedTaskId,
      resolvedTaskTitle,
    );

    if (nextState) {
      setGroupState(nextState);
      onGroupStateChange(nextState);
    }
  };

  const getSimulatorUrl = () => {
    const targetPath = withCurrentLocalePrefix(
      RouteMaps.carbonAgentFeishuSimulator,
    );
    const url = new URL(targetPath, window.location.origin);
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('projectName', projectName);
    return url.toString();
  };

  const handleCopyGroupInviteLink = () => {
    if (!groupState) {
      return;
    }

    copyToClipboard(getSimulatorUrl())
      .then(() => {
        antdMessage.success(I18N.carbonAgent.feishuCollectGroupLinkCopied);
      })
      .catch(() => {
        antdMessage.error(I18N.carbonAgent.projectInviteLinkCopyFailed);
      });
  };

  const handleOpenStandaloneFeishu = () => {
    window.open(getSimulatorUrl(), '_blank', 'noopener,noreferrer');
  };

  const suffixChevron = <Icon src={projectSelectChevronIcon} />;

  return createPortal(
    <div className={style.backdrop}>
      <button
        className={style.scrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={creating}
        onClick={onCancel}
      />
      <div
        className={style.dialog}
        role='dialog'
        aria-modal='true'
        aria-label={I18N.carbonAgent.feishuCollectTitle}
      >
        <header className={style.header}>
          <div className={style.headerTitleRow}>
            <h2>{I18N.carbonAgent.feishuCollectTitle}</h2>
            {groupState ? (
              <span
                className={classNames(style.statusBadge, {
                  [style.statusBadgeActive]: groupState.collectingEnabled,
                  [style.statusBadgePaused]: !groupState.collectingEnabled,
                })}
              >
                {groupState.collectingEnabled
                  ? I18N.carbonAgent.feishuCollectStatusActive
                  : I18N.carbonAgent.feishuCollectStatusPaused}
              </span>
            ) : null}
          </div>
          <button
            className={style.closeBtn}
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={creating}
            onClick={onCancel}
          >
            <Icon src={projectDialogCloseIcon} />
          </button>
        </header>

        {!groupState ? (
          <>
            <div className={style.body}>
              <div className={style.tabs} role='tablist'>
                <button
                  className={classNames(style.tabBtn, {
                    [style.tabBtnActive]: activeTab === 'create',
                  })}
                  type='button'
                  role='tab'
                  aria-selected={activeTab === 'create'}
                  disabled={creating}
                  onClick={() => setActiveTab('create')}
                >
                  {I18N.carbonAgent.feishuCollectTabCreate}
                </button>
                <button
                  className={classNames(style.tabBtn, {
                    [style.tabBtnActive]: activeTab === 'bind',
                  })}
                  type='button'
                  role='tab'
                  aria-selected={activeTab === 'bind'}
                  disabled={creating}
                  onClick={() => setActiveTab('bind')}
                >
                  {I18N.carbonAgent.feishuCollectTabBind}
                </button>
              </div>

              <div className={style.projectBanner}>
                {I18N.template(I18N.carbonAgent.feishuCollectCurrentProject, {
                  val1: projectName,
                })}
              </div>

              <div className={style.confirmPromptBox}>
                {I18N.carbonAgent.feishuCollectConfirmPrompt}
              </div>

              {creating ? (
                <div className={style.creatingWrap} aria-live='polite'>
                  <h3 className={style.creatingTitle}>
                    {I18N.carbonAgent.feishuCollectCreatingTitle}
                  </h3>
                  <ol className={style.stepList}>
                    <li
                      className={classNames(style.stepItem, {
                        [style.stepItemDone]: creatingStep >= 1,
                      })}
                    >
                      <span className={style.stepBadge}>1</span>
                      <div className={style.stepText}>
                        <strong>
                          {I18N.carbonAgent.feishuCollectStepCreateTitle}
                        </strong>
                        <span>
                          {I18N.carbonAgent.feishuCollectStepCreateDesc}
                        </span>
                      </div>
                    </li>
                    <li
                      className={classNames(style.stepItem, {
                        [style.stepItemDone]: creatingStep >= 2,
                      })}
                    >
                      <span className={style.stepBadge}>2</span>
                      <div className={style.stepText}>
                        <strong>
                          {I18N.carbonAgent.feishuCollectStepTransferTitle}
                        </strong>
                        <span>
                          {I18N.carbonAgent.feishuCollectStepTransferDesc}
                        </span>
                      </div>
                    </li>
                    <li
                      className={classNames(style.stepItem, {
                        [style.stepItemDone]: creatingStep >= 3,
                      })}
                    >
                      <span className={style.stepBadge}>3</span>
                      <div className={style.stepText}>
                        <strong>
                          {I18N.carbonAgent.feishuCollectStepReadyTitle}
                        </strong>
                        <span>
                          {I18N.carbonAgent.feishuCollectStepReadyDesc}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              ) : (
                <>
                  {activeTab === 'create' ? (
                    <div className={style.field}>
                      <label htmlFor='feishu-collect-group-name'>
                        {I18N.carbonAgent.feishuCollectGroupName}
                      </label>
                      <input
                        id='feishu-collect-group-name'
                        className={style.textInput}
                        value={groupName}
                        maxLength={50}
                        onChange={event =>
                          setGroupName(event.currentTarget.value)
                        }
                      />
                    </div>
                  ) : (
                    <div className={style.field}>
                      <label htmlFor='feishu-collect-existing-group'>
                        {I18N.carbonAgent.feishuCollectSelectExistingGroup}
                      </label>
                      <Select
                        id='feishu-collect-existing-group'
                        className={style.select}
                        options={existingGroupOptions}
                        suffixIcon={suffixChevron}
                        value={selectedExistingGroup}
                        onChange={setSelectedExistingGroup}
                      />
                      <span className={style.infoHint}>
                        <i className={style.infoDot} aria-hidden='true'>
                          i
                        </i>
                        {I18N.carbonAgent.feishuCollectBindRuleHint}
                      </span>
                    </div>
                  )}

                  <div className={style.field}>
                    <label htmlFor='feishu-collect-group-owner'>
                      {I18N.carbonAgent.feishuCollectGroupOwner}
                    </label>
                    <Select
                      id='feishu-collect-group-owner'
                      className={style.select}
                      options={ownerOptions}
                      suffixIcon={suffixChevron}
                      value={ownerMemberId}
                      onChange={setOwnerMemberId}
                    />
                  </div>

                  <div className={style.field}>
                    <span className={style.fieldLabel}>
                      {I18N.carbonAgent.feishuCollectAutoJoinLabel}
                    </span>
                    <div className={style.autoJoinList}>
                      <span
                        className={classNames(
                          style.memberChip,
                          style.memberChipBot,
                        )}
                      >
                        <strong>{I18N.carbonAgent.feishuCollectBotName}</strong>
                        <span className={style.memberRoleBadge}>
                          {I18N.carbonAgent.feishuCollectBotTag}
                        </span>
                      </span>
                      {ownerOptions.map(option => (
                        <span className={style.memberChip} key={option.value}>
                          <span>{option.label}</span>
                          <span className={style.memberRoleBadge}>
                            {I18N.carbonAgent.feishuCollectStaffTag}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={style.field}>
                    <label htmlFor='feishu-collect-default-task'>
                      {I18N.carbonAgent.feishuCollectDefaultTask}
                    </label>
                    <Select
                      id='feishu-collect-default-task'
                      className={style.select}
                      options={taskOptions}
                      suffixIcon={suffixChevron}
                      value={defaultTaskId}
                      onChange={setDefaultTaskId}
                    />
                  </div>

                  <div className={style.infoHint}>
                    <i className={style.infoDot} aria-hidden='true'>
                      i
                    </i>
                    <span>{I18N.carbonAgent.feishuCollectFirstAuthHint}</span>
                  </div>
                </>
              )}
            </div>

            <footer className={style.footer}>
              <div className={style.footerActions}>
                <button
                  className={style.cancelBtn}
                  type='button'
                  disabled={creating}
                  onClick={onCancel}
                >
                  {I18N.carbonAgent.cancel}
                </button>
                <button
                  className={style.confirmBtn}
                  type='button'
                  disabled={creating}
                  onClick={handleConfirmCreateOrBind}
                >
                  {activeTab === 'create'
                    ? I18N.carbonAgent.feishuCollectCreateAndBind
                    : I18N.carbonAgent.feishuCollectBindConfirm}
                </button>
              </div>
              <p className={style.footerHint}>
                {I18N.carbonAgent.feishuCollectFooterHint}
              </p>
            </footer>
          </>
        ) : (
          <>
            <div className={style.body}>
              <div className={style.workbenchTopBar}>
                <div className={style.workbenchTopMeta}>
                  <strong>{groupState.groupName}</strong>
                  <span>
                    {I18N.template(
                      I18N.carbonAgent.feishuCollectCurrentProject,
                      {
                        val1: projectName,
                      },
                    )}{' '}
                    · {I18N.carbonAgent.feishuCollectGroupOwner}：
                    {groupState.ownerName}
                  </span>
                </div>
                <div className={style.workbenchTopControls}>
                  <div className={style.switchLabel}>
                    <span>
                      {I18N.carbonAgent.feishuCollectCollectionSwitch}
                    </span>
                    <Switch
                      checked={groupState.collectingEnabled}
                      size='small'
                      onChange={handleToggleCollecting}
                    />
                  </div>
                </div>
              </div>

              <div className={style.confirmPromptBox}>
                {I18N.carbonAgent.feishuBoundSummaryHint}
              </div>

              {!groupState.collectingEnabled ? (
                <div className={style.pausedAlert} role='status'>
                  {I18N.carbonAgent.feishuCollectCollectionPausedBanner}
                </div>
              ) : null}

              <div className={style.field}>
                <label htmlFor='feishu-workbench-default-task'>
                  {I18N.carbonAgent.feishuCollectDefaultTask}
                </label>
                <Select
                  id='feishu-workbench-default-task'
                  className={style.select}
                  options={taskOptions}
                  suffixIcon={suffixChevron}
                  value={groupState.defaultTaskId || UNSPECIFIED_TASK_VALUE}
                  onChange={handleDefaultTaskChange}
                />
              </div>

              <div className={style.field}>
                <span className={style.fieldLabel}>
                  {I18N.carbonAgent.feishuCollectMembersSection}
                </span>
                <div className={style.autoJoinList}>
                  {groupState.members.map(member => (
                    <span
                      key={member.id}
                      className={classNames(style.memberChip, {
                        [style.memberChipBot]: member.role === 'bot',
                        [style.memberChipCustomer]: member.role === 'customer',
                      })}
                    >
                      <span>{member.name}</span>
                      <span className={style.memberRoleBadge}>
                        {getFeishuMemberRoleBadgeText(member.role)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <footer className={style.footer}>
              <div className={style.footerActions}>
                <button
                  className={style.cancelBtn}
                  type='button'
                  onClick={handleCopyGroupInviteLink}
                >
                  <img
                    src={projectMemberLink}
                    alt=''
                    aria-hidden='true'
                    width={14}
                    height={14}
                    style={{ marginRight: 6, verticalAlign: 'text-bottom' }}
                  />
                  {I18N.carbonAgent.feishuCollectCopyGroupLink}
                </button>
                <button
                  className={style.confirmBtn}
                  type='button'
                  onClick={handleOpenStandaloneFeishu}
                >
                  {I18N.carbonAgent.feishuOpenGroupChatBtn}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ProjectFeishuCollectionDialog;

