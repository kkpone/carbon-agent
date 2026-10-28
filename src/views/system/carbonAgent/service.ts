import {
  normalizeToolPresentation,
  isVisibleToolEvent,
  mergeToolEvent,
  finishHistoricalTool,
} from './toolEvents';
import { request } from '@api/request';
import { EventStreamContentType } from '@fortaine/fetch-event-source';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { getToken } from '@src/utils/cookie';

import {
  applyAccountingPurposeReceipt,
  isAccountingPurposeCard,
} from './accountingPurpose';
import { getAgentBrowserId } from './acquisition';
import { isCbamHistoryTool, mergeCbamHistoryTools } from './cbamHistoryTools';
import { mergeProjectFilesWithFeishuFiles } from './feishuCollectionStore';
import type {
  AccountBindStatus,
  AgentHomeSkill,
  AgentConversation,
  AgentEnterpriseBusinessCapabilities,
  AgentProject,
  HomeSuggestion,
} from './constants';
import {
  getEnterpriseCarbonBusinessKey,
  getEnterpriseCarbonBusinessKind,
  getEnterpriseCarbonReportFiles,
  type EnterpriseCarbonReportFile,
} from './enterpriseBusinessCard';
import { parseMonitorJson } from './monitor/json';
import { getEnterpriseCard } from './enterpriseData/data';

type HomeSuggestionResponse = {
  code: number;
  data?: HomeSuggestion[];
  lang?: string | null;
  msg: string;
};

export type AgentCbamFile = {
  info?: string | null;
  createBy?: string | null;
  createTime?: string | null;
  fileName: string;
  id: number | string;
  module?: string | null;
  moduleDesc?: string | null;
  path?: string | null;
  reportId?: number | string | null;
  status?: '0' | '1' | '2' | string;
};

type AgentCbamFileListResponse = {
  code: number;
  data?: {
    rows?: AgentCbamFile[];
    total?: number | string;
  };
  msg: string;
};

export type AgentCbamFilePage = {
  rows: AgentCbamFile[];
  total: number;
};

export type AgentProjectSuggestion = {
  message: string;
  pageContext?: Record<string, unknown> | null;
  priority?: number;
  scene?: string;
  source?: string;
  suggestionId: number | string;
  targetName?: string | null;
  targetType?: string | null;
  title: string;
};

type AgentProjectSuggestionResponse = {
  code: number;
  data?: AgentProjectSuggestion[];
  lang?: string | null;
  msg: string;
};

type FetchHomeSuggestionsParams = {
  projectId?: string;
  refresh?: boolean;
  scene?: string;
};

type AgentHomeSkillResponse = {
  code: number;
  data?: AgentHomeSkill[];
  lang?: string | null;
  msg: string;
};

type FetchAgentHomeSkillsParams = {
  lang: string;
  position: 'home';
};

export type AgentAnonymousSession = {
  answer?: string;
  consumed?: boolean;
  createTime?: string;
  messageId?: string;
  question?: string;
  response?: AgentFinalResponse;
  sessionId?: string;
  status?: 'COMPLETED' | 'RUNNING' | string;
  updateTime?: string;
};

export type AgentAnonymousEligibility = {
  activeSessionId?: string | null;
  allowed: boolean;
  loginRequired: boolean;
  message?: string | null;
  policyVersion?: string | null;
  reasonCode?: string | null;
  state: 'ACTIVE_SESSION' | 'AVAILABLE' | 'LOGIN_REQUIRED' | string;
};

type AgentAnonymousSessionResponse = {
  code: number;
  data?: AgentAnonymousSession;
  lang?: string | null;
  msg?: string;
};

type AgentAnonymousEligibilityResponse = {
  code: number;
  data?: AgentAnonymousEligibility;
  lang?: string | null;
  msg?: string;
};

type AgentAnonymousMutationResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg?: string;
};

const isAgentApiSuccess = (code?: number) => code === 1 || code === 200;

type AgentSession = {
  accountBindStatus?: string | null;
  account_bind_status?: string | null;
  actions?: unknown[];
  bizId?: number | string | null;
  bizRef?: Record<string, unknown> | null;
  bizType?: string | null;
  cbamId?: number | string | null;
  cbamid?: number | string | null;
  canEditEnterprisePreview?: boolean;
  canWrite?: boolean;
  cards?: unknown[];
  contextBundle?: unknown;
  createTime?: number | string | null;
  createdAt?: number | string | null;
  entry?: string;
  formDescription?: string | null;
  formSkipLabel?: string | null;
  formSubmitLabel?: string | null;
  formTitle?: string | null;
  hasUnread?: boolean;
  initiatorCompanyId?: number | string;
  initiatorCompanyName?: string;
  initiatorUserId?: number | string;
  initiatorUserName?: string;
  initiatedByMe?: boolean;
  intent?: string;
  message?: string | null;
  missingFields?: unknown[];
  module?: string | null;
  name?: string | null;
  plan?: Record<string, unknown>;
  preview?: Record<string, unknown>;
  projectId?: number | string | null;
  quickSkill?: string | null;
  reply?: string | null;
  result?: Record<string, unknown>;
  running?: boolean;
  runningMessageId?: string | null;
  scene?: string | null;
  sessionScope?: string | null;
  sessionId: string;
  sessionDate?: string | null;
  sessionTitle?: string | null;
  shared?: boolean | null;
  slots?: Record<string, unknown>;
  sourceSessionId?: string | null;
  sourceSuggestionId?: number | string | null;
  sourceTaskId?: number | string | null;
  status?: string;
  summary?: string | null;
  title?: string | null;
  titleSource?: string;
  updateTime?: number | string | null;
  updatedAt?: number | string | null;
  workspaceProjectId?: number | string | null;
};

type AgentSessionListResponse = {
  code: number;
  data?: AgentSession[];
  lang?: string | null;
  msg: string;
};

type AgentSessionListResult = {
  conversations: AgentConversation[];
};

export type AgentProjectSessionListParams = {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
};

export type AgentProjectSessionPage = {
  rows: AgentConversation[];
  total: number;
};

