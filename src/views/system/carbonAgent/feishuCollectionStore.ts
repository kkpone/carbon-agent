import I18N from '@src/lang/I18N';

import type { AgentProjectFile, AgentProjectMember } from './service';

export type FeishuGroupMemberRole = 'bot' | 'customer' | 'owner' | 'staff';

export type FeishuGroupMember = {
  companyName?: string;
  id: string;
  joinedAt: string;
  name: string;
  role: FeishuGroupMemberRole;
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
  taskId?: string;
  taskTitle?: string;
  type: FeishuGroupChatMessageType;
};

export type FeishuCollectedCandidate = {
  adopted?: boolean;
  createdAt: string;
  file: AgentProjectFile;
  groupName: string;
  id: string;
  note: string;
  senderName: string;
  summary: string;
  taskId?: string;
  taskTitle?: string;
};

export type ProjectFeishuGroupState = {
  candidates: FeishuCollectedCandidate[];
  chatId: string;
  collectingEnabled: boolean;
  createdAt: string;
  defaultTaskId: string;
  defaultTaskTitle: string;
  files: AgentProjectFile[];
  groupName: string;
  inviteUrl: string;
  members: FeishuGroupMember[];
  messages: FeishuGroupChatMessage[];
  mode: 'bind' | 'create';
  ownerMemberId: string;
  ownerName: string;
  projectId: string;
  projectName: string;
};

const STORAGE_KEY_PREFIX = 'carbon_agent_feishu_collect_v1:';
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

export const getProjectFeishuGroupState = (
  projectId: number | string,
): ProjectFeishuGroupState | null => {
  if (typeof window === 'undefined' || !projectId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(projectId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ProjectFeishuGroupState;

    if (!parsed || typeof parsed !== 'object' || !parsed.chatId) {
      return null;
    }

    return {
      ...parsed,
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
      files: Array.isArray(parsed.files) ? parsed.files : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    return null;
  }
};

export const saveProjectFeishuGroupState = (
  projectId: number | string,
  state: ProjectFeishuGroupState,
): ProjectFeishuGroupState => {
  if (typeof window !== 'undefined' && projectId) {
    try {
      window.localStorage.setItem(
        getStorageKey(projectId),
        JSON.stringify(state),
      );
    } catch {
      // Ignore storage quota errors in prototype mode.
    }
  }

  emitFeishuCollectionChange(projectId);
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
        const state = getProjectFeishuGroupState(projectId);

        if (state) {
          groups.push(state);
        }
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
  content: string;
  projectId: number | string;
  senderName: string;
  senderRole: FeishuGroupMemberRole;
}): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(params.projectId);
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
  const state = getProjectFeishuGroupState(projectId);

  return state?.files || [];
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
  defaultTaskId: string;
  defaultTaskTitle: string;
  groupName: string;
  mode: 'bind' | 'create';
  ownerMemberId: string;
  ownerName: string;
  projectId: string;
  projectMembers: AgentProjectMember[];
  projectName: string;
}): ProjectFeishuGroupState => {
  const now = formatNowTime();
  const chatId = `oc_feishu_${params.projectId}_${Date.now().toString(36)}`;
  const inviteUrl = `https://applink.feishu.cn/client/chat/chatter/add_by_link?chat_token=${chatId}`;
  const staffMembers: FeishuGroupMember[] = params.projectMembers.length
    ? params.projectMembers.map(member => ({
        id: `staff_${member.memberId}`,
        joinedAt: now,
        name: member.userName,
        role:
          String(member.memberId) === String(params.ownerMemberId) ||
          member.role === 'owner'
            ? 'owner'
            : 'staff',
      }))
    : [
        {
          id: 'staff_owner_default',
          joinedAt: now,
          name: params.ownerName || I18N.carbonAgent.feishuCollectOwnerDefault,
          role: 'owner',
        },
      ];

  const botMember: FeishuGroupMember = {
    id: 'bot_carbon_agent',
    joinedAt: now,
    name: I18N.carbonAgent.feishuCollectBotName,
    role: 'bot',
  };

  const defaultCustomer: FeishuGroupMember = {
    id: 'customer_default_1',
    joinedAt: now,
    name: I18N.carbonAgent.feishuCollectDefaultCustomer1,
    role: 'customer',
  };

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
    candidates: [],
    chatId,
    collectingEnabled: true,
    createdAt: now,
    defaultTaskId: params.defaultTaskId,
    defaultTaskTitle: params.defaultTaskTitle,
    files: [],
    groupName: params.groupName,
    inviteUrl,
    members: [botMember, ...staffMembers, defaultCustomer],
    messages: initialMessages,
    mode: params.mode,
    ownerMemberId: params.ownerMemberId,
    ownerName: params.ownerName,
    projectId: params.projectId,
    projectName: params.projectName,
  };

  return saveProjectFeishuGroupState(params.projectId, initialState);
};

export const toggleProjectFeishuCollection = (
  projectId: number | string,
  collectingEnabled: boolean,
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId);

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
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId);

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
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId);
  const trimmedName = customerName.trim();

  if (!current || !trimmedName) {
    return current;
  }

  const now = formatNowTime();
  const nextMember: FeishuGroupMember = {
    id: `customer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    joinedAt: now,
    name: trimmedName,
    role: 'customer',
  };
  const joinMessage: FeishuGroupChatMessage = {
    content: I18N.template(
      I18N.carbonAgent.feishuCollectChatSystemCustomerJoined,
      {
        val1:
          inviterName ||
          current.ownerName ||
          I18N.carbonAgent.feishuCollectOwnerDefault,
        val2: trimmedName,
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
  });
};

export const receiveCustomerFileInFeishuGroup = (params: {
  downloadUrl?: string;
  fileId?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  note: string;
  projectId: number | string;
  senderName: string;
  summary: string;
  taskId?: string;
  taskTitle?: string;
  uploadedProjectFile?: AgentProjectFile;
}): {
  file: AgentProjectFile;
  state: ProjectFeishuGroupState;
} | null => {
  const current = getProjectFeishuGroupState(params.projectId);

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

  const botAckMsg: FeishuGroupChatMessage = {
    content: I18N.template(I18N.carbonAgent.feishuCollectChatBotAckFile, {
      val1: syncedFile.fileName,
      val2: taskSuffix,
    }),
    createdAt: now,
    file: syncedFile,
    id: `msg_bot_ack_${stamp}`,
    note: params.summary,
    senderName: I18N.carbonAgent.feishuCollectBotName,
    senderRole: 'bot',
    taskId: targetTaskId || undefined,
    taskTitle: targetTaskTitle || undefined,
    type: 'bot',
  };

  const candidate: FeishuCollectedCandidate = {
    adopted: false,
    createdAt: now,
    file: syncedFile,
    groupName: current.groupName,
    id: `cand_${stamp}`,
    note: params.note || params.summary,
    senderName: params.senderName,
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
    file: syncedFile,
    state: nextState,
  };
};

export const markFeishuCandidateAdopted = (
  projectId: number | string,
  candidateId: string,
): ProjectFeishuGroupState | null => {
  const current = getProjectFeishuGroupState(projectId);

  if (!current) {
    return null;
  }

  return saveProjectFeishuGroupState(projectId, {
    ...current,
    candidates: current.candidates.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, adopted: true }
        : candidate,
    ),
  });
};

