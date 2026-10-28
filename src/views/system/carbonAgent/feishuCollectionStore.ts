import I18N from '@src/lang/I18N';

import type { AgentProjectFile, AgentProjectMember } from './service';

export type FeishuGroupMemberRole = 'bot' | 'customer' | 'owner' | 'staff';

export const FEISHU_BOT_APP_ID = 'cli_aa0523fd77f91cff';
export const FEISHU_BOT_APPLINK_URL =
  'https://applink.feishu.cn/client/bot/open?appId=cli_aa0523fd77f91cff';

export type FeishuUserIdType = 'open_id' | 'union_id' | 'user_id';
export type FeishuGroupMessageType = 'chat' | 'thread';
export type FeishuMembershipApproval =
  | 'approval_required'
  | 'no_approval_required';
export type FeishuMemberVisibility =
  | 'all_members'
  | 'not_anyone'
  | 'only_owner';
export type FeishuAddMemberPermission = 'all_members' | 'only_owner';
export type FeishuShareCardPermission = 'allowed' | 'not_allowed';
export type FeishuEditPermission = 'all_members' | 'only_owner';

export type FeishuExternalP2pContact = {
  authorizedAt: string;
  companyName: string;
  eventType: 'im.chat.access_event.bot_p2p_chat_entered_v1' | 'p2p_chat_create';
  id: string;
  name: string;
  openId: string;
};

export type FeishuGroupMember = {
  companyName?: string;
  id: string;
  joinedAt: string;
  name: string;
  openId: string;
  p2pAuthorized?: boolean;
  role: FeishuGroupMemberRole;
  tenantType: 'bot' | 'external' | 'internal';
};

export type FeishuGroupChatMessageType = 'bot' | 'customer_file' | 'system';

export type FeishuGroupChatMessage = {
  content: string;
  createdAt: string;
  file?: AgentProjectFile;
  id: string;
  note?: string;
  senderName: string;
  senderRole: FeishuGroupMemberRole | 'system';
  streaming?: boolean;
  taskId?: string;
  taskTitle?: string;
  type: FeishuGroupChatMessageType;
};

export type FeishuCollectedCandidate = {
  adopted?: boolean;
  chatId?: string;
  createdAt: string;
  file: AgentProjectFile;
  groupName: string;
  id: string;
  note: string;
  senderName: string;
  senderOpenId?: string;
  summary: string;
  taskId?: string;
  taskTitle?: string;
};

export type ProjectFeishuGroupState = {
  addMemberPermission: FeishuAddMemberPermission;
  appId: string;
  botIdList: string[];
  candidates: FeishuCollectedCandidate[];
  chatId: string;
  chatMode: 'group';
  chatType: 'private';
  collectingEnabled: boolean;
  createdAt: string;
  defaultTaskId: string;
  defaultTaskTitle: string;
  description: string;
  editPermission: FeishuEditPermission;
  external: boolean;
  files: AgentProjectFile[];
  groupMessageType: FeishuGroupMessageType;
  groupName: string;
  inviteUrl: string;
  joinMessageVisibility: FeishuMemberVisibility;
  leaveMessageVisibility: FeishuMemberVisibility;
  members: FeishuGroupMember[];
  membershipApproval: FeishuMembershipApproval;
  messages: FeishuGroupChatMessage[];
  mode: 'bind' | 'create';
  ownerId: string;
  ownerMemberId: string;
  ownerName: string;
  projectId: string;
  projectName: string;
  setBotManager: boolean;
  shareCardPermission: FeishuShareCardPermission;
  userIdList: string[];
  userIdType: FeishuUserIdType;
  uuid: string;
};

const STORAGE_KEY_PREFIX = 'carbon_agent_feishu_collect_v1:';
const P2P_CONTACTS_STORAGE_KEY = 'carbon_agent_feishu_p2p_contacts_v1';
export const FEISHU_COLLECTION_CHANGE_EVENT =
  'carbon-agent:feishu-collection-change';

const getStorageKey = (projectId: number | string) =>
  `${STORAGE_KEY_PREFIX}${String(projectId)}`;