type AgentProjectSessionListResponse = {
  code: number;
  data?: {
    rows?: AgentSession[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentProjectListResponse = {
  code: number;
  data?: AgentProjectResponseItem[];
  lang?: string | null;
  msg: string;
};

export type AgentProjectFile = {
  assetId: number | string;
  canDelete: boolean;
  createTime?: string | null;
  downloadUrl?: string | null;
  expiresAt?: string | null;
  fileHash?: string | null;
  fileId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  projectId: number | string;
  uploaderCompanyId?: number | string;
  uploaderCompanyName?: string;
  uploaderUserId?: number | string;
  uploaderUserName?: string;
  version?: number;
};

type AgentProjectFilesResponse = {
  code: number;
  data?: AgentProjectFile[];
  lang?: string | null;
  msg: string;
};

type AgentProjectFileResponse = {
  code: number;
  data?: AgentProjectFile;
  lang?: string | null;
  msg: string;
};

export type AgentEnterpriseProjectMemberRole = 'admin' | 'member' | 'owner';

export type AgentEnterpriseProjectEditableMemberRole = Exclude<
  AgentEnterpriseProjectMemberRole,
  'owner'
>;

export type AgentProjectMember = {
  avatar?: string | null;
  companyId: number | string;
  companyName?: string;
  currentUser: boolean;
  joinTime?: string | null;
  memberId: number | string;
  role: AgentEnterpriseProjectMemberRole | (string & {});
  roleName?: string;
  userId: number | string;
  userName: string;
};

type AgentProjectMemberListResponse = {
  code: number;
  data?: AgentProjectMember[];
  lang?: string | null;
  msg: string;
};

type AgentProjectMemberRemoveResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

export type UpdateAgentProjectMemberRolePayload = {
  role: AgentEnterpriseProjectEditableMemberRole;
};

type AgentProjectMemberRoleUpdateResponse = {
  code: number;
  data?: AgentProjectMember;
  lang?: string | null;
  msg: string;
};

export type AgentProjectInviteLink = {
  expireTime?: string | null;
  inviteCode: string;
  inviteId: number | string;
  inviteUrl: string;
  maxUseCount: number;
  usedCount: number;
};

export type CreateAgentProjectInviteLinkPayload = {
  expireHours?: string | null;
  maxUseCount?: string | null;
};

type AgentProjectInviteLinkResponse = {
  code: number;
  data?: AgentProjectInviteLink;
  lang?: string | null;
  msg: string;
};

type AgentProjectInviteAcceptResponse = {
  code: number;
  data?: AgentProjectResponseItem;
  lang?: string | null;
  msg: string;
};

export type AgentProjectTask = {
  assigneeCompanyId?: number | string;
  assigneeMemberId?: number | string;
  assigneeName?: string;
  assigneeUserId?: number | string;
  canChangeStatus: boolean;
  canCreateConversation?: boolean;
  canDelete: boolean;
  canEdit: boolean;
  createTime?: string | null;
  creatorCompanyId?: number | string;
  creatorMemberId?: number | string;
  creatorName?: string;
  creatorUserId?: number | string;
  dueTime?: string | null;
  finishTime?: string | null;
  mine: boolean;
  overdue: boolean;
  projectId: number | string;
  sourceAccountId?: number | string | null;
  sourceAccountName?: string | null;
  sourceObjectId?: string | null;
  sourceObjectName?: string | null;
  sourceObjectPath?: string | null;
  sourceObjectType?: string | null;
  sourceObjectTypeName?: string | null;
  sourceSessionId?: string | null;
  sourceType?: string | null;
  sourceTypeName?: string | null;
  status: 'doing' | 'done' | 'todo' | string;
  statusName?: string;
  taskDescription?: string | null;
  taskId: number | string;
  taskTitle: string;
  updateTime?: string | null;
  version?: number;
};

export type AgentProjectTaskPage = {
  allCount: number;
  doneCount: number;
  items: AgentProjectTask[];
  mineCount: number;
  overdueCount: number;
  pageNum: number;
  pageSize: number;
  total: number;
};

export type AgentProjectTaskListParams = {
  keyword?: string;
  mineOnly?: boolean;
  overdueOnly?: boolean;
  pageNum?: number;
  pageSize?: number;
  status?: '' | 'doing' | 'done' | 'todo';
};

export type AgentProjectTaskSourceType =
  | 'compare_difference'
  | 'emission_source'
  | 'hotspot'
  | 'manual'
  | 'session';

export type AgentProjectTaskCompareContext = {
  accountIds: Array<number | string>;
  dimension: AgentProjectCalculationComparisonDimension;
  focusCategoryCode: number | string;
};

export type CreateAgentProjectTaskPayload = {
  assigneeMemberId: number | string;
  compareContext?: AgentProjectTaskCompareContext;
  dueTime?: string;
  sourceAccountId?: number | string;
  sourceObjectId?: string;
  sourceObjectType: string;
  sourceSessionId?: string;
  sourceType: AgentProjectTaskSourceType;
  status: 'doing' | 'done' | 'todo';
  taskDescription: string;
  taskTitle: string;
};

export type AgentProjectTaskSource = {
  accountId?: number | string | null;
  accountName?: string | null;
  available: boolean;
  compareContext?: AgentProjectTaskCompareContext | null;
  objectId?: string | null;
  objectName?: string | null;
  objectPath?: string | null;
  objectType?: string | null;
  objectTypeName?: string | null;
  sourceSessionId?: string | null;
  sourceType?: string | null;
  sourceTypeName?: string | null;
  unavailableReason?: string | null;
  updateTime?: string | null;
};

export type AgentProjectTaskReply = {
  authorCompanyId?: number | string;
  authorCompanyName?: string;
  authorName?: string;
  authorUserId?: number | string;
  content?: string | null;
  createTime?: string | null;
  files: AgentProjectFile[];
  replyId: number | string;
  taskId: number | string;
};

export type AgentProjectTaskLog = {
  action: string;
  actionName?: string;
  createTime?: string | null;
  fromValue?: string | null;
  operatorCompanyId?: number | string;
  operatorName?: string;
  operatorUserId?: number | string;
  toValue?: string | null;
};

export type AgentProjectTaskDetail = {
  logs: AgentProjectTaskLog[];
  replies: AgentProjectTaskReply[];
  source?: AgentProjectTaskSource | null;
  task: AgentProjectTask;
};

export type ReplyAgentProjectTaskPayload = {
  content?: string;
  fileIds?: string[];
  status: 'doing' | 'done' | 'todo';
};

export type UpdateAgentProjectTaskPayload = {
  assigneeMemberId: number | string;
  dueTime: string | null;
  taskDescription: string;
  taskTitle: string;
  version: number;
};

export type AgentProjectCalculationDimension = {
  code: number | string;
  emissionTotal?: string;
  name: string;
  rate?: string;
  sourceCount?: number;
};

export type AgentProjectCalculationSnapshot = {
  accountId: number | string;
  accountName?: string;
  accountStatus?: number;
  accountType?: number;
  amount?: string;
  companyId?: number | string;
  createBy?: number | string;
  emissionTypes?: AgentProjectCalculationDimension[];
  endTime?: string;
  factor?: string;
  factorUnit?: string;
  functionalUnit?: string;
  lifecycleStages?: AgentProjectCalculationDimension[];
  productName?: string;
  scope?: number;
  scopeValue?: string;
  startTime?: string;
  totalEmission?: string;
  unitCode?: string;
  unitName?: string;
  updateTime?: string;
  workspaceProjectId?: number | string | null;
};

export type AgentProjectCalculation = {
  accountId: number | string;
  available: boolean;
  canEdit: boolean;
  canSetDefault: boolean;
  canUnlink: boolean;
  createTime?: string;
  defaultCalculation: boolean;
  projectId: number | string;
  projectCalculationId?: number | string;
  snapshot?: AgentProjectCalculationSnapshot | null;
  sourceSessionId?: string | null;
  sourceType?: string;
  sourceTypeName?: string;
  status?: string;
  statusName?: string;
  unavailableReason?: string | null;
  updateTime?: string;
};

export type AgentProjectCalculationComparisonDimension =
  | 'emission_type'
  | 'lifecycle_stage';

export type AgentProjectCalculationComparisonCategory = {
  code: number | string;
  name: string;
};

export type AgentProjectCalculationComparisonAccount = {
  accountId: number | string;
  accountName: string;
  baseline: boolean;
  deltaPercent?: string | null;
  emissionUnit: string;
  productName?: string;
  totalEmission: string;
  values: Record<string, string>;
};

export type AgentProjectCalculationComparison = {
  accounts: AgentProjectCalculationComparisonAccount[];
  baselineAccountId: number | string;
  categories: AgentProjectCalculationComparisonCategory[];
  conclusion?: string;
  dimension: AgentProjectCalculationComparisonDimension;
  dimensionName: string;
  functionalUnit?: string;
  projectId: number | string;
};

export type CompareAgentProjectCalculationsPayload = {
  accountIds: Array<number | string>;
  dimension: AgentProjectCalculationComparisonDimension;
};

type AgentProjectTaskListResponse = {
  code: number;
  data?: AgentProjectTaskPage;
  lang?: string | null;
  msg: string;
};

type AgentProjectTaskResponse = {
  code: number;
  data?: AgentProjectTask;
  lang?: string | null;
  msg: string;
};

type AgentProjectTaskDetailResponse = {
  code: number;
  data?: AgentProjectTaskDetail;
  lang?: string | null;
  msg: string;
};

type AgentProjectTaskReplyResponse = {
  code: number;
  data?: AgentProjectTaskReply;
  lang?: string | null;
  msg: string;
};

type AgentProjectCalculationListResponse = {
  code: number;
  data?: AgentProjectCalculation[];
  lang?: string | null;
  msg: string;
};

type AgentProjectCalculationComparisonResponse = {
  code: number;
  data?: AgentProjectCalculationComparison;
  lang?: string | null;
  msg: string;
};

const DEFAULT_AGENT_PROJECT_TASK_LIST_PARAMS = {
  keyword: '',
  status: '',
  mineOnly: false,
  overdueOnly: false,
  pageNum: 1,
  pageSize: 20,
} satisfies Required<AgentProjectTaskListParams>;

type AgentProjectResponseItem = {
  businessCapabilities?: AgentEnterpriseBusinessCapabilities;
  businessType?: string;
  businessTypeName?: string;
  createTime?: string;
  currentRole?: string;
  currentRoleName?: string;
  enterpriseSetting?: AgentProject['enterpriseSetting'];
  expectedFinishTime?: string;
  manageable?: boolean;
  memberCount?: number;
  ownerCompanyId?: number | string;
  ownerCompanyName?: string;
  ownerUserId?: number | string;
  ownerUserName?: string;
  projectGoal?: string;
  projectId?: number | string;
  projectName?: string;
  setting?: AgentProject['setting'];
  status?: string;
  statusName?: string;
  updateTime?: string;
  version?: number;
};

export type AgentProjectConfigOption = {
  code: string;
  description?: string | null;
  enabled: boolean;
  name: string;
};

export type AgentProjectConfig = {
  businessTypes: AgentProjectConfigOption[];
  compareDimensions: AgentProjectConfigOption[];
  enabled: boolean;
  enterpriseGwpVersions: AgentProjectConfigOption[];
  enterpriseTimeTypes: AgentProjectConfigOption[];
  factorSources: AgentProjectConfigOption[];
  lifecycleScopes: AgentProjectConfigOption[];
  lifecycleStages: AgentProjectConfigOption[];
  maxCompareCalculations?: number;
  maxFiles?: number;
  maxMembers?: number;
  maxProjectsPerUser?: number;
  taskObjectTypes: AgentProjectConfigOption[];
  taskSources: AgentProjectConfigOption[];
  taskStatuses: AgentProjectConfigOption[];
};

export type AgentProjectCalculationCandidate = {
  accountId: number;
  accountName: string;
  emissionUnit?: string;
  lifecycleScope?: number;
  lifecycleScopeName?: string;
  productName?: string;
  sessionId?: string;
  totalEmission?: string;
  updateTime?: string;
};

export type CreateProductAgentProjectPayload = {
  accountIds: number[];
  businessType: 'product_carbon';
  factorPreferences: Record<string, string>;
  lifecycleScope: string;
  projectGoal: string;
  projectName: string;
  scopeValue: string | null;
};

export type CreateEnterpriseAgentProjectPayload = {
  accountingYear: string;
  businessType: 'enterprise_carbon';
  gwp: string;
  projectGoal: string;
  projectName: string;
  timeType: number;
};

export type CreateAgentProjectPayload =
  | CreateProductAgentProjectPayload
  | CreateEnterpriseAgentProjectPayload;

export type UpdateProductAgentProjectPayload = {
  factorPreferences: Record<string, string>;
  lifecycleScope: string;
  projectGoal: string;
  projectName: string;
  scopeValue: string | null;
  version: number;
};

export type UpdateEnterpriseAgentProjectPayload =
  CreateEnterpriseAgentProjectPayload & {
    version: number;
  };

export type UpdateAgentProjectPayload =
  | UpdateProductAgentProjectPayload
  | UpdateEnterpriseAgentProjectPayload;

type AgentProjectConfigResponse = {
  code: number;
  data?: Partial<AgentProjectConfig>;
  lang?: string | null;
  msg: string;
};

type AgentProjectCalculationCandidatesResponse = {
  code: number;
  data?: AgentProjectCalculationCandidate[];
  lang?: string | null;
  msg: string;
};

type CreateAgentProjectResponse = {
  code: number;
  data?: AgentProjectResponseItem;
  lang?: string | null;
  msg: string;
};

type AgentProjectDetailResponse = {
  code: number;
  data?: AgentProjectResponseItem;
  lang?: string | null;
  msg: string;
};

type UpdateAgentProjectResponse = {
  code: number;
  data?: AgentProjectResponseItem;
  lang?: string | null;
  msg: string;
};

export type AgentHistoryConversation = AgentConversation & {
  entry?: string;
  quickSkill?: string;
  scene?: string;
  sessionDate: string;
  shared?: boolean;
  summary: string;
  updateDate: string;
  updateTime: string;
};

export type AgentSessionHistoryListParams = {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
};

type AgentSessionHistoryListResponse = {
  code: number;
  data?: {
    rows?: AgentSession[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

export type AgentSessionHistoryListResult = {
  rows: AgentHistoryConversation[];
  total: number;
};

type CreateAgentSessionPayload = {
  bizId?: number | string;
  bizRef?: AgentBusinessBinding;
  bizType?: string;
  entry: string;
  message: string;
  module?: string;
  projectId?: number | string;
  quickSkill: string;
};

export type CreateAgentProjectSessionPayload = {
  entry?: string;
  message?: string;
  pageContext?: Record<string, unknown> | null;
  quickSkill?: string | null;
  sourceSuggestionId?: number | string | null;
  sourceTaskId?: number | string | null;
};

export type AgentBusinessBinding = {
  bizId: number | string;
  bizType: string;
  module: string;
};

type CreateAgentSessionResponse = {
  code: number;
  data: AgentSession;
  lang?: string | null;
  msg: string;
};

type AgentBusinessSessionResponse = {
  code: number;
  data?: AgentSession | null;
  lang?: string | null;
  msg: string;
};

type RenameAgentSessionResponse = {
  code: number;
  data?: AgentSession;
  lang?: string | null;
  msg: string;
};

type DeleteAgentSessionResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

type BatchDeleteAgentSessionResponse = DeleteAgentSessionResponse;

type CancelAgentSessionResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

export type AgentUserPoints = {
  availablePoints?: number;
  changedPoints?: number;
  companyId?: number;
  freezeNo?: string | null;
  frozenPoints?: number;
  message?: string | null;
  nodeCode?: string | null;
  planCode?: string;
  planEdition?: 'FREE' | 'PAID';
  planName?: string;
  pointsWarningThreshold?: number;
  success?: boolean;
  userId?: number;
};

export type AgentPointPlan = {
  allowance?: string;
  availablePoints?: number | string;
  badgeText?: string | null;
  billingCycle?: string | null;
  buttonText?: string;
  code?: string;
  current?: boolean | string;
  currentPlan?: boolean | string;
  defaultFlag?: boolean | string;
  description?: string;
  featureTitle?: string;
  features?: string[];
  grantPoints?: number | string;
  grantType?: string;
  highlightFlag?: boolean | string;
  key?: string;
  name?: string;
  planKind?: string;
  planCode?: string;
  planName?: string;
  pointLabel?: string;
  points?: number | string;
  price?: number | string;
  priceAmount?: number | string;
  priceCurrency?: string;
  priceSuffix?: string;
  purchaseEnabled?: boolean | string;
  quotaLabel?: string;
  recommendFlag?: boolean | string;
  sortNo?: number | string;
  subtitle?: string;
  validityDays?: number | string;
  validityType?: string;
};

export type AgentPointPlanKind = 'addon' | 'membership';

export type AgentPointPlansParams = {
  planKind?: AgentPointPlanKind;
};

export type AgentInviteConfig = {
  inviteExpireDays?: number | string;
  inviteUrlBase?: string;
  rewardPoints?: number | string;
  rewardValidityDays?: number | string;
  smsEnabled?: boolean | number | string;
};

export type AgentInviteSource = 'agent_h5' | 'agent_web';

export type AgentInviteTargetType = 'email' | 'phone';

export type AgentInviteSendPayload = {
  source: AgentInviteSource;
  target: string;
  targetType: AgentInviteTargetType;
};

export type AgentInviteOverview = {
  invitedCount: number;
  inviteUrl: string;
  linkCreated: boolean;
  rewardPoints: number;
  rewardValidityDays: number;
};

export type AgentInviteLink = {
  inviteCode: string;
  inviteUrl: string;
  newlyCreated: boolean;
  rewardPoints: number;
  rewardValidityDays: number;
};

export type AgentInviteRecord = {
  agentCreateTime: string;
  invitedUserId: number | string;
  invitedUserName: string;
  rewardStatus: string;
};

export type AgentInviteRecordsPagePayload = {
  keyword: string;
  pageNum: string;
  pageSize: string;
};

export type AgentPointPayChannel = 'wechat';

export type AgentPointOrderPayload = {
  requestId?: string;
  payChannel: AgentPointPayChannel;
  planCode: string;
};

export type AgentPointOrderPayParams = Record<string, unknown> & {
  amount?: number;
  code_url?: string;
  currency?: string;
  orderId?: string;
  orderNo?: string;
  orderTime?: number;
  payChannel?: string;
  payMoney?: number;
  payStatus?: string;
};

export type AgentPointOrder = {
  amount?: number | string;
  closeTime?: string | null;
  codeUrl?: string | null;
  createTime?: string | null;
  currency?: string;
  id?: number;
  invoiceFlag?: number | string | boolean | null;
  invoiceState?: number | string | boolean | null;
  invoiceStatus?: number | string | boolean | null;
  orderContent?: string;
  orderId?: number | string;
  orderNo: string;
  payChannel?: string;
  payParams?: AgentPointOrderPayParams | null;
  payStatus?: string;
  payTime?: string | null;
  payTradeNo?: string | null;
  planCode?: string;
  planKind?: string;
  planName?: string;
  status?: string;
  statusName?: string;
  tradeStateDesc?: string;
};

export type AgentInvoiceOrder = Omit<AgentPointOrder, 'orderNo'> & {
  createBy?: string;
  orderInfo?: string;
  orderName?: string;
  orderNo?: string;
  payWay?: string;
  period?: string;
  realMoney?: number | string;
  recieveMoney?: number | string;
  totalMoney?: number | string;
};

export type AgentInvoiceOrderListParams = {
  page: number | string;
  size: number | string;
};

export type AgentInvoiceDefault = {
  available: boolean;
  bank?: string;
  bankAccount?: string;
  companyQueryKeyword?: string;
  companyQueryResultId?: number;
  content?: string;
  invoiceId?: number;
  invoiceTitle?: string;
  invoiceType?: number;
  phone?: string;
  registeredAddress?: string;
  registeredPhone?: string;
  taxCode?: string;
  type?: number;
};

export type AgentInvoiceCompany = {
  companyName: string;
  companyType?: number;
  creditCode?: string;
  establishTime?: string;
  legalPersonName?: string;
  matchType?: string;
  orgNumber?: string;
  regCapital?: string;
  regNumber?: string;
  regStatus?: string;
  registeredRegion?: string;
  resultId: number;
};

export type AgentInvoiceCompanySearchResult = {
  cacheTime?: string;
  expireTime?: string;
  items: AgentInvoiceCompany[];
  keyword: string;
  source?: string;
  stale?: boolean;
};

export type AgentPointOrderPageParams = {
  keyword: string;
  pageNum: number | string;
  pageSize: number | string;
  status: string;
};

export type AgentPointRecord = {
  afterPoints?: number | string;
  beforePoints?: number | string;
  bizId?: number | string;
  bizType?: string;
  content?: string;
  createTime?: string | null;
  direction?: string;
  id?: number | string;
  messageId?: string;
  nodeCode?: string;
  nodeName?: string;
  points?: number | string;
  pointsDisplay?: string;
  recordType?: string;
  recordTypeName?: string;
  sessionId?: string;
  toolName?: string;
};

export type AgentPointRecordPageParams = {
  category: string;
  keyword: string;
  pageNum: number | string;
  pageSize: number | string;
  recordType: string;
};

export type AgentInvoicePayload = {
  bank?: string;
  bankAccount?: string;
  companyQueryResultId?: number;
  content?: string;
  email: string;
  invoiceTitile: string;
  invoiceType: number;
  orderList: Array<{
    orderId: string;
  }>;
  phone: string;
  registeredAddress?: string;
  registeredPhone?: string;
  taxCode?: string;
  type: number;
};

export type AgentExpertReviewObjectType =
  | 'account'
  | 'account_report'
  | 'model_report'
  | 'report';

export type AgentExpertReviewFocusKey =
  | 'activity_data_abnormal'
  | 'emission_completeness'
  | 'factor_matching'
  | 'model_boundary'
  | 'report_expression';

export type AgentExpertReviewApplyPayload = {
  accountId?: string;
  fileIds?: string[];
  messageId?: string;
  objectType: AgentExpertReviewObjectType;
  projectId?: string;
  reportId?: string;
  reviewFocus: AgentExpertReviewFocusKey[];
  reviewPurpose: string;
  sessionId?: string;
};

export type AgentExpertReviewStatusParams = {
  accountId?: number | string;
  objectType?: AgentExpertReviewObjectType;
  reportId?: number | string;
};

export type AgentExpertReviewPreparePayload = {
  accountId?: number | string;
  objectType?: AgentExpertReviewObjectType;
  reportId?: number | string;
};

export type AgentExpertReviewPrepareStatus = {
  accountId?: number | string | null;
  certificationStatus?: string | null;
  certificationStatusName?: string | null;
  hasExpertFeedback?: boolean | null;
  reportId?: number | string | null;
  reviewCompleteTime?: string | null;
  reviewCreateTime?: string | null;
  reviewId?: number | string | null;
  reviewNo?: string | null;
  reviewStatus?: string | null;
  reviewStatusName?: string | null;
};

export type AgentExpertReviewPrepareInfo = {
  accountId?: number | string | null;
  accountName?: string | null;
  canApply?: boolean | null;
  disabledReason?: string | null;
  emissionUnit?: string | null;
  functionalUnit?: string | null;
  modelUpdateTime?: string | null;
  objectType?: AgentExpertReviewObjectType | string | null;
  pointCost?: number | string | null;
  productName?: string | null;
  reportId?: number | string | null;
  status?: AgentExpertReviewPrepareStatus | null;
  totalEmission?: number | string | null;
};

export type AgentExpertReviewIssue = {
  issue?: string | null;
  moduleName?: string | null;
  severity?: string | null;
  severityName?: string | null;
  suggestion?: string | null;
};

export type AgentExpertReviewLog = {
  actionCode?: string | null;
  actionName?: string | null;
  createTime?: string | null;
  operatorName?: string | null;
  remark?: string | null;
};

export const AGENT_EXPERT_REVIEW_STATUS = {
  COMPLETED: 'completed',
  PENDING_REVIEW: 'pending_review',
  REVIEWING: 'reviewing',
} as const;

export type AgentExpertReviewStatusCode =
  (typeof AGENT_EXPERT_REVIEW_STATUS)[keyof typeof AGENT_EXPERT_REVIEW_STATUS];

export type AgentExpertReviewStatus = {
  accountId?: number | string | null;
  accountName?: string | null;
  companyName?: string | null;
  completeTime?: string | null;
  createTime?: string | null;
  emissionUnit?: string | null;
  expertOpinion?: string | null;
  files?: unknown[];
  functionalUnit?: string | null;
  internalRemark?: string | null;
  issues?: AgentExpertReviewIssue[];
  logs?: AgentExpertReviewLog[];
  objectType?: AgentExpertReviewObjectType | string | null;
  pointCost?: number | string | null;
  productName?: string | null;
  reportFileName?: string | null;
  reportId?: number | string | null;
  reportUrl?: string | null;
  reviewFocus?: AgentExpertReviewFocusKey[] | string[];
  reviewId?: number | string | null;
  reviewNo?: string | null;
  reviewPurpose?: string | null;
  snapAccountId?: number | string | null;
  snapCode?: string | null;
  snapReportId?: number | string | null;
  snapshotData?: unknown;
  status?: AgentExpertReviewStatusCode | string | null;
  statusName?: string | null;
  totalEmission?: number | string | null;
  userName?: string | null;
};

type AgentExpertReviewApplyResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

type AgentExpertReviewPrepareResponse = {
  code: number;
  data?: AgentExpertReviewPrepareInfo | null;
  lang?: string | null;
  msg: string;
};

type AgentExpertReviewStatusResponse = {
  code: number;
  data?: AgentExpertReviewStatus | null;
  lang?: string | null;
  msg: string;
};

type AgentExpertReviewListResponse = {
  code: number;
  data?: AgentExpertReviewStatus[];
  lang?: string | null;
  msg: string;
};

type RejectedAgentResponse<T> = {
  data?: {
    code?: number;
    data?: T;
    lang?: string | null;
    msg?: string;
  };
};

const getRejectedAgentSuccessData = <T>(error: unknown) => {
  const responseData = (error as RejectedAgentResponse<T>)?.data;
  const responseCode = Number(responseData?.code);

  if (responseCode === 1 || responseCode === 200) {
    return responseData;
  }

  return undefined;
};

export type AgentAccountItem = {
  accountName?: string;
  authType?: number | string | null;
  certificationStatus?: string | null;
  certificationStatusName?: string | null;
  createTime?: string;
  emissionTotal?: string | number | null;
  expertReviewCompleteTime?: string | null;
  expertReviewCreateTime?: string | null;
  expertReviewId?: number | null;
  expertReviewNo?: string | null;
  expertReviewStatus?: string | null;
  expertReviewStatusName?: string | null;
  hasExpertFeedback?: boolean;
  id: number;
  productId?: number | string;
  productName?: string;
  productPic?: string;
  scope?: number;
  scopeName?: string;
  scopeValue?: string;
  unit?: string;
  updateTime?: string;
};

export type AgentCertificationItem = Partial<AgentAccountItem> & {
  accountId?: number | string | null;
  applyNo?: string | null;
  auth_type?: number | string | null;
  certificationId?: number | string | null;
  certificationAuthType?: number | string | null;
  certification_auth_type?: number | string | null;
  projectName?: string | null;
  projectNo?: string | null;
  reportId?: number | string | null;
  reportName?: string | null;
  status?: number | string | null;
  statusName?: string | null;
};

export type AgentCertificationListParams = {
  accountId: number | string;
};

const getAgentCertificationRows = (
  data?: AgentCertificationListResponse['data'],
) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.rows || data?.list || data?.records || data?.data || [];
};

export type AgentAccountInfo = {
  accountName?: string;
  amount?: number | string;
  createTime?: string;
  emissionTotal?: string | number | null;
  endTime?: string;
  factorUnit?: string;
  id: number;
  productId?: number | string;
  productName?: string;
  productPic?: string;
  scope?: number | string;
  scopeValue?: string;
  startTime?: string;
  type?: number | string;
  unitCode?: string;
  unitName?: string;
  updateTime?: string;
};

export type AgentAccountChartStage = {
  code?: number | string;
  emissionList?: unknown[] | null;
  name?: string;
  rate?: number | string;
  rateTrans?: number | string | null;
  total?: string | number | null;
  totalTrans?: string | number | null;
};

export type AgentAccountResultData = {
  byEmissions?: AgentAccountChartStage[];
  byStages?: AgentAccountChartStage[];
  byTypes?: AgentAccountChartStage[];
  emissionTotal?: string | number | null;
};

export type AgentAccountEmissionDetail = {
  accountLifeCycleStage?: number | string | null;
  amount?: string | number | null;
  emissionTotal?: string | number | null;
  factor?: string;
  factorUnit?: string;
  id?: number | string;
  name?: string;
  percentage?: string | number | null;
  stage?: number | string | null;
  stageCode?: number | string | null;
  stage_code?: number | string | null;
  stageIndex?: number | string;
  type?: number | string | null;
  typeCode?: number | string | null;
  type_code?: number | string | null;
  typeName?: string;
  unitName?: string;
};

export type AgentAccountListParams = {
  accountName?: string;
  pageNum: number;
  pageSize: number;
};

export type AgentEnterpriseComputationItem = {
  orgNames: string;
  timeType: number;
  timeTypeName: string;
  totalEmission?: number | string | null;
  unitName?: string | null;
  year: number;
};

export type AgentEnterpriseComputationListParams = {
  pageNum: number;
  pageSize: number;
  year?: number;
};

export type AgentCompanyInfo = {
  area?: string | null;
  companyId?: number | string;
  companyInfo?: string | null;
  companyName?: string | null;
  companyNum?: string | null;
  companyPic?: string | null;
  companyType?: string | null;
  createBy?: string | null;
  createTime?: string | null;
  delflag?: number;
  detailedAddr?: string | null;
  id?: number;
  industry?: string | null;
  landline?: string | null;
  linkmanEmail?: string | null;
  linkmanName?: string | null;
  linkmanPhone?: string | null;
  linkmanPhoneCode?: string | null;
  linkmanUserid?: number | string | null;
  postcode?: string | null;
  principal?: string | null;
  scale?: string | null;
  status?: number;
  type?: string | null;
  ucType?: string | null;
  updateBy?: string | null;
  updateTime?: string | null;
};

export type AgentCompanyInfoPayload = {
  area: string;
  industry: string;
};

type AgentPointPlansData = AgentUserPoints & {
  data?: AgentPointPlan[];
  list?: AgentPointPlan[];
  plans?: AgentPointPlan[];
  records?: AgentPointPlan[];
  rows?: AgentPointPlan[];
};

type AgentUserPointsResponse = {
  code: number;
  data?: AgentUserPoints;
  lang?: string | null;
  msg: string;
};

type AgentPointPlansResponse = {
  code: number;
  data?: AgentPointPlan[] | AgentPointPlansData;
  lang?: string | null;
  msg: string;
};

type AgentPointOrderResponse = {
  code: number;
  data?: AgentPointOrder;
  lang?: string | null;
  msg: string;
};

type AgentInviteConfigResponse = {
  code: number;
  data?: AgentInviteConfig;
  lang?: string | null;
  msg: string;
};

type AgentInviteSendResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

type AgentInviteOverviewResponse = {
  code: number;
  data?: AgentInviteOverview;
  lang?: string | null;
  msg: string;
};

type AgentInviteLinkResponse = {
  code: number;
  data?: AgentInviteLink;
  lang?: string | null;
  msg: string;
};

type AgentInviteRecordsPageResponse = {
  code: number;
  data?: {
    pageNum?: number | string;
    pageSize?: number | string;
    rows?: AgentInviteRecord[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentPointOrderPageResponse = {
  code: number;
  data?: {
    pageNum?: number | string;
    pageSize?: number | string;
    rows?: AgentPointOrder[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentInvoiceOrderListResponse = {
  code: number;
  data?: {
    data?: AgentInvoiceOrder[];
    list?: AgentInvoiceOrder[];
    rows?: AgentInvoiceOrder[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentInvoiceDefaultResponse = {
  code: number;
  data?: AgentInvoiceDefault;
  lang?: string | null;
  msg: string;
};

type AgentInvoiceCompanySearchResponse = {
  code: number;
  data?: Partial<AgentInvoiceCompanySearchResult>;
  lang?: string | null;
  msg: string;
};

type AgentPointRecordPageResponse = {
  code: number;
  data?: {
    pageNum?: number | string;
    pageSize?: number | string;
    rows?: AgentPointRecord[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentAccountListResponse = {
  code: number;
  data?: {
    rows?: AgentAccountItem[];
    total?: number;
  };
  lang?: string | null;
  msg: string;
};

type AgentEnterpriseComputationListResponse = {
  code: number;
  msg: string;
  rows?: AgentEnterpriseComputationItem[];
  total?: number | string;
};

type AgentCertificationListResponse = {
  code: number;
  data?:
    | AgentCertificationItem[]
    | {
        data?: AgentCertificationItem[];
        list?: AgentCertificationItem[];
        records?: AgentCertificationItem[];
        rows?: AgentCertificationItem[];
        total?: number | string;
      };
  lang?: string | null;
  msg: string;
};

type AgentAccountInfoResponse = {
  code?: number;
  data?: AgentAccountInfo;
  lang?: string | null;
  msg?: string;
};

type AgentAccountResultResponse = {
  code?: number;
  data?: AgentAccountResultData;
  lang?: string | null;
  msg?: string;
};

type AgentAccountDetailedListResponse = {
  code?: number;
  data?: {
    accountList?: AgentAccountEmissionDetail[];
  };
  lang?: string | null;
  msg?: string;
};

type AgentCompanyInfoResponse = {
  code: number;
  data?: AgentCompanyInfo;
  lang?: string | null;
  msg: string;
};

type AgentCompanyInfoEditResponse = {
  code: number;
  data?: {
    rows?: AgentInvoiceOrder[];
    total?: number | string;
  };
  lang?: string | null;
  msg: string;
};

type AgentHistoryTurn = {
  content?: string;
  createTime?: string;
  feedback?: Record<string, unknown> | null;
  id: number | string;
  intent?: string;
  messageId?: string;
  payload?: Record<string, unknown>;
  role: 'assistant' | 'user' | string;
  status?: string;
  turnIndex?: number;
};

type AgentTimelineItem = Record<string, unknown>;

type TraceTimelineIndex = {
  eventOrders: Map<string, number>;
};

type AgentTraceEvent = {
  agentName?: string | null;
  costMillis?: number | null;
  createTime?: string;
  errorMessage?: string | null;
  eventId?: string;
  eventType?: string;
  id?: number | string;
  messageId?: string;
  mcpServer?: string | null;
  message?: string | null;
  parentAgentName?: string | null;
  payloadJson?: string | null;
  riskLevel?: string | null;
  safePayloadJson?: string | null;
  sequenceNo?: number;
  status?: string | null;
  title?: string | null;
  toolName?: string | null;
  traceId?: string | null;
  visible?: number | boolean;
};

type AgentSessionTraceResponse = {
  code: number;
  data: {
    events?: AgentTraceEvent[];
    modelCalls?: unknown[];
    session: AgentSession;
    summary?: Record<string, unknown>;
    tools?: unknown[];
    turns?: AgentHistoryTurn[];
  };
  lang?: string | null;
  msg: string;
};

export type AgentShareInfo = {
  expireTime?: string | null;
  readonly?: boolean;
  sessionId?: string;
  shareId: string;
  shareScene?: string;
  shareUrl?: string;
  status?: number | string;
  title?: string;
  viewCount?: number | string;
  workspaceProjectId?: number | string;
};

type CreateAgentSharePayload = {
  expireDays: number;
  title: string;
};

type CreateAgentShareResponse = {
  code: number;
  data?: AgentShareInfo;
  lang?: string | null;
  msg: string;
};

export const AGENT_NEW_USER_GUIDE_CODE = 'agent_new_user_guide';

export type AgentUserGuideStatus = {
  firstShowTime?: string | null;
  guideCode?: string;
  lastMarkTime?: string | null;
  needPopup?: boolean;
  shown?: boolean;
};

type AgentUserGuideStatusResponse = {
  code: number;
  data?: AgentUserGuideStatus;
  lang?: string | null;
  msg: string;
};

type AgentUserGuideMarkShownResponse = {
  code: number;
  data?: AgentUserGuideStatus | null;
  lang?: string | null;
  msg: string;
};

type AgentShareHistoryResponse = {
  code: number;
  data?: {
    businessRefs?: unknown;
    history?: {
      session?: AgentSession;
      turns?: AgentHistoryTurn[];
    };
    readonly?: boolean;
    share?: AgentShareInfo;
  };
  lang?: string | null;
  msg: string;
};

export type AgentShareHistory = AgentSessionHistory & {
  businessRefs?: unknown;
  readonly: boolean;
  share?: AgentShareInfo;
};

type AgentShareHistoryError = {
  code?: unknown;
  data?: {
    code?: unknown;
  };
  response?: {
    data?: {
      code?: unknown;
    };
  };
};

export const getAgentShareHistoryErrorCode = (error: unknown) => {
  const shareError = error as AgentShareHistoryError;
  const rawCode =
    shareError?.code ??
    shareError?.data?.code ??
    shareError?.response?.data?.code;

  if (rawCode === undefined || rawCode === null || rawCode === '') {
    return undefined;
  }

  const code = Number(rawCode);

  return Number.isFinite(code) ? code : undefined;
};

type AgentShareBusinessDetailResponse = {
  code: number;
  data?: Record<string, unknown>;
  lang?: string | null;
  msg: string;
};

export type AgentShareBusinessDetail = {
  detail?: Record<string, unknown>;
  files: EnterpriseCarbonReportFile[];
};

export type AgentMessageBlock = {
  accountingPurposeConfirmation?: Record<string, unknown>;
  blockId: string;
  blockType?: string;
  content: string;
  flowId?: string;
  messageId: string;
  orderNo: number;
  streamOrderNo?: number;
};

export const replaceLatestAgentMessageBlockContent = (
  blocks: AgentMessageBlock[],
  content: string,
) => {
  if (!blocks.length || !content) {
    return blocks;
  }

  let latestBlockIndex = 0;
  let latestBlockOrder = Number.NEGATIVE_INFINITY;

  blocks.forEach((block, index) => {
    const blockOrder = block.streamOrderNo ?? block.orderNo;

    if (blockOrder >= latestBlockOrder) {
      latestBlockIndex = index;
      latestBlockOrder = blockOrder;
    }
  });

  if (blocks[latestBlockIndex].content === content) {
    return blocks;
  }

  return blocks.map((block, index) =>
    index === latestBlockIndex ? { ...block, content } : block,
  );
};

export type AgentMessageDelta = Omit<AgentMessageBlock, 'content'> & {
  delta: string;
};

export type AgentMessageCard = {
  card: Record<string, unknown>;
  cardType?: string;
  messageId: string;
  orderNo: number;
  streamOrderNo?: number;
};

export type AgentToolCallDisplay = {
  stageName?: string;
  visible?: boolean;
};

export type AgentToolCallPayload = Record<string, unknown> & {
  display?: AgentToolCallDisplay;
};

export type AgentToolCall = {
  agentName?: string | null;
  costMillis?: number | null;
  createTime?: string;
  errorMessage?: string | null;
  eventId?: string;
  eventType?: string;
  message?: string;
  messageId?: string;
  mcpServer?: string | null;
  orderNo?: number;
  payload?: AgentToolCallPayload;
  riskLevel?: string | null;
  sequenceNo?: number;
  status?: string;
  streamOrderNo?: number;
  title?: string;
  toolCallId?: string;
  toolName?: string;
  traceId?: string | null;
  display?: AgentToolCallDisplay;
};

export type AgentWorkspaceLiveSession = {
  type?: 'workspace_live_session';
  computerUseStarted?: boolean;
  computerUseStatus?: string;
  expiresInSeconds?: number;
  provider?: string;
  sandboxId?: string;
  scope?: string;
  vncAutoconnectUrl?: string;
  vncPort?: number;
  vncUrl?: string;
};

export type AgentFollowUpQuestion = {
  customInput?: string;
  displayType?: string;
  field?: string;
  inputType?: string;
  orderNo?: number;
  options: Array<{
    label: string;
    selected?: boolean;
  }>;
  question: string;
  required?: boolean;
};

export type AgentFollowUpSubmitPayload = {
  answers: Record<string, string>;
  formName?: string;
  type: 'form_response';
};

export type AgentActionRequestSubmitPayload = Record<string, unknown>;

export type AgentFormRequestSubmitPayload = Record<string, unknown>;

export type AgentChatAttachment = {
  assetId?: number | string;
  fileId?: string;
  name: string;
  projectId?: number | string;
  sessionId?: string;
  size?: number;
  type?: string;
  url?: string;
};

export type AgentMonitorMaterialOrigin = {
  entry:
    | 'monitor_material_advice_card'
    | 'operation_material_advice_card'
    | 'composer';
  cardId?: string;
  originMessageId?: string;
  planId?: string;
  intakeId?: string;
  operationId?: string;
  taskId?: string;
};

export type AgentComposerAttachment = {
  materialOrigin?: AgentMonitorMaterialOrigin;
  materialOriginSessionId?: string;
  assetId?: number | string;
  error?: string;
  fileId?: string;
  id: string;
  name: string;
  projectId?: number | string;
  sessionId?: string;
  size: number;
  status: 'done' | 'error' | 'uploading';
  type: string;
  url?: string;
};

export type AgentWorkspaceFile = {
  downloadUrl?: string | null;
  expiresAt?: string | null;
  fileId?: string;
  filename?: string;
  mime?: string;
  name?: string;
  projectId?: number | string;
  sessionId?: string;
  size?: number;
  status?: string;
  url?: string | null;
};

type AgentWorkspaceDownloadFile = Omit<
  AgentWorkspaceFile,
  'downloadUrl' | 'url'
> & {
  downloadUrl?: string | string[] | null;
  url?: string | string[] | null;
};

const normalizeWorkspaceDownloadUrl = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.find(Boolean) || '';
  }

  return value || '';
};

const normalizeWorkspaceDownloadFile = (
  fileData?: AgentWorkspaceDownloadFile,
): AgentWorkspaceFile | undefined => {
  if (!fileData) {
    return undefined;
  }

  const downloadUrl =
    normalizeWorkspaceDownloadUrl(fileData.downloadUrl) ||
    normalizeWorkspaceDownloadUrl(fileData.url);

  return {
    ...fileData,
    downloadUrl,
    url:
      normalizeWorkspaceDownloadUrl(fileData.url) || downloadUrl || undefined,
  };
};

export type AgentArtifactDownloadFile = {
  artifactId?: string;
  downloadUrl?: string | null;
  expiresAt?: string | null;
  filename?: string;
  headers?: Record<string, string>;
  messageId?: string;
  method?: string;
  mime?: string;
  runId?: string;
  sessionId?: string;
  size?: number;
  sourcePath?: string;
  status?: string;
  uploadUrl?: string;
};

export type AgentMessageReference = {
  blockId?: string;
  content: string;
  referenceId?: string;
  sourceMessageId?: string;
  title?: string;
  type: 'message';
};

export type AgentAnswerControls = {
  showStartModel?: boolean;
};

export type AgentFeedbackType = '1' | '2';

export type AgentFeedbackSource = 'agent_web' | 'agent_h5';

export type AgentIssueFeedbackType = 'bug' | 'feature';
export type AgentIssueFeedbackStatus =
  | ''
  | 'adopted'
  | 'not_adopted'
  | 'pending'
  | 'resolved';

export type AgentIssueFeedbackConfigCategory = {
  code: string;
  name: string;
};

export type AgentIssueFeedbackConfigType = {
  categories: AgentIssueFeedbackConfigCategory[];
  code: AgentIssueFeedbackType;
  name: string;
};

export type AgentIssueFeedbackConfig = {
  rewardPoints: number;
  sessionOptional: boolean;
  types: AgentIssueFeedbackConfigType[];
  unlimitedFiles: boolean;
};

export type AgentIssueFeedbackFile = {
  createTime?: string;
  feedbackId?: number | string;
  feedbackNo?: string;
  fileId?: string;
  filename?: string;
  id?: number | string;
  mime?: string;
  size?: number;
  sortNo?: number;
  url?: string;
};

export type AgentIssueFeedbackLog = {
  createTime?: string;
  eventType?: string;
  feedbackId?: number | string;
  feedbackNo?: string;
  fromStatus?: string;
  id?: number | string;
  operatorId?: number | string;
  operatorName?: string;
  remark?: string;
  replySnapshot?: string;
  rewardPoints?: number;
  rewardStatus?: string;
  toStatus?: string;
};

export type AgentIssueFeedback = {
  allowContact?: boolean;
  categoryCode?: string;
  categoryName?: string;
  companyId?: number | string;
  companyName?: string;
  contactEmail?: string;
  content?: string;
  createTime?: string;
  feedbackNo: string;
  feedbackType?: AgentIssueFeedbackType | string;
  feedbackTypeName?: string;
  fileCount?: number;
  files?: AgentIssueFeedbackFile[];
  handleTime?: string;
  handlerId?: number | string;
  handlerName?: string;
  officialReply?: string;
  replyTime?: string;
  rewardError?: string;
  rewardPoints?: number;
  rewardRecordId?: number | string;
  rewardRetryCount?: number;
  rewardStatus?: string;
  sessionId?: string;
  sessionTitle?: string;
  source?: string;
  sourcePath?: string;
  status?: string;
  statusName?: string;
  updateTime?: string;
  userEmail?: string;
  userId?: number | string;
  userMobile?: string;
  userName?: string;
};

export type AgentIssueFeedbackDetail = {
  feedback: AgentIssueFeedback;
  files: AgentIssueFeedbackFile[];
  logs: AgentIssueFeedbackLog[];
};

export type AgentIssueFeedbackPageParams = {
  pageNum: number;
  pageSize: number;
  status: AgentIssueFeedbackStatus;
};

export type AgentIssueFeedbackPageResult = {
  rows: AgentIssueFeedback[];
  summary: AgentIssueFeedbackSummary;
  total: number;
};

export type AgentIssueFeedbackSummary = {
  adoptedCount: number;
  notAdoptedCount: number;
  pendingCount: number;
  resolvedCount: number;
  rewardGrantedCount: number;
  totalCount: number;
};

export type AgentIssueFeedbackSubmitPayload = {
  allowContact: string;
  categoryCode: string;
  contactEmail: string;
  content: string;
  feedbackType: AgentIssueFeedbackType;
  fileIds: string[];
  sessionId: string;
  source: AgentFeedbackSource;
  sourcePath: string;
};

export type AgentFeedbackCategory = {
  code: string;
  name: string;
};

export type AgentMessageFeedback = {
  feedbackCategory?: string;
  feedbackCategoryName?: string;
  feedbackId?: string;
  feedbackStatus?: string;
  feedbackType: AgentFeedbackType;
};

export type AgentMessageFeedbackPayload = {
  feedbackCategory?: string;
  feedbackDetail?: string;
  feedbackType: AgentFeedbackType;
  source?: AgentFeedbackSource;
};

type AgentFeedbackCategoriesResponse = {
  code: number;
  data?: AgentFeedbackCategory[];
  lang?: string | null;
  msg: string;
};

type AgentMessageFeedbackResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

type AgentIssueFeedbackResponse<T> = {
  code: number;
  data?: T;
  lang?: string | null;
  msg: string;
};

export type AgentContextInsightStatus = 'NONE' | 'PENDING' | 'READY';

export type AgentContextInsightCategory = 'FEEDBACK' | 'INVITE';

export type AgentContextInsightBannerType =
  | 'FEEDBACK_ANGRY'
  | 'FEEDBACK_SURPRISE'
  | 'INVITE_POINTS_EMPTY'
  | 'INVITE_POINTS_LOW'
  | 'INVITE_HIGH_TURN_COST'
  | 'POINTS_BALANCE_LOW_FREE'
  | 'POINTS_BALANCE_LOW_PAID';

export type AgentContextInsightEmotion = 'ANGRY' | 'NONE' | 'POSITIVE_SURPRISE';

export type AgentContextInsightTarget =
  | 'AGENT_SERVICE'
  | 'CURRENT_TASK'
  | 'EXTERNAL_TOPIC'
  | 'UNKNOWN';

export type AgentContextInsightDecision = {
  actionText: string | null;
  availablePoints: number | null;
  bannerType: AgentContextInsightBannerType | null;
  category: AgentContextInsightCategory | null;
  confidence: number | null;
  emotion: AgentContextInsightEmotion;
  estimatedPointCost: number | null;
  intensity: number | null;
  messageId: string;
  reasonCode: string | null;
  retryAfterMillis: number | null;
  status: AgentContextInsightStatus;
  target: AgentContextInsightTarget | null;
  title: string | null;
};

type AgentContextInsightDecisionResponse = {
  code: number;
  data?: AgentContextInsightDecision;
  lang?: string | null;
  msg: string;
};

type AgentContextInsightDismissResponse = {
  code: number;
  data?: unknown;
  lang?: string | null;
  msg: string;
};

type AgentContextInsightSuppressedResponse = {
  code: number;
  data?: boolean;
  lang?: string | null;
  msg: string;
};

export type AgentFinalResponse = {
  actions?: unknown[];
  blocks?: Array<Record<string, unknown>>;
  cards?: Array<AgentMessageCard | Record<string, unknown>>;
  content?: string;
  formDescription?: string | null;
  formSkipLabel?: string | null;
  formSubmitLabel?: string | null;
  formTitle?: string | null;
  intent?: string;
  missingFields?: unknown[];
  plan?: Record<string, unknown>;
  messageId?: string;
  reply?: string;
  sessionTitle?: string;
  sessionId?: string;
  status?: string;
  streamOrderNo?: number;
  turnId?: number | string;
};

export type AgentMessageRecoverResult = {
  assistantTurn?: Record<string, unknown> | null;
  events?: unknown[];
  message?: string;
  recovered?: boolean;
  response?: AgentFinalResponse | null;
  running?: boolean;
  status?: string;
  terminal?: boolean;
};

export type AgentMessageResumeState = {
  lastEventId: number;
  messageId: string;
  sessionId: string;
};

export type AgentMessageRunStatus = {
  errorMessage?: string | null;
  lastStreamEventId?: number;
  messageId?: string;
  runId?: string;
  running?: boolean;
  sessionId?: string;
  status?: string;
  terminal?: boolean;
};

export type AgentConversationMessage = {
  attachments?: AgentChatAttachment[];
  blocks: AgentMessageBlock[];
  cards: AgentMessageCard[];
  content: string;
  createTime?: string;
  feedback?: AgentMessageFeedback;
  id: string;
  referenceCount?: number;
  referenceContents?: string[];
  role: 'assistant' | 'user';
  answerControls?: AgentAnswerControls;
  toolCalls: AgentToolCall[];
  turnId?: number | string;
  turnIndex?: number;
};

export type AgentSessionHistory = {
  latestMessageId?: string;
  messages: AgentConversationMessage[];
  session: AgentConversation;
};

type SendAgentMessagePayload = {
  bizRef?: Record<string, unknown>;
  materialOrigin?: AgentMonitorMaterialOrigin;
  files?: Array<{ fileId: string }>;
  message: string;
  quickSkill: string;
  references?: AgentMessageReference[];
};

export type AgentLoginRequiredPayload = {
  detailCode?: string;
  executionState?: string;
  message?: string;
  messageKey?: string;
  reasonCode?: string;
  requiresLogin?: boolean;
  retryable?: boolean;
};

type SendAgentMessageParams = Partial<SendAgentMessagePayload> & {
  abortCtrl?: AbortController;
  requestPayload?: Record<string, unknown>;
  onCard?: (card: AgentMessageCard) => void;
  onDelta?: (delta: AgentMessageDelta) => void;
  onFinalResponse?: (response: AgentFinalResponse) => void;
  onLoadingEnd?: () => void;
  onLoginRequired?: (payload: AgentLoginRequiredPayload) => void;
  onMessageStart?: (block: AgentMessageBlock) => void;
  onResumeState?: (state: AgentMessageResumeState) => void;
  onToolCall?: (toolCall: AgentToolCall) => void;
  sessionId: string;
};

type SendAnonymousAgentMessageParams = Omit<
  SendAgentMessageParams,
  'sessionId'
> & {
  browserId: string;
  lang: string;
};

type ResumeAgentMessageParams = Omit<
  SendAgentMessageParams,
  'bizRef' | 'message' | 'quickSkill' | 'requestPayload'
> & {
  state: AgentMessageResumeState;
};

const HOME_SUGGESTION_SCENE = 'product_carbon';
const AGENT_SESSION_ENTRY = 'footprint_account_detail';

const DEFAULT_CREATE_SESSION_PAYLOAD: CreateAgentSessionPayload = {
  entry: AGENT_SESSION_ENTRY,
  message: '',
  quickSkill: '',
};

const DEFAULT_AGENT_PROJECT_SESSION_LIST_PARAMS: Required<AgentProjectSessionListParams> =
  {
    keyword: '',
    pageNum: 1,
    pageSize: 20,
  };

const DEFAULT_SEND_MESSAGE_PAYLOAD: Omit<SendAgentMessagePayload, 'message'> = {
  bizRef: undefined,
  quickSkill: '',
};

const getSendAgentMessageRequestPayload = (
  requestPayload: Record<string, unknown> | undefined,
  fallbackPayload: SendAgentMessagePayload,
) => requestPayload || fallbackPayload;

const SESSION_STATUS_LABELS = createI18nLabelMap<string, string>({
  IDLE: () => I18N.carbonAgent.statusIdle,
  WAIT_PLAN_CONFIRM: () => I18N.carbonAgent.statusWaitPlanConfirm,
});

const INTENT_LABELS = createI18nLabelMap<string, string>({
  build_model: () => I18N.carbonAgent.intentBuildModel,
  unknown: () => I18N.carbonAgent.agentSession,
});

const normalizeSuggestions = (suggestions: HomeSuggestion[] = []) =>
  suggestions
    .filter(suggestion => suggestion.title || suggestion.message)
    .map(suggestion => ({
      ...suggestion,
      message: suggestion.message || suggestion.title,
      title: suggestion.title || suggestion.message,
    }))
    .sort((prev, next) => (next.priority || 0) - (prev.priority || 0));

const normalizeProjectSuggestions = (
  suggestions: AgentProjectSuggestion[] = [],
) =>
  suggestions
    .filter(
      suggestion =>
        suggestion.suggestionId !== undefined &&
        suggestion.suggestionId !== null &&
        (suggestion.title || suggestion.message),
    )
    .map(suggestion => ({
      ...suggestion,
      message: suggestion.message || suggestion.title,
      title: suggestion.title || suggestion.message,
    }))
    .sort((prev, next) => (next.priority || 0) - (prev.priority || 0));

const getProjectSessionSourceValue = (
  value: number | string | null | undefined,
) =>
  value === undefined || value === null || String(value).trim() === ''
    ? undefined
    : value;

const normalizeProjectSessionCreatePayload = (
  payload: CreateAgentProjectSessionPayload,
) => {
  const sourceSuggestionId = getProjectSessionSourceValue(
    payload.sourceSuggestionId,
  );
  const sourceTaskId = getProjectSessionSourceValue(payload.sourceTaskId);

  if (sourceSuggestionId !== undefined && sourceTaskId !== undefined) {
    throw new Error(
      'sourceSuggestionId and sourceTaskId are mutually exclusive',
    );
  }

  const pageContext = payload.pageContext
    ? Object.fromEntries(
        Object.entries(payload.pageContext).filter(([key]) =>
          ['entry', 'page'].includes(key),
        ),
      )
    : undefined;

  return {
    entry: payload.entry || 'agent_home',
    message: payload.message || '',
    ...(pageContext && Object.keys(pageContext).length ? { pageContext } : {}),
    ...(payload.quickSkill ? { quickSkill: payload.quickSkill } : {}),
    ...(sourceSuggestionId !== undefined ? { sourceSuggestionId } : {}),
    ...(sourceTaskId !== undefined ? { sourceTaskId } : {}),
  };
};

const parseStreamPayload = (data: string) => {
  try {
    return JSON.parse(data) as Record<string, any>;
  } catch {
    return {};
  }
};

const parseJsonRecord = (data?: string | null) => {
  if (!data) {
    return {};
  }

  try {
    const parsed = JSON.parse(data);

    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

const asString = (data: unknown) => (typeof data === 'string' ? data : '');

const asNumber = (data: unknown) => {
  const value = Number(data);

  return Number.isFinite(value) ? value : undefined;
};

const asScalarString = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return String(data);
  }

  return '';
};

const asBoolean = (data: unknown) => {
  if (typeof data === 'boolean') {
    return data;
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return data !== 0;
  }

  if (typeof data === 'string') {
    const normalizedValue = data.trim().toLowerCase();

    if (['1', 'true', 'yes', 'y'].includes(normalizedValue)) {
      return true;
    }

    if (['0', 'false', 'no', 'n'].includes(normalizedValue)) {
      return false;
    }
  }

  return undefined;
};

const parseRecordValue = (data: unknown): Record<string, unknown> => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }

  return typeof data === 'string' ? parseJsonRecord(data) : {};
};

const getWorkspaceLiveSessionRecords = (toolCall: AgentToolCall) => {
  const payload = asRecord(toolCall.payload);
  const safePayload = asRecord(payload.safePayload);
  const payloadData = asRecord(payload.data);
  const safePayloadData = asRecord(safePayload.data);
  const payloadChunk = asRecord(payload.chunk);
  const safePayloadChunk = asRecord(safePayload.chunk);

  return [
    payload,
    safePayload,
    payloadData,
    safePayloadData,
    payloadChunk,
    safePayloadChunk,
    parseRecordValue(payload.content),
    parseRecordValue(safePayload.content),
    parseRecordValue(payloadChunk.content),
    parseRecordValue(safePayloadChunk.content),
  ];
};

export const getWorkspaceLiveSessionFromToolCall = (
  toolCall: AgentToolCall,
): AgentWorkspaceLiveSession | undefined => {
  const source = getWorkspaceLiveSessionRecords(toolCall).find(
    record => asScalarString(record.type) === 'workspace_live_session',
  );

  if (!source) {
    return undefined;
  }

  const vncAutoconnectUrl = asScalarString(
    source.vnc_autoconnect_url ?? source.vncAutoconnectUrl,
  );
  const vncUrl = asScalarString(source.vnc_url ?? source.vncUrl);

  if (!vncAutoconnectUrl && !vncUrl) {
    return undefined;
  }

  return {
    computerUseStarted:
      source.computer_use_started === true ||
      source.computerUseStarted === true,
    computerUseStatus:
      asScalarString(source.computer_use_status ?? source.computerUseStatus) ||
      undefined,
    expiresInSeconds: asNumber(
      source.expires_in_seconds ?? source.expiresInSeconds,
    ),
    provider: asScalarString(source.provider) || undefined,
    sandboxId:
      asScalarString(source.sandbox_id ?? source.sandboxId) || undefined,
    scope: asScalarString(source.scope) || undefined,
    type: 'workspace_live_session',
    vncAutoconnectUrl: vncAutoconnectUrl || undefined,
    vncPort: asNumber(source.vnc_port ?? source.vncPort),
    vncUrl: vncUrl || undefined,
  };
};

export const getWorkspaceLiveSessionUrl = (
  session?: AgentWorkspaceLiveSession,
) => session?.vncAutoconnectUrl || session?.vncUrl || '';

export const getWorkspaceLiveSessionIdentity = (
  session?: AgentWorkspaceLiveSession,
) => {
  const sandboxId = asScalarString(session?.sandboxId);

  if (sandboxId) {
    return `sandbox:${sandboxId}`;
  }

  const workspaceUrl = getWorkspaceLiveSessionUrl(session);

  if (!workspaceUrl) {
    return '';
  }

  try {
    return `vnc:${new URL(workspaceUrl).origin}`;
  } catch {
    const fallbackUrl = workspaceUrl
      .split('#')[0]
      .split('?')[0]
      .replace(/\/vnc\.html\/?$/i, '');

    return fallbackUrl ? `vnc:${fallbackUrl}` : '';
  }
};

const getTimelineItems = (
  payload?: Record<string, unknown>,
): AgentTimelineItem[] => {
  const timeline = payload?.timeline;

  return Array.isArray(timeline) ? (timeline as AgentTimelineItem[]) : [];
};

const getTimelineItemType = (item: AgentTimelineItem) =>
  asString(item.type) || asString(item.eventType) || asString(item.blockType);

const getTimelineOrderNo = (item: AgentTimelineItem) =>
  asNumber(item.orderNo) ?? asNumber(item.streamOrderNo);

const getScopedTimelineKey = (messageId: string | undefined, id: string) =>
  messageId ? `${messageId}:${id}` : id;

const setTimelineOrder = (
  orders: Map<string, number>,
  key: string,
  orderNo: number,
) => {
  if (!key) {
    return;
  }

  const currentOrderNo = orders.get(key);

  if (currentOrderNo === undefined || orderNo < currentOrderNo) {
    orders.set(key, orderNo);
  }
};

const getTimelineItemIds = (item: AgentTimelineItem) =>
  [
    asString(item.eventId),
    asString(item.toolCallId),
    asString(item.blockId),
    asString(item.resumeEventId),
    asString(asRecord(item.rawInterrupt).id),
    asString(item.id),
  ].filter(Boolean);

const buildTraceTimelineIndex = (
  turns: AgentHistoryTurn[] = [],
): TraceTimelineIndex => {
  const eventOrders = new Map<string, number>();

  turns.forEach(turn => {
    const messageId = String(turn.messageId || `history_${turn.id}`);

    getTimelineItems(turn.payload).forEach(item => {
      const orderNo = getTimelineOrderNo(item);

      if (orderNo === undefined) {
        return;
      }

      getTimelineItemIds(item).forEach(id => {
        setTimelineOrder(eventOrders, id, orderNo);
        setTimelineOrder(
          eventOrders,
          getScopedTimelineKey(messageId, id),
          orderNo,
        );
      });
    });
  });

  return { eventOrders };
};

const getTimelineEventOrder = (
  timelineIndex: TraceTimelineIndex | undefined,
  event: Pick<AgentTraceEvent, 'eventId' | 'id' | 'messageId'>,
  extraIds: string[] = [],
) => {
  if (!timelineIndex) {
    return undefined;
  }

  const eventIds = [
    asString(event.eventId),
    event.id === undefined || event.id === null ? '' : String(event.id),
    ...extraIds,
  ].filter(Boolean);

  const matchedOrder = eventIds
    .map(id => {
      const scopedOrder = timelineIndex.eventOrders.get(
        getScopedTimelineKey(event.messageId, id),
      );

      return scopedOrder ?? timelineIndex.eventOrders.get(id);
    })
    .find(order => order !== undefined);

  if (matchedOrder !== undefined) {
    return matchedOrder;
  }

  return undefined;
};

const findTimelineBlockOrder = ({
  block,
  fallbackMessageId,
  timeline,
  types,
}: {
  block: Record<string, unknown>;
  fallbackMessageId: string;
  timeline: AgentTimelineItem[];
  types: string[];
}) => {
  const typeSet = new Set(types);
  const extra = asRecord(block.extra);
  const blockIds = [
    asString(block.blockId),
    asString(block.id),
    asString(extra.blockId),
    asString(extra.resumeEventId),
    asString(extra.eventId),
    asString(asRecord(extra.rawInterrupt).id),
  ].filter(Boolean);

  const matchedOrders = timeline
    .filter(item => {
      const orderNo = getTimelineOrderNo(item);

      if (orderNo === undefined) {
        return false;
      }

      const itemMessageId = asString(item.messageId);

      if (itemMessageId && itemMessageId !== fallbackMessageId) {
        return false;
      }

      const itemIds = getTimelineItemIds(item);

      if (blockIds.some(id => itemIds.includes(id))) {
        return true;
      }

      return typeSet.has(getTimelineItemType(item));
    })
    .map(getTimelineOrderNo)
    .filter((orderNo): orderNo is number => orderNo !== undefined);

  return matchedOrders.length ? Math.min(...matchedOrders) : undefined;
};

const withTimelineCardOrder = (
  card: AgentMessageCard,
  block: Record<string, unknown>,
  timeline: AgentTimelineItem[],
  fallbackMessageId: string,
  types: string[],
): AgentMessageCard => {
  const timelineOrderNo = findTimelineBlockOrder({
    block,
    fallbackMessageId,
    timeline,
    types,
  });

  return timelineOrderNo === undefined
    ? card
    : {
        ...card,
        orderNo: timelineOrderNo,
      };
};

const normalizeTimelineMarkdownBlocks = (
  timeline: AgentTimelineItem[],
  fallbackMessageId: string,
): AgentMessageBlock[] =>
  timeline
    .filter(item => {
      const itemType = getTimelineItemType(item);

      return itemType === 'markdown' || itemType === 'message_delta';
    })
    .map((item, index) => {
      const content = String(
        item.content || item.markdown || item.text || item.delta || '',
      );
      const orderNo = getTimelineOrderNo(item);

      return {
        blockId: String(item.blockId || item.id || `timeline_block_${index}`),
        blockType: asString(item.blockType) || 'markdown',
        content,
        messageId: String(item.messageId || fallbackMessageId),
        orderNo: orderNo ?? index * 10 + 10,
        streamOrderNo: asNumber(item.streamOrderNo),
      };
    })
    .filter(block => block.content && !isApprovalContent(block.content))
    .sort((prev, next) => prev.orderNo - next.orderNo);

const normalizeStreamBlock = (
  data: Record<string, any>,
  content = '',
  streamOrderNo?: number,
): AgentMessageBlock => ({
  accountingPurposeConfirmation: data.accountingPurposeConfirmation,
  blockId: String(data.blockId || data.id || 'block_default'),
  blockType: data.blockType,
  content,
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || 0),
  streamOrderNo,
});

const normalizeStreamCard = (
  data: Record<string, any>,
  streamOrderNo?: number,
): AgentMessageCard => ({
  card: data.card || {},
  cardType: data.cardType,
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || 0),
  streamOrderNo,
});

const normalizeStreamBusinessCard = (
  data: Record<string, any>,
  streamOrderNo?: number,
): AgentMessageCard => ({
  card: data,
  cardType: 'business_card',
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || 0),
  streamOrderNo,
});

const normalizeStreamActionRequest = (
  data: Record<string, any>,
  streamOrderNo?: number,
): AgentMessageCard => ({
  card: data,
  cardType: 'action_request',
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || 0),
  streamOrderNo,
});

const normalizeStreamFormRequest = (
  data: Record<string, any>,
  streamOrderNo?: number,
): AgentMessageCard => ({
  card: data,
  cardType: 'form_request',
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || 0),
  streamOrderNo,
});

const normalizeStreamErrorCard = (
  data: Record<string, any>,
  streamOrderNo?: number,
): AgentMessageCard => ({
  card: data,
  cardType: 'error',
  messageId: String(data.messageId || 'message_default'),
  orderNo: Number(data.orderNo || streamOrderNo || 0),
  streamOrderNo,
});

const normalizeRecordBlock = (
  block: Record<string, unknown>,
  fallbackMessageId: string,
  fallbackIndex: number,
): AgentMessageBlock => ({
  blockId: String(
    block.blockId || block.id || `history_block_${fallbackIndex}`,
  ),
  blockType: typeof block.blockType === 'string' ? block.blockType : 'markdown',
  content: String(block.content || block.markdown || block.text || ''),
  messageId: String(block.messageId || fallbackMessageId),
  orderNo: Number(block.orderNo || fallbackIndex * 10 + 10),
});

const normalizeRecordCard = (
  card: Record<string, unknown>,
  fallbackMessageId: string,
  fallbackIndex: number,
): AgentMessageCard => ({
  card: (card.card as Record<string, unknown>) || card,
  cardType: typeof card.cardType === 'string' ? card.cardType : undefined,
  messageId: String(card.messageId || fallbackMessageId),
  orderNo: Number(card.orderNo || fallbackIndex * 10 + 20),
});

const assignMissingCardField = (
  card: Record<string, unknown>,
  payloadResult: Record<string, unknown> | undefined,
  field: string,
) => {
  if (
    !payloadResult ||
    card[field] !== undefined ||
    payloadResult[field] === undefined
  ) {
    return;
  }

  card[field] = payloadResult[field];
};

const normalizeRecordActionCard = (
  block: Record<string, unknown>,
  fallbackMessageId: string,
  fallbackIndex: number,
  payloadResult?: Record<string, unknown>,
): AgentMessageCard => {
  const extra = asRecord(block.extra);
  const resultResumeRequest = asRecord(payloadResult?.resumeRequest);
  const card = Object.keys(extra).length
    ? {
        ...extra,
        ...block,
      }
    : {
        ...block,
      };

  if (!Object.keys(asRecord(card.resumeRequest)).length) {
    card.resumeRequest = resultResumeRequest;
  }

  assignMissingCardField(card, payloadResult, 'checkpoint');
  assignMissingCardField(card, payloadResult, 'interrupts');
  assignMissingCardField(card, payloadResult, 'rawInterrupt');

  return {
    card,
    cardType: 'action_request',
    messageId: String(block.messageId || fallbackMessageId),
    orderNo: Number(block.orderNo || fallbackIndex * 10 + 20),
  };
};

const normalizeRecordFormCard = (
  block: Record<string, unknown>,
  fallbackMessageId: string,
  fallbackIndex: number,
  payloadResult?: Record<string, unknown>,
): AgentMessageCard => {
  const extra = asRecord(block.extra);
  const resultResumeRequest = asRecord(payloadResult?.resumeRequest);
  const card = Object.keys(extra).length
    ? {
        ...extra,
        ...block,
      }
    : {
        ...block,
      };

  if (!Object.keys(asRecord(card.resumeRequest)).length) {
    card.resumeRequest = resultResumeRequest;
  }

  assignMissingCardField(card, payloadResult, 'checkpoint');
  assignMissingCardField(card, payloadResult, 'interrupts');
  assignMissingCardField(card, payloadResult, 'rawInterrupt');
  assignMissingCardField(card, payloadResult, 'formTitle');

  return {
    card,
    cardType: 'form_request',
    messageId: String(block.messageId || fallbackMessageId),
    orderNo: Number(block.orderNo || fallbackIndex * 10 + 20),
  };
};

const normalizeRecordBusinessCard = (
  block: Record<string, unknown>,
  fallbackMessageId: string,
  fallbackIndex: number,
): AgentMessageCard => {
  const extra = asRecord(block.extra);

  return {
    card: Object.keys(extra).length
      ? {
          ...extra,
          ...block,
        }
      : {
          ...block,
        },
    cardType: 'business_card',
    messageId: String(block.messageId || fallbackMessageId),
    orderNo: Number(block.orderNo || fallbackIndex * 10 + 20),
  };
};

const getOptionalString = (data: unknown) =>
  typeof data === 'string' && data.trim() ? data.trim() : undefined;

const isApprovalContent = (content: string) =>
  /Tool execution requires approval/i.test(content);

const isActionRequestMessageCard = (card: AgentMessageCard) =>
  card.cardType === 'action_request' ||
  asString(card.card.eventType) === 'action_request' ||
  asString(card.card.blockType) === 'actions';

const isFormRequestMessageCard = (card: AgentMessageCard) =>
  card.cardType === 'form_request' ||
  asString(card.card.eventType) === 'form_request' ||
  asString(card.card.blockType) === 'form';

const markActionRequestCardCollapsed = (card: AgentMessageCard) =>
  isActionRequestMessageCard(card)
    ? {
        ...card,
        card: {
          ...card.card,
          actionSubmitted: true,
          collapsed: true,
        },
      }
    : card;

const markFormRequestCardCollapsed = (card: AgentMessageCard) =>
  isFormRequestMessageCard(card) && !isAccountingPurposeCard(card)
    ? {
        ...card,
        card: {
          ...card.card,
          collapsed: true,
          formSubmitted: true,
        },
      }
    : card;

const markRequestCardCollapsed = (card: AgentMessageCard) =>
  markFormRequestCardCollapsed(markActionRequestCardCollapsed(card));

const isRequestMessageCard = (card: AgentMessageCard) =>
  isActionRequestMessageCard(card) || isFormRequestMessageCard(card);

const collapseSubmittedRequestCards = (
  messages: AgentConversationMessage[],
) => {
  let hasLaterUserMessage = false;

  return messages.reduceRight<AgentConversationMessage[]>(
    (nextMessages, message) => {
      const shouldCollapse =
        hasLaterUserMessage &&
        message.role === 'assistant' &&
        message.cards.some(isRequestMessageCard);
      const nextMessage = shouldCollapse
        ? {
            ...message,
            cards: message.cards.map(markRequestCardCollapsed),
          }
        : message;

      if (message.role === 'user' && message.content.trim()) {
        hasLaterUserMessage = true;
      }

      nextMessages.unshift(nextMessage);

      return nextMessages;
    },
    [],
  );
};

const getCardScalar = (record: Record<string, unknown>, keys: string[]) =>
  keys
    .map(key => {
      const value = record[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
      }

      return '';
    })
    .find(Boolean);

const getBusinessCardIdentity = (card: AgentMessageCard) => {
  const enterprise = getEnterpriseCard(card.card);
  if (enterprise?.blockId) {
    return `enterprise:${card.messageId}:${enterprise.blockId}`;
  }
  const root = asRecord(card.card);
  const safePayload = asRecord(root.safePayload);
  const payload = {
    ...safePayload,
    ...root,
  };
  const businessCard = Object.keys(asRecord(payload.card)).length
    ? asRecord(payload.card)
    : payload;
  const records = [
    asRecord(businessCard.extra),
    asRecord(businessCard.bizRef),
    asRecord(businessCard.data),
    asRecord(businessCard.summary),
    asRecord(businessCard.snapshot),
    businessCard,
  ];
  const enterpriseRecords = [...records, payload];
  const bizType = records
    .map(record => getCardScalar(record, ['bizType']))
    .find(Boolean);
  const cardType = records
    .map(record => getCardScalar(record, ['cardType']))
    .find(Boolean);
  const module = records
    .map(record => getCardScalar(record, ['module', 'bizModule', 'biz_module']))
    .find(Boolean);
  const reportUrl = records
    .map(record => getCardScalar(record, ['reportUrl', 'url']))
    .find(Boolean);
  const reportId = records
    .map(record => getCardScalar(record, ['reportId', 'bizId', 'id']))
    .find(Boolean);
  const enterpriseCarbonKind =
    getEnterpriseCarbonBusinessKind(enterpriseRecords);

  if (
    /^cbam2?$/i.test(module || '') ||
    /cbam2?[_-]?report|report[_-]?cbam2?/i.test(cardType || '')
  ) {
    return reportId ? `business_card:cbam:${reportId}` : '';
  }

  if (enterpriseCarbonKind) {
    const enterpriseCarbonKey =
      getEnterpriseCarbonBusinessKey(enterpriseRecords);

    return enterpriseCarbonKey ? `business_card:${enterpriseCarbonKey}` : '';
  }

  if (card.cardType !== 'business_card') {
    return '';
  }

  const isReportCard =
    bizType === 'report' ||
    /report/i.test(cardType || '') ||
    Boolean(reportUrl);

  if (isReportCard) {
    return reportId
      ? `business_card:report:${reportId}`
      : `business_card:report:${reportUrl || ''}`;
  }

  const accountId = records
    .map(record => getCardScalar(record, ['accountId', 'bizId', 'id']))
    .find(Boolean);

  return accountId ? `business_card:account:${accountId}` : '';
};

const normalizeHistoryAnswerBlock = (
  content: string,
  fallbackMessageId: string,
  payloadBlocks: AgentMessageBlock[],
): AgentMessageBlock[] => {
  if (!content) {
    return payloadBlocks;
  }

  const firstBlock = payloadBlocks[0];

  return [
    {
      blockId: firstBlock?.blockId || `${fallbackMessageId}_content`,
      blockType: firstBlock?.blockType || 'markdown',
      content,
      messageId: firstBlock?.messageId || fallbackMessageId,
      orderNo: firstBlock?.orderNo || 10,
    },
  ];
};

const getRecordValues = (record?: Record<string, unknown>) =>
  record ? Object.values(record).filter(Boolean) : [];

const hasStartModelAction = (actions: unknown[] = []) =>
  actions.some(action => {
    const actionRecord = asRecord(action);
    const actionText =
      getOptionalString(actionRecord.text) ||
      getOptionalString(actionRecord.label) ||
      getOptionalString(actionRecord.title) ||
      getOptionalString(actionRecord.name) ||
      '';
    const actionType =
      getOptionalString(actionRecord.type) ||
      getOptionalString(actionRecord.action) ||
      getOptionalString(actionRecord.actionType) ||
      '';

    return (
      /开始建模|确认执行|执行建模/.test(actionText) ||
      /start_model|build_model|confirm_plan|execute_model/.test(actionType)
    );
  });

export const normalizeAgentAnswerControls = ({
  actions = [],
  intent,
  plan,
  status,
}: {
  actions?: unknown[];
  intent?: string;
  plan?: Record<string, unknown>;
  status?: string;
} = {}): AgentAnswerControls | undefined => {
  const hasPlan = getRecordValues(plan).length > 0;
  const showStartModel =
    status === 'WAIT_PLAN_CONFIRM' ||
    hasStartModelAction(actions) ||
    (intent === 'build_model' && hasPlan);
  const controls: AgentAnswerControls = {};

  if (showStartModel) {
    controls.showStartModel = true;
  }

  return controls.showStartModel ? controls : undefined;
};

const formatSessionTime = (value?: number | string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('zh-CN', { hour12: false });
};

const formatSessionDate = (value?: number | string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).split(/[ T]/)[0];
  }

  return date.toLocaleDateString('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getSessionTitle = (session: AgentSession, index: number) => {
  const explicitTitle =
    session.sessionTitle || session.title || session.name || session.message;

  if (explicitTitle?.trim()) {
    return explicitTitle.trim();
  }

  if (session.reply?.trim()) {
    return session.reply.trim();
  }

  if (session.intent && session.intent !== 'unknown') {
    return INTENT_LABELS[session.intent] || session.intent;
  }

  return I18N.template(I18N.carbonAgent.agentSessionWithId, {
    val1: String(session.sessionId).slice(-6) || index + 1,
  });
};

const getSessionMeta = (session: AgentSession) => {
  const rawTime =
    session.updatedAt ||
    session.updateTime ||
    session.createdAt ||
    session.createTime;
  const time = formatSessionTime(rawTime);

  if (time) {
    return time;
  }

  if (session.status) {
    return SESSION_STATUS_LABELS[session.status] || session.status;
  }

  return I18N.carbonAgent.agentSession;
};

const normalizeAccountBindStatus = (
  value?: string | null,
): AccountBindStatus | undefined =>
  value === 'HAS_ACCOUNT' || value === 'NO_ACCOUNT' ? value : undefined;

const normalizeAgentSession = (
  session: AgentSession,
  index = 0,
): AgentConversation => {
  const workspaceProjectId = session.workspaceProjectId ?? session.projectId;
  const projectId =
    workspaceProjectId === undefined || workspaceProjectId === null
      ? null
      : String(workspaceProjectId);

  return {
    accountBindStatus: normalizeAccountBindStatus(
      session.accountBindStatus || session.account_bind_status,
    ),
    bizId: session.bizId,
    bizRef: session.bizRef || undefined,
    bizType: session.bizType,
    cbamId: session.cbamid ?? session.cbamId,
    canEditEnterprisePreview: session.canEditEnterprisePreview,
    canWrite: session.canWrite,
    hasUnread: session.hasUnread === true,
    id: String(session.sessionId),
    initiatorCompanyId: session.initiatorCompanyId,
    initiatorCompanyName: session.initiatorCompanyName,
    initiatorUserId: session.initiatorUserId,
    initiatorUserName: session.initiatorUserName,
    initiatedByMe: session.initiatedByMe,
    intent: session.intent,
    module: session.module,
    projectId,
    quickSkill: session.quickSkill,
    running: session.running === true,
    runningMessageId: asScalarString(session.runningMessageId) || undefined,
    scene: session.scene,
    sessionScope: session.sessionScope,
    sessionId: String(session.sessionId),
    sourceSessionId: session.sourceSessionId,
    sourceSuggestionId: session.sourceSuggestionId,
    sourceTaskId: session.sourceTaskId,
    status: session.status,
    time: getSessionMeta(session),
    title: getSessionTitle(session, index),
    titleSource: session.titleSource,
    workspaceProjectId:
      workspaceProjectId === undefined || workspaceProjectId === null
        ? null
        : String(workspaceProjectId),
  };
};

const normalizeAgentSessions = (
  sessions: AgentSession[] = [],
): AgentSessionListResult => ({
  conversations: sessions
    .filter(session => session.sessionId)
    .map(normalizeAgentSession),
});

const normalizeAgentProjects = (
  projects: AgentProjectResponseItem[] = [],
): AgentProject[] =>
  projects.reduce<AgentProject[]>((result, project) => {
    if (
      project.projectId === undefined ||
      project.projectId === null ||
      !String(project.projectId).trim()
    ) {
      return result;
    }

    const id = String(project.projectId);

    result.push({
      businessCapabilities: project.businessCapabilities,
      businessType: project.businessType,
      businessTypeName: project.businessTypeName,
      createTime: project.createTime,
      currentRole: project.currentRole,
      currentRoleName: project.currentRoleName,
      enterpriseSetting: project.enterpriseSetting,
      expectedFinishTime: project.expectedFinishTime,
      id,
      manageable: project.manageable,
      memberCount: project.memberCount,
      name:
        project.projectName?.trim() ||
        I18N.template(I18N.carbonAgent.projectWithId, {
          val1: id,
        }),
      ownerCompanyId: project.ownerCompanyId,
      ownerCompanyName: project.ownerCompanyName,
      ownerUserId: project.ownerUserId,
      ownerUserName: project.ownerUserName,
      projectGoal: project.projectGoal,
      setting: project.setting,
      status: project.status,
      statusName: project.statusName,
      updateTime: project.updateTime,
      version: project.version,
    });

    return result;
  }, []);

const normalizeAgentProjectConfig = (
  config?: Partial<AgentProjectConfig>,
): AgentProjectConfig => ({
  businessTypes: config?.businessTypes || [],
  compareDimensions: config?.compareDimensions || [],
  enabled: config?.enabled === true,
  enterpriseGwpVersions: config?.enterpriseGwpVersions || [],
  enterpriseTimeTypes: config?.enterpriseTimeTypes || [],
  factorSources: config?.factorSources || [],
  lifecycleScopes: config?.lifecycleScopes || [],
  lifecycleStages: config?.lifecycleStages || [],
  maxCompareCalculations: config?.maxCompareCalculations,
  maxFiles: config?.maxFiles,
  maxMembers: config?.maxMembers,
  maxProjectsPerUser: config?.maxProjectsPerUser,
  taskObjectTypes: config?.taskObjectTypes || [],
  taskSources: config?.taskSources || [],
  taskStatuses: config?.taskStatuses || [],
});

const getHistorySessionSummary = (session: AgentSession) =>
  (
    asScalarString(session.summary) ||
    asScalarString(session.reply) ||
    asScalarString(session.message) ||
    ''
  ).trim();

const normalizeAgentHistoryConversation = (
  session: AgentSession,
  index = 0,
): AgentHistoryConversation => {
  const conversation = normalizeAgentSession(session, index);
  const rawUpdateTime = session.updateTime || session.updatedAt;
  const sessionDate = asScalarString(session.sessionDate);
  const updateTime = formatSessionTime(rawUpdateTime) || conversation.time;

  return {
    ...conversation,
    entry: asScalarString(session.entry) || undefined,
    quickSkill: asScalarString(session.quickSkill) || undefined,
    scene: asScalarString(session.scene) || undefined,
    sessionDate,
    shared: asBoolean(session.shared),
    summary: getHistorySessionSummary(session),
    updateDate:
      sessionDate ||
      formatSessionDate(rawUpdateTime) ||
      formatSessionDate(session.createTime || session.createdAt),
    updateTime,
  };
};

const normalizeAgentSessionHistoryList = (
  data?: AgentSessionHistoryListResponse['data'],
): AgentSessionHistoryListResult => {
  const rows = Array.isArray(data?.rows)
    ? data.rows
        .filter(session => session.sessionId)
        .map(normalizeAgentHistoryConversation)
    : [];

  return {
    rows,
    total: asNumber(data?.total) ?? rows.length,
  };
};

const normalizeHistoryFiles = (files: unknown): AgentChatAttachment[] =>
  Array.isArray(files)
    ? files.flatMap(file => {
        const fileRecord = asRecord(file);
        const fileId = asString(fileRecord.fileId) || asString(fileRecord.id);
        const sessionId = asString(fileRecord.sessionId);
        const name =
          asString(fileRecord.name) ||
          asString(fileRecord.filename) ||
          asString(fileRecord.fileName) ||
          fileId;
        const url =
          asString(fileRecord.url) ||
          asString(fileRecord.downloadUrl) ||
          asString(fileRecord.fileUrl);

        if (!name && !fileId) {
          return [];
        }

        const size = asNumber(fileRecord.size);
        const type = asString(fileRecord.type) || asString(fileRecord.mime);
        const normalizedFile: AgentChatAttachment = {
          name,
        };

        if (fileId) {
          normalizedFile.fileId = fileId;
        }

        if (sessionId) {
          normalizedFile.sessionId = sessionId;
        }

        if (size !== undefined) {
          normalizedFile.size = size;
        }

        if (type) {
          normalizedFile.type = type;
        }

        if (url) {
          normalizedFile.url = url;
        }

        return [normalizedFile];
      })
    : [];

const isHistoryTextReference = (reference: unknown) => {
  if (typeof reference === 'string') return true;
  const type = asString(asRecord(reference).type).trim().toLowerCase();

  return (
    !type ||
    type === 'message' ||
    type === 'text' ||
    type === 'quote' ||
    type === 'selected_text'
  );
};

const getHistoryReferenceContents = (payload: Record<string, unknown>) =>
  Array.isArray(payload.references)
    ? payload.references.flatMap(reference => {
        if (!isHistoryTextReference(reference)) return [];
        const content =
          typeof reference === 'string'
            ? reference
            : asString(asRecord(reference).content);
        const trimmedContent = content.trim();

        return trimmedContent ? [trimmedContent] : [];
      })
    : [];

const getHistoryReferenceCount = (
  payload: Record<string, unknown>,
  referenceContents: string[],
) => {
  // When concrete references are present, count only text selections. Card
  // references (for example a CCDB factor context) are rendered separately.
  if (Array.isArray(payload.references)) {
    return referenceContents.length ? referenceContents.length : undefined;
  }

  const referenceCount =
    asNumber(payload.referenceCount) ?? asNumber(payload.reference_count);

  if (referenceCount && referenceCount > 0) {
    return referenceCount;
  }

  return referenceContents.length ? referenceContents.length : undefined;
};

const getHistoryQuestionDisplayContent = (
  content: string,
  referenceCount?: number,
) => {
  if (!referenceCount || !/^引用内容[:：]/.test(content.trim())) {
    return content;
  }

  const separatorMatch = /\n\s*\n/.exec(content);
  const questionContent = separatorMatch
    ? content.slice(separatorMatch.index + separatorMatch[0].length)
    : '';

  return questionContent.trim() || I18N.carbonAgent.continueFromSelectedText;
};

const normalizeHistoryFeedbackType = (
  feedback: Record<string, unknown>,
): AgentFeedbackType | undefined => {
  const feedbackStatus = asString(
    feedback.feedbackStatus || feedback.feedback_status,
  ).toLowerCase();

  if (feedbackStatus === 'liked' || feedbackStatus === 'like') {
    return '1';
  }

  if (feedbackStatus === 'disliked' || feedbackStatus === 'dislike') {
    return '2';
  }

  const feedbackType = String(feedback.feedbackType ?? feedback.feedback_type);

  if (feedbackType === '1') {
    return '1';
  }

  if (feedbackType === '2') {
    return '2';
  }

  return undefined;
};

const normalizeHistoryFeedback = (
  feedback: unknown,
): AgentMessageFeedback | undefined => {
  const feedbackRecord = asRecord(feedback);
  const feedbackType = normalizeHistoryFeedbackType(feedbackRecord);

  if (!feedbackType) {
    return undefined;
  }

  return {
    feedbackCategory: asString(
      feedbackRecord.feedbackCategory || feedbackRecord.feedback_category,
    ),
    feedbackCategoryName: asString(
      feedbackRecord.feedbackCategoryName ||
        feedbackRecord.feedback_category_name,
    ),
    feedbackId: asScalarString(
      feedbackRecord.feedbackId || feedbackRecord.feedback_id,
    ),
    feedbackStatus: asString(
      feedbackRecord.feedbackStatus || feedbackRecord.feedback_status,
    ),
    feedbackType,
  };
};

const normalizeHistoryTurn = (
  turn: AgentHistoryTurn,
): AgentConversationMessage => {
  const messageId = String(turn.messageId || `history_${turn.id}`);
  const payload = turn.payload || {};
  const payloadResult = asRecord(payload.result);
  const payloadTimeline = getTimelineItems(payload);
  const payloadBlocks = Array.isArray(payload.blocks)
    ? (payload.blocks as Record<string, unknown>[])
        .filter(
          block =>
            block.blockType !== 'actions' &&
            block.blockType !== 'form' &&
            block.blockType !== 'business_card',
        )
        .map((block, index) => normalizeRecordBlock(block, messageId, index))
        .filter(block => block.content && !isApprovalContent(block.content))
    : [];
  const payloadActionCards = Array.isArray(payload.blocks)
    ? (payload.blocks as Record<string, unknown>[])
        .filter(block => block.blockType === 'actions')
        .map((block, index) =>
          withTimelineCardOrder(
            normalizeRecordActionCard(block, messageId, index, payloadResult),
            block,
            payloadTimeline,
            messageId,
            ['action_request', 'actions'],
          ),
        )
    : [];
  const payloadFormCards = Array.isArray(payload.blocks)
    ? (payload.blocks as Record<string, unknown>[])
        .filter(block => block.blockType === 'form')
        .map((block, index) =>
          withTimelineCardOrder(
            normalizeRecordFormCard(block, messageId, index, {
              ...payloadResult,
              formTitle: payload.formTitle,
            }),
            block,
            payloadTimeline,
            messageId,
            ['form_request', 'form'],
          ),
        )
    : [];
  const payloadBusinessCards = Array.isArray(payload.blocks)
    ? (payload.blocks as Record<string, unknown>[])
        .filter(block => block.blockType === 'business_card')
        .map((block, index) =>
          withTimelineCardOrder(
            normalizeRecordBusinessCard(block, messageId, index),
            block,
            payloadTimeline,
            messageId,
            ['business_card'],
          ),
        )
    : [];
  const payloadCards = Array.isArray(payload.cards)
    ? [
        ...(payload.cards as Record<string, unknown>[]).map((card, index) =>
          normalizeRecordCard(card, messageId, index),
        ),
        ...payloadActionCards,
        ...payloadFormCards,
        ...payloadBusinessCards,
      ]
    : [...payloadActionCards, ...payloadFormCards, ...payloadBusinessCards];
  const dedupedPayloadCards = payloadCards.filter((card, index, cards) => {
    const identity = getBusinessCardIdentity(card);

    return (
      !identity ||
      cards.findIndex(
        currentCard => getBusinessCardIdentity(currentCard) === identity,
      ) === index
    );
  });
  const payloadActions = Array.isArray(payload.actions) ? payload.actions : [];
  const attachments = normalizeHistoryFiles(payload.files);
  const role = turn.role === 'assistant' ? 'assistant' : 'user';
  const referenceContents =
    role === 'user' ? getHistoryReferenceContents(payload) : [];
  const referenceCount =
    role === 'user'
      ? getHistoryReferenceCount(payload, referenceContents)
      : undefined;
  const content =
    role === 'user'
      ? getHistoryQuestionDisplayContent(turn.content || '', referenceCount)
      : turn.content || '';
  const hasActionCards = payloadCards.some(isActionRequestMessageCard);
  const replyContent = getOptionalString(payload.reply);
  const rawDisplayContent = replyContent || content;
  const displayContent =
    role === 'assistant'
      ? hasActionCards && isApprovalContent(rawDisplayContent)
        ? ''
        : rawDisplayContent
      : content;
  const timelineBlocks =
    role === 'assistant'
      ? normalizeTimelineMarkdownBlocks(payloadTimeline, messageId)
      : [];
  const answerBlocks =
    role === 'assistant'
      ? timelineBlocks.length
        ? replaceLatestAgentMessageBlockContent(timelineBlocks, displayContent)
        : normalizeHistoryAnswerBlock(displayContent, messageId, payloadBlocks)
      : payloadBlocks;
  const historyFeedback =
    role === 'assistant' ? normalizeHistoryFeedback(turn.feedback) : undefined;

  return {
    attachments: role === 'user' ? attachments : undefined,
    blocks: answerBlocks,
    cards: dedupedPayloadCards,
    content: displayContent,
    createTime: turn.createTime,
    feedback: historyFeedback,
    id: messageId,
    referenceCount,
    referenceContents: referenceContents.length ? referenceContents : undefined,
    role,
    answerControls:
      role === 'assistant' && !hasActionCards
        ? normalizeAgentAnswerControls({
            actions: payloadActions,
            intent: turn.intent,
            plan: asRecord(payload.plan),
            status: getOptionalString(payload.status) || turn.status,
          })
        : undefined,
    toolCalls: [],
    turnId: turn.id,
    turnIndex: turn.turnIndex,
  };
};

const getEventMessage = (
  event: AgentTraceEvent,
  payload: Record<string, unknown>,
) => {
  const payloadMessage = payload.message;

  if (event.message) {
    return event.message;
  }

  if (typeof payloadMessage === 'string') {
    return payloadMessage;
  }

  return event.errorMessage || '';
};

const getEventTitle = (
  event: AgentTraceEvent,
  payload: Record<string, unknown>,
) => {
  const payloadTitle = payload.title;

  if (event.title) {
    return event.title;
  }

  if (typeof payloadTitle === 'string') {
    return payloadTitle;
  }

  return event.toolName || I18N.carbonAgent.toolCall;
};

const getToolCallId = (data: {
  eventId?: string;
  payload?: Record<string, unknown>;
  safePayload?: Record<string, unknown>;
}) => {
  const safePayloadToolCallId = asString(data.safePayload?.toolCallId);
  const payloadToolCallId = asString(data.payload?.toolCallId);

  return safePayloadToolCallId || payloadToolCallId || data.eventId || '';
};

const normalizeTraceToolCall = (
  event: AgentTraceEvent,
  timelineIndex?: TraceTimelineIndex,
): AgentToolCall => {
  const payload = {
    ...parseJsonRecord(event.payloadJson),
    ...parseJsonRecord(event.safePayloadJson),
  };
  const safePayload = asRecord(payload.safePayload);
  const payloadStatus = payload.status;
  const safePayloadData = asRecord(safePayload.data);
  const toolCallId = getToolCallId({
    eventId: event.eventId,
    payload,
    safePayload,
  });
  const timelineOrderNo = getTimelineEventOrder(timelineIndex, event, [
    toolCallId,
  ]);

  return {
    agentName: event.agentName,
    costMillis: event.costMillis,
    createTime: event.createTime,
    errorMessage: event.errorMessage,
    eventId: event.eventId,
    eventType: event.eventType,
    messageId: event.messageId,
    mcpServer: event.mcpServer,
    message: getEventMessage(event, {
      ...payload,
      ...safePayloadData,
    }),
    orderNo:
      timelineOrderNo ??
      asNumber(payload.orderNo) ??
      asNumber(safePayloadData.orderNo),
    payload,
    riskLevel: event.riskLevel,
    sequenceNo: event.sequenceNo,
    status:
      event.status ||
      asString(safePayloadData.status) ||
      (typeof payloadStatus === 'string' ? payloadStatus : undefined),
    title: getEventTitle(event, {
      ...payload,
      ...safePayloadData,
    }),
    toolCallId,
    toolName:
      event.toolName ||
      asString(safePayload.toolName) ||
      asString(safePayloadData.toolName) ||
      undefined,
    traceId: event.traceId,
  };
};

const normalizeStreamToolCall = (
  data: Record<string, any>,
  eventType: string,
  fallbackOrderNo: number,
): AgentToolCall => {
  const safePayload = asRecord(data.safePayload);
  const payloadStatus = asString(data.status) || asString(safePayload.status);
  const toolName =
    asString(data.toolName) ||
    asString(safePayload.toolName) ||
    asString(data.message);
  const eventId = asString(data.eventId);
  const toolCallId = getToolCallId({
    eventId,
    payload: data,
    safePayload,
  });

  return {
    agentName: data.agentName,
    costMillis: asNumber(data.costMillis),
    createTime: asString(data.createTime),
    errorMessage: asString(data.errorMessage),
    eventId,
    eventType,
    message: asString(data.message) || toolName,
    messageId: asString(data.messageId),
    mcpServer: data.mcpServer,
    orderNo: asNumber(data.orderNo) || fallbackOrderNo,
    payload: {
      ...data,
      safePayload,
    },
    riskLevel: data.riskLevel,
    sequenceNo: asNumber(data.sequenceNo),
    status:
      eventType === 'tool_call_success'
        ? 'SUCCESS'
        : eventType === 'tool_call_error' || eventType === 'tool_call_failed'
        ? 'FAILED'
        : payloadStatus || 'RUNNING',
    streamOrderNo: fallbackOrderNo,
    title:
      asString(data.title) ||
      (eventType === 'tool_call_success'
        ? I18N.carbonAgent.toolCallDone
        : I18N.carbonAgent.toolCalling),
    toolCallId,
    toolName,
    traceId: data.traceId,
  };
};

const getToolCallMergeKey = (toolCall: AgentToolCall) =>
  toolCall.toolCallId ||
  toolCall.eventId ||
  `${toolCall.toolName || 'tool'}-${toolCall.sequenceNo || ''}-${
    toolCall.createTime || ''
  }`;

const mergeToolCalls = (toolCalls: AgentToolCall[]) =>
  toolCalls.reduce<AgentToolCall[]>((mergedToolCalls, toolCall) => {
    const mergeKey = getToolCallMergeKey(toolCall);
    const existingIndex = mergedToolCalls.findIndex(
      currentToolCall => getToolCallMergeKey(currentToolCall) === mergeKey,
    );

    if (existingIndex < 0) {
      return [...mergedToolCalls, toolCall];
    }

    return mergedToolCalls.map((currentToolCall, index) =>
      index === existingIndex
        ? mergeToolEvent(currentToolCall, toolCall)
        : currentToolCall,
    );
  }, []);

const getToolCallSortOrder = (toolCall: AgentToolCall) =>
  toolCall.orderNo ??
  (toolCall.sequenceNo ? toolCall.sequenceNo * 10 : Number.MAX_SAFE_INTEGER);

const normalizeTraceToolCalls = (
  events: AgentTraceEvent[] = [],
  timelineIndex?: TraceTimelineIndex,
) => {
  const tools = events
    .filter(
      event =>
        isVisibleToolEvent(event) &&
        isVisibleToolEvent(parseJsonRecord(event.payloadJson)) &&
        isVisibleToolEvent(parseJsonRecord(event.safePayloadJson)) &&
        event.eventType?.startsWith('tool_call'),
    )
    .map(event =>
      normalizeToolPresentation(normalizeTraceToolCall(event, timelineIndex)),
    );
  const cbamTools = new Map(
    mergeCbamHistoryTools(tools).map(tool => [getToolCallMergeKey(tool), tool]),
  );
  // 完整保留原合并及排列，只替换这两类 CBAM 工具；其他业务结果和相对顺序不变。
  return mergeToolCalls(
    tools.sort(
      (prev, next) => getToolCallSortOrder(prev) - getToolCallSortOrder(next),
    ),
  ).map(tool =>
    isCbamHistoryTool(tool)
      ? cbamTools.get(getToolCallMergeKey(tool)) || tool
      : tool,
  );
};

const normalizeTraceErrorCard = (
  event: AgentTraceEvent,
  fallbackIndex: number,
  timelineIndex?: TraceTimelineIndex,
): AgentMessageCard => {
  const payload = {
    ...parseJsonRecord(event.payloadJson),
    ...parseJsonRecord(event.safePayloadJson),
  };
  const safePayload = asRecord(payload.safePayload);

  return {
    card: {
      ...payload,
      ...event,
      eventType: 'error',
      message:
        event.message ||
        asString(payload.message) ||
        asString(safePayload.message) ||
        event.errorMessage ||
        I18N.carbonAgent.executionFailed,
      safePayload,
    },
    cardType: 'error',
    messageId:
      event.messageId || event.eventId || `trace_error_${fallbackIndex}`,
    orderNo:
      getTimelineEventOrder(timelineIndex, event) ??
      (event.sequenceNo || fallbackIndex + 1) * 10,
  };
};

const normalizeTraceErrorCards = (
  events: AgentTraceEvent[] = [],
  timelineIndex?: TraceTimelineIndex,
) =>
  events
    .filter(
      event =>
        isVisibleToolEvent(event) &&
        isVisibleToolEvent(parseJsonRecord(event.payloadJson)) &&
        isVisibleToolEvent(parseJsonRecord(event.safePayloadJson)) &&
        event.eventType === 'error',
    )
    .map((event, index) => normalizeTraceErrorCard(event, index, timelineIndex))
    .sort((prev, next) => prev.orderNo - next.orderNo);

const normalizeTraceBusinessCard = (
  event: AgentTraceEvent,
  fallbackIndex: number,
  timelineIndex?: TraceTimelineIndex,
): AgentMessageCard => {
  const payload = {
    ...parseJsonRecord(event.payloadJson),
    ...parseJsonRecord(event.safePayloadJson),
  };
  const safePayload = asRecord(payload.safePayload);

  return {
    card: {
      ...safePayload,
      ...payload,
      ...event,
      eventType: 'business_card',
    },
    cardType: 'business_card',
    messageId:
      event.messageId ||
      event.eventId ||
      `trace_business_card_${fallbackIndex}`,
    orderNo:
      getTimelineEventOrder(timelineIndex, event) ??
      (event.sequenceNo || fallbackIndex + 1) * 10,
  };
};

const normalizeTraceBusinessCards = (
  events: AgentTraceEvent[] = [],
  timelineIndex?: TraceTimelineIndex,
) =>
  events
    .filter(
      event =>
        isVisibleToolEvent(event) &&
        isVisibleToolEvent(parseJsonRecord(event.payloadJson)) &&
        isVisibleToolEvent(parseJsonRecord(event.safePayloadJson)) &&
        event.eventType === 'business_card',
    )
    .map((event, index) =>
      normalizeTraceBusinessCard(event, index, timelineIndex),
    )
    .sort((prev, next) => prev.orderNo - next.orderNo);

const getTimeValue = (time?: string) => {
  if (!time) {
    return Number.NaN;
  }

  return new Date(time).getTime();
};

const findLastMessageIndex = (
  messages: AgentConversationMessage[],
  predicate: (message: AgentConversationMessage) => boolean,
) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (predicate(messages[index])) {
      return index;
    }
  }

  return -1;
};

const attachToolCallsToMessages = (
  messages: AgentConversationMessage[],
  toolCalls: AgentToolCall[],
) => {
  if (!toolCalls.length) {
    return messages;
  }

  const nextMessages = messages.map(message => ({
    ...message,
    toolCalls: [...message.toolCalls],
  }));

  toolCalls.forEach(toolCall => {
    const toolCallTime = getTimeValue(toolCall.createTime);
    let targetIndex = toolCall.messageId
      ? nextMessages.findIndex(
          message =>
            message.role === 'assistant' && message.id === toolCall.messageId,
        )
      : -1;

    if (targetIndex < 0 && !Number.isNaN(toolCallTime)) {
      targetIndex = findLastMessageIndex(nextMessages, message => {
        const messageTime = getTimeValue(message.createTime);

        return message.role === 'assistant' && messageTime <= toolCallTime;
      });
    }

    if (targetIndex < 0) {
      targetIndex = findLastMessageIndex(
        nextMessages,
        message => message.role === 'assistant',
      );
    }

    if (targetIndex < 0) {
      nextMessages.push({
        blocks: [],
        cards: [],
        content: '',
        id: `trace_tool_${
          toolCall.eventId || toolCall.sequenceNo || Date.now()
        }`,
        role: 'assistant',
        toolCalls: [toolCall],
      });
      return;
    }

    nextMessages[targetIndex].toolCalls.push(toolCall);
  });

  return nextMessages;
};

const attachCardsToMessages = (
  messages: AgentConversationMessage[],
  cards: AgentMessageCard[],
) => {
  if (!cards.length) {
    return messages;
  }

  const nextMessages = messages.map(message => ({
    ...message,
    cards: [...message.cards],
  }));

  cards.forEach(card => {
    const cardTime = getTimeValue(asString(card.card.createTime));
    let targetIndex = nextMessages.findIndex(
      message => message.role === 'assistant' && message.id === card.messageId,
    );

    if (targetIndex < 0 && !Number.isNaN(cardTime)) {
      targetIndex = findLastMessageIndex(nextMessages, message => {
        const messageTime = getTimeValue(message.createTime);

        return message.role === 'assistant' && messageTime <= cardTime;
      });
    }

    if (targetIndex < 0) {
      targetIndex = findLastMessageIndex(
        nextMessages,
        message => message.role === 'assistant',
      );
    }

    if (targetIndex < 0) {
      nextMessages.push({
        blocks: [],
        cards: [card],
        content: '',
        id: `trace_card_${card.messageId || card.orderNo || Date.now()}`,
        role: 'assistant',
        toolCalls: [],
      });
      return;
    }

    const hasCard = nextMessages[targetIndex].cards.some(
      currentCard =>
        currentCard.messageId === card.messageId &&
        currentCard.orderNo === card.orderNo &&
        currentCard.cardType === card.cardType,
    );
    const cardIdentity = getBusinessCardIdentity(card);
    const hasBusinessCard = Boolean(
      cardIdentity &&
        nextMessages[targetIndex].cards.some(
          currentCard => getBusinessCardIdentity(currentCard) === cardIdentity,
        ),
    );

    if (!hasCard && !hasBusinessCard) {
      nextMessages[targetIndex].cards.push(card);
    }
  });

  return nextMessages;
};

export const fetchHomeSuggestions = ({
  projectId = '',
  refresh = false,
  scene = HOME_SUGGESTION_SCENE,
}: FetchHomeSuggestionsParams = {}) =>
  request<HomeSuggestionResponse>({
    method: 'GET',
    url: '/ai/agent/sessions/suggestions',
    params: {
      projectId,
      refresh,
      scene,
    },
  }).then(response => normalizeSuggestions(response.data.data));

export const fetchAgentProjectSuggestions = (
  projectId: number | string,
  lang: string,
  signal?: AbortSignal,
) =>
  request<AgentProjectSuggestionResponse>({
    method: 'GET',
    params: { lang },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/suggestions`,
  }).then(response => normalizeProjectSuggestions(response.data.data));

export const fetchAgentHomeSkills = (params: FetchAgentHomeSkillsParams) =>
  request<AgentHomeSkillResponse>({
    method: 'GET',
    params,
    url: '/ai/agent/sessions/skills',
  }).then(response => response.data.data || []);

export const fetchAnonymousAgentSession = (
  browserId: string,
  signal?: AbortSignal,
) =>
  fetchAnonymousAgentApi<AgentAnonymousSessionResponse>(
    '/ai/agent/anonymous/session',
    {
      method: 'GET',
      params: { browserId },
      signal,
    },
  ).then(response => response.data);

export const fetchAnonymousAgentEligibility = (
  browserId: string,
  lang: string,
  signal?: AbortSignal,
) =>
  fetchAnonymousAgentApi<AgentAnonymousEligibilityResponse>(
    '/ai/agent/anonymous/eligibility',
    {
      body: JSON.stringify({
        browserId,
        clientType: 'AGENT_WEB',
        lang,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    },
  ).then(response => response.data);

export const fetchAnonymousAgentHomeSkills = (
  params: FetchAgentHomeSkillsParams,
) =>
  fetchAnonymousAgentApi<AgentHomeSkillResponse>('/ai/agent/anonymous/skills', {
    method: 'GET',
    params,
  }).then(response => response.data || []);

export const bindAnonymousAgentSession = async (browserId: string) => {
  await fetchAnonymousAgentApi<AgentAnonymousMutationResponse>(
    '/ai/agent/anonymous/bind',
    {
      body: JSON.stringify({ browserId }),
      headers: {
        Authorization: getToken(),
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );
};

export const cancelAnonymousAgentSession = ({
  browserId,
  messageId,
  sessionId,
}: {
  browserId: string;
  messageId: string;
  sessionId: string;
}) =>
  fetchAnonymousAgentApi<AgentAnonymousMutationResponse>(
    `/ai/agent/anonymous/sessions/${encodeURIComponent(sessionId)}/cancel`,
    {
      method: 'POST',
      params: { browserId, messageId },
    },
  );

export const fetchAgentSessions = (signal?: AbortSignal) =>
  request<AgentSessionListResponse>({
    method: 'GET',
    signal,
    url: '/ai/agent/sessions/listSessions',
  }).then(response => normalizeAgentSessions(response.data.data));

export const fetchAgentProjectSessions = (
  projectId: number | string,
  params: AgentProjectSessionListParams = {},
  signal?: AbortSignal,
): Promise<AgentProjectSessionPage> =>
  request<AgentProjectSessionListResponse>({
    method: 'GET',
    params: {
      ...DEFAULT_AGENT_PROJECT_SESSION_LIST_PARAMS,
      ...params,
    },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/sessions`,
  }).then(response => ({
    rows: normalizeAgentSessions(response.data.data?.rows).conversations.map(
      conversation => ({
        ...conversation,
        projectId: String(projectId),
        projectSession: true,
      }),
    ),
    total: Number(response.data.data?.total) || 0,
  }));

const AGENT_PROJECT_SESSION_LOOKUP_PAGE_SIZE = 20;

export const fetchAgentProjectSessionById = async (
  projectId: number | string,
  sessionId: number | string,
  signal?: AbortSignal,
): Promise<AgentConversation | undefined> => {
  const normalizedSessionId = String(sessionId).trim();

  if (!normalizedSessionId) {
    return undefined;
  }

  const fetchPage = async (
    pageNum: number,
  ): Promise<AgentConversation | undefined> => {
    if (signal?.aborted) {
      return undefined;
    }

    const page = await fetchAgentProjectSessions(
      projectId,
      {
        pageNum,
        pageSize: AGENT_PROJECT_SESSION_LOOKUP_PAGE_SIZE,
      },
      signal,
    );
    const conversation = page.rows.find(
      item => (item.sessionId || item.id) === normalizedSessionId,
    );

    if (conversation) {
      return conversation;
    }

    const loadedCount = pageNum * AGENT_PROJECT_SESSION_LOOKUP_PAGE_SIZE;

    if (
      !page.rows.length ||
      page.rows.length < AGENT_PROJECT_SESSION_LOOKUP_PAGE_SIZE ||
      (page.total > 0 && loadedCount >= page.total)
    ) {
      return undefined;
    }

    return fetchPage(pageNum + 1);
  };

  return fetchPage(1);
};

export const fetchAgentProjects = (signal?: AbortSignal) =>
  request<AgentProjectListResponse>({
    method: 'GET',
    signal,
    url: '/ai/agent/projects/list',
  }).then(response => normalizeAgentProjects(response.data.data));

export const fetchAgentProjectDetail = async (
  projectId: number | string,
  signal?: AbortSignal,
): Promise<AgentProject> => {
  const response = await request<AgentProjectDetailResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}`,
  });
  const responseData = response.data;
  const project = responseData?.data
    ? normalizeAgentProjects([responseData.data])[0]
    : undefined;

  if (responseData?.code === 200 && project) {
    return project;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectDetailLoadFailed,
  );
};

export const fetchAgentProjectFiles = (
  projectId: number | string,
  signal?: AbortSignal,
) =>
  request<AgentProjectFilesResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/files`,
  })
    .then(response =>
      mergeProjectFilesWithFeishuFiles(projectId, response.data.data || []),
    )
    .catch(error => {
      const localFiles = mergeProjectFilesWithFeishuFiles(projectId, []);

      if (localFiles.length) {
        return localFiles;
      }

      throw error;
    });

export const fetchAgentProjectMembers = (
  projectId: number | string,
  signal?: AbortSignal,
) =>
  request<AgentProjectMemberListResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/members`,
  }).then(response => response.data.data || []);

export const removeAgentProjectMember = async (
  projectId: number | string,
  memberId: number | string,
) => {
  const response = await request<AgentProjectMemberRemoveResponse>({
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/members/${encodeURIComponent(memberId)}/remove`,
  });

  if (response.data?.code !== 200) {
    throw new Error(
      response.data?.msg || I18N.carbonAgent.projectMemberRemoveFailed,
    );
  }
};

