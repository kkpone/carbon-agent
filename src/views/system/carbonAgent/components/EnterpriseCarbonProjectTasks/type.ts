export type EnterpriseCarbonTaskOptionValue = string | number;

export const ENTERPRISE_CARBON_TASK_TYPE = {
  ACCOUNTING_FACTOR_COLLECTION: 'accounting_factor_collection',
  ACTIVITY_DATA_COLLECTION: 'activity_data_collection',
} as const;

export type EnterpriseCarbonTaskType =
  (typeof ENTERPRISE_CARBON_TASK_TYPE)[keyof typeof ENTERPRISE_CARBON_TASK_TYPE];

export const ENTERPRISE_CARBON_TASK_TYPES: EnterpriseCarbonTaskType[] = [
  ENTERPRISE_CARBON_TASK_TYPE.ACTIVITY_DATA_COLLECTION,
  ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION,
];

export type EnterpriseCarbonTaskAvailabilityItem = {
  activeTaskStatus?: string | null;
  available: boolean;
  reason?: string | null;
};

export type EnterpriseCarbonTaskAvailabilities = Partial<
  Record<EnterpriseCarbonTaskType, EnterpriseCarbonTaskAvailabilityItem>
>;

export const getAvailableEnterpriseCarbonTaskTypes = (
  source?: {
    taskAvailabilities?: EnterpriseCarbonTaskAvailabilities;
  },
  accountingFactorCollectionSupported = false,
) =>
  ENTERPRISE_CARBON_TASK_TYPES.filter(
    taskType =>
      (taskType !== ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION ||
        accountingFactorCollectionSupported) &&
      source?.taskAvailabilities?.[taskType]?.available === true,
  );

export const canCreateEnterpriseCarbonSourceTask = (
  source?: {
    taskAvailabilities?: EnterpriseCarbonTaskAvailabilities;
  },
  accountingFactorCollectionSupported = false,
) =>
  getAvailableEnterpriseCarbonTaskTypes(
    source,
    accountingFactorCollectionSupported,
  ).length > 0;

export type EnterpriseCarbonTaskOption = {
  disabled?: boolean;
  label: string;
  value: EnterpriseCarbonTaskOptionValue;
};

export type EnterpriseCarbonSource = {
  activityData?: string | number | null;
  activityUnitName?: string | null;
  categoryCode: EnterpriseCarbonTaskOptionValue;
  categoryDisplayName: string;
  orgId: EnterpriseCarbonTaskOptionValue;
  orgName: string;
  scopeCode: EnterpriseCarbonTaskOptionValue;
  scopeName: string;
  sourceId: EnterpriseCarbonTaskOptionValue;
  sourceName: string;
  taskAvailabilities?: EnterpriseCarbonTaskAvailabilities;
};

export type EnterpriseCarbonSourcePageResponse = {
  code: number;
  data?: {
    items?: EnterpriseCarbonSource[];
  };
  msg?: string;
};

export type EnterpriseCarbonTaskPayload = {
  assigneeMemberId: EnterpriseCarbonTaskOptionValue;
  dueTime: string;
  sourceId: EnterpriseCarbonTaskOptionValue;
  taskType: EnterpriseCarbonTaskType;
};

export type EnterpriseCarbonTaskAccountingFactor = {
  accountId?: EnterpriseCarbonTaskOptionValue;
  accountName?: string | null;
  factor?: string | number | null;
  factorUnit?: string | null;
  productName?: string | null;
};

export type EnterpriseCarbonTaskAccountingFactorSnapshot = {
  accountName?: string | null;
  factorUnit?: string | null;
  factorValue?: string | number | null;
  productName?: string | null;
  supplyAccountId?: EnterpriseCarbonTaskOptionValue;
};

export type EnterpriseCarbonTaskCreateRequest = {
  items: EnterpriseCarbonTaskPayload[];
  sourceSessionId: string | null;
  sourceType: 'emission_source' | 'manual';
};

export type EnterpriseCarbonTaskCreateResponse = {
  code: number;
  msg: string;
};

export type EnterpriseCarbonTaskSubmitPayload = {
  activityData?: number;
  comment?: string;
  fileIds?: EnterpriseCarbonTaskOptionValue[];
  supplyAccountId?: EnterpriseCarbonTaskOptionValue;
};

export type EnterpriseCarbonTaskSubmitResponse = {
  code: number;
  msg: string;
};

export type EnterpriseCarbonTaskOperationResponse = {
  code: number;
  msg: string;
};

export type EnterpriseCarbonTaskAccountSnapshot = {
  accountId: EnterpriseCarbonTaskOptionValue;
  accountName: string;
  accountUnitCode: string;
  amount: string;
  companyId: EnterpriseCarbonTaskOptionValue;
  createBy: EnterpriseCarbonTaskOptionValue;
  emissionTotal: string;
  emissionUnit: string;
  factor: string;
  factorUnit: string;
  productName: string;
  snapshotAccountId: EnterpriseCarbonTaskOptionValue;
  snapshotBizId: string;
  snapshotTime: string;
  unitCode: string;
  unitName: string;
};

export type EnterpriseCarbonTaskAccountSnapshotResponse = {
  code: number;
  data?: EnterpriseCarbonTaskAccountSnapshot;
  lang?: string | null;
  msg: string;
};

export type EnterpriseCarbonTaskCreateService = {
  createTasks: (
    projectId: string,
    payload: EnterpriseCarbonTaskCreateRequest,
  ) => Promise<void>;
  fetchEmissionSources: (
    projectId: string,
    signal?: AbortSignal,
  ) => Promise<EnterpriseCarbonSource[]>;
  fetchReporters: (
    projectId: string,
    signal?: AbortSignal,
  ) => Promise<EnterpriseCarbonTaskOption[]>;
};