const formatNowTime = () => {
  const now = new Date();
  const pad = (num: number) => String(num).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

export const buildInternalOpenId = (
  memberId: number | string,
  userName?: string,
): string => {
  const raw = `${String(memberId)}_${userName || ''}`;
  let hash = 2166136261;

  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `ou_int_${String(memberId).replace(/[^a-zA-Z0-9]/g, '')}_${hex}`;
};

export const buildExternalOpenId = (seed: string): string => {
  let hash = 5381;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }

  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `ou_ext_${hex}${Date.now().toString(16).slice(-4)}`;
};

const emitFeishuCollectionChange = (projectId: number | string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(FEISHU_COLLECTION_CHANGE_EVENT, {
      detail: { projectId: String(projectId) },
    }),
  );
};

export const getAuthorizedExternalP2pContacts =
  (): FeishuExternalP2pContact[] => {
    const defaults: FeishuExternalP2pContact[] = [
      {
        authorizedAt: '2026-10-28 09:30:00',
        companyName: '昆山精密制造厂',
        eventType: 'im.chat.access_event.bot_p2p_chat_entered_v1',
        id: 'p2p_ext_1',
        name: I18N.carbonAgent.feishuCollectDefaultCustomer1,
        openId: 'ou_ext_7d8a6e22c91b401a',
      },
      {
        authorizedAt: '2026-10-28 10:15:00',
        companyName: '华东再生铝供应链',
        eventType: 'im.chat.access_event.bot_p2p_chat_entered_v1',
        id: 'p2p_ext_2',
        name: '李工（供应商EHS代表）',
        openId: 'ou_ext_3f91b4a08e2c775d',
      },
      {
        authorizedAt: '2026-10-28 11:05:00',
        companyName: '安捷跨境物流集团',
        eventType: 'p2p_chat_create',
        id: 'p2p_ext_3',
        name: '周主管（物流调度）',
        openId: 'ou_ext_9c4e1208fa6b332e',
      },
    ];

    if (typeof window === 'undefined') {
      return defaults;
    }

    try {
      const raw = window.localStorage.getItem(P2P_CONTACTS_STORAGE_KEY);

      if (!raw) {
        return defaults;
      }

      const parsed = JSON.parse(raw) as FeishuExternalP2pContact[];
      return Array.isArray(parsed) && parsed.length ? parsed : defaults;
    } catch {
      return defaults;
    }
  };

export const registerExternalClientViaBotP2p = (params: {
  companyName?: string;
  name: string;
  projectId?: number | string;
}): FeishuExternalP2pContact => {
  const trimmedName = params.name.trim();
  const existing = getAuthorizedExternalP2pContacts();
  const newContact: FeishuExternalP2pContact = {
    authorizedAt: formatNowTime(),
    companyName: params.companyName?.trim() || '外部协作企业',
    eventType: 'im.chat.access_event.bot_p2p_chat_entered_v1',
    id: `p2p_ext_${Date.now()}`,
    name: trimmedName,
    openId: buildExternalOpenId(trimmedName),
  };
  const nextList = [
    newContact,
    ...existing.filter(item => item.name !== trimmedName),
  ];

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        P2P_CONTACTS_STORAGE_KEY,
        JSON.stringify(nextList),
      );
    } catch {
      // Ignore quota errors in prototype mode.
    }
  }

  if (params.projectId) {
    emitFeishuCollectionChange(params.projectId);
  }

  return newContact;
};

