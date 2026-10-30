import { mergeToolEvent, isTerminalTool } from './toolEvents';
import { teamApi } from './team/api';
import {
  WorkspaceProvider,
  WorkspaceNotice,
  useWorkspace,
} from './team/workspace';
import { reasonText } from './team/errors';
/**
 * @file Carbon Agent 独立页，负责会话和各业务预览目标的顶层编排。
 */
import { ShareAltOutlined } from '@ant-design/icons';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { CARBON_AGENT_PROJECT_INVITE_QUERY_KEY } from '@src/router/route-paths';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { AUTH_LOGOUT_EVENT } from '@src/utils';
import { ClipboardCopyError, copyToClipboard } from '@src/utils/clipboard';
import { getToken } from '@src/utils/cookie';
import { ApplyForAccountStatus } from '@src/views/carbonFootprint3/CarbonLabel/constant';
import { useTitle } from 'ahooks';
import { Tooltip, message as antdMessage } from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { nanoid } from 'nanoid';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ClipboardEvent as ReactClipboardEvent,
  CSSProperties,
  DragEvent as ReactDragEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { useMobile } from '@/hooks/use-mobile';
import { postUserAllPermissions } from '@/layout/servers';
import store, { type RootState } from '@/store';
import { clearCcdbReferral, getAgentInviteCode } from '@/utils/ccdbReferral';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';
import { getFactorScopes } from '@/views/carbonFootprint3/FootprintAccount/component/ProductCarbonFootprintAI/service';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
} from '@/views/carbonFootprint3/FootprintAccount/constant';
import { QUICK_ACCOUNT_LIFE_CYCLE } from '@/views/carbonFootprint3/constant';
import {
  applyAccountingPurposeDraft,
  applyAccountingPurposeReceipt,
  isAccountingPurposeCard,
} from './accountingPurpose';
import {
  trackAgentAuthModalView,
  trackAgentLoginGateClick,
  trackAgentPageView,
  type AgentLoginTriggerEntry,
} from './acquisition';
import {
  normalizeFinalBlocks,
  normalizeFinalCards,
} from './agentFinalResponseState';
import { mergeAgentAnswerCards } from './answerCardState';
import EnterpriseDataPage from './enterpriseData';
import {
  clearEnterpriseNavigationParams,
  confirmationPayload,
  enterpriseSearch,
  getEnterpriseCard,
  isEnterpriseSection,
} from './enterpriseData/data';
import { EnterpriseDataProvider } from './enterpriseData/state';
import type { EnterpriseConfirmation } from './enterpriseData/types';
import AgentGuideModal, {
  AGENT_GUIDE_STEP_COUNT,
} from './components/AgentGuideModal';
import AgentLoginDialog from './components/AgentLoginDialog';
import CbamFileManagement from './components/CbamFileManagement';
import CcdbFactorDetailPane from './components/CcdbFactorDetailPane';
import FactorLibraryHome from './components/FactorLibraryHome';
import factorLibraryStyles from './components/FactorLibraryHome/index.module.less';
import Composer, {
  type ProductFootprintComposerOptions,
  type ProductFootprintScopeNode,
} from './components/Composer';
import ConversationPanel from './components/ConversationPanel';
import {
  isMonitorCard,
  monitorResult,
  monitorSavedPlanResult,
} from './monitor/results';
import { readMonitorSession } from './monitor/service';
import {
  resolveAddedMaterialOrigin,
  resolveMonitorMaterialOrigin,
} from './monitor/materialOrigin';
import { operationSavedResult } from './operation/savedResult';
import EnterpriseCarbonAccountingHome from './components/EnterpriseCarbonAccountingHome';
import FootprintAccountingHome from './components/FootprintAccountingHome';
import HistoryPage from './components/HistoryPage';
import IssueFeedbackSection from './components/IssueFeedbackSection';
import MobileAgentHeader from './components/MobileAgentHeader';
import MobilePreviewLayer from './components/MobilePreviewLayer';
import MobileSidebarDrawer from './components/MobileSidebarDrawer';
import NewChatHero from './components/NewChatHero';
import PreviewPane, {
  type CertificationApplyAuthType,
  type PreviewTabKey,
} from './components/PreviewPane';
import { PreviewDrawerOpenIcon } from './components/PreviewPaneIcons';
import {
  canDisplayCarbonLabel,
  getCarbonLabelTabKey,
  type CarbonLabelTargetFields,
} from './components/carbonLabelPreview';
import { resolveCarbonLabelEntry } from './components/ProductCarbonLabelApply/entry';
import type { CarbonLabelSubmission } from './components/ProductCarbonLabelApply/types';
import {
  bindCcdbFactorToSession,
  createCcdbFactorShare,
  CcdbFactorBindingError,
  getCcdbErrorMessage,
  sessionFactorTarget,
  withCcdbFactorContext,
  type CcdbFactorDetail,
  type CcdbFactorPreviewTarget,
} from './ccdbFactor';
import useCcdbSessionFactors from './useCcdbSessionFactors';
import ProjectCalculationComparison from './components/ProjectCalculationComparison';
import ProjectCreateDialog from './components/ProjectCreateDialog';
import ProjectFilesPage from './components/ProjectFilesPage';
import ProjectHome from './components/ProjectHome';
import ProjectOverviewEntry from './components/ProjectOverviewEntry';
import ProjectTaskCreateDialog, {
  type ProjectTaskCreateContext,
} from './components/ProjectTaskCreateDialog';
import ProjectTasksEntry from './components/ProjectTasksEntry';
import ReviewCertificationModals, {
  type ThirdPartyCertificationType,
} from './components/ReviewCertificationModals';
import Sidebar from './components/Sidebar';
import EnterpriseCarbonCertificationModal from './components/enterpriseCarbonCertification/EnterpriseCarbonCertificationModal';
import { ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE } from './components/enterpriseCarbonCertification/constants';
import { fetchEnterpriseCarbonCertificationList } from './components/enterpriseCarbonCertification/service';
import type {
  EnterpriseCarbonCertificationPageType,
  EnterpriseCarbonCertificationRecord,
  EnterpriseCarbonCertificationTarget,
} from './components/enterpriseCarbonCertification/types';
import {
  getEnterpriseCarbonCertificationPageType,
  sortEnterpriseCarbonCertificationDetailsForFocus,
} from './components/enterpriseCarbonCertification/utils';
import EnterpriseCarbonExpertReviewModal from './components/enterpriseCarbonExpertReview/EnterpriseCarbonExpertReviewModal';
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewDetail,
  EnterpriseCarbonExpertReviewSnapshot,
  EnterpriseCarbonExpertReviewTarget,
} from './components/enterpriseCarbonExpertReview/types';
import { useEnterpriseCarbonExpertReview } from './components/enterpriseCarbonExpertReview/useEnterpriseCarbonExpertReview';
import {
  createEnterpriseCarbonExpertReviewTarget,
  getEnterpriseCarbonExpertReviewOnlyTarget,
} from './components/enterpriseCarbonExpertReview/utils';
import type { EnterpriseCarbonAccountingPermissions } from './components/enterpriseCarbonPreview/types';
import {
  DEFAULT_EXPERT_REVIEW_FOCUS,
  canOpenExpertReviewDetail,
} from './components/expertReviewHelpers';
import {
  AgentConversation,
  AgentHomeSkill,
  AgentProject,
  AgentSectionKey,
  AccountBindStatus,
  AGENT_ATTACHMENT_ACCEPT_EXTENSIONS,
  AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
  DEFAULT_ACCOUNT_BIND_STATUS,
  ModeKey,
  ModeOption,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  getModeOptionsByAccountBindStatus,
  getProjectComparisonSectionKey,
  getProjectFilesSectionKey,
  getProjectSectionKey,
  getProjectOverviewSectionKey,
  getProjectTasksSectionKey,
  getQuickSkillByMode,
} from './constants';
import {
  ENTERPRISE_CARBON_MODULE,
  getEnterpriseCarbonAccountingYear,
  getEnterpriseCarbonBusinessId,
  getEnterpriseCarbonBusinessKind,
  getEnterpriseCarbonReportFiles,
  getEnterpriseCarbonReportYear,
  getLastEnterpriseCarbonReportTargetsByYear,
  getReadyEnterpriseCarbonReportFiles,
  mergeEnterpriseCarbonReportFiles,
  type EnterpriseCarbonReportFile,
} from './enterpriseBusinessCard';
import style from './index.module.less';
import {
  clearIssueFeedbackNavigationParams,
  getIssueFeedbackNavigationContext,
} from './issueFeedbackNavigation';
import { createAnonymousHistoryConversation } from './anonymousSessionState';
import {
  hasEnterpriseBusinessCapability,
  isEnterpriseCarbonAgentProject,
} from './permissions';
import useAnonymousAgentExperience from './hooks/useAnonymousAgentExperience';
import {
  AGENT_NEW_USER_GUIDE_CODE,
  AGENT_EXPERT_REVIEW_STATUS,
  acceptAgentProjectInvite,
  applyAgentExpertReview,
  cancelAgentSession,
  createAgentProjectSession,
  createAgentProjectSessionBranch,
  createAgentProjectSessionShare,
  createAgentSessionShare,
  createAgentSession,
  dismissAgentContextInsight,
  fetchAnonymousAgentHomeSkills,
  fetchAgentCertificationList,
  fetchAgentContextInsightDecision,
  fetchAgentHomeSkills,
  fetchAgentExpertReviewList,
  fetchAgentProjectDetail,
  fetchAgentProjectFileDownloadUrl,
  fetchAgentProjectSessionById,
  fetchAgentSharedFileDownloadUrl,
  fetchAgentShareBusinessDetail,
  fetchAgentShareHistory,
  fetchAgentWorkspaceFileDownloadUrl,
  fetchAgentSessionHistory,
  fetchAgentUserGuideStatus,
  findLatestAgentRunMessageId,
  findUnansweredAgentMessageId,
  getAgentShareHistoryErrorCode,
  getWorkspaceLiveSessionFromToolCall,
  getWorkspaceLiveSessionIdentity,
  isAgentTraceRunning,
  markAgentSessionRead,
  markAgentUserGuideShown,
  normalizeAgentAnswerControls,
  prepareAgentExpertReview,
  recoverAgentMessage,
  replaceLatestAgentMessageBlockContent,
  resumeAgentChatMessage,
  sendAgentChatMessage,
  uploadAgentAttachment,
} from './service';
import type {
  AgentActionRequestSubmitPayload,
  AgentAnswerControls,
  AgentChatAttachment,
  AgentMonitorMaterialOrigin,
  AgentComposerAttachment,
  AgentContextInsightDecision,
  AgentCertificationItem,
  AgentConversationMessage,
  AgentExpertReviewObjectType,
  AgentExpertReviewPrepareInfo,
  AgentExpertReviewStatus,
  AgentExpertReviewStatusParams,
  AgentFinalResponse,
  AgentFormRequestSubmitPayload,
  AgentShareInfo,
  AgentMessageBlock,
  AgentMessageCard,
  AgentMessageDelta,
  AgentMessageRecoverResult,
  AgentMessageReference,
  AgentMessageResumeState,
  AgentLoginRequiredPayload,
  AgentProjectCalculation,
  AgentProjectCalculationComparison,
  AgentProjectFile,
  AgentProjectSuggestion,
  AgentToolCall,
  AgentWorkspaceLiveSession,
  CreateAgentProjectSessionPayload,
} from './service';

const hasActiveToken = () => Boolean(getToken());

/** 匿名权限拦截优先使用前端多语言文案，服务端 message 仅作为兼容兜底。 */
const resolveAnonymousLoginRequiredMessage = (
  payload?: AgentLoginRequiredPayload | null,
) => {
  const detailMessages: Record<string, string> = {
    ANONYMOUS_ARTIFACT_REQUIRES_LOGIN:
      I18N.carbonAgent.anonymousArtifactLoginRequired,
    ANONYMOUS_PREVIEW_TOOL_REQUIRES_LOGIN:
      I18N.carbonAgent.anonymousPreviewLoginRequired,
    ANONYMOUS_PRIVATE_DATA_REQUIRES_LOGIN:
      I18N.carbonAgent.anonymousPrivateDataLoginRequired,
    ANONYMOUS_TOOL_REQUIRES_LOGIN: I18N.carbonAgent.anonymousToolLoginRequired,
    ANONYMOUS_WRITE_REQUIRES_LOGIN:
      I18N.carbonAgent.anonymousBusinessWriteLoginRequired,
  };
  const detailMessage = payload?.detailCode
    ? detailMessages[payload.detailCode]
    : '';
  if (detailMessage) {
    return detailMessage;
  }
  if (payload?.reasonCode === 'ANONYMOUS_TOOL_FORBIDDEN') {
    return I18N.carbonAgent.anonymousToolLoginRequired;
  }
  return payload?.message?.trim() || I18N.carbonAgent.availableAfterLogin;
};

const HOME_SKILL_SPECIAL_MODE_MAP: Partial<Record<string, ModeKey>> = {
  build_model: 'productFootprint',
  enterprise_modeling: 'enterpriseCarbon',
};

const getHomeSkillModeKey = (quickSkill: string): ModeKey =>
  HOME_SKILL_SPECIAL_MODE_MAP[quickSkill] || `skill:${quickSkill}`;

const waitForContextInsightRetry = (delay: number, signal: AbortSignal) =>
  new Promise<void>(resolve => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, delay);

    signal.addEventListener('abort', handleAbort, { once: true });
  });

const getHomeSkillModeOptions = (skills: AgentHomeSkill[]): ModeOption[] =>
  skills
    .map((skill, index) => ({ skill, index }))
    .filter(({ skill }) => skill.enabled)
    .sort(
      (left, right) =>
        left.skill.sortNo - right.skill.sortNo || left.index - right.index,
    )
    .map(({ skill }) => ({
      key: getHomeSkillModeKey(skill.quickSkill),
      label: skill.name,
      quickSkill: skill.quickSkill,
      scene: skill.scene,
    }));

const SESSION_ID_QUERY_KEY = 'sessionId';
const PROJECT_SESSION_PROJECT_ID_QUERY_KEY = 'projectId';
const SECTION_QUERY_KEY = 'section';
const ACCOUNTING_SECTION_QUERY_VALUE = 'footprintAccounting';
const ENTERPRISE_CARBON_SECTION_QUERY_VALUE = 'enterpriseCarbon';
const HISTORY_SECTION_QUERY_VALUE = 'history';
const ISSUE_FEEDBACK_SECTION_QUERY_VALUE = 'issueFeedback';
const CBAM_FILES_SECTION_QUERY_VALUE = 'cbamFiles';
const BUSINESS_PREVIEW_TYPE_QUERY_KEY = 'previewType';
const BUSINESS_PREVIEW_ACCOUNT_ID_QUERY_KEY = 'previewAccountId';
const BUSINESS_PREVIEW_PRODUCT_ID_QUERY_KEY = 'previewProductId';
const BUSINESS_PREVIEW_REPORT_ID_QUERY_KEY = 'previewReportId';
const BUSINESS_PREVIEW_REPORT_NAME_QUERY_KEY = 'previewReportName';
const BUSINESS_PREVIEW_REPORT_URL_QUERY_KEY = 'previewReportUrl';
const BUSINESS_PREVIEW_SHARE_AUTH_QUERY_KEY = 'shareAuth';
const BUSINESS_PREVIEW_CERTIFICATION_AUTH_TYPE_QUERY_KEY =
  'previewCertificationAuthType';
const BUSINESS_PREVIEW_EXPERT_REVIEW_ID_QUERY_KEY = 'previewExpertReviewId';
const BUSINESS_PREVIEW_EXPERT_REVIEW_NO_QUERY_KEY = 'previewExpertReviewNo';
const BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_QUERY_KEY =
  'previewExpertReviewStatus';
const BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_NAME_QUERY_KEY =
  'previewExpertReviewStatusName';
const BUSINESS_PREVIEW_CERTIFICATION_STATUS_QUERY_KEY =
  'previewCertificationStatus';
const BUSINESS_PREVIEW_CERTIFICATION_STATUS_NAME_QUERY_KEY =
  'previewCertificationStatusName';
const BUSINESS_PREVIEW_QUERY_KEYS = [
  BUSINESS_PREVIEW_TYPE_QUERY_KEY,
  BUSINESS_PREVIEW_ACCOUNT_ID_QUERY_KEY,
  BUSINESS_PREVIEW_PRODUCT_ID_QUERY_KEY,
  BUSINESS_PREVIEW_REPORT_ID_QUERY_KEY,
  BUSINESS_PREVIEW_REPORT_NAME_QUERY_KEY,
  BUSINESS_PREVIEW_REPORT_URL_QUERY_KEY,
  BUSINESS_PREVIEW_SHARE_AUTH_QUERY_KEY,
  BUSINESS_PREVIEW_CERTIFICATION_AUTH_TYPE_QUERY_KEY,
  BUSINESS_PREVIEW_EXPERT_REVIEW_ID_QUERY_KEY,
  BUSINESS_PREVIEW_EXPERT_REVIEW_NO_QUERY_KEY,
  BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_QUERY_KEY,
  BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_NAME_QUERY_KEY,
  BUSINESS_PREVIEW_CERTIFICATION_STATUS_QUERY_KEY,
  BUSINESS_PREVIEW_CERTIFICATION_STATUS_NAME_QUERY_KEY,
];
const THIRD_PARTY_CERTIFICATION_AUTH_TYPE_MAP: Record<
  ThirdPartyCertificationType,
  CertificationApplyAuthType
> = {
  footprint: '0',
  label: '3',
};
const PREVIEW_PANE_ENABLED = false;
const PREVIEW_PANE_DEFAULT_WIDTH = 1046;
const PREVIEW_PANE_MIN_WIDTH = 420;
const PREVIEW_PANE_MAX_WIDTH = 1280;
const PREVIEW_FULLSCREEN_ANIMATION_MS = 220;
const CONVERSATION_MIN_WIDTH = 360;
const MAX_COMPOSER_ATTACHMENTS = 10;
const MAX_COMPOSER_ATTACHMENT_SIZE = 20 * 1024 * 1024;
const MAX_COMPOSER_QUOTE_LENGTH = 2000;
const AGENT_SHARE_EXPIRE_DAYS = 7;
const AGENT_MESSAGE_RECOVER_POLL_INTERVAL_MS = 2500;
const AGENT_MESSAGE_RECOVER_TIMEOUT_MS = 300000;
const AGENT_MESSAGE_RECOVER_FAILED_STATUS = new Set([
  'CANCELLED',
  'FAILED',
  'NOT_FOUND',
]);
type AgentMessageRecoverOutcome =
  | 'cancelled'
  | 'failed'
  | 'recovered'
  | 'stale';
const ACCEPTED_ATTACHMENT_EXTENSIONS = new Set(
  AGENT_ATTACHMENT_ACCEPT_EXTENSIONS,
);
const DATA_TRANSFER_FILE_TYPE = 'Files';
const CLIPBOARD_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'text/plain': 'txt',
};
const ATTACHMENT_DISPLAY_EXTENSION_ORDER = [
  'pdf',
  'txt',
  'csv',
  'md',
  'docx',
  'doc',
  'xlsx',
  'xls',
  'jpg',
  'jpeg',
  'png',
];
const ACCEPTED_ATTACHMENT_EXTENSION_TEXT = [
  ...ATTACHMENT_DISPLAY_EXTENSION_ORDER.filter(extension =>
    ACCEPTED_ATTACHMENT_EXTENSIONS.has(extension),
  ),
  ...AGENT_ATTACHMENT_ACCEPT_EXTENSIONS.filter(
    extension => !ATTACHMENT_DISPLAY_EXTENSION_ORDER.includes(extension),
  ),
].join(', ');

type CarbonAgentHistory = ReturnType<typeof useHistory>;
type CarbonAgentLocation = ReturnType<typeof useLocation>;
type ConversationSubmission = string | Record<string, unknown>;
type AgentFilePayload = { fileId: string };
type ConversationWorkspaceStyle = CSSProperties & {
  '--preview-pane-width': string;
};
type BusinessCardPreviewTarget = CarbonLabelTargetFields & {
  accountId?: string;
  accountName?: string;
  cbamId?: string;
  operationId?: string;
  planId?: string;
  planName?: string;
  monitorCreated?: boolean;
  monitorDataVersion?: number;
  operationDataVersion?: number;
  certificationAuthType?: CertificationApplyAuthType;
  certificationDetails?: AgentCertificationItem[];
  certificationDraftAuthType?: CertificationApplyAuthType;
  certificationStatus?: string | null;
  certificationStatusName?: string | null;
  expertReviewId?: number | string | null;
  expertReviewNo?: string | null;
  expertReviewStatus?: string | null;
  expertReviewStatusName?: string | null;
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationRecord[];
  enterpriseCarbonCertificationDraft?: boolean;
  enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationPageType;
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetail;
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewDetail[];
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewSnapshot;
  productName?: string;
  reviewDetail?: AgentExpertReviewStatus;
  reviewDetails?: AgentExpertReviewStatus[];
  productId?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  reportReadonly?: boolean;
  reportKind?: 'cbamMonitor' | 'cbamOperation';
  reportLabel?: string;
  refreshKey?: string;
  shareAuth?: string;
  snapFlag?: number | string;
  title?: string;
  type?:
    | 'account'
    | 'carbonLabel'
    | 'productCarbonCertificate'
    | 'cbamMonitor'
    | 'cbamOperationReport'
    | 'cbamReport'
    | 'certification'
    | 'enterpriseCarbonAccounting'
    | 'enterpriseCarbonCertification'
    | 'enterpriseCarbonExpertReview'
    | 'enterpriseCarbonReport'
    | 'expertReview'
    | 'report'
    | 'workspace';
  workspaceLiveSession?: AgentWorkspaceLiveSession;
  year?: string;
  orgId?: string;
  certificationId?: number | string;
  applyNo?: string;
};
type BusinessCardPreviewTabTargets = Partial<
  Record<
    NonNullable<BusinessCardPreviewTarget['type']>,
    BusinessCardPreviewTarget
  >
>;
type PreviewActiveTabRequest = {
  accountId?: string;
  enterpriseCarbonBizId?: string;
  key: PreviewTabKey;
  planId?: string;
  reportId?: string;
  reportUrl?: string;
  token: number;
  year?: string;
};
type BusinessPreviewState = {
  tabTargets: BusinessCardPreviewTabTargets;
  target?: BusinessCardPreviewTarget;
  targets: BusinessCardPreviewTarget[];
};

const PRODUCT_FOOTPRINT_DEFAULT_SCOPE = FootprintAccountLifeCycle.FULL;
const PRODUCT_FOOTPRINT_CUSTOM_SCOPE = FootprintAccountLifeCycle.CUSTOM;

const getDefaultProductFootprintScope = (): ProductFootprintScopeNode[][] => [
  [
    {
      label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[PRODUCT_FOOTPRINT_DEFAULT_SCOPE],
      value: PRODUCT_FOOTPRINT_DEFAULT_SCOPE,
    },
  ],
];

const getProductFootprintRequestParams = (
  scope: ProductFootprintScopeNode[][],
  factorScope: string,
): Record<string, number | string | undefined> => {
  const selectedScope =
    scope?.[0]?.[0]?.value ?? PRODUCT_FOOTPRINT_DEFAULT_SCOPE;
  let scopeValue: string | undefined;

  if (selectedScope === PRODUCT_FOOTPRINT_CUSTOM_SCOPE) {
    const customScopeValues = scope
      .map(item => item[1]?.value)
      .filter((value): value is number => typeof value === 'number');

    scopeValue = customScopeValues.length
      ? customScopeValues.join(',')
      : Object.values(QUICK_ACCOUNT_LIFE_CYCLE).join(',');
  }

  return {
    scope: Number(selectedScope),
    ...(selectedScope === PRODUCT_FOOTPRINT_CUSTOM_SCOPE ? { scopeValue } : {}),
    ...(factorScope ? { factorScope: Number(factorScope) } : {}),
  };
};

const syncCarbonAgentUserPermissions = async () => {
  const result = (await postUserAllPermissions()) as {
    data?: {
      data?: {
        userInfo?: RootState['companyUserInfo']['userInfo'];
      };
    };
  };
  const permissionData = result.data?.data;
  const { userInfo } = permissionData || {};

  if (!userInfo) {
    return;
  }

  const { companyUserInfo } = store.getState();

  store.dispatch({
    type: SET_COMPANY_USER_INFO,
    payload: {
      ...companyUserInfo,
      userInfo: {
        ...(companyUserInfo.userInfo || {}),
        ...userInfo,
      },
    },
  });
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const isUnauthorizedAgentStreamError = (error: unknown) =>
  [401, 403].includes(Number(asRecord(error).status));

const isAccountBindStatus = (value: unknown): value is AccountBindStatus =>
  value === 'HAS_ACCOUNT' || value === 'NO_ACCOUNT';

const getAccountBindStatusFromValue = (
  value: unknown,
  visited = new WeakSet<object>(),
): AccountBindStatus | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  if (visited.has(value)) {
    return undefined;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value
      .map(item => getAccountBindStatusFromValue(item, visited))
      .find(isAccountBindStatus);
  }

  const record = value as Record<string, unknown>;
  const directStatus = record.accountBindStatus || record.account_bind_status;

  if (isAccountBindStatus(directStatus)) {
    return directStatus;
  }

  return Object.values(record)
    .map(nestedValue => getAccountBindStatusFromValue(nestedValue, visited))
    .find(isAccountBindStatus);
};

const getScalarValue = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

const getEnterpriseCarbonExpertReviewContextFromTarget = (
  target: BusinessCardPreviewTarget | undefined,
  activeSessionId?: string,
): EnterpriseCarbonExpertReviewContext | undefined => {
  if (!target) {
    return undefined;
  }

  if (
    target.type !== 'enterpriseCarbonAccounting' &&
    target.type !== 'enterpriseCarbonCertification' &&
    target.type !== 'enterpriseCarbonExpertReview' &&
    target.type !== 'enterpriseCarbonReport'
  ) {
    return undefined;
  }

  const reviewDetail =
    target.enterpriseCarbonExpertReviewDetail ||
    target.enterpriseCarbonExpertReviewDetails?.[0];
  const year =
    getScalarValue(target.year) || getScalarValue(reviewDetail?.year);

  if (!year) {
    return undefined;
  }

  let { enterpriseCarbonBizType } = target;

  if (
    !enterpriseCarbonBizType &&
    (target.type === 'enterpriseCarbonReport' ||
      reviewDetail?.objectType === 'report')
  ) {
    enterpriseCarbonBizType = 'report';
  }

  if (!enterpriseCarbonBizType) {
    enterpriseCarbonBizType = 'account';
  }

  const context: EnterpriseCarbonExpertReviewContext = {
    agentSessionId: activeSessionId || undefined,
    enterpriseCarbonBizId:
      getScalarValue(target.enterpriseCarbonBizId) || undefined,
    enterpriseCarbonBizType,
    orgId: getScalarValue(target.orgId) || undefined,
    snapshot:
      target.enterpriseCarbonSnapshot || reviewDetail?.snapshot || undefined,
    year,
  };
  const reportId =
    getScalarValue(target.reportId) || getScalarValue(reviewDetail?.reportId);

  if (enterpriseCarbonBizType === 'report' && reportId) {
    context.reportId = reportId;
  }

  return context;
};

const getBusinessCardValue = (
  records: Record<string, unknown>[],
  keys: string[],
) =>
  records
    .flatMap(record => keys.map(key => getScalarValue(record[key])))
    .find(Boolean);

const getCbamMonitorPlanId = (records: Record<string, unknown>[]) => {
  const module = getBusinessCardValue(records, [
    'module',
    'bizModule',
    'biz_module',
  ]);
  const cardType = getBusinessCardValue(records, ['cardType', 'card_type']);
  const bizType = getBusinessCardValue(records, ['bizType', 'biz_type']);

  if (
    !/^cbam2?$/i.test(module || '') ||
    !/cbam2?[_-]?monitor[_-]?plan|monitor[_-]?plan/i.test(
      [cardType, bizType].filter(Boolean).join('|'),
    )
  ) {
    return undefined;
  }

  return getBusinessCardValue(records, [
    'planId',
    'plan_id',
    'bizId',
    'biz_id',
    'id',
  ]);
};

const getCbamOperationReportId = (records: Record<string, unknown>[]) => {
  const module = getBusinessCardValue(records, [
    'module',
    'bizModule',
    'biz_module',
  ]);
  const kinds = ['cardType', 'card_type', 'bizType', 'biz_type']
    .map(key => getBusinessCardValue(records, [key]))
    .filter(Boolean)
    .join('|');
  if (
    !/^cbam2?$/i.test(module || '') ||
    !/operation[_-]?report|operator[_-]?report/i.test(kinds)
  ) {
    return undefined;
  }
  return getBusinessCardValue(records, [
    'operationId',
    'operation_id',
    'bizId',
    'biz_id',
    'id',
  ]);
};

const getCbamReportId = (records: Record<string, unknown>[]) => {
  const module = getBusinessCardValue(records, [
    'module',
    'bizModule',
    'biz_module',
  ]);
  const cardType = getBusinessCardValue(records, ['cardType', 'card_type']);

  if (
    /monitor[_-]?plan|operation[_-]?report|operator[_-]?report/i.test(
      cardType || '',
    )
  ) {
    return undefined;
  }

  if (
    !/^cbam2?$/i.test(module || '') &&
    !/cbam2?[_-]?report|report[_-]?cbam2?/i.test(cardType || '')
  ) {
    return undefined;
  }

  return getBusinessCardValue(records, [
    'cbamId',
    'cbamid',
    'reportId',
    'report_id',
    'bizId',
    'biz_id',
    'id',
  ]);
};

const getWorkspaceLiveSessionPreviewTarget = (
  toolCall: AgentToolCall,
): BusinessCardPreviewTarget | undefined => {
  const workspaceLiveSession = getWorkspaceLiveSessionFromToolCall(toolCall);

  if (!workspaceLiveSession) {
    return undefined;
  }

  return {
    title:
      workspaceLiveSession.provider || I18N.carbonAgent.workspaceLiveSession,
    type: 'workspace',
    workspaceLiveSession,
  };
};

const collectToolCallRecords = (
  value: unknown,
  records: Record<string, unknown>[],
  visited: WeakSet<object>,
  depth = 0,
) => {
  if (depth > 6 || records.length >= 80 || value == null) {
    return;
  }

  if (typeof value === 'string') {
    const content = value.trim();

    if (!content || (!content.startsWith('{') && !content.startsWith('['))) {
      return;
    }

    try {
      collectToolCallRecords(JSON.parse(content), records, visited, depth + 1);
    } catch {
      // Tool 文案可能不是 JSON，无法解析时忽略即可。
    }
    return;
  }

  if (typeof value !== 'object' || visited.has(value)) {
    return;
  }

  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach(item =>
      collectToolCallRecords(item, records, visited, depth + 1),
    );
    return;
  }

  const record = value as Record<string, unknown>;

  records.push(record);
  Object.values(record).forEach(item =>
    collectToolCallRecords(item, records, visited, depth + 1),
  );
};

const getCbamMonitorToolCallPreviewTarget = (
  toolCall: AgentToolCall,
): BusinessCardPreviewTarget | undefined => {
  // 只有服务端或可信宿主明确返回 saved=true 的结果才刷新预览。
  const savedResult = monitorSavedPlanResult(toolCall);
  if (savedResult?.planId) {
    return {
      type: 'cbamMonitor',
      planId: savedResult.planId,
      planName: savedResult.planName,
      title: I18N.cbamMonitor.monitorManagement,
      year: savedResult.year == null ? undefined : String(savedResult.year),
      refreshKey: `${savedResult.planId}:${
        savedResult.dataVersion ?? toolCall.toolCallId ?? toolCall.eventId
      }`,
      monitorCreated:
        savedResult.created === true ||
        /(?:^|[_/])plan[_/]create$/i.test(
          savedResult.hostOperation || toolCall.toolName || '',
        ),
      monitorDataVersion: savedResult.dataVersion,
    };
  }
  // 新版监测工具没有明确保存回执时不能退回旧版的参数猜测逻辑。
  if (
    /cbam_monitor_|monitor\/plan\/(patch|create|submit)/i.test(
      toolCall.toolName || '',
    ) ||
    /^(prepareCbamMonitorCandidates|prepareCbamMonitorTask)$/i.test(
      toolCall.toolName || '',
    )
  ) {
    return undefined;
  }
  const records: Record<string, unknown>[] = [];

  collectToolCallRecords(toolCall.payload, records, new WeakSet<object>());

  const contractedPlanId = getCbamMonitorPlanId(records);
  const toolNames = [
    toolCall.toolName,
    ...records.flatMap(record =>
      ['tool', 'toolName', 'tool_name', 'operation', 'path'].map(key =>
        getScalarValue(record[key]),
      ),
    ),
  ]
    .filter((name): name is string => Boolean(name))
    .map(name => name.toLowerCase().replace(/[^a-z0-9]+/g, '/'));
  const isMonitorWrite = toolNames.some(
    name =>
      name.includes('monitor/plan/draft/') ||
      name.endsWith('monitor/plan/save') ||
      name.includes('monitor/evidence/create') ||
      name.includes('monitor/evidence/relation/create'),
  );

  if (!contractedPlanId && !isMonitorWrite) {
    return undefined;
  }

  const requestPlanId = getBusinessCardValue(records, ['planId', 'plan_id']);
  const savedPlanId = records
    .filter(
      record =>
        getScalarValue(record.dataVersion) &&
        (getScalarValue(record.saveType) || getScalarValue(record.status)),
    )
    .map(record => getScalarValue(record.id))
    .find(Boolean);
  const planId = contractedPlanId || requestPlanId || savedPlanId;

  if (!planId) {
    return undefined;
  }

  return {
    planId,
    planName: getBusinessCardValue(records, ['planName', 'plan_name', 'name']),
    refreshKey: [
      'cbam-monitor-tool',
      toolCall.messageId,
      toolCall.toolCallId,
      toolCall.eventId,
      toolCall.sequenceNo,
      toolCall.status,
    ]
      .filter(value => value !== undefined && value !== null && value !== '')
      .join(':'),
    title: I18N.cbamMonitor.monitorManagement,
    type: 'cbamMonitor',
    year: getBusinessCardValue(records, ['year']),
  };
};

const getCbamOperationReportToolCallPreviewTarget = (
  toolCall: AgentToolCall,
): BusinessCardPreviewTarget | undefined => {
  const toolName = (toolCall.toolName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '/');
  const receipt = operationSavedResult(toolCall);
  if (receipt) {
    return {
      operationId: String(receipt.operationId),
      operationDataVersion: receipt.dataVersion as number,
      refreshKey: `cbam-operation-event:${receipt.eventId}`,
      title: I18N.cbamOperationReport.operationReport,
      type: 'cbamOperationReport',
    };
  }
  if (
    /cbam_operation_|prepareCbamOperationTask|applyCbamOperationCandidates/.test(
      toolCall.toolName || '',
    )
  )
    return undefined;
  if (
    !/operation\/report|operation_report/.test(toolName) ||
    !/report\/(?:add|info|edit)(?:\/|$)|evidence\/(?:add|edit|select|delete)(?:\/|$)/.test(
      toolName,
    ) ||
    /\/report\/delete(?:\/|$)/.test(toolName) ||
    !['COMPLETED', 'SUCCESS'].includes(toolCall.status || '')
  )
    return undefined;
  const records: Record<string, unknown>[] = [];
  collectToolCallRecords(toolCall.payload, records, new WeakSet<object>());
  const saved = records.find(
    record =>
      getBusinessCardValue([record], ['operationId', 'operation_id']) &&
      getBusinessCardValue([record], ['dataVersion', 'data_version']),
  );
  const operationId =
    saved && getBusinessCardValue([saved], ['operationId', 'operation_id']);
  if (!operationId || records.some(record => record.success === false))
    return undefined;
  return {
    operationId,
    reportName: getBusinessCardValue(records, ['reportName', 'report_name']),
    refreshKey: [
      'cbam-operation-report',
      operationId,
      getBusinessCardValue(saved ? [saved] : [], [
        'dataVersion',
        'data_version',
      ]),
    ].join(':'),
    title: I18N.cbamOperationReport.operationReport,
    type: 'cbamOperationReport',
  };
};

const isEnterpriseCarbonBusinessCard = (card: AgentMessageCard) => {
  const root = asRecord(card.card);
  const nestedCard = asRecord(root.card);
  const records = [
    asRecord(root.bizRef),
    asRecord(root.data),
    asRecord(root.summary),
    root,
    asRecord(nestedCard.bizRef),
    asRecord(nestedCard.data),
    asRecord(nestedCard.summary),
    nestedCard,
  ];

  return Boolean(getEnterpriseCarbonBusinessKind(records));
};

const isBusinessCard = (card: AgentMessageCard) =>
  card.cardType === 'business_card' ||
  getScalarValue(card.cardType) === 'cbam2_monitor_plan' ||
  getScalarValue(card.cardType) === 'cbam2_report' ||
  getScalarValue(card.cardType) === 'product_carbon_model' ||
  getScalarValue(card.card.eventType) === 'business_card' ||
  getScalarValue(card.card.cardType) === 'cbam2_monitor_plan' ||
  getScalarValue(card.card.cardType) === 'cbam2_report' ||
  getScalarValue(card.card.cardType) === 'product_carbon_model' ||
  getScalarValue(asRecord(card.card.card).cardType) === 'cbam2_report' ||
  getScalarValue(asRecord(card.card.card).cardType) === 'cbam2_monitor_plan' ||
  getScalarValue(asRecord(card.card.card).cardType) ===
    'product_carbon_model' ||
  isEnterpriseCarbonBusinessCard(card);

const getBusinessCardPayload = (card: AgentMessageCard) => {
  const root = asRecord(card.card);
  const safePayload = asRecord(root.safePayload);

  return {
    ...safePayload,
    ...root,
  };
};

const getBusinessCardData = (payload: Record<string, unknown>) => {
  const nestedCard = asRecord(payload.card);

  return Object.keys(nestedCard).length ? nestedCard : payload;
};

const getBusinessCardPreviewTarget = (
  card: AgentMessageCard,
): BusinessCardPreviewTarget | undefined => {
  if (getEnterpriseCard(card.card)) return undefined;
  // 材料/进度卡先在会话展示；报告须点击后按当前会话鉴权。
  // trace 的数据库事件 id 不是核算 id，不能交给通用业务卡逻辑猜测预览对象。
  if (isMonitorCard(card)) {
    const result = monitorResult(card.card);
    if (result?.cardId || result?.fileId) return undefined;
  }
  if (!isBusinessCard(card)) {
    return undefined;
  }

  const payload = getBusinessCardPayload(card);
  const businessCard = getBusinessCardData(payload);
  const extra = asRecord(businessCard.extra);
  const bizRef = asRecord(businessCard.bizRef);
  const records = [
    extra,
    bizRef,
    asRecord(businessCard.data),
    asRecord(businessCard.summary),
    asRecord(businessCard.snapshot),
    businessCard,
    payload,
  ];
  const reportUrl = getBusinessCardValue(records, [
    'reportUrl',
    'report_url',
    'url',
    'fileUrl',
    'file_url',
    'downloadUrl',
    'download_url',
  ]);
  const reportId = getBusinessCardValue(records, ['reportId', 'bizId', 'id']);
  const bizType = getBusinessCardValue(records, ['bizType', 'biz_type']);
  const cardType = getBusinessCardValue(records, ['cardType', 'card_type']);
  const reportName = getBusinessCardValue(records, ['reportName', 'name']);
  const shareAuth = getBusinessCardValue(records, ['shareAuth', 'share_auth']);
  const accountName = getBusinessCardValue(records, [
    'accountName',
    'account_name',
  ]);
  const productName = getBusinessCardValue(records, [
    'productName',
    'product_name',
  ]);
  const messageId =
    card.messageId ||
    getBusinessCardValue(records, ['messageId', 'message_id']);
  const title = getBusinessCardValue(records, ['title', 'cardTitle', 'name']);
  const orgId = getBusinessCardValue(records, ['orgId', 'org_id']);
  const statusFields = {
    certificationStatus: getBusinessCardValue(records, [
      'certificationStatus',
      'certification_status',
    ]),
    certificationStatusName: getBusinessCardValue(records, [
      'certificationStatusName',
      'certification_status_name',
    ]),
    expertReviewId: getBusinessCardValue(records, [
      'expertReviewId',
      'expert_review_id',
    ]),
    expertReviewNo: getBusinessCardValue(records, [
      'expertReviewNo',
      'expert_review_no',
    ]),
    expertReviewStatus: getBusinessCardValue(records, [
      'expertReviewStatus',
      'expert_review_status',
    ]),
    expertReviewStatusName: getBusinessCardValue(records, [
      'expertReviewStatusName',
      'expert_review_status_name',
    ]),
  };
  const enterpriseCarbonKind = getEnterpriseCarbonBusinessKind(records);
  const cbamMonitorPlanId = getCbamMonitorPlanId(records);
  const cbamOperationId = getCbamOperationReportId(records);
  const cbamId = getCbamReportId(records);

  if (cbamMonitorPlanId) {
    return {
      planId: cbamMonitorPlanId,
      planName: getBusinessCardValue(records, [
        'planName',
        'plan_name',
        'name',
      ]),
      refreshKey: getBusinessCardValue(records, ['refreshKey', 'refresh_key']),
      title: title || I18N.cbamMonitor.monitorManagement,
      type: 'cbamMonitor',
      year: getBusinessCardValue(records, ['year']),
    };
  }

  if (cbamOperationId) {
    return {
      operationId: cbamOperationId,
      reportName,
      refreshKey: getBusinessCardValue(records, ['refreshKey', 'refresh_key']),
      title: title || reportName || I18N.cbamOperationReport.operationReport,
      type: 'cbamOperationReport',
    };
  }

  if (cbamId) {
    return {
      cbamId,
      title: title || reportName || I18N.cbam.cbamNews,
      type: 'cbamReport',
    };
  }

  if (enterpriseCarbonKind === 'account') {
    const enterpriseCarbonYear = getEnterpriseCarbonAccountingYear(records);

    if (!enterpriseCarbonYear) {
      return undefined;
    }

    const enterpriseCarbonBizId = getEnterpriseCarbonBusinessId(records);
    const reviewTarget = getEnterpriseCarbonExpertReviewOnlyTarget({
      enterpriseCarbonBizId,
      enterpriseCarbonBizType: 'account',
      expertReviewId: statusFields.expertReviewId,
      expertReviewNo: statusFields.expertReviewNo,
      expertReviewStatus: statusFields.expertReviewStatus,
      expertReviewStatusName: statusFields.expertReviewStatusName,
      orgId,
      type: 'enterpriseCarbonAccounting',
      year: enterpriseCarbonYear,
    });

    return {
      enterpriseCarbonBizId,
      enterpriseCarbonBizType: 'account',
      enterpriseCarbonExpertReviewDetail:
        reviewTarget?.enterpriseCarbonExpertReviewDetail,
      enterpriseCarbonExpertReviewDetails:
        reviewTarget?.enterpriseCarbonExpertReviewDetails,
      orgId,
      title: title || I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
      type: 'enterpriseCarbonAccounting',
      year: enterpriseCarbonYear,
    };
  }

  if (enterpriseCarbonKind === 'report') {
    const enterpriseCarbonFiles = getReadyEnterpriseCarbonReportFiles(
      getEnterpriseCarbonReportFiles(records),
    );
    const enterpriseCarbonReportId =
      getEnterpriseCarbonBusinessId(records) || reportId;
    const enterpriseCarbonYear = getEnterpriseCarbonReportYear(records);
    const reviewTarget = getEnterpriseCarbonExpertReviewOnlyTarget({
      enterpriseCarbonBizId: enterpriseCarbonReportId,
      enterpriseCarbonBizType: 'report',
      expertReviewId: statusFields.expertReviewId,
      expertReviewNo: statusFields.expertReviewNo,
      expertReviewStatus: statusFields.expertReviewStatus,
      expertReviewStatusName: statusFields.expertReviewStatusName,
      orgId,
      reportId: enterpriseCarbonReportId,
      type: 'enterpriseCarbonReport',
      year: enterpriseCarbonYear || undefined,
    });
    const enterpriseCarbonReportTarget: BusinessCardPreviewTarget = {
      enterpriseCarbonBizId: enterpriseCarbonReportId,
      enterpriseCarbonBizType: 'report',
      enterpriseCarbonExpertReviewDetail:
        reviewTarget?.enterpriseCarbonExpertReviewDetail,
      enterpriseCarbonExpertReviewDetails:
        reviewTarget?.enterpriseCarbonExpertReviewDetails,
      orgId,
      reportId: enterpriseCarbonReportId,
      reportName,
      title: title || reportName,
      type: 'enterpriseCarbonReport',
      year: enterpriseCarbonYear || undefined,
    };

    if (!enterpriseCarbonFiles.length) {
      return undefined;
    }

    return {
      ...enterpriseCarbonReportTarget,
      enterpriseCarbonFiles,
      reportUrl: enterpriseCarbonFiles[0].path,
    };
  }

  if (
    reportUrl &&
    (bizType === 'report' ||
      /report/i.test(cardType || '') ||
      Boolean(reportId))
  ) {
    return {
      accountId: getBusinessCardValue(records, ['accountId', 'account_id']),
      accountName,
      messageId,
      ...statusFields,
      productName,
      productId: getBusinessCardValue(records, ['productId', 'product_id']),
      reportId,
      reportName,
      reportUrl,
      shareAuth,
      title,
      type: 'report',
    };
  }

  const accountId = getBusinessCardValue(records, [
    'accountId',
    'account_id',
    'bizId',
    'id',
  ]);

  if (!accountId) {
    return undefined;
  }

  return {
    accountId,
    accountName,
    messageId,
    ...statusFields,
    productName,
    productId: getBusinessCardValue(records, ['productId', 'product_id']),
    shareAuth,
    title,
    type: 'account',
  };
};

const getBusinessRefPreviewTarget = (
  businessRef: unknown,
): BusinessCardPreviewTarget | undefined => {
  const refRecord = asRecord(businessRef);
  const data = asRecord(refRecord.data);
  const bizRef = asRecord(refRecord.bizRef);
  const summary = asRecord(refRecord.summary);
  const records = [data, bizRef, summary, refRecord];
  const title = getBusinessCardValue(records, ['title', 'bizName', 'biz_name']);
  const enterpriseCarbonKind = getEnterpriseCarbonBusinessKind(records);
  const accountId = getBusinessCardValue(records, [
    'accountId',
    'account_id',
    'bizId',
    'biz_id',
  ]);
  const reportUrl = getBusinessCardValue(records, [
    'reportUrl',
    'report_url',
    'url',
    'fileUrl',
    'file_url',
    'downloadUrl',
    'download_url',
  ]);
  const shareAuth = getBusinessCardValue(records, ['shareAuth', 'share_auth']);
  const orgId = getBusinessCardValue(records, ['orgId', 'org_id']);
  const baseTarget = {
    accountId,
    accountName: getBusinessCardValue(records, [
      'accountName',
      'account_name',
      'bizName',
      'biz_name',
    ]),
    messageId: getBusinessCardValue(records, ['messageId', 'message_id']),
    productId: getBusinessCardValue(records, ['productId', 'product_id']),
    productName: getBusinessCardValue(records, ['productName', 'product_name']),
    shareAuth,
    title,
  };
  const cbamMonitorPlanId = getCbamMonitorPlanId(records);
  const cbamOperationId = getCbamOperationReportId(records);
  const cbamId = getCbamReportId(records);

  if (cbamMonitorPlanId) {
    return {
      planId: cbamMonitorPlanId,
      planName: getBusinessCardValue(records, [
        'planName',
        'plan_name',
        'bizName',
        'biz_name',
      ]),
      refreshKey: getBusinessCardValue(records, ['refreshKey', 'refresh_key']),
      title: title || I18N.cbamMonitor.monitorManagement,
      type: 'cbamMonitor',
      year: getBusinessCardValue(records, ['year']),
    };
  }

  if (cbamOperationId) {
    return {
      operationId: cbamOperationId,
      reportName: getBusinessCardValue(records, ['reportName', 'report_name']),
      refreshKey: getBusinessCardValue(records, ['refreshKey', 'refresh_key']),
      title: title || I18N.cbamOperationReport.operationReport,
      type: 'cbamOperationReport',
    };
  }

  if (cbamId) {
    return {
      cbamId,
      title: title || I18N.cbam.cbamNews,
      type: 'cbamReport',
    };
  }

  if (enterpriseCarbonKind === 'account') {
    const enterpriseCarbonYear = getEnterpriseCarbonAccountingYear(records);

    if (!enterpriseCarbonYear) {
      return undefined;
    }

    return {
      enterpriseCarbonBizId: getEnterpriseCarbonBusinessId(records),
      enterpriseCarbonBizType: 'account',
      orgId,
      title: title || I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
      type: 'enterpriseCarbonAccounting',
      year: enterpriseCarbonYear,
    };
  }

  if (enterpriseCarbonKind === 'report') {
    const enterpriseCarbonFiles = getReadyEnterpriseCarbonReportFiles(
      getEnterpriseCarbonReportFiles(records),
    );
    const enterpriseCarbonReportId =
      getEnterpriseCarbonBusinessId(records) ||
      getBusinessCardValue(records, [
        'reportId',
        'report_id',
        'bizId',
        'biz_id',
      ]);
    const enterpriseCarbonYear = getEnterpriseCarbonReportYear(records);

    if (!enterpriseCarbonFiles.length) {
      return undefined;
    }

    return {
      enterpriseCarbonBizId: enterpriseCarbonReportId,
      enterpriseCarbonBizType: 'report',
      enterpriseCarbonFiles,
      orgId,
      reportId: enterpriseCarbonReportId,
      reportName: getBusinessCardValue(records, [
        'reportName',
        'report_name',
        'bizName',
        'biz_name',
      ]),
      reportUrl: enterpriseCarbonFiles[0].path,
      title,
      type: 'enterpriseCarbonReport',
      year: enterpriseCarbonYear || undefined,
    };
  }

  if (reportUrl) {
    return {
      ...baseTarget,
      reportId: getBusinessCardValue(records, [
        'reportId',
        'report_id',
        'bizId',
        'biz_id',
      ]),
      reportName: getBusinessCardValue(records, [
        'reportName',
        'report_name',
        'bizName',
        'biz_name',
      ]),
      reportUrl,
      type: 'report',
    };
  }

  if (accountId) {
    return {
      ...baseTarget,
      type: 'account',
    };
  }

  return undefined;
};

const getBusinessCardPreviewOpenKey = (
  card: AgentMessageCard,
  target: BusinessCardPreviewTarget,
) => {
  const certificationDetailsKey = target.certificationDetails
    ?.map(item =>
      [
        item.id,
        item.certificationId,
        item.certificationStatus,
        item.certificationStatusName,
        item.status,
        item.statusName,
        item.authType,
        item.auth_type,
        item.certificationAuthType,
        item.certification_auth_type,
      ]
        .filter(value => value !== undefined && value !== null && value !== '')
        .join(':'),
    )
    .join('|');

  return [
    card.messageId,
    card.orderNo,
    card.cardType,
    target.type,
    target.enterpriseCarbonBizType,
    target.enterpriseCarbonBizId,
    target.accountId,
    target.planId,
    target.productId,
    target.reportId,
    target.reportUrl,
    target.certificationAuthType,
    target.refreshKey,
    target.year,
    target.enterpriseCarbonFiles
      ?.map(file =>
        [
          file.reportFileRecordId,
          file.fileName,
          file.path,
          file.status,
          file.versionType,
        ]
          .filter(
            value => value !== undefined && value !== null && value !== '',
          )
          .join(':'),
      )
      .join(','),
    certificationDetailsKey,
  ]
    .filter(Boolean)
    .join('|');
};

const normalizeCertificationApplyAuthType = (
  authType?: unknown,
): CertificationApplyAuthType | undefined => {
  const nextAuthType = String(authType ?? '');

  if (nextAuthType === '0' || nextAuthType === '3') {
    return nextAuthType;
  }

  return undefined;
};

const getCertificationApplyAuthTypeFromItem = (
  item?: AgentCertificationItem | null,
): CertificationApplyAuthType =>
  normalizeCertificationApplyAuthType(
    item?.authType ??
      item?.auth_type ??
      item?.certificationAuthType ??
      item?.certification_auth_type,
  ) || '0';

const getCertificationItemTimestamp = (
  item?: AgentCertificationItem | null,
) => {
  const source =
    getScalarValue(
      (item as { updateTime?: unknown } | undefined)?.updateTime,
    ) ||
    getScalarValue((item as { createTime?: unknown } | undefined)?.createTime);

  if (!source) {
    return 0;
  }

  const timestamp = new Date(source.replace(/-/g, '/')).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortCertificationDetailsForFocus = (
  certificationDetails: AgentCertificationItem[],
  preferredAuthType?: CertificationApplyAuthType,
  preferredCertificationId?: number | string,
) => {
  const normalizedPreferredCertificationId = getScalarValue(
    preferredCertificationId,
  );

  if (!preferredAuthType && !normalizedPreferredCertificationId) {
    return certificationDetails;
  }

  return [...certificationDetails].sort((prevItem, nextItem) => {
    if (normalizedPreferredCertificationId) {
      const prevId = getScalarValue(prevItem.certificationId ?? prevItem.id);
      const nextId = getScalarValue(nextItem.certificationId ?? nextItem.id);
      const prevMatched = prevId === normalizedPreferredCertificationId ? 1 : 0;
      const nextMatched = nextId === normalizedPreferredCertificationId ? 1 : 0;

      if (prevMatched !== nextMatched) {
        return nextMatched - prevMatched;
      }
    }

    const prevPreferred =
      getCertificationApplyAuthTypeFromItem(prevItem) === preferredAuthType
        ? 1
        : 0;
    const nextPreferred =
      getCertificationApplyAuthTypeFromItem(nextItem) === preferredAuthType
        ? 1
        : 0;

    if (prevPreferred !== nextPreferred) {
      return nextPreferred - prevPreferred;
    }

    const timestampDiff =
      getCertificationItemTimestamp(nextItem) -
      getCertificationItemTimestamp(prevItem);

    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    const prevId = Number(
      getScalarValue(prevItem.certificationId ?? prevItem.id),
    );
    const nextId = Number(
      getScalarValue(nextItem.certificationId ?? nextItem.id),
    );

    if (Number.isFinite(prevId) && Number.isFinite(nextId)) {
      return nextId - prevId;
    }

    return 0;
  });
};

const getBusinessPreviewStatusFields = (
  target?: BusinessCardPreviewTarget,
): Pick<
  BusinessCardPreviewTarget,
  | 'certificationStatus'
  | 'certificationStatusName'
  | 'expertReviewId'
  | 'expertReviewNo'
  | 'expertReviewStatus'
  | 'expertReviewStatusName'
> => ({
  certificationStatus: getScalarValue(target?.certificationStatus) || undefined,
  certificationStatusName:
    getScalarValue(target?.certificationStatusName) || undefined,
  expertReviewId: getScalarValue(target?.expertReviewId) || undefined,
  expertReviewNo: getScalarValue(target?.expertReviewNo) || undefined,
  expertReviewStatus: getScalarValue(target?.expertReviewStatus) || undefined,
  expertReviewStatusName:
    getScalarValue(target?.expertReviewStatusName) || undefined,
});

const getBusinessPreviewRefreshFields = (
  target?: BusinessCardPreviewTarget,
): Pick<
  BusinessCardPreviewTarget,
  'monitorCreated' | 'monitorDataVersion' | 'refreshKey'
> => ({
  monitorCreated: target?.monitorCreated,
  monitorDataVersion:
    typeof target?.monitorDataVersion === 'number'
      ? target.monitorDataVersion
      : undefined,
  refreshKey: getScalarValue(target?.refreshKey) || undefined,
});

const getBusinessPreviewDisplayFields = (
  target?: BusinessCardPreviewTarget,
): Pick<
  BusinessCardPreviewTarget,
  'accountName' | 'messageId' | 'productName' | 'title'
> => ({
  accountName: getScalarValue(target?.accountName) || undefined,
  messageId: getScalarValue(target?.messageId) || undefined,
  productName: getScalarValue(target?.productName) || undefined,
  title: getScalarValue(target?.title) || undefined,
});

const getBusinessPreviewTargetAccountId = (
  target?: BusinessCardPreviewTarget,
) =>
  getScalarValue(target?.accountId) ||
  getScalarValue(target?.reviewDetail?.accountId) ||
  getScalarValue(target?.reviewDetail?.snapAccountId) ||
  getScalarValue(target?.certificationDetails?.[0]?.accountId);

const getBusinessPreviewTargetReportId = (target?: BusinessCardPreviewTarget) =>
  getScalarValue(target?.reportId) ||
  getScalarValue(target?.reviewDetail?.reportId) ||
  getScalarValue(target?.reviewDetail?.snapReportId);

const getBusinessPreviewExpertReviewDetail = (
  target?: BusinessCardPreviewTarget,
): AgentExpertReviewStatus | undefined => {
  if (target?.reviewDetail) {
    return target.reviewDetail;
  }

  if (target?.reviewDetails?.[0]) {
    return target.reviewDetails[0];
  }

  const reviewId = getScalarValue(target?.expertReviewId);
  const reviewNo = getScalarValue(target?.expertReviewNo);
  const status = getScalarValue(target?.expertReviewStatus);
  const statusName = getScalarValue(target?.expertReviewStatusName);

  if (!reviewId && !reviewNo && !status && !statusName) {
    return undefined;
  }

  const fallbackDetail: AgentExpertReviewStatus = {
    accountId: getBusinessPreviewTargetAccountId(target) || undefined,
    accountName: target?.accountName,
    productName: target?.productName,
    reportId: getScalarValue(target?.reportId) || undefined,
    reportUrl: getScalarValue(target?.reportUrl) || undefined,
    reviewId: reviewId || undefined,
    reviewNo: reviewNo || undefined,
    status: status || undefined,
    statusName: statusName || undefined,
  };

  if (!reviewId && !reviewNo && !canOpenExpertReviewDetail(fallbackDetail)) {
    return undefined;
  }

  return fallbackDetail;
};

const getBusinessPreviewTargetType = (
  target: BusinessCardPreviewTarget,
): NonNullable<BusinessCardPreviewTarget['type']> | undefined => {
  if (target.type === 'carbonLabel') return 'carbonLabel';
  if (target.type === 'workspace' || target.workspaceLiveSession) {
    return target.workspaceLiveSession ? 'workspace' : undefined;
  }

  if (target.type === 'enterpriseCarbonAccounting') {
    return 'enterpriseCarbonAccounting';
  }

  if (target.type === 'cbamMonitor') {
    return target.planId ? 'cbamMonitor' : undefined;
  }

  if (target.type === 'cbamOperationReport') {
    return target.operationId ? 'cbamOperationReport' : undefined;
  }

  if (target.type === 'cbamReport') {
    return target.cbamId ? 'cbamReport' : undefined;
  }

  if (target.type === 'enterpriseCarbonCertification') {
    if (target.enterpriseCarbonCertificationPageType) {
      return 'enterpriseCarbonCertification';
    }

    if (target.enterpriseCarbonCertificationDetails?.length) {
      return 'enterpriseCarbonCertification';
    }

    if (target.enterpriseCarbonCertificationDraft) {
      return 'enterpriseCarbonCertification';
    }

    return undefined;
  }

  if (target.type === 'enterpriseCarbonExpertReview') {
    if (target.enterpriseCarbonExpertReviewDetail) {
      return 'enterpriseCarbonExpertReview';
    }

    if (target.enterpriseCarbonExpertReviewDetails?.length) {
      return 'enterpriseCarbonExpertReview';
    }

    return undefined;
  }

  if (target.type === 'enterpriseCarbonReport') {
    const hasReportFile = Boolean(
      target.reportUrl ||
        getReadyEnterpriseCarbonReportFiles(target.enterpriseCarbonFiles)
          .length,
    );

    return hasReportFile ? 'enterpriseCarbonReport' : undefined;
  }

  if (target.type === 'certification') {
    return target.certificationAuthType ||
      target.certificationDraftAuthType ||
      target.certificationDetails?.length
      ? 'certification'
      : undefined;
  }

  if (target.type === 'expertReview' || target.reviewDetail) {
    return getBusinessPreviewExpertReviewDetail(target)
      ? 'expertReview'
      : undefined;
  }

  if (target.type === 'report' || target.reportUrl) {
    return 'report';
  }

  if (target.type === 'account' || target.accountId) {
    return 'account';
  }

  return undefined;
};

const normalizeBusinessPreviewTarget = (
  target?: BusinessCardPreviewTarget,
): BusinessCardPreviewTarget | undefined => {
  if (!target) {
    return undefined;
  }

  const targetType = getBusinessPreviewTargetType(target);

  if (targetType === 'carbonLabel') {
    const accountId = getScalarValue(target.accountId);
    if (!accountId || !target.carbonLabelKey) return undefined;
    return {
      accountId,
      productId: getScalarValue(target.productId) || undefined,
      ...getBusinessPreviewDisplayFields(target),
      carbonLabelKey: target.carbonLabelKey,
      carbonLabelApplicationId: target.carbonLabelApplicationId,
      carbonLabelApplyNum: target.carbonLabelApplyNum,
      carbonLabelForceNew: target.carbonLabelForceNew,
      carbonLabelPreparedApplication: target.carbonLabelPreparedApplication,
      carbonLabelStatus: target.carbonLabelStatus,
      type: 'carbonLabel',
    };
  }

  if (targetType === 'workspace') {
    const { workspaceLiveSession } = target;

    if (
      !workspaceLiveSession?.vncAutoconnectUrl &&
      !workspaceLiveSession?.vncUrl
    ) {
      return undefined;
    }

    return {
      ...getBusinessPreviewRefreshFields(target),
      title:
        getScalarValue(target.title) ||
        workspaceLiveSession.provider ||
        I18N.carbonAgent.workspaceLiveSession,
      type: 'workspace',
      workspaceLiveSession,
    };
  }

  if (targetType === 'enterpriseCarbonAccounting') {
    return {
      enterpriseCarbonBizId:
        getScalarValue(target.enterpriseCarbonBizId) || undefined,
      enterpriseCarbonBizType: 'account',
      enterpriseCarbonExpertReviewDetail:
        target.enterpriseCarbonExpertReviewDetail,
      enterpriseCarbonExpertReviewDetails:
        target.enterpriseCarbonExpertReviewDetails,
      enterpriseCarbonSnapshot: target.enterpriseCarbonSnapshot,
      ...getBusinessPreviewRefreshFields(target),
      orgId: getScalarValue(target.orgId) || undefined,
      title:
        getScalarValue(target.title) ||
        I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
      type: 'enterpriseCarbonAccounting',
      year: getScalarValue(target.year) || undefined,
    };
  }

  if (targetType === 'cbamReport') {
    return {
      cbamId: getScalarValue(target.cbamId) || undefined,
      title: getScalarValue(target.title) || I18N.cbam.cbamNews,
      type: 'cbamReport',
    };
  }

  if (targetType === 'cbamMonitor') {
    return {
      ...getBusinessPreviewRefreshFields(target),
      planId: getScalarValue(target.planId) || undefined,
      planName: getScalarValue(target.planName) || undefined,
      title:
        getScalarValue(target.title) ||
        getScalarValue(target.planName) ||
        I18N.cbamMonitor.monitorManagement,
      type: 'cbamMonitor',
      year: getScalarValue(target.year) || undefined,
    };
  }

  if (targetType === 'cbamOperationReport') {
    return {
      ...getBusinessPreviewRefreshFields(target),
      operationId: getScalarValue(target.operationId) || undefined,
      reportName: getScalarValue(target.reportName) || undefined,
      title:
        getScalarValue(target.title) ||
        getScalarValue(target.reportName) ||
        I18N.cbamOperationReport.operationReport,
      type: 'cbamOperationReport',
    };
  }

  if (targetType === 'enterpriseCarbonCertification') {
    return {
      applyNo: getScalarValue(target.applyNo) || undefined,
      certificationId: target.certificationId,
      enterpriseCarbonBizId:
        getScalarValue(target.enterpriseCarbonBizId) || undefined,
      enterpriseCarbonBizType: target.enterpriseCarbonBizType || 'account',
      enterpriseCarbonCertificationDetails:
        target.enterpriseCarbonCertificationDetails || [],
      enterpriseCarbonCertificationDraft: Boolean(
        target.enterpriseCarbonCertificationDraft,
      ),
      enterpriseCarbonCertificationPageType:
        target.enterpriseCarbonCertificationPageType,
      orgId: getScalarValue(target.orgId) || undefined,
      reportId: getScalarValue(target.reportId) || undefined,
      type: 'enterpriseCarbonCertification',
      year: getScalarValue(target.year) || undefined,
    };
  }

  if (targetType === 'enterpriseCarbonExpertReview') {
    const sourceDetail =
      target.enterpriseCarbonExpertReviewDetail ||
      target.enterpriseCarbonExpertReviewDetails?.[0];

    if (!sourceDetail) {
      return undefined;
    }

    let details = target.enterpriseCarbonExpertReviewDetails;

    if (!details?.length) {
      details = [sourceDetail];
    }

    let { enterpriseCarbonBizType } = target;

    if (!enterpriseCarbonBizType && sourceDetail.objectType === 'report') {
      enterpriseCarbonBizType = 'report';
    }

    if (!enterpriseCarbonBizType) {
      enterpriseCarbonBizType = 'account';
    }

    const normalizedReportId =
      enterpriseCarbonBizType === 'report'
        ? getScalarValue(target.reportId) ||
          getScalarValue(sourceDetail.reportId) ||
          undefined
        : undefined;
    const normalizedReviewTarget = createEnterpriseCarbonExpertReviewTarget(
      {
        enterpriseCarbonBizId:
          getScalarValue(target.enterpriseCarbonBizId) ||
          getScalarValue(sourceDetail.enterpriseCarbonBizId) ||
          undefined,
        enterpriseCarbonBizType,
        orgId:
          getScalarValue(target.orgId) ||
          getScalarValue(sourceDetail.orgId) ||
          undefined,
        reportId: normalizedReportId,
        snapshot: target.enterpriseCarbonSnapshot,
        year:
          getScalarValue(target.year) ||
          getScalarValue(sourceDetail.year) ||
          undefined,
      },
      details,
    );
    const detail = normalizedReviewTarget.reviewDetail;

    if (!detail) {
      return undefined;
    }

    return {
      enterpriseCarbonBizId: normalizedReviewTarget.enterpriseCarbonBizId,
      enterpriseCarbonBizType: normalizedReviewTarget.enterpriseCarbonBizType,
      enterpriseCarbonExpertReviewDetail: detail,
      enterpriseCarbonExpertReviewDetails: normalizedReviewTarget.reviewDetails,
      enterpriseCarbonSnapshot: target.enterpriseCarbonSnapshot,
      orgId: normalizedReviewTarget.orgId,
      reportId: normalizedReviewTarget.reportId,
      title: getScalarValue(target.title) || I18N.carbonAgent.expertReview,
      type: 'enterpriseCarbonExpertReview',
      year: normalizedReviewTarget.year,
    };
  }

  if (targetType === 'enterpriseCarbonReport') {
    const reportId =
      getScalarValue(target.reportId) ||
      getScalarValue(target.enterpriseCarbonBizId);
    const files = getReadyEnterpriseCarbonReportFiles(
      target.enterpriseCarbonFiles,
    );
    const reportUrl = getScalarValue(target.reportUrl) || files[0]?.path;

    if (!reportUrl) {
      return undefined;
    }

    return {
      enterpriseCarbonBizId: reportId || undefined,
      enterpriseCarbonBizType: 'report',
      enterpriseCarbonExpertReviewDetail:
        target.enterpriseCarbonExpertReviewDetail,
      enterpriseCarbonExpertReviewDetails:
        target.enterpriseCarbonExpertReviewDetails,
      enterpriseCarbonFiles: files,
      enterpriseCarbonSelectedFile: target.enterpriseCarbonSelectedFile,
      enterpriseCarbonSnapshot: target.enterpriseCarbonSnapshot,
      ...getBusinessPreviewRefreshFields(target),
      orgId: getScalarValue(target.orgId) || undefined,
      reportId: reportId || undefined,
      reportName: getScalarValue(target.reportName) || undefined,
      reportUrl,
      title:
        getScalarValue(target.title) ||
        getScalarValue(target.reportName) ||
        undefined,
      type: 'enterpriseCarbonReport',
      year: getScalarValue(target.year) || undefined,
    };
  }

  if (targetType === 'certification') {
    const certificationDetails = target.certificationDetails || [];
    const targetCertificationAuthType = normalizeCertificationApplyAuthType(
      target.certificationAuthType,
    );
    const certificationDraftAuthType =
      normalizeCertificationApplyAuthType(target.certificationDraftAuthType) ||
      (!certificationDetails.length ? targetCertificationAuthType : undefined);
    const certificationAuthType =
      targetCertificationAuthType ||
      (certificationDetails.length
        ? getCertificationApplyAuthTypeFromItem(certificationDetails[0])
        : undefined) ||
      certificationDraftAuthType;

    if (!certificationAuthType) {
      return undefined;
    }

    return {
      accountId: getScalarValue(target.accountId) || undefined,
      ...getBusinessPreviewDisplayFields(target),
      ...getBusinessPreviewRefreshFields(target),
      certificationAuthType,
      certificationDetails,
      certificationDraftAuthType,
      productId: getScalarValue(target.productId) || undefined,
      reportId: getScalarValue(target.reportId) || undefined,
      reportName: getScalarValue(target.reportName) || undefined,
      reportUrl: getScalarValue(target.reportUrl) || undefined,
      shareAuth: getScalarValue(target.shareAuth) || undefined,
      ...getBusinessPreviewStatusFields(target),
      type: 'certification',
    };
  }

  if (targetType === 'report') {
    const reportUrl = getScalarValue(target.reportUrl);

    if (!reportUrl) {
      return undefined;
    }

    return {
      accountId: getScalarValue(target.accountId) || undefined,
      ...getBusinessPreviewDisplayFields(target),
      ...getBusinessPreviewRefreshFields(target),
      productId: getScalarValue(target.productId) || undefined,
      reportId: getScalarValue(target.reportId) || undefined,
      reportName: getScalarValue(target.reportName) || undefined,
      reportUrl,
      reportReadonly: target.reportReadonly,
      reportKind: target.reportKind,
      reportLabel: target.reportLabel,
      shareAuth: getScalarValue(target.shareAuth) || undefined,
      ...getBusinessPreviewStatusFields(target),
      type: 'report',
    };
  }

  if (targetType === 'expertReview') {
    const reviewDetail = getBusinessPreviewExpertReviewDetail(target);
    const reviewDetails = target.reviewDetails?.length
      ? target.reviewDetails
      : reviewDetail
      ? [reviewDetail]
      : [];

    if (!reviewDetail) {
      return undefined;
    }

    return {
      accountId: getBusinessPreviewTargetAccountId(target) || undefined,
      ...getBusinessPreviewDisplayFields(target),
      ...getBusinessPreviewRefreshFields(target),
      productId: getScalarValue(target.productId) || undefined,
      reportId:
        getScalarValue(target.reportId) ||
        getScalarValue(reviewDetail.reportId) ||
        getScalarValue(reviewDetail.snapReportId) ||
        undefined,
      reportName: getScalarValue(target.reportName) || undefined,
      reportUrl:
        getScalarValue(target.reportUrl) ||
        getScalarValue(reviewDetail.reportUrl) ||
        undefined,
      shareAuth: getScalarValue(target.shareAuth) || undefined,
      ...getBusinessPreviewStatusFields(target),
      reviewDetail,
      reviewDetails,
      type: 'expertReview',
    };
  }

  if (targetType === 'account') {
    const accountId = getScalarValue(target.accountId);

    if (!accountId) {
      return undefined;
    }

    return {
      accountId,
      ...getBusinessPreviewDisplayFields(target),
      ...getBusinessPreviewRefreshFields(target),
      productId: getScalarValue(target.productId) || undefined,
      shareAuth: getScalarValue(target.shareAuth) || undefined,
      ...getBusinessPreviewStatusFields(target),
      type: 'account',
    };
  }

  return undefined;
};

const getEnterpriseProjectAccountingPreviewTarget = (
  project?: AgentProject,
): BusinessCardPreviewTarget | undefined => {
  if (!project || !isEnterpriseCarbonAgentProject(project)) {
    return undefined;
  }

  const { enterpriseSetting } = project;
  const accountingYear = getScalarValue(enterpriseSetting?.accountingYear);

  if (
    enterpriseSetting?.accountingExistedAtCreate !== true ||
    enterpriseSetting.accountingExists !== true ||
    !accountingYear
  ) {
    return undefined;
  }

  return normalizeBusinessPreviewTarget({
    enterpriseCarbonBizId: accountingYear,
    enterpriseCarbonBizType: 'account',
    orgId: getScalarValue(enterpriseSetting.orgId) || undefined,
    type: 'enterpriseCarbonAccounting',
    year: accountingYear,
  });
};

const getBusinessPreviewTargetMergeKey = (
  target: BusinessCardPreviewTarget,
) => {
  const type = target.type || getBusinessPreviewTargetType(target) || 'account';
  const accountId = getBusinessPreviewTargetAccountId(target);

  if (type === 'carbonLabel') return getCarbonLabelTabKey(target);

  if (type === 'report') {
    return [
      type,
      accountId,
      getScalarValue(target.reportId),
      getScalarValue(target.reportUrl),
    ]
      .filter(Boolean)
      .join('|');
  }

  if (type === 'expertReview') {
    const reviewKey =
      target.reviewDetails
        ?.map(detail =>
          [detail.reviewId, detail.reviewNo, detail.status, detail.statusName]
            .filter(Boolean)
            .join(':'),
        )
        .join(',') ||
      [
        target.reviewDetail?.reviewId,
        target.reviewDetail?.reviewNo,
        target.reviewDetail?.status,
        target.reviewDetail?.statusName,
      ]
        .filter(Boolean)
        .join(':');

    return [type, accountId, reviewKey].filter(Boolean).join('|');
  }

  if (type === 'certification') {
    const certificationKey =
      target.certificationDetails
        ?.map(detail =>
          [
            detail.id,
            detail.certificationId,
            detail.applyNo,
            detail.projectNo,
            detail.certificationStatus,
            detail.status,
            detail.authType,
            detail.auth_type,
            detail.certificationAuthType,
            detail.certification_auth_type,
          ]
            .filter(
              value => value !== undefined && value !== null && value !== '',
            )
            .join(':'),
        )
        .join(',') || target.certificationAuthType;

    return [type, accountId, certificationKey].filter(Boolean).join('|');
  }

  if (type === 'enterpriseCarbonAccounting') {
    return [type, getScalarValue(target.year)].filter(Boolean).join('|');
  }

  if (type === 'cbamReport') {
    return [type, getScalarValue(target.cbamId)].filter(Boolean).join('|');
  }

  if (type === 'cbamMonitor') {
    return [type, getScalarValue(target.planId)].filter(Boolean).join('|');
  }

  if (type === 'cbamOperationReport') {
    return [type, getScalarValue(target.operationId)].filter(Boolean).join('|');
  }

  if (type === 'enterpriseCarbonCertification') {
    const year = getScalarValue(target.year);

    if (year) {
      // 认证列表接口只按年度查询；同一年度从自动回显或卡片点击进入时
      // 应更新同一份列表，不能因卡片上下文 ID 不同而重复追加。
      return [type, year].join('|');
    }

    return [
      type,
      target.enterpriseCarbonBizType,
      getScalarValue(target.enterpriseCarbonBizId),
    ]
      .filter(Boolean)
      .join('|');
  }

  if (type === 'enterpriseCarbonExpertReview') {
    const detail =
      target.enterpriseCarbonExpertReviewDetail ||
      target.enterpriseCarbonExpertReviewDetails?.[0];
    const enterpriseCarbonBizType =
      target.enterpriseCarbonBizType ||
      detail?.enterpriseCarbonBizType ||
      (detail?.objectType === 'report' ? 'report' : 'account');
    const reportId =
      enterpriseCarbonBizType === 'report'
        ? getScalarValue(target.reportId) || getScalarValue(detail?.reportId)
        : '';

    return [
      type,
      enterpriseCarbonBizType,
      getScalarValue(target.year) || getScalarValue(detail?.year),
      reportId,
    ]
      .filter(Boolean)
      .join('|');
  }

  if (type === 'enterpriseCarbonReport') {
    const enterpriseCarbonReportId =
      getScalarValue(target.enterpriseCarbonBizId) ||
      getScalarValue(target.reportId);

    if (enterpriseCarbonReportId) {
      return [type, enterpriseCarbonReportId].join('|');
    }

    return [
      type,
      getScalarValue(target.year),
      getScalarValue(target.reportName),
      getScalarValue(target.reportUrl),
    ]
      .filter(Boolean)
      .join('|');
  }

  if (type === 'workspace') {
    const workspaceIdentity = getWorkspaceLiveSessionIdentity(
      target.workspaceLiveSession,
    );

    if (workspaceIdentity) {
      return [type, workspaceIdentity].join('|');
    }

    return [type, target.workspaceLiveSession?.scope].filter(Boolean).join('|');
  }

  return [type, accountId].filter(Boolean).join('|');
};

const mergeBusinessPreviewTargets = (
  ...targetLists: (BusinessCardPreviewTarget | undefined)[]
) => {
  const mergedTargets: BusinessCardPreviewTarget[] = [];
  const targetIndexByKey = new Map<string, number>();
  const mergeTargetData = (
    existingTarget: BusinessCardPreviewTarget,
    nextTarget: BusinessCardPreviewTarget,
  ): BusinessCardPreviewTarget => {
    if (
      existingTarget.type === 'workspace' &&
      nextTarget.type === 'workspace' &&
      existingTarget.workspaceLiveSession &&
      nextTarget.workspaceLiveSession
    ) {
      const existingSession = existingTarget.workspaceLiveSession;
      const nextSession = nextTarget.workspaceLiveSession;
      const existingIdentity = getWorkspaceLiveSessionIdentity(existingSession);
      const nextIdentity = getWorkspaceLiveSessionIdentity(nextSession);
      const sameWorkspace =
        Boolean(existingIdentity) && existingIdentity === nextIdentity;

      return {
        ...existingTarget,
        ...nextTarget,
        workspaceLiveSession: {
          ...existingSession,
          ...nextSession,
          vncAutoconnectUrl: sameWorkspace
            ? nextSession.vncAutoconnectUrl || existingSession.vncAutoconnectUrl
            : nextSession.vncAutoconnectUrl ||
              existingSession.vncAutoconnectUrl,
          vncUrl: sameWorkspace
            ? nextSession.vncUrl || existingSession.vncUrl
            : nextSession.vncUrl || existingSession.vncUrl,
        },
      };
    }

    if (
      existingTarget.type === 'enterpriseCarbonReport' &&
      nextTarget.type === 'enterpriseCarbonReport'
    ) {
      return {
        ...existingTarget,
        ...nextTarget,
        enterpriseCarbonFiles: mergeEnterpriseCarbonReportFiles(
          existingTarget.enterpriseCarbonFiles,
          nextTarget.enterpriseCarbonFiles,
        ),
      };
    }

    if (
      existingTarget.type === 'cbamMonitor' &&
      nextTarget.type === 'cbamMonitor' &&
      existingTarget.planId === nextTarget.planId &&
      typeof existingTarget.monitorDataVersion === 'number' &&
      typeof nextTarget.monitorDataVersion === 'number' &&
      nextTarget.monitorDataVersion < existingTarget.monitorDataVersion
    ) {
      return existingTarget;
    }

    return {
      ...existingTarget,
      ...nextTarget,
    };
  };

  targetLists.forEach(target => {
    const normalizedTarget = normalizeBusinessPreviewTarget(target);

    if (!normalizedTarget?.type) {
      return;
    }

    const targetKey = getBusinessPreviewTargetMergeKey(normalizedTarget);
    const existingIndex = targetIndexByKey.get(targetKey);

    if (existingIndex === undefined) {
      targetIndexByKey.set(targetKey, mergedTargets.length);
      mergedTargets.push(normalizedTarget);
      return;
    }

    mergedTargets[existingIndex] = mergeTargetData(
      mergedTargets[existingIndex],
      normalizedTarget,
    );
  });

  return mergedTargets;
};

const getEnterpriseCarbonCertificationSourcePriority = (
  target: BusinessCardPreviewTarget,
) => {
  switch (target.type) {
    case 'enterpriseCarbonAccounting':
      return 4;
    case 'enterpriseCarbonReport':
      return 3;
    case 'enterpriseCarbonExpertReview':
      return 2;
    case 'enterpriseCarbonCertification':
      return 1;
    default:
      return 0;
  }
};

const getEnterpriseCarbonCertificationSourceTargets = (
  targets: BusinessCardPreviewTarget[],
) => {
  const targetsByYear = new Map<string, BusinessCardPreviewTarget>();

  targets.forEach(target => {
    const sourcePriority =
      getEnterpriseCarbonCertificationSourcePriority(target);
    const year = getScalarValue(target.year);

    if (!sourcePriority || !year) {
      return;
    }

    const existingTarget = targetsByYear.get(year);

    if (
      existingTarget &&
      getEnterpriseCarbonCertificationSourcePriority(existingTarget) >=
        sourcePriority
    ) {
      return;
    }

    targetsByYear.set(year, target);
  });

  return Array.from(targetsByYear.values());
};

const getPreviewTargetsWithDefaultEnterpriseCarbonReports = (
  targets: BusinessCardPreviewTarget[],
  selectedTarget?: BusinessCardPreviewTarget,
) => {
  const enterpriseCarbonReportTargets = targets.filter(
    target => target.type === 'enterpriseCarbonReport',
  );

  if (!enterpriseCarbonReportTargets.length) {
    return targets;
  }

  const defaultReportTargets =
    getLastEnterpriseCarbonReportTargetsByYear(targets);

  const selectedYear =
    selectedTarget?.type === 'enterpriseCarbonReport'
      ? getScalarValue(selectedTarget.year)
      : '';
  const selectedReportKey =
    selectedTarget?.type === 'enterpriseCarbonReport'
      ? getBusinessPreviewTargetMergeKey(selectedTarget)
      : '';
  const selectedReportTarget = selectedReportKey
    ? targets.find(
        target =>
          target.type === 'enterpriseCarbonReport' &&
          getBusinessPreviewTargetMergeKey(target) === selectedReportKey,
      )
    : undefined;
  const previewReportTargets = selectedReportTarget
    ? [
        ...defaultReportTargets.filter(target =>
          selectedYear
            ? getScalarValue(target.year) !== selectedYear
            : getBusinessPreviewTargetMergeKey(target) !== selectedReportKey,
        ),
        selectedReportTarget,
      ]
    : defaultReportTargets;

  if (!previewReportTargets.length) {
    return targets.filter(target => target.type !== 'enterpriseCarbonReport');
  }

  const focusedReportTarget =
    selectedReportTarget ||
    (selectedYear
      ? previewReportTargets.find(
          target => getScalarValue(target.year) === selectedYear,
        )
      : undefined) ||
    (selectedReportKey
      ? previewReportTargets.find(
          target =>
            getBusinessPreviewTargetMergeKey(target) === selectedReportKey,
        )
      : undefined) ||
    previewReportTargets[previewReportTargets.length - 1];

  return [
    ...targets.filter(target => target.type !== 'enterpriseCarbonReport'),
    ...previewReportTargets.filter(target => target !== focusedReportTarget),
    focusedReportTarget,
  ];
};

const mergeBusinessPreviewTargetWithExisting = (
  existingTarget: BusinessCardPreviewTarget | undefined,
  nextTarget: BusinessCardPreviewTarget,
) => {
  const normalizedNextTarget = normalizeBusinessPreviewTarget(nextTarget);

  if (!normalizedNextTarget) {
    return undefined;
  }

  const nextTargetKey = getBusinessPreviewTargetMergeKey(normalizedNextTarget);

  return (
    mergeBusinessPreviewTargets(existingTarget, normalizedNextTarget).find(
      target => getBusinessPreviewTargetMergeKey(target) === nextTargetKey,
    ) || normalizedNextTarget
  );
};

const getBusinessPreviewStateFromTarget = (
  target?: BusinessCardPreviewTarget,
): BusinessPreviewState => {
  let enterpriseReviewSourceTarget: ReturnType<
    typeof getEnterpriseCarbonExpertReviewOnlyTarget
  >;

  if (
    target?.type === 'enterpriseCarbonAccounting' ||
    target?.type === 'enterpriseCarbonReport'
  ) {
    enterpriseReviewSourceTarget =
      getEnterpriseCarbonExpertReviewOnlyTarget(target);
  }

  const normalizedTarget = normalizeBusinessPreviewTarget(target);
  const tabTargets: BusinessCardPreviewTabTargets = {};
  const targets: BusinessCardPreviewTarget[] = [];

  if (normalizedTarget?.type) {
    tabTargets[normalizedTarget.type] = normalizedTarget;
    targets.push(normalizedTarget);
  }

  if (
    normalizedTarget?.type === 'enterpriseCarbonAccounting' ||
    normalizedTarget?.type === 'enterpriseCarbonReport'
  ) {
    if (!enterpriseReviewSourceTarget) {
      enterpriseReviewSourceTarget =
        getEnterpriseCarbonExpertReviewOnlyTarget(normalizedTarget);
    }

    const enterpriseReviewTarget = normalizeBusinessPreviewTarget(
      enterpriseReviewSourceTarget,
    );

    if (enterpriseReviewTarget) {
      tabTargets.enterpriseCarbonExpertReview = enterpriseReviewTarget;
      targets.push(enterpriseReviewTarget);
    }

    return {
      tabTargets,
      target: normalizedTarget,
      targets,
    };
  }

  if (normalizedTarget && normalizedTarget.type !== 'expertReview') {
    const reviewDetail = getBusinessPreviewExpertReviewDetail(normalizedTarget);
    const expertReviewTarget = normalizeBusinessPreviewTarget(
      reviewDetail
        ? {
            ...normalizedTarget,
            reviewDetail,
            reviewDetails: [reviewDetail],
            type: 'expertReview',
          }
        : undefined,
    );

    if (expertReviewTarget) {
      tabTargets.expertReview = expertReviewTarget;
      targets.push(expertReviewTarget);
    }
  }

  return {
    tabTargets,
    target: normalizedTarget,
    targets,
  };
};

const mergeBusinessPreviewStates = (
  primaryState: BusinessPreviewState,
  fallbackState: BusinessPreviewState,
): BusinessPreviewState => ({
  tabTargets: {
    ...fallbackState.tabTargets,
    ...primaryState.tabTargets,
  },
  target: primaryState.target || fallbackState.target,
  targets: mergeBusinessPreviewTargets(
    ...fallbackState.targets,
    ...primaryState.targets,
  ),
});

const isCbamDetailPreview = (target?: BusinessCardPreviewTarget) =>
  target?.type === 'cbamReport' ||
  target?.type === 'cbamMonitor' ||
  target?.type === 'cbamOperationReport' ||
  Boolean(target?.reportKind);

// CBAM 详情尚未接入分享授权，三类业务统一只分享会话内容。
const excludeCbamDetailPreview = (
  previewState: BusinessPreviewState,
): BusinessPreviewState => {
  const tabTargets = { ...previewState.tabTargets };
  const targets = previewState.targets.filter(
    target => !isCbamDetailPreview(target) && target.type !== 'carbonLabel',
  );
  let { target } = previewState;

  delete tabTargets.cbamReport;
  delete tabTargets.cbamMonitor;
  delete tabTargets.cbamOperationReport;
  delete tabTargets.carbonLabel;

  if (isCbamDetailPreview(target) || target?.type === 'carbonLabel') {
    const [lastTarget] = targets.slice(-1);

    target = lastTarget;
  }

  return {
    tabTargets,
    target,
    targets,
  };
};

const scopeBusinessPreviewStateToSearchAccount = (
  previewState: BusinessPreviewState,
  searchPreviewState: BusinessPreviewState,
): BusinessPreviewState => {
  const searchTarget = searchPreviewState.target;

  if (searchTarget?.type !== 'account') {
    return previewState;
  }

  const searchAccountId = getBusinessPreviewTargetAccountId(searchTarget);

  if (!searchAccountId) {
    return previewState;
  }

  const matchesSearchAccount = (target?: BusinessCardPreviewTarget) => {
    const targetAccountId = getBusinessPreviewTargetAccountId(target);

    return !targetAccountId || targetAccountId === searchAccountId;
  };
  const tabTargets = Object.values(previewState.tabTargets).reduce(
    (scopedTargets, target) => {
      if (target?.type && matchesSearchAccount(target)) {
        scopedTargets[target.type] = target;
      }

      return scopedTargets;
    },
    {} as BusinessCardPreviewTabTargets,
  );

  return {
    tabTargets,
    target: matchesSearchAccount(previewState.target)
      ? previewState.target
      : undefined,
    targets: previewState.targets.filter(matchesSearchAccount),
  };
};

const applyBusinessPreviewPreferredTab = (
  previewState: BusinessPreviewState,
  preferredType?: NonNullable<BusinessCardPreviewTarget['type']>,
): BusinessPreviewState => {
  if (!preferredType) {
    return previewState;
  }

  const preferredTarget = previewState.tabTargets[preferredType];

  if (!preferredTarget) {
    return previewState;
  }

  return {
    ...previewState,
    target: preferredTarget,
  };
};

const getBusinessPreviewStateFromMessages = (
  messages: AgentConversationMessage[],
  {
    includeWorkspaceToolCalls = true,
  }: { includeWorkspaceToolCalls?: boolean } = {},
): BusinessPreviewState => {
  const previewState: BusinessPreviewState = {
    tabTargets: {},
    targets: [],
  };

  messages.forEach(message => {
    message.cards.forEach(card => {
      const cardTarget = getBusinessCardPreviewTarget(card);
      const target = normalizeBusinessPreviewTarget(
        cardTarget
          ? {
              ...cardTarget,
              refreshKey: getBusinessCardPreviewOpenKey(card, cardTarget),
            }
          : undefined,
      );

      if (!target?.type) {
        return;
      }

      previewState.tabTargets[target.type] = target;
      previewState.target = target;
      previewState.targets = mergeBusinessPreviewTargets(
        ...previewState.targets,
        target,
      );

      if (
        target.type === 'enterpriseCarbonAccounting' ||
        target.type === 'enterpriseCarbonReport'
      ) {
        const enterpriseReviewTarget = normalizeBusinessPreviewTarget(
          getEnterpriseCarbonExpertReviewOnlyTarget(target),
        );

        if (enterpriseReviewTarget) {
          previewState.tabTargets.enterpriseCarbonExpertReview =
            enterpriseReviewTarget;
          previewState.targets = mergeBusinessPreviewTargets(
            ...previewState.targets,
            enterpriseReviewTarget,
          );
        }
      }
    });

    message.toolCalls.forEach(toolCall => {
      const target = normalizeBusinessPreviewTarget(
        getCbamOperationReportToolCallPreviewTarget(toolCall) ||
          getCbamMonitorToolCallPreviewTarget(toolCall) ||
          (includeWorkspaceToolCalls
            ? getWorkspaceLiveSessionPreviewTarget(toolCall)
            : undefined),
      );

      if (!target?.type) {
        return;
      }

      previewState.tabTargets[target.type] = target;
      previewState.target = target;
      previewState.targets = mergeBusinessPreviewTargets(
        ...previewState.targets,
        target,
      );
    });
  });

  return previewState;
};

const getBusinessPreviewStateFromBusinessRefs = (
  businessRefs: unknown,
): BusinessPreviewState => {
  const refsRecord = asRecord(businessRefs);
  const directRefs = Array.isArray(businessRefs) ? businessRefs : [];
  const itemRefs = Array.isArray(refsRecord.items) ? refsRecord.items : [];
  const accountRefs = Array.isArray(refsRecord.accounts)
    ? refsRecord.accounts
    : [];
  const reportRefs = Array.isArray(refsRecord.reports)
    ? refsRecord.reports
    : [];
  const previewState: BusinessPreviewState = {
    tabTargets: {},
    targets: [],
  };

  [...directRefs, ...itemRefs, ...reportRefs, ...accountRefs].forEach(
    businessRef => {
      const target = normalizeBusinessPreviewTarget(
        getBusinessRefPreviewTarget(businessRef),
      );

      if (!target?.type) {
        return;
      }

      previewState.tabTargets[target.type] = target;
      previewState.target = target;
      previewState.targets = mergeBusinessPreviewTargets(
        ...previewState.targets,
        target,
      );
    },
  );

  return previewState;
};

const getShareBusinessRefs = (businessRefs: unknown) => {
  const refsRecord = asRecord(businessRefs);
  const directRefs = Array.isArray(businessRefs) ? businessRefs : [];
  const itemRefs = Array.isArray(refsRecord.items) ? refsRecord.items : [];
  const accountRefs = Array.isArray(refsRecord.accounts)
    ? refsRecord.accounts
    : [];
  const reportRefs = Array.isArray(refsRecord.reports)
    ? refsRecord.reports
    : [];

  return [...directRefs, ...itemRefs, ...reportRefs, ...accountRefs];
};

const getEnterpriseCarbonShareReportTarget = (
  businessRef: unknown,
): BusinessCardPreviewTarget | undefined => {
  const refRecord = asRecord(businessRef);
  const data = asRecord(refRecord.data);
  const bizRef = asRecord(refRecord.bizRef);
  const summary = asRecord(refRecord.summary);
  const records = [data, bizRef, summary, refRecord];

  if (getEnterpriseCarbonBusinessKind(records) !== 'report') {
    return undefined;
  }

  const reportId = getEnterpriseCarbonBusinessId(records);

  return {
    enterpriseCarbonBizId: reportId,
    reportId,
    type: 'enterpriseCarbonReport',
    year: getEnterpriseCarbonReportYear(records),
  };
};

const getShareBusinessRefsForHydration = (businessRefs: unknown) => {
  const refs = getShareBusinessRefs(businessRefs);
  const reportCandidates = refs.flatMap((businessRef, sourceIndex) => {
    const target = getEnterpriseCarbonShareReportTarget(businessRef);

    return target ? [{ ...target, businessRef, sourceIndex }] : [];
  });
  const defaultReportCandidates =
    getLastEnterpriseCarbonReportTargetsByYear(reportCandidates);
  const selectedReportIndexById = new Map<string, number>();
  const selectedReportIndexes = new Set<number>();

  defaultReportCandidates.forEach(candidate => {
    const reportId =
      getScalarValue(candidate.enterpriseCarbonBizId) ||
      getScalarValue(candidate.reportId);

    if (reportId) {
      const previousIndex = selectedReportIndexById.get(reportId);

      if (previousIndex !== undefined) {
        selectedReportIndexes.delete(previousIndex);
      }

      selectedReportIndexById.set(reportId, candidate.sourceIndex);
    }

    selectedReportIndexes.add(candidate.sourceIndex);
  });

  return refs.filter((businessRef, sourceIndex) => {
    const target = getEnterpriseCarbonShareReportTarget(businessRef);

    return !target || selectedReportIndexes.has(sourceIndex);
  });
};

const hydrateEnterpriseCarbonShareBusinessRef = async (
  businessRef: unknown,
  shareId: string,
  signal: AbortSignal,
) => {
  const refRecord = asRecord(businessRef);
  const data = asRecord(refRecord.data);
  const bizRef = asRecord(refRecord.bizRef);
  const summary = asRecord(refRecord.summary);
  const records = [data, bizRef, summary, refRecord];

  if (getEnterpriseCarbonBusinessKind(records) !== 'report') {
    return businessRef;
  }

  const existingFiles = getReadyEnterpriseCarbonReportFiles(
    getEnterpriseCarbonReportFiles(records),
  );

  if (existingFiles.length) {
    return businessRef;
  }

  const bizId = getEnterpriseCarbonBusinessId(records);

  if (!bizId) {
    return businessRef;
  }

  try {
    const detail = await fetchAgentShareBusinessDetail(
      {
        bizId,
        bizType: 'report',
        module: ENTERPRISE_CARBON_MODULE,
        shareId,
      },
      signal,
    );

    return {
      ...refRecord,
      data: {
        ...data,
        ...detail.detail,
        files: detail.files,
      },
    };
  } catch {
    return businessRef;
  }
};

const getBusinessPreviewStateFromShareBusinessRefs = async (
  businessRefs: unknown,
  shareId: string,
  signal: AbortSignal,
) => {
  const hydratedRefs = await Promise.all(
    getShareBusinessRefsForHydration(businessRefs).map(businessRef =>
      hydrateEnterpriseCarbonShareBusinessRef(businessRef, shareId, signal),
    ),
  );

  return getBusinessPreviewStateFromBusinessRefs(hydratedRefs);
};

const getBusinessPreviewStateFromSession = (
  session?: AgentConversation | null,
): BusinessPreviewState => {
  const sessionModule = getScalarValue(session?.module).toLowerCase();
  if (
    /^cbam2?$/.test(sessionModule) &&
    /^(operation|operator)[_-]?report$/.test(
      getScalarValue(session?.bizType).toLowerCase(),
    )
  ) {
    return getBusinessPreviewStateFromTarget({
      type: 'cbamOperationReport',
      operationId: getScalarValue(session?.bizId),
      title: I18N.cbamOperationReport.operationReport,
    });
  }
  if (
    /^cbam2?$/.test(sessionModule) &&
    getScalarValue(session?.bizType) === 'monitor_plan'
  ) {
    return getBusinessPreviewStateFromTarget({
      type: 'cbamMonitor',
      planId: getScalarValue(session?.bizId),
      title: I18N.cbamMonitor.monitorManagement,
    });
  }
  const cbamId = session
    ? getScalarValue(session.cbamId) ||
      (/^cbam2?$/.test(sessionModule) ? getScalarValue(session.bizId) : '')
    : '';
  const sessionPreviewState = getBusinessPreviewStateFromTarget(
    session
      ? {
          bizId: session.bizId,
          bizRef: session.bizRef,
          bizType: session.bizType,
          module: session.module,
          title: session.title,
        }
      : undefined,
  );

  if (!cbamId) {
    return sessionPreviewState;
  }

  const cbamPreviewState = getBusinessPreviewStateFromTarget({
    cbamId,
    title: I18N.cbam.cbamNews,
    type: 'cbamReport',
  });

  return {
    tabTargets: {
      ...sessionPreviewState.tabTargets,
      ...cbamPreviewState.tabTargets,
    },
    target: cbamPreviewState.target || sessionPreviewState.target,
    targets: mergeBusinessPreviewTargets(
      ...sessionPreviewState.targets,
      ...cbamPreviewState.targets,
    ),
  };
};

const getBusinessPreviewStateFromSearch = (
  search: string,
): BusinessPreviewState => {
  const searchParams = new URLSearchParams(search);
  const previewType = searchParams.get(BUSINESS_PREVIEW_TYPE_QUERY_KEY);

  return getBusinessPreviewStateFromTarget({
    accountId:
      searchParams.get(BUSINESS_PREVIEW_ACCOUNT_ID_QUERY_KEY) || undefined,
    productId:
      searchParams.get(BUSINESS_PREVIEW_PRODUCT_ID_QUERY_KEY) || undefined,
    shareAuth:
      searchParams.get(BUSINESS_PREVIEW_SHARE_AUTH_QUERY_KEY) || undefined,
    reportName:
      searchParams.get(BUSINESS_PREVIEW_REPORT_NAME_QUERY_KEY) || undefined,
    reportId:
      searchParams.get(BUSINESS_PREVIEW_REPORT_ID_QUERY_KEY) || undefined,
    reportUrl:
      searchParams.get(BUSINESS_PREVIEW_REPORT_URL_QUERY_KEY) || undefined,
    certificationAuthType: normalizeCertificationApplyAuthType(
      searchParams.get(BUSINESS_PREVIEW_CERTIFICATION_AUTH_TYPE_QUERY_KEY),
    ),
    certificationStatus:
      searchParams.get(BUSINESS_PREVIEW_CERTIFICATION_STATUS_QUERY_KEY) ||
      undefined,
    certificationStatusName:
      searchParams.get(BUSINESS_PREVIEW_CERTIFICATION_STATUS_NAME_QUERY_KEY) ||
      undefined,
    expertReviewId:
      searchParams.get(BUSINESS_PREVIEW_EXPERT_REVIEW_ID_QUERY_KEY) ||
      undefined,
    expertReviewNo:
      searchParams.get(BUSINESS_PREVIEW_EXPERT_REVIEW_NO_QUERY_KEY) ||
      undefined,
    expertReviewStatus:
      searchParams.get(BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_QUERY_KEY) ||
      undefined,
    expertReviewStatusName:
      searchParams.get(BUSINESS_PREVIEW_EXPERT_REVIEW_STATUS_NAME_QUERY_KEY) ||
      undefined,
    type:
      previewType === 'account' ||
      previewType === 'certification' ||
      previewType === 'report'
        ? previewType
        : undefined,
  });
};

const getExpertReviewStatusParams = (
  target?: BusinessCardPreviewTarget,
): AgentExpertReviewStatusParams | undefined => {
  if (!target) {
    return undefined;
  }

  const accountId = getScalarValue(target.accountId);
  const reportId =
    getScalarValue(target.reportId) ||
    getScalarValue(target.reviewDetail?.reportId);
  const isReportReview =
    target.type === 'report' ||
    target.reviewDetail?.objectType === 'report' ||
    Boolean(reportId && !accountId);

  if (isReportReview) {
    if (!accountId && !reportId) {
      return undefined;
    }

    return {
      accountId: accountId || undefined,
      objectType: 'report',
      reportId: reportId || undefined,
    };
  }

  if (!accountId) {
    return undefined;
  }

  return {
    accountId,
    objectType: 'account',
  };
};

const getExpertReviewListParams = (
  statusParams?: AgentExpertReviewStatusParams,
) => {
  if (!statusParams) {
    return undefined;
  }

  return {
    accountId: statusParams.accountId,
    reportId: statusParams.reportId,
  };
};

const formatExpertReviewPrepareTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.replace(/-/g, '.');
  }

  const padTime = (timeValue: number) => String(timeValue).padStart(2, '0');

  return [
    [
      date.getFullYear(),
      padTime(date.getMonth() + 1),
      padTime(date.getDate()),
    ].join('.'),
    [
      padTime(date.getHours()),
      padTime(date.getMinutes()),
      padTime(date.getSeconds()),
    ].join(':'),
  ].join(' ');
};

const getPreparedReviewObjectType = (
  prepareInfo?: AgentExpertReviewPrepareInfo | null,
  fallbackObjectType: AgentExpertReviewObjectType = 'account',
): AgentExpertReviewObjectType => {
  const objectType = prepareInfo?.objectType;

  if (
    objectType === 'account' ||
    objectType === 'account_report' ||
    objectType === 'model_report' ||
    objectType === 'report'
  ) {
    return objectType;
  }

  return fallbackObjectType;
};

const getSubmittedExpertReviewFallbackDetail = ({
  accountId,
  objectType,
  prepareInfo,
  reportId,
}: {
  accountId?: number | string;
  objectType: AgentExpertReviewObjectType;
  prepareInfo?: AgentExpertReviewPrepareInfo | null;
  reportId?: number | string;
}): AgentExpertReviewStatus => ({
  accountId:
    prepareInfo?.status?.accountId || prepareInfo?.accountId || accountId,
  accountName: prepareInfo?.accountName,
  emissionUnit: prepareInfo?.emissionUnit,
  functionalUnit: prepareInfo?.functionalUnit,
  objectType,
  pointCost: prepareInfo?.pointCost,
  productName: prepareInfo?.productName,
  reportId: prepareInfo?.status?.reportId || prepareInfo?.reportId || reportId,
  status: AGENT_EXPERT_REVIEW_STATUS.PENDING_REVIEW,
  statusName: I18N.carbonAgent.expertReviewStatusPending,
  totalEmission: prepareInfo?.totalEmission,
});

const getBusinessPreviewPreferredTypeFromSearch = (
  search: string,
): NonNullable<BusinessCardPreviewTarget['type']> | undefined => {
  const previewType = new URLSearchParams(search).get(
    BUSINESS_PREVIEW_TYPE_QUERY_KEY,
  );

  return previewType === 'account' ||
    previewType === 'certification' ||
    previewType === 'enterpriseCarbonAccounting' ||
    previewType === 'enterpriseCarbonReport' ||
    previewType === 'report'
    ? previewType
    : undefined;
};

const isFormRequestCard = (card: AgentMessageCard) =>
  card.cardType === 'form_request' ||
  getScalarValue(asRecord(card.card).eventType) === 'form_request';

const isActionRequestCard = (card: AgentMessageCard) =>
  card.cardType === 'action_request' ||
  getScalarValue(asRecord(card.card).eventType) === 'action_request';

const markActionRequestCardCollapsed = (card: AgentMessageCard) =>
  isActionRequestCard(card)
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
  isFormRequestCard(card) && !isAccountingPurposeCard(card)
    ? {
        ...card,
        card: {
          ...card.card,
          collapsed: true,
          formSubmitted: true,
        },
      }
    : card;

const markSubmittedRequestCards = ({
  cards,
  collapseActionRequests,
  collapseFormRequests,
}: {
  cards: AgentMessageCard[];
  collapseActionRequests: boolean;
  collapseFormRequests: boolean;
}) =>
  cards.map(card => {
    const formCollapsed = collapseFormRequests
      ? markFormRequestCardCollapsed(card)
      : card;

    return collapseActionRequests
      ? markActionRequestCardCollapsed(formCollapsed)
      : formCollapsed;
  });

const shouldCollapseFormRequestsForSubmission = (
  requestPayload?: Record<string, unknown>,
) => {
  const action = getScalarValue(requestPayload?.action);

  return action === 'form_submit' || action === 'form_cancel';
};

const shouldCollapseActionRequestsForSubmission = (
  requestPayload?: Record<string, unknown>,
) => {
  if (!requestPayload) {
    return false;
  }

  const action = getScalarValue(requestPayload.action);
  const message = getScalarValue(requestPayload.message);
  const signal = `${action} ${message}`;

  return (
    /approve_action_request|reject_action_request|approve|reject|confirm|cancel|确认|执行|拒绝|取消/i.test(
      signal,
    ) &&
    Boolean(
      requestPayload.resumeData ||
        requestPayload.resumeEventId ||
        requestPayload.checkpoint,
    )
  );
};

const getSessionIdFromSearch = (search: string) =>
  new URLSearchParams(search).get(SESSION_ID_QUERY_KEY) || '';

const getSubmissionDisplayMessage = (submission: ConversationSubmission) => {
  if (typeof submission === 'string') {
    return submission.trim();
  }

  const { action, displayMessage, message } = submission;

  if (typeof displayMessage === 'string' && displayMessage.trim()) {
    return displayMessage.trim();
  }

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return typeof action === 'string' && action.trim()
    ? action.trim()
    : I18N.carbonAgent.continueAction;
};

const getAttachmentSubmitMessage = (attachments: AgentChatAttachment[]) =>
  attachments.length
    ? I18N.template(I18N.carbonAgent.analyzeUploadedFiles, {
        val1: attachments.map(attachment => attachment.name).join('、'),
      })
    : '';

const limitComposerMessage = (nextMessage: string) =>
  nextMessage.slice(0, AGENT_COMPOSER_MESSAGE_MAX_LENGTH);

const normalizeComposerQuote = (quote: string) =>
  quote.replace(/\s+/g, ' ').trim().slice(0, MAX_COMPOSER_QUOTE_LENGTH);

const normalizeComposerReference = (
  reference: AgentMessageReference | string,
): AgentMessageReference | undefined => {
  const content = normalizeComposerQuote(
    typeof reference === 'string' ? reference : reference.content,
  );

  if (!content) {
    return undefined;
  }

  if (typeof reference === 'string') {
    return {
      content,
      type: 'message',
    };
  }

  return {
    blockId: reference.blockId?.trim() || undefined,
    content,
    sourceMessageId: reference.sourceMessageId?.trim() || undefined,
    type: 'message',
  };
};

const getComposerReferenceKey = (reference: AgentMessageReference) =>
  [reference.sourceMessageId || '', reference.blockId || '', reference.content]
    .filter(Boolean)
    .join('|');

const getComposerReferenceContents = (references: AgentMessageReference[]) =>
  references.map(reference => reference.content);

const getComposerReferencePayload = (
  references: AgentMessageReference[],
): AgentMessageReference[] =>
  references.map((reference, index) => ({
    ...reference,
    referenceId: `ref_${String(index + 1).padStart(3, '0')}`,
    title: I18N.template(I18N.carbonAgent.referenceContentTitle, {
      val1: index + 1,
    }),
    type: 'message',
  }));

const getQuotedComposerSubmitMessage = (message: string, quotes: string[]) => {
  const trimmedMessage = message.trim();
  const trimmedQuotes = quotes.map(normalizeComposerQuote).filter(Boolean);

  if (!trimmedQuotes.length) {
    return message;
  }

  const quoteMessage = [
    I18N.carbonAgent.quoteContentLabel,
    ...trimmedQuotes.map((quote, index) =>
      trimmedQuotes.length > 1 ? `${index + 1}. ${quote}` : quote,
    ),
  ].join('\n');

  return trimmedMessage ? `${quoteMessage}\n\n${trimmedMessage}` : quoteMessage;
};

const getFileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase() || '';

const getNormalizedAttachmentName = (fileName: string) =>
  fileName.trim().toLowerCase();

const hasTransferFiles = (dataTransfer: DataTransfer | null) =>
  Boolean(
    dataTransfer &&
      Array.from(dataTransfer.types || []).includes(DATA_TRANSFER_FILE_TYPE),
  );

const getFilesFromDataTransfer = (dataTransfer: DataTransfer | null) =>
  dataTransfer ? Array.from(dataTransfer.files || []) : [];

const getPastedFileName = (file: File, index: number) => {
  const extension =
    CLIPBOARD_EXTENSION_BY_MIME_TYPE[file.type] ||
    getFileExtension(file.name) ||
    'file';

  return `pasted-file-${Date.now()}-${index + 1}.${extension}`;
};

const normalizePastedFile = (file: File, index: number) => {
  if (getNormalizedAttachmentName(file.name)) {
    return file;
  }

  try {
    return new File([file], getPastedFileName(file, index), {
      lastModified: file.lastModified,
      type: file.type,
    });
  } catch {
    return file;
  }
};

const getFilesFromClipboardData = (clipboardData: DataTransfer | null) => {
  if (!clipboardData) {
    return [];
  }

  const itemFiles = Array.from(clipboardData.items || [])
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile())
    .filter((file): file is File => Boolean(file))
    .map(normalizePastedFile);

  if (itemFiles.length) {
    return itemFiles;
  }

  return Array.from(clipboardData.files || []).map(normalizePastedFile);
};

const isAcceptedAttachment = (file: File) =>
  ACCEPTED_ATTACHMENT_EXTENSIONS.has(getFileExtension(file.name));

const normalizeChatAttachments = (
  attachments: AgentComposerAttachment[],
): AgentChatAttachment[] =>
  attachments
    .filter(
      attachment => attachment.status === 'done' && Boolean(attachment.fileId),
    )
    .map(attachment => ({
      assetId: attachment.assetId,
      fileId: attachment.fileId,
      name: attachment.name,
      projectId: attachment.projectId,
      sessionId: attachment.sessionId,
      size: attachment.size,
      type: attachment.type,
      url: attachment.url,
    }));

const getAttachmentFilePayload = (
  attachments: AgentChatAttachment[],
): AgentFilePayload[] =>
  attachments.flatMap(attachment =>
    attachment.fileId ? [{ fileId: attachment.fileId }] : [],
  );

const normalizeSubmissionAttachments = (
  payload?: Record<string, unknown>,
): AgentChatAttachment[] => {
  const rawAttachments =
    (Array.isArray(payload?.attachments) && payload?.attachments) ||
    (Array.isArray(payload?.fileList) && payload?.fileList) ||
    (Array.isArray(payload?.files) && payload?.files) ||
    [];

  return rawAttachments.flatMap(attachment => {
    const attachmentRecord = asRecord(attachment);
    const fileId =
      getScalarValue(attachmentRecord.fileId) ||
      getScalarValue(attachmentRecord.id);
    const sessionId = getScalarValue(attachmentRecord.sessionId);
    const name =
      getScalarValue(attachmentRecord.name) ||
      getScalarValue(attachmentRecord.filename) ||
      getScalarValue(attachmentRecord.fileName) ||
      fileId;
    const url =
      getScalarValue(attachmentRecord.url) ||
      getScalarValue(attachmentRecord.downloadUrl) ||
      getScalarValue(attachmentRecord.fileUrl);

    if (!name && !fileId) {
      return [];
    }

    const size = Number(attachmentRecord.size);
    const type =
      getScalarValue(attachmentRecord.type) ||
      getScalarValue(attachmentRecord.mime);
    const normalizedAttachment: AgentChatAttachment = {
      name,
    };

    if (fileId) {
      normalizedAttachment.fileId = fileId;
    }

    if (sessionId) {
      normalizedAttachment.sessionId = sessionId;
    }

    if (Number.isFinite(size)) {
      normalizedAttachment.size = size;
    }

    if (type) {
      normalizedAttachment.type = type;
    }

    if (url) {
      normalizedAttachment.url = url;
    }

    return [normalizedAttachment];
  });
};

const normalizeOutgoingFiles = (files: unknown): AgentFilePayload[] =>
  Array.isArray(files)
    ? files.flatMap(file => {
        const fileRecord = asRecord(file);
        const fileId =
          getScalarValue(fileRecord.fileId) ||
          getScalarValue(fileRecord.id) ||
          getScalarValue(file);

        return fileId ? [{ fileId }] : [];
      })
    : [];

const buildAgentChatRequestPayload = (
  payload?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!payload) {
    return undefined;
  }

  const requestPayload = { ...payload };

  delete requestPayload.displayMessage;

  const { attachments, fileList, files, ...rest } = requestPayload;

  const hasUiAttachmentPayload =
    Array.isArray(attachments) || Array.isArray(fileList);

  if (!Array.isArray(files)) {
    return hasUiAttachmentPayload ? rest : payload;
  }

  const outgoingFiles = normalizeOutgoingFiles(files);

  if (!hasUiAttachmentPayload && outgoingFiles.length !== files.length) {
    return payload;
  }

  return outgoingFiles.length ? { ...rest, files: outgoingFiles } : rest;
};

const buildAgentProjectSessionCreatePayload = (
  requestPayload?: Record<string, unknown>,
): CreateAgentProjectSessionPayload => {
  const quickSkill = getScalarValue(requestPayload?.quickSkill);

  return {
    entry: 'agent_home',
    // The existing message stream sends the first message after session creation.
    message: '',
    pageContext: {
      page: 'project_home',
    },
    ...(quickSkill ? { quickSkill } : {}),
  };
};

const IOS_DEVICE_PATTERN = /iP(ad|hone|od)/i;

const isIOSLikeBrowser = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return (
    IOS_DEVICE_PATTERN.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const prepareAgentFileDownloadWindow = () => {
  if (typeof window === 'undefined' || !isIOSLikeBrowser()) {
    return undefined;
  }

  const downloadWindow = window.open('', '_blank');

  if (!downloadWindow) {
    return undefined;
  }

  const { document: downloadDocument } = downloadWindow;
  const messageNode = downloadDocument.createElement('p');

  downloadDocument.title = I18N.carbonAgent.mdDownloadFile;
  downloadDocument.body.style.margin = '24px';
  downloadDocument.body.style.fontFamily =
    'PingFang SC, Microsoft YaHei, Arial, sans-serif';
  messageNode.textContent = I18N.carbonAgent.fetchingDownloadLink;
  downloadDocument.body.appendChild(messageNode);

  return downloadWindow;
};

const closePreparedAgentFileDownloadWindow = (
  downloadWindow?: Window | null,
) => {
  if (downloadWindow && !downloadWindow.closed) {
    downloadWindow.close();
  }
};

const triggerAgentFileDownload = ({
  downloadWindow,
  filename,
  url,
}: {
  downloadWindow?: Window | null;
  filename?: string;
  url: string;
}) => {
  if (downloadWindow && !downloadWindow.closed) {
    downloadWindow.location.href = url;
    return;
  }

  if (typeof window !== 'undefined' && isIOSLikeBrowser()) {
    window.location.href = url;
    return;
  }

  saveAs(url, filename);
};

const waitForAgentMessageRecoverPoll = (
  delayMs: number,
  signal?: AbortSignal,
) =>
  new Promise<void>(resolve => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timer = window.setTimeout(resolve, delayMs);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });

const normalizeAgentMessageRecoverStatus = (
  result?: AgentMessageRecoverResult,
) =>
  String(result?.status || '')
    .trim()
    .toUpperCase();

const getSectionFromSearch = (search: string) =>
  new URLSearchParams(search).get(SECTION_QUERY_KEY) || '';

const getProjectSessionProjectIdFromSearch = (search: string) =>
  new URLSearchParams(search)
    .get(PROJECT_SESSION_PROJECT_ID_QUERY_KEY)
    ?.trim() || '';

const getProjectInviteCodeFromSearch = (search: string) =>
  new URLSearchParams(search)
    .get(CARBON_AGENT_PROJECT_INVITE_QUERY_KEY)
    ?.trim() || '';

const getAgentSectionFromSearch = (search: string): AgentSectionKey => {
  const section = getSectionFromSearch(search);

  if (
    section === ACCOUNTING_SECTION_QUERY_VALUE ||
    section === ENTERPRISE_CARBON_SECTION_QUERY_VALUE ||
    section === HISTORY_SECTION_QUERY_VALUE ||
    section === ISSUE_FEEDBACK_SECTION_QUERY_VALUE ||
    section === CBAM_FILES_SECTION_QUERY_VALUE ||
    section === 'factorLibrary' ||
    isEnterpriseSection(section)
  ) {
    return section as AgentSectionKey;
  }

  if (
    [
      'project:',
      'projectComparison:',
      'projectFiles:',
      'projectOverview:',
      'projectTasks:',
    ].some(
      prefix => section.startsWith(prefix) && section.length > prefix.length,
    )
  ) {
    return section as AgentSectionKey;
  }

  return 'newChat';
};

const getSearchWithSessionId = (
  search: string,
  sessionId?: string,
  projectId?: string,
) => {
  const searchParams = new URLSearchParams(search);
  clearEnterpriseNavigationParams(searchParams);

  BUSINESS_PREVIEW_QUERY_KEYS.forEach(key => searchParams.delete(key));
  clearIssueFeedbackNavigationParams(searchParams);

  if (sessionId) {
    searchParams.set(SESSION_ID_QUERY_KEY, sessionId);
    searchParams.delete(SECTION_QUERY_KEY);
    if (projectId) {
      searchParams.set(PROJECT_SESSION_PROJECT_ID_QUERY_KEY, projectId);
    } else {
      searchParams.delete(PROJECT_SESSION_PROJECT_ID_QUERY_KEY);
    }
  } else {
    searchParams.delete(SESSION_ID_QUERY_KEY);
    searchParams.delete(PROJECT_SESSION_PROJECT_ID_QUERY_KEY);
    searchParams.delete(SECTION_QUERY_KEY);
  }

  const nextSearch = searchParams.toString();

  return nextSearch ? `?${nextSearch}` : '';
};

const getSearchWithSection = (search: string, section: AgentSectionKey) => {
  const searchParams = new URLSearchParams(search);
  if (!isEnterpriseSection(section)) {
    clearEnterpriseNavigationParams(searchParams);
  }
  searchParams.delete(SESSION_ID_QUERY_KEY);
  searchParams.delete(PROJECT_SESSION_PROJECT_ID_QUERY_KEY);
  searchParams.delete(CARBON_AGENT_PROJECT_INVITE_QUERY_KEY);

  if (section !== 'issueFeedback') {
    clearIssueFeedbackNavigationParams(searchParams);
  }

  searchParams.set(SECTION_QUERY_KEY, section);

  const nextSearch = searchParams.toString();

  return nextSearch ? `?${nextSearch}` : '';
};

const getSearchWithoutProjectInviteCode = (search: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(CARBON_AGENT_PROJECT_INVITE_QUERY_KEY);
  const nextSearch = searchParams.toString();

  return nextSearch ? `?${nextSearch}` : '';
};

const getSearchWithoutSessionId = (search: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(SESSION_ID_QUERY_KEY);
  searchParams.delete(PROJECT_SESSION_PROJECT_ID_QUERY_KEY);

  const nextSearch = searchParams.toString();

  return nextSearch ? `?${nextSearch}` : '';
};

const getFallbackAgentShareUrl = (shareId?: string) =>
  shareId ? `${window.location.origin}/share/agent/${shareId}` : '';

const replaceUrlSearch = ({
  history,
  location,
  nextSearch,
}: {
  history: CarbonAgentHistory;
  location: CarbonAgentLocation;
  nextSearch: string;
}) => {
  if (nextSearch === location.search) {
    return;
  }

  history.replace({
    hash: location.hash,
    pathname: location.pathname,
    search: nextSearch,
    state: location.state,
  });
};

const syncSessionIdToUrl = ({
  history,
  location,
  preserveFactorLanding = false,
  projectId,
  sessionId,
}: {
  history: CarbonAgentHistory;
  location: CarbonAgentLocation;
  preserveFactorLanding?: boolean;
  projectId?: string;
  sessionId?: string;
}) => {
  // Sending from a factor landing must keep the mounted page: switching routes
  // runs its cleanup and aborts the newly started chat stream.
  if (location.pathname.startsWith('/factors/') && !preserveFactorLanding) {
    const search = new URLSearchParams(
      getSearchWithSessionId(location.search, sessionId, projectId),
    );
    search.delete('share');
    search.delete('agentInviteCode');
    history.replace({
      pathname: '/system/carbonAgent',
      search: search.toString(),
    });
    return;
  }
  replaceUrlSearch({
    history,
    location,
    nextSearch: getSearchWithSessionId(location.search, sessionId, projectId),
  });
};

const syncSectionToUrl = ({
  history,
  location,
  section,
}: {
  history: CarbonAgentHistory;
  location: CarbonAgentLocation;
  section: AgentSectionKey;
}) => {
  replaceUrlSearch({
    history,
    location,
    nextSearch: getSearchWithSection(location.search, section),
  });
};

const clearSessionIdFromUrl = ({
  history,
  location,
}: {
  history: CarbonAgentHistory;
  location: CarbonAgentLocation;
}) => {
  replaceUrlSearch({
    history,
    location,
    nextSearch: getSearchWithoutSessionId(location.search),
  });
};

const appendMarkdown = (
  blocks: AgentMessageBlock[],
  delta: AgentMessageDelta,
) => {
  const deltaFlowId = delta.flowId || `${delta.messageId}-${delta.blockId}`;
  const blockIndex = blocks.findIndex(
    block =>
      (block.flowId || `${block.messageId}-${block.blockId}`) === deltaFlowId,
  );

  if (blockIndex < 0) {
    return [
      ...blocks,
      {
        blockId: delta.blockId,
        blockType: delta.blockType,
        content: delta.delta,
        flowId: deltaFlowId,
        messageId: delta.messageId,
        orderNo: delta.streamOrderNo ?? delta.orderNo,
        streamOrderNo: delta.streamOrderNo,
      },
    ];
  }

  return blocks.map((block, index) =>
    index === blockIndex
      ? {
          ...block,
          content: `${block.content}${delta.delta}`,
          streamOrderNo: block.streamOrderNo ?? delta.streamOrderNo,
        }
      : block,
  );
};

const removeRepeatedStreamDeltaPrefix = (
  blocks: AgentMessageBlock[],
  delta: AgentMessageDelta,
): AgentMessageDelta | undefined => {
  const deltaFlowId = delta.flowId || `${delta.messageId}-${delta.blockId}`;
  const flowAlreadyStarted = blocks.some(
    block =>
      (block.flowId || `${block.messageId}-${block.blockId}`) === deltaFlowId,
  );

  if (flowAlreadyStarted) {
    return delta;
  }

  const previousContent = blocks
    .filter(
      block =>
        block.messageId === delta.messageId && block.blockId === delta.blockId,
    )
    .map(block => block.content)
    .join('');

  if (!previousContent || !delta.delta) {
    return delta;
  }

  if (
    delta.delta === previousContent ||
    previousContent.startsWith(delta.delta)
  ) {
    return undefined;
  }

  if (delta.delta.startsWith(previousContent)) {
    const nextDelta = delta.delta.slice(previousContent.length);

    return nextDelta ? { ...delta, delta: nextDelta } : undefined;
  }

  return delta;
};

const getCurrentTurnMessages = ({
  answerControls,
  attachments = [],
  blocks,
  cards,
  collapseFormRequests = false,
  collapseActionRequests = false,
  question,
  questionCreateTime,
  referenceCount,
  referenceContents,
  toolCalls,
}: {
  answerControls?: AgentAnswerControls;
  attachments?: AgentChatAttachment[];
  blocks: AgentMessageBlock[];
  cards: AgentMessageCard[];
  collapseActionRequests?: boolean;
  collapseFormRequests?: boolean;
  question: string;
  questionCreateTime?: string;
  referenceCount?: number;
  referenceContents?: string[];
  toolCalls: AgentToolCall[];
}): AgentConversationMessage[] => {
  const messages: AgentConversationMessage[] = [];
  const messageKey = `local_${Date.now()}`;
  const nextCards =
    collapseActionRequests || collapseFormRequests
      ? markSubmittedRequestCards({
          cards,
          collapseActionRequests,
          collapseFormRequests,
        })
      : cards;

  if (question) {
    messages.push({
      attachments,
      blocks: [],
      cards: [],
      content: question,
      createTime: questionCreateTime,
      id: `${messageKey}_user`,
      referenceCount,
      referenceContents,
      role: 'user',
      toolCalls: [],
    });
  }

  if (blocks.length || nextCards.length || toolCalls.length || answerControls) {
    messages.push({
      blocks,
      cards: nextCards,
      content: blocks.map(block => block.content).join(''),
      id: `${messageKey}_assistant`,
      role: 'assistant',
      answerControls,
      toolCalls,
    });
  }

  return messages;
};

const getLatestAssistantTurnId = (messages: AgentConversationMessage[]) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (
      message.role === 'assistant' &&
      message.turnId !== undefined &&
      message.turnId !== null
    ) {
      return message.turnId;
    }
  }

  return undefined;
};

const getToolCallKey = (toolCall: AgentToolCall) =>
  toolCall.toolCallId ||
  toolCall.eventId ||
  `${toolCall.toolName || 'tool'}-${toolCall.sequenceNo || ''}-${
    toolCall.createTime || ''
  }`;

const mergeToolCall = (
  toolCalls: AgentToolCall[],
  nextToolCall: AgentToolCall,
) => {
  const nextKey = getToolCallKey(nextToolCall);
  const existingIndex = toolCalls.findIndex(
    toolCall => getToolCallKey(toolCall) === nextKey,
  );

  if (existingIndex < 0) {
    return [...toolCalls, nextToolCall];
  }

  return toolCalls.map((toolCall, index) =>
    index === existingIndex ? mergeToolEvent(toolCall, nextToolCall) : toolCall,
  );
};

const getInitialSidebarCollapsed = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const persistSidebarCollapsed = (collapsed: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      collapsed ? '1' : '0',
    );
  } catch {
    // localStorage may be unavailable in private mode.
  }
};

const MOBILE_VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content';
const MOBILE_VIEWPORT_HEIGHT_VAR = '--mobile-viewport-height';
const MOBILE_VISUAL_VIEWPORT_HEIGHT_VAR = '--mobile-visual-viewport-height';

const getMobileViewportHeightValue = () => {
  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    window.visualViewport?.height ||
    1;

  return Math.max(1, Math.round(viewportHeight));
};

const isAndroidBrowser = () => /Android/i.test(navigator.userAgent);

const getMobileVisualViewportHeightValue = (isAndroid = false) => {
  const viewportHeight =
    window.visualViewport?.height ||
    window.innerHeight ||
    document.documentElement.clientHeight ||
    1;

  // Android WebViews may resize the layout viewport before VisualViewport updates.
  const visibleHeight = isAndroid
    ? Math.min(viewportHeight, getMobileViewportHeightValue())
    : viewportHeight;

  return Math.max(1, Math.round(visibleHeight));
};

const CarbonAgent = () => {
  const {
    access: workspaceAccess,
    personal: personalWorkspace,
    switchSpace,
  } = useWorkspace();
  const { factorId = '', shareId = '' } = useParams<{
    factorId?: string;
    shareId?: string;
  }>();
  const history = useHistory();
  const location = useLocation();
  const isShareMode = Boolean(shareId);
  const isFactorLandingMode = Boolean(factorId);
  const factorShareId = new URLSearchParams(location.search).get('share') || '';

  useTitle(
    isShareMode
      ? I18N.carbonAgent.sharePageTitle
      : isFactorLandingMode
      ? I18N.ccdb.factorPageTitle
      : I18N.carbonAgent.pageTitle,
  );

  const { locale } = useContext(LocaleContext);
  const lang = serviceLangMap[locale] ?? 'zh';
  const isMobile = useMobile();
  const isAndroid = isMobile && isAndroidBrowser();
  const [authenticated, setAuthenticated] = useState(hasActiveToken);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginTriggerEntry, setLoginTriggerEntry] =
    useState<AgentLoginTriggerEntry>('other');
  const [agentGuideOpen, setAgentGuideOpen] = useState(false);
  const [agentGuideStepIndex, setAgentGuideStepIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [composerQuotes, setComposerQuotes] = useState<AgentMessageReference[]>(
    [],
  );
  const [activeMode, setActiveMode] = useState<ModeKey>('none');
  const [productFootprintScope, setProductFootprintScope] = useState<
    ProductFootprintScopeNode[][]
  >(getDefaultProductFootprintScope);
  const [productFootprintFactorScope, setProductFootprintFactorScope] =
    useState('');
  const [
    productFootprintFactorScopeOptions,
    setProductFootprintFactorScopeOptions,
  ] = useState<ProductFootprintComposerOptions['factorScopeOptions']>([]);
  const [
    productFootprintFactorScopesLoading,
    setProductFootprintFactorScopesLoading,
  ] = useState(false);
  const [productFootprintOpenPill, setProductFootprintOpenPill] =
    useState<ProductFootprintComposerOptions['openPill']>(null);
  const [accountBindStatus, setAccountBindStatus] = useState<AccountBindStatus>(
    DEFAULT_ACCOUNT_BIND_STATUS,
  );
  const [homeSkills, setHomeSkills] = useState<AgentHomeSkill[]>([]);
  const [activeSection, setActiveSection] =
    useState<AgentSectionKey>('newChat');
  const activeProjectId = activeSection.startsWith('project:')
    ? activeSection.slice('project:'.length)
    : '';
  const activeProjectTasksId = activeSection.startsWith('projectTasks:')
    ? activeSection.slice('projectTasks:'.length)
    : '';
  const activeProjectFilesId = activeSection.startsWith('projectFiles:')
    ? activeSection.slice('projectFiles:'.length)
    : '';
  const activeProjectOverviewId = activeSection.startsWith('projectOverview:')
    ? activeSection.slice('projectOverview:'.length)
    : '';
  const activeProjectComparisonId = activeSection.startsWith(
    'projectComparison:',
  )
    ? activeSection.slice('projectComparison:'.length)
    : '';
  const [projectComparisonState, setProjectComparisonState] = useState<{
    accountIds: Array<number | string>;
    calculations: AgentProjectCalculation[];
    comparison: AgentProjectCalculationComparison;
    projectId: string;
  }>();
  const [focusedProjectTaskId, setFocusedProjectTaskId] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    getInitialSidebarCollapsed,
  );
  const [lastSubmittedMessage, setLastSubmittedMessage] = useState('');
  const [conversationStarted, setConversationStarted] = useState(
    isShareMode || isFactorLandingMode,
  );
  const [conversationQuestion, setConversationQuestion] = useState('');
  const [conversationQuestionAttachments, setConversationQuestionAttachments] =
    useState<AgentChatAttachment[]>([]);
  const [conversationQuestionTime, setConversationQuestionTime] = useState('');
  const [
    conversationQuestionReferenceCount,
    setConversationQuestionReferenceCount,
  ] = useState(0);
  const [
    conversationQuestionReferenceContents,
    setConversationQuestionReferenceContents,
  ] = useState<string[]>([]);
  const [createdConversation, setCreatedConversation] =
    useState<AgentConversation | null>(null);
  const [projectConversationProject, setProjectConversationProject] =
    useState<AgentProject>();
  const [
    enterpriseProjectSessionPreviewPermission,
    setEnterpriseProjectSessionPreviewPermission,
  ] = useState<{
    canEditEnterprisePreview: boolean;
    key: string;
  }>();
  const [
    projectConversationBranchCreating,
    setProjectConversationBranchCreating,
  ] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [conversationMessages, setConversationMessages] = useState<
    AgentConversationMessage[]
  >([]);
  const [answerBlocks, setAnswerBlocks] = useState<AgentMessageBlock[]>([]);
  const [answerCards, setAnswerCards] = useState<AgentMessageCard[]>([]);
  const [answerControls, setAnswerControls] = useState<
    AgentAnswerControls | undefined
  >();
  const [answerToolCalls, setAnswerToolCalls] = useState<AgentToolCall[]>([]);
  const [composerAttachments, setComposerAttachments] = useState<
    AgentComposerAttachment[]
  >([]);
  const [fileDropActive, setFileDropActive] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRetryKey, setHistoryRetryKey] = useState(0);
  const [shareRetryKey, setShareRetryKey] = useState(0);
  const [shareCreating, setShareCreating] = useState(false);
  const [shareExpired, setShareExpired] = useState(false);
  const [shareInfo, setShareInfo] = useState<AgentShareInfo | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');
  const [previewOpen, setPreviewOpen] = useState(isFactorLandingMode);
  const [previewTarget, setPreviewTarget] = useState<
    BusinessCardPreviewTarget | undefined
  >();
  const [ccdbFactorTarget, setCcdbFactorTarget] = useState<
    CcdbFactorPreviewTarget | undefined
  >(() =>
    factorId
      ? {
          factorId,
          publicAccess: !authenticated,
          shareId: factorShareId || undefined,
        }
      : undefined,
  );
  const [ccdbFactorDraft, setCcdbFactorDraft] = useState<
    CcdbFactorPreviewTarget | undefined
  >(ccdbFactorTarget);
  const ccdbFactorSubmittedRef = useRef(false);
  const [previewTabTargets, setPreviewTabTargets] =
    useState<BusinessCardPreviewTabTargets>({});
  const [previewTargets, setPreviewTargets] = useState<
    BusinessCardPreviewTarget[]
  >([]);
  const [previewActiveTabRequest, setPreviewActiveTabRequest] =
    useState<PreviewActiveTabRequest>();
  const [
    enterpriseCarbonCertificationRequest,
    setEnterpriseCarbonCertificationRequest,
  ] = useState<EnterpriseCarbonCertificationTarget>();
  const [previewExpertReviewOpen, setPreviewExpertReviewOpen] = useState(false);
  const [
    previewThirdPartyCertificationOpen,
    setPreviewThirdPartyCertificationOpen,
  ] = useState(false);
  const [previewReviewPurpose, setPreviewReviewPurpose] = useState('');
  const [previewReviewPrepareInfo, setPreviewReviewPrepareInfo] =
    useState<AgentExpertReviewPrepareInfo | null>(null);
  const [previewReviewPreparing, setPreviewReviewPreparing] = useState(false);
  const [previewCertificationChecking, setPreviewCertificationChecking] =
    useState(false);
  const [
    previewEnterpriseCarbonCertificationChecking,
    setPreviewEnterpriseCarbonCertificationChecking,
  ] = useState(false);
  const [previewReviewSubmitting, setPreviewReviewSubmitting] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [previewFullscreenExiting, setPreviewFullscreenExiting] =
    useState(false);
  const [previewPaneWidth, setPreviewPaneWidth] = useState(
    isFactorLandingMode
      ? Math.min(720, Math.round(window.innerWidth * 0.46))
      : PREVIEW_PANE_DEFAULT_WIDTH,
  );
  const [previewResizing, setPreviewResizing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileProfileOpenRequested, setMobileProfileOpenRequested] =
    useState(false);
  const [sessionListRefreshKey, setSessionListRefreshKey] = useState(0);
  const [projectListRefreshKey, setProjectListRefreshKey] = useState(0);
  const [projectSettingsProjectId, setProjectSettingsProjectId] = useState('');
  const [previewTaskCreate, setPreviewTaskCreate] = useState<{
    context: ProjectTaskCreateContext;
    projectId: string;
  }>();
  const [pendingReadSessionId, setPendingReadSessionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contextInsightBanner, setContextInsightBanner] =
    useState<AgentContextInsightDecision | null>(null);
  const [inviteOpenRequestKey, setInviteOpenRequestKey] = useState(0);
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const contextInsightAbortControllerRef = useRef<AbortController | null>(null);
  const contextInsightBannerSessionIdRef = useRef('');
  const contextInsightDecisionKeysRef = useRef(new Set<string>());
  const activeStreamSessionIdRef = useRef('');
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const conversationWorkspaceRef = useRef<HTMLDivElement>(null);
  const fileDragDepthRef = useRef(0);
  const pageViewTrackedRef = useRef(false);
  const previewPaneWidthRef = useRef(PREVIEW_PANE_DEFAULT_WIDTH);
  const focusedPreviewCarbonLabelAccountIdRef = useRef('');
  const previewCarbonLabelPreparingAccountIdsRef = useRef(new Set<string>());
  const previewFullscreenSidebarCollapsedRef = useRef<boolean | null>(null);
  const previewFullscreenExitTimerRef = useRef<number | undefined>(undefined);
  const answerTextSegmentIndexRef = useRef(0);
  const answerToolCallsRef = useRef<AgentToolCall[]>([]);
  const autoOpenedBusinessCardRef = useRef(new Set<string>());
  const activeCbamMonitorPlanIdRef = useRef('');
  const monitorDataVersionsRef = useRef(new Map<string, number>());
  const monitorPreviewExplicitlyClosedRef = useRef(false);
  const previewTargetRef = useRef<BusinessCardPreviewTarget>();
  const autoOpenedEnterpriseProjectPreviewKeyRef = useRef('');
  const historyRequestIdRef = useRef(0);
  const previewCertificationRefreshRequestIdRef = useRef(0);
  const previewEnterpriseCarbonCertificationRefreshRequestIdRef = useRef(0);
  const previewExpertReviewRefreshRequestIdRef = useRef(0);
  const loadedHistorySessionIdRef = useRef('');
  const loadedHistoryMessageIdRef = useRef('');
  const loadedHistorySessionStatusRef = useRef('');
  const selectedSessionRunHintRef = useRef<{
    messageId: string;
    running: boolean;
    sessionId: string;
  } | null>(null);
  const selectedConversationRef = useRef<AgentConversation | null>(null);
  const resumedMessageKeyRef = useRef('');
  const submitRequestIdRef = useRef(0);
  const readSessionTurnIdsRef = useRef(new Map<string, string>());
  const readingSessionTurnKeysRef = useRef(new Set<string>());
  const acceptingProjectInviteCodeRef = useRef('');
  const boundCcdbFactorSessionsRef = useRef(new Set<string>());
  const factorLibrarySessionIdRef = useRef('');
  const issueFeedbackContextRef = useRef({
    sessionId: '',
    sessionTitle: '',
    sourcePath: '',
  });

  const {
    allowed: anonymousExperienceAllowed,
    bindSession: bindAnonymousExperienceSession,
    cancelCurrentMessage: cancelAnonymousExperienceMessage,
    consumed: anonymousExperienceConsumed,
    eligibilityChecking: anonymousEligibilityChecking,
    isLocallyStarted: isAnonymousExperienceStarted,
    loginRequired: anonymousEligibilityLoginRequired,
    restoredConversation: restoredAnonymousConversation,
    submitMessage: sendAnonymousExperienceMessage,
    uploadAttachment: uploadAnonymousExperienceAttachment,
  } = useAnonymousAgentExperience({
    authenticated,
    enabled: !isShareMode,
    lang,
  });
  useEffect(() => {
    if (!factorId) {
      return;
    }

    const target = {
      factorId,
      publicAccess: !hasActiveToken(),
      shareId: factorShareId || undefined,
    };
    ccdbFactorSubmittedRef.current = false;
    if (!hasActiveToken()) getAgentInviteCode();
    setCcdbFactorTarget(target);
    setCcdbFactorDraft(target);
    setCurrentSessionId('');
    setConversationMessages([]);
    setConversationQuestion('');
    setAnswerBlocks([]);
    setAnswerCards([]);
    setConversationStarted(true);
    setPreviewOpen(true);
  }, [factorId, factorShareId]);

  useEffect(() => {
    if (!isFactorLandingMode) {
      return undefined;
    }

    const existingMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="referrer"]',
    );
    const meta = existingMeta || document.createElement('meta');
    const previousContent = existingMeta?.content;

    meta.name = 'referrer';
    meta.content = 'no-referrer';
    if (!existingMeta) {
      document.head.appendChild(meta);
    }

    return () => {
      if (existingMeta) {
        existingMeta.content = previousContent || '';
      } else {
        meta.remove();
      }
    };
  }, [isFactorLandingMode]);

  useEffect(() => {
    if (!restoredAnonymousConversation || isFactorLandingMode) {
      return;
    }

    setConversationStarted(true);
    setConversationQuestion(restoredAnonymousConversation.question);
    setConversationQuestionTime(restoredAnonymousConversation.questionTime);
    setCurrentSessionTitle(restoredAnonymousConversation.title);

    const { response } = restoredAnonymousConversation;

    setAnswerBlocks(restoredAnonymousConversation.answerBlocks);
    setAnswerCards(restoredAnonymousConversation.answerCards);
    setAnswerControls(
      response ? normalizeAgentAnswerControls(response) : undefined,
    );

    if (restoredAnonymousConversation.historyConversation) {
      setCreatedConversation(restoredAnonymousConversation.historyConversation);
    }
  }, [isFactorLandingMode, restoredAnonymousConversation]);
  const sessionIdFromParams = getSessionIdFromSearch(location.search);
  const projectSessionProjectIdFromParams =
    getProjectSessionProjectIdFromSearch(location.search);
  const sectionFromParams = getSectionFromSearch(location.search);
  const issueFeedbackNavigationContext = getIssueFeedbackNavigationContext(
    location.search,
  );
  const projectInviteCode = getProjectInviteCodeFromSearch(location.search);
  const selectedSidebarSessionId =
    sessionIdFromParams ||
    (!authenticated && !isFactorLandingMode
      ? restoredAnonymousConversation?.sessionId || ''
      : '');
  const activeConversationSessionId =
    currentSessionId ||
    sessionIdFromParams ||
    shareInfo?.sessionId ||
    (!authenticated && !isFactorLandingMode
      ? restoredAnonymousConversation?.sessionId || ''
      : '');

  useEffect(() => {
    activeCbamMonitorPlanIdRef.current = '';
    monitorDataVersionsRef.current.clear();
    monitorPreviewExplicitlyClosedRef.current = false;
  }, [activeConversationSessionId]);

  useEffect(() => {
    previewTargetRef.current = previewTarget;
    if (previewOpen && previewTarget?.type === 'cbamMonitor') {
      const planId = previewTarget.planId || '';
      activeCbamMonitorPlanIdRef.current = planId;
      if (
        planId &&
        typeof previewTarget.monitorDataVersion === 'number' &&
        (monitorDataVersionsRef.current.get(planId) ?? -1) <
          previewTarget.monitorDataVersion
      ) {
        monitorDataVersionsRef.current.set(
          planId,
          previewTarget.monitorDataVersion,
        );
      }
    }
  }, [previewOpen, previewTarget]);

  const [monitorResourceSessionId, setMonitorResourceSessionId] = useState('');
  useEffect(() => {
    let current = true;
    setMonitorResourceSessionId('');
    if (!authenticated || isShareMode || !activeConversationSessionId) {
      return undefined;
    }
    // 只恢复待上传材料的会话归属；建议和缺口必须来自真实 Agent 消息，不据此补造回复。
    readMonitorSession(activeConversationSessionId)
      .then(value => {
        if (
          current &&
          (value.activeIntakeId ||
            value.activeMonitorPlanId ||
            value.monitorIntakes.length ||
            value.monitorPlans.length)
        ) {
          setMonitorResourceSessionId(activeConversationSessionId);
        }
      })
      .catch(() => {
        // 滚动发布期间读取失败不影响原会话，卡片读取仍按真实 Agent 事件处理。
      });
    return () => {
      current = false;
    };
  }, [activeConversationSessionId, authenticated, isShareMode]);

  const {
    refs: ccdbSessionFactors,
    loading: ccdbSessionFactorsLoading,
    error: ccdbSessionFactorsError,
    retry: retryCcdbSessionFactors,
  } = useCcdbSessionFactors(
    authenticated && !isShareMode ? sessionIdFromParams : '',
    sessionListRefreshKey,
  );

  useEffect(() => {
    if (!sessionIdFromParams || !ccdbSessionFactors.length) return;
    ccdbSessionFactors.forEach(ref => {
      boundCcdbFactorSessionsRef.current.add(
        `${sessionIdFromParams}:${ref.factorId}`,
      );
    });
    setCcdbFactorDraft(currentDraft => {
      const ref = ccdbSessionFactors.find(
        item => String(item.factorId) === currentDraft?.factorId,
      );
      return ref ? sessionFactorTarget(ref) : currentDraft;
    });
  }, [ccdbSessionFactors, sessionIdFromParams]);

  const activeConversationTitle =
    (isShareMode ? shareInfo?.title : undefined) ||
    currentSessionTitle ||
    createdConversation?.title ||
    I18N.carbonAgent.defaultShareTitle;
  const sharedConversationProjectId =
    shareInfo?.workspaceProjectId === undefined ||
    shareInfo.workspaceProjectId === null
      ? ''
      : String(shareInfo.workspaceProjectId).trim();
  const activeConversationProjectId =
    (createdConversation?.projectSession
      ? createdConversation.projectId || ''
      : '') || (sessionIdFromParams ? projectSessionProjectIdFromParams : '');
  const activePreviewProjectId =
    activeConversationProjectId ||
    (isShareMode ? sharedConversationProjectId : '');
  const projectConversationReadonly = Boolean(
    activeConversationProjectId && createdConversation?.canWrite !== true,
  );
  const showConversationBusinessForesight =
    !activeConversationProjectId || createdConversation?.canWrite === true;
  const conversationReadonly =
    isShareMode ||
    projectConversationReadonly ||
    (!!workspaceAccess && !workspaceAccess.canUseAi);
  const stopContextInsightPolling = () => {
    contextInsightAbortControllerRef.current?.abort();
    contextInsightAbortControllerRef.current = null;
  };
  const clearContextInsight = () => {
    stopContextInsightPolling();
    contextInsightBannerSessionIdRef.current = '';
    setContextInsightBanner(null);
  };
  const requestContextInsightDecision = (
    targetSessionId?: string,
    targetMessageId?: string,
  ) => {
    const resolvedSessionId = targetSessionId?.trim() || '';
    const resolvedMessageId = targetMessageId?.trim() || '';

    if (
      !authenticated ||
      isShareMode ||
      conversationReadonly ||
      !resolvedSessionId ||
      !resolvedMessageId
    ) {
      return;
    }

    const decisionKey = `${resolvedSessionId}:${resolvedMessageId}`;

    if (contextInsightDecisionKeysRef.current.has(decisionKey)) {
      return;
    }

    stopContextInsightPolling();
    contextInsightDecisionKeysRef.current.add(decisionKey);

    const abortController = new AbortController();
    contextInsightAbortControllerRef.current = abortController;

    const queryDecision = async () => {
      const decision = await fetchAgentContextInsightDecision(
        resolvedSessionId,
        resolvedMessageId,
        abortController.signal,
      );

      if (!abortController.signal.aborted && decision?.status === 'PENDING') {
        if (typeof decision.retryAfterMillis !== 'number') {
          return;
        }

        await waitForContextInsightRetry(
          decision.retryAfterMillis,
          abortController.signal,
        );

        if (abortController.signal.aborted) {
          return;
        }

        await queryDecision();
        return;
      }

      if (
        !abortController.signal.aborted &&
        contextInsightAbortControllerRef.current === abortController &&
        decision?.status === 'READY' &&
        decision.category != null
      ) {
        contextInsightBannerSessionIdRef.current = resolvedSessionId;
        setContextInsightBanner(decision);
      }
    };

    queryDecision()
      .catch(() => undefined)
      .finally(() => {
        if (contextInsightAbortControllerRef.current === abortController) {
          contextInsightAbortControllerRef.current = null;
        }
      });
  };

  useEffect(() => {
    contextInsightAbortControllerRef.current?.abort();
    contextInsightAbortControllerRef.current = null;
    contextInsightBannerSessionIdRef.current = '';
    setContextInsightBanner(null);

    return () => {
      contextInsightAbortControllerRef.current?.abort();
    };
  }, [activeConversationSessionId, authenticated, conversationReadonly]);

  const handlePreviewEmissionTaskCreate = useCallback(
    (target: AccountEmissionTaskTarget) => {
      const projectId = activeConversationProjectId.trim();
      const sourceObjectId =
        target.emissionSourceId === null ||
        target.emissionSourceId === undefined
          ? ''
          : String(target.emissionSourceId).trim();

      if (!projectId || !sourceObjectId) {
        antdMessage.error(I18N.carbonAgent.projectTaskSourceUnavailable);
        return;
      }

      setPreviewTaskCreate({
        context: {
          initialTaskTitle: I18N.template(
            I18N.carbonAgent.projectTaskEmissionSourceDefaultTitle,
            { val1: target.emissionSourceName },
          ),
          relatedObjectLabel: I18N.template(
            I18N.carbonAgent.projectTaskEmissionSourceObject,
            { val1: target.emissionSourceName },
          ),
          sourceAccountId: target.sourceAccountId,
          sourceObjectId,
          sourceObjectType: 'emission_source',
          sourceType: 'emission_source',
        },
        projectId,
      });
    },
    [activeConversationProjectId],
  );
  const conversationBusinessRecords = [
    asRecord(createdConversation?.bizRef),
    {
      bizId: createdConversation?.bizId,
      bizType: createdConversation?.bizType,
      module: createdConversation?.module,
    },
  ];
  const isEnterpriseCarbonContext =
    activeMode === 'enterpriseCarbon' ||
    activeSection === 'enterpriseCarbon' ||
    createdConversation?.module === 'enterprise' ||
    getEnterpriseCarbonBusinessKind(conversationBusinessRecords) !==
      undefined ||
    previewTarget?.type === 'enterpriseCarbonAccounting' ||
    previewTarget?.type === 'enterpriseCarbonReport' ||
    Boolean(
      previewTabTargets.enterpriseCarbonAccounting ||
        previewTabTargets.enterpriseCarbonReport,
    );
  const hasCbamContext = Boolean(
    previewTarget?.type === 'cbamMonitor' ||
      previewTarget?.type === 'cbamOperationReport' ||
      Boolean(previewTarget?.reportKind) ||
      Boolean(previewTabTargets.report?.reportKind) ||
      previewTarget?.type === 'cbamReport' ||
      previewTabTargets.cbamMonitor ||
      previewTabTargets.cbamOperationReport ||
      previewTabTargets.cbamReport,
  );
  const hasProductCarbonContext = Boolean(
    previewTarget?.type === 'account' ||
      previewTarget?.type === 'certification' ||
      previewTarget?.type === 'expertReview' ||
      (previewTarget?.type === 'report' && !previewTarget.reportKind) ||
      previewTabTargets.account ||
      previewTabTargets.certification ||
      previewTabTargets.expertReview ||
      (previewTabTargets.report && !previewTabTargets.report.reportKind),
  );
  const isCbamOnlyContext =
    hasCbamContext && !hasProductCarbonContext && !isEnterpriseCarbonContext;
  const activeProjectConversationProject =
    projectConversationProject?.id === activeConversationProjectId
      ? projectConversationProject
      : undefined;
  const usesEnterpriseProjectPermissions = Boolean(
    !isShareMode &&
      activeConversationProjectId &&
      (isEnterpriseCarbonAgentProject(activeProjectConversationProject) ||
        (!activeProjectConversationProject && isEnterpriseCarbonContext)),
  );
  const enterpriseProjectCapabilities =
    activeProjectConversationProject?.businessCapabilities;
  const enterpriseProjectSessionPermissionKey =
    usesEnterpriseProjectPermissions && activeConversationSessionId
      ? `${activeConversationProjectId}:${activeConversationSessionId}`
      : '';
  const activeCreatedConversationSessionId =
    createdConversation?.sessionId || createdConversation?.id || '';
  const activeConversationPreviewPermission =
    Boolean(enterpriseProjectSessionPermissionKey) &&
    activeCreatedConversationSessionId === activeConversationSessionId &&
    createdConversation?.projectId === activeConversationProjectId &&
    typeof createdConversation?.canEditEnterprisePreview === 'boolean'
      ? createdConversation.canEditEnterprisePreview
      : undefined;
  const recoveredEnterpriseProjectSessionPreviewPermission =
    enterpriseProjectSessionPreviewPermission?.key ===
    enterpriseProjectSessionPermissionKey
      ? enterpriseProjectSessionPreviewPermission.canEditEnterprisePreview
      : undefined;
  const canEditEnterpriseProjectPreview =
    activeConversationPreviewPermission ??
    recoveredEnterpriseProjectSessionPreviewPermission ??
    false;

  useEffect(() => {
    if (
      !enterpriseProjectSessionPermissionKey ||
      activeConversationPreviewPermission !== undefined ||
      recoveredEnterpriseProjectSessionPreviewPermission !== undefined
    ) {
      return undefined;
    }

    const abortController = new AbortController();
    const applyPermission = (canEditEnterprisePreview: boolean) => {
      if (abortController.signal.aborted) {
        return;
      }

      setEnterpriseProjectSessionPreviewPermission({
        canEditEnterprisePreview,
        key: enterpriseProjectSessionPermissionKey,
      });
      setCreatedConversation(currentConversation => {
        const currentConversationSessionId =
          currentConversation?.sessionId || currentConversation?.id || '';

        if (
          !currentConversation ||
          currentConversationSessionId !== activeConversationSessionId ||
          currentConversation.projectId !== activeConversationProjectId
        ) {
          return currentConversation;
        }

        return {
          ...currentConversation,
          canEditEnterprisePreview,
        };
      });

      const selectedConversation = selectedConversationRef.current;
      const selectedConversationSessionId =
        selectedConversation?.sessionId || selectedConversation?.id || '';

      if (
        selectedConversation &&
        selectedConversationSessionId === activeConversationSessionId &&
        selectedConversation.projectId === activeConversationProjectId
      ) {
        selectedConversationRef.current = {
          ...selectedConversation,
          canEditEnterprisePreview,
        };
      }
    };

    fetchAgentProjectSessionById(
      activeConversationProjectId,
      activeConversationSessionId,
      abortController.signal,
    )
      .then(conversation => {
        applyPermission(conversation?.canEditEnterprisePreview === true);
      })
      .catch(() => {
        applyPermission(false);
      });

    return () => abortController.abort();
  }, [
    activeConversationPreviewPermission,
    activeConversationProjectId,
    activeConversationSessionId,
    enterpriseProjectSessionPermissionKey,
    recoveredEnterpriseProjectSessionPreviewPermission,
  ]);
  const canEditEnterpriseProjectAccounting =
    canEditEnterpriseProjectPreview &&
    hasEnterpriseBusinessCapability(
      enterpriseProjectCapabilities,
      'canEditAccounting',
    );
  const enterpriseCarbonReviewCertificationReadonly =
    usesEnterpriseProjectPermissions
      ? !canEditEnterpriseProjectAccounting
      : conversationReadonly;
  const enterpriseCarbonAccountingPermissions:
    | EnterpriseCarbonAccountingPermissions
    | undefined = usesEnterpriseProjectPermissions
    ? {
        canCreateAccounting:
          canEditEnterpriseProjectPreview &&
          hasEnterpriseBusinessCapability(
            enterpriseProjectCapabilities,
            'canCreateAccounting',
          ),
        canCreateTask: hasEnterpriseBusinessCapability(
          enterpriseProjectCapabilities,
          'canCreateTask',
        ),
        canEditAccounting: canEditEnterpriseProjectAccounting,
        canEditEmissionSource:
          canEditEnterpriseProjectPreview &&
          hasEnterpriseBusinessCapability(
            enterpriseProjectCapabilities,
            'canEditEmissionSource',
          ),
        canViewAccounting: hasEnterpriseBusinessCapability(
          enterpriseProjectCapabilities,
          'canViewAccounting',
        ),
      }
    : undefined;
  const homeSkillModeOptions = useMemo(
    () => getHomeSkillModeOptions(homeSkills),
    [homeSkills],
  );
  const modeOptions = useMemo(() => {
    if (!authenticated) {
      return homeSkillModeOptions;
    }

    if (accountBindStatus === 'HAS_ACCOUNT' && isCbamOnlyContext) {
      return [];
    }

    const statusOptions = getModeOptionsByAccountBindStatus(
      accountBindStatus,
      locale,
    );
    const options =
      accountBindStatus === 'NO_ACCOUNT'
        ? [...homeSkillModeOptions, ...statusOptions]
        : statusOptions;

    return isEnterpriseCarbonContext
      ? options.filter(option => option.key !== 'model_update')
      : options;
  }, [
    accountBindStatus,
    authenticated,
    homeSkillModeOptions,
    isCbamOnlyContext,
    isEnterpriseCarbonContext,
    locale,
  ]);

  useEffect(() => {
    setProjectConversationProject(undefined);
    setProjectConversationBranchCreating(false);

    if (!authenticated || !activeConversationProjectId || isShareMode) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    fetchAgentProjectDetail(activeConversationProjectId, abortController.signal)
      .then(project => {
        if (!cancelled) {
          setProjectConversationProject(project);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [activeConversationProjectId, authenticated, isShareMode]);

  const selectedModeOption = modeOptions.find(
    option => option.key === activeMode,
  );
  const homeSuggestionScene =
    selectedModeOption?.scene ||
    homeSkillModeOptions.find(option => option.key === 'productFootprint')
      ?.scene;
  const composerReferenceContents = useMemo(
    () => getComposerReferenceContents(composerQuotes),
    [composerQuotes],
  );
  const handleConversationsChanged = useCallback(() => {
    setSessionListRefreshKey(prevKey => prevKey + 1);
  }, []);
  const markSessionTurnRead = useCallback(
    async (sessionId: string, lastReadTurnId: number | string) => {
      const normalizedTurnId = String(lastReadTurnId);
      const requestKey = `${sessionId}:${normalizedTurnId}`;

      if (
        readSessionTurnIdsRef.current.get(sessionId) === normalizedTurnId ||
        readingSessionTurnKeysRef.current.has(requestKey)
      ) {
        return;
      }

      readingSessionTurnKeysRef.current.add(requestKey);

      try {
        await markAgentSessionRead(sessionId, lastReadTurnId);
        readSessionTurnIdsRef.current.set(sessionId, normalizedTurnId);
        setSessionListRefreshKey(prevKey => prevKey + 1);
      } catch {
        // Polling keeps the unread marker available so the user can retry.
      } finally {
        readingSessionTurnKeysRef.current.delete(requestKey);
      }
    },
    [],
  );
  const markCompletedSessionRead = useCallback(
    async (sessionId: string, finalResponse?: AgentFinalResponse) => {
      let lastReadTurnId = finalResponse?.turnId;

      if (lastReadTurnId === undefined || lastReadTurnId === null) {
        try {
          const completedHistory = await fetchAgentSessionHistory(sessionId);

          lastReadTurnId = getLatestAssistantTurnId(completedHistory.messages);
        } catch {
          return;
        }
      }

      if (lastReadTurnId === undefined || lastReadTurnId === null) {
        return;
      }

      await markSessionTurnRead(sessionId, lastReadTurnId);
    },
    [markSessionTurnRead],
  );
  const handleProductFootprintScopeChange = useCallback(
    (nextScope: ProductFootprintScopeNode[][]) => {
      const lastSelectedNode = nextScope[nextScope.length - 1];

      setProductFootprintScope(prevScope => {
        if (prevScope.length === 0 || !lastSelectedNode) {
          return nextScope;
        }

        if (lastSelectedNode.length === 1) {
          return [lastSelectedNode];
        }

        if (lastSelectedNode.length === 2) {
          return nextScope.filter(item => item.length === 2);
        }

        return nextScope;
      });
    },
    [],
  );
  const productFootprintComposerOptions =
    useMemo<ProductFootprintComposerOptions>(
      () => ({
        factorScope: productFootprintFactorScope,
        factorScopeOptions: productFootprintFactorScopeOptions,
        factorScopesLoading: productFootprintFactorScopesLoading,
        openPill: productFootprintOpenPill,
        scope: productFootprintScope,
        onFactorScopeChange: setProductFootprintFactorScope,
        onOpenPillChange: setProductFootprintOpenPill,
        onScopeChange: handleProductFootprintScopeChange,
      }),
      [
        handleProductFootprintScopeChange,
        productFootprintFactorScope,
        productFootprintFactorScopeOptions,
        productFootprintFactorScopesLoading,
        productFootprintOpenPill,
        productFootprintScope,
      ],
    );
  const previewAccountTarget = previewTabTargets.account;
  const previewCertificationTarget = previewTabTargets.certification;
  const previewEnterpriseCarbonTarget =
    previewTabTargets.enterpriseCarbonAccounting;
  const previewEnterpriseCarbonCertificationTarget =
    previewTabTargets.enterpriseCarbonCertification;
  const previewEnterpriseCarbonExpertReviewTarget =
    previewTabTargets.enterpriseCarbonExpertReview;
  const previewEnterpriseCarbonReportTarget =
    previewTabTargets.enterpriseCarbonReport;
  const previewExpertReviewTarget = previewTabTargets.expertReview;
  const previewReportTarget = previewTabTargets.report;
  const previewWorkspaceTarget = previewTabTargets.workspace;
  const previewTargetsForPane = useMemo(() => {
    const mergedTargets = mergeBusinessPreviewTargets(
      ...previewTargets,
      previewAccountTarget,
      previewReportTarget,
      previewExpertReviewTarget,
      previewCertificationTarget,
      previewEnterpriseCarbonTarget,
      previewEnterpriseCarbonCertificationTarget,
      previewEnterpriseCarbonExpertReviewTarget,
      previewEnterpriseCarbonReportTarget,
      previewWorkspaceTarget,
      previewTarget,
    );
    const selectedEnterpriseCarbonReportTarget =
      previewTarget?.type === 'enterpriseCarbonReport'
        ? previewTarget
        : previewEnterpriseCarbonReportTarget;

    return getPreviewTargetsWithDefaultEnterpriseCarbonReports(
      mergedTargets,
      selectedEnterpriseCarbonReportTarget,
    ).filter(
      target =>
        target.type !== 'carbonLabel' ||
        (!isShareMode && !isMobile && !conversationReadonly),
    );
  }, [
    isShareMode,
    isMobile,
    conversationReadonly,
    previewAccountTarget,
    previewCertificationTarget,
    previewEnterpriseCarbonTarget,
    previewEnterpriseCarbonCertificationTarget,
    previewEnterpriseCarbonExpertReviewTarget,
    previewEnterpriseCarbonReportTarget,
    previewExpertReviewTarget,
    previewReportTarget,
    previewWorkspaceTarget,
    previewTarget,
    previewTargets,
  ]);
  const enterpriseCarbonExpertReviewAccountRestoreContexts = useMemo(() => {
    const contexts = new Map<string, EnterpriseCarbonExpertReviewContext>();

    previewTargetsForPane.forEach(target => {
      const sourceContext = getEnterpriseCarbonExpertReviewContextFromTarget(
        target,
        activeConversationSessionId,
      );

      if (!sourceContext) {
        return;
      }

      const context: EnterpriseCarbonExpertReviewContext = {
        ...sourceContext,
        enterpriseCarbonBizType: 'account',
        reportId: undefined,
      };
      const key = [context.agentSessionId, context.year]
        .filter(Boolean)
        .join('|');

      contexts.set(key || String(context.year), context);
    });

    return Array.from(contexts.values());
  }, [activeConversationSessionId, previewTargetsForPane]);
  const enterpriseCarbonExpertReviewSourceContext = useMemo(() => {
    let sourceTarget: BusinessCardPreviewTarget | undefined;

    if (previewTarget?.type === 'enterpriseCarbonReport') {
      sourceTarget = previewEnterpriseCarbonReportTarget || previewTarget;
    } else if (previewTarget?.type === 'enterpriseCarbonExpertReview') {
      sourceTarget = previewEnterpriseCarbonExpertReviewTarget || previewTarget;
    } else if (previewTarget?.type === 'enterpriseCarbonCertification') {
      sourceTarget =
        previewEnterpriseCarbonTarget ||
        previewEnterpriseCarbonReportTarget ||
        previewTarget;
    } else {
      sourceTarget =
        previewEnterpriseCarbonTarget ||
        previewTarget ||
        previewEnterpriseCarbonReportTarget;
    }

    return getEnterpriseCarbonExpertReviewContextFromTarget(
      sourceTarget,
      activeConversationSessionId,
    );
  }, [
    activeConversationSessionId,
    previewEnterpriseCarbonExpertReviewTarget,
    previewEnterpriseCarbonReportTarget,
    previewEnterpriseCarbonTarget,
    previewTarget,
  ]);
  const previewAutoReviewTargets = useMemo(() => {
    const targetsByAccountId = new Map<string, BusinessCardPreviewTarget>();

    previewTargetsForPane.forEach(target => {
      const accountId = getBusinessPreviewTargetAccountId(target);

      if (!accountId) {
        return;
      }

      const existingTarget = targetsByAccountId.get(accountId);
      const existingDisplay = getBusinessPreviewDisplayFields(existingTarget);
      const nextDisplay = getBusinessPreviewDisplayFields(target);
      const existingStatus = getBusinessPreviewStatusFields(existingTarget);
      const nextStatus = getBusinessPreviewStatusFields(target);

      targetsByAccountId.set(accountId, {
        ...existingTarget,
        accountId,
        accountName: nextDisplay.accountName || existingDisplay.accountName,
        certificationStatus:
          nextStatus.certificationStatus || existingStatus.certificationStatus,
        certificationStatusName:
          nextStatus.certificationStatusName ||
          existingStatus.certificationStatusName,
        expertReviewId:
          nextStatus.expertReviewId || existingStatus.expertReviewId,
        expertReviewNo:
          nextStatus.expertReviewNo || existingStatus.expertReviewNo,
        expertReviewStatus:
          nextStatus.expertReviewStatus || existingStatus.expertReviewStatus,
        expertReviewStatusName:
          nextStatus.expertReviewStatusName ||
          existingStatus.expertReviewStatusName,
        productName: nextDisplay.productName || existingDisplay.productName,
        productId:
          getScalarValue(existingTarget?.productId) ||
          getScalarValue(target.productId) ||
          undefined,
        title: nextDisplay.title || existingDisplay.title,
        type: 'account',
      });
    });

    return Array.from(targetsByAccountId.values());
  }, [previewTargetsForPane]);
  const previewAutoReviewAccountKey = previewAutoReviewTargets
    .map(target => getBusinessPreviewTargetAccountId(target))
    .filter(Boolean)
    .sort()
    .join('|');
  const hasBusinessPreviewTarget = Boolean(
    ccdbFactorTarget ||
      previewTargetsForPane.length ||
      previewAccountTarget?.accountId ||
      previewCertificationTarget?.certificationAuthType ||
      previewCertificationTarget?.certificationDetails?.length ||
      previewCertificationTarget?.certificationDraftAuthType ||
      previewExpertReviewTarget?.reviewDetail ||
      previewExpertReviewTarget?.reviewDetails?.length ||
      previewReportTarget?.reportUrl ||
      previewEnterpriseCarbonReportTarget?.reportId ||
      previewEnterpriseCarbonReportTarget?.enterpriseCarbonFiles?.length ||
      previewEnterpriseCarbonExpertReviewTarget?.enterpriseCarbonExpertReviewDetail ||
      previewEnterpriseCarbonExpertReviewTarget
        ?.enterpriseCarbonExpertReviewDetails?.length ||
      previewEnterpriseCarbonCertificationTarget
        ?.enterpriseCarbonCertificationDetails?.length ||
      previewEnterpriseCarbonCertificationTarget?.enterpriseCarbonCertificationDraft ||
      previewEnterpriseCarbonCertificationTarget?.enterpriseCarbonCertificationPageType ||
      previewTarget?.accountId ||
      previewTarget?.certificationAuthType ||
      previewTarget?.certificationDetails?.length ||
      previewTarget?.certificationDraftAuthType ||
      previewTarget?.reviewDetail ||
      previewTarget?.reviewDetails?.length ||
      previewTarget?.reportUrl ||
      previewTarget?.type === 'enterpriseCarbonAccounting' ||
      previewTarget?.type === 'enterpriseCarbonCertification' ||
      previewTarget?.type === 'enterpriseCarbonExpertReview' ||
      previewTarget?.type === 'enterpriseCarbonReport' ||
      previewTarget?.type === 'cbamMonitor' ||
      previewTarget?.type === 'cbamOperationReport' ||
      previewTarget?.type === 'cbamReport' ||
      previewTarget?.workspaceLiveSession,
  );
  const previewVisible =
    previewOpen && (PREVIEW_PANE_ENABLED || hasBusinessPreviewTarget);
  const desktopPreviewVisible = previewVisible && !isMobile;
  const desktopWorkspacePreviewVisible = Boolean(
    desktopPreviewVisible && previewTarget?.type === 'workspace',
  );
  const mobilePreviewVisible =
    previewVisible && isMobile && hasBusinessPreviewTarget;
  const focusedEnterpriseCarbonReportTarget = useMemo(
    () =>
      [...previewTargetsForPane]
        .reverse()
        .find(target => target.type === 'enterpriseCarbonReport'),
    [previewTargetsForPane],
  );
  let mobilePreviewTarget = previewTarget;

  if (isMobile && previewTarget?.type === 'carbonLabel') {
    mobilePreviewTarget =
      previewAccountTarget || previewReportTarget || previewExpertReviewTarget;
  } else if (isMobile && previewTarget?.type === 'certification') {
    mobilePreviewTarget =
      previewAccountTarget || previewReportTarget || previewExpertReviewTarget;
  } else if (
    isMobile &&
    previewTarget?.type === 'enterpriseCarbonCertification'
  ) {
    mobilePreviewTarget =
      previewEnterpriseCarbonTarget ||
      previewEnterpriseCarbonReportTarget ||
      previewEnterpriseCarbonExpertReviewTarget;
  } else if (isMobile && previewTarget?.type === 'enterpriseCarbonReport') {
    mobilePreviewTarget = focusedEnterpriseCarbonReportTarget || previewTarget;
  } else if (
    isMobile &&
    (previewTarget?.type === 'cbamMonitor' ||
      previewTarget?.type === 'cbamOperationReport')
  ) {
    mobilePreviewTarget = undefined;
  }
  const previewReviewSourceAccountId =
    getScalarValue(previewAccountTarget?.accountId) ||
    getScalarValue(previewReportTarget?.accountId) ||
    getScalarValue(previewTarget?.accountId);
  const previewReviewSourceReportId =
    getScalarValue(previewReportTarget?.reportId) ||
    getScalarValue(previewTarget?.reportId);
  const previewReviewSourceProductId =
    getScalarValue(previewAccountTarget?.productId) ||
    getScalarValue(previewReportTarget?.productId) ||
    getScalarValue(previewTarget?.productId);
  const previewReviewSourceReportName =
    previewReportTarget?.reportName || previewTarget?.reportName;
  const previewReviewSourceReportUrl =
    previewReportTarget?.reportUrl || previewTarget?.reportUrl;
  const previewEnterpriseCarbonCertificationSourceTargets = useMemo(
    () => getEnterpriseCarbonCertificationSourceTargets(previewTargetsForPane),
    [previewTargetsForPane],
  );
  const previewEnterpriseCarbonCertificationSourceYearsKey =
    previewEnterpriseCarbonCertificationSourceTargets
      .map(target => getScalarValue(target.year))
      .filter(Boolean)
      .sort()
      .join('|');
  const autoPreviewReviewFetchKeyRef = useRef('');
  const autoPreviewEnterpriseCarbonCertificationFetchKeysRef = useRef(
    new Set<string>(),
  );
  const autoPreviewReviewFetchKeysRef = useRef(new Set<string>());
  const previewCertificationSourceTargetRef =
    useRef<BusinessCardPreviewTarget>();
  const previewAutoReviewTargetsRef = useRef<BusinessCardPreviewTarget[]>([]);
  const previewEnterpriseCarbonCertificationSourceTargetsRef = useRef<
    BusinessCardPreviewTarget[]
  >([]);
  useEffect(() => {
    previewAutoReviewTargetsRef.current = previewAutoReviewTargets;
  }, [previewAutoReviewTargets]);
  useEffect(() => {
    previewEnterpriseCarbonCertificationSourceTargetsRef.current =
      previewEnterpriseCarbonCertificationSourceTargets;
  }, [previewEnterpriseCarbonCertificationSourceTargets]);

  useEffect(() => {
    if (isShareMode || !conversationStarted || !previewAutoReviewAccountKey) {
      autoPreviewReviewFetchKeysRef.current.clear();
      return undefined;
    }

    const abortCtrl = new AbortController();
    const sessionFetchKey = currentSessionId || sessionIdFromParams || 'active';

    previewAutoReviewTargetsRef.current.forEach(sourceTarget => {
      const accountId = getBusinessPreviewTargetAccountId(sourceTarget);

      if (!accountId) {
        return;
      }

      const fetchKey = [sessionFetchKey, accountId].join('|');

      if (autoPreviewReviewFetchKeysRef.current.has(fetchKey)) {
        return;
      }

      autoPreviewReviewFetchKeysRef.current.add(fetchKey);

      fetchAgentExpertReviewList({ accountId }, abortCtrl.signal)
        .then(reviewDetails => {
          if (abortCtrl.signal.aborted) {
            return;
          }

          const validReviewDetails = reviewDetails.filter(
            canOpenExpertReviewDetail,
          );

          if (!validReviewDetails.length) {
            return;
          }

          const expertReviewTarget: BusinessCardPreviewTarget = {
            accountId,
            ...getBusinessPreviewDisplayFields(sourceTarget),
            ...getBusinessPreviewStatusFields(sourceTarget),
            productId: getScalarValue(sourceTarget.productId) || undefined,
            reviewDetail: validReviewDetails[0],
            reviewDetails: validReviewDetails,
            type: 'expertReview',
          };

          setPreviewTabTargets(prevTargets => ({
            ...prevTargets,
            expertReview: expertReviewTarget,
          }));
          setPreviewTargets(prevTargets =>
            mergeBusinessPreviewTargets(...prevTargets, expertReviewTarget),
          );
        })
        .catch(() => {
          if (!abortCtrl.signal.aborted) {
            autoPreviewReviewFetchKeysRef.current.delete(fetchKey);
          }
        });
    });

    return () => {
      abortCtrl.abort();
    };
  }, [
    conversationStarted,
    currentSessionId,
    isShareMode,
    previewAutoReviewAccountKey,
    sessionIdFromParams,
  ]);

  // 预览面板打开后自动拉取专家复核 / 第三方认证数据，使其与核算模型、
  // 产品碳足迹报告一样常驻（仅在接口返回数据时建立对应 tab）。
  useEffect(() => {
    if (isShareMode || !conversationStarted || !previewReviewSourceAccountId) {
      autoPreviewReviewFetchKeyRef.current = '';
      return undefined;
    }

    const fetchKey = [previewReviewSourceAccountId, previewReviewSourceReportId]
      .filter(Boolean)
      .join('|');

    if (autoPreviewReviewFetchKeyRef.current === fetchKey) {
      return undefined;
    }

    autoPreviewReviewFetchKeyRef.current = fetchKey;

    const sourceTarget: BusinessCardPreviewTarget = {
      accountId: previewReviewSourceAccountId,
      productId: previewReviewSourceProductId || undefined,
      reportId: previewReviewSourceReportId || undefined,
      reportName: previewReviewSourceReportName,
      reportUrl: previewReviewSourceReportUrl,
      type: 'account',
    };
    const statusParams = getExpertReviewStatusParams(sourceTarget);
    const listParams = getExpertReviewListParams(statusParams);
    const abortCtrl = new AbortController();

    if (listParams) {
      fetchAgentExpertReviewList(listParams, abortCtrl.signal)
        .then(reviewDetails => {
          if (abortCtrl.signal.aborted) {
            return;
          }

          const validReviewDetails = reviewDetails.filter(
            canOpenExpertReviewDetail,
          );

          if (!validReviewDetails.length) {
            return;
          }

          const expertReviewTarget: BusinessCardPreviewTarget = {
            accountId: previewReviewSourceAccountId,
            productId: previewReviewSourceProductId || undefined,
            reportId: previewReviewSourceReportId || undefined,
            reportName: previewReviewSourceReportName,
            reportUrl: previewReviewSourceReportUrl,
            reviewDetail: validReviewDetails[0],
            reviewDetails: validReviewDetails,
            type: 'expertReview',
          };

          setPreviewTabTargets(prevTargets => ({
            ...prevTargets,
            expertReview: expertReviewTarget,
          }));
          setPreviewTargets(prevTargets =>
            mergeBusinessPreviewTargets(...prevTargets, expertReviewTarget),
          );
        })
        .catch(() => undefined);
    }

    fetchAgentCertificationList(
      { accountId: previewReviewSourceAccountId },
      abortCtrl.signal,
    )
      .then(certificationDetails => {
        if (abortCtrl.signal.aborted || !certificationDetails.length) {
          return;
        }

        const certificationTarget: BusinessCardPreviewTarget = {
          accountId: previewReviewSourceAccountId,
          certificationAuthType: getCertificationApplyAuthTypeFromItem(
            certificationDetails[0],
          ),
          certificationDetails,
          productId: previewReviewSourceProductId || undefined,
          reportId: previewReviewSourceReportId || undefined,
          reportName: previewReviewSourceReportName,
          reportUrl: previewReviewSourceReportUrl,
          type: 'certification',
        };

        setPreviewTabTargets(prevTargets => ({
          ...prevTargets,
          certification: certificationTarget,
        }));
        setPreviewTargets(prevTargets =>
          mergeBusinessPreviewTargets(...prevTargets, certificationTarget),
        );
      })
      .catch(() => undefined);

    return () => {
      abortCtrl.abort();

      if (autoPreviewReviewFetchKeyRef.current === fetchKey) {
        autoPreviewReviewFetchKeyRef.current = '';
      }
    };
  }, [
    conversationStarted,
    isShareMode,
    previewReviewSourceAccountId,
    previewReviewSourceProductId,
    previewReviewSourceReportId,
    previewReviewSourceReportName,
    previewReviewSourceReportUrl,
  ]);

  useEffect(() => {
    if (
      isShareMode ||
      !conversationStarted ||
      !previewEnterpriseCarbonCertificationSourceYearsKey
    ) {
      autoPreviewEnterpriseCarbonCertificationFetchKeysRef.current.clear();
      return undefined;
    }

    const abortController = new AbortController();
    const sessionFetchKey = activeConversationSessionId || 'active';
    const pendingFetchKeys = new Set<string>();

    previewEnterpriseCarbonCertificationSourceTargetsRef.current.forEach(
      sourceTarget => {
        const year = getScalarValue(sourceTarget.year);

        if (!year) {
          return;
        }

        const fetchKey = [sessionFetchKey, year].join('|');

        if (
          autoPreviewEnterpriseCarbonCertificationFetchKeysRef.current.has(
            fetchKey,
          )
        ) {
          return;
        }

        autoPreviewEnterpriseCarbonCertificationFetchKeysRef.current.add(
          fetchKey,
        );
        pendingFetchKeys.add(fetchKey);

        fetchEnterpriseCarbonCertificationList({ year }, abortController.signal)
          .then(certificationDetails => {
            pendingFetchKeys.delete(fetchKey);

            if (
              abortController.signal.aborted ||
              !certificationDetails.length
            ) {
              return;
            }

            let enterpriseCarbonBizType =
              sourceTarget.enterpriseCarbonBizType || 'account';

            if (sourceTarget.type === 'enterpriseCarbonReport') {
              enterpriseCarbonBizType = 'report';
            }

            const certificationTarget = normalizeBusinessPreviewTarget({
              enterpriseCarbonBizId: sourceTarget.enterpriseCarbonBizId,
              enterpriseCarbonBizType,
              enterpriseCarbonCertificationDetails: certificationDetails,
              enterpriseCarbonCertificationPageType:
                getEnterpriseCarbonCertificationPageType(
                  certificationDetails[0],
                ),
              orgId: sourceTarget.orgId,
              type: 'enterpriseCarbonCertification',
              year,
            });

            if (!certificationTarget) {
              return;
            }

            setPreviewTabTargets(previousTargets => ({
              ...previousTargets,
              enterpriseCarbonCertification: certificationTarget,
            }));
            setPreviewTargets(previousTargets =>
              mergeBusinessPreviewTargets(
                ...previousTargets,
                certificationTarget,
              ),
            );
          })
          .catch(() => {
            pendingFetchKeys.delete(fetchKey);

            if (!abortController.signal.aborted) {
              autoPreviewEnterpriseCarbonCertificationFetchKeysRef.current.delete(
                fetchKey,
              );
            }
          });
      },
    );

    return () => {
      abortController.abort();
      pendingFetchKeys.forEach(fetchKey => {
        autoPreviewEnterpriseCarbonCertificationFetchKeysRef.current.delete(
          fetchKey,
        );
      });
    };
  }, [
    activeConversationSessionId,
    conversationStarted,
    isShareMode,
    previewEnterpriseCarbonCertificationSourceYearsKey,
  ]);

  const previewFullscreenActive = previewFullscreen || previewFullscreenExiting;
  const showPreviewOpenButton =
    conversationStarted &&
    !isMobile &&
    hasBusinessPreviewTarget &&
    !desktopPreviewVisible;
  const showDesktopClosedShareButton =
    !conversationReadonly &&
    !isMobile &&
    !activeConversationProjectId &&
    conversationStarted &&
    !desktopPreviewVisible;
  const showPreviewClosedActions =
    showDesktopClosedShareButton || showPreviewOpenButton;
  const shareConversationDisabled =
    shareCreating ||
    projectConversationReadonly ||
    !activeConversationSessionId;
  const composerUploadAvailable =
    !conversationReadonly &&
    !loginModalOpen &&
    !anonymousExperienceConsumed &&
    (authenticated ||
      (!anonymousEligibilityChecking && anonymousExperienceAllowed)) &&
    (conversationStarted ||
      activeSection === 'newChat' ||
      Boolean(activeProjectId));

  useEffect(() => {
    if (!isShareMode && !pageViewTrackedRef.current) {
      pageViewTrackedRef.current = true;
      trackAgentPageView();
    }
  }, [isShareMode]);

  useEffect(() => {
    if (!isShareMode && !isMobile && loginModalOpen) {
      trackAgentAuthModalView(loginTriggerEntry);
    }
  }, [isMobile, isShareMode, loginModalOpen, loginTriggerEntry]);

  useEffect(() => {
    if (isShareMode || !authenticated) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    fetchAgentUserGuideStatus(AGENT_NEW_USER_GUIDE_CODE, abortController.signal)
      .then(status => {
        if (cancelled || !status?.needPopup) {
          return;
        }

        setAgentGuideStepIndex(0);
        setAgentGuideOpen(true);

        markAgentUserGuideShown(AGENT_NEW_USER_GUIDE_CODE).catch(
          () => undefined,
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [authenticated, isShareMode]);

  const handleAgentGuideClose = useCallback(() => {
    setAgentGuideOpen(false);
  }, []);

  const handleAgentGuideOpen = useCallback(() => {
    setAgentGuideStepIndex(0);
    setAgentGuideOpen(true);
  }, []);

  const handleAgentGuidePrev = useCallback(() => {
    setAgentGuideStepIndex(stepIndex => Math.max(0, stepIndex - 1));
  }, []);

  const handleAgentGuideNext = useCallback(() => {
    if (agentGuideStepIndex >= AGENT_GUIDE_STEP_COUNT - 1) {
      setAgentGuideOpen(false);
      return;
    }

    setAgentGuideStepIndex(stepIndex =>
      Math.min(AGENT_GUIDE_STEP_COUNT - 1, stepIndex + 1),
    );
  }, [agentGuideStepIndex]);

  const handleAgentGuideStepChange = useCallback((nextStepIndex: number) => {
    setAgentGuideStepIndex(
      Math.min(Math.max(nextStepIndex, 0), AGENT_GUIDE_STEP_COUNT - 1),
    );
  }, []);

  const getPreviewMaxWidth = useCallback((workspaceWidth?: number) => {
    const resolvedWorkspaceWidth =
      workspaceWidth ||
      conversationWorkspaceRef.current?.getBoundingClientRect().width ||
      window.innerWidth;
    const widthWithConversationRoom =
      resolvedWorkspaceWidth - CONVERSATION_MIN_WIDTH;

    return Math.min(
      PREVIEW_PANE_MAX_WIDTH,
      Math.max(PREVIEW_PANE_MIN_WIDTH, widthWithConversationRoom),
    );
  }, []);
  const clampPreviewPaneWidth = useCallback(
    (nextWidth: number, workspaceWidth?: number) =>
      Math.min(
        Math.max(nextWidth, PREVIEW_PANE_MIN_WIDTH),
        getPreviewMaxWidth(workspaceWidth),
      ),
    [getPreviewMaxWidth],
  );
  const previewPaneMaxWidth = getPreviewMaxWidth();
  const conversationWorkspaceStyle: ConversationWorkspaceStyle = {
    '--preview-pane-width': `${previewPaneWidth}px`,
  };
  const mobileProjectSubpage =
    Boolean(activeProjectTasksId) ||
    Boolean(activeProjectFilesId) ||
    Boolean(activeProjectOverviewId) ||
    Boolean(activeProjectComparisonId);
  const mobileProjectPage = Boolean(activeProjectId) || mobileProjectSubpage;
  const mobileHeaderLeftAction = isShareMode
    ? 'none'
    : mobileProjectSubpage
    ? 'back'
    : !conversationStarted &&
      (activeSection === 'footprintAccounting' ||
        activeSection === 'enterpriseCarbon' ||
        activeSection === 'history' ||
        activeSection === 'cbamFiles')
    ? 'back'
    : 'menu';
  const mobileHeaderTitle = isShareMode
    ? activeConversationTitle
    : activeProjectTasksId
    ? I18N.carbonAgent.projectTasks
    : activeProjectFilesId
    ? I18N.carbonAgent.projectFileListTitle
    : activeProjectOverviewId
    ? I18N.carbonAgent.projectDataOverview
    : activeProjectComparisonId
    ? I18N.carbonAgent.projectCalculationComparison
    : activeProjectId
    ? I18N.carbonAgent.projectHome
    : !conversationStarted && activeSection === 'footprintAccounting'
    ? I18N.carbonAgent.accountingList
    : !conversationStarted && activeSection === 'enterpriseCarbon'
    ? I18N.carbonAgent.accountingManagement
    : !conversationStarted && activeSection === 'factorLibrary'
    ? I18N.ccdb.libraryMenu
    : !conversationStarted && activeSection === 'history'
    ? I18N.carbonAgent.historyConversations
    : !conversationStarted && activeSection === 'cbamFiles'
    ? I18N.carbonAgent.fileManagement
    : I18N.carbonAgent.carbonCloud;
  const footprintAccountingSelected =
    !sessionIdFromParams &&
    sectionFromParams === ACCOUNTING_SECTION_QUERY_VALUE;

  useEffect(
    () => () => {
      submitRequestIdRef.current += 1;
      historyRequestIdRef.current += 1;
      streamAbortControllerRef.current?.abort();
      streamAbortControllerRef.current = null;
      activeStreamSessionIdRef.current = '';
      historyAbortControllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (!isMobile) {
      return undefined;
    }

    let viewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    const previousViewportContent =
      viewportMeta?.getAttribute('content') ?? null;
    const createdViewportMeta = !viewportMeta;

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.setAttribute('content', MOBILE_VIEWPORT_CONTENT);

    const documentStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousViewportHeight = documentStyle.getPropertyValue(
      MOBILE_VIEWPORT_HEIGHT_VAR,
    );
    const previousVisualViewportHeight = documentStyle.getPropertyValue(
      MOBILE_VISUAL_VIEWPORT_HEIGHT_VAR,
    );
    const previousDocumentHeight = documentStyle.height;
    const previousDocumentOverflow = documentStyle.overflow;
    const previousDocumentOverscrollY = documentStyle.getPropertyValue(
      'overscroll-behavior-y',
    );
    const previousBodyHeight = bodyStyle.height;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousBodyOverscrollY = bodyStyle.getPropertyValue(
      'overscroll-behavior-y',
    );
    let layoutViewportHeight = getMobileViewportHeightValue();
    let viewportFrame: number | undefined;
    let focusTimers: number[] = [];

    const keepAndroidComposerVisible = () => {
      const input = document.activeElement;

      if (
        !isAndroid ||
        !(input instanceof HTMLTextAreaElement) ||
        input.name !== 'carbonAgentMessage'
      ) {
        return;
      }

      const composer = input.closest<HTMLElement>(`.${style.composer}`);
      const homeSurface = composer?.closest<HTMLElement>(
        `.${style.newChatSurface}`,
      );

      if (!composer || !homeSurface) {
        return;
      }

      // Keep scrolling inside the home surface instead of panning the whole page.
      const overflow =
        composer.getBoundingClientRect().bottom -
        homeSurface.getBoundingClientRect().bottom +
        12;

      if (overflow > 0) {
        homeSurface.scrollTop += overflow;
      }
    };

    const setMobileViewportHeight = () => {
      const visualViewportHeight =
        getMobileVisualViewportHeightValue(isAndroid);
      const nextLayoutViewportHeight = getMobileViewportHeightValue();
      const keyboardOpen =
        layoutViewportHeight - visualViewportHeight > 120 ||
        nextLayoutViewportHeight - visualViewportHeight > 120;

      if (!keyboardOpen) {
        layoutViewportHeight = nextLayoutViewportHeight;
      }

      documentStyle.setProperty(
        MOBILE_VIEWPORT_HEIGHT_VAR,
        `${layoutViewportHeight}px`,
      );
      documentStyle.setProperty(
        MOBILE_VISUAL_VIEWPORT_HEIGHT_VAR,
        `${visualViewportHeight}px`,
      );
      keepAndroidComposerVisible();
    };
    const updateMobileViewportHeight = () => {
      if (viewportFrame !== undefined) {
        window.cancelAnimationFrame(viewportFrame);
      }

      viewportFrame = window.requestAnimationFrame(() => {
        viewportFrame = undefined;
        setMobileViewportHeight();
      });
    };
    const updateMobileViewportAfterFocus = () => {
      focusTimers.forEach(timer => window.clearTimeout(timer));
      updateMobileViewportHeight();
      // Some embedded WebViews report the final size after focus, without a resize event.
      focusTimers = [100, 350, 600].map(delay =>
        window.setTimeout(updateMobileViewportHeight, delay),
      );
    };
    const lockOuterScroll = () => {
      documentStyle.height = `var(${MOBILE_VIEWPORT_HEIGHT_VAR})`;
      documentStyle.overflow = 'hidden';
      documentStyle.setProperty('overscroll-behavior-y', 'none');
      bodyStyle.height = `var(${MOBILE_VIEWPORT_HEIGHT_VAR})`;
      bodyStyle.overflow = 'hidden';
      bodyStyle.setProperty('overscroll-behavior-y', 'none');
    };
    const { visualViewport } = window;
    const viewportEventOptions: AddEventListenerOptions = { passive: true };

    setMobileViewportHeight();
    lockOuterScroll();
    visualViewport?.addEventListener(
      'resize',
      updateMobileViewportHeight,
      viewportEventOptions,
    );
    visualViewport?.addEventListener(
      'scroll',
      updateMobileViewportHeight,
      viewportEventOptions,
    );
    window.addEventListener('resize', updateMobileViewportHeight);
    window.addEventListener('orientationchange', updateMobileViewportHeight);
    if (isAndroid) {
      document.addEventListener('focusin', updateMobileViewportAfterFocus);
      document.addEventListener('focusout', updateMobileViewportAfterFocus);
    }

    const eventOptions: AddEventListenerOptions = { passive: false };
    const preventDefault = (event: Event) => {
      event.preventDefault();
    };
    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    };

    document.addEventListener('gesturestart', preventDefault, eventOptions);
    document.addEventListener('gesturechange', preventDefault, eventOptions);
    document.addEventListener('gestureend', preventDefault, eventOptions);
    document.addEventListener('touchmove', preventPinchZoom, eventOptions);
    document.addEventListener('touchend', preventDoubleTapZoom, eventOptions);

    return () => {
      focusTimers.forEach(timer => window.clearTimeout(timer));
      if (viewportFrame !== undefined) {
        window.cancelAnimationFrame(viewportFrame);
      }

      visualViewport?.removeEventListener('resize', updateMobileViewportHeight);
      visualViewport?.removeEventListener('scroll', updateMobileViewportHeight);
      window.removeEventListener('resize', updateMobileViewportHeight);
      window.removeEventListener(
        'orientationchange',
        updateMobileViewportHeight,
      );
      if (isAndroid) {
        document.removeEventListener('focusin', updateMobileViewportAfterFocus);
        document.removeEventListener(
          'focusout',
          updateMobileViewportAfterFocus,
        );
      }
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);

      if (previousViewportHeight) {
        documentStyle.setProperty(
          MOBILE_VIEWPORT_HEIGHT_VAR,
          previousViewportHeight,
        );
      } else {
        documentStyle.removeProperty(MOBILE_VIEWPORT_HEIGHT_VAR);
      }
      if (previousVisualViewportHeight) {
        documentStyle.setProperty(
          MOBILE_VISUAL_VIEWPORT_HEIGHT_VAR,
          previousVisualViewportHeight,
        );
      } else {
        documentStyle.removeProperty(MOBILE_VISUAL_VIEWPORT_HEIGHT_VAR);
      }

      documentStyle.height = previousDocumentHeight;
      documentStyle.overflow = previousDocumentOverflow;
      if (previousDocumentOverscrollY) {
        documentStyle.setProperty(
          'overscroll-behavior-y',
          previousDocumentOverscrollY,
        );
      } else {
        documentStyle.removeProperty('overscroll-behavior-y');
      }
      bodyStyle.height = previousBodyHeight;
      bodyStyle.overflow = previousBodyOverflow;
      if (previousBodyOverscrollY) {
        bodyStyle.setProperty('overscroll-behavior-y', previousBodyOverscrollY);
      } else {
        bodyStyle.removeProperty('overscroll-behavior-y');
      }

      if (!viewportMeta) {
        return;
      }

      if (createdViewportMeta) {
        viewportMeta.remove();
      } else if (previousViewportContent === null) {
        viewportMeta.removeAttribute('content');
      } else {
        viewportMeta.setAttribute('content', previousViewportContent);
      }
    };
  }, [isAndroid, isMobile]);

  useEffect(() => {
    previewPaneWidthRef.current = previewPaneWidth;
  }, [previewPaneWidth]);

  const restorePreviewFullscreenSidebar = useCallback(() => {
    const previousCollapsed = previewFullscreenSidebarCollapsedRef.current;

    if (previousCollapsed === null) {
      return;
    }

    previewFullscreenSidebarCollapsedRef.current = null;
    setSidebarCollapsed(previousCollapsed);
  }, []);

  const clearPreviewFullscreenExitTimer = useCallback(() => {
    if (!previewFullscreenExitTimerRef.current) {
      return;
    }

    window.clearTimeout(previewFullscreenExitTimerRef.current);
    previewFullscreenExitTimerRef.current = undefined;
  }, []);

  const requestPreviewLayoutUpdate = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
  }, []);

  const finishPreviewFullscreenExit = useCallback(() => {
    previewFullscreenExitTimerRef.current = undefined;
    setPreviewFullscreenExiting(false);
    restorePreviewFullscreenSidebar();
    requestPreviewLayoutUpdate();
  }, [requestPreviewLayoutUpdate, restorePreviewFullscreenSidebar]);

  const exitPreviewFullscreen = useCallback(
    (options?: { immediate?: boolean }) => {
      const shouldExit =
        previewFullscreenExitTimerRef.current ||
        previewFullscreenSidebarCollapsedRef.current !== null;

      if (!shouldExit) {
        return;
      }

      clearPreviewFullscreenExitTimer();
      setPreviewFullscreen(false);

      if (options?.immediate) {
        setPreviewFullscreenExiting(false);
        restorePreviewFullscreenSidebar();
        requestPreviewLayoutUpdate();
        return;
      }

      setPreviewFullscreenExiting(true);
      previewFullscreenExitTimerRef.current = window.setTimeout(
        finishPreviewFullscreenExit,
        PREVIEW_FULLSCREEN_ANIMATION_MS,
      );
    },
    [
      clearPreviewFullscreenExitTimer,
      finishPreviewFullscreenExit,
      requestPreviewLayoutUpdate,
      restorePreviewFullscreenSidebar,
    ],
  );

  const enterPreviewFullscreen = useCallback(() => {
    clearPreviewFullscreenExitTimer();
    setPreviewFullscreenExiting(false);

    if (previewFullscreenSidebarCollapsedRef.current === null) {
      previewFullscreenSidebarCollapsedRef.current = sidebarCollapsed;
    }

    setSidebarCollapsed(true);
    setPreviewOpen(true);
    setPreviewFullscreen(true);
    requestPreviewLayoutUpdate();
  }, [
    clearPreviewFullscreenExitTimer,
    requestPreviewLayoutUpdate,
    sidebarCollapsed,
  ]);

  useEffect(
    () => () => {
      clearPreviewFullscreenExitTimer();
    },
    [clearPreviewFullscreenExitTimer],
  );

  const resetPreviewFullscreen = useCallback(() => {
    exitPreviewFullscreen({ immediate: true });
  }, [exitPreviewFullscreen]);

  const handlePreviewFullscreenExit = useCallback(() => {
    setPreviewFullscreen(false);
    exitPreviewFullscreen();
  }, [exitPreviewFullscreen]);

  useEffect(() => {
    let cancelled = false;

    setHomeSkills([]);

    if (isShareMode) {
      return () => {
        cancelled = true;
      };
    }

    const fetchSkills = authenticated
      ? fetchAgentHomeSkills({ lang, position: 'home' })
      : fetchAnonymousAgentHomeSkills({ lang, position: 'home' });

    fetchSkills
      .then(skills => {
        if (!cancelled) {
          setHomeSkills(skills);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authenticated, isShareMode, lang]);

  useEffect(() => {
    if (activeMode === 'none') {
      return;
    }

    const nextModeAvailable = modeOptions.some(
      option => !option.disabled && option.key === activeMode,
    );

    if (!nextModeAvailable) {
      setActiveMode('none');
    }
  }, [activeMode, modeOptions]);

  useEffect(() => {
    if (activeMode !== 'productFootprint') {
      setProductFootprintOpenPill(null);
      return undefined;
    }

    let cancelled = false;

    setProductFootprintFactorScopesLoading(true);
    getFactorScopes({ lang })
      .then(response => {
        if (cancelled) {
          return;
        }

        if (response.code === 200 && Array.isArray(response.data)) {
          setProductFootprintFactorScopeOptions(response.data);
          return;
        }

        setProductFootprintFactorScopeOptions([]);
      })
      .catch(() => {
        if (!cancelled) {
          setProductFootprintFactorScopeOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProductFootprintFactorScopesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeMode, lang]);

  useEffect(() => {
    if (!desktopPreviewVisible) {
      return undefined;
    }

    const handleResize = () => {
      setPreviewPaneWidth(prevWidth => clampPreviewPaneWidth(prevWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [clampPreviewPaneWidth, desktopPreviewVisible, sidebarCollapsed]);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isShareMode) {
      return undefined;
    }

    const handleAuthLogout = () => {
      streamAbortControllerRef.current?.abort();
      streamAbortControllerRef.current = null;
      activeStreamSessionIdRef.current = '';
      historyAbortControllerRef.current?.abort();
      loadedHistorySessionIdRef.current = '';
      loadedHistoryMessageIdRef.current = '';
      loadedHistorySessionStatusRef.current = '';
      setSubmitting(false);
      setHistoryLoading(false);
      setHistoryError('');
      setAuthenticated(false);
      setAgentGuideOpen(false);
      setAgentGuideStepIndex(0);
      setProjectSettingsProjectId('');
      setCurrentSessionId('');
      setConversationQuestionAttachments([]);
      setConversationQuestionTime('');
      setConversationQuestionReferenceCount(0);
      setConversationQuestionReferenceContents([]);
      clearSessionIdFromUrl({ history, location });
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
    };
  }, [history, isShareMode, location]);

  const requestLogin = useCallback(
    (triggerEntry: AgentLoginTriggerEntry) => {
      if (isShareMode || hasActiveToken()) {
        return;
      }

      setLoginTriggerEntry(triggerEntry);
      trackAgentLoginGateClick(triggerEntry);
      setLoginModalOpen(true);
    },
    [isShareMode],
  );

  const requireLogin = useCallback(
    (
      triggerEntry: AgentLoginTriggerEntry = 'other',
      promptImmediately = false,
    ) => {
      if (isShareMode) {
        return false;
      }

      const nextAuthenticated = hasActiveToken();
      setAuthenticated(nextAuthenticated);

      if (
        !nextAuthenticated &&
        (promptImmediately || anonymousExperienceConsumed)
      ) {
        requestLogin(triggerEntry);
      }

      return nextAuthenticated;
    },
    [anonymousExperienceConsumed, isShareMode, requestLogin],
  );

  useEffect(() => {
    if (
      !authenticated &&
      anonymousEligibilityLoginRequired &&
      !isFactorLandingMode
    ) {
      requestLogin('other');
    }
  }, [
    anonymousEligibilityLoginRequired,
    authenticated,
    isFactorLandingMode,
    requestLogin,
  ]);

  const bindLandingFactorToSession = useCallback(
    async (targetSessionId: string) => {
      if (!ccdbFactorDraft?.factorId) {
        return;
      }

      const bindingKey = `${targetSessionId}:${ccdbFactorDraft.factorId}`;
      if (boundCcdbFactorSessionsRef.current.has(bindingKey)) {
        const ref = ccdbSessionFactors.find(
          item =>
            String(item.factorId) === ccdbFactorDraft.factorId &&
            String(item.sessionId) === targetSessionId,
        );
        if (ref) return sessionFactorTarget(ref);
        if (ccdbFactorDraft.boundSessionId === targetSessionId)
          return ccdbFactorDraft;
      }

      try {
        const ref = await bindCcdbFactorToSession({
          factorId: ccdbFactorDraft.factorId,
          sessionId: targetSessionId,
          sourceShareId: ccdbFactorDraft.shareId,
        });
        const boundFactor = sessionFactorTarget(ref);
        boundCcdbFactorSessionsRef.current.add(bindingKey);
        setCcdbFactorDraft(boundFactor);
        return boundFactor;
      } catch (error) {
        throw new CcdbFactorBindingError(
          getCcdbErrorMessage(error) || I18N.ccdb.factorContextSaveError,
        );
      }
    },
    [ccdbFactorDraft, ccdbSessionFactors],
  );

  const handleLoginSuccess = useCallback(() => {
    clearCcdbReferral();
    setAuthenticated(true);
    setLoginModalOpen(false);
    syncCarbonAgentUserPermissions().catch(() => undefined);
    bindAnonymousExperienceSession()
      .then(anonymousSessionId => {
        if (
          anonymousSessionId &&
          (!isFactorLandingMode || ccdbFactorSubmittedRef.current)
        ) {
          bindLandingFactorToSession(anonymousSessionId).catch(() => undefined);
          syncSessionIdToUrl({
            history,
            location,
            preserveFactorLanding: true,
            sessionId: anonymousSessionId,
          });
        }
      })
      .catch(() => undefined);
  }, [
    bindAnonymousExperienceSession,
    bindLandingFactorToSession,
    history,
    isFactorLandingMode,
    location,
  ]);

  useEffect(() => {
    const settings = new URLSearchParams(location.search).get('settings');
    if (settings !== 'apiKeys' && settings !== 'authorizations') return;
    if (!authenticated) requestLogin('personal_settings');
    else if (isMobile) setMobileSidebarOpen(true);
  }, [authenticated, isMobile, location.search, requestLogin]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prevCollapsed => {
      const nextCollapsed = !prevCollapsed;
      persistSidebarCollapsed(nextCollapsed);
      return nextCollapsed;
    });
  };

  const handleOpenMobileSidebar = () => {
    setMobileProfileOpenRequested(false);
    setMobileSidebarOpen(true);
  };

  const handleOpenMobilePersonalCenter = () => {
    if (!requireLogin('personal_settings')) {
      return;
    }

    syncSessionIdToUrl({ history, location });
    resetHomeState('newChat');
    setMobileProfileOpenRequested(true);
    setMobileSidebarOpen(true);
  };

  const resetHomeState = (section: AgentSectionKey) => {
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    activeStreamSessionIdRef.current = '';
    historyAbortControllerRef.current?.abort();
    historyRequestIdRef.current += 1;
    loadedHistorySessionIdRef.current = '';
    loadedHistoryMessageIdRef.current = '';
    loadedHistorySessionStatusRef.current = '';
    selectedSessionRunHintRef.current = null;
    selectedConversationRef.current = null;
    submitRequestIdRef.current += 1;
    setSubmitting(false);
    setHistoryLoading(false);
    setHistoryError('');
    setMessage('');
    setComposerQuotes([]);
    setComposerAttachments([]);
    setLastSubmittedMessage('');
    setConversationQuestion('');
    setConversationQuestionAttachments([]);
    setConversationQuestionTime('');
    setConversationQuestionReferenceCount(0);
    setConversationQuestionReferenceContents([]);
    setCreatedConversation(null);
    setPendingReadSessionId('');
    setShareInfo(null);
    setCurrentSessionTitle('');
    setCurrentSessionId('');
    setConversationMessages([]);
    answerTextSegmentIndexRef.current = 0;
    answerToolCallsRef.current = [];
    autoOpenedBusinessCardRef.current.clear();
    autoOpenedEnterpriseProjectPreviewKeyRef.current = '';
    setAnswerBlocks([]);
    setAnswerCards([]);
    setAnswerControls(undefined);
    setAnswerToolCalls([]);
    setConversationStarted(false);
    resetPreviewFullscreen();
    setPreviewOpen(false);
    setPreviewTarget(undefined);
    setCcdbFactorTarget(undefined);
    setCcdbFactorDraft(undefined);
    ccdbFactorSubmittedRef.current = false;
    setPreviewTabTargets({});
    setPreviewTargets([]);
    setAccountBindStatus(DEFAULT_ACCOUNT_BIND_STATUS);
    setActiveMode('none');
    setActiveSection(section);
  };

  const handleNewChat = () => {
    if (!authenticated && anonymousExperienceConsumed) {
      requestLogin('menu');
      return;
    }

    setMobileSidebarOpen(false);
    syncSessionIdToUrl({ history, location });
    resetHomeState('newChat');
  };

  useEffect(() => {
    if (isShareMode || !projectInviteCode) {
      return undefined;
    }

    if (!authenticated) {
      return undefined;
    }

    if (acceptingProjectInviteCodeRef.current === projectInviteCode) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();
    acceptingProjectInviteCodeRef.current = projectInviteCode;

    acceptAgentProjectInvite(projectInviteCode, abortController.signal)
      .then(async project => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        const ownerCompanyId =
          project.ownerCompanyId === undefined ||
          project.ownerCompanyId === null
            ? ''
            : String(project.ownerCompanyId).trim();
        const currentCompanyId =
          workspaceAccess?.companyId === undefined ||
          workspaceAccess?.companyId === null
            ? ''
            : String(workspaceAccess.companyId).trim();

        if (
          ownerCompanyId &&
          currentCompanyId &&
          ownerCompanyId !== currentCompanyId
        ) {
          try {
            const workspaces = await teamApi.workspaces(abortController.signal);
            const targetWorkspace = workspaces.find(
              item => String(item.companyId) === ownerCompanyId,
            );

            if (!targetWorkspace) {
              antdMessage.warning(
                I18N.carbonAgent.teamProjectExternalForbiddenForInvite,
              );
              replaceUrlSearch({
                history,
                location,
                nextSearch: getSearchWithoutProjectInviteCode(location.search),
              });
              return;
            }

            if (!targetWorkspace.canEnter) {
              antdMessage.warning(
                I18N.template(
                  I18N.carbonAgent.teamProjectSeatRequiredForInvite,
                  {
                    val1:
                      targetWorkspace.companyName ||
                      project.ownerCompanyName ||
                      ownerCompanyId,
                  },
                ),
              );
              replaceUrlSearch({
                history,
                location,
                nextSearch: getSearchWithoutProjectInviteCode(location.search),
              });
              return;
            }

            antdMessage.success(
              I18N.template(I18N.carbonAgent.projectInviteAcceptSuccess, {
                val1: project.name,
              }),
            );
            await switchSpace(
              ownerCompanyId,
              `${location.pathname}?section=${encodeURIComponent(
                getProjectSectionKey(project.id),
              )}`,
            );
            return;
          } catch {
            // Fall through to current workspace navigation if workspace lookup fails
          }
        }

        setAgentGuideOpen(false);
        setProjectListRefreshKey(previousKey => previousKey + 1);
        antdMessage.success(
          I18N.template(I18N.carbonAgent.projectInviteAcceptSuccess, {
            val1: project.name,
          }),
        );
        syncSectionToUrl({
          history,
          location,
          section: getProjectSectionKey(project.id),
        });
      })
      .catch(error => {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : I18N.carbonAgent.projectInviteAcceptFailed;

        antdMessage.error(errorMessage);
        replaceUrlSearch({
          history,
          location,
          nextSearch: getSearchWithoutProjectInviteCode(location.search),
        });
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [
    authenticated,
    history,
    isShareMode,
    location,
    projectInviteCode,
    switchSpace,
    workspaceAccess?.companyId,
  ]);

  useEffect(() => {
    if (!isShareMode || !shareId) {
      return undefined;
    }

    let cancelled = false;
    const historyAbortController = new AbortController();
    const requestId = historyRequestIdRef.current + 1;
    const initialPreviewPreferredType =
      getBusinessPreviewPreferredTypeFromSearch(location.search);
    const initialSearchPreviewState = getBusinessPreviewStateFromSearch(
      location.search,
    );
    const initialPreviewState = excludeCbamDetailPreview(
      initialSearchPreviewState,
    );

    historyAbortControllerRef.current?.abort();
    historyAbortControllerRef.current = historyAbortController;
    historyRequestIdRef.current = requestId;
    submitRequestIdRef.current += 1;
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    activeStreamSessionIdRef.current = '';
    setSubmitting(false);
    setHistoryLoading(true);
    setHistoryError('');
    setShareExpired(false);
    setMessage('');
    setComposerQuotes([]);
    setComposerAttachments([]);
    setLastSubmittedMessage('');
    setConversationQuestion('');
    setConversationQuestionAttachments([]);
    setConversationQuestionTime('');
    setConversationQuestionReferenceCount(0);
    setConversationQuestionReferenceContents([]);
    setCreatedConversation(null);
    setShareInfo(null);
    setCurrentSessionTitle('');
    setCurrentSessionId('');
    setConversationMessages([]);
    answerTextSegmentIndexRef.current = 0;
    answerToolCallsRef.current = [];
    autoOpenedBusinessCardRef.current.clear();
    setAnswerBlocks([]);
    setAnswerCards([]);
    setAnswerControls(undefined);
    setAnswerToolCalls([]);
    setConversationStarted(true);
    resetPreviewFullscreen();
    setPreviewOpen(PREVIEW_PANE_ENABLED || Boolean(initialPreviewState.target));
    setPreviewTarget(initialPreviewState.target);
    setPreviewTabTargets(initialPreviewState.tabTargets);
    setPreviewTargets(initialPreviewState.targets);
    setAccountBindStatus(
      initialPreviewState.target ? 'HAS_ACCOUNT' : DEFAULT_ACCOUNT_BIND_STATUS,
    );
    setActiveMode('none');
    setActiveSection('newChat');

    const loadShareHistory = async () => {
      try {
        const nextHistory = await fetchAgentShareHistory(
          shareId,
          historyAbortController.signal,
        );

        if (
          cancelled ||
          historyAbortController.signal.aborted ||
          historyRequestIdRef.current !== requestId
        ) {
          return;
        }

        const resolvedSessionId =
          nextHistory.session.sessionId || nextHistory.share?.sessionId || '';
        const historyPreviewState = getBusinessPreviewStateFromMessages(
          nextHistory.messages,
          { includeWorkspaceToolCalls: false },
        );
        const sessionPreviewState = getBusinessPreviewStateFromSession(
          nextHistory.session,
        );
        const businessRefsPreviewState =
          await getBusinessPreviewStateFromShareBusinessRefs(
            nextHistory.businessRefs,
            shareId,
            historyAbortController.signal,
          );

        if (
          cancelled ||
          historyAbortController.signal.aborted ||
          historyRequestIdRef.current !== requestId
        ) {
          return;
        }
        const recoveredPreviewState = excludeCbamDetailPreview(
          mergeBusinessPreviewStates(
            businessRefsPreviewState,
            mergeBusinessPreviewStates(
              historyPreviewState,
              mergeBusinessPreviewStates(
                sessionPreviewState,
                initialSearchPreviewState,
              ),
            ),
          ),
        );
        const nextPreviewState = applyBusinessPreviewPreferredTab(
          recoveredPreviewState,
          initialPreviewPreferredType,
        );
        loadedHistorySessionIdRef.current = resolvedSessionId;
        loadedHistoryMessageIdRef.current = nextHistory.latestMessageId || '';
        loadedHistorySessionStatusRef.current =
          nextHistory.session.status || '';
        setShareInfo(nextHistory.share || null);
        setCurrentSessionId(resolvedSessionId);
        setCurrentSessionTitle(
          nextHistory.share?.title || nextHistory.session.title,
        );
        setConversationMessages(nextHistory.messages);
        setAccountBindStatus(
          nextPreviewState.target
            ? 'HAS_ACCOUNT'
            : nextHistory.session.accountBindStatus ||
                getAccountBindStatusFromValue(nextHistory) ||
                DEFAULT_ACCOUNT_BIND_STATUS,
        );
        resetPreviewFullscreen();
        setPreviewOpen(
          PREVIEW_PANE_ENABLED || Boolean(nextPreviewState.target),
        );
        setPreviewTarget(nextPreviewState.target);
        setPreviewTabTargets(nextPreviewState.tabTargets);
        setPreviewTargets(nextPreviewState.targets);
        setHistoryError('');
        setShareExpired(false);
      } catch (error) {
        if (
          !cancelled &&
          !historyAbortController.signal.aborted &&
          historyRequestIdRef.current === requestId
        ) {
          const isExpired = getAgentShareHistoryErrorCode(error) === 441;

          loadedHistorySessionIdRef.current = '';
          loadedHistoryMessageIdRef.current = '';
          loadedHistorySessionStatusRef.current = '';
          setShareInfo(null);
          setCurrentSessionId('');
          setCurrentSessionTitle('');
          setConversationMessages([]);
          setPreviewOpen(
            isExpired ? false : Boolean(initialPreviewState.target),
          );
          setPreviewTarget(isExpired ? undefined : initialPreviewState.target);
          setPreviewTabTargets(isExpired ? {} : initialPreviewState.tabTargets);
          setPreviewTargets(isExpired ? [] : initialPreviewState.targets);
          setShareExpired(isExpired);
          setHistoryError(
            isExpired ? '' : I18N.carbonAgent.shareLoadFailedRetry,
          );
        }
      } finally {
        if (historyAbortControllerRef.current === historyAbortController) {
          historyAbortControllerRef.current = null;
        }

        if (
          !cancelled &&
          !historyAbortController.signal.aborted &&
          historyRequestIdRef.current === requestId
        ) {
          setHistoryLoading(false);
        }
      }
    };

    loadShareHistory();

    return () => {
      cancelled = true;
      historyAbortController.abort();
    };
  }, [
    isShareMode,
    location.search,
    resetPreviewFullscreen,
    shareId,
    shareRetryKey,
  ]);

  useEffect(() => {
    if (isShareMode) {
      return undefined;
    }

    if (!authenticated) {
      historyAbortControllerRef.current?.abort();
      return;
    }

    if (!sessionIdFromParams) {
      historyAbortControllerRef.current?.abort();
      setHistoryLoading(false);
      setHistoryError('');

      if (!isFactorLandingMode)
        resetHomeState(getAgentSectionFromSearch(location.search));

      return;
    }

    if (!hasActiveToken()) {
      setAuthenticated(false);
      return;
    }

    if (sessionIdFromParams === loadedHistorySessionIdRef.current) {
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    const historyAbortController = new AbortController();
    const requestId = historyRequestIdRef.current + 1;
    const initialPreviewPreferredType =
      getBusinessPreviewPreferredTypeFromSearch(location.search);
    const initialSearchPreviewState = getBusinessPreviewStateFromSearch(
      location.search,
    );
    const initialPreviewState = initialSearchPreviewState;
    const selectedConversation = selectedConversationRef.current;
    const selectedProjectConversation =
      selectedConversation?.projectSession &&
      (selectedConversation.sessionId || selectedConversation.id) ===
        sessionIdFromParams &&
      selectedConversation.projectId === projectSessionProjectIdFromParams
        ? selectedConversation
        : undefined;
    const selectedConversationContext = projectSessionProjectIdFromParams
      ? selectedProjectConversation || {
          id: sessionIdFromParams,
          projectId: projectSessionProjectIdFromParams,
          projectSession: true,
          sessionId: sessionIdFromParams,
          time: '',
          title: '',
        }
      : undefined;

    historyAbortControllerRef.current?.abort();
    historyAbortControllerRef.current = historyAbortController;
    historyRequestIdRef.current = requestId;
    submitRequestIdRef.current += 1;
    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    activeStreamSessionIdRef.current = '';
    setSubmitting(false);
    setHistoryLoading(true);
    setHistoryError('');
    setMessage('');
    setComposerQuotes([]);
    setComposerAttachments([]);
    setLastSubmittedMessage('');
    setConversationQuestion('');
    setConversationQuestionAttachments([]);
    setConversationQuestionTime('');
    setConversationQuestionReferenceCount(0);
    setConversationQuestionReferenceContents([]);
    setCreatedConversation(selectedConversationContext || null);
    setCurrentSessionTitle('');
    setConversationMessages([]);
    answerTextSegmentIndexRef.current = 0;
    answerToolCallsRef.current = [];
    autoOpenedBusinessCardRef.current.clear();
    setAnswerBlocks([]);
    setAnswerCards([]);
    setAnswerControls(undefined);
    setAnswerToolCalls([]);
    setConversationStarted(true);
    resetPreviewFullscreen();
    setPreviewOpen(PREVIEW_PANE_ENABLED || Boolean(initialPreviewState.target));
    setPreviewTarget(initialPreviewState.target);
    setPreviewTabTargets(initialPreviewState.tabTargets);
    setPreviewTargets(initialPreviewState.targets);
    setAccountBindStatus(
      initialPreviewState.target ? 'HAS_ACCOUNT' : DEFAULT_ACCOUNT_BIND_STATUS,
    );
    setActiveMode('none');
    setActiveSection('footprintAccounting');

    const loadHistory = async () => {
      try {
        const nextHistory = await fetchAgentSessionHistory(
          sessionIdFromParams,
          historyAbortController.signal,
        );

        if (
          cancelled ||
          historyAbortController.signal.aborted ||
          historyRequestIdRef.current !== requestId
        ) {
          return;
        }

        const resolvedSessionId =
          nextHistory.session.sessionId || sessionIdFromParams;
        const runHint = selectedSessionRunHintRef.current;
        const matchedRunHint =
          runHint?.sessionId === resolvedSessionId ? runHint : undefined;
        const replayMessageId = matchedRunHint?.running
          ? matchedRunHint.messageId || nextHistory.latestMessageId || ''
          : '';
        const displayHistoryMessages = replayMessageId
          ? nextHistory.messages.filter(
              message =>
                message.role !== 'assistant' || message.id !== replayMessageId,
            )
          : nextHistory.messages;
        const historyPreviewState = getBusinessPreviewStateFromMessages(
          displayHistoryMessages,
          { includeWorkspaceToolCalls: false },
        );
        const sessionPreviewState = getBusinessPreviewStateFromSession(
          nextHistory.session,
        );
        const recoveredPreviewState = scopeBusinessPreviewStateToSearchAccount(
          mergeBusinessPreviewStates(historyPreviewState, sessionPreviewState),
          initialSearchPreviewState,
        );
        const nextPreviewState = applyBusinessPreviewPreferredTab(
          mergeBusinessPreviewStates(
            recoveredPreviewState,
            initialPreviewState,
          ),
          initialPreviewPreferredType,
        );
        loadedHistorySessionIdRef.current = resolvedSessionId;
        loadedHistoryMessageIdRef.current =
          matchedRunHint?.messageId || nextHistory.latestMessageId || '';
        loadedHistorySessionStatusRef.current =
          matchedRunHint?.running === true
            ? 'EXECUTING'
            : nextHistory.session.status || '';
        const historyConversation = selectedConversationContext
          ? {
              ...selectedConversationContext,
              ...nextHistory.session,
              canEditEnterprisePreview:
                nextHistory.session.canEditEnterprisePreview ??
                selectedConversationContext.canEditEnterprisePreview,
              canWrite:
                nextHistory.session.canWrite ??
                selectedConversationContext.canWrite,
              initiatedByMe:
                nextHistory.session.initiatedByMe ??
                selectedConversationContext.initiatedByMe,
              initiatorCompanyId:
                nextHistory.session.initiatorCompanyId ??
                selectedConversationContext.initiatorCompanyId,
              initiatorCompanyName:
                nextHistory.session.initiatorCompanyName ||
                selectedConversationContext.initiatorCompanyName,
              initiatorUserId:
                nextHistory.session.initiatorUserId ??
                selectedConversationContext.initiatorUserId,
              initiatorUserName:
                nextHistory.session.initiatorUserName ||
                selectedConversationContext.initiatorUserName,
              projectId: selectedConversationContext.projectId,
              sourceSessionId:
                nextHistory.session.sourceSessionId ||
                selectedConversationContext.sourceSessionId,
            }
          : {
              ...nextHistory.session,
              projectId: null,
            };

        selectedConversationRef.current = selectedConversationContext
          ? historyConversation
          : null;
        setCurrentSessionId(resolvedSessionId);
        setCurrentSessionTitle(historyConversation.title);
        setCreatedConversation(
          selectedConversationContext ? historyConversation : null,
        );
        if (resolvedSessionId !== sessionIdFromParams) {
          syncSessionIdToUrl({
            history,
            location,
            projectId: projectSessionProjectIdFromParams || undefined,
            sessionId: resolvedSessionId,
          });
        }
        setConversationMessages(displayHistoryMessages);
        setAccountBindStatus(
          nextPreviewState.target
            ? 'HAS_ACCOUNT'
            : nextHistory.session.accountBindStatus ||
                getAccountBindStatusFromValue(nextHistory) ||
                DEFAULT_ACCOUNT_BIND_STATUS,
        );
        resetPreviewFullscreen();
        setPreviewOpen(
          PREVIEW_PANE_ENABLED || Boolean(nextPreviewState.target),
        );
        setPreviewTarget(nextPreviewState.target);
        setPreviewTabTargets(nextPreviewState.tabTargets);
        setPreviewTargets(nextPreviewState.targets);
        setHistoryError('');
      } catch {
        if (
          !cancelled &&
          !historyAbortController.signal.aborted &&
          historyRequestIdRef.current === requestId
        ) {
          loadedHistorySessionIdRef.current = '';
          loadedHistoryMessageIdRef.current = '';
          loadedHistorySessionStatusRef.current = '';
          setCurrentSessionId(sessionIdFromParams);
          setCurrentSessionTitle('');
          setConversationMessages([]);
          setHistoryError(I18N.carbonAgent.historyLoadFailedRetry);
        }
      } finally {
        if (historyAbortControllerRef.current === historyAbortController) {
          historyAbortControllerRef.current = null;
        }

        if (
          !cancelled &&
          !historyAbortController.signal.aborted &&
          historyRequestIdRef.current === requestId
        ) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
      historyAbortController.abort();
    };
  }, [
    authenticated,
    history,
    historyRetryKey,
    isShareMode,
    location,
    resetPreviewFullscreen,
    sectionFromParams,
    sessionIdFromParams,
    projectSessionProjectIdFromParams,
  ]);

  useEffect(() => {
    if (isShareMode) {
      return;
    }

    if (sessionIdFromParams) {
      return;
    }

    loadedHistorySessionIdRef.current = '';
    loadedHistoryMessageIdRef.current = '';
    loadedHistorySessionStatusRef.current = '';
    selectedSessionRunHintRef.current = null;
    selectedConversationRef.current = null;
    setCurrentSessionId('');
    setCurrentSessionTitle('');
    setCreatedConversation(null);
    setShareInfo(null);
  }, [isShareMode, sessionIdFromParams]);

  useEffect(() => {
    if (
      !pendingReadSessionId ||
      historyLoading ||
      loadedHistorySessionIdRef.current !== pendingReadSessionId
    ) {
      return;
    }

    const lastReadTurnId = getLatestAssistantTurnId(conversationMessages);

    if (lastReadTurnId === undefined) {
      return;
    }

    const sessionId = pendingReadSessionId;

    setPendingReadSessionId('');
    markSessionTurnRead(sessionId, lastReadTurnId);
  }, [
    conversationMessages,
    historyLoading,
    markSessionTurnRead,
    pendingReadSessionId,
  ]);

  const handleHistorySelect = (conversation: AgentConversation) => {
    if (!requireLogin('sidebar')) {
      return;
    }

    setMobileSidebarOpen(false);
    setCcdbFactorDraft(undefined);
    setCcdbFactorTarget(undefined);
    ccdbFactorSubmittedRef.current = false;
    const sessionId = conversation.sessionId || conversation.id;

    selectedConversationRef.current = conversation.projectSession
      ? conversation
      : null;
    setCreatedConversation(conversation.projectSession ? conversation : null);
    selectedSessionRunHintRef.current = {
      messageId: conversation.runningMessageId || '',
      running: conversation.running === true,
      sessionId,
    };

    if (conversation.hasUnread) {
      setPendingReadSessionId(sessionId);
    }

    if (
      conversation.running &&
      sessionId === sessionIdFromParams &&
      !streamAbortControllerRef.current
    ) {
      loadedHistorySessionIdRef.current = '';
      setHistoryRetryKey(prevKey => prevKey + 1);
    }

    syncSessionIdToUrl({
      history,
      location,
      projectId:
        conversation.projectSession && conversation.projectId
          ? conversation.projectId
          : undefined,
      sessionId,
    });
  };

  const handleViewAllHistory = () => {
    if (!requireLogin('sidebar')) {
      return;
    }

    setMobileSidebarOpen(false);
    syncSectionToUrl({ history, location, section: 'history' });
    resetHomeState('history');
  };

  const handleReloadHistory = () => {
    if (!requireLogin() || !sessionIdFromParams) {
      return;
    }

    loadedHistorySessionIdRef.current = '';
    loadedHistoryMessageIdRef.current = '';
    loadedHistorySessionStatusRef.current = '';
    setHistoryRetryKey(prevKey => prevKey + 1);
  };

  const handleReloadShareHistory = () => {
    if (!shareId) {
      return;
    }

    loadedHistorySessionIdRef.current = '';
    loadedHistoryMessageIdRef.current = '';
    loadedHistorySessionStatusRef.current = '';
    setShareRetryKey(prevKey => prevKey + 1);
  };

  const handleShareExpiredExit = () => {
    const currentSearch = new URLSearchParams(location.search);
    const agentChannel = currentSearch.get('agentChannel');
    const nextSearch = new URLSearchParams();

    if (agentChannel) {
      nextSearch.set('agentChannel', agentChannel);
    }

    history.replace({
      pathname: '/system/carbonAgent',
      search: nextSearch.toString() ? `?${nextSearch.toString()}` : '',
    });
  };

  const handlePromptSelect = (nextMessage: string) => {
    if (!authenticated && anonymousExperienceConsumed) {
      requestLogin('composer_input');
      return;
    }

    setMessage(limitComposerMessage(nextMessage));
  };

  const handleProjectSuggestionSelect = (
    projectId: string,
    suggestion: AgentProjectSuggestion,
  ) =>
    submitConversationMessage(suggestion.message, {
      projectCreatePayload: {
        entry: 'project_home_suggestion',
        message: suggestion.message,
        pageContext: {
          entry: 'project_home_suggestion',
        },
        sourceSuggestionId: suggestion.suggestionId,
      },
      projectId,
      verifyProjectSessionHistory: true,
    });

  const handleProjectTaskConversationStart = (
    projectId: string,
    sourceTaskId: string,
  ) => {
    const taskMessage = I18N.carbonAgent.projectTaskConversationPrompt;

    return submitConversationMessage(taskMessage, {
      projectCreatePayload: {
        entry: 'project_task',
        message: taskMessage,
        sourceTaskId,
      },
      projectId,
      verifyProjectSessionHistory: true,
    });
  };

  const handleMessageChange = (nextMessage: string) => {
    if (projectConversationReadonly) {
      return;
    }

    setMessage(limitComposerMessage(nextMessage));
  };

  const handleComposerQuoteSelect = (quote: AgentMessageReference) => {
    if (!requireLogin('composer_input') || projectConversationReadonly) {
      return;
    }

    if (submitting) {
      antdMessage.info(I18N.carbonAgent.generatingCannotQuote);
      return;
    }

    const nextQuote = normalizeComposerReference(quote);

    if (!nextQuote) {
      return;
    }

    setComposerQuotes(prevQuotes => {
      const nextQuoteKey = getComposerReferenceKey(nextQuote);

      return prevQuotes.some(
        prevQuote => getComposerReferenceKey(prevQuote) === nextQuoteKey,
      )
        ? prevQuotes
        : [...prevQuotes, nextQuote];
    });
  };

  const handleAccountSuggestionReferenceSelect = (content: string) => {
    handleComposerQuoteSelect({
      content,
      type: 'message',
    });
  };

  const handleComposerQuoteRemove = (quoteIndex: number) => {
    setComposerQuotes(prevQuotes =>
      prevQuotes.filter((_, index) => index !== quoteIndex),
    );
  };

  const handleComposerFileRemove = (fileId: string) => {
    setComposerAttachments(prevAttachments =>
      prevAttachments.filter(attachment => attachment.id !== fileId),
    );
  };

  const handleAttachmentDownload = async (attachment: AgentChatAttachment) => {
    if (attachment.projectId && attachment.assetId) {
      try {
        const projectFile = await fetchAgentProjectFileDownloadUrl(
          attachment.projectId,
          attachment.assetId,
        );

        if (!projectFile.downloadUrl) {
          throw new Error(I18N.carbonAgent.projectFileDownloadUnavailable);
        }

        triggerAgentFileDownload({
          filename: projectFile.fileName || attachment.name,
          url: projectFile.downloadUrl,
        });
      } catch (error) {
        antdMessage.error(
          error instanceof Error
            ? error.message
            : I18N.carbonAgent.fileDownloadFailedRetry,
        );
      }

      return;
    }

    const fallbackSessionId = currentSessionId || sessionIdFromParams;
    const sessionId = attachment.sessionId || fallbackSessionId;
    const downloadShareId = isShareMode ? shareId : undefined;
    const preparedDownloadWindow =
      attachment.fileId && (sessionId || downloadShareId)
        ? prepareAgentFileDownloadWindow()
        : undefined;

    if (!attachment.fileId || (!sessionId && !downloadShareId)) {
      if (attachment.url) {
        triggerAgentFileDownload({
          filename: attachment.name,
          url: attachment.url,
        });
        return;
      }

      antdMessage.warning(I18N.carbonAgent.missingDownloadInfo);
      return;
    }

    try {
      const fileData = downloadShareId
        ? await fetchAgentSharedFileDownloadUrl({
            fileId: attachment.fileId,
            shareId: downloadShareId,
          })
        : await fetchAgentWorkspaceFileDownloadUrl({
            fileId: attachment.fileId,
            sessionId,
          });
      const { downloadUrl } = fileData;

      if (!downloadUrl) {
        throw new Error(I18N.carbonAgent.emptyDownloadLink);
      }

      triggerAgentFileDownload({
        downloadWindow: preparedDownloadWindow,
        filename: fileData.filename || fileData.name || attachment.name,
        url: downloadUrl,
      });
    } catch (error) {
      closePreparedAgentFileDownloadWindow(preparedDownloadWindow);

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry;

      antdMessage.error(errorMessage);
    }
  };

  const handleComposerFilesSelect = (
    files: File[],
    materialOrigin?: AgentMonitorMaterialOrigin,
  ) => {
    if (conversationReadonly) {
      return;
    }

    if (!authenticated && anonymousExperienceConsumed) {
      requestLogin('file_upload');
      return;
    }

    if (submitting) {
      antdMessage.info(I18N.carbonAgent.sendingCannotUpload);
      return;
    }

    const remainingSlots =
      MAX_COMPOSER_ATTACHMENTS - composerAttachments.length;

    if (remainingSlots <= 0) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.maxUploadFiles, {
          val1: MAX_COMPOSER_ATTACHMENTS,
        }),
      );
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.maxUploadFilesSelected, {
          val1: MAX_COMPOSER_ATTACHMENTS,
          val2: remainingSlots,
        }),
      );
    }

    const selectedFileNames = new Set<string>();
    const validFiles = selectedFiles.filter(file => {
      const normalizedFileName = getNormalizedAttachmentName(file.name);

      if (!normalizedFileName) {
        antdMessage.error(I18N.carbonAgent.emptyFileName);
        return false;
      }

      if (!isAcceptedAttachment(file)) {
        antdMessage.error(
          I18N.template(I18N.carbonAgent.fileTypeUnsupported, {
            val1: file.name,
            val2: AGENT_ATTACHMENT_ACCEPT_EXTENSIONS.join('、'),
          }),
        );
        return false;
      }

      if (file.size <= 0) {
        antdMessage.error(
          I18N.template(I18N.carbonAgent.fileEmpty, { val1: file.name }),
        );
        return false;
      }

      if (file.size > MAX_COMPOSER_ATTACHMENT_SIZE) {
        antdMessage.error(
          I18N.template(I18N.carbonAgent.fileTooLarge, { val1: file.name }),
        );
        return false;
      }

      if (
        composerAttachments.some(
          attachment =>
            getNormalizedAttachmentName(attachment.name) === normalizedFileName,
        ) ||
        selectedFileNames.has(normalizedFileName)
      ) {
        antdMessage.warning(
          I18N.template(I18N.carbonAgent.fileAlreadyAdded, { val1: file.name }),
        );
        return false;
      }

      selectedFileNames.add(normalizedFileName);
      return true;
    });

    if (!validFiles.length) {
      return;
    }

    let addedMaterialOrigin: AgentMonitorMaterialOrigin | undefined;
    try {
      addedMaterialOrigin = resolveAddedMaterialOrigin(
        composerAttachments,
        activeConversationSessionId,
        materialOrigin,
      );
    } catch {
      antdMessage.warning(I18N.cbamMonitor.agentMaterialOriginConflict);
      return;
    }

    const pendingAttachments = validFiles.map((file, index) => ({
      materialOrigin: addedMaterialOrigin,
      materialOriginSessionId: addedMaterialOrigin
        ? activeConversationSessionId
        : undefined,
      id: `agent_file_${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      type: file.type,
    }));

    setComposerAttachments(prevAttachments => [
      ...prevAttachments,
      ...pendingAttachments,
    ]);

    validFiles.forEach((file, index) => {
      const attachmentId = pendingAttachments[index].id;

      const uploadAttachment = authenticated
        ? uploadAgentAttachment(file)
        : uploadAnonymousExperienceAttachment(file);

      uploadAttachment
        .then(uploadedFile => {
          setComposerAttachments(prevAttachments =>
            prevAttachments.map(attachment =>
              attachment.id === attachmentId
                ? {
                    ...attachment,
                    fileId: uploadedFile.fileId,
                    name: uploadedFile.name,
                    sessionId: uploadedFile.sessionId,
                    status: 'done' as const,
                    url: uploadedFile.url,
                  }
                : attachment,
            ),
          );
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : I18N.carbonAgent.fileUploadFailed;

          setComposerAttachments(prevAttachments =>
            prevAttachments.map(attachment =>
              attachment.id === attachmentId
                ? {
                    ...attachment,
                    error: errorMessage,
                    status: 'error' as const,
                  }
                : attachment,
            ),
          );
          antdMessage.error(
            I18N.template(I18N.carbonAgent.fileUploadFailedDetail, {
              val1: file.name,
              val2: errorMessage,
            }),
          );
        });
    });
  };

  const handleProjectComposerFileSelect = (file: AgentProjectFile) => {
    if (!requireLogin('file_upload') || conversationReadonly) {
      return;
    }

    if (submitting) {
      antdMessage.info(I18N.carbonAgent.sendingCannotUpload);
      return;
    }

    if (composerAttachments.length >= MAX_COMPOSER_ATTACHMENTS) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.maxUploadFiles, {
          val1: MAX_COMPOSER_ATTACHMENTS,
        }),
      );
      return;
    }

    if (
      composerAttachments.some(
        attachment =>
          attachment.fileId === file.fileId ||
          getNormalizedAttachmentName(attachment.name) ===
            getNormalizedAttachmentName(file.fileName),
      )
    ) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.fileAlreadyAdded, {
          val1: file.fileName,
        }),
      );
      return;
    }

    setComposerAttachments(currentAttachments => [
      ...currentAttachments,
      {
        assetId: file.assetId,
        fileId: file.fileId,
        id: `project_asset_${file.assetId}`,
        name: file.fileName,
        projectId: file.projectId,
        size: file.fileSize || 0,
        status: 'done',
        type: file.fileType || '',
      },
    ]);
  };

  const handleProjectFileContextSelect = (
    file: AgentProjectFile,
    promptText?: string,
  ) => {
    if (!requireLogin('file_upload') || conversationReadonly) {
      return;
    }

    if (submitting) {
      antdMessage.info(I18N.carbonAgent.sendingCannotUpload);
      return;
    }

    setComposerAttachments(currentAttachments => {
      const alreadyAdded = currentAttachments.some(
        attachment =>
          attachment.fileId === file.fileId ||
          getNormalizedAttachmentName(attachment.name) ===
            getNormalizedAttachmentName(file.fileName),
      );

      if (
        alreadyAdded ||
        currentAttachments.length >= MAX_COMPOSER_ATTACHMENTS
      ) {
        return currentAttachments;
      }

      return [
        ...currentAttachments,
        {
          assetId: file.assetId,
          fileId: file.fileId,
          id: `project_asset_${file.assetId}`,
          name: file.fileName,
          projectId: file.projectId,
          size: file.fileSize || 0,
          status: 'done' as const,
          type: file.fileType || '',
        },
      ];
    });

    if (promptText) {
      setMessage(promptText);
    }

    antdMessage.success(
      I18N.template(I18N.carbonAgent.projectFileAddedToConversation, {
        val1: file.fileName,
      }),
    );
  };

  const clearFileDropActive = () => {
    fileDragDepthRef.current = 0;
    setFileDropActive(false);
  };

  const handleIncomingComposerFiles = (files: File[]) => {
    if (!files.length || loginModalOpen) {
      return;
    }

    if (!composerUploadAvailable) {
      antdMessage.info(I18N.carbonAgent.backToConversationToUpload);
      return;
    }

    handleComposerFilesSelect(files);
  };

  const handlePageDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasTransferFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (!composerUploadAvailable || submitting) {
      return;
    }

    fileDragDepthRef.current += 1;
    setFileDropActive(true);
  };

  const handlePageDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasTransferFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect =
      composerUploadAvailable && !submitting ? 'copy' : 'none';
  };

  const handlePageDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasTransferFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (!composerUploadAvailable || submitting) {
      return;
    }

    fileDragDepthRef.current = Math.max(fileDragDepthRef.current - 1, 0);

    if (fileDragDepthRef.current === 0) {
      setFileDropActive(false);
    }
  };

  const handlePageDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    const files = getFilesFromDataTransfer(event.dataTransfer);

    if (!hasTransferFiles(event.dataTransfer) && !files.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    clearFileDropActive();
    handleIncomingComposerFiles(files);
  };

  const handlePagePaste = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const files = getFilesFromClipboardData(event.clipboardData);

    if (!files.length || loginModalOpen) {
      return;
    }

    event.preventDefault();
    handleIncomingComposerFiles(files);
  };

  const handleModeChange = (nextMode: ModeKey) => {
    if (projectConversationReadonly) {
      return;
    }

    if (!authenticated && anonymousExperienceConsumed) {
      requestLogin('composer_input');
      return;
    }

    const resolvedMode = activeMode === nextMode ? 'none' : nextMode;

    setActiveMode(resolvedMode);
  };

  const handleSectionSelect = (nextSection: AgentSectionKey) => {
    const normalizedSection =
      nextSection === 'productFootprint' ? 'footprintAccounting' : nextSection;
    const projectEntry =
      normalizedSection.startsWith('project:') ||
      normalizedSection.startsWith('projectComparison:') ||
      normalizedSection.startsWith('projectFiles:') ||
      normalizedSection.startsWith('projectOverview:') ||
      normalizedSection.startsWith('projectTasks:');

    if (!requireLogin(projectEntry ? 'project_entry' : 'menu', true)) {
      return;
    }

    setMobileSidebarOpen(false);

    if (isEnterpriseSection(normalizedSection)) {
      history.push({
        pathname: location.pathname,
        search: enterpriseSearch(location.search, normalizedSection),
      });
      resetHomeState(normalizedSection);
      return;
    }

    if (normalizedSection === 'footprintAccounting') {
      syncSectionToUrl({
        history,
        location,
        section: 'footprintAccounting',
      });
      resetHomeState('footprintAccounting');
      return;
    }

    if (normalizedSection === 'enterpriseCarbon') {
      syncSectionToUrl({ history, location, section: 'enterpriseCarbon' });
      resetHomeState('enterpriseCarbon');
      return;
    }

    if (normalizedSection === 'factorLibrary') {
      syncSectionToUrl({ history, location, section: 'factorLibrary' });
      resetHomeState('factorLibrary');
      return;
    }

    if (normalizedSection === 'history') {
      syncSectionToUrl({ history, location, section: 'history' });
      resetHomeState('history');
      return;
    }

    if (normalizedSection === 'cbamFiles') {
      syncSectionToUrl({ history, location, section: 'cbamFiles' });
      resetHomeState('cbamFiles');
      return;
    }

    if (normalizedSection === 'issueFeedback') {
      issueFeedbackContextRef.current = {
        sessionId: activeConversationSessionId,
        sessionTitle: activeConversationTitle,
        sourcePath: `${window.location.pathname}${window.location.search}`,
      };
      syncSectionToUrl({ history, location, section: 'issueFeedback' });
      resetHomeState('issueFeedback');
      return;
    }

    if (
      normalizedSection.startsWith('project:') ||
      normalizedSection.startsWith('projectComparison:') ||
      normalizedSection.startsWith('projectFiles:') ||
      normalizedSection.startsWith('projectOverview:') ||
      normalizedSection.startsWith('projectTasks:')
    ) {
      if (normalizedSection.startsWith('projectTasks:')) {
        setFocusedProjectTaskId('');
      }
      syncSectionToUrl({ history, location, section: normalizedSection });
      resetHomeState(normalizedSection);
      return;
    }

    setActiveSection(normalizedSection);
  };

  const dismissCurrentContextInsightBanner = () => {
    const currentBanner = contextInsightBanner;

    clearContextInsight();

    if (currentBanner?.bannerType) {
      dismissAgentContextInsight(currentBanner.bannerType).catch(
        () => undefined,
      );
    }

    return currentBanner;
  };

  const handleContextInsightAction = () => {
    const currentBanner = dismissCurrentContextInsightBanner();

    if (currentBanner?.category === 'INVITE') {
      if (isMobile) {
        setMobileSidebarOpen(true);
      }
      setInviteOpenRequestKey(prevKey => prevKey + 1);
      return;
    }

    if (currentBanner?.category === 'FEEDBACK') {
      handleSectionSelect('issueFeedback');
    }
  };

  const handleProjectTasksOpen = (projectId: string, taskId?: string) => {
    handleSectionSelect(getProjectTasksSectionKey(projectId));
    setFocusedProjectTaskId(taskId || '');
  };

  const handleProjectFilesOpen = (projectId: string) => {
    handleSectionSelect(getProjectFilesSectionKey(projectId));
  };

  const handleQuestionChange = (nextQuestion: string) => {
    if (!authenticated && anonymousExperienceConsumed) {
      requestLogin('composer_input');
      return;
    }

    setConversationQuestion(limitComposerMessage(nextQuestion));
  };

  const handlePreviewOpen = () => {
    if (!isShareMode && !ccdbFactorTarget && !requireLogin()) {
      return;
    }

    resetPreviewFullscreen();
    if (previewTargetRef.current?.type === 'cbamMonitor') {
      monitorPreviewExplicitlyClosedRef.current = false;
    }
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    if (!isShareMode && !ccdbFactorTarget && !requireLogin()) {
      return;
    }

    resetPreviewFullscreen();
    if (previewTargetRef.current?.type === 'cbamMonitor') {
      monitorPreviewExplicitlyClosedRef.current = true;
    }
    setPreviewOpen(false);
  };

  const handlePreviewFullscreenToggle = () => {
    if (!isShareMode && !ccdbFactorTarget && !requireLogin()) {
      return;
    }

    if (previewFullscreen || previewFullscreenExiting) {
      if (previewFullscreenExiting) {
        return;
      }

      handlePreviewFullscreenExit();
      return;
    }

    enterPreviewFullscreen();
  };

  const handleMobileHeaderBack = () => {
    if (activeProjectComparisonId) {
      handleSectionSelect(
        getProjectOverviewSectionKey(activeProjectComparisonId),
      );
      return;
    }

    if (
      activeProjectOverviewId ||
      activeProjectTasksId ||
      activeProjectFilesId
    ) {
      handleSectionSelect(
        getProjectSectionKey(
          activeProjectOverviewId ||
            activeProjectTasksId ||
            activeProjectFilesId,
        ),
      );
      return;
    }

    if (
      !conversationStarted &&
      (activeSection === 'footprintAccounting' ||
        activeSection === 'enterpriseCarbon' ||
        activeSection === 'history' ||
        activeSection === 'cbamFiles')
    ) {
      handleNewChat();
    }
  };

  const requestPreviewActiveTab = (
    key: PreviewTabKey,
    year?: string,
    target?: BusinessCardPreviewTarget,
  ) => {
    setPreviewActiveTabRequest(prevRequest => ({
      accountId: getBusinessPreviewTargetAccountId(target) || undefined,
      enterpriseCarbonBizId:
        getScalarValue(target?.enterpriseCarbonBizId) || undefined,
      key,
      planId: getScalarValue(target?.planId) || undefined,
      reportId: getScalarValue(target?.reportId) || undefined,
      reportUrl: getScalarValue(target?.reportUrl) || undefined,
      token: (prevRequest?.token || 0) + 1,
      year,
    }));
  };

  useEffect(() => {
    if (
      isShareMode ||
      historyLoading ||
      !conversationStarted ||
      !activeConversationProjectId ||
      !activeConversationSessionId
    ) {
      return;
    }

    const target = getEnterpriseProjectAccountingPreviewTarget(
      activeProjectConversationProject,
    );

    if (!target?.year) {
      return;
    }

    const autoOpenKey = [
      activeConversationSessionId,
      activeConversationProjectId,
      target.year,
      target.orgId || '',
    ].join('|');

    if (hasBusinessPreviewTarget) {
      return;
    }

    if (autoOpenedEnterpriseProjectPreviewKeyRef.current === autoOpenKey) {
      return;
    }

    autoOpenedEnterpriseProjectPreviewKeyRef.current = autoOpenKey;

    setAccountBindStatus('HAS_ACCOUNT');
    setPreviewTarget(target);
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      enterpriseCarbonAccounting: target,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, target),
    );
    setPreviewActiveTabRequest(prevRequest => ({
      enterpriseCarbonBizId: target.enterpriseCarbonBizId,
      key: 'enterpriseCarbonAccounting',
      token: (prevRequest?.token || 0) + 1,
      year: target.year,
    }));
    setPreviewOpen(true);
  }, [
    activeConversationProjectId,
    activeConversationSessionId,
    activeProjectConversationProject,
    conversationStarted,
    hasBusinessPreviewTarget,
    historyLoading,
    isShareMode,
  ]);

  const handleLiveWorkspaceOpen = (session?: AgentWorkspaceLiveSession) => {
    if (!isShareMode && !requireLogin()) {
      return;
    }

    const workspaceTarget = normalizeBusinessPreviewTarget(
      (session
        ? {
            title: session.provider || I18N.carbonAgent.workspaceLiveSession,
            type: 'workspace' as const,
            workspaceLiveSession: session,
          }
        : undefined) ||
        [...previewTargetsForPane]
          .reverse()
          .find(target => target.type === 'workspace') ||
        (previewTarget?.type === 'workspace' ? previewTarget : undefined) ||
        previewWorkspaceTarget,
    );

    if (!workspaceTarget) {
      return;
    }

    setPreviewTarget(prevTarget =>
      mergeBusinessPreviewTargetWithExisting(prevTarget, workspaceTarget),
    );
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      workspace:
        mergeBusinessPreviewTargetWithExisting(
          prevTargets.workspace,
          workspaceTarget,
        ) || workspaceTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, workspaceTarget),
    );
    requestPreviewActiveTab('workspace');
    setPreviewOpen(true);
  };

  const openEnterpriseCarbonCertificationPreview = (
    target: EnterpriseCarbonCertificationTarget,
  ) => {
    const nextTarget = normalizeBusinessPreviewTarget(target);

    if (!nextTarget) {
      return;
    }

    setPreviewTarget(nextTarget);
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      enterpriseCarbonCertification: nextTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, nextTarget),
    );
    requestPreviewActiveTab(
      'enterpriseCarbonCertification',
      getScalarValue(nextTarget.year) || undefined,
      nextTarget,
    );
    setPreviewOpen(true);
  };

  const handleEnterpriseCarbonCertificationCancel = () => {
    setEnterpriseCarbonCertificationRequest(undefined);
  };

  const handleEnterpriseCarbonCertificationConfirm = () => {
    if (
      enterpriseCarbonReviewCertificationReadonly ||
      !enterpriseCarbonCertificationRequest
    ) {
      return;
    }

    const target = enterpriseCarbonCertificationRequest;
    const nextTarget: EnterpriseCarbonCertificationTarget = {
      ...target,
      enterpriseCarbonCertificationDraft: true,
      enterpriseCarbonCertificationPageType:
        ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD,
    };

    setEnterpriseCarbonCertificationRequest(undefined);
    openEnterpriseCarbonCertificationPreview(nextTarget);
  };

  const openEnterpriseCarbonExpertReviewPreview = (
    target: EnterpriseCarbonExpertReviewTarget,
    options?: { focus?: boolean },
  ) => {
    const detail = target.reviewDetail || target.reviewDetails?.[0];
    let { reviewDetails } = target;

    if (!reviewDetails?.length && detail) {
      reviewDetails = [detail];
    }

    const nextTarget = normalizeBusinessPreviewTarget({
      enterpriseCarbonBizId: target.enterpriseCarbonBizId,
      enterpriseCarbonBizType: target.enterpriseCarbonBizType,
      enterpriseCarbonExpertReviewDetail: detail,
      enterpriseCarbonExpertReviewDetails: reviewDetails,
      enterpriseCarbonSnapshot: target.snapshot,
      orgId: target.orgId,
      reportId: target.reportId,
      title: I18N.carbonAgent.expertReview,
      type: 'enterpriseCarbonExpertReview',
      year: target.year,
    });

    if (!nextTarget) {
      return;
    }

    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      enterpriseCarbonExpertReview:
        mergeBusinessPreviewTargetWithExisting(
          prevTargets.enterpriseCarbonExpertReview,
          nextTarget,
        ) || nextTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, nextTarget),
    );

    if (options?.focus === false) {
      return;
    }

    setPreviewTarget(nextTarget);
    requestPreviewActiveTab(
      'enterpriseCarbonExpertReview',
      getScalarValue(nextTarget.year) || undefined,
      nextTarget,
    );
    setPreviewOpen(true);
  };

  const enterpriseCarbonExpertReview = useEnterpriseCarbonExpertReview({
    autoRestoreAccountContexts:
      enterpriseCarbonExpertReviewAccountRestoreContexts,
    autoRestoreEnabled: conversationStarted,
    autoRestoreSourceContext: enterpriseCarbonExpertReviewSourceContext,
    onOpenDetail: openEnterpriseCarbonExpertReviewPreview,
    readonly: isShareMode,
  });

  const getEnterpriseCarbonPreviewContext = (
    target?: BusinessCardPreviewTarget,
  ): EnterpriseCarbonExpertReviewContext | undefined =>
    getEnterpriseCarbonExpertReviewContextFromTarget(
      target,
      activeConversationSessionId,
    );

  const handlePreviewEnterpriseCarbonExpertReviewOpen = (
    target?: BusinessCardPreviewTarget,
  ) => {
    if (
      !requireLogin() ||
      isMobile ||
      enterpriseCarbonReviewCertificationReadonly
    ) {
      return;
    }

    let context = getEnterpriseCarbonPreviewContext(target);

    if (!context) {
      context = enterpriseCarbonExpertReviewSourceContext;
    }

    if (!context) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonExpertReviewMissingContext,
      );
      return;
    }

    enterpriseCarbonExpertReview.open({
      ...context,
      reviewDetail: target?.enterpriseCarbonExpertReviewDetail,
      reviewDetails: target?.enterpriseCarbonExpertReviewDetails,
      type: 'enterpriseCarbonExpertReview',
    });
  };

  const handlePreviewEnterpriseCarbonThirdPartyCertificationOpen = async (
    target?: BusinessCardPreviewTarget,
    options?: { forceNew?: boolean },
  ) => {
    if (
      !requireLogin() ||
      isMobile ||
      enterpriseCarbonReviewCertificationReadonly
    ) {
      return;
    }

    const context = getEnterpriseCarbonPreviewContext(target);

    if (!context) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonCertificationMissingYear,
      );
      return;
    }

    const year = getScalarValue(context.year);

    if (!year) {
      antdMessage.warning(
        I18N.carbonAgent.enterpriseCarbonCertificationMissingYear,
      );
      return;
    }

    let existingCertificationDetails =
      target?.enterpriseCarbonCertificationDetails;

    if (!existingCertificationDetails?.length) {
      const existingYear = getScalarValue(
        previewEnterpriseCarbonCertificationTarget?.year,
      );

      if (existingYear === year) {
        existingCertificationDetails =
          previewEnterpriseCarbonCertificationTarget?.enterpriseCarbonCertificationDetails;
      }
    }

    const requestTarget: EnterpriseCarbonCertificationTarget = {
      enterpriseCarbonBizId: context.enterpriseCarbonBizId,
      enterpriseCarbonBizType: context.enterpriseCarbonBizType || 'account',
      enterpriseCarbonCertificationDetails: existingCertificationDetails,
      enterpriseCarbonCertificationPageType: 'add',
      orgId: context.orgId,
      type: 'enterpriseCarbonCertification',
      year,
    };

    if (options?.forceNew) {
      setEnterpriseCarbonCertificationRequest(requestTarget);
      return;
    }

    setPreviewEnterpriseCarbonCertificationChecking(true);

    try {
      const certificationDetails = await fetchEnterpriseCarbonCertificationList(
        { year },
      );
      const certificationDetail = certificationDetails[0];

      if (certificationDetail) {
        openEnterpriseCarbonCertificationPreview({
          ...requestTarget,
          enterpriseCarbonCertificationDetails: certificationDetails,
          enterpriseCarbonCertificationPageType:
            getEnterpriseCarbonCertificationPageType(certificationDetail),
        });
        return;
      }

      setEnterpriseCarbonCertificationRequest(requestTarget);
    } catch {
      antdMessage.error(
        I18N.carbonAgent.thirdPartyCertificationStatusLoadFailed,
      );
    } finally {
      setPreviewEnterpriseCarbonCertificationChecking(false);
    }
  };

  const handleCcdbFactorOpen = useCallback(
    (target: CcdbFactorPreviewTarget) => {
      if (!ccdbFactorTarget) {
        setPreviewPaneWidth(
          clampPreviewPaneWidth(Math.min(720, window.innerWidth * 0.46)),
        );
      }
      if (
        sessionIdFromParams &&
        !target.boundSessionId &&
        (ccdbSessionFactorsLoading || ccdbSessionFactorsError)
      ) {
        antdMessage.info(ccdbSessionFactorsError || I18N.ccdb.loadingFactor);
        return;
      }
      const boundRef = ccdbSessionFactors.find(
        ref => String(ref.factorId) === String(target.factorId),
      );
      setCcdbFactorTarget(
        boundRef
          ? sessionFactorTarget(boundRef)
          : {
              ...target,
              publicAccess: !authenticated,
              entrySource: target.entrySource || 'CHAT',
            },
      );
      resetPreviewFullscreen();
      setPreviewOpen(true);
    },
    [
      authenticated,
      ccdbFactorTarget,
      ccdbSessionFactors,
      ccdbSessionFactorsLoading,
      ccdbSessionFactorsError,
      sessionIdFromParams,
      clampPreviewPaneWidth,
      resetPreviewFullscreen,
    ],
  );

  const handleCcdbFactorLoaded = useCallback((detail: CcdbFactorDetail) => {
    setCcdbFactorDraft(currentDraft =>
      currentDraft?.factorId === detail.factorId && !currentDraft.detail
        ? { ...currentDraft, detail }
        : currentDraft,
    );
  }, []);

  const handleCcdbFactorShare = useCallback(
    (targetFactorId: string) => {
      if (!authenticated) {
        if (isMobile) setPreviewOpen(false);
        requestLogin('other');
        return undefined;
      }

      return createCcdbFactorShare(targetFactorId).then(result => {
        if (!result.shareUrl) {
          throw new Error(I18N.ccdb.shareCreateFailed);
        }

        return result.shareUrl;
      });
    },
    [authenticated, isMobile, requestLogin],
  );

  const handleBusinessCardOpen = (target: BusinessCardPreviewTarget) => {
    if (
      target.type === 'carbonLabel' &&
      !canDisplayCarbonLabel(conversationReadonly, shareId, window.innerWidth)
    ) {
      return;
    }

    if (isShareMode && isCbamDetailPreview(target)) {
      return;
    }

    if (!isShareMode && !requireLogin()) {
      return;
    }

    setCcdbFactorTarget(undefined);

    const targetShareAuth = getScalarValue(target.shareAuth) || undefined;

    if (target.type === 'workspace' && target.workspaceLiveSession) {
      const nextTarget = normalizeBusinessPreviewTarget(target);

      if (!nextTarget) {
        return;
      }

      setPreviewTarget(prevTarget =>
        mergeBusinessPreviewTargetWithExisting(prevTarget, nextTarget),
      );
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        workspace:
          mergeBusinessPreviewTargetWithExisting(
            prevTargets.workspace,
            nextTarget,
          ) || nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('workspace');
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'enterpriseCarbonAccounting') {
      const nextTarget = normalizeBusinessPreviewTarget(target);

      if (!nextTarget) {
        return;
      }

      setAccountBindStatus('HAS_ACCOUNT');
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        enterpriseCarbonAccounting: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab(
        'enterpriseCarbonAccounting',
        getScalarValue(nextTarget.year) || undefined,
      );
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'enterpriseCarbonCertification') {
      const certificationTarget = target as EnterpriseCarbonCertificationTarget;

      if (
        certificationTarget.enterpriseCarbonCertificationPageType === 'add' &&
        !certificationTarget.enterpriseCarbonCertificationDraft
      ) {
        setEnterpriseCarbonCertificationRequest(certificationTarget);
      } else {
        openEnterpriseCarbonCertificationPreview(certificationTarget);
      }
      return;
    }

    if (target.type === 'enterpriseCarbonExpertReview') {
      const reviewTarget: EnterpriseCarbonExpertReviewTarget = {
        agentSessionId: activeConversationSessionId || undefined,
        enterpriseCarbonBizId:
          getScalarValue(target.enterpriseCarbonBizId) || undefined,
        enterpriseCarbonBizType: target.enterpriseCarbonBizType || 'account',
        orgId: getScalarValue(target.orgId) || undefined,
        reviewDetail: target.enterpriseCarbonExpertReviewDetail,
        reviewDetails: target.enterpriseCarbonExpertReviewDetails,
        reportId: getScalarValue(target.reportId) || undefined,
        snapshot: target.enterpriseCarbonSnapshot,
        type: 'enterpriseCarbonExpertReview',
        year: getScalarValue(target.year) || undefined,
      };

      if (reviewTarget.reviewDetail || reviewTarget.reviewDetails?.length) {
        openEnterpriseCarbonExpertReviewPreview(reviewTarget, { focus: true });
        return;
      }

      return;
    }

    if (target.type === 'enterpriseCarbonReport') {
      const nextTarget = normalizeBusinessPreviewTarget(target);

      if (!nextTarget) {
        return;
      }

      setAccountBindStatus('HAS_ACCOUNT');
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        enterpriseCarbonReport: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('enterpriseCarbonReport');
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'cbamMonitor') {
      if (isMobile) return;
      const nextTarget = normalizeBusinessPreviewTarget(target);

      if (!nextTarget?.planId) {
        antdMessage.warning(I18N.cbamMonitor.planDetailLoadFailed);
        return;
      }

      activeCbamMonitorPlanIdRef.current = nextTarget.planId;
      monitorPreviewExplicitlyClosedRef.current = false;
      previewTargetRef.current = nextTarget;
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        cbamMonitor:
          mergeBusinessPreviewTargetWithExisting(
            prevTargets.cbamMonitor,
            nextTarget,
          ) || nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('cbamMonitor', undefined, nextTarget);
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'cbamOperationReport') {
      if (isMobile) return;
      const nextTarget = normalizeBusinessPreviewTarget(target);
      if (!nextTarget?.operationId) {
        antdMessage.warning(I18N.cbamOperationReport.reportLoadFailed);
        return;
      }
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        cbamOperationReport:
          mergeBusinessPreviewTargetWithExisting(
            prevTargets.cbamOperationReport,
            nextTarget,
          ) || nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('cbamOperationReport');
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'cbamReport') {
      const nextTarget = normalizeBusinessPreviewTarget(target);

      if (!nextTarget?.cbamId) {
        antdMessage.warning(I18N.carbonAgent.missingReportUrl);
        return;
      }

      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        cbamReport: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('cbamReport');
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'certification' && target.certificationAuthType) {
      if (isMobile) {
        return;
      }

      const certificationAuthType = normalizeCertificationApplyAuthType(
        target.certificationAuthType,
      );

      if (!certificationAuthType) {
        return;
      }

      const reportTarget =
        target.reportUrl || target.reportId
          ? {
              accountId: target.accountId
                ? String(target.accountId)
                : undefined,
              ...getBusinessPreviewDisplayFields(target),
              ...getBusinessPreviewRefreshFields(target),
              productId: target.productId
                ? String(target.productId)
                : undefined,
              reportId: target.reportId ? String(target.reportId) : undefined,
              reportName: target.reportName,
              reportUrl: target.reportUrl,
              shareAuth: targetShareAuth,
              ...getBusinessPreviewStatusFields(target),
              type: 'report' as const,
            }
          : undefined;
      const nextTarget: BusinessCardPreviewTarget = {
        accountId: target.accountId ? String(target.accountId) : undefined,
        ...getBusinessPreviewDisplayFields(target),
        ...getBusinessPreviewRefreshFields(target),
        certificationAuthType,
        certificationDetails: target.certificationDetails,
        productId: target.productId ? String(target.productId) : undefined,
        reportId: target.reportId ? String(target.reportId) : undefined,
        reportName: target.reportName,
        reportUrl: target.reportUrl,
        shareAuth: targetShareAuth,
        ...getBusinessPreviewStatusFields(target),
        type: 'certification',
      };

      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        ...(reportTarget?.reportUrl ? { report: reportTarget } : {}),
        certification: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(
          ...prevTargets,
          ...(reportTarget?.reportUrl ? [reportTarget] : []),
          nextTarget,
        ),
      );
      requestPreviewActiveTab('certification');
      setPreviewOpen(true);
      return;
    }

    const targetReviewDetails =
      target.type === 'expertReview'
        ? target.reviewDetails?.length
          ? target.reviewDetails
          : target.reviewDetail
          ? [target.reviewDetail]
          : []
        : [];

    if (target.type === 'expertReview' && targetReviewDetails.length) {
      const primaryReviewDetail = targetReviewDetails[0];
      const accountId = target.accountId
        ? String(target.accountId)
        : getScalarValue(primaryReviewDetail.accountId);
      const reportId = target.reportId
        ? String(target.reportId)
        : getScalarValue(primaryReviewDetail.reportId);
      const accountTarget = accountId
        ? {
            accountId,
            ...getBusinessPreviewDisplayFields(target),
            ...getBusinessPreviewRefreshFields(target),
            productId: target.productId ? String(target.productId) : undefined,
            shareAuth: targetShareAuth,
            ...getBusinessPreviewStatusFields(target),
            type: 'account' as const,
          }
        : undefined;
      const reportTarget =
        target.reportUrl || reportId
          ? {
              accountId: accountId || undefined,
              ...getBusinessPreviewDisplayFields(target),
              ...getBusinessPreviewRefreshFields(target),
              productId: target.productId
                ? String(target.productId)
                : undefined,
              reportId: reportId || undefined,
              reportName: target.reportName,
              reportUrl: target.reportUrl,
              shareAuth: targetShareAuth,
              ...getBusinessPreviewStatusFields(target),
              type: 'report' as const,
            }
          : undefined;
      const nextTarget: BusinessCardPreviewTarget = {
        accountId,
        ...getBusinessPreviewDisplayFields(target),
        ...getBusinessPreviewRefreshFields(target),
        productId: target.productId ? String(target.productId) : undefined,
        reportId: reportId || undefined,
        reportName: target.reportName,
        reportUrl: target.reportUrl,
        shareAuth: targetShareAuth,
        ...getBusinessPreviewStatusFields(target),
        reviewDetail: primaryReviewDetail,
        reviewDetails: targetReviewDetails,
        type: 'expertReview',
      };

      setAccountBindStatus('HAS_ACCOUNT');
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        ...(accountTarget ? { account: accountTarget } : {}),
        ...(reportTarget?.reportUrl ? { report: reportTarget } : {}),
        expertReview: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(
          ...prevTargets,
          ...(accountTarget ? [accountTarget] : []),
          ...(reportTarget?.reportUrl ? [reportTarget] : []),
          nextTarget,
        ),
      );
      requestPreviewActiveTab('expertReview');
      setPreviewOpen(true);
      return;
    }

    if (target.type === 'report' || target.reportUrl) {
      if (!target.reportUrl) {
        antdMessage.warning(I18N.carbonAgent.missingReportUrl);
        return;
      }

      const nextTarget: BusinessCardPreviewTarget = {
        accountId: target.accountId ? String(target.accountId) : undefined,
        ...getBusinessPreviewDisplayFields(target),
        ...getBusinessPreviewRefreshFields(target),
        productId: target.productId ? String(target.productId) : undefined,
        reportId: target.reportId ? String(target.reportId) : undefined,
        reportName: target.reportName,
        reportUrl: target.reportUrl,
        reportReadonly: target.reportReadonly,
        reportKind: target.reportKind,
        reportLabel: target.reportLabel,
        shareAuth: targetShareAuth,
        ...getBusinessPreviewStatusFields(target),
        type: 'report',
      };

      if (!target.reportKind) setAccountBindStatus('HAS_ACCOUNT');
      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        report: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );
      requestPreviewActiveTab('report', undefined, nextTarget);
      setPreviewOpen(true);
      return;
    }

    if (!target.accountId) {
      antdMessage.warning(I18N.carbonAgent.missingModelId);
      return;
    }

    const nextTarget: BusinessCardPreviewTarget = {
      accountId: String(target.accountId),
      ...getBusinessPreviewDisplayFields(target),
      ...getBusinessPreviewRefreshFields(target),
      productId: target.productId ? String(target.productId) : undefined,
      shareAuth: targetShareAuth,
      snapFlag: target.snapFlag,
      ...getBusinessPreviewStatusFields(target),
      type: 'account',
    };

    setAccountBindStatus('HAS_ACCOUNT');
    setPreviewTarget(nextTarget);
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      account: nextTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, nextTarget),
    );
    requestPreviewActiveTab('account');
    setPreviewOpen(true);
  };

  const handleProjectOverviewOpen = (projectId: string) => {
    handleSectionSelect(getProjectOverviewSectionKey(projectId));
  };

  const handleProjectCalculationConversationOpen = (
    projectId: string,
    sessionId: string,
    title: string,
  ) => {
    handleHistorySelect({
      id: sessionId,
      projectId,
      projectSession: true,
      sessionId,
      time: '',
      title,
    });
  };

  const handleProjectCalculationsCompare = (
    projectId: string,
    comparison: AgentProjectCalculationComparison,
    accountIds: Array<number | string>,
    calculations: AgentProjectCalculation[],
  ) => {
    setProjectComparisonState({
      accountIds,
      calculations,
      comparison,
      projectId,
    });
    handleSectionSelect(getProjectComparisonSectionKey(projectId));
  };

  const getPreviewReviewSourceTarget = (
    activeTarget?: BusinessCardPreviewTarget,
  ) => {
    const normalizedActiveTarget = normalizeBusinessPreviewTarget(activeTarget);

    if (
      normalizedActiveTarget &&
      (getBusinessPreviewTargetAccountId(normalizedActiveTarget) ||
        normalizedActiveTarget.reportId ||
        normalizedActiveTarget.reportUrl)
    ) {
      return normalizedActiveTarget;
    }

    if (previewTarget?.type === 'report') {
      return previewReportTarget || previewTarget;
    }

    if (previewTarget?.type === 'expertReview') {
      return previewExpertReviewTarget || previewTarget;
    }

    if (previewTarget?.type === 'certification') {
      return previewAccountTarget || previewReportTarget || previewTarget;
    }

    return previewAccountTarget || previewTarget || previewReportTarget;
  };

  const refreshPreviewCertificationTabs = async ({
    preferredAuthType,
    preferredCertificationId,
    shouldFocus = false,
    sourceTarget,
  }: {
    preferredAuthType?: CertificationApplyAuthType;
    preferredCertificationId?: number | string;
    shouldFocus?: boolean;
    sourceTarget?: BusinessCardPreviewTarget;
  } = {}) => {
    const accountId = getScalarValue(sourceTarget?.accountId);

    if (!accountId) {
      return false;
    }

    const requestId = previewCertificationRefreshRequestIdRef.current + 1;
    previewCertificationRefreshRequestIdRef.current = requestId;

    try {
      const certificationDetails = await fetchAgentCertificationList({
        accountId,
      });

      if (
        previewCertificationRefreshRequestIdRef.current !== requestId ||
        !certificationDetails.length
      ) {
        return false;
      }

      const orderedCertificationDetails = sortCertificationDetailsForFocus(
        certificationDetails,
        preferredAuthType,
        preferredCertificationId,
      );
      const certificationAuthType =
        preferredAuthType ||
        getCertificationApplyAuthTypeFromItem(orderedCertificationDetails[0]);
      const nextTarget: BusinessCardPreviewTarget = {
        accountId,
        ...getBusinessPreviewDisplayFields(sourceTarget),
        certificationAuthType,
        certificationDetails: orderedCertificationDetails,
        productId: getScalarValue(sourceTarget?.productId) || undefined,
        reportId: getScalarValue(sourceTarget?.reportId) || undefined,
        reportName: getScalarValue(sourceTarget?.reportName) || undefined,
        reportUrl: getScalarValue(sourceTarget?.reportUrl) || undefined,
        ...getBusinessPreviewStatusFields(sourceTarget),
        type: 'certification',
      };

      setPreviewTarget(nextTarget);
      setPreviewTabTargets(prevTargets => ({
        ...prevTargets,
        certification: nextTarget,
      }));
      setPreviewTargets(prevTargets =>
        mergeBusinessPreviewTargets(...prevTargets, nextTarget),
      );

      if (shouldFocus) {
        requestPreviewActiveTab('certification');
      }

      return true;
    } catch {
      return false;
    }
  };

  const handlePreviewCertificationApplySubmitted = (
    certificationId?: number | string,
  ) => {
    refreshPreviewCertificationTabs({
      preferredAuthType:
        previewCertificationTarget?.certificationDraftAuthType ||
        previewCertificationTarget?.certificationAuthType,
      preferredCertificationId: certificationId,
      shouldFocus: true,
      sourceTarget: getScalarValue(previewCertificationTarget?.accountId)
        ? previewCertificationTarget
        : getPreviewReviewSourceTarget(),
    });
  };

  const refreshPreviewEnterpriseCarbonCertificationTabs = async (
    preferredCertificationId?: number | string,
  ) => {
    let sourceTarget = previewEnterpriseCarbonCertificationTarget;

    if (
      !sourceTarget &&
      previewTarget?.type === 'enterpriseCarbonCertification'
    ) {
      sourceTarget = previewTarget;
    }

    const year = getScalarValue(sourceTarget?.year);

    if (!sourceTarget || !year) {
      return false;
    }

    const requestId =
      previewEnterpriseCarbonCertificationRefreshRequestIdRef.current + 1;
    previewEnterpriseCarbonCertificationRefreshRequestIdRef.current = requestId;

    try {
      const certificationDetails = await fetchEnterpriseCarbonCertificationList(
        { year },
      );

      if (
        previewEnterpriseCarbonCertificationRefreshRequestIdRef.current !==
          requestId ||
        !certificationDetails.length
      ) {
        return false;
      }

      const orderedCertificationDetails =
        sortEnterpriseCarbonCertificationDetailsForFocus(
          certificationDetails,
          preferredCertificationId,
        );
      const nextTarget = normalizeBusinessPreviewTarget({
        ...sourceTarget,
        applyNo: undefined,
        certificationId: undefined,
        enterpriseCarbonCertificationDetails: orderedCertificationDetails,
        enterpriseCarbonCertificationDraft: false,
        enterpriseCarbonCertificationPageType:
          getEnterpriseCarbonCertificationPageType(
            orderedCertificationDetails[0],
          ),
        type: 'enterpriseCarbonCertification',
        year,
      });

      if (!nextTarget) {
        return false;
      }

      setPreviewTarget(nextTarget);
      setPreviewTabTargets(previousTargets => ({
        ...previousTargets,
        enterpriseCarbonCertification: nextTarget,
      }));
      setPreviewTargets(previousTargets =>
        mergeBusinessPreviewTargets(...previousTargets, nextTarget),
      );
      requestPreviewActiveTab(
        'enterpriseCarbonCertification',
        year,
        nextTarget,
      );
      return true;
    } catch {
      return false;
    }
  };

  const handlePreviewEnterpriseCarbonCertificationSubmitted = (
    certificationId?: number | string,
  ) => {
    if (enterpriseCarbonReviewCertificationReadonly) {
      return;
    }

    refreshPreviewEnterpriseCarbonCertificationTabs(certificationId);
  };

  const refreshPreviewExpertReviewTabs = async ({
    fallbackReviewDetail,
    shouldFocus = false,
    sourceTarget,
    statusParams,
  }: {
    fallbackReviewDetail?: AgentExpertReviewStatus;
    shouldFocus?: boolean;
    sourceTarget?: BusinessCardPreviewTarget;
    statusParams?: AgentExpertReviewStatusParams;
  } = {}) => {
    const reviewStatusParams =
      statusParams || getExpertReviewStatusParams(sourceTarget);
    const reviewListParams = getExpertReviewListParams(reviewStatusParams);

    if (!reviewStatusParams || !reviewListParams) {
      return false;
    }

    const requestId = previewExpertReviewRefreshRequestIdRef.current + 1;
    previewExpertReviewRefreshRequestIdRef.current = requestId;

    const refreshedReviewDetails = await fetchAgentExpertReviewList(
      reviewListParams,
    ).catch(() => []);

    if (previewExpertReviewRefreshRequestIdRef.current !== requestId) {
      return false;
    }

    const nextReviewDetails = refreshedReviewDetails.length
      ? refreshedReviewDetails
      : fallbackReviewDetail
      ? [fallbackReviewDetail]
      : [];
    const nextReviewDetail = nextReviewDetails[0];

    if (!nextReviewDetail) {
      return false;
    }

    const accountId =
      reviewStatusParams.accountId ||
      getBusinessPreviewTargetAccountId(sourceTarget);
    const reportId =
      reviewStatusParams.reportId ||
      getBusinessPreviewTargetReportId(sourceTarget);
    const nextTarget: BusinessCardPreviewTarget = {
      accountId: accountId ? String(accountId) : undefined,
      ...getBusinessPreviewDisplayFields(sourceTarget),
      productId: getScalarValue(sourceTarget?.productId) || undefined,
      reportId: reportId ? String(reportId) : undefined,
      reportName: getScalarValue(sourceTarget?.reportName) || undefined,
      reportUrl: getScalarValue(sourceTarget?.reportUrl) || undefined,
      ...getBusinessPreviewStatusFields(sourceTarget),
      reviewDetail: nextReviewDetail,
      reviewDetails: nextReviewDetails,
      type: 'expertReview',
    };
    const isSameReviewTarget = (target?: BusinessCardPreviewTarget) => {
      if (target?.type !== 'expertReview') {
        return false;
      }

      const targetAccountId = getBusinessPreviewTargetAccountId(target);
      const targetReportId = getBusinessPreviewTargetReportId(target);
      const sameAccount = accountId
        ? targetAccountId === String(accountId)
        : true;
      const sameReport = reportId
        ? targetReportId === String(reportId)
        : !targetReportId;

      return sameAccount && sameReport;
    };

    setPreviewTarget(nextTarget);
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      expertReview: nextTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(
        ...prevTargets.filter(target => !isSameReviewTarget(target)),
        nextTarget,
      ),
    );

    if (shouldFocus) {
      requestPreviewActiveTab('expertReview');
    }

    return true;
  };

  const handlePreviewExpertReviewOpen = async (
    activeTarget?: BusinessCardPreviewTarget,
  ) => {
    if (!requireLogin()) {
      return;
    }

    const reviewSourceTarget = getPreviewReviewSourceTarget(activeTarget);
    const statusParams = getExpertReviewStatusParams(reviewSourceTarget);

    if (!statusParams) {
      antdMessage.warning(I18N.carbonAgent.expertReviewMissingAccount);
      return;
    }

    setPreviewReviewPreparing(true);
    setPreviewReviewPrepareInfo(null);
    try {
      const prepareInfo = await prepareAgentExpertReview({
        accountId: statusParams.accountId,
        objectType: statusParams.objectType || 'account',
        reportId: statusParams.reportId,
      });

      setPreviewReviewPrepareInfo(prepareInfo);
      setPreviewReviewPurpose('');
      setPreviewExpertReviewOpen(true);
    } catch {
      antdMessage.error(I18N.carbonAgent.expertReviewStatusLoadFailed);
    } finally {
      setPreviewReviewPreparing(false);
    }
  };

  const handlePreviewExpertReviewClose = () => {
    if (!previewReviewSubmitting) {
      setPreviewExpertReviewOpen(false);
    }
  };

  const openPreviewCertificationTab = ({
    certificationAuthType,
    sourceTarget,
  }: {
    certificationAuthType: CertificationApplyAuthType;
    sourceTarget?: BusinessCardPreviewTarget;
  }) => {
    const sourceAccountId =
      getScalarValue(sourceTarget?.accountId) ||
      getBusinessPreviewTargetAccountId(sourceTarget);
    const existingCertificationAccountId =
      getScalarValue(previewCertificationTarget?.accountId) ||
      getBusinessPreviewTargetAccountId(previewCertificationTarget);
    const certificationDetails =
      sourceTarget?.certificationDetails ||
      (sourceAccountId && sourceAccountId === existingCertificationAccountId
        ? previewCertificationTarget?.certificationDetails
        : undefined);
    const nextTarget: BusinessCardPreviewTarget = {
      accountId: sourceAccountId || undefined,
      ...getBusinessPreviewDisplayFields(sourceTarget),
      certificationAuthType,
      certificationDetails,
      certificationDraftAuthType: certificationAuthType,
      productId: getScalarValue(sourceTarget?.productId) || undefined,
      reportId: getScalarValue(sourceTarget?.reportId) || undefined,
      reportName: getScalarValue(sourceTarget?.reportName) || undefined,
      reportUrl: getScalarValue(sourceTarget?.reportUrl) || undefined,
      ...getBusinessPreviewStatusFields(sourceTarget),
      type: 'certification',
    };

    setPreviewTarget(nextTarget);
    setPreviewTabTargets(prevTargets => ({
      ...prevTargets,
      certification: nextTarget,
    }));
    setPreviewTargets(prevTargets =>
      mergeBusinessPreviewTargets(...prevTargets, nextTarget),
    );
    requestPreviewActiveTab('certification');
    setPreviewThirdPartyCertificationOpen(false);
    setPreviewOpen(true);
  };

  const handlePreviewCarbonLabelOpen = async (
    target?: BusinessCardPreviewTarget,
  ) => {
    if (
      !canDisplayCarbonLabel(
        conversationReadonly,
        shareId,
        window.innerWidth,
      ) ||
      !requireLogin()
    )
      return;
    const source = target || previewAccountTarget;
    if (
      !source?.accountId ||
      ![
        'account',
        'report',
        'expertReview',
        'certification',
        'carbonLabel',
      ].includes(source.type || '')
    )
      return;
    const targetAccountId = String(source.accountId);

    focusedPreviewCarbonLabelAccountIdRef.current = targetAccountId;
    if (previewCarbonLabelPreparingAccountIdsRef.current.has(targetAccountId))
      return;

    previewCarbonLabelPreparingAccountIdsRef.current.add(targetAccountId);
    try {
      const resolution = await resolveCarbonLabelEntry(
        targetAccountId,
        source.productId,
      );
      const prepared = resolution.application;
      const applicationId =
        resolution.kind === 'existing' && prepared.id != null
          ? String(prepared.id)
          : undefined;
      const existingDraft =
        resolution.kind === 'new'
          ? previewTargets.find(
              previewTarget =>
                previewTarget.type === 'carbonLabel' &&
                String(previewTarget.accountId) === targetAccountId &&
                !previewTarget.carbonLabelApplicationId,
            )
          : undefined;
      const nextTarget: BusinessCardPreviewTarget = existingDraft || {
        accountId: targetAccountId,
        messageId: source.messageId,
        productId:
          prepared.productId == null
            ? source.productId
            : String(prepared.productId),
        productName: prepared.productName || source.productName,
        accountName: prepared.accountName || source.accountName,
        carbonLabelKey: applicationId
          ? `application:${targetAccountId}:${applicationId}`
          : nanoid(),
        carbonLabelApplicationId: applicationId,
        carbonLabelApplyNum: prepared.applyNum || undefined,
        carbonLabelForceNew: resolution.forceNew,
        carbonLabelPreparedApplication:
          resolution.kind === 'new' ? prepared : undefined,
        carbonLabelStatus:
          resolution.kind === 'existing'
            ? prepared.status ?? ApplyForAccountStatus.TO_BE_SUB
            : undefined,
        type: 'carbonLabel',
      };
      const shouldFocusCarbonLabel =
        focusedPreviewCarbonLabelAccountIdRef.current === targetAccountId;

      if (shouldFocusCarbonLabel) {
        setPreviewTarget(nextTarget);
        setPreviewTabTargets(previous => ({
          ...previous,
          carbonLabel: nextTarget,
        }));
      }
      setPreviewTargets(previous =>
        mergeBusinessPreviewTargets(
          ...previous.filter(
            previewTarget =>
              !(
                applicationId &&
                previewTarget.type === 'carbonLabel' &&
                String(previewTarget.accountId) === targetAccountId &&
                !previewTarget.carbonLabelApplicationId
              ),
          ),
          nextTarget,
        ),
      );
      if (shouldFocusCarbonLabel) {
        requestPreviewActiveTab(
          getCarbonLabelTabKey(nextTarget),
          undefined,
          nextTarget,
        );
      }
      setPreviewOpen(true);
    } catch {
      // prepare 请求错误由统一请求层提示；无法判断时不创建重复申请。
    } finally {
      previewCarbonLabelPreparingAccountIdsRef.current.delete(targetAccountId);
    }
  };

  const handlePreviewCarbonLabelSubmitted = (
    key: string,
    application: CarbonLabelSubmission,
  ) => {
    const updateTarget = (target: BusinessCardPreviewTarget) =>
      target.type === 'carbonLabel' && target.carbonLabelKey === key
        ? {
            ...target,
            carbonLabelApplicationId: application.id,
            carbonLabelApplyNum:
              application.applyNum ?? target.carbonLabelApplyNum,
            carbonLabelForceNew: undefined,
            carbonLabelPreparedApplication: undefined,
            carbonLabelStatus:
              application.status ??
              target.carbonLabelStatus ??
              ApplyForAccountStatus.TO_BE_SUB,
          }
        : target;
    setPreviewTargets(previous => previous.map(updateTarget));
    setPreviewTabTargets(previous => ({
      ...previous,
      carbonLabel: previous.carbonLabel
        ? updateTarget(previous.carbonLabel)
        : undefined,
    }));
    setPreviewTarget(previous =>
      previous ? updateTarget(previous) : previous,
    );
    // 列表刷新会重新同步页签；同时更新选中请求，保留本次申请的稳定 key。
    requestPreviewActiveTab(
      getCarbonLabelTabKey({
        carbonLabelKey: key,
        carbonLabelApplicationId: application.id,
      }),
    );
  };

  const handlePreviewThirdPartyCertificationOpen = async (
    activeTarget?: BusinessCardPreviewTarget,
    options?: { forceNew?: boolean },
  ) => {
    if (!requireLogin()) {
      return;
    }

    if (isMobile) {
      return;
    }

    const certificationSourceTarget =
      getPreviewReviewSourceTarget(activeTarget);
    const accountId =
      getScalarValue(certificationSourceTarget?.accountId) ||
      getBusinessPreviewTargetAccountId(certificationSourceTarget);

    if (!accountId) {
      antdMessage.warning(
        I18N.carbonAgent.thirdPartyCertificationMissingAccount,
      );
      return;
    }

    previewCertificationSourceTargetRef.current = {
      ...(certificationSourceTarget || {}),
      accountId,
    };

    if (options?.forceNew) {
      setPreviewThirdPartyCertificationOpen(true);
      return;
    }

    setPreviewCertificationChecking(true);

    try {
      const certificationDetails = await fetchAgentCertificationList({
        accountId,
      });

      if (certificationDetails.length) {
        const certificationAuthType = getCertificationApplyAuthTypeFromItem(
          certificationDetails[0],
        );
        const nextTarget: BusinessCardPreviewTarget = {
          accountId,
          ...getBusinessPreviewDisplayFields(certificationSourceTarget),
          certificationAuthType,
          certificationDetails,
          productId:
            getScalarValue(certificationSourceTarget?.productId) || undefined,
          reportId:
            getScalarValue(certificationSourceTarget?.reportId) || undefined,
          reportName:
            getScalarValue(certificationSourceTarget?.reportName) || undefined,
          reportUrl:
            getScalarValue(certificationSourceTarget?.reportUrl) || undefined,
          ...getBusinessPreviewStatusFields(certificationSourceTarget),
          type: 'certification',
        };

        setPreviewTarget(nextTarget);
        setPreviewTabTargets(prevTargets => ({
          ...prevTargets,
          certification: nextTarget,
        }));
        setPreviewTargets(prevTargets =>
          mergeBusinessPreviewTargets(...prevTargets, nextTarget),
        );
        requestPreviewActiveTab('certification');
        setPreviewOpen(true);
        previewCertificationSourceTargetRef.current = undefined;
        return;
      }

      setPreviewThirdPartyCertificationOpen(true);
    } catch {
      previewCertificationSourceTargetRef.current = undefined;
      antdMessage.error(
        I18N.carbonAgent.thirdPartyCertificationStatusLoadFailed,
      );
    } finally {
      setPreviewCertificationChecking(false);
    }
  };

  const handlePreviewThirdPartyCertificationClose = () => {
    previewCertificationSourceTargetRef.current = undefined;
    setPreviewThirdPartyCertificationOpen(false);
  };

  const handlePreviewThirdPartyCertificationSubmit = (
    certificationType: ThirdPartyCertificationType,
  ) => {
    const certificationAuthType =
      THIRD_PARTY_CERTIFICATION_AUTH_TYPE_MAP[certificationType];
    const reviewSourceTarget =
      previewCertificationSourceTargetRef.current ||
      getPreviewReviewSourceTarget();

    openPreviewCertificationTab({
      certificationAuthType,
      sourceTarget: reviewSourceTarget,
    });
    previewCertificationSourceTargetRef.current = undefined;
  };

  const handlePreviewExpertReviewSubmit = async () => {
    const reviewSourceTarget = getPreviewReviewSourceTarget();
    const statusParams = getExpertReviewStatusParams(reviewSourceTarget);

    if (!statusParams) {
      antdMessage.warning(I18N.carbonAgent.expertReviewMissingAccount);
      return;
    }

    if (previewReviewPrepareInfo?.canApply === false) {
      if (previewReviewPrepareInfo.disabledReason?.trim()) {
        antdMessage.warning(previewReviewPrepareInfo.disabledReason.trim());
      }
      return;
    }

    setPreviewReviewSubmitting(true);
    try {
      const reviewObjectType = getPreparedReviewObjectType(
        previewReviewPrepareInfo,
        statusParams.objectType || 'account',
      );

      await applyAgentExpertReview({
        accountId: statusParams.accountId
          ? String(statusParams.accountId)
          : undefined,
        objectType: reviewObjectType,
        reportId: statusParams.reportId
          ? String(statusParams.reportId)
          : undefined,
        reviewFocus: DEFAULT_EXPERT_REVIEW_FOCUS,
        reviewPurpose:
          previewReviewPurpose.trim() ||
          I18N.carbonAgent.expertReviewDefaultPurpose,
        sessionId: currentSessionId || sessionIdFromParams,
      });
      antdMessage.success(I18N.carbonAgent.expertReviewApplySuccess);
      const fallbackReviewDetail = getSubmittedExpertReviewFallbackDetail({
        accountId: statusParams.accountId,
        objectType: reviewObjectType,
        prepareInfo: previewReviewPrepareInfo,
        reportId: statusParams.reportId,
      });

      setPreviewExpertReviewOpen(false);
      setPreviewReviewPrepareInfo(null);
      setPreviewReviewPurpose('');
      await refreshPreviewExpertReviewTabs({
        fallbackReviewDetail,
        shouldFocus: true,
        sourceTarget: reviewSourceTarget,
        statusParams,
      });
    } catch {
      antdMessage.error(I18N.carbonAgent.expertReviewApplyFailed);
    } finally {
      setPreviewReviewSubmitting(false);
    }
  };

  const handleBusinessCardAutoOpen = (card: AgentMessageCard) => {
    const nextAccountBindStatus = getAccountBindStatusFromValue(card);
    const target = getBusinessCardPreviewTarget(card);

    if (nextAccountBindStatus) {
      setAccountBindStatus(nextAccountBindStatus);
    }

    if (!target) {
      return;
    }

    setAccountBindStatus('HAS_ACCOUNT');
    const openKey = getBusinessCardPreviewOpenKey(card, target);
    const refreshedTarget: BusinessCardPreviewTarget = {
      ...target,
      refreshKey: openKey,
    };

    if (autoOpenedBusinessCardRef.current.has(openKey)) {
      return;
    }

    autoOpenedBusinessCardRef.current.add(openKey);
    handleBusinessCardOpen(refreshedTarget);
  };

  const handlePreviewResizeBy = (delta: number) => {
    setPreviewPaneWidth(prevWidth => clampPreviewPaneWidth(prevWidth + delta));
  };

  const handlePreviewResizeStart = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!desktopPreviewVisible || event.button !== 0) {
      return;
    }

    const workspaceRect =
      conversationWorkspaceRef.current?.getBoundingClientRect();

    if (!workspaceRect) {
      return;
    }

    event.preventDefault();

    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    let animationFrame = 0;
    let nextWidth = previewPaneWidthRef.current;

    const commitWidth = () => {
      animationFrame = 0;
      setPreviewPaneWidth(nextWidth);
    };

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      nextWidth = clampPreviewPaneWidth(
        workspaceRect.right - pointerEvent.clientX,
        workspaceRect.width,
      );

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(commitWidth);
      }
    };

    const cleanup = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }

      setPreviewPaneWidth(nextWidth);
      setPreviewResizing(false);
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
    };

    setPreviewResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
  };

  const handleCancelConversation = () => {
    if (projectConversationReadonly) {
      return;
    }

    const abortController = streamAbortControllerRef.current;
    const isAnonymousExperience =
      !authenticated && isAnonymousExperienceStarted();
    const sessionId =
      activeStreamSessionIdRef.current ||
      currentSessionId ||
      sessionIdFromParams;

    if (!submitting && !abortController) {
      return;
    }

    submitRequestIdRef.current += 1;
    abortController?.abort();
    streamAbortControllerRef.current = null;
    activeStreamSessionIdRef.current = '';
    setSubmitting(false);

    if (isAnonymousExperience) {
      cancelAnonymousExperienceMessage().catch(() => undefined);
    } else if (sessionId) {
      cancelAgentSession(sessionId).catch(() => undefined);
    }
  };

  const handleFinalResponse = (
    finalResponse: AgentFinalResponse,
    options: { replaceExisting?: boolean } = {},
  ) => {
    const finalBlocks = normalizeFinalBlocks(finalResponse);
    const finalAnswerControls = normalizeAgentAnswerControls(finalResponse);
    const nextAccountBindStatus = getAccountBindStatusFromValue(finalResponse);
    const { replaceExisting = false } = options;

    if (nextAccountBindStatus) {
      setAccountBindStatus(nextAccountBindStatus);
    }

    const finalReplyBlocks: AgentMessageBlock[] = finalResponse.reply
      ? [
          {
            blockId: 'final_reply',
            blockType: 'markdown',
            content: finalResponse.reply,
            messageId: finalResponse.messageId || 'final_response',
            orderNo: finalResponse.streamOrderNo ?? 10,
            streamOrderNo: finalResponse.streamOrderNo,
          },
        ]
      : [];
    const resolvedFinalBlocks = finalBlocks.length
      ? finalBlocks
      : finalReplyBlocks;
    const finalCards = normalizeFinalCards(finalResponse);

    if (replaceExisting) {
      if (finalReplyBlocks.length) {
        setAnswerBlocks(prevBlocks =>
          prevBlocks.length
            ? replaceLatestAgentMessageBlockContent(
                prevBlocks,
                finalReplyBlocks[0].content,
              )
            : finalReplyBlocks,
        );
      } else if (resolvedFinalBlocks.length) {
        setAnswerBlocks(resolvedFinalBlocks);
      }
    } else if (resolvedFinalBlocks.length) {
      setAnswerBlocks(prevBlocks =>
        !prevBlocks.length ? resolvedFinalBlocks : prevBlocks,
      );
    }

    if (finalCards.length) {
      finalCards.forEach(handleBusinessCardAutoOpen);
      setAnswerCards(prevCards => mergeAgentAnswerCards(prevCards, finalCards));
    }

    setAnswerControls(finalAnswerControls);
  };

  const handleStreamCard = (card: AgentMessageCard) => {
    handleBusinessCardAutoOpen(card);
    setAnswerCards(prevCards => mergeAgentAnswerCards(prevCards, [card]));
  };

  const handleStreamDelta = (delta: AgentMessageDelta) => {
    const flowId = `${delta.messageId}-${delta.blockId}-${answerTextSegmentIndexRef.current}`;

    setAnswerBlocks(prevBlocks => {
      const nextDelta = removeRepeatedStreamDeltaPrefix(prevBlocks, {
        ...delta,
        flowId,
      });

      return nextDelta ? appendMarkdown(prevBlocks, nextDelta) : prevBlocks;
    });
  };

  const handleStreamToolCall = (toolCall: AgentToolCall) => {
    const nextToolCalls = mergeToolCall(answerToolCallsRef.current, toolCall);

    if (nextToolCalls.length > answerToolCallsRef.current.length) {
      answerTextSegmentIndexRef.current += 1;
    }

    answerToolCallsRef.current = nextToolCalls;
    setAnswerToolCalls(nextToolCalls);

    if (
      ['COMPLETED', 'ERROR', 'FAILED', 'SUCCEEDED', 'SUCCESS'].includes(
        toolCall.status || '',
      )
    ) {
      const operationReportTarget =
        getCbamOperationReportToolCallPreviewTarget(toolCall);
      if (
        operationReportTarget?.refreshKey &&
        !autoOpenedBusinessCardRef.current.has(operationReportTarget.refreshKey)
      ) {
        autoOpenedBusinessCardRef.current.add(operationReportTarget.refreshKey);
        const version = operationReportTarget.operationDataVersion;
        const versionKey = `operation:${operationReportTarget.operationId}`;
        const latest = monitorDataVersionsRef.current.get(versionKey);
        if (
          version === undefined ||
          latest === undefined ||
          version >= latest
        ) {
          if (version !== undefined)
            monitorDataVersionsRef.current.set(versionKey, version);
          handleBusinessCardOpen(operationReportTarget);
        }
      }
      const target = getCbamMonitorToolCallPreviewTarget(toolCall);

      if (target?.refreshKey) {
        if (!autoOpenedBusinessCardRef.current.has(target.refreshKey)) {
          autoOpenedBusinessCardRef.current.add(target.refreshKey);
          const planId = target.planId || '';
          const currentVersion = target.monitorDataVersion;
          const latestVersion = monitorDataVersionsRef.current.get(planId);
          if (
            typeof currentVersion === 'number' &&
            typeof latestVersion === 'number' &&
            currentVersion < latestVersion
          ) {
            return;
          }
          if (typeof currentVersion === 'number') {
            monitorDataVersionsRef.current.set(planId, currentVersion);
          }

          const activePlanId =
            (previewTargetRef.current?.type === 'cbamMonitor'
              ? previewTargetRef.current.planId
              : undefined) || activeCbamMonitorPlanIdRef.current;
          const keepInBackground =
            !target.monitorCreated &&
            (monitorPreviewExplicitlyClosedRef.current ||
              (previewTargetRef.current?.type === 'cbamMonitor' &&
                Boolean(activePlanId) &&
                activePlanId !== planId));
          if (keepInBackground) {
            const normalizedTarget = normalizeBusinessPreviewTarget(target);
            if (!normalizedTarget) return;
            setPreviewTarget(currentTarget =>
              currentTarget?.type === 'cbamMonitor' &&
              currentTarget.planId === planId
                ? mergeBusinessPreviewTargetWithExisting(
                    currentTarget,
                    normalizedTarget,
                  )
                : currentTarget,
            );
            setPreviewTabTargets(currentTargets => {
              const currentTarget = currentTargets.cbamMonitor;
              if (currentTarget?.planId && currentTarget.planId !== planId) {
                return currentTargets;
              }
              return {
                ...currentTargets,
                cbamMonitor:
                  mergeBusinessPreviewTargetWithExisting(
                    currentTarget,
                    normalizedTarget,
                  ) || normalizedTarget,
              };
            });
            setPreviewTargets(currentTargets =>
              mergeBusinessPreviewTargets(...currentTargets, normalizedTarget),
            );
          } else {
            handleBusinessCardOpen(target);
          }
        }
      }
    }
  };

  const settleStreamToolCalls = (status: 'ENDED' | 'FAILED') => {
    const nextToolCalls = answerToolCallsRef.current.map(toolCall =>
      isTerminalTool(toolCall) ? toolCall : { ...toolCall, status },
    );

    answerToolCallsRef.current = nextToolCalls;
    setAnswerToolCalls(nextToolCalls);
  };

  const recoverInterruptedMessage = async ({
    abortCtrl,
    messageId,
    sessionId,
    submitRequestId,
  }: {
    abortCtrl: AbortController;
    messageId: string;
    sessionId: string;
    submitRequestId: number;
  }): Promise<AgentMessageRecoverOutcome> => {
    const startedAt = Date.now();
    const isCurrentRequest = () =>
      !abortCtrl.signal.aborted &&
      submitRequestIdRef.current === submitRequestId;

    const pollRecover = async (): Promise<AgentMessageRecoverOutcome> => {
      if (!isCurrentRequest()) {
        return 'stale';
      }

      try {
        const recoverResult = await recoverAgentMessage({
          messageId,
          sessionId,
        });

        if (!isCurrentRequest()) {
          return 'stale';
        }

        const recoverStatus = normalizeAgentMessageRecoverStatus(recoverResult);
        const recoveredResponse = recoverResult.response || undefined;

        if (
          recoveredResponse &&
          (recoverResult.recovered || recoverStatus === 'COMPLETED')
        ) {
          handleFinalResponse(
            {
              ...recoveredResponse,
              messageId: recoveredResponse.messageId || messageId,
              sessionId: recoveredResponse.sessionId || sessionId,
            },
            { replaceExisting: true },
          );

          return 'recovered';
        }

        if (recoverStatus === 'CANCELLED') {
          return 'cancelled';
        }

        if (AGENT_MESSAGE_RECOVER_FAILED_STATUS.has(recoverStatus)) {
          return 'failed';
        }

        if (!recoverResult.running) {
          return 'failed';
        }
      } catch {
        if (Date.now() - startedAt >= AGENT_MESSAGE_RECOVER_TIMEOUT_MS) {
          return 'failed';
        }
      }

      if (Date.now() - startedAt >= AGENT_MESSAGE_RECOVER_TIMEOUT_MS) {
        return 'failed';
      }

      await waitForAgentMessageRecoverPoll(
        AGENT_MESSAGE_RECOVER_POLL_INTERVAL_MS,
        abortCtrl.signal,
      );

      return pollRecover();
    };

    return pollRecover();
  };

  useEffect(() => {
    if (
      isShareMode ||
      !authenticated ||
      historyLoading ||
      !currentSessionId ||
      loadedHistorySessionIdRef.current !== currentSessionId ||
      streamAbortControllerRef.current
    ) {
      return undefined;
    }

    const traceRunning = isAgentTraceRunning(
      loadedHistorySessionStatusRef.current,
    );
    const unansweredMessageId =
      findUnansweredAgentMessageId(conversationMessages);
    const traceRunningMessageId = traceRunning
      ? loadedHistoryMessageIdRef.current ||
        unansweredMessageId ||
        findLatestAgentRunMessageId(conversationMessages)
      : '';
    const resumeState: AgentMessageResumeState | undefined =
      traceRunningMessageId
        ? {
            lastEventId: 0,
            messageId: traceRunningMessageId,
            sessionId: currentSessionId,
          }
        : undefined;

    if (!resumeState) {
      return undefined;
    }

    const resumeKey = `${resumeState.sessionId}:${resumeState.messageId}`;

    if (resumedMessageKeyRef.current === resumeKey) {
      return undefined;
    }

    const abortCtrl = new AbortController();
    const submitRequestId = submitRequestIdRef.current + 1;
    let disposed = false;

    resumedMessageKeyRef.current = resumeKey;
    submitRequestIdRef.current = submitRequestId;
    streamAbortControllerRef.current = abortCtrl;
    activeStreamSessionIdRef.current = resumeState.sessionId;
    setSubmitting(true);

    const resumeMessage = async () => {
      try {
        const finalResponse = await resumeAgentChatMessage({
          abortCtrl,
          onCard: handleStreamCard,
          onDelta: handleStreamDelta,
          onFinalResponse: response =>
            handleFinalResponse(response, { replaceExisting: true }),
          onLoadingEnd: () => setSubmitting(false),
          onMessageStart: () => {
            setSessionListRefreshKey(prevKey => prevKey + 1);
          },
          onToolCall: handleStreamToolCall,
          state: resumeState,
        });
        settleStreamToolCalls('ENDED');

        if (!disposed && submitRequestIdRef.current === submitRequestId) {
          requestContextInsightDecision(
            finalResponse?.sessionId || resumeState.sessionId,
            finalResponse?.messageId || resumeState.messageId,
          );
          await markCompletedSessionRead(resumeState.sessionId, finalResponse);
          setSessionListRefreshKey(prevKey => prevKey + 1);
        }
      } catch (error) {
        if (
          disposed ||
          abortCtrl.signal.aborted ||
          submitRequestIdRef.current !== submitRequestId
        ) {
          return;
        }

        if (isUnauthorizedAgentStreamError(error)) {
          setAuthenticated(false);
          return;
        }

        const recoverOutcome = await recoverInterruptedMessage({
          abortCtrl,
          messageId: resumeState.messageId,
          sessionId: resumeState.sessionId,
          submitRequestId,
        });

        if (recoverOutcome === 'stale') {
          return;
        }

        if (recoverOutcome === 'recovered') {
          settleStreamToolCalls('ENDED');
          requestContextInsightDecision(
            resumeState.sessionId,
            resumeState.messageId,
          );
          await markCompletedSessionRead(resumeState.sessionId);
          setSessionListRefreshKey(prevKey => prevKey + 1);
          return;
        }

        settleStreamToolCalls('FAILED');

        if (recoverOutcome === 'cancelled') {
          antdMessage.warning(I18N.carbonAgent.userCancelledExecution);
        } else {
          antdMessage.error(I18N.carbonAgent.sendFailedRetry);
        }
      } finally {
        if (!disposed && submitRequestIdRef.current === submitRequestId) {
          setSubmitting(false);
        }

        if (streamAbortControllerRef.current === abortCtrl) {
          streamAbortControllerRef.current = null;
          activeStreamSessionIdRef.current = '';
        }
      }
    };

    resumeMessage();

    return () => {
      disposed = true;
      abortCtrl.abort();

      if (resumedMessageKeyRef.current === resumeKey) {
        resumedMessageKeyRef.current = '';
      }
    };
    // Stream handlers intentionally read the latest refs and React state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authenticated,
    conversationMessages,
    currentSessionId,
    historyLoading,
    isShareMode,
    markCompletedSessionRead,
  ]);

  const submitAnonymousConversationMessage = async (
    submission: ConversationSubmission,
  ) => {
    if (ccdbFactorDraft && !ccdbFactorDraft.detail) {
      antdMessage.info(I18N.ccdb.waitForFactor);
      return;
    }

    if (anonymousEligibilityChecking) {
      return;
    }

    if (anonymousExperienceConsumed || !anonymousExperienceAllowed) {
      requestLogin('send');
      return;
    }

    if (submitting || historyLoading) {
      return;
    }

    const trimmedMessage = getSubmissionDisplayMessage(submission);

    if (!trimmedMessage) {
      return;
    }

    if (trimmedMessage.length > AGENT_COMPOSER_MESSAGE_MAX_LENGTH) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.maxInputChars, {
          val1: AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
        }),
      );
      return;
    }

    clearContextInsight();

    const requestPayload =
      typeof submission === 'string' ? undefined : submission;
    const factorContext = ccdbFactorSubmittedRef.current
      ? undefined
      : ccdbFactorDraft;
    const factorContextAttached = Boolean(factorContext?.detail);
    const agentRequestPayload = withCcdbFactorContext(
      buildAgentChatRequestPayload(requestPayload),
      trimmedMessage,
      factorContext,
    );
    const submissionAttachments =
      normalizeSubmissionAttachments(requestPayload);
    const submitRequestId = submitRequestIdRef.current + 1;
    const submittedAt = new Date().toISOString();
    const abortCtrl = new AbortController();

    submitRequestIdRef.current = submitRequestId;
    setSubmitting(true);
    setLastSubmittedMessage(trimmedMessage);
    setConversationQuestion(trimmedMessage);
    setConversationQuestionTime(submittedAt);
    setConversationQuestionAttachments(submissionAttachments);
    setConversationQuestionReferenceCount(0);
    setConversationQuestionReferenceContents([]);
    setConversationStarted(true);
    resetPreviewFullscreen();
    setPreviewOpen(Boolean(ccdbFactorTarget) && !isMobile);
    setMessage('');
    setComposerQuotes([]);
    setComposerAttachments([]);
    answerTextSegmentIndexRef.current = 0;
    answerToolCallsRef.current = [];
    autoOpenedBusinessCardRef.current.clear();
    setAnswerBlocks([]);
    setAnswerCards([]);
    setAnswerControls(undefined);
    setAnswerToolCalls([]);

    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = abortCtrl;
    activeStreamSessionIdRef.current = '';
    let loginRequiredPolicy: AgentLoginRequiredPayload | null = null;

    try {
      const finalResponse = await sendAnonymousExperienceMessage({
        abortCtrl,
        lang,
        message: trimmedMessage,
        requestPayload: agentRequestPayload,
        onCard: handleStreamCard,
        onDelta: handleStreamDelta,
        onFinalResponse: response =>
          handleFinalResponse(response, { replaceExisting: true }),
        onLoadingEnd: () => setSubmitting(false),
        onLoginRequired: payload => {
          loginRequiredPolicy = payload;
        },
        onResumeState: state => {
          // Only consume the context after the server accepts this anonymous turn.
          if (factorContextAttached && state.sessionId && state.messageId) {
            ccdbFactorSubmittedRef.current = true;
          }
        },
        onToolCall: handleStreamToolCall,
      });

      if (loginRequiredPolicy) {
        antdMessage.warning(
          resolveAnonymousLoginRequiredMessage(loginRequiredPolicy),
        );
        requestLogin('send');
        return;
      }

      const anonymousConversationTitle =
        finalResponse?.sessionTitle?.trim() || trimmedMessage;
      const anonymousHistoryConversation = createAnonymousHistoryConversation({
        sessionId: finalResponse?.sessionId,
        status: finalResponse?.status,
        time: submittedAt,
        title: anonymousConversationTitle,
      });

      setCurrentSessionTitle(anonymousConversationTitle);
      if (anonymousHistoryConversation) {
        setCreatedConversation(anonymousHistoryConversation);
      }

      if (factorContextAttached && finalResponse?.sessionId) {
        ccdbFactorSubmittedRef.current = true;
      }

      settleStreamToolCalls('ENDED');
    } catch (error) {
      if (
        abortCtrl.signal.aborted ||
        submitRequestIdRef.current !== submitRequestId
      ) {
        return;
      }

      settleStreamToolCalls('FAILED');
      const failedMessage = I18N.carbonAgent.sendFailedRetryPeriod;

      antdMessage.error(I18N.carbonAgent.sendFailedRetry);
      setAnswerCards(prevCards =>
        prevCards.length
          ? prevCards
          : [
              {
                card: {
                  eventType: 'error',
                  message: failedMessage,
                },
                cardType: 'error',
                messageId: 'anonymous_send_error',
                orderNo: 10,
              },
            ],
      );
    } finally {
      if (submitRequestIdRef.current === submitRequestId) {
        setSubmitting(false);
      }

      if (streamAbortControllerRef.current === abortCtrl) {
        streamAbortControllerRef.current = null;
        activeStreamSessionIdRef.current = '';
      }
    }
  };

  const submitConversationMessage = async (
    submission: ConversationSubmission,
    options: {
      collapseActionRequests?: boolean;
      projectCreatePayload?: CreateAgentProjectSessionPayload;
      projectId?: string;
      verifyProjectSessionHistory?: boolean;
    } = {},
  ) => {
    if (workspaceAccess && !workspaceAccess.canUseAi) {
      antdMessage.warning(
        reasonText(workspaceAccess.aiReasonCode || workspaceAccess.reasonCode),
      );
      return;
    }
    if (ccdbFactorDraft && !ccdbFactorDraft.detail) {
      antdMessage.info(I18N.ccdb.waitForFactor);
      setCcdbFactorTarget(ccdbFactorDraft);
      setPreviewOpen(true);
      return;
    }
    if (projectConversationReadonly) {
      return;
    }

    if (!authenticated) {
      if (anonymousExperienceConsumed) {
        requestLogin('send');
      } else if (!options.projectId) {
        await submitAnonymousConversationMessage(submission);
      }
      return;
    }

    if (!requireLogin('send')) {
      return;
    }

    if (submitting || historyLoading) {
      return;
    }

    const trimmedMessage = getSubmissionDisplayMessage(submission);

    if (!trimmedMessage) {
      return;
    }

    if (trimmedMessage.length > AGENT_COMPOSER_MESSAGE_MAX_LENGTH) {
      antdMessage.warning(
        I18N.template(I18N.carbonAgent.maxInputChars, {
          val1: AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
        }),
      );
      return;
    }

    stopContextInsightPolling();

    const requestPayload =
      typeof submission === 'string' ? undefined : submission;
    const factorLibraryEntry =
      (!conversationStarted && activeSection === 'factorLibrary') ||
      Boolean(
        currentSessionId &&
          factorLibrarySessionIdRef.current === currentSessionId,
      );
    const agentRequestPayload = buildAgentChatRequestPayload(
      factorLibraryEntry
        ? {
            ...requestPayload,
            message: requestPayload?.message || trimmedMessage,
            lang: lang === 'en' ? 'en' : 'zh',
            pageContext: {
              ...((requestPayload?.pageContext as Record<string, unknown>) ||
                {}),
              entry: 'factor_library',
            },
          }
        : requestPayload,
    );
    const submissionAttachments =
      normalizeSubmissionAttachments(requestPayload);
    const hasAttachmentPayload =
      Array.isArray(requestPayload?.fileList) ||
      Array.isArray(requestPayload?.files) ||
      Array.isArray(requestPayload?.attachments);
    const collapseCurrentFormRequests =
      shouldCollapseFormRequestsForSubmission(requestPayload);
    const collapseCurrentActionRequests =
      options.collapseActionRequests ||
      shouldCollapseActionRequestsForSubmission(requestPayload);
    const submissionReferenceContents = composerReferenceContents;
    const submissionReferenceCount = composerReferenceContents.length;
    const requestedProjectId = options.projectId?.trim() || '';

    const submitRequestId = submitRequestIdRef.current + 1;
    let abortCtrl: AbortController | null = null;
    let pendingMessageId = '';
    let pendingSessionId = currentSessionId;
    let factorContextAttached = false;
    let sessionListRefreshRequested = false;
    const requestSessionListRefresh = (completed = false) => {
      if (
        (sessionListRefreshRequested && !completed) ||
        submitRequestIdRef.current !== submitRequestId ||
        abortCtrl?.signal.aborted
      ) {
        return;
      }

      sessionListRefreshRequested = true;
      setSessionListRefreshKey(prevKey => prevKey + 1);
    };

    submitRequestIdRef.current = submitRequestId;
    setSubmitting(true);

    try {
      let sessionId = requestedProjectId ? '' : pendingSessionId;
      let sessionProjectId = currentSessionId
        ? activeConversationProjectId
        : '';

      if (!sessionId) {
        const nextConversation = requestedProjectId
          ? await createAgentProjectSession(
              requestedProjectId,
              options.projectCreatePayload ||
                buildAgentProjectSessionCreatePayload(agentRequestPayload),
            )
          : await createAgentSession(
              factorLibraryEntry || ccdbFactorDraft
                ? { entry: 'agent_home' }
                : undefined,
            );

        if (submitRequestIdRef.current !== submitRequestId) return;
        sessionId = nextConversation.sessionId || nextConversation.id;
        sessionProjectId = nextConversation.projectSession
          ? nextConversation.projectId || requestedProjectId
          : '';
        if (factorLibraryEntry) factorLibrarySessionIdRef.current = sessionId;
        pendingSessionId = sessionId;
        loadedHistorySessionIdRef.current = sessionId;
        loadedHistoryMessageIdRef.current = '';
        loadedHistorySessionStatusRef.current = nextConversation.status || '';
        setCurrentSessionId(sessionId);
        setCurrentSessionTitle(nextConversation.title);
        setCreatedConversation(nextConversation);
        selectedConversationRef.current = nextConversation.projectSession
          ? nextConversation
          : null;

        if (requestedProjectId && options.verifyProjectSessionHistory) {
          let initialHistory: Awaited<
            ReturnType<typeof fetchAgentSessionHistory>
          >;

          try {
            initialHistory = await fetchAgentSessionHistory(sessionId);
          } catch (error) {
            loadedHistorySessionIdRef.current = '';
            loadedHistoryMessageIdRef.current = '';
            loadedHistorySessionStatusRef.current = '';
            selectedConversationRef.current = null;
            setCurrentSessionId('');
            setCurrentSessionTitle('');
            setCreatedConversation(null);
            throw error;
          }

          if (submitRequestIdRef.current !== submitRequestId) {
            return;
          }

          const historyConversation = {
            ...nextConversation,
            ...initialHistory.session,
            canEditEnterprisePreview:
              initialHistory.session.canEditEnterprisePreview ??
              nextConversation.canEditEnterprisePreview,
            canWrite:
              initialHistory.session.canWrite ?? nextConversation.canWrite,
            initiatedByMe:
              initialHistory.session.initiatedByMe ??
              nextConversation.initiatedByMe,
            projectId: requestedProjectId,
            projectSession: true,
          };
          const hasUserMessage = initialHistory.messages.some(
            historyMessage => historyMessage.role === 'user',
          );

          loadedHistorySessionIdRef.current = sessionId;
          loadedHistoryMessageIdRef.current =
            initialHistory.latestMessageId || '';
          loadedHistorySessionStatusRef.current =
            initialHistory.session.status || nextConversation.status || '';
          setCreatedConversation(historyConversation);
          selectedConversationRef.current = historyConversation;
          setCurrentSessionTitle(historyConversation.title);

          if (hasUserMessage) {
            syncSessionIdToUrl({
              history,
              location,
              projectId: requestedProjectId,
              sessionId,
            });
            setConversationMessages(initialHistory.messages);
            setConversationStarted(true);
            setHistoryError('');
            requestSessionListRefresh();
            return;
          }
        }
      }

      if (submitRequestIdRef.current !== submitRequestId) {
        return;
      }

      const boundFactor = await bindLandingFactorToSession(sessionId);
      const factorContext = ccdbFactorSubmittedRef.current
        ? undefined
        : boundFactor || ccdbFactorDraft;
      factorContextAttached = Boolean(factorContext?.detail);
      const requestWithFactor = withCcdbFactorContext(
        agentRequestPayload,
        trimmedMessage,
        factorContext,
      );

      if (submitRequestIdRef.current !== submitRequestId) {
        return;
      }

      syncSessionIdToUrl({
        history,
        location,
        preserveFactorLanding: true,
        projectId: sessionProjectId || undefined,
        sessionId,
      });
      const submittedAt = new Date().toISOString();

      setLastSubmittedMessage(trimmedMessage);
      setConversationMessages(prevMessages =>
        [
          ...prevMessages,
          ...getCurrentTurnMessages({
            answerControls,
            attachments: conversationQuestionAttachments,
            blocks: answerBlocks,
            cards: answerCards,
            collapseActionRequests: collapseCurrentActionRequests,
            collapseFormRequests: collapseCurrentFormRequests,
            question: conversationQuestion,
            questionCreateTime: conversationQuestionTime,
            referenceCount: conversationQuestionReferenceCount || undefined,
            referenceContents: conversationQuestionReferenceContents.length
              ? conversationQuestionReferenceContents
              : undefined,
            toolCalls: answerToolCalls,
          }),
        ].map(item => ({
          ...item,
          cards: applyAccountingPurposeDraft(item.cards, requestPayload),
        })),
      );
      setConversationQuestion(trimmedMessage);
      setConversationQuestionTime(submittedAt);
      setConversationQuestionAttachments(submissionAttachments);
      setConversationQuestionReferenceCount(submissionReferenceCount);
      setConversationQuestionReferenceContents(submissionReferenceContents);
      setConversationStarted(true);
      resetPreviewFullscreen();
      setPreviewOpen(
        prevOpen =>
          prevOpen && (PREVIEW_PANE_ENABLED || hasBusinessPreviewTarget),
      );
      setMessage('');
      setComposerQuotes([]);
      if (hasAttachmentPayload) {
        setComposerAttachments([]);
      }

      answerTextSegmentIndexRef.current = 0;
      answerToolCallsRef.current = [];
      autoOpenedBusinessCardRef.current.clear();
      setAnswerBlocks([]);
      setAnswerCards([]);
      setAnswerControls(undefined);
      setAnswerToolCalls([]);

      streamAbortControllerRef.current?.abort();
      abortCtrl = new AbortController();
      streamAbortControllerRef.current = abortCtrl;
      activeStreamSessionIdRef.current = sessionId;

      const finalResponse = await sendAgentChatMessage({
        abortCtrl,
        message: trimmedMessage,
        requestPayload: requestWithFactor,
        onCard: handleStreamCard,
        onDelta: handleStreamDelta,
        onFinalResponse: response =>
          handleFinalResponse(response, { replaceExisting: true }),
        onLoadingEnd: () => setSubmitting(false),
        onMessageStart: block => {
          if (block.accountingPurposeConfirmation) {
            const receipt = block.accountingPurposeConfirmation;
            setConversationMessages(messages =>
              messages.map(item => ({
                ...item,
                cards: applyAccountingPurposeReceipt(item.cards, receipt),
              })),
            );
          }
          if (block.messageId && block.messageId !== 'message_default') {
            pendingMessageId = block.messageId;
          }

          requestSessionListRefresh();
        },
        onResumeState: state => {
          pendingMessageId = state.messageId;
        },
        onToolCall: handleStreamToolCall,
        sessionId,
      });
      if (factorContextAttached) {
        ccdbFactorSubmittedRef.current = true;
      }
      settleStreamToolCalls('ENDED');
      requestContextInsightDecision(
        finalResponse?.sessionId || sessionId,
        finalResponse?.messageId || pendingMessageId,
      );
      await markCompletedSessionRead(sessionId, finalResponse);

      requestSessionListRefresh(true);
    } catch (error) {
      if (
        abortCtrl?.signal.aborted ||
        submitRequestIdRef.current !== submitRequestId
      ) {
        return;
      }

      if (error instanceof CcdbFactorBindingError) {
        antdMessage.error(error.message || I18N.ccdb.factorContextSaveError);
        return;
      }

      if (isUnauthorizedAgentStreamError(error)) {
        setAuthenticated(false);
        return;
      }

      const recoverOutcome =
        abortCtrl && pendingSessionId && pendingMessageId
          ? await recoverInterruptedMessage({
              abortCtrl,
              messageId: pendingMessageId,
              sessionId: pendingSessionId,
              submitRequestId,
            })
          : 'failed';

      if (recoverOutcome === 'stale') {
        return;
      }

      if (recoverOutcome === 'recovered') {
        if (factorContextAttached) {
          ccdbFactorSubmittedRef.current = true;
        }
        settleStreamToolCalls('ENDED');
        requestContextInsightDecision(pendingSessionId, pendingMessageId);
        await markCompletedSessionRead(pendingSessionId);
        requestSessionListRefresh(true);
        return;
      }

      settleStreamToolCalls('FAILED');

      const failedMessage =
        recoverOutcome === 'cancelled'
          ? I18N.carbonAgent.userCancelledExecution
          : I18N.carbonAgent.sendFailedRetryPeriod;

      if (recoverOutcome === 'cancelled') {
        antdMessage.warning(failedMessage);
      } else {
        antdMessage.error(I18N.carbonAgent.sendFailedRetry);
      }

      if (abortCtrl) {
        setAnswerCards(prevCards =>
          prevCards.length
            ? prevCards
            : [
                {
                  card: {
                    eventType: 'error',
                    message: failedMessage,
                  },
                  cardType: 'error',
                  messageId:
                    pendingMessageId || pendingSessionId || 'send_error',
                  orderNo: 10,
                },
              ],
        );
      }
    } finally {
      if (submitRequestIdRef.current === submitRequestId) {
        setSubmitting(false);
      }

      if (streamAbortControllerRef.current === abortCtrl) {
        streamAbortControllerRef.current = null;
        activeStreamSessionIdRef.current = '';
      }
    }
  };

  const handleSubmit = (projectId?: string, messageOverride?: string) => {
    // “直接解析”与发送按钮共用同一真实 Agent 提交链路，附件范围在点击时固定。
    const submittedMessage = messageOverride ?? message;
    const readyAttachments = normalizeChatAttachments(composerAttachments);
    const hasUploadingAttachment = composerAttachments.some(
      attachment => attachment.status === 'uploading',
    );
    const selectedQuickSkill =
      selectedModeOption?.quickSkill ||
      getQuickSkillByMode(activeMode, {
        enterpriseCarbon: isEnterpriseCarbonContext,
      });
    const productFootprintParams =
      activeMode === 'productFootprint'
        ? getProductFootprintRequestParams(
            productFootprintScope,
            productFootprintFactorScope,
          )
        : {};
    const referencePayload = getComposerReferencePayload(composerQuotes);
    const quotedMessage = getQuotedComposerSubmitMessage(
      submittedMessage,
      composerReferenceContents,
    );
    const hasReferencePayload = referencePayload.length > 0;

    if (hasUploadingAttachment) {
      antdMessage.info(I18N.carbonAgent.waitUploadBeforeSend);
      return;
    }

    if (composerAttachments.length && !readyAttachments.length) {
      antdMessage.warning(I18N.carbonAgent.removeFailedBeforeSend);
      return;
    }

    if (!readyAttachments.length) {
      submitConversationMessage(
        selectedQuickSkill || hasReferencePayload
          ? {
              displayMessage:
                submittedMessage.trim() ||
                (hasReferencePayload
                  ? I18N.carbonAgent.continueFromSelectedText
                  : ''),
              message: quotedMessage,
              ...productFootprintParams,
              quickSkill: selectedQuickSkill,
              ...(hasReferencePayload ? { references: referencePayload } : {}),
            }
          : quotedMessage,
        { projectId },
      );

      if (selectedQuickSkill) {
        setActiveMode('none');
      }

      return;
    }

    const nextMessage =
      submittedMessage.trim() || getAttachmentSubmitMessage(readyAttachments);
    let materialOrigin: AgentMonitorMaterialOrigin | undefined;
    try {
      materialOrigin = resolveMonitorMaterialOrigin(
        composerAttachments,
        activeConversationSessionId,
      );
    } catch {
      antdMessage.warning(I18N.cbamMonitor.agentMaterialOriginConflict);
      return;
    }
    const quotedAttachmentMessage = getQuotedComposerSubmitMessage(
      nextMessage,
      composerReferenceContents,
    );

    submitConversationMessage(
      {
        attachments: readyAttachments,
        displayMessage: nextMessage,
        files: getAttachmentFilePayload(readyAttachments),
        materialOrigin,
        message: quotedAttachmentMessage,
        ...productFootprintParams,
        quickSkill: selectedQuickSkill,
        ...(hasReferencePayload ? { references: referencePayload } : {}),
      },
      { projectId },
    );

    if (selectedQuickSkill) {
      setActiveMode('none');
    }
  };

  const handleRetryMessage = (nextMessage: string) => {
    submitConversationMessage(nextMessage);
  };

  const handleShareConversation = () => {
    if (!personalWorkspace && !activeConversationProjectId) return;
    if (!requireLogin() || projectConversationReadonly) {
      return;
    }

    const sessionId = activeConversationSessionId;

    if (!sessionId) {
      antdMessage.warning(I18N.carbonAgent.shareMissingSession);
      return;
    }

    setShareCreating(true);

    const shareUrlPromise = (
      createdConversation?.projectSession && activeConversationProjectId
        ? createAgentProjectSessionShare(activeConversationProjectId, sessionId)
        : createAgentSessionShare(sessionId, {
            expireDays: AGENT_SHARE_EXPIRE_DAYS,
            title: activeConversationTitle,
          })
    ).then(nextShare => {
      const shareUrl =
        nextShare?.shareUrl || getFallbackAgentShareUrl(nextShare?.shareId);

      if (!nextShare?.shareId || !shareUrl) {
        throw new Error(I18N.carbonAgent.shareCreateFailed);
      }

      setShareInfo({ ...nextShare, shareUrl });
      return shareUrl;
    });

    copyToClipboard(shareUrlPromise)
      .then(() => {
        antdMessage.success(I18N.carbonAgent.shareCopied);
      })
      .catch(error => {
        if (error instanceof ClipboardCopyError) {
          antdMessage.warning(I18N.carbonAgent.shareCopyFailed);
        }
      })
      .finally(() => setShareCreating(false));
  };

  const handleCreateProjectConversationBranch = async () => {
    if (workspaceAccess && !workspaceAccess.canUseAi) {
      antdMessage.warning(
        reasonText(workspaceAccess.aiReasonCode || workspaceAccess.reasonCode),
      );
      return;
    }
    if (
      !requireLogin() ||
      !projectConversationReadonly ||
      !activeConversationProjectId ||
      !activeConversationSessionId ||
      projectConversationBranchCreating
    ) {
      return;
    }

    setProjectConversationBranchCreating(true);

    try {
      const branchConversation = await createAgentProjectSessionBranch(
        activeConversationProjectId,
        activeConversationSessionId,
      );
      const branchSessionId =
        branchConversation.sessionId || branchConversation.id;

      if (!branchSessionId) {
        throw new Error(I18N.carbonAgent.projectConversationBranchFailed);
      }

      setCreatedConversation(branchConversation);
      selectedConversationRef.current = branchConversation;
      setCurrentSessionId(branchSessionId);
      setCurrentSessionTitle(branchConversation.title);
      setSessionListRefreshKey(value => value + 1);
      syncSessionIdToUrl({
        history,
        location,
        projectId: activeConversationProjectId,
        sessionId: branchSessionId,
      });
      antdMessage.success(I18N.carbonAgent.projectConversationBranchCreated);
    } catch (error) {
      antdMessage.error(
        error instanceof Error && error.message
          ? error.message
          : I18N.carbonAgent.projectConversationBranchFailed,
      );
    } finally {
      setProjectConversationBranchCreating(false);
    }
  };

  const handleErrorFeedback = () => {
    antdMessage.info(I18N.carbonAgent.feedbackReceived);
  };

  const handleActionRequestSubmit = (
    payload: AgentActionRequestSubmitPayload,
  ) => {
    submitConversationMessage(payload, {
      collapseActionRequests: true,
    });
  };

  const handleFormRequestSubmit = (payload: AgentFormRequestSubmitPayload) => {
    submitConversationMessage(payload);
  };

  const handleEnterpriseConfirmation = async (
    confirmation: EnterpriseConfirmation,
  ) => {
    if (
      conversationReadonly ||
      submitting ||
      historyLoading ||
      confirmation.sessionId !== activeConversationSessionId ||
      confirmation.sessionId !== currentSessionId
    ) {
      throw new Error(I18N.enterpriseData.invalidSession);
    }
    if (!requireLogin('send')) return;
    await submitConversationMessage(
      confirmationPayload(
        confirmation,
        I18N.enterpriseData.confirmation.replace(
          '{name}',
          confirmation.company.name,
        ),
        lang,
      ),
    );
  };

  let previewEnterpriseCarbonCertificationSubmitted:
    | ((certificationId?: number | string) => void)
    | undefined = handlePreviewEnterpriseCarbonCertificationSubmitted;
  let previewEnterpriseCarbonExpertReviewOpen:
    | ((target?: BusinessCardPreviewTarget) => void)
    | undefined = handlePreviewEnterpriseCarbonExpertReviewOpen;

  if (enterpriseCarbonReviewCertificationReadonly) {
    previewEnterpriseCarbonCertificationSubmitted = undefined;
    previewEnterpriseCarbonExpertReviewOpen = undefined;
  }

  const projectConversationHeader =
    !isShareMode && activeConversationProjectId
      ? {
          branchCreating: projectConversationBranchCreating,
          initiatedByMe: createdConversation?.initiatedByMe,
          ownerName: createdConversation?.initiatorUserName,
          projectName:
            activeProjectConversationProject?.name ||
            I18N.template(I18N.carbonAgent.projectWithId, {
              val1: activeConversationProjectId,
            }),
          readonly: projectConversationReadonly,
          sessionTitle: activeConversationTitle,
          shareDisabled: shareConversationDisabled,
          shareLoading: shareCreating,
          onCreateBranch:
            projectConversationReadonly &&
            (!workspaceAccess || workspaceAccess.canUseAi)
            ? handleCreateProjectConversationBranch
            : undefined,
          onProjectOpen: () =>
            handleSectionSelect(
              getProjectSectionKey(activeConversationProjectId),
            ),
          onShare:
            projectConversationReadonly || desktopPreviewVisible
              ? undefined
              : handleShareConversation,
        }
      : undefined;

  return (
    <EnterpriseDataProvider
      enabled={authenticated && !isShareMode}
      active={
        isEnterpriseSection(activeSection) ||
        answerCards.some(card => getEnterpriseCard(card.card)) ||
        conversationMessages.some(message =>
          message.cards?.some(card => getEnterpriseCard(card.card)),
        )
      }
      onConfirm={handleEnterpriseConfirmation}
      onOpen={companyId => {
        if (!requireLogin('menu')) return;
        history.push({
          pathname: location.pathname,
          search: enterpriseSearch(location.search, 'enterpriseDetail', {
            companyId,
          }),
        });
        resetHomeState('enterpriseDetail');
      }}
    >
      <div
        className={classNames(style.page, {
          [style.pageFileDropActive]: fileDropActive,
          [style.sharePage]: isShareMode,
          [style.mobilePage]: isMobile,
          [style.androidPage]: isAndroid,
        })}
        onDragEnter={conversationReadonly ? undefined : handlePageDragEnter}
        onDragLeave={conversationReadonly ? undefined : handlePageDragLeave}
        onDragOver={conversationReadonly ? undefined : handlePageDragOver}
        onDrop={conversationReadonly ? undefined : handlePageDrop}
        onPaste={conversationReadonly ? undefined : handlePagePaste}
      >
        {isMobile && activeSection !== 'issueFeedback' ? (
          <MobileAgentHeader
            variant={
              !conversationStarted && activeSection === 'cbamFiles'
                ? 'fileManagement'
                : 'default'
            }
            leftAction={mobileHeaderLeftAction}
            rightAction={isShareMode || mobileProjectPage ? 'none' : 'newChat'}
            title={mobileHeaderTitle}
            onBack={handleMobileHeaderBack}
            onMenu={handleOpenMobileSidebar}
            onNewChat={handleNewChat}
          />
        ) : null}

        {!isMobile && !isShareMode ? (
          <Sidebar
            activeSection={activeSection}
            authenticated={authenticated}
            collapsed={sidebarCollapsed}
            createdConversation={createdConversation}
            footprintAccountingSelected={footprintAccountingSelected}
            inviteOpenRequestKey={inviteOpenRequestKey}
            projectListRefreshKey={projectListRefreshKey}
            selectedSessionId={selectedSidebarSessionId}
            sessionListRefreshKey={sessionListRefreshKey}
            onConversationsChanged={handleConversationsChanged}
            onHistorySelect={handleHistorySelect}
            onInviteOpenRequestHandled={() => setInviteOpenRequestKey(0)}
            onLoginRequest={() => requestLogin('personal_settings')}
            onNewChat={handleNewChat}
            onOpenGuide={handleAgentGuideOpen}
            onRequireLogin={requireLogin}
            onSelectSection={handleSectionSelect}
            onToggleCollapsed={handleToggleSidebar}
            onViewAllHistory={handleViewAllHistory}
          />
        ) : null}

        {isMobile && !isShareMode ? (
          <MobileSidebarDrawer
            activeSection={activeSection}
            authenticated={authenticated}
            createdConversation={createdConversation}
            footprintAccountingSelected={footprintAccountingSelected}
            inviteOpenRequestKey={inviteOpenRequestKey}
            mobileProfileOpenRequested={mobileProfileOpenRequested}
            open={mobileSidebarOpen}
            projectListRefreshKey={projectListRefreshKey}
            selectedSessionId={selectedSidebarSessionId}
            sessionListRefreshKey={sessionListRefreshKey}
            onClose={() => setMobileSidebarOpen(false)}
            onConversationsChanged={handleConversationsChanged}
            onHistorySelect={handleHistorySelect}
            onInviteOpenRequestHandled={() => setInviteOpenRequestKey(0)}
            onLoginRequest={() => requestLogin('personal_settings')}
            onMobileProfileOpenRequestHandled={() =>
              setMobileProfileOpenRequested(false)
            }
            onNewChat={handleNewChat}
            onOpenGuide={handleAgentGuideOpen}
            onRequireLogin={requireLogin}
            onSelectSection={handleSectionSelect}
            onViewAllHistory={handleViewAllHistory}
          />
        ) : null}

        <main
          className={classNames(style.workspace, {
            [factorLibraryStyles.workspace]:
              !conversationStarted && activeSection === 'factorLibrary',
            [style.workspaceAccounting]:
              !conversationStarted &&
              (activeSection === 'footprintAccounting' ||
                activeSection === 'enterpriseCarbon'),
            [style.workspaceConversation]: conversationStarted,
            [style.workspaceHistory]:
              !conversationStarted &&
              (activeSection === 'history' ||
                isEnterpriseSection(activeSection)),
            [style.workspaceIssueFeedback]:
              !conversationStarted && activeSection === 'issueFeedback',
            [style.workspaceCbamFiles]:
              !conversationStarted && activeSection === 'cbamFiles',
            [style.workspaceProjectHome]:
              !conversationStarted &&
              Boolean(
                activeProjectId ||
                  activeProjectTasksId ||
                  activeProjectFilesId ||
                  activeProjectOverviewId ||
                  activeProjectComparisonId,
              ),
          })}
        >
          <WorkspaceNotice />
          {conversationStarted ? (
            <div
              ref={conversationWorkspaceRef}
              className={classNames(style.conversationWorkspace, {
                [style.conversationWorkspacePreviewClosed]:
                  !desktopPreviewVisible,
                [style.conversationWorkspacePreviewFullscreen]:
                  desktopPreviewVisible && previewFullscreenActive,
                [style.conversationWorkspacePreviewFullscreenExiting]:
                  desktopPreviewVisible && previewFullscreenExiting,
                [style.conversationWorkspaceResizing]: previewResizing,
              })}
              style={conversationWorkspaceStyle}
            >
              <ConversationPanel
                monitorContext={
                  authenticated &&
                  Boolean(
                    activeConversationSessionId &&
                      monitorResourceSessionId === activeConversationSessionId,
                  )
                }
                onMonitorParse={() =>
                  handleSubmit(
                    undefined,
                    [message.trim(), I18N.cbamMonitor.agentParsePrompt]
                      .filter(Boolean)
                      .join('\n'),
                  )
                }
                activeMode={activeMode}
                attachments={composerAttachments}
                answerBlocks={answerBlocks}
                answerCards={answerCards}
                answerControls={answerControls}
                answerStreaming={submitting}
                answerToolCalls={answerToolCalls}
                copyOnly={projectConversationReadonly}
                contextInsightBanner={
                  authenticated &&
                  !conversationReadonly &&
                  contextInsightBannerSessionIdRef.current ===
                    activeConversationSessionId
                    ? contextInsightBanner
                    : null
                }
                enterpriseCarbonReviewCertificationDisabled={
                  usesEnterpriseProjectPermissions
                    ? !canEditEnterpriseProjectAccounting
                    : undefined
                }
                headerTitle={isShareMode ? activeConversationTitle : undefined}
                historyError={historyError}
                historyLoading={historyLoading}
                liveWorkspaceOpen={desktopWorkspacePreviewVisible}
                liveWorkspaceSession={
                  desktopWorkspacePreviewVisible
                    ? previewTarget?.workspaceLiveSession
                    : undefined
                }
                messages={conversationMessages}
                modeOptions={modeOptions}
                previewOpen={desktopPreviewVisible}
                productFootprintOptions={productFootprintComposerOptions}
                projectHeader={projectConversationHeader}
                projectId={activeConversationProjectId || undefined}
                question={conversationQuestion}
                questionAttachments={conversationQuestionAttachments}
                questionCreateTime={conversationQuestionTime}
                questionReferenceContents={
                  conversationQuestionReferenceContents
                }
                questionReferenceCount={conversationQuestionReferenceCount}
                readonly={conversationReadonly}
                quotes={composerReferenceContents}
                selectionResetKey={[
                  isShareMode ? shareId : sessionIdFromParams,
                  currentSessionId,
                  historyLoading ? 'loading' : 'ready',
                  composerReferenceContents.join('|'),
                ].join(':')}
                sessionId={activeConversationSessionId}
                shareDisabled={shareConversationDisabled}
                shareExpired={isShareMode && shareExpired}
                shareId={isShareMode ? shareId : undefined}
                shareExpireTime={shareInfo?.expireTime}
                shareLoading={shareCreating}
                feedbackSource={isMobile ? 'agent_h5' : 'agent_web'}
                factorDraft={ccdbFactorDraft}
                factorRefs={ccdbSessionFactors}
                factorRefsError={ccdbSessionFactorsError}
                onReloadFactorRefs={retryCcdbSessionFactors}
                submitting={submitting}
                value={message}
                onChange={handleMessageChange}
                onContextInsightAction={handleContextInsightAction}
                onContextInsightDismiss={dismissCurrentContextInsightBanner}
                onActionRequestSubmit={handleActionRequestSubmit}
                onAttachmentDownload={handleAttachmentDownload}
                onErrorFeedback={handleErrorFeedback}
                onFileRemove={handleComposerFileRemove}
                onFilesSelect={handleComposerFilesSelect}
                onFormRequestSubmit={handleFormRequestSubmit}
                onModeChange={handleModeChange}
                onProjectFileSelect={handleProjectComposerFileSelect}
                onCancel={handleCancelConversation}
                onBusinessCardOpen={handleBusinessCardOpen}
                onFactorOpen={handleCcdbFactorOpen}
                onOpenAccountingManagement={
                  conversationReadonly
                    ? undefined
                    : () => handleSectionSelect('footprintAccounting')
                }
                onOpenLiveWorkspace={handleLiveWorkspaceOpen}
                onOpenPreview={
                  !isShareMode && PREVIEW_PANE_ENABLED
                    ? handlePreviewOpen
                    : undefined
                }
                onQuestionChange={handleQuestionChange}
                onQuoteRemove={handleComposerQuoteRemove}
                onQuoteSelect={
                  conversationReadonly ? undefined : handleComposerQuoteSelect
                }
                onReloadHistory={
                  isShareMode ? handleReloadShareHistory : handleReloadHistory
                }
                onRetryMessage={handleRetryMessage}
                onShare={
                  !conversationReadonly &&
                  (personalWorkspace || Boolean(activeConversationProjectId)) &&
                  isMobile
                    ? handleShareConversation
                    : undefined
                }
                onShareExpiredExit={
                  isShareMode ? handleShareExpiredExit : undefined
                }
                showThirdPartyCertification={!isMobile}
                onSubmit={handleSubmit}
              />
              {showPreviewClosedActions ? (
                <div className={style.previewClosedActions}>
                  {(personalWorkspace ||
                    Boolean(activeConversationProjectId)) &&
                  showDesktopClosedShareButton ? (
                    <Tooltip title={I18N.carbonAgent.share} placement='bottom'>
                      <button
                        className={classNames(
                          style.previewShareButton,
                          style.previewClosedShareButton,
                        )}
                        type='button'
                        aria-label={I18N.carbonAgent.share}
                        aria-busy={shareCreating}
                        disabled={shareConversationDisabled}
                        onClick={handleShareConversation}
                      >
                        <ShareAltOutlined />
                      </button>
                    </Tooltip>
                  ) : null}
                  {showPreviewOpenButton ? (
                    <Tooltip
                      title={I18N.carbonAgent.openModel}
                      placement='left'
                    >
                      <button
                        className={style.previewOpenButton}
                        type='button'
                        aria-label={I18N.carbonAgent.openModel}
                        onClick={handlePreviewOpen}
                      >
                        <PreviewDrawerOpenIcon />
                      </button>
                    </Tooltip>
                  ) : null}
                </div>
              ) : null}
              {!isMobile &&
              (PREVIEW_PANE_ENABLED || hasBusinessPreviewTarget) ? (
                ccdbFactorTarget ? (
                  <CcdbFactorDetailPane
                    fullscreen={previewFullscreenActive}
                    open={desktopPreviewVisible}
                    target={ccdbFactorTarget}
                    onClose={handlePreviewClose}
                    onLoaded={handleCcdbFactorLoaded}
                    onResizeStart={handlePreviewResizeStart}
                    onShare={handleCcdbFactorShare}
                    onToggleFullscreen={handlePreviewFullscreenToggle}
                  />
                ) : (
                  <PreviewPane
                    accountId={previewAccountTarget?.accountId}
                    accountRefreshKey={previewAccountTarget?.refreshKey}
                    activeTabKey={previewActiveTabRequest?.key}
                    activeTabPlanId={
                      previewActiveTabRequest?.planId ||
                      (previewTarget?.type === 'cbamMonitor'
                        ? previewTarget.planId
                        : undefined)
                    }
                    activeTabAccountId={previewActiveTabRequest?.accountId}
                    activeTabEnterpriseCarbonBizId={
                      previewActiveTabRequest?.enterpriseCarbonBizId
                    }
                    activeTabReportId={previewActiveTabRequest?.reportId}
                    activeTabReportUrl={previewActiveTabRequest?.reportUrl}
                    activeTabTrigger={previewActiveTabRequest?.token}
                    activeTabYear={previewActiveTabRequest?.year}
                    agentSessionId={activeConversationSessionId}
                    certificationAccountId={
                      previewCertificationTarget?.accountId
                    }
                    certificationAuthType={
                      previewCertificationTarget?.certificationAuthType
                    }
                    certificationDraftAuthType={
                      previewCertificationTarget?.certificationDraftAuthType
                    }
                    certificationDetails={
                      previewCertificationTarget?.certificationDetails
                    }
                    expertReviewDetail={previewExpertReviewTarget?.reviewDetail}
                    expertReviewDetails={
                      previewExpertReviewTarget?.reviewDetails
                    }
                    enterpriseCarbonReviewCertificationLoading={
                      previewEnterpriseCarbonCertificationChecking ||
                      enterpriseCarbonExpertReview.checking
                    }
                    enterpriseCarbonReviewCertificationReadonly={
                      usesEnterpriseProjectPermissions
                        ? !canEditEnterpriseProjectAccounting
                        : undefined
                    }
                    enterpriseCarbonAccountingPermissions={
                      enterpriseCarbonAccountingPermissions
                    }
                    enterpriseCarbonAccountingReadonly={isShareMode}
                    fullscreen={previewFullscreenActive}
                    maxWidth={previewPaneMaxWidth}
                    minWidth={PREVIEW_PANE_MIN_WIDTH}
                    open={desktopPreviewVisible}
                    projectId={activePreviewProjectId || undefined}
                    productId={previewAccountTarget?.productId}
                    reportId={previewReportTarget?.reportId}
                    reportName={previewReportTarget?.reportName}
                    reportUrl={previewReportTarget?.reportUrl}
                    previewTargets={previewTargetsForPane}
                    reviewCertificationLoading={
                      previewReviewPreparing || previewCertificationChecking
                    }
                    readonly={conversationReadonly}
                    shareAccountSearch={
                      isShareMode ? location.search : undefined
                    }
                    shareAuth={
                      isShareMode
                        ? previewAccountTarget?.shareAuth ||
                          previewReportTarget?.shareAuth ||
                          previewTarget?.shareAuth
                        : undefined
                    }
                    showBusinessForesight={showConversationBusinessForesight}
                    shareDisabled={shareConversationDisabled}
                    shareId={isShareMode ? shareId : undefined}
                    shareLoading={shareCreating}
                    sessionId={activeConversationSessionId}
                    type={previewTarget?.type}
                    width={previewPaneWidth}
                    onClose={handlePreviewClose}
                    onCarbonLabelOpen={
                      conversationReadonly
                        ? undefined
                        : handlePreviewCarbonLabelOpen
                    }
                    onCarbonLabelSubmitted={handlePreviewCarbonLabelSubmitted}
                    onAccountSuggestionReferenceSelect={
                      conversationReadonly
                        ? undefined
                        : handleAccountSuggestionReferenceSelect
                    }
                    onEmissionTaskCreate={
                      activeConversationProjectId && !conversationReadonly
                        ? handlePreviewEmissionTaskCreate
                        : undefined
                    }
                    onCertificationApplySubmitted={
                      conversationReadonly
                        ? undefined
                        : handlePreviewCertificationApplySubmitted
                    }
                    onEnterpriseCarbonCertificationSubmitted={
                      previewEnterpriseCarbonCertificationSubmitted
                    }
                    onEnterpriseCarbonExpertReviewOpen={
                      previewEnterpriseCarbonExpertReviewOpen
                    }
                    onEnterpriseCarbonThirdPartyCertificationOpen={
                      enterpriseCarbonReviewCertificationReadonly
                        ? undefined
                        : handlePreviewEnterpriseCarbonThirdPartyCertificationOpen
                    }
                    onExpertReviewOpen={
                      conversationReadonly
                        ? undefined
                        : handlePreviewExpertReviewOpen
                    }
                    onResizeBy={handlePreviewResizeBy}
                    onResizeStart={handlePreviewResizeStart}
                    onShare={
                      (personalWorkspace ||
                        Boolean(activeConversationProjectId)) &&
                      !conversationReadonly &&
                      desktopPreviewVisible
                        ? handleShareConversation
                        : undefined
                    }
                    onThirdPartyCertificationOpen={
                      conversationReadonly
                        ? undefined
                        : handlePreviewThirdPartyCertificationOpen
                    }
                    onToggleFullscreen={handlePreviewFullscreenToggle}
                  />
                )
              ) : null}
            </div>
          ) : authenticated && isEnterpriseSection(activeSection) ? (
            <EnterpriseDataPage />
          ) : activeSection === 'factorLibrary' ? (
            <FactorLibraryHome
              composer={
                <Composer
                  disabled={conversationReadonly}
                  activeMode={activeMode}
                  className={factorLibraryStyles.composer}
                  modeOptions={modeOptions}
                  placeholder={I18N.ccdb.libraryPlaceholder}
                  inputLabel={I18N.ccdb.libraryInputLabel}
                  footerHint={I18N.ccdb.libraryInputHint}
                  showModeSelector={false}
                  showAttachmentButton={false}
                  submitting={submitting}
                  value={message}
                  onChange={handleMessageChange}
                  onModeChange={handleModeChange}
                  onCancel={handleCancelConversation}
                  onSubmit={handleSubmit}
                />
              }
            />
          ) : activeSection === 'footprintAccounting' ? (
            <div
              className={classNames(
                style.homeSurface,
                style.accountingManagementSurface,
              )}
            >
              <FootprintAccountingHome
                isMobile={isMobile}
                onOpenAccountPreview={handleBusinessCardOpen}
                onOpenConversation={handleHistorySelect}
              />
            </div>
          ) : activeSection === 'enterpriseCarbon' ? (
            <div
              className={classNames(
                style.homeSurface,
                style.accountingManagementSurface,
                style.enterpriseAccountingManagementSurface,
              )}
            >
              <EnterpriseCarbonAccountingHome
                isMobile={isMobile}
                onOpenAccountingPreview={handleBusinessCardOpen}
                onOpenConversation={handleHistorySelect}
              />
            </div>
          ) : activeSection === 'history' ? (
            <HistoryPage
              mobile={isMobile}
              refreshKey={sessionListRefreshKey}
              selectedSessionId={sessionIdFromParams}
              onConversationsChanged={handleConversationsChanged}
              onSelectConversation={handleHistorySelect}
            />
          ) : activeSection === 'cbamFiles' ? (
            <CbamFileManagement
              isMobile={isMobile}
              onOpenConversation={handleHistorySelect}
            />
          ) : activeSection === 'issueFeedback' ? (
            <IssueFeedbackSection
              initialSessionId={
                issueFeedbackContextRef.current.sessionId ||
                issueFeedbackNavigationContext.sessionId
              }
              initialSessionTitle={
                issueFeedbackContextRef.current.sessionTitle ||
                issueFeedbackNavigationContext.sessionTitle
              }
              mobile={isMobile}
              refreshKey={sessionListRefreshKey}
              sourcePath={
                issueFeedbackContextRef.current.sourcePath ||
                issueFeedbackNavigationContext.sourcePath
              }
              onClose={
                isMobile ? handleOpenMobilePersonalCenter : handleNewChat
              }
            />
          ) : authenticated && activeProjectComparisonId ? (
            <ProjectCalculationComparison
              calculations={
                projectComparisonState?.projectId === activeProjectComparisonId
                  ? projectComparisonState.calculations
                  : undefined
              }
              initialAccountIds={
                projectComparisonState?.projectId === activeProjectComparisonId
                  ? projectComparisonState.accountIds
                  : undefined
              }
              initialComparison={
                projectComparisonState?.projectId === activeProjectComparisonId
                  ? projectComparisonState.comparison
                  : undefined
              }
              projectId={activeProjectComparisonId}
              onBack={() =>
                handleSectionSelect(
                  getProjectOverviewSectionKey(activeProjectComparisonId),
                )
              }
            />
          ) : authenticated && activeProjectOverviewId ? (
            <ProjectOverviewEntry
              mobile={isMobile}
              projectId={activeProjectOverviewId}
              onBack={() =>
                handleSectionSelect(`project:${activeProjectOverviewId}`)
              }
              onComparisonReady={(comparison, accountIds, calculations) =>
                handleProjectCalculationsCompare(
                  activeProjectOverviewId,
                  comparison,
                  accountIds,
                  calculations,
                )
              }
              onConversationOpen={(sessionId, title) =>
                handleProjectCalculationConversationOpen(
                  activeProjectOverviewId,
                  sessionId,
                  title,
                )
              }
            />
          ) : authenticated && activeProjectTasksId ? (
            <ProjectTasksEntry
              initialTaskId={focusedProjectTaskId}
              projectId={activeProjectTasksId}
              onConversationStart={taskId =>
                handleProjectTaskConversationStart(activeProjectTasksId, taskId)
              }
              onBack={() =>
                handleSectionSelect(`project:${activeProjectTasksId}`)
              }
              onProductFootprintAccountOpen={
                isMobile
                  ? accountId =>
                      handleBusinessCardOpen({
                        accountId,
                        snapFlag: API_EXTRA_PARAMS_SNAPFLAG.SHARE,
                        type: 'account',
                      })
                  : undefined
              }
            />
          ) : authenticated && activeProjectFilesId ? (
            <ProjectFilesPage
              projectId={activeProjectFilesId}
              onBack={() =>
                handleSectionSelect(`project:${activeProjectFilesId}`)
              }
              onUseFileAsContext={handleProjectFileContextSelect}
            />
          ) : authenticated && activeProjectId ? (
            <ProjectHome
              isMobile={isMobile}
              projectId={activeProjectId}
              refreshKey={projectListRefreshKey}
              onOpenFiles={() => handleProjectFilesOpen(activeProjectId)}
              onOpenOverview={() => handleProjectOverviewOpen(activeProjectId)}
              onOpenSettings={() =>
                setProjectSettingsProjectId(activeProjectId)
              }
              onOpenTasks={taskId =>
                handleProjectTasksOpen(activeProjectId, taskId)
              }
              onProjectFileContextSelect={handleProjectFileContextSelect}
              onSuggestionSelect={suggestion =>
                handleProjectSuggestionSelect(activeProjectId, suggestion)
              }
              onTaskConversationStart={taskId =>
                handleProjectTaskConversationStart(activeProjectId, taskId)
              }
              composer={
                <Composer
                  disabled={conversationReadonly}
                  activeMode={activeMode}
                  attachments={composerAttachments}
                  className={style.projectHomeComposer}
                  modeOptions={modeOptions}
                  placeholder={I18N.carbonAgent.projectComposerPlaceholder}
                  productFootprintOptions={productFootprintComposerOptions}
                  projectId={activeProjectId}
                  quotes={composerReferenceContents}
                  showModeSelector={false}
                  submitting={submitting}
                  value={message}
                  onChange={handleMessageChange}
                  onAttachmentDownload={handleAttachmentDownload}
                  onFileRemove={handleComposerFileRemove}
                  onFilesSelect={handleComposerFilesSelect}
                  onModeChange={handleModeChange}
                  onProjectFileSelect={handleProjectComposerFileSelect}
                  onCancel={handleCancelConversation}
                  onQuoteRemove={handleComposerQuoteRemove}
                  onSubmit={() => handleSubmit(activeProjectId)}
                />
              }
            />
          ) : (
            <div
              className={classNames(style.homeSurface, style.newChatSurface)}
            >
              <NewChatHero
                disabled={conversationReadonly}
                authenticated={authenticated}
                mobile={isMobile}
                scene={homeSuggestionScene}
                onPromptSelect={handlePromptSelect}
              />
              <Composer
                disabled={conversationReadonly}
                activeMode={activeMode}
                attachments={composerAttachments}
                className={style.newChatComposer}
                modeOptions={modeOptions}
                productFootprintOptions={productFootprintComposerOptions}
                quotes={composerReferenceContents}
                submitting={submitting}
                value={message}
                onChange={handleMessageChange}
                onAttachmentDownload={handleAttachmentDownload}
                onFileRemove={handleComposerFileRemove}
                onFilesSelect={handleComposerFilesSelect}
                onModeChange={handleModeChange}
                onCancel={handleCancelConversation}
                onQuoteRemove={handleComposerQuoteRemove}
                onSubmit={handleSubmit}
              />
            </div>
          )}
          <span className={style.srOnly} aria-live='polite'>
            {lastSubmittedMessage
              ? I18N.template(I18N.carbonAgent.submittedPrefix, {
                  val1: lastSubmittedMessage,
                })
              : ''}
          </span>
        </main>

        {fileDropActive ? (
          <div className={style.fileDropOverlay} aria-hidden='true'>
            <div className={style.fileDropIllustration}>
              <span className={style.fileDropArrow} />
              <span
                className={classNames(
                  style.fileDropCube,
                  style.fileDropCubeLarge,
                )}
              />
              <span
                className={classNames(
                  style.fileDropCube,
                  style.fileDropCubeLeft,
                )}
              />
              <span
                className={classNames(
                  style.fileDropCube,
                  style.fileDropCubeTop,
                )}
              />
              <span
                className={classNames(
                  style.fileDropCube,
                  style.fileDropCubeRight,
                )}
              />
              <span
                className={classNames(
                  style.fileDropCube,
                  style.fileDropCubeSmall,
                )}
              />
            </div>
            <strong className={style.fileDropTitle}>
              {I18N.carbonAgent.dropFilesHere}
            </strong>
            <p className={style.fileDropDescription}>
              {I18N.template(I18N.carbonAgent.dropFilesHint, {
                val1: MAX_COMPOSER_ATTACHMENTS,
                val2: ACCEPTED_ATTACHMENT_EXTENSION_TEXT,
              })}
            </p>
          </div>
        ) : null}

        {!isShareMode && authenticated ? (
          <ProjectCreateDialog
            locale={locale}
            open={Boolean(projectSettingsProjectId)}
            projectId={projectSettingsProjectId}
            onCancel={() => setProjectSettingsProjectId('')}
            onUpdated={() => {
              setProjectSettingsProjectId('');
              setProjectListRefreshKey(currentKey => currentKey + 1);
            }}
          />
        ) : null}

        <ProjectTaskCreateDialog
          context={previewTaskCreate?.context}
          locale={locale}
          open={Boolean(previewTaskCreate)}
          projectId={previewTaskCreate?.projectId || ''}
          onCancel={() => setPreviewTaskCreate(undefined)}
          onCreated={() => {
            setPreviewTaskCreate(undefined);
            antdMessage.success(I18N.carbonAgent.projectTaskCreateSuccess);
          }}
        />

        <ReviewCertificationModals
          expertReviewCanApply={previewReviewPrepareInfo?.canApply}
          expertReviewDisabledReason={previewReviewPrepareInfo?.disabledReason}
          expertReviewOpen={previewExpertReviewOpen}
          expertReviewPointCost={previewReviewPrepareInfo?.pointCost}
          reviewPurpose={previewReviewPurpose}
          reviewSubmitting={previewReviewSubmitting}
          snapshotUpdateTime={formatExpertReviewPrepareTime(
            previewReviewPrepareInfo?.modelUpdateTime,
          )}
          snapshotVersion='v1.0'
          thirdPartyCertificationOpen={
            !isMobile && previewThirdPartyCertificationOpen
          }
          onCloseExpertReview={handlePreviewExpertReviewClose}
          onCloseThirdPartyCertification={
            handlePreviewThirdPartyCertificationClose
          }
          onExpertReviewSubmit={handlePreviewExpertReviewSubmit}
          onReviewPurposeChange={setPreviewReviewPurpose}
          onThirdPartyCertificationSubmit={
            handlePreviewThirdPartyCertificationSubmit
          }
        />

        <EnterpriseCarbonCertificationModal
          open={
            Boolean(enterpriseCarbonCertificationRequest) &&
            !enterpriseCarbonReviewCertificationReadonly
          }
          onCancel={handleEnterpriseCarbonCertificationCancel}
          onConfirm={handleEnterpriseCarbonCertificationConfirm}
        />

        <EnterpriseCarbonExpertReviewModal
          context={enterpriseCarbonExpertReview.context}
          open={
            enterpriseCarbonExpertReview.modalOpen &&
            !enterpriseCarbonReviewCertificationReadonly
          }
          prepareInfo={enterpriseCarbonExpertReview.prepareInfo}
          purpose={enterpriseCarbonExpertReview.purpose}
          submitting={enterpriseCarbonExpertReview.submitting}
          onCancel={enterpriseCarbonExpertReview.close}
          onPurposeChange={enterpriseCarbonExpertReview.setPurpose}
          onSubmit={enterpriseCarbonExpertReview.submit}
        />

        {!isShareMode ? (
          <AgentGuideModal
            open={agentGuideOpen}
            stepIndex={agentGuideStepIndex}
            onClose={handleAgentGuideClose}
            onNext={handleAgentGuideNext}
            onPrev={handleAgentGuidePrev}
            onStepChange={handleAgentGuideStepChange}
          />
        ) : null}

        {isMobile ? (
          <MobilePreviewLayer
            agentSessionId={activeConversationSessionId}
            enterpriseCarbonAccountingPermissions={
              enterpriseCarbonAccountingPermissions
            }
            enterpriseCarbonAccountingReadonly={isShareMode}
            open={
              mobilePreviewVisible &&
              !ccdbFactorTarget &&
              Boolean(mobilePreviewTarget) &&
              mobilePreviewTarget?.type !== 'cbamMonitor' &&
              mobilePreviewTarget?.type !== 'cbamOperationReport' &&
              mobilePreviewTarget?.type !== 'productCarbonCertificate'
            }
            projectId={activePreviewProjectId || undefined}
            readonly={conversationReadonly}
            sessionId={activeConversationSessionId}
            shareId={isShareMode ? shareId : undefined}
            target={
              mobilePreviewTarget?.type === 'cbamMonitor' ||
              mobilePreviewTarget?.type === 'cbamOperationReport' ||
              mobilePreviewTarget?.type === 'productCarbonCertificate'
                ? undefined
                : mobilePreviewTarget
            }
            onClose={handlePreviewClose}
          />
        ) : null}

        {isMobile && ccdbFactorTarget && previewVisible ? (
          <CcdbFactorDetailPane
            mobile
            open
            target={ccdbFactorTarget}
            onClose={handlePreviewClose}
            onLoaded={handleCcdbFactorLoaded}
            onShare={handleCcdbFactorShare}
          />
        ) : null}

        {!isShareMode ? (
          <AgentLoginDialog
            isMobile={isMobile}
            open={loginModalOpen}
            triggerEntry={loginTriggerEntry}
            onClose={() => setLoginModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        ) : null}
      </div>
    </EnterpriseDataProvider>
  );
};

const AgentWorkspaceContent = () => <CarbonAgent />;
const CarbonAgentEntry = () => {
  const { shareId } = useParams<{ shareId?: string }>();
  return shareId ? (
    <CarbonAgent />
  ) : (
    <WorkspaceProvider>
      <AgentWorkspaceContent />
    </WorkspaceProvider>
  );
};
export default CarbonAgentEntry;