export const updateAgentProjectMemberRole = async (
  projectId: number | string,
  memberId: number | string,
  payload: UpdateAgentProjectMemberRolePayload,
): Promise<AgentProjectMember> => {
  const response = await request<AgentProjectMemberRoleUpdateResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/members/${encodeURIComponent(memberId)}/role/save`,
  });
  const responseData = response.data;
  const member = responseData?.data;

  if (responseData?.code === 200 && member) {
    return member;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectMemberRoleUpdateFailed,
  );
};

export const createAgentProjectInviteLink = async (
  projectId: number | string,
  payload: CreateAgentProjectInviteLinkPayload = {},
): Promise<AgentProjectInviteLink> => {
  const response = await request<AgentProjectInviteLinkResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/inviteLinks/create`,
  });
  const responseData = response.data;
  const inviteLink = responseData?.data;

  if (responseData?.code === 200 && inviteLink?.inviteUrl) {
    return inviteLink;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectInviteLinkCreateFailed,
  );
};

export const acceptAgentProjectInvite = async (
  inviteCode: string,
  signal?: AbortSignal,
): Promise<AgentProject> => {
  const response = await request<AgentProjectInviteAcceptResponse>({
    method: 'POST',
    signal,
    url: `/ai/agent/projectInvites/${encodeURIComponent(inviteCode)}/accept`,
  });
  const responseData = response.data;
  const project = responseData?.data
    ? normalizeAgentProjects([responseData.data])[0]
    : undefined;

  if (responseData?.code === 200 && project) {
    return project;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectInviteAcceptFailed,
  );
};