const normalizeGroupState = (
  rawGroup: Partial<ProjectFeishuGroupState>,
): ProjectFeishuGroupState | null => {
  if (!rawGroup || typeof rawGroup !== 'object' || !rawGroup.chatId) {
    return null;
  }

  const ownerMemberId = String(rawGroup.ownerMemberId || 'owner_default');
  const ownerName =
    rawGroup.ownerName || I18N.carbonAgent.feishuCollectOwnerDefault;
  const ownerId =
    rawGroup.ownerId || buildInternalOpenId(ownerMemberId, ownerName);
  const members: FeishuGroupMember[] = Array.isArray(rawGroup.members)
    ? rawGroup.members.map(member => ({
        ...member,
        openId:
          member.openId ||
          (member.role === 'bot'
            ? FEISHU_BOT_APP_ID
            : member.role === 'customer'
            ? buildExternalOpenId(member.name || member.id)
            : buildInternalOpenId(member.id, member.name)),
        p2pAuthorized:
          member.p2pAuthorized ?? (member.role === 'customer' ? true : undefined),
        tenantType:
          member.tenantType ||
          (member.role === 'bot'
            ? 'bot'
            : member.role === 'customer'
            ? 'external'
            : 'internal'),
      }))
    : [];
  const userIdList =
    Array.isArray(rawGroup.userIdList) && rawGroup.userIdList.length
      ? rawGroup.userIdList
      : members.filter(m => m.role !== 'bot').map(m => m.openId);
  const candidates: FeishuCollectedCandidate[] = Array.isArray(
    rawGroup.candidates,
  )
    ? rawGroup.candidates.map(cand => ({
        ...cand,
        chatId: cand.chatId || rawGroup.chatId,
      }))
    : [];

  return {
    addMemberPermission: rawGroup.addMemberPermission || 'all_members',
    appId: rawGroup.appId || FEISHU_BOT_APP_ID,
    botIdList:
      Array.isArray(rawGroup.botIdList) && rawGroup.botIdList.length
        ? rawGroup.botIdList
        : [FEISHU_BOT_APP_ID],
    candidates,
    chatId: rawGroup.chatId,
    chatMode: 'group',
    chatType: 'private',
    collectingEnabled: rawGroup.collectingEnabled ?? true,
    createdAt: rawGroup.createdAt || formatNowTime(),
    defaultTaskId: rawGroup.defaultTaskId || '',
    defaultTaskTitle: rawGroup.defaultTaskTitle || '',
    description: rawGroup.description || '',
    editPermission: rawGroup.editPermission || 'only_owner',
    external: rawGroup.external ?? true,
    files: Array.isArray(rawGroup.files) ? rawGroup.files : [],
    groupMessageType: rawGroup.groupMessageType || 'chat',
    groupName: rawGroup.groupName || '',
    inviteUrl:
      rawGroup.inviteUrl ||
      `https://applink.feishu.cn/client/chat/chatter/add_by_link?chat_token=${rawGroup.chatId}`,
    joinMessageVisibility: rawGroup.joinMessageVisibility || 'all_members',
    leaveMessageVisibility: rawGroup.leaveMessageVisibility || 'only_owner',
    members,
    membershipApproval: rawGroup.membershipApproval || 'no_approval_required',
    messages: Array.isArray(rawGroup.messages) ? rawGroup.messages : [],
    mode: rawGroup.mode || 'create',
    ownerId,
    ownerMemberId,
    ownerName,
    projectId: String(rawGroup.projectId || ''),
    projectName: rawGroup.projectName || '',
    setBotManager: rawGroup.setBotManager ?? true,
    shareCardPermission: rawGroup.shareCardPermission || 'allowed',
    userIdList,
    userIdType: rawGroup.userIdType || 'open_id',
    uuid:
      rawGroup.uuid ||
      `uuid_${String(rawGroup.projectId || 'proj')}_${rawGroup.chatId.slice(-8)}`,
  };
};

export const getProjectFeishuGroups = (
  projectId: number | string,
): ProjectFeishuGroupState[] => {
  if (typeof window === 'undefined' || !projectId) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(projectId));

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as
      | ProjectFeishuGroupState
      | ProjectFeishuGroupState[];
    const rawList = Array.isArray(parsed) ? parsed : [parsed];

    return rawList
      .map(item => normalizeGroupState(item))
      .filter((item): item is ProjectFeishuGroupState => Boolean(item));
  } catch {
    return [];
  }
};

