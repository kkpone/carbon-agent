import { request } from '@/api/request';

import {
  fetchAgentProjectMembers,
  fetchAgentProjectFileDownloadUrl,
  isLocalTeamProjectId,
  isTeamProjectBackendDenial,
  uploadAgentProjectFile,
} from '../../service';
import { ENTERPRISE_CARBON_TASK_TYPE } from './type';
import type {
  EnterpriseCarbonSource,
  EnterpriseCarbonSourcePageResponse,
  EnterpriseCarbonTask,
  EnterpriseCarbonTaskAccountSnapshotResponse,
  EnterpriseCarbonTaskAction,
  EnterpriseCarbonTaskAttachment,
  EnterpriseCarbonTaskApiStatus,
  EnterpriseCarbonTaskApiView,
  EnterpriseCarbonTaskCreateRequest,
  EnterpriseCarbonTaskCreateResponse,
  EnterpriseCarbonTaskDirectOperation,
  EnterpriseCarbonTaskListItem,
  EnterpriseCarbonTaskListResponse,
  EnterpriseCarbonTaskOption,
  EnterpriseCarbonTaskOperationResponse,
  EnterpriseCarbonTaskPageParams,
  EnterpriseCarbonProjectTodo,
  EnterpriseCarbonTaskService,
  EnterpriseCarbonTaskStatus,
  EnterpriseCarbonTaskRejectPayload,
  EnterpriseCarbonTaskSavePayload,
  EnterpriseCarbonTaskSubmitPayload,
  EnterpriseCarbonTaskSubmitResponse,
  EnterpriseCarbonTaskView,
} from './type';

const statusMap: Record<
  EnterpriseCarbonTaskStatus,
  EnterpriseCarbonTaskApiStatus
> = {
  completed: 'completed',
  pendingApproval: 'pending_approval',
  pendingReport: 'pending_fill',
  rejected: 'rejected',
};

const apiStatusMap: Record<
  EnterpriseCarbonTaskApiStatus,
  EnterpriseCarbonTaskStatus
> = {
  completed: 'completed',
  pending_approval: 'pendingApproval',
  pending_fill: 'pendingReport',
  rejected: 'rejected',
};

const viewMap: Record<EnterpriseCarbonTaskView, EnterpriseCarbonTaskApiView> = {
  initiated: 'approve',
  reported: 'fill',
};

const getTaskActions = (item: EnterpriseCarbonTaskListItem) => {
  const actions: EnterpriseCarbonTaskAction[] = [];

  if (item.canApprove === true) {
    actions.push('approve');
  }
  if (item.canReject === true) {
    actions.push('reject');
  }
  if (item.canSubmit === true) {
    actions.push('edit', 'upload', 'submit');
  }
  if (item.canDelete === true) {
    actions.push('delete');
  }

  return actions;
};

const assertSuccess = (code: number, message: string) => {
  if (code !== 200) {
    throw new Error(message);
  }
};

const TEAM_ENTERPRISE_TASKS_STORAGE_KEY =
  'carbon_agent_team_enterprise_tasks_v1';

const DEFAULT_TEAM_ENTERPRISE_SOURCES: EnterpriseCarbonSource[] = [
  {
    activityData: '12000',
    activityUnitName: 'kWh',
    categoryCode: '2.1',
    categoryDisplayName: '外购电力',
    orgId: 1,
    orgName: '总部及生产基地',
    scopeCode: '2',
    scopeName: '范围二',
    sourceId: 'team_src_elec',
    sourceName: '外购市政电网电力',
    taskAvailabilities: {
      accounting_factor_collection: { available: true },
      activity_data_collection: { available: true },
    },
  },
  {
    activityData: '3500',
    activityUnitName: 'm³',
    categoryCode: '1.1',
    categoryDisplayName: '固定燃烧排放',
    orgId: 1,
    orgName: '总部及生产基地',
    scopeCode: '1',
    scopeName: '范围一',
    sourceId: 'team_src_gas',
    sourceName: '园区锅炉天然气消耗',
    taskAvailabilities: {
      accounting_factor_collection: { available: true },
      activity_data_collection: { available: true },
    },
  },
  {
    activityData: '85',
    activityUnitName: 't',
    categoryCode: '3.1',
    categoryDisplayName: '外购商品与服务',
    orgId: 1,
    orgName: '供应链与采购中心',
    scopeCode: '3',
    scopeName: '范围三',
    sourceId: 'team_src_steel',
    sourceName: '核心结构件外购钢材',
    taskAvailabilities: {
      accounting_factor_collection: { available: true },
      activity_data_collection: { available: true },
    },
  },
];

