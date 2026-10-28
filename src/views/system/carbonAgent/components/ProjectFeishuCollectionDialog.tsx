import projectDialogCloseIcon from '@src/assets/images/carbonAgent/icons/project-dialog-close.svg';
import projectMemberLink from '@src/assets/images/carbonAgent/icons/project-member-link.svg';
import projectSelectChevronIcon from '@src/assets/images/carbonAgent/icons/project-select-chevron.svg';
import I18N from '@src/lang/I18N';
import { copyToClipboard } from '@src/utils/clipboard';
import { Select, Switch, message as antdMessage } from 'antd';
import classNames from 'classnames';
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';
import style from './ProjectFeishuCollectionDialog.module.less';
import {
  type ProjectFeishuGroupState,
  addExternalCustomerToFeishuGroup,
  createProjectFeishuGroup,
  type FeishuGroupMemberRole,
  getProjectFeishuGroupState,
  receiveCustomerFileInFeishuGroup,
  toggleProjectFeishuCollection,
  updateProjectFeishuDefaultTask,
} from '../feishuCollectionStore';
import {
  type AgentProjectFile,
  type AgentProjectMember,
  uploadAgentProjectFile,
} from '../service';

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
  onFileSyncedToProject: (file: AgentProjectFile) => void;
  onGroupStateChange: (state: ProjectFeishuGroupState | null) => void;
  onUseFileAsContext?: (
    file: AgentProjectFile,
    groupName: string,
    summary: string,
  ) => void;
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
  onFileSyncedToProject,
  onGroupStateChange,
  onUseFileAsContext,
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
  const [customerInput, setCustomerInput] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [simUploading, setSimUploading] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement>(null);

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

  const presetTemplates = useMemo(
    () => [
      {
        fileName: I18N.carbonAgent.feishuCollectSimPreset1Name,
        fileSize: 18432,
        id: 'preset_1',
        note: I18N.carbonAgent.feishuCollectSimPreset1Note,
        summary: I18N.carbonAgent.feishuCollectSimPreset1Summary,
      },
      {
        fileName: I18N.carbonAgent.feishuCollectSimPreset2Name,
        fileSize: 24576,
        id: 'preset_2',
        note: I18N.carbonAgent.feishuCollectSimPreset2Note,
        summary: I18N.carbonAgent.feishuCollectSimPreset2Summary,
      },
      {
        fileName: I18N.carbonAgent.feishuCollectSimPreset3Name,
        fileSize: 31744,
        id: 'preset_3',
        note: I18N.carbonAgent.feishuCollectSimPreset3Note,
        summary: I18N.carbonAgent.feishuCollectSimPreset3Summary,
      },
    ],
    [],
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
    setSelectedExistingGroup(existingGroupOptions[0]?.value || defaultGroupName);

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
  }, [defaultGroupName, existingGroupOptions, open, projectId, projectMembers, tasks]);

  const customerMembers = useMemo(
    () =>
      (groupState?.members || []).filter(member => member.role === 'customer'),
    [groupState?.members],
  );

  useEffect(() => {
    if (!customerMembers.length) {
      setSelectedSender(I18N.carbonAgent.feishuCollectDefaultCustomer1);
      return;
    }

    if (
      !selectedSender ||
      !customerMembers.some(member => member.name === selectedSender)
    ) {
      setSelectedSender(customerMembers[0].name);
    }
  }, [customerMembers, selectedSender]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !creating && !simUploading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [creating, onCancel, open, simUploading]);

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

  const handleCopyGroupInviteLink = () => {
    if (!groupState) {
      return;
    }

    copyToClipboard(groupState.inviteUrl)
      .then(() => {
        antdMessage.success(I18N.carbonAgent.feishuCollectGroupLinkCopied);
      })
      .catch(() => {
        antdMessage.error(I18N.carbonAgent.projectInviteLinkCopyFailed);
      });
  };

  const handleAddExternalCustomer = () => {
    const trimmed = customerInput.trim();

    if (!trimmed || !groupState) {
      return;
    }

    const nextState = addExternalCustomerToFeishuGroup(
      projectId,
      trimmed,
      groupState.ownerName,
    );

    if (nextState) {
      setGroupState(nextState);
      onGroupStateChange(nextState);
      setCustomerInput('');
      setSelectedSender(trimmed);
      antdMessage.success(
        I18N.template(I18N.carbonAgent.feishuCollectCustomerAdded, {
          val1: trimmed,
        }),
      );
    }
  };

  const handleSendPresetMaterial = (preset: {
    fileName: string;
    fileSize: number;
    note: string;
    summary: string;
  }) => {
    if (!groupState || simUploading) {
      return;
    }

    const noteText = customNote.trim() || preset.note;
    const sender =
      selectedSender || I18N.carbonAgent.feishuCollectDefaultCustomer1;
    const result = receiveCustomerFileInFeishuGroup({
      fileName: preset.fileName,
      fileSize: preset.fileSize,
      note: noteText,
      projectId,
      senderName: sender,
      summary: preset.summary,
    });

    if (result) {
      setGroupState(result.state);
      onGroupStateChange(result.state);
      setCustomNote('');

      if (result.state.collectingEnabled) {
        onFileSyncedToProject(result.file);
        antdMessage.success(
          I18N.template(I18N.carbonAgent.feishuCollectSimReceivedToast, {
            val1: result.file.fileName,
          }),
        );
      }
    }
  };

  const handleLocalCustomerFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    if (localFileInputRef.current) {
      localFileInputRef.current.value = '';
    }

    if (!file || !groupState || simUploading) {
      return;
    }

    setSimUploading(true);
    let uploadedProjectFile: AgentProjectFile | undefined;

    try {
      uploadedProjectFile = await uploadAgentProjectFile(projectId, file);
    } catch {
      // Fallback to local prototype file storage if the backend API is unreachable.
    }

    const noteText =
      customNote.trim() || I18N.carbonAgent.feishuCollectSimPreset1Note;
    const sender =
      selectedSender || I18N.carbonAgent.feishuCollectDefaultCustomer1;
    const result = receiveCustomerFileInFeishuGroup({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      note: noteText,
      projectId,
      senderName: sender,
      summary: noteText,
      uploadedProjectFile,
    });

    setSimUploading(false);

    if (result) {
      setGroupState(result.state);
      onGroupStateChange(result.state);
      setCustomNote('');

      if (result.state.collectingEnabled) {
        onFileSyncedToProject(result.file);
        antdMessage.success(
          I18N.template(I18N.carbonAgent.feishuCollectSimReceivedToast, {
            val1: result.file.fileName,
          }),
        );
      }
    }
  };

  const suffixChevron = <Icon src={projectSelectChevronIcon} />;

  return createPortal(
    <div className={style.backdrop}>
      <button
        className={style.scrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={creating || simUploading}
        onClick={onCancel}
      />
      <div
        className={classNames(style.dialog, {
          [style.dialogWide]: Boolean(groupState),
        })}
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
            disabled={creating || simUploading}
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
          <div className={style.body}>
            <div className={style.workbenchTopBar}>
              <div className={style.workbenchTopMeta}>
                <strong>{groupState.groupName}</strong>
                <span>
                  {I18N.template(I18N.carbonAgent.feishuCollectCurrentProject, {
                    val1: projectName,
                  })}{' '}
                  · {I18N.carbonAgent.feishuCollectGroupOwner}：
                  {groupState.ownerName}
                </span>
              </div>
              <div className={style.workbenchTopControls}>
                <div className={style.switchLabel}>
                  <span>{I18N.carbonAgent.feishuCollectCollectionSwitch}</span>
                  <Switch
                    checked={groupState.collectingEnabled}
                    size='small'
                    onChange={handleToggleCollecting}
                  />
                </div>
                <button
                  className={style.secondaryBtn}
                  type='button'
                  onClick={handleCopyGroupInviteLink}
                >
                  <img
                    src={projectMemberLink}
                    alt=''
                    aria-hidden='true'
                    width={14}
                    height={14}
                  />
                  <span>{I18N.carbonAgent.feishuCollectCopyGroupLink}</span>
                </button>
              </div>
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

            <section className={style.sectionCard}>
              <div className={style.sectionHeader}>
                <h3>{I18N.carbonAgent.feishuCollectMembersSection}</h3>
              </div>
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
              <div className={style.inviteCustomerRow}>
                <input
                  className={style.textInput}
                  value={customerInput}
                  placeholder={
                    I18N.carbonAgent.feishuCollectCustomerNamePlaceholder
                  }
                  onChange={event =>
                    setCustomerInput(event.currentTarget.value)
                  }
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddExternalCustomer();
                    }
                  }}
                />
                <button
                  className={style.primarySmallBtn}
                  type='button'
                  disabled={!customerInput.trim()}
                  onClick={handleAddExternalCustomer}
                >
                  {I18N.carbonAgent.feishuCollectAddCustomerBtn}
                </button>
              </div>
            </section>

            <div className={style.workbenchGrid}>
              <section className={style.sectionCard}>
                <div className={style.sectionHeader}>
                  <h3>{I18N.carbonAgent.feishuCollectSimSectionTitle}</h3>
                </div>
                <div className={style.field}>
                  <label htmlFor='feishu-sim-sender'>
                    {I18N.carbonAgent.feishuCollectSimSenderLabel}
                  </label>
                  <Select
                    id='feishu-sim-sender'
                    className={style.select}
                    options={customerMembers.map(member => ({
                      label: member.name,
                      value: member.name,
                    }))}
                    suffixIcon={suffixChevron}
                    value={selectedSender}
                    onChange={setSelectedSender}
                  />
                </div>
                <div className={style.field}>
                  <input
                    className={style.textInput}
                    value={customNote}
                    placeholder={
                      I18N.carbonAgent.feishuCollectSimNotePlaceholder
                    }
                    onChange={event => setCustomNote(event.currentTarget.value)}
                  />
                </div>
                <div className={style.presetButtons}>
                  {presetTemplates.map(preset => (
                    <button
                      key={preset.id}
                      className={style.presetCard}
                      type='button'
                      disabled={simUploading}
                      onClick={() => handleSendPresetMaterial(preset)}
                    >
                      <div className={style.presetCardInfo}>
                        <strong title={preset.fileName}>
                          {preset.fileName}
                        </strong>
                        <span title={preset.note}>{preset.note}</span>
                      </div>
                      <span className={style.presetCardAction}>
                        {I18N.carbonAgent.feishuCollectSimSendPresetBtn}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  ref={localFileInputRef}
                  type='file'
                  hidden
                  onChange={handleLocalCustomerFileChange}
                />
                <button
                  className={style.secondaryBtn}
                  type='button'
                  disabled={simUploading}
                  onClick={() => localFileInputRef.current?.click()}
                >
                  {I18N.carbonAgent.feishuCollectSimUploadLocalBtn}
                </button>
              </section>

              <section className={style.sectionCard}>
                <div className={style.sectionHeader}>
                  <h3>{I18N.carbonAgent.feishuCollectChatHistoryTitle}</h3>
                </div>
                <div className={style.chatFeed}>
                  {groupState.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={classNames(style.chatMessage, {
                        [style.chatMessageBot]: msg.type === 'bot',
                        [style.chatMessageSystem]: msg.type === 'system',
                      })}
                    >
                      <div className={style.chatMessageHeader}>
                        <strong>{msg.senderName}</strong>
                        <time>{msg.createdAt}</time>
                      </div>
                      <p>{msg.content}</p>
                      {msg.note ? <small>{msg.note}</small> : null}
                    </div>
                  ))}
                </div>

                {groupState.files.length ? (
                  <>
                    <div className={style.sectionHeader}>
                      <h3>
                        {I18N.template(
                          I18N.carbonAgent.feishuCollectSyncedFilesTitle,
                          { val1: groupState.files.length },
                        )}
                      </h3>
                    </div>
                    <ul className={style.syncedFileList}>
                      {groupState.files.map(file => {
                        const matchedCandidate = groupState.candidates.find(
                          item =>
                            String(item.file.assetId || item.file.fileId) ===
                            String(file.assetId || file.fileId),
                        );

                        return (
                          <li
                            key={String(file.assetId || file.fileId)}
                            className={style.syncedFileItem}
                          >
                            <div className={style.syncedFileMeta}>
                              <strong title={file.fileName}>
                                {file.fileName}
                              </strong>
                              <span>
                                {matchedCandidate?.note ||
                                  file.uploaderUserName}
                              </span>
                            </div>
                            {onUseFileAsContext ? (
                              <button
                                className={style.primarySmallBtn}
                                type='button'
                                onClick={() => {
                                  onUseFileAsContext(
                                    file,
                                    groupState.groupName,
                                    matchedCandidate?.note ||
                                      matchedCandidate?.summary ||
                                      file.fileName,
                                  );
                                  onCancel();
                                }}
                              >
                                {I18N.carbonAgent.feishuCollectUseAsContext}
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : null}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ProjectFeishuCollectionDialog;