export const saveProjectFeishuGroups = (
  projectId: number | string,
  groups: ProjectFeishuGroupState[],
): ProjectFeishuGroupState[] => {
  if (typeof window !== 'undefined' && projectId) {
    try {
      window.localStorage.setItem(
        getStorageKey(projectId),
        JSON.stringify(groups),
      );
    } catch {
      // Ignore storage quota errors in prototype mode.
    }
  }

  emitFeishuCollectionChange(projectId);
  return groups;
};

export const getProjectFeishuGroupState = (
  projectId: number | string,
  chatId?: string,
): ProjectFeishuGroupState | null => {
  const groups = getProjectFeishuGroups(projectId);

  if (!groups.length) {
    return null;
  }

  if (chatId) {
    return groups.find(group => group.chatId === chatId) || groups[0];
  }

  return groups[0];
};

export const saveProjectFeishuGroupState = (
  projectId: number | string,
  state: ProjectFeishuGroupState,
): ProjectFeishuGroupState => {
  const existing = getProjectFeishuGroups(projectId);
  const hasExisting = existing.some(item => item.chatId === state.chatId);
  const nextGroups = hasExisting
    ? existing.map(item => (item.chatId === state.chatId ? state : item))
    : [state, ...existing];

  saveProjectFeishuGroups(projectId, nextGroups);
  return state;
};

export const getAllProjectFeishuGroups = (): ProjectFeishuGroupState[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const groups: ProjectFeishuGroupState[] = [];

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const projectId = key.slice(STORAGE_KEY_PREFIX.length);
        const projectGroups = getProjectFeishuGroups(projectId);
        groups.push(...projectGroups);
      }
    }
  } catch {
    return groups;
  }

  return groups.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
};

export const sendTextMessageInFeishuGroup = (params: {
  chatId?: string;
  content: string;
  projectId: number | string;
  senderName: string;
  senderRole: FeishuGroupMemberRole;
}): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(params.projectId, params.chatId);
  const trimmed = params.content.trim();

  if (!current || !trimmed) {
    return current;
  }

  const now = formatNowTime();
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const userMsg: FeishuGroupChatMessage = {
    content: trimmed,
    createdAt: now,
    id: `msg_txt_${stamp}`,
    senderName: params.senderName,
    senderRole: params.senderRole,
    type: 'customer_file',
  };

  const nextMessages: FeishuGroupChatMessage[] = [...current.messages, userMsg];
  const latestCandidate = current.candidates[0];

  if (
    trimmed.includes('@CarbonAgent') ||
    trimmed.includes('@carbonagent') ||
    trimmed.includes('缺什么') ||
    trimmed.includes('怎么填')
  ) {
    const botReplyContent =
      latestCandidate &&
      (trimmed.includes('缺') || trimmed.includes('missing'))
        ? I18N.template(I18N.carbonAgent.feishuStandaloneBotQaReplyMissing, {
            val1: latestCandidate.file.fileName,
          })
        : I18N.carbonAgent.feishuStandaloneBotQaReplyGeneral;

    nextMessages.push({
      content: botReplyContent,
      createdAt: now,
      id: `msg_bot_qa_${stamp}`,
      senderName: I18N.carbonAgent.feishuCollectBotName,
      senderRole: 'bot',
      type: 'bot',
    });
  } else if (latestCandidate && params.senderRole === 'customer') {
    const updatedCandidates = current.candidates.map((cand, idx) =>
      idx === 0
        ? {
            ...cand,
            note: cand.note ? `${cand.note}；${trimmed}` : trimmed,
          }
        : cand,
    );
    const botAckNote: FeishuGroupChatMessage = {
      content: I18N.template(I18N.carbonAgent.feishuCollectChatBotAckFile, {
        val1: latestCandidate.file.fileName,
        val2: `（已更新补充说明：${trimmed}）`,
      }),
      createdAt: now,
      id: `msg_bot_note_${stamp}`,
      senderName: I18N.carbonAgent.feishuCollectBotName,
      senderRole: 'bot',
      type: 'bot',
    };

    return saveProjectFeishuGroupState(params.projectId, {
      ...current,
      candidates: updatedCandidates,
      messages: [...nextMessages, botAckNote],
    });
  }

  return saveProjectFeishuGroupState(params.projectId, {
    ...current,
    messages: nextMessages,
  });
};

