import { request } from '@/api/request';

import {
  fetchAgentProjectMembers,
  fetchAgentProjectFileDownloadUrl,
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

const fetchEmissionSources = async (
  projectId: string,
  signal?: AbortSignal,
): Promise<EnterpriseCarbonSource[]> => {
  const response = await request<EnterpriseCarbonSourcePageResponse>({
    method: 'GET',
    params: {
      page: 1,
      pageSize: 1000000,
    },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/sources`,
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
  const response = await request<EnterpriseCarbonTaskCreateResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/create`,
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
  const response = await request<EnterpriseCarbonTaskListResponse>({
    method: 'GET',
    params: {
      pageNum,
      pageSize,
      status: statusMap[status],
      view: viewMap[view],
    },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/enterprise/tasks`,
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
  const response = await request<EnterpriseCarbonTaskListResponse>({
    method: 'GET',
    params: {
      pageNum: 1,
      pageSize: 3,
      view: 'approve',
    },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/enterprise/tasks`,
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
  const response = await request<EnterpriseCarbonTaskSubmitResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/submit`,
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
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/delete`,
  });

  assertSuccess(response.data.code, response.data.msg);
};

const approveTask = async (projectId: string, taskId: string | number) => {
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/approve`,
  });

  assertSuccess(response.data.code, response.data.msg);
};

const rejectTask = async (
  projectId: string,
  taskId: string | number,
  payload: EnterpriseCarbonTaskRejectPayload,
) => {
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/reject`,
  });

  assertSuccess(response.data.code, response.data.msg);
};

const saveTask = async (
  projectId: string,
  taskId: string | number,
  payload: EnterpriseCarbonTaskSavePayload,
) => {
  const response = await request<EnterpriseCarbonTaskOperationResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/tasks/${encodeURIComponent(taskId)}/save`,
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
