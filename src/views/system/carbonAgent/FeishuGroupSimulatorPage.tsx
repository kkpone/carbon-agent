import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
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
import { useHistory, useLocation } from 'react-router-dom';

import style from './FeishuGroupSimulatorPage.module.less';
import {
  FEISHU_BOT_APPLINK_URL,
  FEISHU_BOT_APP_ID,
  FEISHU_COLLECTION_CHANGE_EVENT,
  type FeishuGroupMemberRole,
  type ProjectFeishuGroupState,
  addExternalCustomerToFeishuGroup,
  createProjectFeishuGroup,
  getAllProjectFeishuGroups,
  getProjectFeishuGroupState,
  receiveCustomerFileInFeishuGroup,
  registerExternalClientViaBotP2p,
  sendTextMessageInFeishuGroup,
  toggleProjectFeishuCollection,
  updateFeishuGroupBotMessage,
} from './feishuCollectionStore';
import { type AgentProjectFile, uploadAgentProjectFile } from './service';

const getRoleLabel = (role: FeishuGroupMemberRole) => {
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

const formatKB = (size?: number) => {
  if (!size || size <= 0) {
    return '18 KB';
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const FeishuGroupSimulatorPage = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const queryProjectId = searchParams.get('projectId')?.trim() || '';
  const queryProjectName = searchParams.get('projectName')?.trim() || '';
  const queryChatId = searchParams.get('chatId')?.trim() || '';

  const [allGroups, setAllGroups] = useState<ProjectFeishuGroupState[]>(() =>
    getAllProjectFeishuGroups(),
  );
  const [activeChatId, setActiveChatId] = useState<string>(queryChatId);
  const [customerInput, setCustomerInput] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const streamTimersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      streamTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
      streamTimersRef.current = [];
    },
    [],
  );

  const startStreamingBotParseOutput = (params: {
    chatId: string;
    fileName: string;
    fullContent: string;
    messageId: string;
    projectId: number | string;
  }) => {
    const { chatId, fileName, fullContent, messageId, projectId } = params;
    const totalLength = fullContent.length;
    const totalSteps = 18;
    const stepIntervalMs = 95;

    for (let step = 1; step <= totalSteps; step += 1) {
      const timerId = window.setTimeout(() => {
        const isFinal = step === totalSteps;
        const sliceEnd = isFinal
          ? totalLength
          : Math.max(1, Math.round((totalLength * step) / totalSteps));
        const partialText = fullContent.slice(0, sliceEnd);

        updateFeishuGroupBotMessage({
          chatId,
          content: partialText,
          messageId,
          note: isFinal
            ? I18N.carbonAgent.feishuStreamStageDone
            : I18N.carbonAgent.feishuStreamStageParsing,
          projectId,
          streaming: !isFinal,
        });

        if (isFinal) {
          antdMessage.success(
            I18N.template(I18N.carbonAgent.feishuCollectSimReceivedToast, {
              val1: fileName,
            }),
          );
        }
      }, step * stepIntervalMs);

      streamTimersRef.current.push(timerId);
    }
  };

  useEffect(() => {
    const syncGroups = () => {
      let groups = getAllProjectFeishuGroups();

      if (
        queryProjectId &&
        !groups.some(group => String(group.projectId) === queryProjectId)
      ) {
        const defaultName =
          queryProjectName ||
          I18N.template(I18N.carbonAgent.projectWithId, {
            val1: queryProjectId,
          });
        createProjectFeishuGroup({
          defaultTaskId: '',
          defaultTaskTitle: '',
          description: I18N.carbonAgent.feishuCollectScopePreset1Desc,
          groupName: `${defaultName} - ${I18N.carbonAgent.feishuCollectScopePreset1Name}`,
          mode: 'create',
          ownerMemberId: 'owner_default',
          ownerName: I18N.carbonAgent.feishuCollectOwnerDefault,
          projectId: queryProjectId,
          projectMembers: [],
          projectName: defaultName,
        });
        groups = getAllProjectFeishuGroups();
      } else if (!groups.length && !queryProjectId) {
        const demoProjectId = 'demo_multi';
        const demoProjectName = '2026 年度碳盘查示范项目';
        createProjectFeishuGroup({
          defaultTaskId: 'task_energy',
          defaultTaskTitle: '范围一、二电力与天然气消耗数据收集',
          description: I18N.carbonAgent.feishuCollectScopePreset1Desc,
          groupName: `${demoProjectName} - ${I18N.carbonAgent.feishuCollectScopePreset1Name}`,
          mode: 'create',
          ownerMemberId: 'owner_default',
          ownerName: I18N.carbonAgent.feishuCollectOwnerDefault,
          projectId: demoProjectId,
          projectMembers: [],
          projectName: demoProjectName,
        });
        createProjectFeishuGroup({
          defaultTaskId: 'task_bom',
          defaultTaskTitle: '范围三外购原辅料与 BOM 采购台账收集',
          description: I18N.carbonAgent.feishuCollectScopePreset2Desc,
          groupName: `${demoProjectName} - ${I18N.carbonAgent.feishuCollectScopePreset2Name}`,
          mode: 'create',
          ownerMemberId: 'owner_default',
          ownerName: I18N.carbonAgent.feishuCollectOwnerDefault,
          projectId: demoProjectId,
          projectMembers: [],
          projectName: demoProjectName,
        });
        groups = getAllProjectFeishuGroups();
      }

      setAllGroups(groups);

      if (
        queryChatId &&
        groups.some(group => group.chatId === queryChatId)
      ) {
        setActiveChatId(queryChatId);
      } else if (
        queryProjectId &&
        groups.some(group => String(group.projectId) === queryProjectId) &&
        !groups.some(group => group.chatId === activeChatId)
      ) {
        const matched = groups.find(
          group => String(group.projectId) === queryProjectId,
        );
        if (matched) {
          setActiveChatId(matched.chatId);
        }
      } else if (
        groups.length &&
        !groups.some(group => group.chatId === activeChatId)
      ) {
        setActiveChatId(groups[0].chatId);
      }
    };

    syncGroups();
    window.addEventListener(FEISHU_COLLECTION_CHANGE_EVENT, syncGroups);
    window.addEventListener('storage', syncGroups);

    return () => {
      window.removeEventListener(FEISHU_COLLECTION_CHANGE_EVENT, syncGroups);
      window.removeEventListener('storage', syncGroups);
    };
  }, [activeChatId, queryChatId, queryProjectId, queryProjectName]);

  const activeGroup = useMemo(
    () =>
      allGroups.find(group => group.chatId === activeChatId) ||
      (queryProjectId
        ? getProjectFeishuGroupState(queryProjectId, queryChatId || undefined)
        : null) ||
      allGroups[0] ||
      null,
    [activeChatId, allGroups, queryChatId, queryProjectId],
  );

  const nonBotMembers = useMemo(
    () => (activeGroup?.members || []).filter(member => member.role !== 'bot'),
    [activeGroup?.members],
  );

  useEffect(() => {
    if (!nonBotMembers.length) {
      setSelectedSenderId('');
      return;
    }

    const firstCustomer =
      nonBotMembers.find(member => member.role === 'customer') ||
      nonBotMembers[0];

    if (
      !selectedSenderId ||
      !nonBotMembers.some(member => member.id === selectedSenderId)
    ) {
      setSelectedSenderId(firstCustomer.id);
    }
  }, [nonBotMembers, selectedSenderId]);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroup?.messages.length]);

  const activeSender = useMemo(
    () =>
      nonBotMembers.find(member => member.id === selectedSenderId) ||
      nonBotMembers.find(member => member.role === 'customer') ||
      nonBotMembers[0],
    [nonBotMembers, selectedSenderId],
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

  const handleBackToAgent = () => {
    const targetProjectId = activeGroup?.projectId || queryProjectId;

    if (targetProjectId && targetProjectId !== 'demo_multi') {
      history.push({
        pathname: RouteMaps.carbonAgent,
        search: `?section=${encodeURIComponent(`project:${targetProjectId}`)}`,
      });
      return;
    }

    history.push(RouteMaps.carbonAgent);
  };

  const handleQuickCreateAnotherGroup = () => {
    const targetProjectId =
      activeGroup?.projectId || queryProjectId || 'demo_multi';
    const targetProjectName =
      activeGroup?.projectName || queryProjectName || '当前项目';
    const existingForProj = allGroups.filter(
      g => String(g.projectId) === String(targetProjectId),
    );
    const scopeList = [
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset1Desc,
        name: `${targetProjectName} - ${I18N.carbonAgent.feishuCollectScopePreset1Name}`,
      },
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset2Desc,
        name: `${targetProjectName} - ${I18N.carbonAgent.feishuCollectScopePreset2Name}`,
      },
      {
        desc: I18N.carbonAgent.feishuCollectScopePreset3Desc,
        name: `${targetProjectName} - ${I18N.carbonAgent.feishuCollectScopePreset3Name}`,
      },
    ];
    const picked = scopeList[existingForProj.length % scopeList.length];
    const created = createProjectFeishuGroup({
      defaultTaskId: '',
      defaultTaskTitle: '',
      description: picked.desc,
      groupName:
        existingForProj.length >= scopeList.length
          ? `${picked.name} #${existingForProj.length + 1}`
          : picked.name,
      mode: 'create',
      ownerMemberId: activeGroup?.ownerMemberId || 'owner_default',
      ownerName:
        activeGroup?.ownerName || I18N.carbonAgent.feishuCollectOwnerDefault,
      projectId: String(targetProjectId),
      projectMembers: [],
      projectName: targetProjectName,
    });
    setActiveChatId(created.chatId);
    antdMessage.success(I18N.carbonAgent.feishuCollectCreatedSuccess);
  };

  const handleInviteExternalCustomer = () => {
    const trimmed = customerInput.trim();

    if (!trimmed || !activeGroup) {
      return;
    }

    const p2pContact = registerExternalClientViaBotP2p({
      name: trimmed,
      projectId: activeGroup.projectId,
    });
    const updated = addExternalCustomerToFeishuGroup(
      activeGroup.projectId,
      trimmed,
      activeGroup.ownerName,
      activeGroup.chatId,
      p2pContact.openId,
    );

    if (updated) {
      setCustomerInput('');
      const addedMember = updated.members[updated.members.length - 1];
      if (addedMember) {
        setSelectedSenderId(addedMember.id);
      }
      antdMessage.success(
        I18N.template(I18N.carbonAgent.feishuCollectSimulateP2pAuthSuccess, {
          val1: trimmed,
          val2: p2pContact.openId,
        }),
      );
    }
  };

  const handleSendPresetFile = (preset: {
    fileName: string;
    fileSize: number;
    note: string;
    summary: string;
  }) => {
    if (!activeGroup) {
      return;
    }

    const noteText = messageInput.trim() || preset.note;
    const senderName =
      activeSender?.name || I18N.carbonAgent.feishuCollectDefaultCustomer1;
    const result = receiveCustomerFileInFeishuGroup({
      chatId: activeGroup.chatId,
      fileName: preset.fileName,
      fileSize: preset.fileSize,
      note: noteText,
      projectId: activeGroup.projectId,
      senderName,
      streamBotReply: true,
      summary: preset.summary,
    });

    if (result) {
      setMessageInput('');
      if (result.state.collectingEnabled) {
        startStreamingBotParseOutput({
          chatId: activeGroup.chatId,
          fileName: result.file.fileName,
          fullContent: result.fullBotContent,
          messageId: result.botMessageId,
          projectId: activeGroup.projectId,
        });
      }
    }
  };

  const handleLocalFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file || !activeGroup || uploading) {
      return;
    }

    setUploading(true);
    let uploadedProjectFile: AgentProjectFile | undefined;

    try {
      uploadedProjectFile = await uploadAgentProjectFile(
        activeGroup.projectId,
        file,
      );
    } catch {
      // Fallback to local sync when backend upload requires different session context.
    }

    const noteText =
      messageInput.trim() || I18N.carbonAgent.feishuCollectSimPreset1Note;
    const senderName =
      activeSender?.name || I18N.carbonAgent.feishuCollectDefaultCustomer1;
    const result = receiveCustomerFileInFeishuGroup({
      chatId: activeGroup.chatId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      note: noteText,
      projectId: activeGroup.projectId,
      senderName,
      streamBotReply: true,
      summary: noteText,
      uploadedProjectFile,
    });

    setUploading(false);

    if (result) {
      setMessageInput('');
      if (result.state.collectingEnabled) {
        startStreamingBotParseOutput({
          chatId: activeGroup.chatId,
          fileName: result.file.fileName,
          fullContent: result.fullBotContent,
          messageId: result.botMessageId,
          projectId: activeGroup.projectId,
        });
      }
    }
  };

  const handleSendTextMessage = () => {
    const trimmed = messageInput.trim();

    if (!trimmed || !activeGroup) {
      return;
    }

    sendTextMessageInFeishuGroup({
      chatId: activeGroup.chatId,
      content: trimmed,
      projectId: activeGroup.projectId,
      senderName:
        activeSender?.name || I18N.carbonAgent.feishuCollectDefaultCustomer1,
      senderRole: activeSender?.role || 'customer',
    });
    setMessageInput('');
  };

  const handleCopyGroupLink = () => {
    if (!activeGroup) {
      return;
    }

    copyToClipboard(activeGroup.inviteUrl)
      .then(() => {
        antdMessage.success(I18N.carbonAgent.feishuCollectGroupLinkCopied);
      })
      .catch(() => {
        antdMessage.error(I18N.carbonAgent.projectInviteLinkCopyFailed);
      });
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

  return (
    <div className={style.appShell}>
      <aside className={style.leftRail}>
        <div className={style.railTop}>
          <div className={style.feishuBrandLogo}>L</div>
          <div
            className={classNames(style.railNavItem, style.railNavItemActive)}
          >
            <span className={style.railNavDot} />
            <span>{I18N.carbonAgent.feishuStandaloneNavMessages}</span>
          </div>
          <div className={style.railNavItem}>
            <span className={style.railNavDot} />
            <span>{I18N.carbonAgent.feishuStandaloneNavDocs}</span>
          </div>
          <div className={style.railNavItem}>
            <span className={style.railNavDot} />
            <span>{I18N.carbonAgent.feishuStandaloneNavContacts}</span>
          </div>
          <div className={style.railNavItem}>
            <span className={style.railNavDot} />
            <span>{I18N.carbonAgent.feishuStandaloneNavWorkbench}</span>
          </div>
        </div>
      </aside>

      {!activeGroup ? (
        <div className={style.emptyWrap}>
          <p>{I18N.carbonAgent.feishuStandaloneEmptyGroups}</p>
          <button
            className={style.backAgentBtn}
            type='button'
            onClick={handleBackToAgent}
          >
            {I18N.carbonAgent.feishuStandaloneBackToAgent}
          </button>
        </div>
      ) : (
        <>
          <section className={style.chatListPane}>
            <header className={style.chatListHeader}>
              <h2>
                {I18N.carbonAgent.feishuStandaloneGroupListTitle}（
                {allGroups.length}）
              </h2>
              <button
                className={style.uploadFileBtn}
                type='button'
                onClick={handleQuickCreateAnotherGroup}
              >
                + {I18N.carbonAgent.feishuCollectTabCreate}
              </button>
            </header>
            <div className={style.chatListBody}>
              {allGroups.map(group => {
                const isActive = group.chatId === activeGroup.chatId;
                const latestMsg = group.messages[group.messages.length - 1];

                return (
                  <button
                    key={group.chatId}
                    className={classNames(style.chatGroupItem, {
                      [style.chatGroupItemActive]: isActive,
                    })}
                    type='button'
                    onClick={() => setActiveChatId(group.chatId)}
                  >
                    <div className={style.groupAvatar}>
                      {group.groupName.slice(0, 1)}
                    </div>
                    <div className={style.chatGroupMeta}>
                      <strong title={group.groupName}>{group.groupName}</strong>
                      <span>
                        {group.description ||
                          (latestMsg
                            ? `${latestMsg.senderName}: ${latestMsg.content}`
                            : group.projectName)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <main className={style.mainChatPane}>
            <header className={style.mainChatHeader}>
              <div className={style.mainChatTitleGroup}>
                <div className={style.mainChatTitleRow}>
                  <h1>{activeGroup.groupName}</h1>
                  <span className={style.externalTag}>
                    {I18N.carbonAgent.feishuCollectCustomerTag}
                  </span>
                </div>
                <span>
                  {I18N.template(
                    I18N.carbonAgent.feishuStandaloneGroupSubTitle,
                    {
                      val1: activeGroup.members.length,
                      val2: activeGroup.projectName,
                    },
                  )}
                  {' · '}
                  {activeGroup.chatId}
                  {activeGroup.description
                    ? ` · ${activeGroup.description}`
                    : ''}
                </span>
              </div>
              <div className={style.headerActions}>
                <button
                  className={style.backAgentBtn}
                  type='button'
                  onClick={handleCopyBotAppLink}
                >
                  {I18N.carbonAgent.feishuCollectBotAppLinkCopy}
                </button>
                <button
                  className={style.backAgentBtn}
                  type='button'
                  onClick={handleCopyGroupLink}
                >
                  {I18N.carbonAgent.feishuCollectCopyGroupLink}
                </button>
                <button
                  className={style.backAgentBtn}
                  type='button'
                  onClick={handleBackToAgent}
                >
                  {I18N.carbonAgent.feishuStandaloneBackToAgent}
                </button>
              </div>
            </header>

            <div className={style.messageStream}>
              {activeGroup.messages.map(msg => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className={style.systemNotice}>
                      {msg.content}
                    </div>
                  );
                }

                const isBot = msg.type === 'bot';

                return (
                  <div key={msg.id} className={style.msgRow}>
                    <div
                      className={classNames(style.msgAvatar, {
                        [style.msgAvatarBot]: isBot,
                      })}
                    >
                      {isBot ? 'AI' : msg.senderName.slice(0, 1)}
                    </div>
                    <div className={style.msgContentCol}>
                      <div className={style.msgSenderLine}>
                        <strong>{msg.senderName}</strong>
                        {isBot ? (
                          <span className={style.botBadge}>
                            {I18N.carbonAgent.feishuCollectBotTag}
                          </span>
                        ) : null}
                        <time>{msg.createdAt}</time>
                      </div>
                      <div
                        className={classNames(style.msgBubble, {
                          [style.msgBubbleBot]: isBot,
                        })}
                      >
                        {msg.file && !isBot ? (
                          <div className={style.fileAttachmentCard}>
                            <div className={style.excelBadge}>X</div>
                            <div className={style.fileAttachmentMeta}>
                              <strong title={msg.file.fileName}>
                                {msg.file.fileName}
                              </strong>
                              <span>{formatKB(msg.file.fileSize)}</span>
                            </div>
                          </div>
                        ) : null}
                        <p className={style.msgText}>
                          {msg.content}
                          {msg.streaming ? (
                            <span
                              className={style.streamingCursor}
                              aria-hidden='true'
                            />
                          ) : null}
                        </p>
                        {msg.note ? (
                          <p className={style.msgSubNote}>{msg.note}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={streamEndRef} />
            </div>

            <footer className={style.composerArea}>
              <div className={style.composerTopToolbar}>
                <div className={style.senderSwitchRow}>
                  <span>
                    {I18N.carbonAgent.feishuStandaloneRoleSwitchLabel}
                  </span>
                  <Select
                    className={style.senderSelect}
                    size='small'
                    value={activeSender?.id}
                    options={nonBotMembers.map(member => ({
                      label: `${member.name}（${getRoleLabel(member.role)} · ${member.openId}）`,
                      value: member.id,
                    }))}
                    onChange={setSelectedSenderId}
                  />
                </div>
                <div className={style.quickFilesRow}>
                  <span className={style.quickFilesLabel}>
                    {I18N.carbonAgent.feishuStandaloneSendQuickFileLabel}
                  </span>
                  {presetTemplates.map(preset => (
                    <button
                      key={preset.id}
                      className={style.quickFileChip}
                      type='button'
                      disabled={uploading}
                      onClick={() => handleSendPresetFile(preset)}
                    >
                      + {preset.fileName}
                    </button>
                  ))}
                  <input
                    ref={fileInputRef}
                    type='file'
                    hidden
                    onChange={handleLocalFileChange}
                  />
                  <button
                    className={style.uploadFileBtn}
                    type='button'
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {I18N.carbonAgent.feishuStandaloneUploadFileBtn}
                  </button>
                </div>
              </div>

              <div className={style.composerInputRow}>
                <input
                  className={style.composerInput}
                  value={messageInput}
                  placeholder={
                    I18N.carbonAgent.feishuStandaloneInputPlaceholder
                  }
                  onChange={event => setMessageInput(event.currentTarget.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSendTextMessage();
                    }
                  }}
                />
                <button
                  className={style.sendBtn}
                  type='button'
                  disabled={!messageInput.trim()}
                  onClick={handleSendTextMessage}
                >
                  {I18N.carbonAgent.feishuStandaloneSendBtn}
                </button>
              </div>
            </footer>
          </main>

          <aside className={style.rightSidePanel}>
            <div className={style.sideBlock}>
              <h3>{I18N.carbonAgent.feishuStandaloneRightPanelTitle}</h3>
              <div className={style.senderSwitchRow}>
                <span>{I18N.carbonAgent.feishuCollectCollectionSwitch}</span>
                <Switch
                  checked={activeGroup.collectingEnabled}
                  size='small'
                  onChange={checked =>
                    toggleProjectFeishuCollection(
                      activeGroup.projectId,
                      checked,
                      activeGroup.chatId,
                    )
                  }
                />
              </div>
              <div className={style.syncedFileCard}>
                <strong>OpenAPI Metadata</strong>
                <span>app_id: {FEISHU_BOT_APP_ID}</span>
                <span>chat_id: {activeGroup.chatId}</span>
                <span>owner_id: {activeGroup.ownerId}</span>
                <span>
                  external: true · chat_type: {activeGroup.chatType}
                </span>
              </div>
              <div className={style.inviteBox}>
                <strong>
                  {I18N.carbonAgent.feishuStandaloneInviteExternalBtn}
                </strong>
                <input
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
                      handleInviteExternalCustomer();
                    }
                  }}
                />
                <button
                  className={style.inviteBtn}
                  type='button'
                  disabled={!customerInput.trim()}
                  onClick={handleInviteExternalCustomer}
                >
                  {I18N.carbonAgent.feishuCollectAddCustomerBtn}
                </button>
              </div>
              <ul className={style.memberList}>
                {activeGroup.members.map(member => (
                  <li key={member.id} className={style.memberItem}>
                    <span title={`${member.name} (${member.openId})`}>
                      {member.name}
                    </span>
                    <em
                      className={classNames(style.memberRoleTag, {
                        [style.memberRoleTagBot]: member.role === 'bot',
                        [style.memberRoleTagCustomer]:
                          member.role === 'customer',
                      })}
                    >
                      {getRoleLabel(member.role)}
                    </em>
                  </li>
                ))}
              </ul>
            </div>

            <div className={style.sideBlock}>
              <h3>
                {I18N.carbonAgent.feishuStandaloneRightPanelSyncedTitle}（
                {activeGroup.files.length}）
              </h3>
              {activeGroup.files.length ? (
                <ul className={style.syncedFilesList}>
                  {activeGroup.files.map(file => {
                    const cand = activeGroup.candidates.find(
                      item =>
                        String(item.file.assetId || item.file.fileId) ===
                        String(file.assetId || file.fileId),
                    );

                    return (
                      <li
                        key={String(file.assetId || file.fileId)}
                        className={style.syncedFileCard}
                      >
                        <strong title={file.fileName}>{file.fileName}</strong>
                        <span>{cand?.note || file.uploaderUserName}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span>{I18N.carbonAgent.projectFilesEmpty}</span>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default FeishuGroupSimulatorPage;