export const getProjectFeishuSyncedFiles = (
  projectId: number | string,
): AgentProjectFile[] => {
  const groups = getProjectFeishuGroups(projectId);
  const seenKeys = new Set<string>();
  const allFiles: AgentProjectFile[] = [];

  groups.forEach(group => {
    group.files.forEach(file => {
      const key = String(file.assetId || file.fileId);

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allFiles.push(file);
      }
    });
  });

  return allFiles;
};

export const getProjectFeishuCandidates = (
  projectId: number | string,
  taskId?: number | string,
): FeishuCollectedCandidate[] => {
  const groups = getProjectFeishuGroups(projectId);
  const allCandidates = groups.flatMap(group =>
    group.candidates.map(cand => ({
      ...cand,
      chatId: cand.chatId || group.chatId,
      groupName: cand.groupName || group.groupName,
    })),
  );

  if (taskId === undefined || taskId === null || taskId === '') {
    return allCandidates;
  }

  return allCandidates.filter(
    item => !item.taskId || String(item.taskId) === String(taskId),
  );
};

export const mergeProjectFilesWithFeishuFiles = (
  projectId: number | string,
  remoteFiles: AgentProjectFile[],
): AgentProjectFile[] => {
  const feishuFiles = getProjectFeishuSyncedFiles(projectId);

  if (!feishuFiles.length) {
    return remoteFiles;
  }

  const seenKeys = new Set<string>();
  const merged: AgentProjectFile[] = [];

  [...feishuFiles, ...remoteFiles].forEach(file => {
    const key = String(file.assetId || file.fileId);

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push(file);
    }
  });

  return merged;
};

const createSampleFileDataUrl = (
  fileName: string,
  groupName: string,
  senderName: string,
  note: string,
  summary: string,
) => {
  const content = [
    `File: ${fileName}`,
    `Feishu Group: ${groupName}`,
    `Sender: ${senderName}`,
    `Note: ${note}`,
    `Context Summary: ${summary}`,
  ].join('\n');

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
};

