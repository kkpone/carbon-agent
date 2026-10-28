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
  FEISHU_BOT_APPLINK_URL,
  FEISHU_BOT_APP_ID,
  type FeishuAddMemberPermission,
  type FeishuExternalP2pContact,
  type FeishuGroupMemberRole,
  type FeishuGroupMessageType,
  type FeishuMembershipApproval,
  type FeishuShareCardPermission,
  type ProjectFeishuGroupState,
  buildInternalOpenId,
  createProjectFeishuGroup,
  getAuthorizedExternalP2pContacts,
  getProjectFeishuGroups,
  registerExternalClientViaBotP2p,
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
  const [activeTab, setActiveTab] = useState<SetupTab>('create');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExistingGroup, setSelectedExistingGroup] = useState('');
  const [ownerMemberId, setOwnerMemberId] = useState('');
  const [defaultTaskId, setDefaultTaskId] = useState(UNSPECIFIED_TASK_VALUE);
  const [setBotManager, setSetBotManager] = useState(true);
  const [groupMessageType, setGroupMessageType] =
    useState<FeishuGroupMessageType>('chat');
  const [membershipApproval, setMembershipApproval] =
    useState<FeishuMembershipApproval>('no_approval_required');
  const [addMemberPermission, setAddMemberPermission] =
    useState<FeishuAddMemberPermission>('all_members');
  const [shareCardPermission, setShareCardPermission] =
    useState<FeishuShareCardPermission>('allowed');
  const [p2pContacts, setP2pContacts] = useState<FeishuExternalP2pContact[]>(
    () => getAuthorizedExternalP2pContacts(),
  );
  const [selectedExternalOpenIds, setSelectedExternalOpenIds] = useState<
    string[]
  >([]);
  const [showApiPreview, setShowApiPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingStep, setCreatingStep] = useState(0);

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
      const openId = buildInternalOpenId(
        'owner_default',
        I18N.carbonAgent.feishuCollectOwnerDefault,
      );
      return [
        {
          label: `${I18N.carbonAgent.feishuCollectOwnerDefault} (${openId})`,
          openId,
          rawName: I18N.carbonAgent.feishuCollectOwnerDefault,
          value: 'owner_default',
        },
      ];
    }

    return projectMembers.map(member => {
      const openId = buildInternalOpenId(member.memberId, member.userName);
      return {
        label: `${member.userName} (${openId})`,
        openId,
        rawName: member.userName,
        value: String(member.memberId),
      };
    });
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
    const contacts = getAuthorizedExternalP2pContacts();
    setGroups(currentGroups);
    setP2pContacts(contacts);
    setViewMode(currentGroups.length ? 'list' : 'form');
    setCreating(false);
    setCreatingStep(0);

    const nextIndex = currentGroups.length;
    const presetForIndex = scopePresets[nextIndex % scopePresets.length];
    setGroupName(
      nextIndex === 0
        ? scopePresets[0]?.name || defaultGroupName
        : presetForIndex?.name || `${defaultGroupName} #${nextIndex + 1}`,
    );
    setDescription(presetForIndex?.desc || '');
    setSelectedExistingGroup(
      existingGroupOptions[0]?.value || defaultGroupName,
    );

    const defaultOwner =
      projectMembers.find(member => member.currentUser) ||
      projectMembers.find(member => member.role === 'owner') ||
      projectMembers[0];
    setOwnerMemberId(
      defaultOwner ? String(defaultOwner.memberId) : 'owner_default',
    );
    setSelectedExternalOpenIds(
      contacts[0]?.openId ? [contacts[0].openId] : [],
    );

    if (tasks.length === 1) {
      setDefaultTaskId(String(tasks[0].taskId));
    } else if (tasks[nextIndex]) {
      setDefaultTaskId(String(tasks[nextIndex].taskId));
    } else {
      setDefaultTaskId(UNSPECIFIED_TASK_VALUE);
    }
  }, [
    defaultGroupName,
    existingGroupOptions,
    open,
    projectId,
    projectMembers,
    scopePresets,
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

  const selectedOwnerOption = useMemo(
    () =>
      ownerOptions.find(option => option.value === ownerMemberId) ||
      ownerOptions[0],
    [ownerMemberId, ownerOptions],
  );

  const openApiPayloadPreview = useMemo(() => {
    const staffOpenIds = ownerOptions.map(item => item.openId);
    const combinedUserIds = Array.from(
      new Set([...staffOpenIds, ...selectedExternalOpenIds]),
    );

    return JSON.stringify(
      {
        body: {
          add_member_permission: addMemberPermission,
          bot_id_list: [FEISHU_BOT_APP_ID],
          chat_mode: 'group',
          chat_type: 'private',
          description:
            description.trim() || I18N.carbonAgent.feishuCollectScopePreset1Desc,
          edit_permission: 'only_owner',
          external: true,
          group_message_type: groupMessageType,
          join_message_visibility: 'all_members',
          leave_message_visibility: 'only_owner',
          membership_approval: membershipApproval,
          name:
            activeTab === 'create'
              ? groupName.trim() || defaultGroupName
              : selectedExistingGroup.trim() || defaultGroupName,
          owner_id: selectedOwnerOption?.openId || 'ou_int_owner_default',
          share_card_permission: shareCardPermission,
          user_id_list: combinedUserIds,
        },
        endpoint: 'POST https://open.feishu.cn/open-apis/im/v1/chats',
        query: {
          set_bot_manager: setBotManager,
          user_id_type: 'open_id',
          uuid: `uuid_proj_${projectId}_${ groups.length + 1 }`,
        },
      },
      null,
      2,
    );
  }, [
    activeTab,
    addMemberPermission,
    defaultGroupName,
    description,
    groupMessageType,
    groupName,
    groups.length,
    membershipApproval,
     ownerOptions,
    projectId,
    selectedExistingGroup,
    selectedExternalOpenIds,
    selectedOwnerOption?.openId,
    setBotManager,
    shareCardPermission,
  ]);

  if (!open) {
    return null;
  }

  const handleToggleExternalOpenId = (openId: string) => {
    setSelectedExternalOpenIds(prev =>
      prev.includes(openId)
        ? prev.filter(item => item !== openId)
        : [...prev, openId],
    );
  };

  const handleSimulateNewExternalP2pAuth = () => {
    const nextIdx = p2pContacts.length + 1;
    const created = registerExternalClientViaBotP2p({
      companyName: `供应链协作方 #${nextIdx}`,
      name: `张经理（外部客户 #${nextIdx}）`,
      projectId,
    });
    const updatedContacts = getAuthorizedExternalP2pContacts();
    setP2pContacts(updatedContacts);
    setSelectedExternalOpenIds(prev =>
      Array.from(new Set([...prev, created.openId])),
    );
    antdMessage.success(
      I18N.template(I18N.carbonAgent.feishuCollectSimulateP2pAuthSuccess, {
        val1: created.name,
        val2: created.openId,
      }),
    );
  };

  const handleCopyBotAppLink = () => {
    copyToClipboard(FEISHU_BOT_APPLINK_URL)
      .then(() => {
        antdMessage.success(I18N.carbonAgent.feishuCollectBotAppLinkCopied);
      })
      .catch(() => {
        antdMessage.error(I18N.carbonAgent.projectInviteLinkCopyFailed);
      });
  };

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

  const handleConfirmCreateOrBind = () => {
    if (creating) {
      return;
    }

    const targetGroupName =
      activeTab === 'create'
        ? groupName.trim() || defaultGroupName
        : selectedExistingGroup.trim() || defaultGroupName;
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
        addMemberPermission,
        defaultTaskId: resolvedTaskId,
        defaultTaskTitle: resolvedTaskTitle,
        description,
        externalCustomerOpenIds: selectedExternalOpenIds,
        groupMessageType,
        groupName: targetGroupName,
        membershipApproval,
        mode: activeTab,
        ownerMemberId,
        ownerName:
          selectedOwnerOption?.rawName ||
          I18N.carbonAgent.feishuCollectOwnerDefault,
        projectId,
        projectMembers,
        projectName,
        setBotManager,
        shareCardPermission,
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
              ) : null}

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
                          {I18N.carbonAgent.feishuCollectGroupName}（name）
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
                    </>
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
                      {I18N.carbonAgent.feishuCollectGroupOwner}（owner_id ·
                      user_id_type=open_id）
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
                      {I18N.carbonAgent.feishuCollectAutoJoinLabel}（bot_id_list
                      & user_id_list）
                    </span>
                    <div className={style.autoJoinList}>
                      <span
                        className={classNames(
                          style.memberChip,
                          style.memberChipBot,
                        )}
                      >
                        <strong>{I18N.carbonAgent.feishuCollectBotName}</strong>
                        <code className={style.openIdCode}>
                          {FEISHU_BOT_APP_ID}
                        </code>
                        <span className={style.memberRoleBadge}>
                          {I18N.carbonAgent.feishuCollectBotTag}
                        </span>
                      </span>
                      {ownerOptions.map(option => (
                        <span className={style.memberChip} key={option.value}>
                          <span>{option.rawName}</span>
                          <code className={style.openIdCode}>
                            {option.openId}
                          </code>
                          <span className={style.memberRoleBadge}>
                            {I18N.carbonAgent.feishuCollectStaffTag}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={style.field}>
                    <div className={style.apiBoxHeader}>
                      <span className={style.fieldLabel}>
                        {I18N.carbonAgent.feishuCollectExternalP2pPoolLabel}
                      </span>
                      <div className={style.groupCardBtnGroup}>
                        <button
                          className={style.secondaryBtn}
                          type='button'
                          onClick={handleCopyBotAppLink}
                        >
                          {I18N.carbonAgent.feishuCollectBotAppLinkCopy}
                        </button>
                        <button
                          className={style.secondaryBtn}
                          type='button'
                          onClick={handleSimulateNewExternalP2pAuth}
                        >
                          {I18N.carbonAgent.feishuCollectSimulateP2pAuthBtn}
                        </button>
                      </div>
                    </div>
                    <div className={style.p2pCheckList}>
                      {p2pContacts.map(contact => {
                        const checked = selectedExternalOpenIds.includes(
                          contact.openId,
                        );
                        return (
                          <div
                            key={contact.id}
                            className={style.p2pCheckItem}
                          >
                            <label className={style.p2pCheckLeft}>
                              <input
                                type='checkbox'
                                checked={checked}
                                onChange={() =>
                                  handleToggleExternalOpenId(contact.openId)
                                }
                              />
                              <strong>{contact.name}</strong>
                              <span>· {contact.companyName}</span>
                            </label>
                            <div className={style.groupCardBtnGroup}>
                              <code className={style.openIdCode}>
                                {contact.openId}
                              </code>
                              <code className={style.openIdCode}>
                                {contact.eventType}
                              </code>
                            </div>
                          </div>
                        );
                      })}
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

                  <div className={style.apiBox}>
                    <div className={style.apiBoxHeader}>
                      <strong>
                        {I18N.carbonAgent.feishuCollectApiConfigTitle}
                      </strong>
                      <button
                        className={style.secondaryBtn}
                        type='button'
                        onClick={() => setShowApiPreview(prev => !prev)}
                      >
                        {showApiPreview
                          ? I18N.carbonAgent.feishuCollectApiHidePreview
                          : I18N.carbonAgent.feishuCollectApiTogglePreview}
                      </button>
                    </div>

                    <div className={style.apiGrid}>
                      <div className={style.apiField}>
                        <label>
                          {I18N.carbonAgent.feishuCollectSetBotManagerLabel}
                        </label>
                        <div className={style.switchLabel}>
                          <Switch
                            checked={setBotManager}
                            size='small'
                            onChange={setSetBotManager}
                          />
                          <span>
                            {setBotManager ? 'true' : 'false'}（{FEISHU_BOT_APP_ID}）
                          </span>
                        </div>
                      </div>

                      <div className={style.apiField}>
                        <label>
                          {I18N.carbonAgent.feishuCollectGroupMessageTypeLabel}
                        </label>
                        <Select
                          size='small'
                          value={groupMessageType}
                          options={[
                            {
                              label: I18N.carbonAgent.feishuCollectMsgTypeChat,
                              value: 'chat',
                            },
                            {
                              label:
                                I18N.carbonAgent.feishuCollectMsgTypeThread,
                              value: 'thread',
                            },
                          ]}
                          onChange={setGroupMessageType}
                        />
                      </div>

                      <div className={style.apiField}>
                        <label>
                          {
                            I18N.carbonAgent
                              .feishuCollectMembershipApprovalLabel
                          }
                        </label>
                        <Select
                          size='small'
                          value={membershipApproval}
                          options={[
                            {
                              label: I18N.carbonAgent.feishuCollectApprovalNone,
                              value: 'no_approval_required',
                            },
                            {
                              label:
                                I18N.carbonAgent.feishuCollectApprovalRequired,
                              value: 'approval_required',
                            },
                          ]}
                          onChange={setMembershipApproval}
                        />
                      </div>

                      <div className={style.apiField}>
                        <label>
                          {I18N.carbonAgent.feishuCollectAddMemberPermLabel}
                        </label>
                        <Select
                          size='small'
                          value={addMemberPermission}
                          options={[
                            {
                              label:
                                I18N.carbonAgent.feishuCollectPermAllMembers,
                              value: 'all_members',
                            },
                            {
                              label:
                                I18N.carbonAgent.feishuCollectPermOnlyOwner,
                              value: 'only_owner',
                            },
                          ]}
                          onChange={setAddMemberPermission}
                        />
                      </div>

                      <div className={style.apiField}>
                        <label>
                          {I18N.carbonAgent.feishuCollectShareCardPermLabel}
                        </label>
                        <Select
                          size='small'
                          value={shareCardPermission}
                          options={[
                            {
                              label: I18N.carbonAgent.feishuCollectShareAllowed,
                              value: 'allowed',
                            },
                            {
                              label:
                                I18N.carbonAgent.feishuCollectShareNotAllowed,
                              value: 'not_allowed',
                            },
                          ]}
                          onChange={setShareCardPermission}
                        />
                      </div>
                    </div>

                    {showApiPreview ? (
                      <pre className={style.apiCodePreview}>
                        {openApiPayloadPreview}
                      </pre>
                    ) : null}

                    <span className={style.infoHint}>
                      <i className={style.infoDot} aria-hidden='true'>
                        i
                      </i>
                      <span>{I18N.carbonAgent.feishuCollectExternalP2pTip}</span>
                    </span>
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
                {groups.map(group => (
                  <div key={group.chatId} className={style.groupCard}>
                    <div className={style.groupCardHeader}>
                      <div className={style.groupCardTitleCol}>
                        <div className={style.groupCardTitleLine}>
                          <strong>{group.groupName}</strong>
                          <code className={style.openIdCode}>
                            {group.chatId}
                          </code>
                          <code className={style.openIdCode}>
                            external: true · chat_type: {group.chatType}
                          </code>
                        </div>
                        {group.description ? (
                          <p className={style.groupCardDesc}>
                            {group.description}
                          </p>
                        ) : null}
                        <span className={style.groupCardDesc}>
                          {I18N.carbonAgent.feishuCollectGroupOwner}：
                          {group.ownerName}（{group.ownerId}） ·{' '}
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
                          value={group.defaultTaskId || UNSPECIFIED_TASK_VALUE}
                          onChange={val =>
                            handleDefaultTaskChange(group.chatId, val)
                          }
                        />
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
                              <code className={style.openIdCode}>
                                {member.openId}
                              </code>
                              <span className={style.memberRoleBadge}>
                                {getFeishuMemberRoleBadgeText(member.role)}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={style.groupCardFooter}>
                      <div className={style.groupCardBtnGroup}>
                        <code className={style.openIdCode}>
                          app_id: {group.appId}
                        </code>
                        <code className={style.openIdCode}>
                          set_bot_manager: {String(group.setBotManager)}
                        </code>
                        <code className={style.openIdCode}>
                          group_message_type: {group.groupMessageType}
                        </code>
                      </div>

                      <div className={style.groupCardBtnGroup}>
                        <button
                          className={style.secondaryBtn}
                          type='button'
                          onClick={() => handleCopyGroupInviteLink(group.chatId)}
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
                ))}
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