export type EnterpriseCarbonTaskView = 'initiated' | 'reported';

export type EnterpriseCarbonTaskStatus =
  | 'pendingApproval'
  | 'pendingReport'
  | 'rejected'
  | 'completed';

export type EnterpriseCarbonTaskApiStatus =
  | 'pending_fill'
  | 'pending_approval'
  | 'rejected'
  | 'completed';

export type EnterpriseCarbonTaskApiView = 'approve' | 'fill';

export type EnterpriseCarbonTaskAction =
  | 'approve'
  | 'reject'
  | 'delete'
  | 'edit'
  | 'upload'
  | 'submit';

export type EnterpriseCarbonTaskAttachment = {
  assetId?: EnterpriseCarbonTaskOptionValue;
  id: EnterpriseCarbonTaskOptionValue;
  name: string;
  url: string;
};

export type EnterpriseCarbonTaskFile = {
  assetId: EnterpriseCarbonTaskOptionValue;
  downloadUrl: string;
  fileId: EnterpriseCarbonTaskOptionValue;
  fileName: string;
};

export type EnterpriseCarbonTask = {
  accountingFactor?: EnterpriseCarbonTaskAccountingFactor;
  accountingSubjectName?: string | null;
  actions: EnterpriseCarbonTaskAction[];
  activityData?: string | number | null;
  activityUnitName?: string | null;
  attachments: EnterpriseCarbonTaskAttachment[];
  categoryDisplayName?: string | null;
  canApprove: boolean;
  canDelete: boolean;
  canReject: boolean;
  canSubmit: boolean;
  emissionSourceName?: string | null;
  expectedCompletionTime?: string | null;
  id: EnterpriseCarbonTaskOptionValue;
  rejectReason?: string | null;
  responsibleName?: string | null;
  reviewerName?: string | null;
  scopeName?: string | null;
  status: EnterpriseCarbonTaskStatus;
  taskType: EnterpriseCarbonTaskType;
};

export type EnterpriseCarbonTaskListItem = {
  accountingFactor?: EnterpriseCarbonTaskAccountingFactorSnapshot | null;
  activityData?: string | number | null;
  assigneeName?: string | null;
  canApprove?: boolean;
  canDelete?: boolean;
  canReject?: boolean;
  canSubmit?: boolean;
  dueTime?: string | null;
  files: EnterpriseCarbonTaskFile[];
  overdue: boolean;
  rejectReason?: string | null;
  reviewerName?: string | null;
  source: EnterpriseCarbonSource;
  status: EnterpriseCarbonTaskApiStatus;
  taskId: EnterpriseCarbonTaskOptionValue;
  taskTitle: string;
  taskType?: EnterpriseCarbonTaskType | null;
};

export type EnterpriseCarbonProjectTodo = {
  dueTime?: string | null;
  enterpriseStatus: EnterpriseCarbonTaskStatus;
  sourceName: string;
  taskId: EnterpriseCarbonTaskOptionValue;
};

export type EnterpriseCarbonTaskListResponse = {
  code: number;
  data?: {
    approvalCount: number;
    completedCount: number;
    fillCount: number;
    items: EnterpriseCarbonTaskListItem[];
    pendingApprovalCount: number;
    pendingFillCount: number;
    rejectedCount: number;
    total: number;
  };
  msg: string;
};

export type EnterpriseCarbonTaskPageParams = {
  pageNum: number;
  pageSize: number;
  projectId: string;
  status: EnterpriseCarbonTaskStatus;
  view: EnterpriseCarbonTaskView;
};

export type EnterpriseCarbonTaskPage = {
  items: EnterpriseCarbonTask[];
  statusCounts: Record<EnterpriseCarbonTaskStatus, number>;
  total: number;
  viewCounts: Record<EnterpriseCarbonTaskView, number>;
};

export type EnterpriseCarbonTaskOperation = Extract<
  EnterpriseCarbonTaskAction,
  'approve' | 'reject' | 'delete' | 'submit'
>;

export type EnterpriseCarbonTaskDirectOperation = Exclude<
  EnterpriseCarbonTaskOperation,
  'reject' | 'submit'
>;

export type EnterpriseCarbonTaskRejectPayload = {
  reason: string;
};

export type EnterpriseCarbonTaskSavePayload = {
  activityData?: number;
  fileIds?: EnterpriseCarbonTaskOptionValue[];
  supplyAccountId?: EnterpriseCarbonTaskOptionValue;
};

export type EnterpriseCarbonTaskListService = {
  createProductFootprintAccountSnapshot: (
    accountId: EnterpriseCarbonTaskOptionValue,
  ) => Promise<EnterpriseCarbonTaskAccountSnapshot>;
  fetchTaskFileDownloadUrl: (
    projectId: string,
    assetId: EnterpriseCarbonTaskOptionValue,
  ) => Promise<string>;
  fetchTaskPage: (
    params: EnterpriseCarbonTaskPageParams,
    signal?: AbortSignal,
  ) => Promise<EnterpriseCarbonTaskPage>;
  operateTask: (
    projectId: string,
    taskId: EnterpriseCarbonTaskOptionValue,
    operation: EnterpriseCarbonTaskDirectOperation,
  ) => Promise<void>;
  rejectTask: (
    projectId: string,
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskRejectPayload,
  ) => Promise<void>;
  saveTask: (
    projectId: string,
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSavePayload,
  ) => Promise<void>;
  submitTask: (
    projectId: string,
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSubmitPayload,
  ) => Promise<void>;
  uploadTaskFile: (
    projectId: string,
    file: File,
  ) => Promise<EnterpriseCarbonTaskAttachment>;
};

export type EnterpriseCarbonTaskService = EnterpriseCarbonTaskCreateService &
  EnterpriseCarbonTaskListService;