export const fetchAgentProjectTasks = (
  projectId: number | string,
  params: AgentProjectTaskListParams = {},
  signal?: AbortSignal,
) =>
  request<AgentProjectTaskListResponse>({
    method: 'GET',
    params: {
      ...DEFAULT_AGENT_PROJECT_TASK_LIST_PARAMS,
      ...params,
    },
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/tasks`,
  }).then(
    response =>
      response.data.data || {
        allCount: 0,
        doneCount: 0,
        items: [],
        mineCount: 0,
        overdueCount: 0,
        pageNum:
          params.pageNum || DEFAULT_AGENT_PROJECT_TASK_LIST_PARAMS.pageNum,
        pageSize:
          params.pageSize || DEFAULT_AGENT_PROJECT_TASK_LIST_PARAMS.pageSize,
        total: 0,
      },
  );

export const createAgentProjectTask = async (
  projectId: number | string,
  payload: CreateAgentProjectTaskPayload,
): Promise<AgentProjectTask> => {
  const response = await request<AgentProjectTaskResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/tasks/create`,
  });
  const responseData = response.data;
  const task = responseData?.data;

  if (responseData?.code === 200 && task) {
    return task;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectTaskCreateFailed,
  );
};

export const fetchAgentProjectTaskDetail = async (
  projectId: number | string,
  taskId: number | string,
  signal?: AbortSignal,
): Promise<AgentProjectTaskDetail> => {
  const response = await request<AgentProjectTaskDetailResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/tasks/${encodeURIComponent(taskId)}`,
  });
  const responseData = response.data;
  const detail = responseData?.data;

  if (responseData?.code === 200 && detail?.task) {
    return {
      ...detail,
      logs: detail.logs || [],
      replies: detail.replies || [],
    };
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectTaskDetailLoadFailed,
  );
};

export const updateAgentProjectTask = async (
  projectId: number | string,
  taskId: number | string,
  payload: UpdateAgentProjectTaskPayload,
): Promise<AgentProjectTask> => {
  const response = await request<AgentProjectTaskResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/tasks/${encodeURIComponent(taskId)}/update`,
  });
  const responseData = response.data;
  const task = responseData?.data;

  if (responseData?.code === 200 && task) {
    return task;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectTaskSubmitFailed,
  );
};