export const createProjectFeishuGroup = (params: {
  addMemberPermission?: FeishuAddMemberPermission;
  defaultTaskId: string;
  defaultTaskTitle: string;
  description?: string;
  externalCustomerOpenIds?: string[];
  groupMessageType?: FeishuGroupMessageType;
  groupName: string;
  joinMessageVisibility?: FeishuMemberVisibility;
  leaveMessageVisibility?: FeishuMemberVisibility;
  membershipApproval?: FeishuMembershipApproval;
  mode: 'bind' | 'create';
  ownerMemberId: string;
  ownerName: string;
  projectId: string;
  projectMembers: AgentProjectMember[];
  projectName: string;
  setBotManager?: boolean;
  shareCardPermission?: FeishuShareCardPermission;
}): ProjectFeishuGroupState => {
  const now = formatNowTime();
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const chatId = `oc_feishu_${params.projectId}_${Date.now().toString(36)}_${randomSuffix}`;
  const inviteUrl = `https://applink.feishu.cn/client/chat/chatter/add_by_link?chat_token=${chatId}`;
  const ownerOpenId = buildInternalOpenId(
    params.ownerMemberId,
    params.ownerName,
  );
  const staffMembers: FeishuGroupMember[] = params.projectMembers.length
    ? params.projectMembers.map(member => {
        const isOwner =
          String(member.memberId) === String(params.ownerMemberId) ||
          member.role === 'owner';

        return {
          id: `staff_${member.memberId}`,
          joinedAt: now,
          name: member.userName,
          openId: isOwner
            ? ownerOpenId
            : buildInternalOpenId(member.memberId, member.userName),
          role: isOwner ? 'owner' : 'staff',
          tenantType: 'internal',
        };
      })
    : [
        {
          id: 'staff_owner_default',
          joinedAt: now,
          name: params.ownerName || I18N.carbonAgent.feishuCollectOwnerDefault,
          openId: ownerOpenId,
          role: 'owner',
          tenantType: 'internal',
        },
      ];

  const botMember: FeishuGroupMember = {
    id: 'bot_carbon_agent',
    joinedAt: now,
    name: I18N.carbonAgent.feishuCollectBotName,
    openId: FEISHU_BOT_APP_ID,
    role: 'bot',
    tenantType: 'bot',
  };

  const p2pPool = getAuthorizedExternalP2pContacts();
  const selectedExternalIds =
    params.externalCustomerOpenIds && params.externalCustomerOpenIds.length
      ? params.externalCustomerOpenIds
      : [p2pPool[0]?.openId || 'ou_ext_7d8a6e22c91b401a'];

  const externalCustomers: FeishuGroupMember[] = selectedExternalIds.map(
    (extOpenId, idx) => {
      const matched = p2pPool.find(item => item.openId === extOpenId);
      return {
        companyName: matched?.companyName,
        id: `customer_${idx + 1}_${extOpenId.slice(-6)}`,
        joinedAt: now,
        name:
          matched?.name || I18N.carbonAgent.feishuCollectDefaultCustomer1,
        openId: extOpenId,
        p2pAuthorized: true,
        role: 'customer',
        tenantType: 'external',
      };
    },
  );

  const allMembers = [botMember, ...staffMembers, ...externalCustomers];
  const userIdList = allMembers
    .filter(member => member.role !== 'bot')
    .map(member => member.openId);

  const staffNames = staffMembers.map(member => member.name).join('、');
  const initialMessages: FeishuGroupChatMessage[] = [
    {
      content: I18N.template(I18N.carbonAgent.feishuCollectChatSystemCreated, {
        val1: params.groupName,
        val2: staffNames,
      }),
      createdAt: now,
      id: `msg_sys_${Date.now()}_1`,
      senderName: 'System',
      senderRole: 'system',
      type: 'system',
    },
    {
      content: I18N.carbonAgent.feishuCollectChatBotWelcome,
      createdAt: now,
      id: `msg_bot_${Date.now()}_2`,
      senderName: I18N.carbonAgent.feishuCollectBotName,
      senderRole: 'bot',
      type: 'bot',
    },
  ];

  const initialState: ProjectFeishuGroupState = {
    addMemberPermission: params.addMemberPermission || 'all_members',
    appId: FEISHU_BOT_APP_ID,
    botIdList: [FEISHU_BOT_APP_ID],
    candidates: [],
    chatId,
    chatMode: 'group',
    chatType: 'private',
    collectingEnabled: true,
    createdAt: now,
    defaultTaskId: params.defaultTaskId,
    defaultTaskTitle: params.defaultTaskTitle,
    description: params.description?.trim() || '',
    editPermission: 'only_owner',
    external: true,
    files: [],
    groupMessageType: params.groupMessageType || 'chat',
    groupName: params.groupName,
    inviteUrl,
    joinMessageVisibility: params.joinMessageVisibility || 'all_members',
    leaveMessageVisibility: params.leaveMessageVisibility || 'only_owner',
    members: allMembers,
    membershipApproval: params.membershipApproval || 'no_approval_required',
    messages: initialMessages,
    mode: params.mode,
    ownerId: ownerOpenId,
    ownerMemberId: params.ownerMemberId,
    ownerName: params.ownerName,
    projectId: params.projectId,
    projectName: params.projectName,
    setBotManager: params.setBotManager ?? true,
    shareCardPermission: params.shareCardPermission || 'allowed',
    userIdList,
    userIdType: 'open_id',
    uuid: `uuid_${params.projectId}_${Date.now().toString(36)}`,
  };

  return saveProjectFeishuGroupState(params.projectId, initialState);
};

export const toggleProjectFeishuCollection = (
  projectId: number | string,
  collectingEnabled: boolean,
  chatId?: string,
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId, chatId);

  if (!current) {
    return null;
  }

  return saveProjectFeishuGroupState(projectId, {
    ...current,
    collectingEnabled,
  });
};

