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
  addExternalCustomerToFeishuGroup,
  createProjectFeishuGroup,
  getProjectFeishuGroups,
  removeProjectFeishuGroup,
  toggleProjectFeishuCollection,
  updateProjectFeishuDefaultTask,
  updateProjectFeishuGroupInfo,
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

type DialogViewMode = 'form' | 'list';

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
  const [groups, setGroups] = useState<ProjectFeishuGroupState[]>(() =>
    getProjectFeishuGroups(projectId),
  );
  const [viewMode, setViewMode] = useState<DialogViewMode>(() =>
    getProjectFeishuGroups(projectId).length ? 'list' : 'form',
  );
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerMemberId, setOwnerMemberId] = useState('');
  const [defaultTaskId, setDefaultTaskId] = useState(UNSPECIFIED_TASK_VALUE);
  const [creating, setCreating] = useState(false);
  const [creatingStep, setCreatingStep] = useState(0);
  const [editingChatId, setEditingChatId] = useState<string>('');
  const [editNameValue, setEditNameValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');
  const [inviteInputs, setInviteInputs] = useState<Record<string, string>>({});

  const defaultGroupName = useMemo(
    () => `${projectName}${I18N.carbonAgent.feishuCollectDefaultGroupSuffix}`,
    [projectName],
  );

  const scopePresets = useMemo(
    () => [
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset1Desc,
        id: 'scope_energy',
        name: `${projectName} - ${I18N.carbonAgent.feishuCollectScopePreset1Name}`,
        shortLabel: I18N.carbonAgent.feishuCollectScopePreset1Name,
      },
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset2Desc,
        id: 'scope_bom',
        name: `${projectName} - ${I18N.carbonAgent.feishuCollectScopePreset2Name}`,
        shortLabel: I18N.carbonAgent.feishuCollectScopePreset2Name,
      },
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset3Desc,
        id: 'scope_logistics',
        name: `${projectName} - ${I18N.carbonAgent.feishuCollectScopePreset3Name}`,
        shortLabel: I18N.carbonAgent.feishuCollectScopePreset3Name,
      },
    ],
    [projectName],
  );

  const ownerOptions = useMemo(() => {
    if (!projectMembers.length) {
      return [
        {
          label: I18N.carbonAgent.feishuCollectOwnerDefault,
          rawName: I18N.carbonAgent.feishuCollectOwnerDefault,
          value: 'owner_default',
        },
      ];
    }

    return projectMembers.map(member => ({
      label: member.userName,
      rawName: member.userName,
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

    const currentGroups = getProjectFeishuGroups(projectId);
    setGroups(currentGroups);
    setViewMode(currentGroups.length ? 'list' : 'form');
    setCreating(false);
    setCreatingStep(0);
    setEditingChatId('');

    const nextIndex = currentGroups.length;
    const presetForIndex = scopePresets[nextIndex % scopePresets.length];
    setGroupName(
      nextIndex === 0
        ? scopePresets[0]?.name || defaultGroupName
        : presetForIndex?.name || `${defaultGroupName} #${nextIndex + 1}`,
    );
    setDescription(presetForIndex?.desc || '');

    const defaultOwner =
      projectMembers.find(member => member.currentUser) ||
      projectMembers.find(member => member.role === 'owner') ||
      projectMembers[0];
    setOwnerMemberId(
      defaultOwner ? String(defaultOwner.memberId) : 'owner_default',
    );

    if (tasks.length === 1) {
      setDefaultTaskId(String(tasks[0].taskId));
    } else if (tasks[nextIndex]) {
      setDefaultTaskId(String(tasks[nextIndex].taskId));
    } else {
      setDefaultTaskId(UNSPECIFIED_TASK_VALUE);
    }
  }, [defaultGroupName, open, projectId, projectMembers, scopePresets, tasks]);

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

  const selectedOwnerOption = useMemo(
    () =>
      ownerOptions.find(option => option.value === ownerMemberId) ||
      ownerOptions[0],
    [ownerMemberId, ownerOptions],
  );

  if (!open) {
    return null;
  }

  const handleStartAddAnotherGroup = () => {
    const nextIdx = groups.length;
    const preset = scopePresets[nextIdx % scopePresets.length];
    setGroupName(preset?.name || `${defaultGroupName} #${nextIdx + 1}`);
    setDescription(preset?.desc || '');
    if (tasks[nextIdx]) {
      setDefaultTaskId(String(tasks[nextIdx].taskId));
    } else {
      setDefaultTaskId(UNSPECIFIED_TASK_VALUE);
    }
    setViewMode('form');
  };

  const handleConfirmCreateGroup = () => {
    if (creating) {
      return;
    }

    const targetGroupName = groupName.trim() || defaultGroupName;
    const resolvedTaskId =
      defaultTaskId === UNSPECIFIED_TASK_VALUE ? '' : defaultTaskId;
    const resolvedTaskTitle =
      tasks.find(item => String(item.taskId) === resolvedTaskId)?.taskTitle ||
      '';

    setCreating(true);
    setCreatingStep(1);

    window.setTimeout(() => {
      setCreatingStep(2);
    }, 300);

    window.setTimeout(() => {
      setCreatingStep(3);
    }, 600);

    window.setTimeout(() => {
      const created = createProjectFeishuGroup({
        defaultTaskId: resolvedTaskId,
        defaultTaskTitle: resolvedTaskTitle,
        description,
        groupName: targetGroupName,
        mode: 'create',
        ownerMemberId,
        ownerName:
          selectedOwnerOption?.rawName ||
          I18N.carbonAgent.feishuCollectOwnerDefault,
        projectId,
        projectMembers,
        projectName,
      });

      const latestGroups = getProjectFeishuGroups(projectId);
      setCreating(false);
      setGroups(latestGroups);
      setViewMode('list');
      onGroupStateChange(created);
      antdMessage.success(I18N.carbonAgent.feishuCollectCreatedSuccess);
    }, 900);
  };

  const handleToggleCollecting = (chatId: string, checked: boolean) => {
    const nextState = toggleProjectFeishuCollection(
      projectId,
      checked,
      chatId,
    );

    if (nextState) {
      const latestGroups = getProjectFeishuGroups(projectId);
      setGroups(latestGroups);
      onGroupStateChange(nextState);
    }
  };

  const handleDefaultTaskChange = (chatId: string, nextValue: string) => {
    const resolvedTaskId =
      nextValue === UNSPECIFIED_TASK_VALUE ? '' : nextValue;
    const resolvedTaskTitle =
      tasks.find(item => String(item.taskId) === resolvedTaskId)?.taskTitle ||
      '';
    const nextState = updateProjectFeishuDefaultTask(
      projectId,
      resolvedTaskId,
      resolvedTaskTitle,
      chatId,
    );

    if (nextState) {
      const latestGroups = getProjectFeishuGroups(projectId);
      setGroups(latestGroups);
      onGroupStateChange(nextState);
    }
  };

  const handleStartEditGroup = (group: ProjectFeishuGroupState) => {
    setEditingChatId(group.chatId);
    setEditNameValue(group.groupName);
    setEditDescValue(group.description || '');
  };

  const handleSaveEditGroup = (chatId: string) => {
    const updated = updateProjectFeishuGroupInfo({
      chatId,
      description: editDescValue,
      groupName: editNameValue,
      projectId,
    });

    if (updated) {
      const latestGroups = getProjectFeishuGroups(projectId);
      setGroups(latestGroups);
      setEditingChatId('');
      onGroupStateChange(updated);
      antdMessage.success(I18N.carbonAgent.feishuCollectGroupUpdatedToast);
    }
  };

  const handleDeleteGroup = (group: ProjectFeishuGroupState) => {
    const nextGroups = removeProjectFeishuGroup(projectId, group.chatId);
    setGroups(nextGroups);
    onGroupStateChange(nextGroups[0] || null);
    antdMessage.success(
      I18N.template(I18N.carbonAgent.feishuCollectGroupRemovedToast, {
        val1: group.groupName,
      }),
    );

    if (!nextGroups.length) {
      setViewMode('form');
    }
  };

  const handleInviteCustomerInGroup = (group: ProjectFeishuGroupState) => {
    const inputVal = (inviteInputs[group.chatId] || '').trim();
    if (!inputVal) {
      return;
    }

    const updated = addExternalCustomerToFeishuGroup(
      projectId,
      inputVal,
      group.ownerName,
      group.chatId,
    );

    if (updated) {
      setInviteInputs(prev => ({ ...prev, [group.chatId]: '' }));
      const latestGroups = getProjectFeishuGroups(projectId);
      setGroups(latestGroups);
      onGroupStateChange(updated);
      antdMessage.success(
        I18N.template(I18N.carbonAgent.feishuCollectCustomerAdded, {
          val1: inputVal,
        }),
      );
    }
  };

  const getSimulatorUrl = (chatId?: string) => {
    const targetPath = withCurrentLocalePrefix(
      RouteMaps.carbonAgentFeishuSimulator,
    );
    const url = new URL(targetPath, window.location.origin);
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('projectName', projectName);
    if (chatId) {
      url.searchParams.set('chatId', chatId);
    }
    return url.toString();
  };

  const handleCopyGroupInviteLink = (chatId?: string) => {
    copyToClipboard(getSimulatorUrl(chatId))
      .then(() => {
        antdMessage.success(I18N.carbonAgent.feishuCollectGroupLinkCopied);
      })
      .catch(() => {
        antdMessage.error(I18N.carbonAgent.projectInviteLinkCopyFailed);
      });
  };

  const handleOpenStandaloneFeishu = (chatId?: string) => {
    window.open(getSimulatorUrl(chatId), '_blank', 'noopener,noreferrer');
  };

  const suffixChevron = <Icon src={projectSelectChevronIcon} />;
  const activeGroupCount = groups.filter(item => item.collectingEnabled).length;

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
        className={classNames(style.dialog, style.dialogWide)}
        role='dialog'
        aria-modal='true'
        aria-label={I18N.carbonAgent.feishuCollectTitle}
      >
        <header className={style.header}>
          <div className={style.headerTitleRow}>
            <h2>{I18N.carbonAgent.feishuCollectTitle}</h2>
            {groups.length ? (
              <span
                className={classNames(style.statusBadge, {
                  [style.statusBadgeActive]: activeGroupCount > 0,
                  [style.statusBadgePaused]: activeGroupCount === 0,
                })}
              >
                {activeGroupCount > 0
                  ? I18N.template(
                      I18N.carbonAgent.feishuCollectConnectedMulti,
                      {
                        val1: activeGroupCount,
                      },
                    )
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

        {viewMode === 'form' ? (
          <>
            <div className={style.body}>
              {groups.length ? (
                <div className={style.groupListTopBar}>
                  <span>
                    {I18N.template(
                      I18N.carbonAgent.feishuCollectCurrentProject,
                      {
                        val1: projectName,
                      },
                    )}
                  </span>
                  <button
                    className={style.secondaryBtn}
                    type='button'
                    disabled={creating}
                    onClick={() => setViewMode('list')}
                  >
                    {I18N.carbonAgent.feishuCollectBackToGroupListBtn}
                  </button>
                </div>
              ) : (
                <div className={style.projectBanner}>
                  {I18N.template(
                    I18N.carbonAgent.feishuCollectCurrentProject,
                    {
                      val1: projectName,
                    },
                  )}
                </div>
              )}

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
                  <div className={style.field}>
                    <span className={style.fieldLabel}>
                      {I18N.carbonAgent.feishuCollectScopeQuickLabel}
                    </span>
                    <div className={style.scopeChipRow}>
                      {scopePresets.map(preset => (
                        <button
                          key={preset.id}
                          className={style.scopeChip}
                          type='button'
                          onClick={() => {
                            setGroupName(preset.name);
                            setDescription(preset.desc);
                          }}
                        >
                          + {preset.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={style.field}>
                    <label htmlFor='feishu-collect-group-name'>
                      {I18N.carbonAgent.feishuCollectGroupName}
                    </label>
                    <input
                      id='feishu-collect-group-name'
                      className={style.textInput}
                      value={groupName}
                      maxLength={60}
                      onChange={event =>
                        setGroupName(event.currentTarget.value)
                      }
                    />
                  </div>

                  <div className={style.field}>
                    <label htmlFor='feishu-collect-group-desc'>
                      {I18N.carbonAgent.feishuCollectDescriptionLabel}
                    </label>
                    <input
                      id='feishu-collect-group-desc'
                      className={style.textInput}
                      value={description}
                      maxLength={100}
                      placeholder={
                        I18N.carbonAgent.feishuCollectDescriptionPlaceholder
                      }
                      onChange={event =>
                        setDescription(event.currentTarget.value)
                      }
                    />
                  </div>

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
                          <span>{option.rawName}</span>
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
                  onClick={
                    groups.length ? () => setViewMode('list') : onCancel
                  }
                >
                  {groups.length
                    ? I18N.carbonAgent.feishuCollectBackToGroupListBtn
                    : I18N.carbonAgent.cancel}
                </button>
                <button
                  className={style.confirmBtn}
                  type='button'
                  disabled={creating}
                  onClick={handleConfirmCreateGroup}
                >
                  {I18N.carbonAgent.feishuCollectCreateAndBind}
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
              <div className={style.groupListTopBar}>
                <h3>
                  {I18N.template(
                    I18N.carbonAgent.feishuCollectGroupListTitle,
                    {
                      val1: groups.length,
                    },
                  )}
                </h3>
                <button
                  className={style.primarySmallBtn}
                  type='button'
                  onClick={handleStartAddAnotherGroup}
                >
                  {I18N.carbonAgent.feishuCollectAddMoreGroupBtn}
                </button>
              </div>

              <div className={style.confirmPromptBox}>
                {I18N.carbonAgent.feishuBoundSummaryHint}
              </div>

              <div className={style.groupCardList}>
                {groups.map((group, index) => {
                  const isEditing = editingChatId === group.chatId;

                  return (
                    <div key={group.chatId} className={style.groupCard}>
                      <div className={style.groupCardHeader}>
                        <div className={style.groupCardTitleCol}>
                          {isEditing ? (
                            <div className={style.apiGrid}>
                              <input
                                className={style.textInput}
                                value={editNameValue}
                                maxLength={60}
                                placeholder={
                                  I18N.carbonAgent.feishuCollectGroupName
                                }
                                onChange={event =>
                                  setEditNameValue(event.currentTarget.value)
                                }
                              />
                              <input
                                className={style.textInput}
                                value={editDescValue}
                                maxLength={100}
                                placeholder={
                                  I18N.carbonAgent
                                    .feishuCollectDescriptionPlaceholder
                                }
                                onChange={event =>
                                  setEditDescValue(event.currentTarget.value)
                                }
                              />
                            </div>
                          ) : (
                            <>
                              <div className={style.groupCardTitleLine}>
                                <span
                                  className={classNames(
                                    style.statusBadge,
                                    style.statusBadgeActive,
                                  )}
                                >
                                  #{index + 1}
                                </span>
                                <strong>{group.groupName}</strong>
                              </div>
                              {group.description ? (
                                <p className={style.groupCardDesc}>
                                  {group.description}
                                </p>
                              ) : null}
                            </>
                          )}
                          <span className={style.groupCardDesc}>
                            {I18N.carbonAgent.feishuCollectGroupOwner}：
                            {group.ownerName} ·{' '}
                            {I18N.template(
                              I18N.carbonAgent.feishuCollectSyncedFilesTitle,
                              {
                                val1: group.files.length,
                              },
                            )}
                          </span>
                        </div>

                        <div className={style.switchLabel}>
                          <span>
                            {I18N.carbonAgent.feishuCollectCollectionSwitch}
                          </span>
                          <Switch
                            checked={group.collectingEnabled}
                            size='small'
                            onChange={checked =>
                              handleToggleCollecting(group.chatId, checked)
                            }
                          />
                        </div>
                      </div>

                      {!group.collectingEnabled ? (
                        <div className={style.pausedAlert} role='status'>
                          {I18N.carbonAgent.feishuCollectCollectionPausedBanner}
                        </div>
                      ) : null}

                      <div className={style.apiGrid}>
                        <div className={style.apiField}>
                          <label>
                            {I18N.carbonAgent.feishuCollectDefaultTask}
                          </label>
                          <Select
                            className={style.select}
                            options={taskOptions}
                            suffixIcon={suffixChevron}
                            value={
                              group.defaultTaskId || UNSPECIFIED_TASK_VALUE
                            }
                            onChange={val =>
                              handleDefaultTaskChange(group.chatId, val)
                            }
                          />
                        </div>

                        <div className={style.apiField}>
                          <label>
                            {I18N.carbonAgent.feishuCollectInviteCustomer}
                          </label>
                          <div className={style.inviteCustomerRow}>
                            <input
                              className={style.textInput}
                              value={inviteInputs[group.chatId] || ''}
                              placeholder={
                                I18N.carbonAgent
                                  .feishuCollectCustomerNamePlaceholder
                              }
                              onChange={event => {
                                const val = event.currentTarget.value;
                                setInviteInputs(prev => ({
                                  ...prev,
                                  [group.chatId]: val,
                                }));
                              }}
                              onKeyDown={event => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  handleInviteCustomerInGroup(group);
                                }
                              }}
                            />
                            <button
                              className={style.secondaryBtn}
                              type='button'
                              disabled={!(inviteInputs[group.chatId] || '').trim()}
                              onClick={() => handleInviteCustomerInGroup(group)}
                            >
                              {I18N.carbonAgent.feishuCollectAddCustomerBtn}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={style.apiField}>
                        <label>
                          {I18N.carbonAgent.feishuCollectMembersSection}（
                          {group.members.length}）
                        </label>
                        <div className={style.autoJoinList}>
                          {group.members.map(member => (
                            <span
                              key={member.id}
                              className={classNames(style.memberChip, {
                                [style.memberChipBot]: member.role === 'bot',
                                [style.memberChipCustomer]:
                                  member.role === 'customer',
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

                      <div className={style.groupCardFooter}>
                        <div className={style.groupCardBtnGroup}>
                          {isEditing ? (
                            <>
                              <button
                                className={style.primarySmallBtn}
                                type='button'
                                onClick={() => handleSaveEditGroup(group.chatId)}
                              >
                                {I18N.carbonAgent.feishuCollectSaveGroupBtn}
                              </button>
                              <button
                                className={style.secondaryBtn}
                                type='button'
                                onClick={() => setEditingChatId('')}
                              >
                                {I18N.carbonAgent.cancel}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={style.secondaryBtn}
                                type='button'
                                onClick={() => handleStartEditGroup(group)}
                              >
                                {I18N.carbonAgent.feishuCollectEditGroupBtn}
                              </button>
                              <button
                                className={style.secondaryBtn}
                                type='button'
                                onClick={() => handleDeleteGroup(group)}
                              >
                                {I18N.carbonAgent.feishuCollectDeleteGroupBtn}
                              </button>
                            </>
                          )}
                        </div>

                        <div className={style.groupCardBtnGroup}>
                          <button
                            className={style.secondaryBtn}
                            type='button'
                            onClick={() =>
                              handleCopyGroupInviteLink(group.chatId)
                            }
                          >
                            <img
                              src={projectMemberLink}
                              alt=''
                              aria-hidden='true'
                              width={14}
                              height={14}
                            />
                            {I18N.carbonAgent.feishuCollectCopyGroupLink}
                          </button>
                          <button
                            className={style.primarySmallBtn}
                            type='button'
                            onClick={() =>
                              handleOpenStandaloneFeishu(group.chatId)
                            }
                          >
                            {I18N.carbonAgent.feishuOpenGroupChatBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ProjectFeishuCollectionDialog;