export const replyAgentProjectTask = async (
  projectId: number | string,
  taskId: number | string,
  payload: ReplyAgentProjectTaskPayload,
): Promise<AgentProjectTaskReply> => {
  const response = await request<AgentProjectTaskReplyResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/tasks/${encodeURIComponent(taskId)}/reply`,
  });
  const responseData = response.data;
  const reply = responseData?.data;

  if (responseData?.code === 200 && reply) {
    return {
      ...reply,
      files: reply.files || [],
    };
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.projectTaskReplyFailed);
};

export const fetchAgentProjectCalculations = (
  projectId: number | string,
  signal?: AbortSignal,
) =>
  request<AgentProjectCalculationListResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/calculations`,
  }).then(response => response.data.data || []);

export const compareAgentProjectCalculations = async (
  projectId: number | string,
  payload: CompareAgentProjectCalculationsPayload,
  signal?: AbortSignal,
): Promise<AgentProjectCalculationComparison> => {
  const response = await request<AgentProjectCalculationComparisonResponse>({
    data: payload,
    method: 'POST',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/calculations/compare`,
  });
  const responseData = response.data;
  const comparison = responseData?.data;

  if (responseData?.code === 200 && comparison) {
    return comparison;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectComparisonLoadFailed,
  );
};

export const fetchAgentProjectFileDownloadUrl = async (
  projectId: number | string,
  assetId: number | string,
  signal?: AbortSignal,
): Promise<AgentProjectFile> => {
  const syncedMatch = mergeProjectFilesWithFeishuFiles(projectId, []).find(
    item =>
      String(item.assetId) === String(assetId) ||
      String(item.fileId) === String(assetId),
  );

  if (syncedMatch?.downloadUrl) {
    return syncedMatch;
  }

  const response = await request<AgentProjectFileResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/files/${encodeURIComponent(assetId)}/downloadUrl`,
  });
  const responseData = response.data;
  const projectFile = responseData?.data;

  if (responseData?.code === 200 && projectFile) {
    return projectFile;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.fileDownloadFailedRetry,
  );
};

