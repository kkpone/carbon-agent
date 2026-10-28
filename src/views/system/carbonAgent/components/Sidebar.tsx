import { CloseOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import I18N, { LocaleType, serviceLangMap } from '@src/lang/I18N';
import { getUserInfo, logout } from '@src/utils';
import { isFeishuSession } from '@src/utils/feishuSession';
import { Modal, message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import pointsWarningCloseIcon from '@/assets/images/carbonAgent/icons/points-warning-close.svg';
import pointsWarningIcon from '@/assets/images/carbonAgent/icons/points-warning.svg';
import CustomerServicePopover from '@/components/CustomerServicePopover';
import { LocaleContext } from '@/components/LocaleProvider';
import { languageMap } from '@/components/SelectLanguage';
import { IconAlibabaNew } from '@/components/iconfont';
import { withCurrentLocalePrefix } from '@/router/localePath';

import ConversationItem from './ConversationItem';
import Icon from './Icon';
import MobilePersonalCenter from './MobilePersonalCenter';
import ProjectCreateDialog from './ProjectCreateDialog';
import ProjectNameDialog from './ProjectNameDialog';
import ProjectNavigation from './ProjectNavigation';
import sidebarStyles from './Sidebar.module.less';
import UpgradePlanDialog, {
  type UpgradeDialogTab,
  type UpgradePlan,
} from './UpgradePlanDialog';
import {
  AgentConversation,
  AgentProject,
  AgentSectionKey,
  HISTORY_DROP_ID,
  getProjectSectionKey,
  icons,
  parseConversationDragId,
  parseProjectDropId,
} from '../constants';
import style from '../index.module.less';
import { getIssueFeedbackPageUrl } from '../issueFeedbackNavigation';
import {
  createAgentPointOrder,
  deleteAgentSession,
  dismissAgentContextInsight,
  fetchAgentContextInsightSuppressed,
  fetchAgentProjectConfig,
  fetchAgentProjects,
  fetchAgentProjectSessions,
  fetchAgentSessions,
  fetchAgentPointPlans,
  fetchAgentUserPoints,
  renameAgentSession,
  type AgentContextInsightBannerType,
  type AgentProjectConfig,
  type AgentPointPlan,
  type AgentUserPoints,
} from '../service';
import { WorkspaceMenu } from '../team/WorkspaceMenu';
import teamManagementIcon from '../team/assets/team-management.svg';
import { TEAM_PATH, requestKey } from '../team/helpers';
import { teamText } from '../team/i18n';
import { useWorkspace } from '../team/workspace';

const EMPTY_CONVERSATIONS: AgentConversation[] = [];
const SESSION_LIST_POLL_INTERVAL_MS = 5000;
const USER_POINTS_POLL_INTERVAL_MS = 5000;
const FREE_POINTS_WARNING_BANNER_TYPE: AgentContextInsightBannerType =
  'POINTS_BALANCE_LOW_FREE';
const PAID_POINTS_WARNING_BANNER_TYPE: AgentContextInsightBannerType =
  'POINTS_BALANCE_LOW_PAID';
const AGENT_MANUAL_URL =
  process.env.REACT_APP_AGENT_MANUAL_URL?.trim() ||
  'https://carbonstop.feishu.cn/wiki/UgsKwoG2fitZjskq2cLcGUyKnmc';
const PLAN_TONES: UpgradePlan['tone'][] = ['trial', 'personal', 'team'];
const PLAN_TONE_BY_CODE: Record<string, UpgradePlan['tone']> = {
  free: 'trial',
  personal: 'personal',
  team: 'team',
  trial: 'trial',
};

const PLAN_BADGE_TONE_CLASS_MAP: Record<UpgradePlan['tone'], string> = {
  personal: style.planBadgePersonal,
  team: style.planBadgeTeam,
  trial: style.planBadgeTrial,
};

const getPlanTone = (
  planCode?: string,
  planName?: string,
): UpgradePlan['tone'] => {
  const normalizedCode = planCode?.trim().toLowerCase();

  if (normalizedCode && PLAN_TONE_BY_CODE[normalizedCode]) {
    return PLAN_TONE_BY_CODE[normalizedCode];
  }

  const normalizedName = planName?.trim().toLowerCase() || '';

  if (normalizedName.includes('团队') || normalizedName.includes('team')) {
    return 'team';
  }

  if (
    normalizedName.includes('个人') ||
    normalizedName.includes('personal') ||
    normalizedName.includes('person')
  ) {
    return 'personal';
  }

  return 'trial';
};
const getPlanFeatures = (): Record<string, string[]> => ({
  personal: [
    I18N.carbonAgent.planFeature50Reports,
    I18N.carbonAgent.planFeatureCarbonQa,
    I18N.carbonAgent.planFeatureNewsQuery,
    I18N.carbonAgent.planFeatureEmissionEstimate,
    I18N.carbonAgent.planFeatureAdvancedFactors,
    I18N.carbonAgent.planFeatureCrossChatMemory,
    I18N.carbonAgent.planFeatureAllModeling,
  ],
  team: [
    I18N.carbonAgent.planFeature125Reports,
    I18N.carbonAgent.planFeatureCarbonQa,
    I18N.carbonAgent.planFeatureNewsQuery,
    I18N.carbonAgent.planFeatureEmissionEstimate,
    I18N.carbonAgent.planFeatureAdvancedFactors,
    I18N.carbonAgent.planFeatureCrossChatMemory,
    I18N.carbonAgent.planFeatureAllModeling,
    I18N.carbonAgent.planFeatureTeamManagement,
  ],
  trial: [
    I18N.carbonAgent.planFeature1Report,
    I18N.carbonAgent.planFeatureCarbonQa,
    I18N.carbonAgent.planFeatureNewsQuery,
    I18N.carbonAgent.planFeatureEmissionEstimate,
    I18N.carbonAgent.planFeatureLimitedModeling,
  ],
});

const getPlanDescriptions = (): Record<string, string> => ({
  personal: I18N.carbonAgent.planDescPersonal,
  team: I18N.carbonAgent.planDescTeam,
  trial: I18N.carbonAgent.planDescTrial,
});

const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

const getOptionalString = (data: unknown) =>
  typeof data === 'string' && data.trim() ? data.trim() : undefined;

const getOptionalNumber = (data: unknown) => {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === 'string' && data.trim()) {
    const parsed = Number(data);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const getOptionalBoolean = (data: unknown) => {
  if (typeof data === 'boolean') {
    return data;
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return data !== 0;
  }

  if (typeof data === 'string') {
    const normalized = data.trim().toLowerCase();

    if (['1', 'true', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const formatAmount = (amount: unknown) => {
  const numberAmount = getOptionalNumber(amount);

  if (numberAmount !== undefined) {
    return numberAmount.toLocaleString('zh-CN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  return getOptionalString(amount) || '0';
};

const getPlanPointLabel = (plan: AgentPointPlan) => {
  const explicitLabel =
    getOptionalString(plan.pointLabel) || getOptionalString(plan.allowance);

  if (explicitLabel) {
    return explicitLabel;
  }

  const points =
    getOptionalNumber(plan.grantPoints) ??
    getOptionalNumber(plan.points) ??
    getOptionalNumber(plan.availablePoints);

  if (points === undefined) {
    return I18N.carbonAgent.pointLabelByPlan;
  }

  if (plan.grantType === 'daily' || plan.validityType === 'day') {
    return I18N.template(I18N.carbonAgent.pointsDailyValid, {
      val1: points.toLocaleString(),
    });
  }

  if (plan.grantType === 'monthly' || plan.validityType === 'month') {
    return I18N.template(I18N.carbonAgent.pointsMonthlyValid, {
      val1: points.toLocaleString(),
    });
  }

  return I18N.template(I18N.carbonAgent.pointsAmount, {
    val1: points.toLocaleString(),
  });
};

const getPlanArray = (data: unknown): AgentPointPlan[] => {
  if (Array.isArray(data)) {
    return data;
  }

  const dataRecord = asRecord(data);

  return ((Array.isArray(dataRecord.plans) && dataRecord.plans) ||
    (Array.isArray(dataRecord.list) && dataRecord.list) ||
    (Array.isArray(dataRecord.records) && dataRecord.records) ||
    (Array.isArray(dataRecord.rows) && dataRecord.rows) ||
    (Array.isArray(dataRecord.data) && dataRecord.data) ||
    []) as AgentPointPlan[];
};

const normalizeUpgradePlan = (
  plan: AgentPointPlan,
  index: number,
  fallbackPlanKind?: string,
): UpgradePlan | undefined => {
  const planRecord = asRecord(plan);
  const key =
    getOptionalString(plan.planCode) ||
    getOptionalString(plan.code) ||
    getOptionalString(plan.key) ||
    getOptionalString(plan.name) ||
    getOptionalString(plan.planName);
  const name =
    getOptionalString(plan.planName) || getOptionalString(plan.name) || key;

  if (!key || !name) {
    return undefined;
  }

  const normalizedKey = key.toLowerCase();
  const planKind =
    getOptionalString(plan.planKind)?.toLowerCase() ||
    fallbackPlanKind?.toLowerCase();
  const tone =
    PLAN_TONE_BY_CODE[normalizedKey] ||
    (PLAN_TONES.includes(normalizedKey as UpgradePlan['tone'])
      ? (normalizedKey as UpgradePlan['tone'])
      : PLAN_TONES[index] || 'personal');
  const pointLabel = getPlanPointLabel(plan);
  const isAddonPlan = planKind === 'addon';
  const features = Array.isArray(plan.features)
    ? plan.features.filter(feature => typeof feature === 'string')
    : isAddonPlan
    ? []
    : getPlanFeatures()[normalizedKey] || getPlanFeatures()[tone] || [];
  const sortNo = getOptionalNumber(plan.sortNo);
  const grantPoints = getOptionalNumber(plan.grantPoints);
  const current = Boolean(
    getOptionalBoolean(plan.current) ||
      getOptionalBoolean(plan.currentPlan) ||
      getOptionalBoolean(planRecord.isCurrent),
  );
  const purchaseEnabled = getOptionalBoolean(plan.purchaseEnabled) ?? !current;

  return {
    allowance: pointLabel,
    badgeText: getOptionalString(plan.badgeText),
    buttonText:
      getOptionalString(plan.buttonText) ||
      (isAddonPlan
        ? I18N.carbonAgent.buyPointsPackage
        : I18N.carbonAgent.upgradePlan),
    current,
    defaultFlag: Boolean(getOptionalBoolean(plan.defaultFlag)),
    description:
      getOptionalString(plan.subtitle) ||
      getOptionalString(plan.description) ||
      getPlanDescriptions()[normalizedKey] ||
      getPlanDescriptions()[tone] ||
      I18N.carbonAgent.planDescDefault,
    featureTitle:
      getOptionalString(plan.featureTitle) ||
      getOptionalString(plan.quotaLabel),
    features,
    grantPoints,
    grantType: getOptionalString(plan.grantType),
    highlightFlag: Boolean(getOptionalBoolean(plan.highlightFlag)),
    key,
    name,
    planKind,
    pointLabel,
    price: formatAmount(plan.priceAmount ?? plan.price),
    priceSuffix:
      getOptionalString(plan.billingCycle) ||
      getOptionalString(plan.priceSuffix) ||
      '',
    purchaseEnabled,
    quotaLabel: getOptionalString(plan.quotaLabel),
    recommendFlag: Boolean(getOptionalBoolean(plan.recommendFlag)),
    sortNo,
    tone,
    validityType: getOptionalString(plan.validityType),
  };
};

const normalizeUpgradePlans = (data: unknown, fallbackPlanKind?: string) =>
  getPlanArray(data)
    .map((plan, index) => ({
      index,
      plan: normalizeUpgradePlan(plan, index, fallbackPlanKind),
    }))
    .filter((item): item is { index: number; plan: UpgradePlan } =>
      Boolean(item.plan),
    )
    .sort((prev, next) => {
      const prevSortNo = prev.plan.sortNo ?? Number.MAX_SAFE_INTEGER;
      const nextSortNo = next.plan.sortNo ?? Number.MAX_SAFE_INTEGER;

      return prevSortNo === nextSortNo
        ? prev.index - next.index
        : prevSortNo - nextSortNo;
    })
    .map(item => item.plan);

const normalizePointsFromPlansData = (
  data: unknown,
): AgentUserPoints | null => {
  if (Array.isArray(data)) {
    return null;
  }

  const dataRecord = asRecord(data);

  return Object.keys(dataRecord).length
    ? (dataRecord as AgentUserPoints)
    : null;
};

type SidebarProps = {
  activeSection: AgentSectionKey;
  authenticated: boolean;
  collapsed: boolean;
  createdConversation?: AgentConversation | null;
  footprintAccountingSelected?: boolean;
  inviteOpenRequestKey?: number;
  mobile?: boolean;
  mobileProfileEnabled?: boolean;
  mobileProfileOpenRequested?: boolean;
  projectListRefreshKey?: number;
  selectedSessionId: string;
  sessionListRefreshKey?: number;
  onHistorySelect: (conversation: AgentConversation) => void;
  onInviteOpenRequestHandled?: () => void;
  onLoginRequest: () => void;
  onConversationsChanged?: () => void;
  onMobileClose?: () => void;
  onMobileProfileOpenRequestHandled?: () => void;
  onNewChat: () => void;
  onOpenGuide: () => void;
  onRequireLogin: () => boolean;
  onSelectSection: (section: AgentSectionKey) => void;
  onToggleCollapsed: () => void;
  onViewAllHistory: () => void;
};

type ConversationDropTarget = string | null | undefined;

const areConversationListsEqual = (
  currentConversations: AgentConversation[],
  nextConversations: AgentConversation[],
) =>
  currentConversations.length === nextConversations.length &&
  currentConversations.every((conversation, index) => {
    const nextConversation = nextConversations[index];

    return (
      conversation.id === nextConversation.id &&
      conversation.sessionId === nextConversation.sessionId &&
      conversation.title === nextConversation.title &&
      conversation.time === nextConversation.time &&
      conversation.projectId === nextConversation.projectId &&
      conversation.status === nextConversation.status &&
      conversation.accountBindStatus === nextConversation.accountBindStatus &&
      conversation.bizId === nextConversation.bizId &&
      conversation.bizType === nextConversation.bizType &&
      conversation.cbamId === nextConversation.cbamId &&
      conversation.intent === nextConversation.intent &&
      conversation.module === nextConversation.module &&
      conversation.canEditEnterprisePreview ===
        nextConversation.canEditEnterprisePreview &&
      conversation.canWrite === nextConversation.canWrite &&
      conversation.initiatedByMe === nextConversation.initiatedByMe &&
      conversation.initiatorUserId === nextConversation.initiatorUserId &&
      conversation.initiatorUserName === nextConversation.initiatorUserName &&
      conversation.sourceSessionId === nextConversation.sourceSessionId &&
      conversation.sourceSuggestionId === nextConversation.sourceSuggestionId &&
      conversation.sourceTaskId === nextConversation.sourceTaskId &&
      conversation.running === nextConversation.running &&
      conversation.runningMessageId === nextConversation.runningMessageId &&
      conversation.hasUnread === nextConversation.hasUnread
    );
  });

const loadProjectConversationPages = async (
  projectIds: string[],
  signal: AbortSignal,
) => {
  const results = await Promise.allSettled(
    projectIds.map(projectId =>
      fetchAgentProjectSessions(
        projectId,
        {
          keyword: '',
          pageNum: 1,
          pageSize: 20,
        },
        signal,
      ),
    ),
  );

  return projectIds.map((projectId, index) => {
    const result = results[index];

    return {
      conversations:
        result.status === 'fulfilled' ? result.value.rows : undefined,
      projectId,
    };
  });
};

const upsertConversation = (
  conversations: AgentConversation[],
  nextConversation: AgentConversation,
) => [
  nextConversation,
  ...conversations.filter(
    conversation => conversation.id !== nextConversation.id,
  ),
];

const upsertProjectConversation = (
  conversations: AgentConversation[],
  nextConversation: AgentConversation,
) => {
  const existingIndex = conversations.findIndex(
    conversation => conversation.id === nextConversation.id,
  );

  if (existingIndex < 0) {
    return [nextConversation, ...conversations];
  }

  return conversations.map((conversation, index) =>
    index === existingIndex
      ? {
          ...conversation,
          ...nextConversation,
        }
      : conversation,
  );
};

const getConversationDropTarget = (overId?: string): ConversationDropTarget => {
  if (!overId) {
    return undefined;
  }

  if (overId === HISTORY_DROP_ID) {
    return null;
  }

  return parseProjectDropId(overId) || undefined;
};

type ProfileAction = {
  icon: string;
  key: string;
  label: string;
};

const getProfileActions = (): ProfileAction[] => [
  {
    icon: icons.profileGuideIcon,
    key: 'guide',
    label: I18N.carbonAgent.guideEntry,
  },
  {
    icon: icons.profileManualIcon,
    key: 'manual',
    label: I18N.carbonAgent.operationManual,
  },
  {
    icon: icons.profileSupportIcon,
    key: 'support',
    label: I18N.carbonAgent.profileSupport,
  },
  {
    icon: icons.issueFeedbackIcon,
    key: 'issueFeedback',
    label: I18N.carbonAgent.issueFeedbackCenter,
  },
  {
    icon: icons.profileSettingsIcon,
    key: 'settings',
    label: I18N.carbonAgent.profileSettings,
  },
  {
    icon: icons.profileLanguageIcon,
    key: 'language',
    label: I18N.carbonAgent.profileLanguage,
  },
  {
    icon: icons.profileNotificationIcon,
    key: 'notification',
    label: I18N.carbonAgent.profileNotification,
  },
  {
    icon: icons.profileLogoutIcon,
    key: 'logout',
    label: I18N.carbonAgent.profileLogout,
  },
];

const getProfileLanguageLabel = (languageValue: LocaleType) => {
  if (languageValue === LocaleType.zhCN) {
    return I18N.carbonAgent.languageSimplifiedChinese;
  }

  if (languageValue === LocaleType.zhTW) {
    return I18N.carbonAgent.languageTraditionalChinese;
  }

  return I18N.carbonAgent.languageEnglish;
};

const Sidebar = ({
  activeSection,
  authenticated,
  collapsed,
  createdConversation,
  footprintAccountingSelected = false,
  inviteOpenRequestKey = 0,
  mobile = false,
  mobileProfileEnabled: mobileProfileRequested = false,
  mobileProfileOpenRequested = false,
  projectListRefreshKey = 0,
  selectedSessionId,
  sessionListRefreshKey = 0,
  onHistorySelect,
  onInviteOpenRequestHandled,
  onLoginRequest,
  onConversationsChanged,
  onMobileClose,
  onMobileProfileOpenRequestHandled,
  onNewChat,
  onOpenGuide,
  onRequireLogin,
  onSelectSection,
  onToggleCollapsed,
  onViewAllHistory,
}: SidebarProps) => {
  const { personal, access } = useWorkspace();
  const mobileProfileEnabled = mobile || mobileProfileRequested;
  const [projects, setProjects] = useState<AgentProject[]>([]);
  const [projectConfig, setProjectConfig] = useState<AgentProjectConfig>();
  const [projectListError, setProjectListError] = useState('');
  const [projectListLoading, setProjectListLoading] = useState(false);
  const [projectListRetryKey, setProjectListRetryKey] = useState(0);
  const projectListLoadedRef = useRef(false);
  const [conversations, setConversations] =
    useState<AgentConversation[]>(EMPTY_CONVERSATIONS);
  const [projectConversations, setProjectConversations] =
    useState<AgentConversation[]>(EMPTY_CONVERSATIONS);
  const [conversationListError, setConversationListError] = useState('');
  const [conversationListLoading, setConversationListLoading] = useState(false);
  const [conversationListRetryKey, setConversationListRetryKey] = useState(0);
  const conversationListLoadedRef = useRef(false);
  const [expandedProjectId, setExpandedProjectId] = useState('');
  const [draggingConversationId, setDraggingConversationId] = useState('');
  const [openMenuConversationId, setOpenMenuConversationId] = useState('');
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [renamingConversationId, setRenamingConversationId] = useState('');
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const [collapsedHistoryOpen, setCollapsedHistoryOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradePlans, setUpgradePlans] = useState<UpgradePlan[]>([]);
  const [upgradePlansLoading, setUpgradePlansLoading] = useState(false);
  const [addonPlans, setAddonPlans] = useState<UpgradePlan[]>([]);
  const [addonPlansLoading, setAddonPlansLoading] = useState(false);
  const [customerServiceOpen, setCustomerServiceOpen] = useState(false);
  const [userPoints, setUserPoints] = useState<AgentUserPoints | null>(null);
  const [pointsWarningSuppression, setPointsWarningSuppression] = useState<{
    bannerType: AgentContextInsightBannerType;
    suppressed: boolean;
  }>();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileLanguageMenuOpen, setProfileLanguageMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(
    mobileProfileEnabled && mobileProfileOpenRequested,
  );
  const [collapsedLogoHoverSuppressed, setCollapsedLogoHoverSuppressed] =
    useState(false);
  const [upgradeDialogInitialTab, setUpgradeDialogInitialTab] =
    useState<UpgradeDialogTab>('plans');
  const settingsLocation = useLocation();
  const settingsHistory = useHistory();
  useEffect(() => {
    const params = new URLSearchParams(settingsLocation.search);
    const tab = params.get('settings');
    if (
      !personal ||
      !authenticated ||
      (tab !== 'apiKeys' && tab !== 'authorizations')
    )
      return;
    // useMobile resolves after the initial render. Do not let the transient desktop
    // sidebar consume a mobile deep link before the mobile drawer is mounted.
    if (!mobile && window.matchMedia('(max-width: 767px)').matches) return;
    setUpgradeDialogInitialTab(tab);
    setUpgradeDialogOpen(true);
    params.delete('settings');
    settingsHistory.replace({
      ...settingsLocation,
      search: params.toString() ? `?${params}` : '',
    });
  }, [authenticated, mobile, settingsHistory, settingsLocation]);
  const collapsedHistoryRef = useRef<HTMLDivElement>(null);
  const lastHandledInviteOpenRequestKeyRef = useRef(0);
  const { changeLocale, locale } = useContext(LocaleContext);
  const productCarbonFootprintNavLabel =
    I18N.carbonAgent.productCarbonFootprintShort ||
    I18N.carbonAgent.productCarbonFootprint;
  const projectFeatureEnabled =
    personal && authenticated && projectConfig?.enabled === true;
  const projectCreationEnabled =
    projectFeatureEnabled && projectConfig?.maxProjectsPerUser !== 0;

  useEffect(() => {
    if (!projectCreationEnabled) {
      setProjectDialogOpen(false);
    }
  }, [projectCreationEnabled]);

  useEffect(() => {
    if (
      !authenticated ||
      !personal ||
      !inviteOpenRequestKey ||
      lastHandledInviteOpenRequestKeyRef.current === inviteOpenRequestKey
    ) {
      return;
    }

    lastHandledInviteOpenRequestKeyRef.current = inviteOpenRequestKey;
    setUpgradeDialogInitialTab('invite');
    setUpgradeDialogOpen(true);
    onInviteOpenRequestHandled?.();
  }, [authenticated, inviteOpenRequestKey, onInviteOpenRequestHandled]);

  useEffect(() => {
    if (!authenticated || !personal) {
      setProjectConfig(undefined);
      return undefined;
    }

    let cancelled = false;
    const requestAbortController = new AbortController();

    setProjectConfig(undefined);
    fetchAgentProjectConfig(
      serviceLangMap[locale] || 'zh',
      requestAbortController.signal,
    )
      .then(config => {
        if (!cancelled) {
          setProjectConfig(config);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjectConfig(undefined);
        }
      });

    return () => {
      cancelled = true;
      requestAbortController.abort();
    };
  }, [authenticated, locale, projectListRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;
    let pollTimer = 0;
    let requestAbortController: AbortController | undefined;

    if (!authenticated) {
      conversationListLoadedRef.current = false;
      setConversations(EMPTY_CONVERSATIONS);
      setConversationListError('');
      setConversationListLoading(false);

      return () => {
        cancelled = true;
      };
    }

    const scheduleNextPoll = () => {
      if (cancelled || document.visibilityState === 'hidden') {
        return;
      }

      if (pollTimer) {
        window.clearTimeout(pollTimer);
      }

      pollTimer = window.setTimeout(
        loadConversations,
        SESSION_LIST_POLL_INTERVAL_MS,
      );
    };

    const loadConversations = () => {
      if (cancelled || requestInFlight) {
        return;
      }

      if (document.visibilityState === 'hidden') {
        return;
      }

      const showLoading = !conversationListLoadedRef.current;

      requestInFlight = true;
      requestAbortController = new AbortController();

      if (showLoading) {
        setConversationListError('');
        setConversationListLoading(true);
      }

      fetchAgentSessions(requestAbortController.signal)
        .then(({ conversations: nextConversations }) => {
          if (cancelled) {
            return;
          }

          setConversations(currentConversations =>
            areConversationListsEqual(currentConversations, nextConversations)
              ? currentConversations
              : nextConversations,
          );
          setConversationListError('');
        })
        .catch(() => {
          if (!cancelled && showLoading) {
            setConversations(EMPTY_CONVERSATIONS);
            setConversationListError(I18N.carbonAgent.historyLoadFailed);
          }
        })
        .finally(() => {
          if (cancelled) {
            return;
          }

          requestInFlight = false;
          conversationListLoadedRef.current = true;
          setConversationListLoading(false);
          scheduleNextPoll();
        });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      if (pollTimer) {
        window.clearTimeout(pollTimer);
        pollTimer = 0;
      }

      loadConversations();
    };

    loadConversations();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      requestAbortController?.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (pollTimer) {
        window.clearTimeout(pollTimer);
      }
    };
  }, [authenticated, conversationListRetryKey, sessionListRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    const requestAbortController = new AbortController();

    if (!projectFeatureEnabled) {
      projectListLoadedRef.current = false;
      setProjects([]);
      setExpandedProjectId('');
      setProjectListError('');
      setProjectListLoading(false);

      return () => {
        cancelled = true;
        requestAbortController.abort();
      };
    }

    setProjectListError('');
    setProjectListLoading(!projectListLoadedRef.current);

    fetchAgentProjects(requestAbortController.signal)
      .then(nextProjects => {
        if (cancelled) {
          return;
        }

        setProjects(nextProjects);
        setExpandedProjectId(currentId => {
          const availableIds = new Set(nextProjects.map(project => project.id));

          return availableIds.has(currentId) ? currentId : '';
        });
        setProjectListError('');
        projectListLoadedRef.current = true;
      })
      .catch(() => {
        if (!cancelled) {
          setProjectListError(I18N.carbonAgent.projectListLoadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProjectListLoading(false);
        }
      });

    return () => {
      cancelled = true;
      requestAbortController.abort();
    };
  }, [projectFeatureEnabled, projectListRefreshKey, projectListRetryKey]);

  useEffect(() => {
    const projectIds = projectFeatureEnabled
      ? projects.map(project => project.id)
      : [];

    if (!projectIds.length) {
      setProjectConversations(EMPTY_CONVERSATIONS);
      return undefined;
    }

    let cancelled = false;
    const requestAbortController = new AbortController();

    loadProjectConversationPages(
      projectIds,
      requestAbortController.signal,
    ).then(results => {
      if (cancelled) {
        return;
      }

      setProjectConversations(currentConversations => {
        const currentByProject = new Map<string, AgentConversation[]>();

        currentConversations.forEach(conversation => {
          if (!conversation.projectId) {
            return;
          }

          const projectRows =
            currentByProject.get(conversation.projectId) || [];
          projectRows.push(conversation);
          currentByProject.set(conversation.projectId, projectRows);
        });

        return results.flatMap(result =>
          result.conversations === undefined
            ? currentByProject.get(result.projectId) || []
            : result.conversations,
        );
      });
    });

    return () => {
      cancelled = true;
      requestAbortController.abort();
    };
  }, [
    conversationListRetryKey,
    projectFeatureEnabled,
    projects,
    sessionListRefreshKey,
  ]);

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;
    let pollTimer = 0;

    if (!authenticated || !personal) {
      setUserPoints(null);

      return () => {
        cancelled = true;
        if (pollTimer) {
          window.clearInterval(pollTimer);
        }
      };
    }

    const loadUserPoints = () => {
      if (requestInFlight) {
        return;
      }

      requestInFlight = true;
      fetchAgentUserPoints()
        .then(response => {
          if (!cancelled) {
            setUserPoints(response.data.data || null);
          }
        })
        .catch(() => {
          // 保留上一次积分数据，避免轮询失败时侧栏闪成空态。
        })
        .finally(() => {
          requestInFlight = false;
        });
    };

    loadUserPoints();
    pollTimer = window.setInterval(
      loadUserPoints,
      USER_POINTS_POLL_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !mobileProfileEnabled) {
      setMobileProfileOpen(false);
    }
  }, [authenticated, mobileProfileEnabled]);

  useEffect(() => {
    if (!mobileProfileEnabled || !mobileProfileOpenRequested) {
      return;
    }

    setMobileProfileOpen(true);
    onMobileProfileOpenRequestHandled?.();
  }, [
    mobileProfileEnabled,
    mobileProfileOpenRequested,
    onMobileProfileOpenRequestHandled,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!personal || !authenticated || !upgradeDialogOpen) {
      return () => {
        cancelled = true;
      };
    }

    setUpgradePlansLoading(true);
    setAddonPlansLoading(true);
    Promise.allSettled([
      fetchAgentPointPlans({ planKind: 'membership' }),
      fetchAgentPointPlans({ planKind: 'addon' }),
    ])
      .then(([membershipResult, addonResult]) => {
        if (cancelled) {
          return;
        }

        if (membershipResult.status === 'fulfilled') {
          const responseData = membershipResult.value.data.data;
          const nextPlans = normalizeUpgradePlans(responseData);
          const nextPoints = normalizePointsFromPlansData(responseData);

          setUpgradePlans(nextPlans);

          if (nextPoints) {
            setUserPoints(prevPoints => ({
              ...(prevPoints || {}),
              ...nextPoints,
            }));
          }
        } else {
          setUpgradePlans([]);
        }

        if (addonResult.status === 'fulfilled') {
          setAddonPlans(
            normalizeUpgradePlans(addonResult.value.data.data, 'addon'),
          );
        } else {
          setAddonPlans([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setUpgradePlansLoading(false);
          setAddonPlansLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, upgradeDialogOpen]);

  useEffect(() => {
    if (!createdConversation) {
      return;
    }

    if (createdConversation.projectSession && createdConversation.projectId) {
      setProjectConversations(prevConversations =>
        upsertProjectConversation(prevConversations, createdConversation),
      );
    } else {
      setConversations(prevConversations =>
        upsertConversation(prevConversations, createdConversation),
      );
    }
    setOpenMenuConversationId('');
  }, [createdConversation]);

  useEffect(() => {
    if (!collapsed) {
      setCollapsedHistoryOpen(false);
      setCollapsedLogoHoverSuppressed(false);
    }
  }, [collapsed]);

  useEffect(() => {
    setProfileMenuOpen(false);
    setProfileLanguageMenuOpen(false);
  }, [authenticated]);

  useEffect(() => {
    if (!profileMenuOpen) {
      setProfileLanguageMenuOpen(false);
    }
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!collapsedHistoryOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const { target } = event;

      if (
        target instanceof Node &&
        collapsedHistoryRef.current?.contains(target)
      ) {
        return;
      }

      setCollapsedHistoryOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCollapsedHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [collapsedHistoryOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const collapsedLabel = collapsed
    ? I18N.carbonAgent.expandMenu
    : I18N.carbonAgent.collapseMenu;

  const handleToggleCollapsed = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    setCollapsedLogoHoverSuppressed(!collapsed);
    onToggleCollapsed();
  };
  const allConversations = useMemo(() => {
    const conversationsById = new Map<string, AgentConversation>();

    conversations.forEach(conversation => {
      conversationsById.set(conversation.id, conversation);
    });
    projectConversations.forEach(conversation => {
      conversationsById.set(conversation.id, conversation);
    });

    return Array.from(conversationsById.values());
  }, [conversations, projectConversations]);
  const activeConversation = useMemo(
    () =>
      allConversations.find(
        conversation => conversation.id === draggingConversationId,
      ),
    [allConversations, draggingConversationId],
  );
  const conversationDragEnabled = !mobileProfileEnabled;
  const renamingConversation = useMemo(
    () =>
      allConversations.find(
        conversation => conversation.id === renamingConversationId,
      ),
    [allConversations, renamingConversationId],
  );
  const projectConversationIdSet = useMemo(
    () =>
      new Set(
        projectConversations.map(
          conversation => conversation.sessionId || conversation.id,
        ),
      ),
    [projectConversations],
  );
  const historyConversations = useMemo(
    () =>
      projectFeatureEnabled
        ? conversations.filter(
            conversation =>
              !projectConversationIdSet.has(
                conversation.sessionId || conversation.id,
              ) && !conversation.projectSession,
          )
        : conversations,
    [conversations, projectConversationIdSet, projectFeatureEnabled],
  );
  const userInfo = getUserInfo()?.userInfo;
  const profileName =
    (authenticated &&
      (userInfo?.user?.nickName || userInfo?.nickName || userInfo?.username)) ||
    (authenticated
      ? I18N.carbonAgent.defaultUserName
      : I18N.carbonAgent.notLoggedIn);
  const workspaceName =
    !personal && access?.companyName ? access.companyName : profileName;
  const profileAccount =
    (authenticated &&
      (isFeishuSession()
        ? profileName
        : userInfo?.mobile || userInfo?.username)) ||
    I18N.carbonAgent.viewAccountAfterLogin;
  const planName = !personal
    ? teamText('team2')
    : authenticated
    ? userPoints?.planName || I18N.carbonAgent.trialPlan
    : I18N.carbonAgent.availableAfterLogin;
  const planTone = getPlanTone(userPoints?.planCode, planName);
  const availablePoints =
    personal && authenticated && typeof userPoints?.availablePoints === 'number'
      ? String(userPoints.availablePoints)
      : '--';
  const pointsWarning = (() => {
    if (
      typeof userPoints?.availablePoints !== 'number' ||
      typeof userPoints.pointsWarningThreshold !== 'number'
    ) {
      return undefined;
    }

    if (
      userPoints.planEdition === 'FREE' &&
      userPoints.availablePoints <= userPoints.pointsWarningThreshold
    ) {
      return {
        actionLabel: I18N.carbonAgent.goSubscribe,
        bannerType: FREE_POINTS_WARNING_BANNER_TYPE,
        initialTab: 'plans' as UpgradeDialogTab,
        message: I18N.carbonAgent.freePointsLow,
      };
    }

    if (
      userPoints.planEdition === 'PAID' &&
      userPoints.availablePoints <= userPoints.pointsWarningThreshold
    ) {
      return {
        actionLabel: I18N.carbonAgent.goRecharge,
        bannerType: PAID_POINTS_WARNING_BANNER_TYPE,
        initialTab: 'addons' as UpgradeDialogTab,
        message: I18N.carbonAgent.paidPointsLow,
      };
    }

    return undefined;
  })();
  const pointsWarningBannerType = pointsWarning?.bannerType;
  const pointsWarningVisible = Boolean(
    pointsWarningBannerType &&
      pointsWarningSuppression?.bannerType === pointsWarningBannerType &&
      !pointsWarningSuppression.suppressed,
  );

  useEffect(() => {
    if (!authenticated || !pointsWarningBannerType) {
      setPointsWarningSuppression(undefined);
      return;
    }

    let cancelled = false;
    setPointsWarningSuppression(undefined);
    fetchAgentContextInsightSuppressed(pointsWarningBannerType)
      .then(suppressed => {
        if (!cancelled) {
          setPointsWarningSuppression({
            bannerType: pointsWarningBannerType,
            suppressed,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          // 查询失败时仍展示余额提示，避免服务异常导致重要提醒永久缺失。
          setPointsWarningSuppression({
            bannerType: pointsWarningBannerType,
            suppressed: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, pointsWarningBannerType]);

  const profileActions = getProfileActions();
  const profileMainActions = profileActions.filter(
    action =>
      action.key !== 'logout' &&
      (personal ||
        ![
          'orders',
          'invoices',
          'points',
          'invite',
          'apiKeys',
          'authorizations',
        ].includes(action.key)),
  );
  const profileLogoutAction = profileActions.find(
    action => action.key === 'logout',
  );
  const selectedConversation =
    allConversations.find(
      conversation =>
        (conversation.sessionId || conversation.id) === selectedSessionId,
    ) ||
    ((createdConversation?.sessionId || createdConversation?.id) ===
    selectedSessionId
      ? createdConversation
      : undefined);

  useEffect(() => {
    if (!historyConversations.length) {
      setCollapsedHistoryOpen(false);
    }
  }, [historyConversations.length]);

  const projectConversationMap = useMemo(() => {
    const nextMap = new Map<string, AgentConversation[]>();

    if (!projectFeatureEnabled) {
      return nextMap;
    }

    projects.forEach(project => {
      nextMap.set(project.id, []);
    });

    projectConversations.forEach(conversation => {
      if (conversation.projectId && nextMap.has(conversation.projectId)) {
        nextMap.get(conversation.projectId)?.push(conversation);
      }
    });

    return nextMap;
  }, [projectConversations, projectFeatureEnabled, projects]);

  const handleNewChat = () => {
    if (authenticated && !onRequireLogin()) {
      return;
    }

    setCollapsedHistoryOpen(false);
    setOpenMenuConversationId('');
    onNewChat();
  };

  const handleProjectCreated = (project?: AgentProject) => {
    if (project) {
      setProjects(prevProjects => [
        ...prevProjects.filter(
          currentProject => currentProject.id !== project.id,
        ),
        project,
      ]);
      setExpandedProjectId(project.id);
      onSelectSection(getProjectSectionKey(project.id));
    }

    projectListLoadedRef.current = false;
    setProjectListRetryKey(currentKey => currentKey + 1);
    setProjectDialogOpen(false);
  };

  const handleOpenProjectDialog = () => {
    if (projectCreationEnabled && onRequireLogin()) {
      setProjectDialogOpen(true);
    }
  };

  const handleReloadProjects = () => {
    if (onRequireLogin()) {
      setProjectListRetryKey(currentKey => currentKey + 1);
    }
  };

  const handleConversationSelect = (conversation: AgentConversation) => {
    if (!onRequireLogin()) {
      return;
    }

    setCollapsedHistoryOpen(false);

    if (conversation.hasUnread) {
      setConversations(prevConversations =>
        prevConversations.map(currentConversation =>
          currentConversation.id === conversation.id
            ? { ...currentConversation, hasUnread: false }
            : currentConversation,
        ),
      );
      setProjectConversations(prevConversations =>
        prevConversations.map(currentConversation =>
          currentConversation.id === conversation.id
            ? { ...currentConversation, hasUnread: false }
            : currentConversation,
        ),
      );
    }

    onHistorySelect(conversation);
  };

  const handleViewAllHistory = () => {
    if (!onRequireLogin()) {
      return;
    }

    setCollapsedHistoryOpen(false);
    setOpenMenuConversationId('');
    onViewAllHistory();
  };

  const handleCollapsedHistoryToggle = () => {
    if (!onRequireLogin() || !historyConversations.length) {
      return;
    }

    setCollapsedHistoryOpen(prevOpen => !prevOpen);
  };

  const handleReloadConversations = () => {
    if (!onRequireLogin()) {
      return;
    }

    setConversationListRetryKey(prevKey => prevKey + 1);
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (!onRequireLogin()) {
      return;
    }

    const targetConversation = allConversations.find(
      conversation => conversation.id === conversationId,
    );

    if (
      targetConversation?.projectSession &&
      targetConversation.canWrite !== true
    ) {
      return;
    }

    Modal.confirm({
      cancelText: I18N.carbonAgent.cancel,
      content: I18N.carbonAgent.deleteConversationConfirm,
      okText: I18N.carbonAgent.delete,
      okType: 'danger',
      title: I18N.carbonAgent.deleteConversationTitle,
      onOk: async () => {
        try {
          await deleteAgentSession(conversationId);
        } catch (error) {
          antdMessage.error(I18N.carbonAgent.deleteFailed);
          throw error;
        }

        setConversations(prevConversations =>
          prevConversations.filter(
            conversation => conversation.id !== conversationId,
          ),
        );
        setProjectConversations(prevConversations =>
          prevConversations.filter(
            conversation => conversation.id !== conversationId,
          ),
        );
        setOpenMenuConversationId('');
        onConversationsChanged?.();

        if (selectedSessionId === conversationId) {
          onNewChat();
        }
      },
    });
  };

  const handleRenameConversation = (conversationId: string) => {
    if (!onRequireLogin()) {
      return;
    }

    const targetConversation = allConversations.find(
      conversation => conversation.id === conversationId,
    );

    if (
      targetConversation?.projectSession &&
      targetConversation.canWrite !== true
    ) {
      return;
    }

    setRenamingConversationId(conversationId);
    setRenameSubmitting(false);
    setOpenMenuConversationId('');
  };

  const handleSubmitRename = async (name: string) => {
    if (!onRequireLogin()) {
      return;
    }

    const conversationId = renamingConversationId;

    if (!conversationId) {
      return;
    }

    if (renameSubmitting) {
      return;
    }

    setRenameSubmitting(true);
    try {
      await renameAgentSession(conversationId, name);
    } catch {
      antdMessage.error(I18N.carbonAgent.renameFailed);
      return;
    } finally {
      setRenameSubmitting(false);
    }

    setConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: name,
            }
          : conversation,
      ),
    );
    setProjectConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: name,
            }
          : conversation,
      ),
    );
    setRenamingConversationId('');
    onConversationsChanged?.();
  };

  const handleProfileAction = (actionKey: string) => {
    setProfileMenuOpen(false);
    setProfileLanguageMenuOpen(false);
    setMobileProfileOpen(false);

    if (actionKey === 'logout') {
      setUpgradeDialogOpen(false);
      logout({ jumpToLoginPage: false });
      onMobileClose?.();
      return;
    }

    if (actionKey === 'guide') {
      onOpenGuide();
      onMobileClose?.();
      return;
    }

    if (actionKey === 'manual') {
      window.open(AGENT_MANUAL_URL, '_blank', 'noopener,noreferrer');
      onMobileClose?.();
      return;
    }

    if (actionKey === 'issueFeedback') {
      if (!mobileProfileEnabled) {
        const feedbackUrl = getIssueFeedbackPageUrl({
          currentHref: window.location.href,
          sessionId: selectedSessionId,
          sessionTitle: selectedConversation?.title,
        });

        window.open(feedbackUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      onSelectSection('issueFeedback');
      onMobileClose?.();
      return;
    }

    if (actionKey === 'orders') {
      setUpgradeDialogInitialTab('orders');
      setUpgradeDialogOpen(true);
      return;
    }

    if (actionKey === 'invoices') {
      setUpgradeDialogInitialTab('invoices');
      setUpgradeDialogOpen(true);
      return;
    }

    if (actionKey === 'points') {
      setUpgradeDialogInitialTab('points');
      setUpgradeDialogOpen(true);
      return;
    }

    if (actionKey === 'invite') {
      setUpgradeDialogInitialTab('invite');
      setUpgradeDialogOpen(true);
      return;
    }

    if (actionKey === 'settings') {
      setUpgradeDialogInitialTab('settings');
      setUpgradeDialogOpen(true);
      return;
    }

    antdMessage.info(I18N.carbonAgent.notificationNotOpen);
  };

  const handleProfileLanguageChange = async (
    currentLocale: (typeof languageMap)[number]['value'],
  ) => {
    setProfileLanguageMenuOpen(false);
    setProfileMenuOpen(false);

    if (currentLocale === locale) {
      return;
    }

    try {
      await changeLocale({
        currentLocale,
        syncUrl: true,
      });
    } catch {
      antdMessage.error(I18N.carbonAgent.executionFailed);
    }
  };

  const handleUpgradeClick = () => {
    if (!personal) {
      settingsHistory.push(`${TEAM_PATH}/overview`);
      return;
    }
    if (!onRequireLogin()) {
      return;
    }

    setUpgradePlans([]);
    setAddonPlans([]);
    setUpgradePlansLoading(true);
    setAddonPlansLoading(true);
    setUpgradeDialogInitialTab('plans');
    setUpgradeDialogOpen(true);
  };

  const handlePointsWarningAction = () => {
    if (!pointsWarning || !onRequireLogin()) {
      return;
    }

    setUpgradePlans([]);
    setAddonPlans([]);
    setUpgradePlansLoading(true);
    setAddonPlansLoading(true);
    setUpgradeDialogInitialTab(pointsWarning.initialTab);
    setUpgradeDialogOpen(true);
  };

  const handlePointsWarningDismiss = () => {
    const bannerType = pointsWarning?.bannerType;

    if (!bannerType) {
      return;
    }

    setPointsWarningSuppression({ bannerType, suppressed: true });
    dismissAgentContextInsight(bannerType).catch(() => undefined);
  };

  const refreshPointsAndPlans = () => {
    fetchAgentUserPoints()
      .then(response => {
        setUserPoints(response.data.data || null);
      })
      .catch(() => {
        // 支付成功后的刷新失败时保留轮询里的旧数据。
      });

    fetchAgentPointPlans({ planKind: 'membership' })
      .then(response => {
        const responseData = response.data.data;
        const nextPlans = normalizeUpgradePlans(responseData);
        const nextPoints = normalizePointsFromPlansData(responseData);

        setUpgradePlans(nextPlans);

        if (nextPoints) {
          setUserPoints(prevPoints => ({
            ...(prevPoints || {}),
            ...nextPoints,
          }));
        }
      })
      .catch(() => {
        // 套餐刷新失败不打断成功态展示，下一次打开弹窗还会重新拉取。
      });

    fetchAgentPointPlans({ planKind: 'addon' })
      .then(response => {
        setAddonPlans(normalizeUpgradePlans(response.data.data, 'addon'));
      })
      .catch(() => {
        // 积分包刷新失败不打断成功态展示，下一次打开弹窗还会重新拉取。
      });
  };

  const handlePlanUpgrade = async (plan: UpgradePlan) => {
    if (plan.key === 'team') {
      settingsHistory.push(`${TEAM_PATH}/purchase?action=OPEN`);
      return undefined;
    }
    if (!personal) return undefined;
    try {
      const response = await createAgentPointOrder({
        payChannel: 'wechat',
        requestId: requestKey(),
        planCode: plan.key,
      });
      const order = response.data.data;

      if (response.data.code !== 200 || !order?.orderNo) {
        antdMessage.error(
          response.data.msg || I18N.carbonAgent.createOrderFailed,
        );
        return undefined;
      }

      return order;
    } catch {
      antdMessage.error(I18N.carbonAgent.createOrderFailed);
      return undefined;
    }
  };

  const handlePlanPaymentSuccess = () => {
    refreshPointsAndPlans();
  };

  const handleSubscribeFromPersonalCenter = () => {
    setMobileProfileOpen(false);
    handleUpgradeClick();
  };

  const handleProfileTriggerClick = () => {
    if (!authenticated) {
      onLoginRequest();
      return;
    }

    if (mobileProfileEnabled && !collapsed) {
      setProfileMenuOpen(false);
      setMobileProfileOpen(true);
      return;
    }

    setProfileMenuOpen(prevOpen => !prevOpen);
  };

  const handleToggleProject = (projectId: string) => {
    if (!onRequireLogin()) {
      return;
    }

    setExpandedProjectId(currentId =>
      currentId === projectId ? '' : projectId,
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!onRequireLogin()) {
      return;
    }

    setDraggingConversationId(parseConversationDragId(String(event.active.id)));
    setOpenMenuConversationId('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onRequireLogin()) {
      return;
    }

    const conversationId = parseConversationDragId(String(event.active.id));
    const nextProjectId = getConversationDropTarget(
      String(event.over?.id || ''),
    );

    setDraggingConversationId('');

    if (!conversationId || nextProjectId === undefined) {
      return;
    }

    const draggedConversation = allConversations.find(
      conversation => conversation.id === conversationId,
    );

    if (!draggedConversation) {
      return;
    }

    if (
      draggedConversation.projectSession &&
      draggedConversation.canWrite !== true
    ) {
      return;
    }

    const movedConversation = {
      ...draggedConversation,
      projectId: nextProjectId,
    };

    setConversations(prevConversations => {
      const remainingConversations = prevConversations.filter(
        conversation => conversation.id !== conversationId,
      );

      return nextProjectId === null
        ? upsertConversation(remainingConversations, movedConversation)
        : remainingConversations;
    });
    setProjectConversations(prevConversations => {
      const remainingConversations = prevConversations.filter(
        conversation => conversation.id !== conversationId,
      );

      return nextProjectId
        ? upsertConversation(remainingConversations, movedConversation)
        : remainingConversations;
    });
  };

  const renderProfileAction = (action: ProfileAction) => {
    if (action.key === 'language') {
      return (
        <div
          className={style.profileLanguageItem}
          key={action.key}
          onBlur={event => {
            const { relatedTarget } = event;

            if (
              !(relatedTarget instanceof Node) ||
              !event.currentTarget.contains(relatedTarget)
            ) {
              setProfileLanguageMenuOpen(false);
            }
          }}
          onFocus={() => setProfileLanguageMenuOpen(true)}
          onMouseEnter={() => setProfileLanguageMenuOpen(true)}
          onMouseLeave={() => setProfileLanguageMenuOpen(false)}
        >
          <button
            className={classNames(
              style.profileAction,
              style.profileLanguageButton,
            )}
            type='button'
            role='menuitem'
            aria-controls='carbon-agent-profile-language-menu'
            aria-expanded={profileLanguageMenuOpen}
            aria-haspopup='menu'
            tabIndex={profileMenuOpen ? 0 : -1}
            onClick={() => setProfileLanguageMenuOpen(true)}
          >
            <span className={style.profileActionIcon}>
              <Icon
                className={style.profileActionImageIcon}
                src={action.icon}
              />
            </span>
            <span>{action.label}</span>
            <Icon
              className={style.profileLanguageArrow}
              src={icons.chevronIcon}
            />
          </button>
          <div
            className={classNames(style.profileLanguagePopover, {
              [style.profileLanguagePopoverOpen]: profileLanguageMenuOpen,
            })}
            id='carbon-agent-profile-language-menu'
            role='menu'
            aria-label={I18N.carbonAgent.profileLanguage}
          >
            {languageMap.map(item => (
              <button
                className={classNames(style.profileLanguageOption, {
                  [style.profileLanguageOptionActive]: item.value === locale,
                })}
                key={item.value}
                type='button'
                role='menuitemradio'
                aria-checked={item.value === locale}
                tabIndex={profileMenuOpen && profileLanguageMenuOpen ? 0 : -1}
                onClick={() => {
                  handleProfileLanguageChange(item.value);
                }}
              >
                <span>{getProfileLanguageLabel(item.value)}</span>
                {item.value === locale ? (
                  <span
                    className={style.profileLanguageCheck}
                    aria-hidden='true'
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      );
    }

    const actionButton = (
      <button
        className={style.profileAction}
        key={action.key}
        type='button'
        role='menuitem'
        aria-expanded={
          action.key === 'support' ? customerServiceOpen : undefined
        }
        aria-haspopup={action.key === 'support' ? 'dialog' : undefined}
        tabIndex={profileMenuOpen ? 0 : -1}
        onClick={
          action.key === 'support'
            ? undefined
            : () => handleProfileAction(action.key)
        }
      >
        <span className={style.profileActionIcon}>
          <Icon className={style.profileActionImageIcon} src={action.icon} />
        </span>
        <span>{action.label}</span>
      </button>
    );

    return action.key === 'support' ? (
      <CustomerServicePopover
        key={action.key}
        open={customerServiceOpen}
        placement='rightBottom'
        trigger='click'
        onOpenChange={setCustomerServiceOpen}
      >
        {actionButton}
      </CustomerServicePopover>
    ) : (
      actionButton
    );
  };

  return (
    <aside
      className={classNames(style.sidebar, {
        [style.sidebarCollapsed]: collapsed,
      })}
      data-agent-login-entry='sidebar'
      aria-label={I18N.carbonAgent.agentNavLabel}
    >
      <div className={style.sidebarMain}>
        <header
          className={classNames(style.logoBar, {
            [style.logoBarHoverSuppressed]:
              collapsed && collapsedLogoHoverSuppressed,
          })}
          onMouseLeave={() => {
            if (collapsedLogoHoverSuppressed) {
              setCollapsedLogoHoverSuppressed(false);
            }
          }}
        >
          <div className={style.logo} title={I18N.carbonAgent.carbonCloud}>
            <img
              className={style.logoMark}
              src={icons.logoIconText}
              alt=''
              aria-hidden='true'
            />
            {/* <span className={style.logoText}>
              {I18N.carbonAgent.carbonCloud}
            </span> */}
          </div>
          <img
            className={style.collapsedLogo}
            src={icons.logoIconDark}
            alt=''
            aria-hidden='true'
          />
          <button
            className={style.iconButton}
            type='button'
            aria-controls='carbon-agent-sidebar-nav'
            aria-expanded={mobile ? undefined : !collapsed}
            aria-label={mobile ? I18N.carbonAgent.closeMenu : collapsedLabel}
            title={mobile ? I18N.carbonAgent.closeMenu : collapsedLabel}
            onMouseDown={event => {
              event.preventDefault();
            }}
            onClick={handleToggleCollapsed}
          >
            {mobile ? (
              <CloseOutlined />
            ) : (
              <Icon className={style.headerIcon} src={icons.collapseMenuIcon} />
            )}
          </button>
        </header>

        <DndContext
          collisionDetection={pointerWithin}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingConversationId('')}
        >
          <nav className={style.nav} id='carbon-agent-sidebar-nav'>
            <button
              className={classNames(style.newChat, {
                [style.newChatActive]:
                  activeSection === 'newChat' && !selectedSessionId,
              })}
              type='button'
              aria-label={collapsed ? I18N.carbonAgent.newChatShort : undefined}
              title={collapsed ? I18N.carbonAgent.newChatShort : undefined}
              onClick={handleNewChat}
            >
              <Icon src={icons.newChatIcon} />
              <span className={style.navText}>
                {I18N.carbonAgent.newChatShort}
              </span>
            </button>

            <button
              className={classNames(style.navItem, {
                [style.activeNavItem]: footprintAccountingSelected,
              })}
              type='button'
              aria-current={footprintAccountingSelected ? 'page' : undefined}
              aria-label={
                collapsed ? I18N.carbonAgent.productCarbonFootprint : undefined
              }
              title={
                collapsed ? I18N.carbonAgent.productCarbonFootprint : undefined
              }
              onClick={() => onSelectSection('footprintAccounting')}
            >
              <Icon src={icons.productFootprintIcon} />
              <span className={style.navText}>
                {productCarbonFootprintNavLabel}
              </span>
            </button>

            <button
              className={classNames(style.navItem, {
                [style.activeNavItem]: activeSection === 'enterpriseCarbon',
              })}
              type='button'
              aria-current={
                activeSection === 'enterpriseCarbon' ? 'page' : undefined
              }
              aria-label={
                collapsed ? I18N.carbonAgent.enterpriseCarbon : undefined
              }
              title={collapsed ? I18N.carbonAgent.enterpriseCarbon : undefined}
              onClick={() => onSelectSection('enterpriseCarbon')}
            >
              <Icon src={icons.enterpriseCarbonIcon} />
              <span className={style.navText}>
                {I18N.carbonAgent.enterpriseCarbon}
              </span>
            </button>

            <button
              className={classNames(style.navItem, {
                [style.activeNavItem]: activeSection === 'cbamFiles',
              })}
              type='button'
              aria-current={activeSection === 'cbamFiles' ? 'page' : undefined}
              aria-label={collapsed ? I18N.carbonAgent.cbam : undefined}
              title={collapsed ? I18N.carbonAgent.cbam : undefined}
              onClick={() => onSelectSection('cbamFiles')}
            >
              <Icon src={icons.cbamIcon} />
              <span className={style.navText}>{I18N.carbonAgent.cbam}</span>
            </button>

            <button
              className={classNames(style.navItem, {
                [style.activeNavItem]: activeSection === 'factorLibrary',
              })}
              type='button'
              aria-current={
                activeSection === 'factorLibrary' ? 'page' : undefined
              }
              aria-label={collapsed ? I18N.ccdb.libraryMenu : undefined}
              title={collapsed ? I18N.ccdb.libraryMenu : undefined}
              onClick={() => onSelectSection('factorLibrary')}
            >
              <IconAlibabaNew
                className={classNames(
                  style.navIcon,
                  sidebarStyles.factorLibraryIcon,
                )}
                type='icon-icon-yinziku-saas'
                aria-hidden
              />
              <span className={style.navText}>{I18N.ccdb.libraryMenu}</span>
            </button>

            <button
              className={classNames(style.navItem, {
                [style.activeNavSubItem]: [
                  'enterpriseFollows',
                  'enterpriseDetail',
                  'enterpriseCompare',
                ].includes(activeSection),
              })}
              type='button'
              aria-label={I18N.enterpriseData.title}
              title={collapsed ? I18N.enterpriseData.title : undefined}
              onClick={() => onSelectSection('enterpriseFollows')}
            >
              <Icon src={icons.cbamIcon} />
              <span className={style.navText}>{I18N.enterpriseData.title}</span>
            </button>

            {collapsed ? (
              <div
                className={style.collapsedHistoryNav}
                ref={collapsedHistoryRef}
              >
                <button
                  className={classNames(style.collapsedHistoryButton, {
                    [style.collapsedHistoryButtonActive]: collapsedHistoryOpen,
                  })}
                  type='button'
                  aria-controls='carbon-agent-collapsed-history'
                  aria-expanded={collapsedHistoryOpen}
                  aria-haspopup='menu'
                  aria-label={I18N.carbonAgent.recentChats}
                  title={I18N.carbonAgent.recentChats}
                  disabled={!historyConversations.length}
                  onClick={handleCollapsedHistoryToggle}
                >
                  <Icon src={icons.historyChatIcon} />
                </button>
                {collapsedHistoryOpen ? (
                  <CollapsedHistoryDropdown
                    conversations={historyConversations}
                    id='carbon-agent-collapsed-history'
                    selectedConversationId={selectedSessionId}
                    onSelectConversation={handleConversationSelect}
                  />
                ) : null}
              </div>
            ) : null}

            {projectFeatureEnabled ? (
              <ProjectNavigation
                activeSection={activeSection}
                canCreateProject={projectCreationEnabled}
                collapsed={collapsed}
                conversationDragEnabled={conversationDragEnabled}
                conversationsByProject={projectConversationMap}
                error={projectListError}
                expandedProjectId={expandedProjectId}
                loading={projectListLoading}
                menuConversationId={openMenuConversationId}
                projects={projects}
                selectedConversationId={selectedSessionId}
                tooltipEnabled={!mobile}
                onCloseMenu={() => setOpenMenuConversationId('')}
                onCreateProject={handleOpenProjectDialog}
                onDeleteConversation={handleDeleteConversation}
                onMenuToggle={conversationId =>
                  setOpenMenuConversationId(prevId =>
                    prevId === conversationId ? '' : conversationId,
                  )
                }
                onRenameConversation={handleRenameConversation}
                onRetry={handleReloadProjects}
                onSelectConversation={handleConversationSelect}
                onSelectSection={onSelectSection}
                onToggleProject={handleToggleProject}
              />
            ) : null}

            {mobile && !authenticated ? (
              <p className={style.mobileSidebarGuestHint}>
                {I18N.carbonAgent.guestHistoryHint}
              </p>
            ) : null}

            {(!mobile || authenticated) && !collapsed ? (
              <HistoryDropZone
                conversations={historyConversations}
                conversationDragEnabled={conversationDragEnabled}
                error={conversationListError}
                loading={conversationListLoading}
                menuConversationId={openMenuConversationId}
                selectedConversationId={selectedSessionId}
                tooltipEnabled={!mobile}
                onCloseMenu={() => setOpenMenuConversationId('')}
                onDeleteConversation={handleDeleteConversation}
                onMenuToggle={conversationId =>
                  setOpenMenuConversationId(prevId =>
                    prevId === conversationId ? '' : conversationId,
                  )
                }
                onRenameConversation={handleRenameConversation}
                onRetry={handleReloadConversations}
                onSelectConversation={handleConversationSelect}
                onViewAll={handleViewAllHistory}
              />
            ) : null}
          </nav>
          <DragOverlay>
            {activeConversation ? (
              <div className={style.conversationOverlay}>
                <span className={style.historyTitle}>
                  {activeConversation.title}
                </span>
                <span className={style.historyTime}>
                  {activeConversation.time}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <footer className={style.profileShell}>
        {!collapsed && authenticated && personal ? (
          <div className={style.pointsArea}>
            {pointsWarning && pointsWarningVisible ? (
              <div
                className={classNames(style.pointsWarning, {
                  [style.pointsWarningEnglish]: locale === LocaleType.enUS,
                })}
                role='status'
              >
                <img
                  alt=''
                  src={pointsWarningIcon}
                  className={style.pointsWarningIcon}
                  aria-hidden='true'
                />
                <span className={style.pointsWarningMessage}>
                  {pointsWarning.message}
                </span>
                <button
                  className={style.pointsWarningAction}
                  type='button'
                  onClick={handlePointsWarningAction}
                >
                  {pointsWarning.actionLabel}
                </button>
                <button
                  className={style.pointsWarningClose}
                  type='button'
                  aria-label={I18N.carbonAgent.closeDialog}
                  title={I18N.carbonAgent.closeDialog}
                  onClick={handlePointsWarningDismiss}
                >
                  <img alt='' aria-hidden='true' src={pointsWarningCloseIcon} />
                </button>
              </div>
            ) : null}
            <div className={style.pointsCard}>
              <div
                className={style.pointsInfo}
                aria-label={I18N.template(I18N.carbonAgent.pointsAria, {
                  val1: availablePoints,
                })}
              >
                <span className={style.pointsIcon} aria-hidden='true' />
                <span className={style.pointsValue}>{availablePoints}</span>
              </div>
              <button
                className={style.upgradeButton}
                type='button'
                onClick={handleUpgradeClick}
              >
                {I18N.carbonAgent.upgrade}
              </button>
            </div>
          </div>
        ) : null}
        <div
          className={style.profileMenuArea}
          onBlur={event => {
            const { relatedTarget } = event;

            if (
              !(relatedTarget instanceof Node) ||
              !event.currentTarget.contains(relatedTarget)
            ) {
              setProfileMenuOpen(false);
            }
          }}
          onMouseLeave={() => {
            if (!mobile && !customerServiceOpen) {
              setProfileMenuOpen(false);
            }
          }}
        >
          <button
            className={classNames(style.profile, {
              [style.mobileSidebarGuestProfile]: mobile && !authenticated,
            })}
            type='button'
            aria-controls={
              authenticated
                ? mobileProfileEnabled
                  ? 'carbon-agent-mobile-personal-center'
                  : 'carbon-agent-profile-menu'
                : undefined
            }
            aria-expanded={
              authenticated
                ? mobileProfileEnabled
                  ? mobileProfileOpen
                  : profileMenuOpen
                : undefined
            }
            aria-haspopup={
              authenticated && !mobileProfileEnabled ? 'menu' : undefined
            }
            aria-label={
              collapsed
                ? I18N.template(I18N.carbonAgent.profileNamePlanComma, {
                    val1: workspaceName,
                    val2: planName,
                  })
                : undefined
            }
            title={
              collapsed
                ? I18N.template(I18N.carbonAgent.profileNamePlanDot, {
                    val1: workspaceName,
                    val2: planName,
                  })
                : undefined
            }
            onMouseEnter={() => {
              if (authenticated && !mobile && !mobileProfileEnabled) {
                setProfileMenuOpen(true);
              }
            }}
            onClick={handleProfileTriggerClick}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleProfileTriggerClick();
              }
            }}
          >
            <img className={style.avatar} src={icons.avatarIcon} alt='' />
            {!collapsed ? (
              <>
                <span className={style.profileIdentity}>
                  <span className={style.userName}>
                    {mobile && !authenticated
                      ? I18N.carbonAgent.guestLoginAction
                      : workspaceName}
                  </span>
                  <span
                    className={classNames(
                      style.badge,
                      PLAN_BADGE_TONE_CLASS_MAP[planTone],
                    )}
                  >
                    {mobile && !authenticated
                      ? I18N.carbonAgent.guestLoginBenefits
                      : planName}
                  </span>
                </span>
                <Icon className={style.profileMore} src={icons.chevronIcon} />
              </>
            ) : null}
          </button>
          {authenticated && !mobile && !mobileProfileEnabled ? (
            <div
              className={classNames(style.profilePopover, {
                [style.profilePopoverOpen]: profileMenuOpen,
                [style.profilePopoverEnglish]: locale === LocaleType.enUS,
              })}
              id='carbon-agent-profile-menu'
              role='menu'
              aria-hidden={!profileMenuOpen}
            >
              <div className={style.profilePopoverHeader}>
                <img
                  className={style.profilePopoverAvatar}
                  src={icons.avatarIcon}
                  alt=''
                />
                <div className={style.profilePopoverText}>
                  <strong>{workspaceName}</strong>
                  <span>{profileAccount}</span>
                </div>
              </div>
              <div
                className={classNames(
                  style.profileActionGroup,
                  style.profileActionGroupMain,
                )}
              >
                {profileMainActions.map(renderProfileAction)}
                {(personal || access?.canManage) && (
                  <button
                    className={style.profileAction}
                    type='button'
                    role='menuitem'
                    tabIndex={profileMenuOpen ? 0 : -1}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      const path = `${TEAM_PATH}/${
                        personal ? 'purchase?action=OPEN' : 'overview'
                      }`;
                      if (personal) {
                        settingsHistory.push(path);
                      } else {
                        window.open(
                          withCurrentLocalePrefix(path),
                          '_blank',
                          'noopener,noreferrer',
                        );
                      }
                    }}
                  >
                    <img
                      src={teamManagementIcon}
                      alt=''
                      className={style.profileActionIcon}
                    />
                    <span>
                      {personal
                        ? teamText('setUpATeam')
                        : teamText('teamAdminConsole')}
                    </span>
                  </button>
                )}
              </div>
              {profileLogoutAction ? (
                <div className={style.profileActionGroup}>
                  <WorkspaceMenu
                    active={profileMenuOpen}
                    onSelect={() => setProfileMenuOpen(false)}
                  />
                  {renderProfileAction(profileLogoutAction)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </footer>

      {mobileProfileEnabled && authenticated ? (
        <MobilePersonalCenter
          account={profileAccount}
          open={mobileProfileOpen}
          personalWorkspace={personal}
          planName={planName}
          planTone={personal ? planTone : 'team'}
          pointsWarningActionLabel={pointsWarning?.actionLabel}
          pointsWarningMessage={pointsWarning?.message}
          userName={profileName}
          onBack={() => setMobileProfileOpen(false)}
          onApiKeys={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('apiKeys');
            setUpgradeDialogOpen(true);
          }}
          onAuthorizations={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('authorizations');
            setUpgradeDialogOpen(true);
          }}
          onLogout={() => handleProfileAction('logout')}
          onNewChat={() => {
            setMobileProfileOpen(false);
            handleNewChat();
          }}
          onOpenGuide={() => {
            setMobileProfileOpen(false);
            onOpenGuide();
          }}
          onOpenManual={() => {
            setMobileProfileOpen(false);
            window.open(AGENT_MANUAL_URL, '_blank', 'noopener,noreferrer');
          }}
          onOrders={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('orders');
            setUpgradeDialogOpen(true);
          }}
          onInvoices={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('invoices');
            setUpgradeDialogOpen(true);
          }}
          onInvite={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('invite');
            setUpgradeDialogOpen(true);
          }}
          onIssueFeedback={() => {
            setMobileProfileOpen(false);
            onSelectSection('issueFeedback');
            onMobileClose?.();
          }}
          onPointsRecords={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('points');
            setUpgradeDialogOpen(true);
          }}
          onSettings={() => {
            setMobileProfileOpen(false);
            setUpgradeDialogInitialTab('settings');
            setUpgradeDialogOpen(true);
          }}
          onSubscribe={handleSubscribeFromPersonalCenter}
          onPointsWarningAction={() => {
            setMobileProfileOpen(false);
            handlePointsWarningAction();
          }}
        />
      ) : null}

      {projectCreationEnabled ? (
        <ProjectCreateDialog
          locale={locale}
          open={projectDialogOpen}
          onCancel={() => setProjectDialogOpen(false)}
          onCreated={handleProjectCreated}
        />
      ) : null}
      <UpgradePlanDialog
        personalWorkspace={personal}
        addonLoading={addonPlansLoading}
        addonPlans={addonPlans}
        currentPlanCode={userPoints?.planCode}
        initialTab={upgradeDialogInitialTab}
        loading={upgradePlansLoading}
        open={upgradeDialogOpen}
        plans={upgradePlans}
        onClose={() => setUpgradeDialogOpen(false)}
        onMobileBackToPersonalCenter={() => {
          setUpgradeDialogOpen(false);
          setMobileProfileOpen(true);
        }}
        onPaymentSuccess={handlePlanPaymentSuccess}
        onUpgrade={handlePlanUpgrade}
      />
      <ProjectNameDialog
        confirmText={I18N.carbonAgent.save}
        initialValue={renamingConversation?.title}
        open={Boolean(renamingConversation)}
        placeholder={I18N.carbonAgent.conversationNamePlaceholder}
        submitting={renameSubmitting}
        title={I18N.carbonAgent.renameConversationTitle}
        onCancel={() => {
          if (!renameSubmitting) {
            setRenamingConversationId('');
          }
        }}
        onSubmit={handleSubmitRename}
      />
    </aside>
  );
};

type CollapsedHistoryDropdownProps = {
  conversations: AgentConversation[];
  id: string;
  selectedConversationId: string;
  onSelectConversation: (conversation: AgentConversation) => void;
};

const CollapsedHistoryDropdown = ({
  conversations,
  id,
  selectedConversationId,
  onSelectConversation,
}: CollapsedHistoryDropdownProps) => (
  <div className={style.collapsedHistoryDropdown} id={id} role='menu'>
    <div className={style.collapsedHistoryHeader}>
      {I18N.carbonAgent.recentChats}
    </div>
    <div className={style.collapsedHistoryList}>
      {conversations.map(conversation => {
        const conversationId = conversation.sessionId || conversation.id;
        const selected = selectedConversationId === conversationId;

        return (
          <button
            className={classNames(style.collapsedHistoryItem, {
              [style.collapsedHistoryItemActive]: selected,
            })}
            key={conversation.id}
            type='button'
            role='menuitem'
            onClick={() => onSelectConversation(conversation)}
          >
            <span className={style.collapsedHistoryTitle}>
              {conversation.title}
            </span>
            {conversation.running || conversation.hasUnread ? (
              <span className={style.collapsedHistoryState} aria-hidden='true'>
                {conversation.running ? (
                  <span className={style.conversationRunning} />
                ) : (
                  <span className={style.conversationUnread} />
                )}
              </span>
            ) : null}
            <span className={style.collapsedHistoryMore} aria-hidden='true'>
              ...
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

type HistoryDropZoneProps = {
  conversations: AgentConversation[];
  error?: string;
  loading?: boolean;
  menuConversationId: string;
  selectedConversationId: string;
  tooltipEnabled: boolean;
  conversationDragEnabled: boolean;
  onCloseMenu: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onMenuToggle: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onRetry: () => void;
  onSelectConversation: (conversation: AgentConversation) => void;
  onViewAll: () => void;
};

const HistoryDropZone = ({
  conversations,
  error = '',
  loading = false,
  menuConversationId,
  selectedConversationId,
  tooltipEnabled,
  conversationDragEnabled,
  onCloseMenu,
  onDeleteConversation,
  onMenuToggle,
  onRenameConversation,
  onRetry,
  onSelectConversation,
  onViewAll,
}: HistoryDropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({
    disabled: !conversationDragEnabled,
    id: HISTORY_DROP_ID,
  });

  return (
    <div className={classNames(style.navSection, style.historyNavSection)}>
      <div
        className={classNames(style.sectionTitle, style.historySectionTitle)}
      >
        <span>{I18N.carbonAgent.historyConversations}</span>
        <button
          className={style.historyViewAllButton}
          type='button'
          onClick={onViewAll}
        >
          {I18N.carbonAgent.viewAll}
        </button>
      </div>
      <div
        className={classNames(style.historyDropZone, {
          [style.dropZoneActive]: conversationDragEnabled && isOver,
        })}
        ref={setNodeRef}
      >
        {loading ? (
          <div className={style.historyState}>
            {I18N.carbonAgent.loadingHistory}
          </div>
        ) : null}
        {!loading && error ? (
          <div className={style.historyState}>
            <span>{error}</span>
            <button type='button' onClick={onRetry}>
              {I18N.carbonAgent.reload}
            </button>
          </div>
        ) : null}
        {!loading && !error && conversations.length
          ? conversations.map(conversation => (
              <ConversationItem
                conversation={conversation}
                draggable={conversationDragEnabled}
                key={conversation.id}
                menuOpen={menuConversationId === conversation.id}
                selected={
                  selectedConversationId ===
                  (conversation.sessionId || conversation.id)
                }
                tooltipEnabled={tooltipEnabled}
                onCloseMenu={onCloseMenu}
                onDelete={onDeleteConversation}
                onMenuToggle={onMenuToggle}
                onRename={onRenameConversation}
                onSelect={onSelectConversation}
              />
            ))
          : null}
      </div>
    </div>
  );
};

export default Sidebar;
