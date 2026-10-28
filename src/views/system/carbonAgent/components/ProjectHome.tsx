import projectArrowIcon from '@src/assets/images/carbonAgent/icons/project-home-arrow.svg';
import projectDownloadIcon from '@src/assets/images/carbonAgent/icons/project-home-download.svg';
import projectFeishuIcon from '@src/assets/images/carbonAgent/icons/project-home-feishu.svg';
import projectInviteIcon from '@src/assets/images/carbonAgent/icons/project-home-invite.svg';
import projectOverviewIcon from '@src/assets/images/carbonAgent/icons/project-home-overview.svg';
import projectSettingsIcon from '@src/assets/images/carbonAgent/icons/project-home-settings.svg';
import projectUploadIcon from '@src/assets/images/carbonAgent/icons/project-home-upload.svg';
import projectMemberAvatar from '@src/assets/images/carbonAgent/icons/project-member-avatar.svg';
import projectMemberClose from '@src/assets/images/carbonAgent/icons/project-member-close.svg';
import projectMemberLink from '@src/assets/images/carbonAgent/icons/project-member-link.svg';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { copyToClipboard } from '@src/utils/clipboard';
import {
  ConfigProvider,
  Modal,
  Popover,
  Select,
  message as antdMessage,
} from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import {
  type ChangeEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import type {
  AgentEnterpriseBusinessCapabilities,
  AgentProject,
} from '../constants';
import {
  FEISHU_COLLECTION_CHANGE_EVENT,
  type ProjectFeishuGroupState,
  getProjectFeishuGroupState,
  mergeProjectFilesWithFeishuFiles,
} from '../feishuCollectionStore';
import style from '../index.module.less';
import {
  hasEnterpriseBusinessCapability,
  isEnterpriseCarbonAgentProject,
} from '../permissions';
import { fetchEnterpriseCarbonProjectTodos } from './EnterpriseCarbonProjectTasks/service';
import { ENTERPRISE_CARBON_TASK_STATUS_LABELS } from './EnterpriseCarbonProjectTasks/status';
import type { EnterpriseCarbonProjectTodo } from './EnterpriseCarbonProjectTasks/type';
import ProjectFeishuCollectionDialog from './ProjectFeishuCollectionDialog';
import mobileStyle from './ProjectHome.mobile.module.less';
import {
  type AgentProjectFile,
  type AgentEnterpriseProjectEditableMemberRole,
  type AgentEnterpriseProjectMemberRole,
  type AgentProjectMember,
  type AgentProjectSuggestion,
  type AgentProjectTask,
  createAgentProjectInviteLink,
  fetchAgentProjectConfig,
  fetchAgentProjectDetail,
  fetchAgentProjectFileDownloadUrl,
  fetchAgentProjectFiles,
  fetchAgentProjectMembers,
  fetchAgentProjectSuggestions,
  fetchAgentProjectTasks,
  removeAgentProjectMember,
  updateAgentProjectMemberRole,
  uploadAgentProjectFile,
} from '../service';
import ProjectTaskDetailDrawer from './ProjectTaskDetailDrawer';

const PROJECT_MEMBER_ROLE_THEME = {
  components: {
    Select: {
      controlHeight: 32,
    },
  },
};

const normalizeEnterpriseProjectMemberRole = (
  role: AgentProjectMember['role'],
): AgentEnterpriseProjectMemberRole => {
  if (role === 'owner') {
    return 'owner';
  }

  return role === 'admin' ? 'admin' : 'member';
};

const getEnterpriseProjectMemberRoleName = (
  role: AgentEnterpriseProjectMemberRole,
) => {
  if (role === 'owner') {
    return I18N.carbonAgent.projectMemberRoleOwner;
  }

  return role === 'admin'
    ? I18N.carbonAgent.projectMemberRoleAdmin
    : I18N.carbonAgent.projectMemberRoleMember;
};

type ProjectHomeProps = {
  composer: ReactNode;
  isMobile?: boolean;
  onOpenOverview: () => void;
  onOpenSettings: () => void;
  onOpenTasks: (taskId?: string) => void;
  onProjectFileContextSelect?: (
    file: AgentProjectFile,
    promptText?: string,
  ) => void;
  onSuggestionSelect: (suggestion: AgentProjectSuggestion) => Promise<void>;
  onTaskConversationStart: (taskId: string) => void;
  projectId: string;
  refreshKey?: number;
};

type ProjectHomeData = {
  files: PromiseSettledResult<AgentProjectFile[]>;
  project: PromiseSettledResult<AgentProject>;
  tasks: PromiseSettledResult<ProjectHomeTask[]>;
};

type ProjectHomeTask =
  | EnterpriseCarbonProjectTodo
  | Pick<
      AgentProjectTask,
      | 'dueTime'
      | 'sourceTypeName'
      | 'statusName'
      | 'taskDescription'
      | 'taskId'
      | 'taskTitle'
    >;

const fetchProjectHomeTasks = (
  project: AgentProject,
  signal: AbortSignal,
): Promise<ProjectHomeTask[]> => {
  const projectId = String(project.id);

  if (isEnterpriseCarbonAgentProject(project)) {
    return fetchEnterpriseCarbonProjectTodos(projectId, signal);
  }

  return fetchAgentProjectTasks(
    projectId,
    {
      keyword: '',
      mineOnly: true,
      overdueOnly: false,
      pageNum: 1,
      pageSize: 20,
      status: '',
    },
    signal,
  ).then(page => page.items);
};

const loadProjectHomeData = async (
  projectId: string,
  signal: AbortSignal,
): Promise<ProjectHomeData> => {
  const filesPromise = fetchAgentProjectFiles(projectId, signal);
  const [project] = await Promise.allSettled([
    fetchAgentProjectDetail(projectId, signal),
  ]);
  const tasksPromise =
    project.status === 'fulfilled'
      ? fetchProjectHomeTasks(project.value, signal)
      : Promise.reject(project.reason);
  const [files, tasks] = await Promise.allSettled([filesPromise, tasksPromise]);

  return { files, project, tasks };
};

const formatFileSize = (
  fileSize: number | undefined,
  numberFormatter: Intl.NumberFormat,
) => {
  if (!fileSize || fileSize < 0) {
    return '';
  }

  if (fileSize < 1024) {
    return `${numberFormatter.format(fileSize)}\u00A0B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${numberFormatter.format(fileSize / 1024)}\u00A0KB`;
  }

  return `${numberFormatter.format(fileSize / (1024 * 1024))}\u00A0MB`;
};

const formatFileDate = (
  createTime: string | null | undefined,
  dateFormatter: Intl.DateTimeFormat,
) => {
  if (!createTime) {
    return '';
  }

  const date = new Date(createTime.replace(' ', 'T'));

  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};

const formatTaskDueDate = (
  dueTime: string | null | undefined,
  dateFormatter: Intl.DateTimeFormat,
) => {
  if (!dueTime) {
    return '';
  }

  const date = new Date(dueTime.replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const dateParts = dateFormatter.formatToParts(date);
  const month = dateParts.find(part => part.type === 'month')?.value;
  const day = dateParts.find(part => part.type === 'day')?.value;

  return month && day ? `${month}–${day}` : dateFormatter.format(date);
};

const getFileMeta = (
  file: AgentProjectFile,
  dateFormatter: Intl.DateTimeFormat,
  numberFormatter: Intl.NumberFormat,
) =>
  [
    file.uploaderUserName || file.uploaderCompanyName,
    formatFileSize(file.fileSize, numberFormatter),
    formatFileDate(file.createTime, dateFormatter),
  ]
    .filter(Boolean)
    .join(' · ');

const getProjectFileKey = (file: AgentProjectFile) =>
  String(file.assetId || file.fileId);

const ProjectHome = ({
  composer,
  isMobile = false,
  onOpenOverview,
  onOpenSettings,
  onOpenTasks,
  onProjectFileContextSelect,
  onSuggestionSelect,
  onTaskConversationStart,
  projectId,
  refreshKey = 0,
}: ProjectHomeProps) => {
  const { locale } = useContext(LocaleContext);
  const fallbackProjectName = I18N.template(I18N.carbonAgent.projectWithId, {
    val1: projectId,
  });
  const [projectName, setProjectName] = useState(fallbackProjectName);
  const [projectBusinessType, setProjectBusinessType] = useState('');
  const [projectBusinessCapabilities, setProjectBusinessCapabilities] =
    useState<AgentEnterpriseBusinessCapabilities>();
  const [projectManageable, setProjectManageable] = useState(false);
  const [projectMemberCount, setProjectMemberCount] = useState(0);
  const [maxProjectMembers, setMaxProjectMembers] = useState<number>();
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [members, setMembers] = useState<AgentProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<AgentProjectMember>();
  const [removingMemberKey, setRemovingMemberKey] = useState<string>();
  const [updatingMemberRoleKey, setUpdatingMemberRoleKey] = useState<string>();
  const [inviteLinkCreating, setInviteLinkCreating] = useState(false);
  const [tasks, setTasks] = useState<ProjectHomeTask[]>([]);
  const [suggestions, setSuggestions] = useState<AgentProjectSuggestion[]>([]);
  const [suggestionSubmittingId, setSuggestionSubmittingId] = useState('');
  const [suggestionRefreshKey, setSuggestionRefreshKey] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [tasksError, setTasksError] = useState(false);
  const [files, setFiles] = useState<AgentProjectFile[]>([]);
  const [projectDataLoading, setProjectDataLoading] = useState(true);
  const [filesError, setFilesError] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [downloadingFileKey, setDownloadingFileKey] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);
  const [feishuDialogOpen, setFeishuDialogOpen] = useState(false);
  const [feishuGroupState, setFeishuGroupState] =
    useState<ProjectFeishuGroupState | null>(() =>
      getProjectFeishuGroupState(projectId),
    );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const componentMountedRef = useRef(true);
  const projectMemberPanelRef = useRef<HTMLDivElement>(null);
  const memberPopoverDismissedRef = useRef(false);
  const memberRequestIdRef = useRef(0);
  const memberRoleRequestIdRef = useRef(0);
  const inviteRequestIdRef = useRef(0);
  const projectIdRef = useRef(projectId);
  const suggestionRequestIdRef = useRef(0);
  const suggestionSubmittingIdRef = useRef('');
  projectIdRef.current = projectId;
  const isEnterpriseCarbonProject = isEnterpriseCarbonAgentProject({
    businessType: projectBusinessType,
  });
  const canManageProject = isEnterpriseCarbonProject
    ? hasEnterpriseBusinessCapability(
        projectBusinessCapabilities,
        'canManageProject',
      )
    : projectManageable;
  const canManageMemberRole = isEnterpriseCarbonProject
    ? hasEnterpriseBusinessCapability(
        projectBusinessCapabilities,
        'canManageMemberRole',
      )
    : projectManageable;
  const canInviteMember = isEnterpriseCarbonProject
    ? hasEnterpriseBusinessCapability(
        projectBusinessCapabilities,
        'canInviteMember',
      )
    : projectManageable;
  const canAccessProjectMembers = canManageMemberRole || canInviteMember;
  const enterpriseMemberRoleOptions: {
    disabled?: boolean;
    label: string;
    value: AgentEnterpriseProjectMemberRole;
  }[] = [
    {
      disabled: true,
      label: I18N.carbonAgent.projectMemberRoleOwner,
      value: 'owner',
    },
    {
      label: I18N.carbonAgent.projectMemberRoleAdmin,
      value: 'admin',
    },
    {
      label: I18N.carbonAgent.projectMemberRoleMember,
      value: 'member',
    },
  ];
  const fileDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [locale],
  );
  const fileNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale],
  );
  const taskDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
      }),
    [locale],
  );
  useEffect(() => {
    componentMountedRef.current = true;

    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedTaskId('');
    setSuggestionSubmittingId('');
    suggestionRequestIdRef.current += 1;
    suggestionSubmittingIdRef.current = '';
    setFeishuDialogOpen(false);
    setFeishuGroupState(getProjectFeishuGroupState(projectId));
  }, [projectId]);

  useEffect(() => {
    const syncFeishuState = () => {
      setFeishuGroupState(getProjectFeishuGroupState(projectId));
      setFiles(currentFiles =>
        mergeProjectFilesWithFeishuFiles(projectId, currentFiles),
      );
    };

    window.addEventListener(FEISHU_COLLECTION_CHANGE_EVENT, syncFeishuState);
    return () => {
      window.removeEventListener(
        FEISHU_COLLECTION_CHANGE_EVENT,
        syncFeishuState,
      );
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setSuggestions([]);
    fetchAgentProjectSuggestions(projectId, locale, abortController.signal)
      .then(nextSuggestions => {
        if (!cancelled) {
          setSuggestions(nextSuggestions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [locale, projectId, suggestionRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setMaxProjectMembers(undefined);
    fetchAgentProjectConfig(
      serviceLangMap[locale] || 'zh',
      abortController.signal,
    )
      .then(config => {
        if (!cancelled) {
          setMaxProjectMembers(config.maxMembers);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMaxProjectMembers(undefined);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setProjectName(fallbackProjectName);
    setProjectBusinessType('');
    setProjectBusinessCapabilities(undefined);
    setProjectManageable(false);
    setProjectMemberCount(0);
    setMemberPopoverOpen(false);
    memberPopoverDismissedRef.current = false;
    setMembers([]);
    setMembersLoading(false);
    setMembersError(false);
    setMemberPendingRemoval(undefined);
    setRemovingMemberKey(undefined);
    setUpdatingMemberRoleKey(undefined);
    setInviteLinkCreating(false);
    memberRequestIdRef.current += 1;
    memberRoleRequestIdRef.current += 1;
    inviteRequestIdRef.current += 1;
    setTasks([]);
    setTasksError(false);
    setFiles([]);
    setProjectDataLoading(true);
    setFilesError(false);
    setFileUploading(false);
    setDownloadingFileKey(undefined);

    loadProjectHomeData(projectId, abortController.signal)
      .then(result => {
        if (cancelled) {
          return;
        }

        if (result.project.status === 'fulfilled') {
          const project = result.project.value;

          setProjectName(project.name || fallbackProjectName);
          setProjectBusinessType(project.businessType || '');
          setProjectBusinessCapabilities(project.businessCapabilities);
          setProjectManageable(project.manageable === true);
          setProjectMemberCount(project.memberCount || 0);
        }

        if (result.files.status === 'fulfilled') {
          setFiles(result.files.value);
          setFilesError(false);
        } else {
          setFilesError(true);
        }

        if (result.tasks.status === 'fulfilled') {
          setTasks(result.tasks.value);
          setTasksError(false);
        } else {
          setTasksError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProjectDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [fallbackProjectName, projectId, refreshKey, retryKey]);

  const loadProjectMembers = () => {
    if (!canAccessProjectMembers) {
      return;
    }

    const memberProjectId = projectId;
    const requestId = memberRequestIdRef.current + 1;
    memberRequestIdRef.current = requestId;
    setMembersLoading(true);
    setMembersError(false);

    fetchAgentProjectMembers(memberProjectId)
      .then(projectMembers => {
        if (
          projectIdRef.current === memberProjectId &&
          memberRequestIdRef.current === requestId
        ) {
          setMembers(projectMembers);
          setProjectMemberCount(projectMembers.length);
          setMembersError(false);
        }
      })
      .catch(() => {
        if (
          projectIdRef.current === memberProjectId &&
          memberRequestIdRef.current === requestId
        ) {
          setMembersError(true);
        }
      })
      .finally(() => {
        if (
          projectIdRef.current === memberProjectId &&
          memberRequestIdRef.current === requestId
        ) {
          setMembersLoading(false);
        }
      });
  };

  const handleMemberPopoverOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !canAccessProjectMembers) {
      return;
    }

    if (nextOpen && memberPopoverDismissedRef.current) {
      return;
    }

    setMemberPopoverOpen(nextOpen);

    if (nextOpen) {
      loadProjectMembers();
    }
  };

  const handleMemberPopoverClose = () => {
    memberPopoverDismissedRef.current = true;
    setMemberPopoverOpen(false);
  };

  const handleProjectMemberRemove = async (member: AgentProjectMember) => {
    if (
      !canManageMemberRole ||
      member.currentUser ||
      member.role === 'owner' ||
      removingMemberKey ||
      updatingMemberRoleKey
    ) {
      return;
    }

    const memberProjectId = projectId;
    const memberKey = String(member.memberId);
    setRemovingMemberKey(memberKey);

    try {
      await removeAgentProjectMember(memberProjectId, member.memberId);

      if (projectIdRef.current !== memberProjectId) {
        return;
      }

      setMembers(currentMembers =>
        currentMembers.filter(
          currentMember => String(currentMember.memberId) !== memberKey,
        ),
      );
      setProjectMemberCount(currentCount => Math.max(currentCount - 1, 0));
      setMemberPendingRemoval(currentMember =>
        String(currentMember?.memberId) === memberKey
          ? undefined
          : currentMember,
      );
      antdMessage.success(
        I18N.template(I18N.carbonAgent.projectMemberRemoveSuccess, {
          val1: member.userName,
        }),
      );

      try {
        const refreshedMembers = await fetchAgentProjectMembers(
          memberProjectId,
        );

        if (projectIdRef.current === memberProjectId) {
          setMembers(refreshedMembers);
          setProjectMemberCount(refreshedMembers.length);
        }
      } catch {
        // The removed member is already hidden; retain that state if refresh fails.
      }
    } catch (error) {
      if (projectIdRef.current !== memberProjectId) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.projectMemberRemoveFailed;

      antdMessage.error(errorMessage);
    } finally {
      if (projectIdRef.current === memberProjectId) {
        setRemovingMemberKey(currentMemberKey =>
          currentMemberKey === memberKey ? undefined : currentMemberKey,
        );
      }
    }
  };

  const handleProjectMemberRoleChange = async (
    member: AgentProjectMember,
    nextRole: AgentEnterpriseProjectMemberRole,
  ) => {
    if (
      !isEnterpriseCarbonProject ||
      !canManageMemberRole ||
      member.currentUser ||
      member.role === 'owner' ||
      nextRole === 'owner' ||
      removingMemberKey ||
      updatingMemberRoleKey ||
      normalizeEnterpriseProjectMemberRole(member.role) === nextRole
    ) {
      return;
    }

    const memberProjectId = projectId;
    const memberKey = String(member.memberId);
    const requestId = memberRoleRequestIdRef.current + 1;
    const editableNextRole: AgentEnterpriseProjectEditableMemberRole = nextRole;
    const nextRoleName = getEnterpriseProjectMemberRoleName(editableNextRole);
    memberRoleRequestIdRef.current = requestId;
    setUpdatingMemberRoleKey(memberKey);
    setMembers(currentMembers =>
      currentMembers.map(currentMember =>
        String(currentMember.memberId) === memberKey
          ? {
              ...currentMember,
              role: editableNextRole,
              roleName: nextRoleName,
            }
          : currentMember,
      ),
    );

    try {
      const updatedMember = await updateAgentProjectMemberRole(
        memberProjectId,
        member.memberId,
        { role: editableNextRole },
      );

      if (
        projectIdRef.current !== memberProjectId ||
        memberRoleRequestIdRef.current !== requestId
      ) {
        return;
      }

      setMembers(currentMembers =>
        currentMembers.map(currentMember =>
          String(currentMember.memberId) === memberKey
            ? updatedMember
            : currentMember,
        ),
      );
      antdMessage.success(
        I18N.template(I18N.carbonAgent.projectMemberRoleUpdateSuccess, {
          val1: member.userName,
          val2: nextRoleName,
        }),
      );

      try {
        const refreshedMembers = await fetchAgentProjectMembers(
          memberProjectId,
        );

        if (
          projectIdRef.current === memberProjectId &&
          memberRoleRequestIdRef.current === requestId
        ) {
          setMembers(refreshedMembers);
          setProjectMemberCount(refreshedMembers.length);
        }
      } catch {
        // The update response is authoritative enough to keep if refresh fails.
      }
    } catch (error) {
      if (
        projectIdRef.current !== memberProjectId ||
        memberRoleRequestIdRef.current !== requestId
      ) {
        return;
      }

      setMembers(currentMembers =>
        currentMembers.map(currentMember =>
          String(currentMember.memberId) === memberKey ? member : currentMember,
        ),
      );
      antdMessage.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.projectMemberRoleUpdateFailed,
      );
    } finally {
      if (
        projectIdRef.current === memberProjectId &&
        memberRoleRequestIdRef.current === requestId
      ) {
        setUpdatingMemberRoleKey(currentMemberKey =>
          currentMemberKey === memberKey ? undefined : currentMemberKey,
        );
      }
    }
  };

  const handleCopyProjectInviteLink = async () => {
    if (!canInviteMember || inviteLinkCreating || inviteLimitReached) {
      return;
    }

    const inviteProjectId = projectId;
    const requestId = inviteRequestIdRef.current + 1;
    inviteRequestIdRef.current = requestId;
    setInviteLinkCreating(true);

    try {
      const inviteUrlPromise = createAgentProjectInviteLink(
        inviteProjectId,
      ).then(inviteLink =>
        new URL(inviteLink.inviteUrl, window.location.origin).toString(),
      );

      await copyToClipboard(inviteUrlPromise);

      if (
        projectIdRef.current !== inviteProjectId ||
        inviteRequestIdRef.current !== requestId
      ) {
        return;
      }

      memberPopoverDismissedRef.current = true;
      setMemberPopoverOpen(false);
      antdMessage.success(I18N.carbonAgent.projectInviteLinkCopied);
    } catch (error) {
      if (
        projectIdRef.current !== inviteProjectId ||
        inviteRequestIdRef.current !== requestId
      ) {
        return;
      }

      antdMessage.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.projectInviteLinkCreateFailed,
      );
    } finally {
      if (
        projectIdRef.current === inviteProjectId &&
        inviteRequestIdRef.current === requestId
      ) {
        setInviteLinkCreating(false);
      }
    }
  };

  const handleOpenSettings = () => {
    if (!canManageProject) {
      return;
    }

    onOpenSettings();
  };

  const handleOpenFeishuDialog = () => {
    if (canAccessProjectMembers && !members.length && !membersLoading) {
      loadProjectMembers();
    }

    setFeishuDialogOpen(true);
  };

  const feishuButtonLabel = useMemo(() => {
    if (!feishuGroupState) {
      return I18N.carbonAgent.feishuCollect;
    }

    return feishuGroupState.collectingEnabled
      ? I18N.carbonAgent.feishuCollectConnected
      : I18N.carbonAgent.feishuCollectPaused;
  }, [feishuGroupState]);

  const feishuTaskOptions = useMemo(
    () =>
      tasks.map(task => ({
        taskId: String(task.taskId),
        taskTitle: 'sourceName' in task ? task.sourceName : task.taskTitle,
      })),
    [tasks],
  );

  const handleUseProjectFileAsContext = (
    file: AgentProjectFile,
    groupName?: string,
    summary?: string,
  ) => {
    if (!onProjectFileContextSelect) {
      return;
    }

    const matchedCandidate = feishuGroupState?.candidates.find(
      item =>
        String(item.file.assetId || item.file.fileId) ===
        String(file.assetId || file.fileId),
    );
    const resolvedGroupName =
      groupName ||
      matchedCandidate?.groupName ||
      feishuGroupState?.groupName ||
      file.uploaderCompanyName ||
      projectName;
    const resolvedSummary =
      summary ||
      matchedCandidate?.note ||
      matchedCandidate?.summary ||
      file.fileName;
    const promptText = I18N.template(
      I18N.carbonAgent.feishuCollectContextPromptTemplate,
      {
        val1: resolvedGroupName,
        val2: file.fileName,
        val3: resolvedSummary,
      },
    );

    onProjectFileContextSelect(file, promptText);
  };

  const handleProjectFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file || fileUploading) {
      return;
    }

    const uploadProjectId = projectId;
    setFileUploading(true);

    try {
      const uploadedFile = await uploadAgentProjectFile(uploadProjectId, file);

      if (projectIdRef.current !== uploadProjectId) {
        return;
      }

      const uploadedFileKey = getProjectFileKey(uploadedFile);
      setFiles(currentFiles => [
        uploadedFile,
        ...currentFiles.filter(
          currentFile => getProjectFileKey(currentFile) !== uploadedFileKey,
        ),
      ]);
      setFilesError(false);
      antdMessage.success(
        I18N.template(I18N.carbonAgent.projectFileUploadSuccess, {
          val1: uploadedFile.fileName || file.name,
        }),
      );

      try {
        const refreshedFiles = await fetchAgentProjectFiles(uploadProjectId);

        if (projectIdRef.current === uploadProjectId) {
          setFiles(refreshedFiles);
        }
      } catch {
        // The upload result is already displayed; retain it if refresh fails.
      }
    } catch (error) {
      if (projectIdRef.current !== uploadProjectId) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.projectFileUploadFailed;

      antdMessage.error(
        I18N.template(I18N.carbonAgent.fileUploadFailedDetail, {
          val1: file.name,
          val2: errorMessage,
        }),
      );
    } finally {
      if (projectIdRef.current === uploadProjectId) {
        setFileUploading(false);
      }
    }
  };

  const handleProjectFileDownload = async (file: AgentProjectFile) => {
    if (downloadingFileKey) {
      return;
    }

    const downloadProjectId = projectId;
    const fileKey = getProjectFileKey(file);
    setDownloadingFileKey(fileKey);

    try {
      const downloadableFile = await fetchAgentProjectFileDownloadUrl(
        downloadProjectId,
        file.assetId,
      );

      if (projectIdRef.current !== downloadProjectId) {
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
      if (projectIdRef.current !== downloadProjectId) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry;

      antdMessage.error(errorMessage);
    } finally {
      if (projectIdRef.current === downloadProjectId) {
        setDownloadingFileKey(currentFileKey =>
          currentFileKey === fileKey ? undefined : currentFileKey,
        );
      }
    }
  };

  const handleSuggestionSelect = async (suggestion: AgentProjectSuggestion) => {
    const suggestionId = String(suggestion.suggestionId);

    if (suggestionSubmittingIdRef.current) {
      return;
    }

    const requestId = suggestionRequestIdRef.current + 1;
    const submissionKey = `${projectId}:${suggestionId}:${requestId}`;
    suggestionRequestIdRef.current = requestId;
    suggestionSubmittingIdRef.current = submissionKey;
    setSuggestionSubmittingId(suggestionId);

    try {
      await onSuggestionSelect(suggestion);
    } finally {
      if (suggestionSubmittingIdRef.current === submissionKey) {
        suggestionSubmittingIdRef.current = '';
      }

      if (componentMountedRef.current && projectIdRef.current === projectId) {
        setSuggestionSubmittingId('');
        setSuggestionRefreshKey(value => value + 1);
      }
    }
  };

  const inviteLimitReached = Boolean(
    maxProjectMembers !== undefined &&
      maxProjectMembers >= 0 &&
      projectMemberCount >= maxProjectMembers,
  );
  const memberPopoverContent = (
    <div
      ref={projectMemberPanelRef}
      className={classNames(style.projectMemberPanel, {
        [style.projectMemberPanelEnterprise]: isEnterpriseCarbonProject,
      })}
      role='dialog'
      aria-label={I18N.carbonAgent.projectTeamMembers}
    >
      <div className={style.projectMemberPanelHeader}>
        <strong>
          {I18N.template(I18N.carbonAgent.projectTeamMembersWithCount, {
            val1: projectMemberCount,
          })}
        </strong>
        <button
          type='button'
          aria-label={I18N.carbonAgent.closeProjectMembers}
          onClick={handleMemberPopoverClose}
        >
          <img
            src={projectMemberClose}
            alt=''
            aria-hidden='true'
            width={16}
            height={16}
          />
        </button>
      </div>

      <div
        className={style.projectMemberPanelBody}
        aria-busy={membersLoading}
        aria-live='polite'
      >
        {membersLoading ? (
          <div className={style.projectMemberPanelState}>
            {I18N.carbonAgent.projectMembersLoading}
          </div>
        ) : membersError ? (
          <div className={style.projectMemberPanelState}>
            <span>{I18N.carbonAgent.projectMembersLoadFailed}</span>
            <button type='button' onClick={loadProjectMembers}>
              {I18N.carbonAgent.retry}
            </button>
          </div>
        ) : members.length ? (
          <ul className={style.projectMemberList}>
            {members.map(member => {
              const memberKey = String(member.memberId);
              const memberRemoving = removingMemberKey === memberKey;
              const memberRoleUpdating = updatingMemberRoleKey === memberKey;
              const canUpdateRole =
                isEnterpriseCarbonProject &&
                canManageMemberRole &&
                !member.currentUser &&
                member.role !== 'owner';
              const canRemove =
                canManageMemberRole &&
                !member.currentUser &&
                member.role !== 'owner';

              return (
                <li key={memberKey}>
                  <div className={style.projectMemberIdentity}>
                    <img
                      src={member.avatar || projectMemberAvatar}
                      alt=''
                      aria-hidden='true'
                      width={24}
                      height={24}
                    />
                    <span>{member.userName}</span>
                  </div>
                  {isEnterpriseCarbonProject ? (
                    <ConfigProvider theme={PROJECT_MEMBER_ROLE_THEME}>
                      <Select<AgentEnterpriseProjectMemberRole>
                        aria-label={I18N.template(
                          I18N.carbonAgent.projectMemberRoleAria,
                          { val1: member.userName },
                        )}
                        className={style.projectMemberRoleSelect}
                        disabled={
                          !canUpdateRole ||
                          Boolean(removingMemberKey) ||
                          Boolean(updatingMemberRoleKey)
                        }
                        getPopupContainer={() =>
                          projectMemberPanelRef.current || document.body
                        }
                        loading={memberRoleUpdating}
                        options={enterpriseMemberRoleOptions}
                        title={
                          memberRoleUpdating
                            ? I18N.template(
                                I18N.carbonAgent.projectMemberRoleUpdating,
                                { val1: member.userName },
                              )
                            : undefined
                        }
                        value={normalizeEnterpriseProjectMemberRole(
                          member.role,
                        )}
                        onChange={nextRole =>
                          handleProjectMemberRoleChange(member, nextRole)
                        }
                      />
                    </ConfigProvider>
                  ) : null}
                  <span
                    className={style.projectMemberActionSlot}
                    aria-hidden={canRemove ? undefined : 'true'}
                  >
                    {canRemove ? (
                      <button
                        type='button'
                        disabled={Boolean(
                          removingMemberKey || updatingMemberRoleKey,
                        )}
                        aria-busy={memberRemoving}
                        aria-label={I18N.template(
                          I18N.carbonAgent.removeProjectMember,
                          {
                            val1: member.userName,
                          },
                        )}
                        onClick={() => setMemberPendingRemoval(member)}
                      >
                        <img
                          src={projectMemberClose}
                          alt=''
                          aria-hidden='true'
                          width={16}
                          height={16}
                        />
                      </button>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={style.projectMemberPanelState}>
            {I18N.carbonAgent.projectMembersEmpty}
          </div>
        )}
      </div>

      {canInviteMember ? (
        <div className={style.projectMemberPanelFooter}>
          <button
            type='button'
            disabled={inviteLinkCreating || inviteLimitReached}
            aria-busy={inviteLinkCreating}
            title={
              inviteLimitReached
                ? I18N.carbonAgent.projectMemberLimitReached
                : undefined
            }
            onClick={handleCopyProjectInviteLink}
          >
            <img
              src={projectMemberLink}
              alt=''
              aria-hidden='true'
              width={16}
              height={16}
            />
            <span>
              {inviteLinkCreating
                ? I18N.carbonAgent.projectInviteLinkCreating
                : I18N.carbonAgent.copyProjectInviteLink}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className={classNames(style.projectHome, mobileStyle.root)}>
      <header
        className={classNames(style.projectHomeHeader, mobileStyle.header)}
      >
        <strong title={projectName}>{projectName}</strong>
        <nav
          className={classNames(
            style.projectHomeHeaderActions,
            mobileStyle.headerActions,
          )}
          aria-label={I18N.carbonAgent.projectHome}
        >
          {canAccessProjectMembers ? (
            <Popover
              arrow={false}
              content={memberPopoverContent}
              mouseEnterDelay={0.1}
              mouseLeaveDelay={0.2}
              open={memberPopoverOpen}
              overlayClassName={style.projectMemberPopover}
              placement='bottomRight'
              trigger={['hover', 'click']}
              onOpenChange={handleMemberPopoverOpenChange}
            >
              <button
                type='button'
                aria-expanded={memberPopoverOpen}
                aria-haspopup='dialog'
                onFocus={() => {
                  memberPopoverDismissedRef.current = false;
                }}
                onMouseEnter={() => {
                  memberPopoverDismissedRef.current = false;
                }}
              >
                <img
                  src={projectInviteIcon}
                  alt=''
                  aria-hidden='true'
                  width={16}
                  height={16}
                />
                <span>
                  {canInviteMember
                    ? I18N.carbonAgent.projectInvite
                    : I18N.carbonAgent.projectTeamMembers}
                </span>
              </button>
            </Popover>
          ) : null}
          <button
            className={classNames({
              [style.projectHomeFeishuActiveButton]: Boolean(feishuGroupState),
            })}
            type='button'
            onClick={handleOpenFeishuDialog}
          >
            <img
              src={projectFeishuIcon}
              alt=''
              aria-hidden='true'
              width={16}
              height={16}
            />
            <span>
              {feishuButtonLabel}
            </span>
            {feishuGroupState ? (
              <i
                aria-hidden='true'
                className={classNames(style.projectHomeFeishuStatusDot, {
                  [style.projectHomeFeishuStatusDotPaused]:
                    !feishuGroupState.collectingEnabled,
                })}
              />
            ) : null}
          </button>
          {canManageProject ? (
            <button type='button' onClick={handleOpenSettings}>
              <img
                src={projectSettingsIcon}
                alt=''
                aria-hidden='true'
                width={16}
                height={16}
              />
              <span>{I18N.carbonAgent.projectSettings}</span>
            </button>
          ) : null}
          {!isMobile || isEnterpriseCarbonProject ? (
            <button
              className={style.projectHomePrimaryAction}
              type='button'
              onClick={onOpenOverview}
            >
              <img
                src={projectOverviewIcon}
                alt=''
                aria-hidden='true'
                width={16}
                height={16}
              />
              <span>{I18N.carbonAgent.projectDataOverview}</span>
            </button>
          ) : null}
        </nav>
      </header>

      <div className={classNames(style.projectHomeScroll, mobileStyle.scroll)}>
        <div
          className={classNames(style.projectHomeContent, mobileStyle.content)}
        >
          <div
            className={classNames(
              style.projectHomeWorkArea,
              mobileStyle.workArea,
            )}
          >
            <div
              className={classNames(style.projectHomeHero, mobileStyle.hero)}
            >
              <div>
                <h1>
                  {I18N.template(I18N.carbonAgent.projectStartWork, {
                    val1: projectName,
                  })}
                </h1>
                <small>{I18N.carbonAgent.projectHomeDescription}</small>
              </div>
              <div
                className={classNames(
                  style.projectHomePrompts,
                  mobileStyle.prompts,
                )}
              >
                {suggestions.map(suggestion => {
                  const suggestionId = String(suggestion.suggestionId);
                  const displayTitle = suggestion.title;

                  return (
                    <button
                      key={suggestionId}
                      type='button'
                      aria-busy={suggestionSubmittingId === suggestionId}
                      disabled={Boolean(suggestionSubmittingId)}
                      title={displayTitle}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {displayTitle}
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              className={classNames(
                style.projectHomeComposerSlot,
                mobileStyle.composer,
              )}
            >
              {composer}
            </div>
            {feishuGroupState ? (
              <div className={style.projectHomeFeishuContextBanner}>
                <div className={style.projectHomeFeishuContextBannerInfo}>
                  <strong>
                    {I18N.carbonAgent.feishuCollectContextBannerTitle}
                  </strong>
                  <span>
                    {I18N.template(
                      I18N.carbonAgent.feishuCollectContextBannerDesc,
                      {
                        val1: feishuGroupState.groupName,
                        val2: feishuGroupState.files.length,
                      },
                    )}
                  </span>
                </div>
                <div className={style.projectHomeFeishuContextBannerActions}>
                  {feishuGroupState.files[0] && onProjectFileContextSelect ? (
                    <button
                      className={style.projectHomeFeishuContextBannerBtn}
                      type='button'
                      onClick={() =>
                        handleUseProjectFileAsContext(feishuGroupState.files[0])
                      }
                    >
                      {I18N.carbonAgent.feishuCollectUseAsContext}：
                      {feishuGroupState.files[0].fileName}
                    </button>
                  ) : null}
                  <button
                    className={style.projectHomeFeishuContextBannerBtn}
                    type='button'
                    onClick={handleOpenFeishuDialog}
                  >
                    {I18N.carbonAgent.feishuCollectOpenWorkbench}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className={classNames(style.projectHomeCards, mobileStyle.cards)}
          >
            <section
              className={classNames(style.projectHomeCard, mobileStyle.card)}
            >
              <header>
                <h2>{I18N.carbonAgent.myProjectTodos}</h2>
                <button type='button' onClick={() => onOpenTasks()}>
                  <span>{I18N.carbonAgent.allProjectTasks}</span>
                  <span
                    className={style.projectHomeTaskArrowIcon}
                    aria-hidden='true'
                  >
                    <img
                      className={style.projectHomeTaskArrow}
                      src={projectArrowIcon}
                      alt=''
                      width={9}
                      height={6}
                    />
                  </span>
                </button>
              </header>
              <div
                className={classNames(
                  style.projectHomeCardBody,
                  mobileStyle.cardBody,
                )}
                aria-busy={projectDataLoading}
                aria-live='polite'
              >
                {projectDataLoading ? (
                  <div className={style.projectHomeEmpty}>
                    {I18N.carbonAgent.projectTasksLoading}
                  </div>
                ) : tasksError ? (
                  <div className={style.projectHomeEmpty}>
                    <span>{I18N.carbonAgent.projectTasksLoadFailed}</span>
                    <button
                      className={style.projectHomeRetry}
                      type='button'
                      onClick={() => setRetryKey(value => value + 1)}
                    >
                      {I18N.carbonAgent.retry}
                    </button>
                  </div>
                ) : tasks.length ? (
                  <ul className={style.projectHomeTaskList}>
                    {tasks.map(task => {
                      const dueDate = formatTaskDueDate(
                        task.dueTime,
                        taskDateFormatter,
                      );
                      const isEnterpriseTask = 'sourceName' in task;

                      return (
                        <li key={String(task.taskId)}>
                          <button
                            type='button'
                            disabled={isEnterpriseCarbonProject}
                            onClick={
                              isEnterpriseCarbonProject
                                ? undefined
                                : () => setSelectedTaskId(String(task.taskId))
                            }
                          >
                            <div>
                              <strong
                                title={
                                  isEnterpriseTask
                                    ? task.sourceName
                                    : task.taskTitle
                                }
                              >
                                {isEnterpriseTask
                                  ? task.sourceName
                                  : task.taskTitle}
                              </strong>
                              {isEnterpriseTask ? (
                                task.enterpriseStatus ? (
                                  <span>
                                    {
                                      ENTERPRISE_CARBON_TASK_STATUS_LABELS[
                                        task.enterpriseStatus
                                      ]
                                    }
                                  </span>
                                ) : null
                              ) : (
                                <span
                                  title={
                                    task.taskDescription ||
                                    task.sourceTypeName ||
                                    task.statusName
                                  }
                                >
                                  {task.taskDescription ||
                                    task.sourceTypeName ||
                                    task.statusName}
                                </span>
                              )}
                            </div>
                            {dueDate ? (
                              <time dateTime={task.dueTime?.replace(' ', 'T')}>
                                {dueDate}
                              </time>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className={style.projectHomeEmpty}>
                    {I18N.carbonAgent.projectTodosEmpty}
                  </div>
                )}
              </div>
            </section>

            <section
              className={classNames(style.projectHomeCard, mobileStyle.card)}
            >
              <header>
                <h2>{I18N.carbonAgent.projectFiles}</h2>
                <button
                  type='button'
                  disabled={fileUploading}
                  aria-busy={fileUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    className={style.projectHomeUploadIcon}
                    src={projectUploadIcon}
                    alt=''
                    aria-hidden='true'
                    width={15}
                    height={14}
                  />
                  <span>
                    {fileUploading
                      ? I18N.carbonAgent.projectFileUploading
                      : I18N.carbonAgent.uploadProjectFiles}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  hidden
                  aria-label={I18N.carbonAgent.uploadProjectFiles}
                  onChange={handleProjectFileChange}
                />
              </header>
              <div
                className={classNames(
                  style.projectHomeCardBody,
                  mobileStyle.cardBody,
                )}
                aria-busy={projectDataLoading}
                aria-live='polite'
              >
                {projectDataLoading ? (
                  <div className={style.projectHomeEmpty}>
                    {I18N.carbonAgent.projectFilesLoading}
                  </div>
                ) : filesError ? (
                  <div className={style.projectHomeEmpty}>
                    <span>{I18N.carbonAgent.projectFilesLoadFailed}</span>
                    <button
                      className={style.projectHomeRetry}
                      type='button'
                      onClick={() => setRetryKey(value => value + 1)}
                    >
                      {I18N.carbonAgent.retry}
                    </button>
                  </div>
                ) : files.length ? (
                  <ul className={style.projectHomeFileList}>
                    {files.map(file => {
                      const fileKey = getProjectFileKey(file);
                      const fileDownloading = downloadingFileKey === fileKey;
                      const isFeishuSynced = String(file.fileId).startsWith(
                        'feishu_',
                      );

                      return (
                        <li key={fileKey}>
                          <div>
                            <div className={style.projectHomeFileTitleRow}>
                              <strong title={file.fileName}>
                                {file.fileName}
                              </strong>
                              {isFeishuSynced ? (
                                <em className={style.projectHomeFileFeishuTag}>
                                  {I18N.carbonAgent.feishuCollectSyncedBadge}
                                </em>
                              ) : null}
                            </div>
                            <span>
                              {getFileMeta(
                                file,
                                fileDateFormatter,
                                fileNumberFormatter,
                              )}
                            </span>
                          </div>
                          <div className={style.projectHomeFileItemActions}>
                            {onProjectFileContextSelect ? (
                              <button
                                className={style.projectHomeFileContextBtn}
                                type='button'
                                onClick={() =>
                                  handleUseProjectFileAsContext(file)
                                }
                              >
                                {I18N.carbonAgent.feishuCollectUseAsContext}
                              </button>
                            ) : null}
                            <button
                              className={style.projectHomeFileDownloadBtn}
                              type='button'
                              disabled={Boolean(downloadingFileKey)}
                              aria-busy={fileDownloading}
                              aria-label={`${file.fileName} ${
                                fileDownloading
                                  ? I18N.carbonAgent.projectFileDownloading
                                  : I18N.carbonAgent.download
                              }`}
                              onClick={() => handleProjectFileDownload(file)}
                            >
                              <img
                                src={projectDownloadIcon}
                                alt=''
                                aria-hidden='true'
                                width={14}
                                height={13}
                              />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <button
                    className={style.projectHomeFileUploadEmpty}
                    type='button'
                    disabled={fileUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img src={projectUploadIcon} alt='' aria-hidden='true' />
                    <strong>{I18N.carbonAgent.uploadFirstProjectFile}</strong>
                    <span>{I18N.carbonAgent.projectKnowledgeBaseHint}</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Modal
        centered
        className={style.projectMemberRemoveDialog}
        closeIcon={
          <span
            aria-hidden='true'
            className={style.projectMemberRemoveDialogCloseIcon}
          />
        }
        confirmLoading={Boolean(removingMemberKey)}
        destroyOnClose
        keyboard={!removingMemberKey}
        maskClosable={!removingMemberKey}
        okButtonProps={{ danger: true }}
        okText={I18N.carbonAgent.projectMemberRemoveConfirmTitle}
        okType='primary'
        open={Boolean(memberPendingRemoval)}
        title={I18N.carbonAgent.projectMemberRemoveConfirmTitle}
        width='min(558px, calc(100vw - 32px))'
        zIndex={1100}
        cancelText={I18N.carbonAgent.cancel}
        closable={!removingMemberKey}
        onCancel={() => {
          if (!removingMemberKey) {
            setMemberPendingRemoval(undefined);
          }
        }}
        onOk={() => {
          if (memberPendingRemoval) {
            return handleProjectMemberRemove(memberPendingRemoval);
          }

          return undefined;
        }}
      >
        <p className={style.projectMemberRemoveDialogMessage}>
          {I18N.template(I18N.carbonAgent.projectMemberRemoveConfirmMessage, {
            val1: memberPendingRemoval?.userName || '',
          })}
        </p>
      </Modal>
      <ProjectTaskDetailDrawer
        open={Boolean(selectedTaskId)}
        projectId={projectId}
        taskId={selectedTaskId}
        onCancel={() => setSelectedTaskId('')}
        onConversationStart={taskId => {
          setSelectedTaskId('');
          onTaskConversationStart(taskId);
        }}
        onChanged={() => {
          setRetryKey(value => value + 1);
          antdMessage.success(I18N.carbonAgent.projectTaskSubmitSuccess);
        }}
      />
      <ProjectFeishuCollectionDialog
        open={feishuDialogOpen}
        projectId={projectId}
        projectMembers={members}
        projectName={projectName}
        tasks={feishuTaskOptions}
        onCancel={() => setFeishuDialogOpen(false)}
        onGroupStateChange={nextState => {
          setFeishuGroupState(nextState);
          setFiles(currentFiles =>
            mergeProjectFilesWithFeishuFiles(projectId, currentFiles),
          );
        }}
        onFileSyncedToProject={syncedFile => {
          const syncedKey = getProjectFileKey(syncedFile);
          setFiles(currentFiles => [
            syncedFile,
            ...currentFiles.filter(
              currentFile => getProjectFileKey(currentFile) !== syncedKey,
            ),
          ]);
          setFilesError(false);
        }}
        onUseFileAsContext={(file, groupName, summary) =>
          handleUseProjectFileAsContext(file, groupName, summary)
        }
      />
    </section>
  );
};

export default ProjectHome;