export const uploadAgentProjectFile = async (
  projectId: number | string,
  file: File,
): Promise<AgentProjectFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request<AgentProjectFileResponse>({
    data: formData,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/files/upload`,
  });
  const responseData = response.data;
  const uploadedFile = responseData?.data;

  if (responseData?.code === 200 && uploadedFile?.fileId) {
    return uploadedFile;
  }

  throw new Error(
    responseData?.msg || I18N.carbonAgent.projectFileUploadFailed,
  );
};

export const fetchAgentProjectConfig = (lang: string, signal?: AbortSignal) =>
  request<AgentProjectConfigResponse>({
    method: 'GET',
    params: { lang },
    signal,
    url: '/ai/agent/projects/config',
  }).then(response => normalizeAgentProjectConfig(response.data.data));

export const fetchAgentProjectCalculationCandidates = (signal?: AbortSignal) =>
  request<AgentProjectCalculationCandidatesResponse>({
    method: 'GET',
    signal,
    url: '/ai/agent/projects/calculationCandidates',
  }).then(response => response.data.data || []);

export const createAgentProject = (payload: CreateAgentProjectPayload) =>
  request<CreateAgentProjectResponse>({
    data: payload,
    method: 'POST',
    url: '/ai/agent/projects/create',
  }).then(response =>
    response.data.data
      ? normalizeAgentProjects([response.data.data])[0]
      : undefined,
  );

export const updateAgentProject = async (
  projectId: number | string,
  payload: UpdateAgentProjectPayload,
): Promise<AgentProject | undefined> => {
  const response = await request<UpdateAgentProjectResponse>({
    data: payload,
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/update`,
  });
  const responseData = response.data;

  if (responseData?.code !== 200) {
    throw new Error(responseData?.msg || I18N.carbonAgent.updateProjectFailed);
  }

  return responseData.data
    ? normalizeAgentProjects([responseData.data])[0]
    : undefined;
};

export const markAgentSessionRead = (
  sessionId: string,
  lastReadTurnId: number | string,
) =>
  request({
    data: { lastReadTurnId },
    method: 'POST',
    url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/read`,
  });

export const fetchAgentSessionHistoryList = (
  params: AgentSessionHistoryListParams,
  signal?: AbortSignal,
) =>
  request<AgentSessionHistoryListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/ai/agent/sessions/history/list',
  }).then(response => normalizeAgentSessionHistoryList(response.data.data));

const normalizeAgentSessionHistory = ({
  events = [],
  session,
  turns = [],
}: {
  events?: AgentTraceEvent[];
  session: AgentSession;
  turns?: AgentHistoryTurn[];
}): AgentSessionHistory => {
  const timelineIndex = buildTraceTimelineIndex(turns);
  const receipts = turns
    .filter(turn => turn.role === 'user')
    .map(turn => asRecord(turn.payload?.accountingPurposeConfirmation))
    .filter(receipt => receipt.resumeEventId);
  const messages = turns.map(turn => {
    const message = normalizeHistoryTurn(turn);
    return {
      ...message,
      cards: receipts.reduce(
        (cards, receipt) => applyAccountingPurposeReceipt(cards, receipt),
        message.cards,
      ),
    };
  });
  const latestUserTurn = [...turns]
    .reverse()
    .find(turn => turn.role === 'user' && turn.messageId);
  const latestMessageId = String(
    latestUserTurn?.messageId ||
      [...turns].reverse().find(turn => turn.messageId)?.messageId ||
      [...events].reverse().find(event => event.messageId)?.messageId ||
      '',
  );
  const traceRequiresReplay =
    String(session.status || '')
      .trim()
      .toUpperCase() === 'EXECUTING';
  // 当前轮交给 SSE 重放；只恢复已有历史回复的 trace。
  // turns/events 可能不是同一时刻的快照，未知轮次不能经时间兜底串到旧回复。
  const historyMessageIds = new Set(
    messages
      .filter(
        message =>
          message.role === 'assistant' &&
          (!traceRequiresReplay || message.id !== latestMessageId),
      )
      .map(message => message.id),
  );
  const historyEvents = events.filter(
    event => event.messageId && historyMessageIds.has(event.messageId),
  );
  const toolCalls = normalizeTraceToolCalls(historyEvents, timelineIndex).map(
    finishHistoricalTool,
  );
  const errorCards = normalizeTraceErrorCards(historyEvents, timelineIndex);
  const businessCards = normalizeTraceBusinessCards(
    historyEvents,
    timelineIndex,
  );
  const messagesWithTrace = attachToolCallsToMessages(
    attachCardsToMessages(messages, [...businessCards, ...errorCards]),
    toolCalls,
  );
  const normalizedMessages = collapseSubmittedRequestCards(messagesWithTrace);
  const displayMessages =
    traceRequiresReplay && latestMessageId
      ? normalizedMessages.filter(
          message =>
            message.role !== 'assistant' || message.id !== latestMessageId,
        )
      : normalizedMessages;

  return {
    latestMessageId: latestMessageId || undefined,
    messages: displayMessages,
    session: normalizeAgentSession(session),
  };
};

export const fetchAgentSessionHistory = (
  sessionId: string,
  signal?: AbortSignal,
) => {
  const fetchHistory = (path: 'history' | 'trace') =>
    request<AgentSessionTraceResponse>({
      method: 'GET',
      signal,
      silentResponseError: path === 'trace',
      url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/${path}`,
    }).then(response => normalizeAgentSessionHistory(response.data.data));

  // A failed trace cannot be substituted with incomplete basic history. The view keeps the session and offers retry.
  return fetchHistory('trace');
};

export const createAgentSessionShare = (
  sessionId: string,
  payload: CreateAgentSharePayload,
) =>
  request<CreateAgentShareResponse>({
    method: 'POST',
    url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/share`,
    data: payload,
  }).then(response => response.data.data);

export const createAgentProjectSessionShare = (
  projectId: number | string,
  sessionId: string,
) =>
  request<CreateAgentShareResponse>({
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/sessions/${encodeURIComponent(sessionId)}/share`,
  }).then(response => response.data.data);

export const fetchAgentUserGuideStatus = (
  guideCode = AGENT_NEW_USER_GUIDE_CODE,
  signal?: AbortSignal,
) =>
  request<AgentUserGuideStatusResponse>({
    method: 'GET',
    signal,
    url: '/ai/agent/user-guide/status',
    params: {
      guideCode,
    },
  }).then(response => response.data.data);

export const markAgentUserGuideShown = (
  guideCode = AGENT_NEW_USER_GUIDE_CODE,
) =>
  request<AgentUserGuideMarkShownResponse>({
    method: 'POST',
    url: '/ai/agent/user-guide/mark-shown',
    data: {
      guideCode,
    },
  }).then(response => response.data.data);

export const fetchAgentShareHistory = (
  shareId: string,
  signal?: AbortSignal,
): Promise<AgentShareHistory> =>
  request<AgentShareHistoryResponse>({
    method: 'GET',
    signal,
    url: `/ai/agent/share/${encodeURIComponent(shareId)}`,
  })
    .then(response => response.data)
    .catch(error => {
      const responseData =
        getRejectedAgentSuccessData<AgentShareHistoryResponse['data']>(error);

      if (responseData) {
        return responseData;
      }

      return Promise.reject(error);
    })
    .then(responseData => {
      const responseCode = Number(responseData.code);

      if (responseCode === 441) {
        const expiredError = new Error(
          responseData.msg || I18N.carbonAgent.shareLoadFailed,
        ) as Error & { code: number };
        expiredError.code = responseCode;
        throw expiredError;
      }

      const { data } = responseData;
      const session = data?.history?.session;

      if (!session?.sessionId) {
        throw new Error(responseData.msg || I18N.carbonAgent.shareLoadFailed);
      }

      const sharedProjectId =
        data?.share?.workspaceProjectId ??
        session.workspaceProjectId ??
        session.projectId;
      const share =
        data?.share && sharedProjectId !== undefined && sharedProjectId !== null
          ? {
              ...data.share,
              workspaceProjectId: sharedProjectId,
            }
          : data?.share;

      return {
        ...normalizeAgentSessionHistory({
          session,
          turns: data?.history?.turns || [],
        }),
        businessRefs: data?.businessRefs,
        readonly: data?.readonly ?? data?.share?.readonly ?? true,
        share,
      };
    });

export const fetchAgentShareBusinessDetail = (
  params: {
    bizId: number | string;
    bizType: string;
    module: string;
    shareId: string;
  },
  signal?: AbortSignal,
): Promise<AgentShareBusinessDetail> =>
  request<AgentShareBusinessDetailResponse>({
    method: 'GET',
    params: {
      bizId: params.bizId,
      bizType: params.bizType,
      module: params.module,
    },
    signal,
    url: `/ai/agent/share/${encodeURIComponent(params.shareId)}/business`,
  }).then(response => {
    const data = asRecord(response.data.data);
    const detail = asRecord(data.detail);

    return {
      detail: Object.keys(detail).length ? detail : undefined,
      files: getEnterpriseCarbonReportFiles([data, detail]),
    };
  });

type AgentReportBatchDownloadResponse = {
  code: number;
  data?:
    | string
    | {
        downloadUrl?: string;
        path?: string;
        url?: string;
      };
  msg?: string;
};

export const batchDownloadAgentReport = (reportId: number) =>
  request<AgentReportBatchDownloadResponse>({
    method: 'POST',
    url: '/enterprise/calculate/report/batchDownload',
    data: {
      reportId,
    },
  }).then(response => {
    const responseData = response.data.data;

    if (typeof responseData === 'string') {
      return responseData;
    }

    return responseData?.url || responseData?.path || responseData?.downloadUrl;
  });

export const fetchAgentFeedbackCategories = (signal?: AbortSignal) =>
  request<AgentFeedbackCategoriesResponse>({
    method: 'GET',
    signal,
    url: '/ai/agent/feedback/categories',
  }).then(response =>
    Array.isArray(response.data.data) ? response.data.data : [],
  );