export const updateProjectFeishuDefaultTask = (
  projectId: number | string,
  defaultTaskId: string,
  defaultTaskTitle: string,
  chatId?: string,
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId, chatId);

  if (!current) {
    return null;
  }

  return saveProjectFeishuGroupState(projectId, {
    ...current,
    defaultTaskId,
    defaultTaskTitle,
  });
};

export const addExternalCustomerToFeishuGroup = (
  projectId: number | string,
  customerName: string,
  inviterName?: string,
  chatId?: string,
  openId?: string,
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId, chatId);
  const trimmedName = customerName.trim();

  if (!current || !trimmedName) {
    return current;
  }

  const now = formatNowTime();
  const resolvedOpenId = openId || buildExternalOpenId(trimmedName);
  const nextMember: FeishuGroupMember = {
    id: `customer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    joinedAt: now,
    name: trimmedName,
    openId: resolvedOpenId,
    p2pAuthorized: true,
    role: 'customer',
    tenantType: 'external',
  };
  const joinMessage: FeishuGroupChatMessage = {
    content: I18N.template(
      I18N.carbonAgent.feishuCollectChatSystemCustomerJoined,
      {
        val1:
          inviterName ||
          current.ownerName ||
          I18N.carbonAgent.feishuCollectOwnerDefault,
        val2: `${trimmedName} (${resolvedOpenId})`,
      },
    ),
    createdAt: now,
    id: `msg_join_${Date.now()}`,
    senderName: 'System',
    senderRole: 'system',
    type: 'system',
  };

  return saveProjectFeishuGroupState(projectId, {
    ...current,
    members: [...current.members, nextMember],
    messages: [...current.messages, joinMessage],
    userIdList: Array.from(new Set([...current.userIdList, resolvedOpenId])),
  });
};

export const receiveCustomerFileInFeishuGroup = (params: {
  chatId?: string;
  downloadUrl?: string;
  fileId?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  note: string;
  projectId: number | string;
  senderName: string;
  streamBotReply?: boolean;
  summary: string;
  taskId?: string;
  taskTitle?: string;
  uploadedProjectFile?: AgentProjectFile;
}): {
  botMessageId: string;
  file: AgentProjectFile;
  fullBotContent: string;
  state: ProjectFeishuGroupState;
} | null => {
  const current = getProjectFeishuGroupState(params.projectId, params.chatId);

  if (!current) {
    return null;
  }

  const now = formatNowTime();
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const assetId =
    params.uploadedProjectFile?.assetId || `feishu_asset_${stamp}`;
  const fileId = params.uploadedProjectFile?.fileId || params.fileId || `feishu_file_${stamp}`;
  const targetTaskId = params.taskId ?? current.defaultTaskId;
  const targetTaskTitle = params.taskTitle ?? current.defaultTaskTitle;
  const downloadUrl =
    params.uploadedProjectFile?.downloadUrl ||
    params.downloadUrl ||
    createSampleFileDataUrl(
      params.fileName,
      current.groupName,
      params.senderName,
      params.note,
      params.summary,
    );

  const syncedFile: AgentProjectFile = {
    assetId,
    canDelete: false,
    createTime: params.uploadedProjectFile?.createTime || now,
    downloadUrl,
    fileId,
    fileName: params.uploadedProjectFile?.fileName || params.fileName,
    fileSize: params.uploadedProjectFile?.fileSize || params.fileSize || 18432,
    fileType:
      params.uploadedProjectFile?.fileType ||
      params.fileType ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    projectId: params.projectId,
    uploaderCompanyName: current.groupName,
    uploaderUserName: `${params.senderName} · ${I18N.carbonAgent.feishuCollectSyncedBadge}`,
    version: 1,
  };

  const customerMsg: FeishuGroupChatMessage = {
    content: I18N.template(
      I18N.carbonAgent.feishuCollectChatCustomerSentFile,
      {
        val1: syncedFile.fileName,
      },
    ),
    createdAt: now,
    file: syncedFile,
    id: `msg_cust_${stamp}`,
    note: params.note,
    senderName: params.senderName,
    senderRole: 'customer',
    taskId: targetTaskId || undefined,
    taskTitle: targetTaskTitle || undefined,
    type: 'customer_file',
  };

  const taskSuffix = targetTaskTitle
    ? I18N.template(I18N.carbonAgent.feishuCollectChatBotAckTaskSuffix, {
        val1: targetTaskTitle,
      })
    : '';

  const fullBotContent = I18N.template(
    I18N.carbonAgent.feishuStreamOutputTemplate,
    {
      val1: syncedFile.fileName,
      val2: params.senderName,
      val3: params.summary,
      val4: params.note || params.summary,
      val5: taskSuffix,
    },
  );
  const botMessageId = `msg_bot_ack_${stamp}`;
  const botAckMsg: FeishuGroupChatMessage = {
    content: params.streamBotReply
      ? I18N.carbonAgent.feishuStreamStageReceiving
      : fullBotContent,
    createdAt: now,
    file: syncedFile,
    id: botMessageId,
    note: params.streamBotReply
      ? I18N.carbonAgent.feishuStreamStageParsing
      : I18N.carbonAgent.feishuStreamStageDone,
    senderName: I18N.carbonAgent.feishuCollectBotName,
    senderRole: 'bot',
    streaming: Boolean(params.streamBotReply),
    taskId: targetTaskId || undefined,
    taskTitle: targetTaskTitle || undefined,
    type: 'bot',
  };

  const candidate: FeishuCollectedCandidate = {
    adopted: false,
    chatId: current.chatId,
    createdAt: now,
    file: syncedFile,
    groupName: current.groupName,
    id: `cand_${stamp}`,
    note: params.note || params.summary,
    senderName: params.senderName,
    senderOpenId: current.members.find(m => m.name === params.senderName)
      ?.openId,
    summary: params.summary,
    taskId: targetTaskId || undefined,
    taskTitle: targetTaskTitle || undefined,
  };

  const nextFiles = current.collectingEnabled
    ? [
        syncedFile,
        ...current.files.filter(
          existing =>
            String(existing.assetId || existing.fileId) !==
            String(syncedFile.assetId || syncedFile.fileId),
        ),
      ]
    : current.files;

  const nextCandidates = current.collectingEnabled
    ? [candidate, ...current.candidates]
    : current.candidates;

  const nextState = saveProjectFeishuGroupState(params.projectId, {
    ...current,
    candidates: nextCandidates,
    files: nextFiles,
    messages: current.collectingEnabled
      ? [...current.messages, customerMsg, botAckMsg]
      : [...current.messages, customerMsg],
  });

  return {
    botMessageId,
    file: syncedFile,
    fullBotContent,
    state: nextState,
  };
};

export const updateFeishuGroupBotMessage = (params: {
  chatId?: string;
  content: string;
  messageId: string;
  note?: string;
  projectId: number | string;
  streaming: boolean;
}): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(params.projectId, params.chatId);

  if (!current) {
    return null;
  }

  return saveProjectFeishuGroupState(params.projectId, {
    ...current,
    messages: current.messages.map(msg =>
      msg.id === params.messageId
        ? {
            ...msg,
            content: params.content,
            note: params.note ?? msg.note,
            streaming: params.streaming,
          }
        : msg,
    ),
  });
};

export const markFeishuCandidateAdopted = (
  projectId: number | string,
  candidateId: string,
): ProjectFeishuGroupState | null => {
  const groups = getProjectFeishuGroups(projectId);

  if (!groups.length) {
    return null;
  }

  let updatedGroup: ProjectFeishuGroupState | null = null;
  const nextGroups = groups.map(group => {
    if (!group.candidates.some(c => c.id === candidateId)) {
      return group;
    }

    const nextGroup: ProjectFeishuGroupState = {
      ...group,
      candidates: group.candidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, adopted: true }
          : candidate,
      ),
    };
    updatedGroup = nextGroup;
    return nextGroup;
  });

  saveProjectFeishuGroups(projectId, nextGroups);
  return updatedGroup || nextGroups[0];
};