const readLocalEnterpriseTasks = (
  projectId: string,
): EnterpriseCarbonTaskListItem[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(TEAM_ENTERPRISE_TASKS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const list = map?.[String(projectId)];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const writeLocalEnterpriseTasks = (
  projectId: string,
  items: EnterpriseCarbonTaskListItem[],
) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const raw = window.localStorage.getItem(TEAM_ENTERPRISE_TASKS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(projectId)] = items;
    window.localStorage.setItem(
      TEAM_ENTERPRISE_TASKS_STORAGE_KEY,
      JSON.stringify(map),
    );
  } catch {
    // ignore quota error
  }
};

const fetchEmissionSources = async (
  projectId: string,
  signal?: AbortSignal,
): Promise<EnterpriseCarbonSource[]> => {
  if (isLocalTeamProjectId(projectId)) {
    return DEFAULT_TEAM_ENTERPRISE_SOURCES;
  }
  const response = await request<EnterpriseCarbonSourcePageResponse>({
    method: 'GET',
    params: {
      page: 1,
      pageSize: 1000000,
    },
    silentResponseError: true,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/sources`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      return {
        data: {
          code: 200,
          data: { items: DEFAULT_TEAM_ENTERPRISE_SOURCES },
          msg: '',
        },
      };
    }
    throw error;
  });
  const responseData = response.data;

  assertSuccess(responseData.code, responseData.msg || '');
  return responseData.data?.items || [];
};

const fetchReporters = (
  projectId: string,
  signal?: AbortSignal,
): Promise<EnterpriseCarbonTaskOption[]> =>
  fetchAgentProjectMembers(projectId, signal).then(members =>
    members.map(member => ({
      label: member.userName,
      value: member.memberId,
    })),
  );

const createTasks = async (
  projectId: string,
  payload: EnterpriseCarbonTaskCreateRequest,
) => {
  const createLocal = async () => {
    const members = await fetchAgentProjectMembers(projectId);
    const existing = readLocalEnterpriseTasks(projectId);
    const createdItems: EnterpriseCarbonTaskListItem[] = payload.items.map(
      (item, index) => {
        const source =
          DEFAULT_TEAM_ENTERPRISE_SOURCES.find(
            s => String(s.sourceId) === String(item.sourceId),
          ) || DEFAULT_TEAM_ENTERPRISE_SOURCES[0];
        const assignee = members.find(
          m =>
            String(m.memberId) === String(item.assigneeMemberId) ||
            String(m.userId) === String(item.assigneeMemberId),
        );
        return {
          activityData: source.activityData ?? null,
          assigneeName: assignee?.userName || members[0]?.userName || '',
          canApprove: true,
          canDelete: true,
          canReject: true,
          canSubmit: true,
          dueTime: item.dueTime,
          files: [],
          overdue: false,
          rejectReason: null,
          reviewerName: members[0]?.userName || '',
          source,
          status: 'pending_fill',
          taskId: `team_ent_task_${Date.now()}_${index}`,
          taskTitle: source.sourceName,
          taskType: item.taskType,
        };
      },
    );
    writeLocalEnterpriseTasks(projectId, [...createdItems, ...existing]);
  };

  if (isLocalTeamProjectId(projectId)) {
    await createLocal();
    return;
  }

  const response = await request<EnterpriseCarbonTaskCreateResponse>({
    data: payload,
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/create`,
  }).catch(async error => {
    if (isTeamProjectBackendDenial(error)) {
      await createLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const getTaskAccountingFactor = (item: EnterpriseCarbonTaskListItem) => {
  const { accountingFactor } = item;
  const accountId = accountingFactor?.supplyAccountId;
  const accountName = accountingFactor?.accountName;
  const factor = accountingFactor?.factorValue;
  const factorUnit = accountingFactor?.factorUnit;
  const productName = accountingFactor?.productName;

  if (
    accountId === undefined &&
    !accountName &&
    (factor === undefined || factor === null || factor === '') &&
    !factorUnit &&
    !productName
  ) {
    return undefined;
  }

  return {
    accountId,
    accountName,
    factor,
    factorUnit,
    productName,
  };
};

const mapTask = (item: EnterpriseCarbonTaskListItem): EnterpriseCarbonTask => {
  const status = apiStatusMap[item.status];

  return {
    accountingFactor: getTaskAccountingFactor(item),
    accountingSubjectName: item.source.orgName,
    actions: getTaskActions(item),
    activityData: item.activityData,
    activityUnitName: item.source.activityUnitName,
    attachments: item.files.map(file => ({
      assetId: file.assetId,
      id: file.fileId,
      name: file.fileName,
      url: file.downloadUrl,
    })),
    canApprove: item.canApprove === true,
    canDelete: item.canDelete === true,
    canReject: item.canReject === true,
    canSubmit: item.canSubmit === true,
    categoryDisplayName: item.source.categoryDisplayName,
    emissionSourceName: item.source.sourceName,
    expectedCompletionTime: item.dueTime?.split(' ')[0] || null,
    id: item.taskId,
    rejectReason: item.rejectReason,
    responsibleName: item.assigneeName,
    reviewerName: item.reviewerName,
    scopeName: item.source.scopeName,
    status,
    taskType:
      item.taskType || ENTERPRISE_CARBON_TASK_TYPE.ACTIVITY_DATA_COLLECTION,
  };
};

const fetchTaskPage = async (
  {
    pageNum,
    pageSize,
    projectId,
    status,
    view,
  }: EnterpriseCarbonTaskPageParams,
  signal?: AbortSignal,
) => {
  const buildLocalPage = () => {
    const all = readLocalEnterpriseTasks(projectId);
    const apiStatus = statusMap[status];
    const filtered = all.filter(item => item.status === apiStatus);
    return {
      items: filtered.map(item => mapTask(item)),
      statusCounts: {
        completed: all.filter(i => i.status === 'completed').length,
        pendingApproval: all.filter(i => i.status === 'pending_approval')
          .length,
        pendingReport: all.filter(i => i.status === 'pending_fill').length,
        rejected: all.filter(i => i.status === 'rejected').length,
      },
      total: filtered.length,
      viewCounts: {
        initiated: all.length,
        reported: all.length,
      },
    };
  };

  if (isLocalTeamProjectId(projectId)) {
    return buildLocalPage();
  }

  const response = await request<EnterpriseCarbonTaskListResponse>({
    method: 'GET',
    params: {
      pageNum,
      pageSize,
      status: statusMap[status],
      view: viewMap[view],
    },
    silentResponseError: true,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/enterprise/tasks`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      const all = readLocalEnterpriseTasks(projectId);
      const apiStatus = statusMap[status];
      const filtered = all.filter(item => item.status === apiStatus);
      return {
        data: {
          code: 200,
          data: {
            approvalCount: all.length,
            completedCount: all.filter(i => i.status === 'completed').length,
            fillCount: all.length,
            items: filtered,
            pendingApprovalCount: all.filter(
              i => i.status === 'pending_approval',
            ).length,
            pendingFillCount: all.filter(i => i.status === 'pending_fill')
              .length,
            rejectedCount: all.filter(i => i.status === 'rejected').length,
            total: filtered.length,
          },
          msg: '',
        },
      };
    }
    throw error;
  });
  const responseData = response.data;

  assertSuccess(responseData.code, responseData.msg);
  const { data } = responseData;

  return {
    items: data?.items.map(item => mapTask(item)) || [],
    statusCounts: {
      completed: data?.completedCount || 0,
      pendingApproval: data?.pendingApprovalCount || 0,
      pendingReport: data?.pendingFillCount || 0,
      rejected: data?.rejectedCount || 0,
    },
    total: data?.total || 0,
    viewCounts: {
      initiated: data?.approvalCount || 0,
      reported: data?.fillCount || 0,
    },
  };
};

const fetchTaskFileDownloadUrl = (
  projectId: string,
  assetId: string | number,
) =>
  fetchAgentProjectFileDownloadUrl(projectId, assetId).then(
    file => file.downloadUrl || '',
  );

export const fetchEnterpriseCarbonProjectTodos = async (
  projectId: string,
  signal?: AbortSignal,
): Promise<EnterpriseCarbonProjectTodo[]> => {
  if (isLocalTeamProjectId(projectId)) {
    return readLocalEnterpriseTasks(projectId)
      .slice(0, 3)
      .map(item => ({
        dueTime: item.dueTime,
        enterpriseStatus: apiStatusMap[item.status],
        sourceName: item.source.sourceName,
        taskId: item.taskId,
      }));
  }
  const response = await request<EnterpriseCarbonTaskListResponse>({
    method: 'GET',
    params: {
      pageNum: 1,
      pageSize: 3,
      view: 'approve',
    },
    silentResponseError: true,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/enterprise/tasks`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      const items = readLocalEnterpriseTasks(projectId).slice(0, 3);
      return {
        data: {
          code: 200,
          data: {
            approvalCount: items.length,
            completedCount: 0,
            fillCount: items.length,
            items,
            pendingApprovalCount: 0,
            pendingFillCount: items.length,
            rejectedCount: 0,
            total: items.length,
          },
          msg: '',
        },
      };
    }
    throw error;
  });
  const responseData = response.data;

  assertSuccess(responseData.code, responseData.msg);

  return (responseData.data?.items || []).map(item => ({
    dueTime: item.dueTime,
    enterpriseStatus: apiStatusMap[item.status],
    sourceName: item.source.sourceName,
    taskId: item.taskId,
  }));
};

const submitTask = async (
  projectId: string,
  taskId: string | number,
  payload: EnterpriseCarbonTaskSubmitPayload,
) => {
  const updateLocal = () => {
    const list = readLocalEnterpriseTasks(projectId);
    const next = list.map(item =>
      String(item.taskId) === String(taskId)
        ? {
            ...item,
            activityData: payload.activityData ?? item.activityData,
            status: 'pending_approval' as const,
          }
        : item,
    );
    writeLocalEnterpriseTasks(projectId, next);
  };
  if (isLocalTeamProjectId(projectId)) {
    updateLocal();
    return;
  }
  const response = await request<EnterpriseCarbonTaskSubmitResponse>({
    data: payload,
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/submit`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      updateLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const createProductFootprintAccountSnapshot = async (
  accountId: string | number,
) => {
  const response = await request<EnterpriseCarbonTaskAccountSnapshotResponse>({
    data: { accountId },
    method: 'POST',
    url: '/ai/agent/product-carbon/account-snapshots',
  });

  assertSuccess(response.data.code, response.data.msg);

  const snapshot = response.data.data;

  if (
    !snapshot ||
    snapshot.snapshotAccountId === undefined ||
    snapshot.snapshotAccountId === null ||
    snapshot.snapshotAccountId === ''
  ) {
    throw new Error(response.data.msg || '');
  }

  return snapshot;
};

const uploadTaskFile = async (
  projectId: string,
  file: File,
): Promise<EnterpriseCarbonTaskAttachment> => {
  const uploadedFile = await uploadAgentProjectFile(projectId, file);

  return {
    assetId: uploadedFile.assetId,
    id: uploadedFile.fileId,
    name: uploadedFile.fileName,
    url: uploadedFile.downloadUrl || '',
  };
};

const deleteTask = async (projectId: string, taskId: string | number) => {
  const removeLocal = () => {
    const list = readLocalEnterpriseTasks(projectId);
    writeLocalEnterpriseTasks(
      projectId,
      list.filter(item => String(item.taskId) !== String(taskId)),
    );
  };
  if (isLocalTeamProjectId(projectId)) {
    removeLocal();
    return;
  }
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/delete`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      removeLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const approveTask = async (projectId: string, taskId: string | number) => {
  const approveLocal = () => {
    const list = readLocalEnterpriseTasks(projectId);
    writeLocalEnterpriseTasks(
      projectId,
      list.map(item =>
        String(item.taskId) === String(taskId)
          ? { ...item, status: 'completed' as const }
          : item,
      ),
    );
  };
  if (isLocalTeamProjectId(projectId)) {
    approveLocal();
    return;
  }
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/approve`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      approveLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const rejectTask = async (
  projectId: string,
  taskId: string | number,
  payload: EnterpriseCarbonTaskRejectPayload,
) => {
  const rejectLocal = () => {
    const list = readLocalEnterpriseTasks(projectId);
    writeLocalEnterpriseTasks(
      projectId,
      list.map(item =>
        String(item.taskId) === String(taskId)
          ? {
              ...item,
              rejectReason: payload.reason,
              status: 'rejected' as const,
            }
          : item,
      ),
    );
  };
  if (isLocalTeamProjectId(projectId)) {
    rejectLocal();
    return;
  }
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    data: payload,
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/reject`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      rejectLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const saveTask = async (
  projectId: string,
  taskId: string | number,
  payload: EnterpriseCarbonTaskSavePayload,
) => {
  const saveLocal = () => {
    const list = readLocalEnterpriseTasks(projectId);
    writeLocalEnterpriseTasks(
      projectId,
      list.map(item =>
        String(item.taskId) === String(taskId)
          ? {
              ...item,
              activityData: payload.activityData ?? item.activityData,
            }
          : item,
      ),
    );
  };
  if (isLocalTeamProjectId(projectId)) {
    saveLocal();
    return;
  }
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    data: payload,
    method: 'POST',
    silentResponseError: true,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/save`,
  }).catch(error => {
    if (isTeamProjectBackendDenial(error)) {
      saveLocal();
      return { data: { code: 200, msg: '' } };
    }
    throw error;
  });

  assertSuccess(response.data.code, response.data.msg);
};

const operateTask = (
  projectId: string,
  taskId: string | number,
  operation: EnterpriseCarbonTaskDirectOperation,
) =>
  operation === 'approve'
    ? approveTask(projectId, taskId)
    : deleteTask(projectId, taskId);

export const enterpriseCarbonTaskService: EnterpriseCarbonTaskService = {
  createProductFootprintAccountSnapshot,
  createTasks,
  fetchEmissionSources,
  fetchReporters,
  fetchTaskFileDownloadUrl,
  fetchTaskPage,
  operateTask,
  rejectTask,
  saveTask,
  submitTask,
  uploadTaskFile,
};