export const fetchAgentContextInsightDecision = (
  sessionId: string,
  messageId: string,
  signal?: AbortSignal,
) =>
  request<AgentContextInsightDecisionResponse>({
    method: 'GET',
    params: { messageId, sessionId },
    signal,
    url: '/ai/agent/context-insight/decision',
  }).then(response => response.data.data);

export const dismissAgentContextInsight = (
  bannerType: AgentContextInsightBannerType,
) =>
  request<AgentContextInsightDismissResponse>({
    data: { bannerType },
    method: 'POST',
    url: '/ai/agent/context-insight/dismiss',
  });

export const fetchAgentContextInsightSuppressed = (
  bannerType: AgentContextInsightBannerType,
) =>
  request<AgentContextInsightSuppressedResponse>({
    method: 'GET',
    params: { bannerType },
    url: '/ai/agent/context-insight/suppressed',
  }).then(response => response.data.data === true);

export const submitAgentMessageFeedback = (
  messageId: string,
  payload: AgentMessageFeedbackPayload,
) =>
  request<AgentMessageFeedbackResponse>({
    method: 'POST',
    url: `/ai/agent/messages/${encodeURIComponent(messageId)}/feedback`,
    data: {
      ...payload,
      source: payload.source || 'agent_web',
    },
  });

export const cancelAgentMessageFeedback = (
  sessionId: string,
  messageId: string,
) =>
  request<AgentMessageFeedbackResponse>({
    method: 'DELETE',
    url: `/ai/agent/sessions/${encodeURIComponent(
      sessionId,
    )}/messages/${encodeURIComponent(messageId)}/feedback`,
  });

const resolveAgentIssueFeedbackResponse = <T>(
  requestPromise: ReturnType<typeof request<AgentIssueFeedbackResponse<T>>>,
) =>
  requestPromise
    .then(response => response.data)
    .catch(error => {
      const responseData = getRejectedAgentSuccessData<T>(error);

      return responseData || Promise.reject(error);
    });

const normalizeAgentIssueFeedbackPage = (
  data?:
    | AgentIssueFeedback[]
    | {
        list?: AgentIssueFeedback[];
        records?: AgentIssueFeedback[];
        rows?: AgentIssueFeedback[];
        summary?: Partial<AgentIssueFeedbackSummary>;
        total?: number | string;
      },
): AgentIssueFeedbackPageResult => {
  if (Array.isArray(data)) {
    return {
      rows: data,
      summary: {
        adoptedCount: 0,
        notAdoptedCount: 0,
        pendingCount: 0,
        resolvedCount: 0,
        rewardGrantedCount: 0,
        totalCount: data.length,
      },
      total: data.length,
    };
  }

  const rows = data?.rows || data?.list || data?.records || [];
  const total = Number(data?.total);
  const normalizedTotal = Number.isFinite(total) ? total : rows.length;
  const getSummaryCount = (value?: number) => {
    const count = Number(value);

    return Number.isFinite(count) ? count : 0;
  };

  return {
    rows,
    summary: {
      adoptedCount: getSummaryCount(data?.summary?.adoptedCount),
      notAdoptedCount: getSummaryCount(data?.summary?.notAdoptedCount),
      pendingCount: getSummaryCount(data?.summary?.pendingCount),
      resolvedCount: getSummaryCount(data?.summary?.resolvedCount),
      rewardGrantedCount: getSummaryCount(data?.summary?.rewardGrantedCount),
      totalCount: data?.summary
        ? getSummaryCount(data.summary.totalCount)
        : normalizedTotal,
    },
    total: normalizedTotal,
  };
};

export const submitAgentIssueFeedback = (
  payload: AgentIssueFeedbackSubmitPayload,
) =>
  resolveAgentIssueFeedbackResponse(
    request<AgentIssueFeedbackResponse<AgentIssueFeedback | string>>({
      data: payload,
      method: 'POST',
      url: '/ai/agent/issue-feedback',
    }),
  ).then(response => response.data);

export const fetchAgentIssueFeedbackConfig = (signal?: AbortSignal) =>
  resolveAgentIssueFeedbackResponse(
    request<AgentIssueFeedbackResponse<AgentIssueFeedbackConfig>>({
      method: 'GET',
      signal,
      url: '/ai/agent/issue-feedback/config',
    }),
  ).then(response => {
    if (!response.data) {
      throw new Error(response.msg || 'Issue feedback config is unavailable');
    }

    return response.data;
  });

export const fetchAgentIssueFeedbackPage = (
  params: AgentIssueFeedbackPageParams,
  signal?: AbortSignal,
) =>
  resolveAgentIssueFeedbackResponse(
    request<
      AgentIssueFeedbackResponse<
        | AgentIssueFeedback[]
        | {
            list?: AgentIssueFeedback[];
            records?: AgentIssueFeedback[];
            rows?: AgentIssueFeedback[];
            summary?: Partial<AgentIssueFeedbackSummary>;
            total?: number | string;
          }
      >
    >({
      data: params,
      method: 'POST',
      signal,
      url: '/ai/agent/issue-feedback/my/page',
    }),
  ).then(response => normalizeAgentIssueFeedbackPage(response.data));

export const fetchAgentIssueFeedbackDetail = (
  feedbackNo: string,
  signal?: AbortSignal,
) =>
  resolveAgentIssueFeedbackResponse(
    request<AgentIssueFeedbackResponse<AgentIssueFeedbackDetail>>({
      method: 'GET',
      signal,
      url: `/ai/agent/issue-feedback/${encodeURIComponent(feedbackNo)}`,
    }),
  ).then(response => {
    const feedback = response.data?.feedback;

    if (!feedback) {
      throw new Error(
        response.msg || I18N.carbonAgent.feedbackDetailLoadFailed,
      );
    }

    return {
      feedback,
      files: response.data?.files || [],
      logs: response.data?.logs || [],
    };
  });

export const createAgentSession = (
  payload: Partial<CreateAgentSessionPayload> = {},
) =>
  request<CreateAgentSessionResponse>({
    method: 'POST',
    url: '/ai/agent/sessions/createSession',
    data: {
      ...DEFAULT_CREATE_SESSION_PAYLOAD,
      ...payload,
    },
  }).then(response => normalizeAgentSession(response.data.data));

export const createAgentProjectSession = (
  projectId: number | string,
  payload: CreateAgentProjectSessionPayload = {},
) =>
  request<CreateAgentSessionResponse>({
    data: normalizeProjectSessionCreatePayload(payload),
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(projectId)}/sessions/create`,
  }).then(response => {
    const conversation = normalizeAgentSession(response.data.data);

    return {
      ...conversation,
      projectId: String(projectId),
      projectSession: true,
    };
  });

export const createAgentProjectSessionBranch = (
  projectId: number | string,
  sessionId: string,
) =>
  request<CreateAgentSessionResponse>({
    method: 'POST',
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/sessions/${encodeURIComponent(sessionId)}/fork`,
  }).then(response => {
    const conversation = normalizeAgentSession(response.data.data);

    return {
      ...conversation,
      projectId: String(projectId),
      projectSession: true,
      sourceSessionId: conversation.sourceSessionId || sessionId,
    };
  });

export const fetchLatestAgentSessionByBusiness = (
  params: AgentBusinessBinding,
  signal?: AbortSignal,
) =>
  request<AgentBusinessSessionResponse>({
    method: 'GET',
    params,
    signal,
    url: '/ai/agent/sessions/latestByBusiness',
  }).then(response => {
    const session = response.data.data;

    return session?.sessionId ? normalizeAgentSession(session) : undefined;
  });

export const renameAgentSession = (sessionId: string, sessionTitle: string) =>
  request<RenameAgentSessionResponse>({
    method: 'POST',
    url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/rename`,
    data: {
      sessionTitle,
    },
  });

export const deleteAgentSession = (sessionId: string) =>
  request<DeleteAgentSessionResponse>({
    method: 'POST',
    url: `/ai/agent/sessions/${encodeURIComponent(sessionId)}/delete`,
  });

export const batchDeleteAgentSessions = (sessionIds: string[]) =>
  request<BatchDeleteAgentSessionResponse>({
    method: 'POST',
    url: '/ai/agent/sessions/batchDelete',
    data: {
      sessionIds,
    },
  });

export const cancelAgentSession = (sessionId: string) =>
  request<CancelAgentSessionResponse>({
    method: 'POST',
    url: `/ai/agent/sessions/${encodeURIComponent(
      sessionId,
    )}/cancel?wait=0&action=interrupt`,
  });

export const applyAgentExpertReview = (
  payload: AgentExpertReviewApplyPayload,
) =>
  request<AgentExpertReviewApplyResponse>({
    method: 'POST',
    url: '/ai/agent/expert-review/apply',
    data: payload,
  });

export const prepareAgentExpertReview = (
  payload: AgentExpertReviewPreparePayload,
  signal?: AbortSignal,
) =>
  request<AgentExpertReviewPrepareResponse>({
    method: 'POST',
    url: '/ai/agent/expert-review/prepare',
    data: {
      objectType: 'account',
      ...payload,
    },
    signal,
  })
    .then(response => response.data.data || null)
    .catch(error => {
      const responseData =
        getRejectedAgentSuccessData<AgentExpertReviewPrepareInfo | null>(error);

      if (responseData) {
        return responseData.data || null;
      }

      return Promise.reject(error);
    });

export const fetchAgentExpertReviewStatus = (
  params: AgentExpertReviewStatusParams,
  signal?: AbortSignal,
) =>
  request<AgentExpertReviewStatusResponse>({
    method: 'GET',
    params,
    signal,
    url: '/ai/agent/expert-review/status',
  }).then(response => response.data.data || null);

export const fetchAgentExpertReviewList = (
  params: AgentExpertReviewStatusParams,
  signal?: AbortSignal,
) =>
  request<AgentExpertReviewListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/ai/agent/expert-review/list',
  })
    .then(response =>
      Array.isArray(response.data.data) ? response.data.data : [],
    )
    .catch(error => {
      const responseData =
        getRejectedAgentSuccessData<AgentExpertReviewStatus[]>(error);

      if (responseData) {
        return Array.isArray(responseData.data) ? responseData.data : [];
      }

      return Promise.reject(error);
    });

export const fetchAgentUserPoints = () =>
  request<AgentUserPointsResponse>({
    method: 'GET',
    url: '/management/agent/points/me',
  });

export const fetchAgentCbamFiles = (
  params: { keyword?: string; page: number; size: number },
  signal?: AbortSignal,
): Promise<AgentCbamFilePage> =>
  request<AgentCbamFileListResponse>({
    method: 'GET',
    // 下载管理文件 ID 使用 Long，JSON 解析前保留精度。
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
    params: {
      ...params,
      module: 'cbam2',
    },
    signal,
    url: '/management/reportFile/list',
  }).then(response => {
    const rows = Array.isArray(response.data.data?.rows)
      ? response.data.data?.rows || []
      : [];
    const total = Number(response.data.data?.total);

    return {
      rows,
      total: Number.isFinite(total) ? total : rows.length,
    };
  });

export const fetchAgentPointPlans = (params?: AgentPointPlansParams) =>
  request<AgentPointPlansResponse>({
    method: 'GET',
    params,
    url: '/management/agent/points/plans',
  });

export const createAgentPointOrder = (payload: AgentPointOrderPayload) =>
  request<AgentPointOrderResponse>({
    method: 'POST',
    url: '/management/agent/points/orders',
    data: payload,
  });

export const fetchAgentInviteConfig = (signal?: AbortSignal) =>
  request<AgentInviteConfigResponse>({
    method: 'GET',
    signal,
    url: '/management/agent/invite/config',
  });

export const sendAgentInvite = (payload: AgentInviteSendPayload) =>
  request<AgentInviteSendResponse>({
    method: 'POST',
    url: '/management/agent/invite/send',
    data: payload,
  });

export const fetchAgentInviteOverview = (signal?: AbortSignal) =>
  request<AgentInviteOverviewResponse>({
    method: 'GET',
    signal,
    url: '/management/agent/invite/v2/overview',
  });

export const createOrCopyAgentInviteLink = () =>
  request<AgentInviteLinkResponse>({
    method: 'POST',
    url: '/management/agent/invite/v2/link',
  });

export const fetchAgentInviteRecordsPage = (
  payload: AgentInviteRecordsPagePayload,
  signal?: AbortSignal,
) =>
  request<AgentInviteRecordsPageResponse>({
    data: payload,
    method: 'POST',
    signal,
    url: '/management/agent/invite/v2/records/page',
  });

export const queryAgentPointOrder = (orderNo: string, signal?: AbortSignal) =>
  request<AgentPointOrderResponse>({
    method: 'GET',
    params: {
      orderNo,
    },
    signal,
    url: '/management/agent/points/orders/payQuery',
  });

export const fetchAgentPointOrdersPage = (
  payload: AgentPointOrderPageParams,
  signal?: AbortSignal,
) =>
  request<AgentPointOrderPageResponse>({
    method: 'POST',
    url: '/management/agent/points/orders/page',
    data: payload,
    signal,
  });

export const fetchAgentPointRecordsPage = (
  payload: AgentPointRecordPageParams,
  signal?: AbortSignal,
) =>
  request<AgentPointRecordPageResponse>({
    method: 'POST',
    url: '/management/agent/points/records/page',
    data: payload,
    signal,
  });

export const fetchAgentInvoiceOrdersList = (
  params: AgentInvoiceOrderListParams = {
    page: 1,
    size: 1000,
  },
  signal?: AbortSignal,
) =>
  request<AgentInvoiceOrderListResponse>({
    method: 'get',
    url: 'management/orders/list',
    params: {
      ...params,
      status: 1,
      invoiceFlag: 0,
    },
    signal,
  });

export const fetchAgentInvoiceDefault = (type: number, signal?: AbortSignal) =>
  request<AgentInvoiceDefaultResponse>({
    method: 'GET',
    params: { type },
    signal,
    url: '/management/invoice/default',
  });

export const searchAgentInvoiceCompanies = (
  keyword: string,
  signal?: AbortSignal,
) =>
  request<AgentInvoiceCompanySearchResponse>({
    method: 'GET',
    params: { keyword },
    signal,
    url: '/management/invoice/company/search',
  });

export const createAgentInvoice = (payload: AgentInvoicePayload) =>
  request<{
    code: number;
    data?: unknown;
    lang?: string | null;
    msg: string;
  }>({
    method: 'POST',
    url: 'management/invoice/add',
    data: payload,
  });

export const fetchAgentCompanyInfo = () =>
  request<AgentCompanyInfoResponse>({
    method: 'get',
    url: '/management/company/queryComInfo',
  });

export const editAgentCompanyInfo = (payload: AgentCompanyInfoPayload) =>
  request<AgentCompanyInfoEditResponse>({
    method: 'post',
    url: '/management/companyOrg/editComAgent',
    data: payload,
  });

export const fetchAgentAccountList = (
  params: AgentAccountListParams,
  signal?: AbortSignal,
) =>
  request<AgentAccountListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/footprint3/account/agentAccountList',
  });

export const fetchAgentEnterpriseComputationList = (
  params: AgentEnterpriseComputationListParams,
  signal?: AbortSignal,
) =>
  request<AgentEnterpriseComputationListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/enterprise/computation/list/year',
  });

export const fetchAgentCertificationList = (
  params: AgentCertificationListParams,
  signal?: AbortSignal,
) =>
  request<AgentCertificationListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/footprint3/account/agentCertificationList',
  }).then(response => getAgentCertificationRows(response.data.data));

type AgentAccountDetailExtraParams = {
  snapFlag?: number | string;
};

export const fetchAgentAccountInfo = (
  params: { id: number | string } & AgentAccountDetailExtraParams,
  signal?: AbortSignal,
) =>
  request<AgentAccountInfoResponse>({
    method: 'GET',
    params,
    signal,
    url: '/footprint3/account/info',
  });

export const fetchAgentAccountResult = (
  params: { id: number | string } & AgentAccountDetailExtraParams,
  signal?: AbortSignal,
) =>
  request<AgentAccountResultResponse>({
    method: 'GET',
    params,
    signal,
    url: '/footprint3/account/result',
  });

export const fetchAgentAccountDetailedList = (
  params: { accountId: number | string } & AgentAccountDetailExtraParams,
  signal?: AbortSignal,
) =>
  request<AgentAccountDetailedListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/footprint3/account/detailed/list',
  });

export const uploadAgentAttachment = async (
  file: File,
): Promise<AgentChatAttachment> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request<{
    code: number;
    data?: AgentWorkspaceFile;
    msg?: string;
  }>({
    data: formData,
    method: 'POST',
    url: '/ai/agent/files/upload',
  });

  const responseData = response.data;
  const uploadData = responseData?.data;
  const fileId = uploadData?.fileId;

  if (responseData?.code === 200 && fileId) {
    return {
      fileId,
      name: uploadData?.filename || uploadData?.name || file.name,
      sessionId: uploadData?.sessionId,
      size: uploadData?.size || file.size,
      type: uploadData?.mime || file.type,
      url: uploadData?.downloadUrl || uploadData?.url || undefined,
    };
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileUploadFailed);
};

export const uploadAnonymousAgentAttachment = async (
  browserId: string,
  file: File,
): Promise<AgentChatAttachment> => {
  const formData = new FormData();
  formData.append('browserId', browserId);
  formData.append('file', file);

  const response = await fetchAnonymousAgentApi<{
    code?: number;
    data?: AgentWorkspaceFile;
    msg?: string;
  }>('/ai/agent/anonymous/files/upload', {
    body: formData,
    method: 'POST',
  });
  const responseData = response;
  const uploadData = responseData?.data;
  const fileId = uploadData?.fileId;

  if (isAgentApiSuccess(responseData?.code) && fileId) {
    return {
      fileId,
      name: uploadData?.filename || uploadData?.name || file.name,
      sessionId: uploadData?.sessionId,
      size: uploadData?.size || file.size,
      type: uploadData?.mime || file.type,
      url: uploadData?.downloadUrl || uploadData?.url || undefined,
    };
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileUploadFailed);
};

export const fetchAgentWorkspaceFileDownloadUrl = async ({
  fileId,
  sessionId,
  shareId,
  signal,
}: {
  fileId: string;
  sessionId?: string;
  shareId?: string;
  signal?: AbortSignal;
}): Promise<AgentWorkspaceFile> => {
  const response = await request<{
    code: number;
    data?: AgentWorkspaceDownloadFile;
    msg?: string;
  }>(
    shareId
      ? {
          method: 'GET',
          params: { shareId },
          signal,
          url: `/ai/agent/artifacts/${encodeURIComponent(
            fileId,
          )}/downloadUrlOther`,
        }
      : {
          // Anonymous workspace files are authorized by the persisted browser ID.
          data: getToken()
            ? { sessionId }
            : { browserId: getAgentBrowserId(), sessionId },
          method: 'POST',
          signal,
          url: `/ai/agent/internal/workspace/files/${encodeURIComponent(
            fileId,
          )}/downloadUrl`,
        },
  );

  const responseData = response.data;
  const fileData = normalizeWorkspaceDownloadFile(responseData?.data);

  if (responseData?.code === 200 && fileData?.downloadUrl) {
    return fileData;
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileDownloadLinkFailed);
};

export const fetchAgentSharedFileDownloadUrl = async ({
  fileId,
  shareId,
}: {
  fileId: string;
  shareId: string;
}): Promise<AgentWorkspaceFile> => {
  const response = await request<{
    code: number;
    data?: AgentWorkspaceDownloadFile;
    msg?: string;
  }>({
    method: 'GET',
    params: { shareId },
    url: `/ai/agent/files/${encodeURIComponent(fileId)}/downloadUrlOther`,
  });

  const responseData = response.data;
  const fileData = normalizeWorkspaceDownloadFile(responseData?.data);

  if (responseData?.code === 200 && fileData?.downloadUrl) {
    return fileData;
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileDownloadLinkFailed);
};

export const fetchAgentWorkspaceFileDownloadUrlById = async (
  fileId: string,
  signal?: AbortSignal,
): Promise<AgentWorkspaceFile> => {
  const response = await request<{
    code: number;
    data?: AgentWorkspaceDownloadFile;
    msg?: string;
  }>({
    method: 'GET',
    signal,
    url: `/ai/agent/files/${encodeURIComponent(fileId)}/downloadUrl`,
  });

  const responseData = response.data;
  const fileData = normalizeWorkspaceDownloadFile(responseData?.data);

  if (responseData?.code === 200 && fileData?.downloadUrl) {
    return fileData;
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileDownloadLinkFailed);
};

export const fetchAgentArtifactDownloadUrl = async (
  artifactId: string,
): Promise<AgentArtifactDownloadFile> => {
  const response = await request<{
    code: number;
    data?: AgentArtifactDownloadFile;
    msg?: string;
  }>({
    method: 'GET',
    url: `/ai/agent/artifacts/${encodeURIComponent(artifactId)}/downloadUrl`,
  });

  const responseData = response.data;
  const artifactData = responseData?.data;

  if (
    (responseData?.code === 1 || responseData?.code === 200) &&
    artifactData?.downloadUrl
  ) {
    return artifactData;
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.fileDownloadLinkFailed);
};

export const recoverAgentMessage = async ({
  messageId,
  sessionId,
}: {
  messageId: string;
  sessionId: string;
}): Promise<AgentMessageRecoverResult> => {
  const getRecoverData = (
    responseData?: {
      data?: AgentMessageRecoverResult;
      recovered?: boolean;
      response?: AgentFinalResponse | null;
      running?: boolean;
      status?: string;
    } | null,
  ) => {
    if (!responseData) {
      return undefined;
    }

    return (
      responseData.data ||
      (typeof responseData.running === 'boolean' ||
      typeof responseData.recovered === 'boolean' ||
      responseData.status
        ? responseData
        : undefined)
    );
  };

  let responseData:
    | {
        code?: number;
        data?: AgentMessageRecoverResult;
        message?: string;
        msg?: string;
        recovered?: boolean;
        response?: AgentFinalResponse | null;
        running?: boolean;
        status?: string;
      }
    | undefined;

  try {
    const response = await request<typeof responseData>({
      method: 'GET',
      url: `/ai/agent/sessions/${encodeURIComponent(
        sessionId,
      )}/messages/${encodeURIComponent(messageId)}/recover`,
    });

    responseData = response.data;
  } catch (error) {
    responseData = asRecord(
      asRecord(error).data || asRecord(asRecord(error).response).data,
    ) as typeof responseData;
  }

  const rawRecoverData =
    getRecoverData(responseData) ||
    getRecoverData(asRecord(responseData?.data) as typeof responseData);
  const recoverData = asRecord(rawRecoverData) as AgentMessageRecoverResult;

  if (
    (responseData?.code === undefined || responseData.code === 200) &&
    Object.keys(recoverData).length
  ) {
    return recoverData;
  }

  throw new Error(responseData?.msg || I18N.carbonAgent.sendFailedRetryPeriod);
};

export const fetchAgentMessageStatus = async (
  sessionId: string,
  messageId: string,
  signal?: AbortSignal,
): Promise<AgentMessageRunStatus> => {
  const response = await request<{
    code?: number;
    data?: AgentMessageRunStatus;
    msg?: string;
  }>({
    method: 'GET',
    signal,
    url: `/ai/agent/sessions/${encodeURIComponent(
      sessionId,
    )}/messages/${encodeURIComponent(messageId)}/status`,
  });

  return response.data.data || {};
};

const AGENT_STREAM_RETRY_DELAYS = [1000, 2000, 5000, 10000];
const AGENT_STREAM_TERMINAL_STATUSES = new Set([
  'CANCELLED',
  'COMPLETED',
  'FAILED',
]);

export const findUnansweredAgentMessageId = (
  messages: AgentConversationMessage[],
) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === 'user') {
      const hasAssistantResponse = messages
        .slice(index + 1)
        .some(item => item.role === 'assistant' && item.id === message.id);

      if (!hasAssistantResponse) {
        return message.id;
      }
    }
  }

  return '';
};

export const isAgentTraceRunning = (status?: string | null) =>
  String(status || '')
    .trim()
    .toUpperCase() === 'EXECUTING';

export const findLatestAgentRunMessageId = (
  messages: AgentConversationMessage[],
) => {
  const latestUserMessage = [...messages]
    .reverse()
    .find(message => message.role === 'user');

  return latestUserMessage?.id || messages[messages.length - 1]?.id || '';
};

type ParsedAgentSseEvent = {
  comment?: string;
  data?: string;
  event: string;
  id?: string;
};

type AgentStreamContext = {
  callbacks: SendAgentMessageParams;
  completed: boolean;
  finalResponse?: AgentFinalResponse;
  loginRequired?: boolean;
  state?: AgentMessageResumeState;
  streamEventIndex: number;
};

class AgentStreamError extends Error {
  status?: number;

  terminal: boolean;

  constructor(
    message: string,
    options: { status?: number; terminal?: boolean } = {},
  ) {
    super(message);
    this.name = 'AgentStreamError';
    this.status = options.status;
    this.terminal = options.terminal === true;
  }
}

const getAgentRequestErrorStatus = (error: unknown) => {
  const response = asRecord(asRecord(error).response);
  const directStatus = asNumber(asRecord(error).status);
  const responseStatus = asNumber(response.status);

  return directStatus ?? responseStatus;
};

const getAgentApiUrl = (path: string) =>
  `${process.env.REACT_APP_API_URL || ''}${path}`;

type AnonymousAgentRequestOptions = {
  body?: BodyInit;
  headers?: HeadersInit;
  method: 'GET' | 'POST';
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

const getAnonymousAgentRequestUrl = (
  path: string,
  params?: AnonymousAgentRequestOptions['params'],
) => {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();

  return query ? `${getAgentApiUrl(path)}?${query}` : getAgentApiUrl(path);
};

const fetchAnonymousAgentApi = async <
  T extends { code?: number; msg?: string },
>(
  path: string,
  { body, headers, method, params, signal }: AnonymousAgentRequestOptions,
): Promise<T> => {
  // Anonymous endpoints return code=1, which the shared request interceptor rejects.
  const response = await fetch(getAnonymousAgentRequestUrl(path, params), {
    body,
    headers,
    method,
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok || !isAgentApiSuccess(payload.code)) {
    throw new Error(
      payload.msg || `Anonymous Agent request failed: ${response.status}`,
    );
  }

  return payload;
};

const waitForAgentStreamRetry = (delay: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The operation was aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, delay);
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('The operation was aborted', 'AbortError'));
    };

    signal.addEventListener('abort', handleAbort, { once: true });
  });

const parseAgentSseFrame = (frame: string): ParsedAgentSseEvent => {
  const parsed: ParsedAgentSseEvent = { event: 'message' };
  const dataLines: string[] = [];

  frame.split('\n').forEach(line => {
    if (line.startsWith(':')) {
      parsed.comment = line.slice(1).trim();
    } else if (line.startsWith('event:')) {
      parsed.event = line.slice(6).trim();
    } else if (line.startsWith('id:')) {
      parsed.id = line.slice(3).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  if (dataLines.length) {
    parsed.data = dataLines.join('\n');
  }

  return parsed;
};

const normalizeStreamFinalResponse = (
  payload: Record<string, any>,
): AgentFinalResponse => {
  const data = asRecord(payload.data);
  const nestedPayload = asRecord(payload.payload);
  const candidates = [
    asRecord(payload.finalResponse),
    asRecord(payload.response),
    asRecord(payload.result),
    asRecord(data.response),
    asRecord(data.result),
    asRecord(nestedPayload.response),
    asRecord(nestedPayload.result),
    nestedPayload,
    data,
    payload,
  ];
  const finalResult =
    candidates.find(candidate =>
      ['actions', 'blocks', 'cards', 'content', 'plan', 'reply'].some(
        key => candidate[key] !== undefined,
      ),
    ) || {};
  const content = asString(finalResult.content);
  const payloadContent = asString(payload.content);

  return {
    ...payload,
    ...finalResult,
    messageId:
      asString(finalResult.messageId) ||
      asString(payload.messageId) ||
      undefined,
    reply:
      asString(finalResult.reply) ||
      content ||
      asString(payload.reply) ||
      payloadContent ||
      undefined,
    sessionId:
      asString(finalResult.sessionId) ||
      asString(payload.sessionId) ||
      undefined,
  } as AgentFinalResponse;
};

const dispatchAgentStreamEvent = async (
  parsed: ParsedAgentSseEvent,
  context: AgentStreamContext,
) => {
  if (parsed.comment || !parsed.data || parsed.data === '[DONE]') {
    return;
  }

  const numericId = Number(parsed.id);
  const hasNumericId =
    parsed.id !== undefined &&
    parsed.id.trim() !== '' &&
    Number.isFinite(numericId);

  if (hasNumericId && context.state && numericId <= context.state.lastEventId) {
    return;
  }

  const payload = parseStreamPayload(parsed.data);
  const payloadData = asRecord(payload.data);
  const eventType = String(payload.eventType || parsed.event);
  const isMessageStart = eventType === 'message_start';
  const payloadMessageId = String(
    payload.messageId || payloadData.messageId || '',
  );
  const payloadSessionId = String(
    payload.sessionId || payloadData.sessionId || '',
  );

  if (
    context.state &&
    payloadMessageId &&
    payloadMessageId !== context.state.messageId
  ) {
    throw new AgentStreamError(
      `Agent stream message mismatch: expected ${context.state.messageId}, received ${payloadMessageId}`,
      { terminal: true },
    );
  }

  if (isMessageStart) {
    if (payloadMessageId && !context.state) {
      context.state = {
        lastEventId: 0,
        messageId: payloadMessageId,
        sessionId: payloadSessionId || context.callbacks.sessionId,
      };
      context.callbacks.onResumeState?.({ ...context.state });
    }
  }

  context.streamEventIndex += 1;
  const streamOrderNo = context.streamEventIndex * 10;

  const presentationEvent =
    eventType.startsWith('tool_call') ||
    [
      'card',
      'business_card',
      'action_request',
      'form_request',
      'error',
    ].includes(eventType);
  if (presentationEvent && !isVisibleToolEvent(payload)) {
    if (hasNumericId && context.state) context.state.lastEventId = numericId;
    return;
  }

  if (isMessageStart) {
    await context.callbacks.onMessageStart?.(
      normalizeStreamBlock(payload, '', streamOrderNo),
    );
  } else if (eventType === 'message_delta') {
    await context.callbacks.onDelta?.({
      ...normalizeStreamBlock(payload, '', streamOrderNo),
      delta: String(payload.delta || ''),
    });
  } else if (eventType === 'card') {
    await context.callbacks.onCard?.(
      normalizeStreamCard(payload, streamOrderNo),
    );
  } else if (eventType === 'business_card') {
    await context.callbacks.onCard?.(
      normalizeStreamBusinessCard(payload, streamOrderNo),
    );
  } else if (eventType === 'action_request') {
    await context.callbacks.onCard?.(
      normalizeStreamActionRequest(payload, streamOrderNo),
    );
    context.callbacks.onLoadingEnd?.();
  } else if (eventType === 'form_request') {
    await context.callbacks.onCard?.(
      normalizeStreamFormRequest(payload, streamOrderNo),
    );
    context.callbacks.onLoadingEnd?.();
  } else if (eventType === 'login_required') {
    context.loginRequired = true;
    context.callbacks.onLoginRequired?.({
      detailCode: asString(payload.detailCode),
      executionState: asString(payload.executionState),
      message: asString(payload.message),
      messageKey: asString(payload.messageKey),
      reasonCode: asString(payload.reasonCode),
      requiresLogin: payload.requiresLogin === true,
      retryable: payload.retryable === true,
    });
    context.callbacks.onLoadingEnd?.();
  } else if (eventType === 'error') {
    await context.callbacks.onCard?.(
      normalizeStreamErrorCard(payload, streamOrderNo),
    );
    context.callbacks.onLoadingEnd?.();
  } else if (eventType.startsWith('tool_call') && isVisibleToolEvent(payload)) {
    await context.callbacks.onToolCall?.(
      normalizeToolPresentation(
        normalizeStreamToolCall(payload, eventType, streamOrderNo),
      ),
    );
  } else if (eventType === 'final_response') {
    const finalResponse = {
      ...normalizeStreamFinalResponse(payload),
      streamOrderNo,
    };

    context.finalResponse = finalResponse;
    await context.callbacks.onFinalResponse?.(finalResponse);
  }

  // Advance the cursor only after the business event has rendered successfully.
  if (hasNumericId && context.state) {
    context.state.lastEventId = numericId;
  }

  if (eventType === 'completed') {
    context.completed = true;
    context.callbacks.onLoadingEnd?.();
  }
};

const consumeAgentSse = async (
  response: Response,
  context: AgentStreamContext,
) => {
  const contentType = response.headers.get('content-type');

  if (
    !response.ok ||
    !response.body ||
    !contentType?.startsWith(EventStreamContentType)
  ) {
    const errorText = await response.clone().text();
    throw new AgentStreamError(
      errorText || `Agent SSE request failed: ${response.status}`,
      { status: response.status },
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const dispatchBufferedFrames = async (flush = false) => {
    const frames = buffer.split('\n\n');

    buffer = flush ? '' : frames.pop() || '';

    await frames.reduce<Promise<void>>(
      (chain, frame) =>
        chain.then(() =>
          frame
            ? dispatchAgentStreamEvent(parseAgentSseFrame(frame), context)
            : undefined,
        ),
      Promise.resolve(),
    );
  };

  const readNextChunk = async (): Promise<void> => {
    if (context.completed) {
      return;
    }

    const { done, value } = await reader.read();

    buffer += decoder.decode(value, { stream: !done });
    buffer = buffer.replace(/\r\n/g, '\n');

    if (done) {
      if (buffer.trim()) {
        buffer = `${buffer}\n\n`;
      }

      await dispatchBufferedFrames(true);
      return;
    }

    await dispatchBufferedFrames();
    await readNextChunk();
  };

  try {
    await readNextChunk();
  } finally {
    if (context.completed) {
      await reader.cancel().catch(() => undefined);
    }
  }
};

const connectAgentResumeStream = async (
  context: AgentStreamContext,
  signal: AbortSignal,
) => {
  const connectAttempt = async (
    retryIndex: number,
  ): Promise<AgentFinalResponse | undefined> => {
    if (context.completed || context.loginRequired) {
      return context.finalResponse;
    }

    if (signal.aborted) {
      throw new DOMException('The operation was aborted', 'AbortError');
    }

    const { state } = context;

    if (!state) {
      throw new Error('Missing Agent message resume state');
    }

    let shouldRetryImmediately = false;
    const cursorBeforeConnect = state.lastEventId;

    try {
      const response = await fetch(
        getAgentApiUrl(
          `/ai/agent/sessions/${encodeURIComponent(
            state.sessionId,
          )}/messages/${encodeURIComponent(
            state.messageId,
          )}/stream?afterStreamEventId=${state.lastEventId}`,
        ),
        {
          headers: {
            Accept: EventStreamContentType,
            Authorization: getToken(),
          },
          signal,
        },
      );

      await consumeAgentSse(response, context);

      if (context.completed) {
        return context.finalResponse;
      }
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      const errorStatus = getAgentRequestErrorStatus(error);

      if (
        (error instanceof AgentStreamError && error.terminal) ||
        (error instanceof AgentStreamError &&
          error.status !== undefined &&
          [401, 403, 404].includes(error.status)) ||
        (errorStatus !== undefined && [401, 403, 404].includes(errorStatus))
      ) {
        throw error;
      }
    }

    try {
      const status = await fetchAgentMessageStatus(
        state.sessionId,
        state.messageId,
        signal,
      );
      const normalizedStatus = String(status.status || '').toUpperCase();
      const lastStreamEventId = Number(status.lastStreamEventId || 0);
      const hasTrailingEvents =
        Number.isFinite(lastStreamEventId) &&
        state.lastEventId < lastStreamEventId;
      const terminal =
        status.terminal === true ||
        AGENT_STREAM_TERMINAL_STATUSES.has(normalizedStatus);

      if (terminal && !hasTrailingEvents) {
        if (context.finalResponse && normalizedStatus === 'COMPLETED') {
          return context.finalResponse;
        }

        throw new AgentStreamError(
          status.errorMessage ||
            `Agent message entered terminal status: ${normalizedStatus}`,
          { terminal: true },
        );
      }

      shouldRetryImmediately =
        terminal &&
        hasTrailingEvents &&
        state.lastEventId > cursorBeforeConnect;
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      if (error instanceof AgentStreamError && error.terminal) {
        throw error;
      }

      const errorStatus = getAgentRequestErrorStatus(error);

      if (errorStatus !== undefined && [401, 403, 404].includes(errorStatus)) {
        throw error;
      }
    }

    if (!shouldRetryImmediately) {
      const delay =
        AGENT_STREAM_RETRY_DELAYS[
          Math.min(retryIndex, AGENT_STREAM_RETRY_DELAYS.length - 1)
        ];

      await waitForAgentStreamRetry(delay, signal);
    }

    return connectAttempt(shouldRetryImmediately ? retryIndex : retryIndex + 1);
  };

  return connectAttempt(0);
};

const discoverAnonymousAgentMessageResumeState = async (
  browserId: string,
  signal: AbortSignal,
): Promise<AgentMessageResumeState | undefined> => {
  const session = await fetchAnonymousAgentSession(browserId, signal);
  const messageId = String(session?.messageId || '').trim();
  const sessionId = String(session?.sessionId || '').trim();

  if (!messageId || !sessionId) {
    return undefined;
  }

  return {
    lastEventId: 0,
    messageId,
    sessionId,
  };
};

const connectAnonymousAgentResumeStream = async (
  browserId: string,
  context: AgentStreamContext,
  signal: AbortSignal,
) => {
  const connectAttempt = async (
    retryIndex: number,
  ): Promise<AgentFinalResponse | undefined> => {
    if (context.completed) {
      return context.finalResponse;
    }

    if (signal.aborted) {
      throw new DOMException('The operation was aborted', 'AbortError');
    }

    const { state } = context;

    if (!state?.sessionId || !state.messageId) {
      throw new Error('Missing anonymous Agent message resume state');
    }

    try {
      const response = await fetch(
        getAnonymousAgentRequestUrl('/ai/agent/anonymous/messages/chatting', {
          afterStreamEventId: state.lastEventId,
          browserId,
          messageId: state.messageId,
          sessionId: state.sessionId,
        }),
        {
          headers: { Accept: EventStreamContentType },
          signal,
        },
      );

      await consumeAgentSse(response, context);

      if (context.completed || context.loginRequired || context.finalResponse) {
        return context.finalResponse;
      }
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }

      const errorStatus = getAgentRequestErrorStatus(error);

      if (
        (error instanceof AgentStreamError && error.terminal) ||
        (errorStatus !== undefined &&
          [400, 401, 403, 404].includes(errorStatus))
      ) {
        throw error;
      }
    }

    const delay =
      AGENT_STREAM_RETRY_DELAYS[
        Math.min(retryIndex, AGENT_STREAM_RETRY_DELAYS.length - 1)
      ];

    await waitForAgentStreamRetry(delay, signal);

    return connectAttempt(retryIndex + 1);
  };

  return connectAttempt(0);
};

const discoverAgentMessageResumeState = async (
  sessionId: string,
  signal: AbortSignal,
) => {
  const discoverAttempt = async (
    attempt: number,
  ): Promise<AgentMessageResumeState | undefined> => {
    if (attempt >= AGENT_STREAM_RETRY_DELAYS.length) {
      return undefined;
    }

    if (signal.aborted) {
      throw new DOMException('The operation was aborted', 'AbortError');
    }

    try {
      const history = await fetchAgentSessionHistory(sessionId, signal);
      const traceMessageId = isAgentTraceRunning(history.session.status)
        ? history.latestMessageId ||
          findUnansweredAgentMessageId(history.messages) ||
          findLatestAgentRunMessageId(history.messages)
        : '';
      const messageId = traceMessageId;

      if (messageId) {
        const state: AgentMessageResumeState = {
          lastEventId: 0,
          messageId,
          sessionId,
        };

        return state;
      }
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
    }

    await waitForAgentStreamRetry(AGENT_STREAM_RETRY_DELAYS[attempt], signal);

    return discoverAttempt(attempt + 1);
  };

  return discoverAttempt(0);
};

export const resumeAgentChatMessage = async ({
  abortCtrl = new AbortController(),
  state,
  ...callbacks
}: ResumeAgentMessageParams): Promise<AgentFinalResponse | undefined> => {
  const context: AgentStreamContext = {
    callbacks: { ...callbacks, abortCtrl, sessionId: state.sessionId },
    completed: false,
    state: { ...state },
    streamEventIndex: 0,
  };

  callbacks.onResumeState?.({ ...context.state });

  return connectAgentResumeStream(context, abortCtrl.signal);
};

export const sendAgentChatMessage = async ({
  abortCtrl = new AbortController(),
  bizRef = DEFAULT_SEND_MESSAGE_PAYLOAD.bizRef,
  message = '',
  quickSkill = DEFAULT_SEND_MESSAGE_PAYLOAD.quickSkill,
  requestPayload,
  sessionId,
  ...callbacks
}: SendAgentMessageParams): Promise<AgentFinalResponse | undefined> => {
  const context: AgentStreamContext = {
    callbacks: { ...callbacks, abortCtrl, sessionId },
    completed: false,
    streamEventIndex: 0,
  };
  let initialStreamError: unknown;

  try {
    const response = await fetch(
      getAgentApiUrl(
        `/ai/agent/sessions/${encodeURIComponent(sessionId)}/messages/chatting`,
      ),
      {
        body: JSON.stringify(
          getSendAgentMessageRequestPayload(requestPayload, {
            bizRef,
            message,
            quickSkill,
          }),
        ),
        headers: {
          Accept: EventStreamContentType,
          Authorization: getToken(),
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: abortCtrl.signal,
      },
    );

    await consumeAgentSse(response, context);
  } catch (error) {
    if (abortCtrl.signal.aborted) {
      throw error;
    }

    if (
      error instanceof AgentStreamError &&
      error.status !== undefined &&
      [401, 403, 404].includes(error.status)
    ) {
      throw error;
    }

    initialStreamError = error;
  }

  if (context.completed) {
    return context.finalResponse;
  }

  if (!context.state) {
    context.state = await discoverAgentMessageResumeState(
      sessionId,
      abortCtrl.signal,
    );

    if (context.state) {
      callbacks.onResumeState?.({ ...context.state });
    }
  }

  if (!context.state) {
    if (initialStreamError instanceof Error) {
      throw initialStreamError;
    }

    throw new Error(
      typeof initialStreamError === 'string'
        ? initialStreamError
        : 'Agent stream closed before message_start',
    );
  }

  return connectAgentResumeStream(context, abortCtrl.signal);
};

export const sendAnonymousAgentChatMessage = async ({
  abortCtrl = new AbortController(),
  bizRef = DEFAULT_SEND_MESSAGE_PAYLOAD.bizRef,
  browserId,
  lang,
  message = '',
  quickSkill = DEFAULT_SEND_MESSAGE_PAYLOAD.quickSkill,
  requestPayload,
  ...callbacks
}: SendAnonymousAgentMessageParams): Promise<
  AgentFinalResponse | undefined
> => {
  const context: AgentStreamContext = {
    callbacks: { ...callbacks, abortCtrl, sessionId: '' },
    completed: false,
    streamEventIndex: 0,
  };
  // Keep anonymous business parameters identical to authenticated chatting.
  const requestData = {
    ...getSendAgentMessageRequestPayload(requestPayload, {
      bizRef,
      message,
      quickSkill,
    }),
    browserId,
    lang,
  };
  let initialStreamError: unknown;

  try {
    const response = await fetch(
      getAgentApiUrl('/ai/agent/anonymous/messages/chatting'),
      {
        body: JSON.stringify(requestData),
        headers: {
          Accept: EventStreamContentType,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: abortCtrl.signal,
      },
    );

    await consumeAgentSse(response, context);
  } catch (error) {
    if (abortCtrl.signal.aborted) {
      throw error;
    }

    initialStreamError = error;
  }

  if (context.completed || context.loginRequired || context.finalResponse) {
    return context.finalResponse;
  }

  if (!context.state?.sessionId || !context.state.messageId) {
    try {
      context.state = await discoverAnonymousAgentMessageResumeState(
        browserId,
        abortCtrl.signal,
      );
    } catch (error) {
      if (abortCtrl.signal.aborted) {
        throw error;
      }
    }

    if (context.state) {
      callbacks.onResumeState?.({ ...context.state });
    }
  }

  if (!context.state?.sessionId || !context.state.messageId) {
    if (initialStreamError instanceof Error) {
      throw initialStreamError;
    }

    throw new Error('Anonymous Agent stream closed before message_start');
  }

  const initialErrorStatus = getAgentRequestErrorStatus(initialStreamError);

  if (
    initialErrorStatus !== undefined &&
    [400, 401, 403, 404].includes(initialErrorStatus)
  ) {
    throw initialStreamError;
  }

  return connectAnonymousAgentResumeStream(
    browserId,
    context,
    abortCtrl.signal,
  );
};
