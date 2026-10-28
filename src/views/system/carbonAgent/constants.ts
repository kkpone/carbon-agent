import aiAssistant from '@src/assets/images/carbonAgent/ai-assistant.svg';
import addIcon from '@src/assets/images/carbonAgent/icons/add.svg';
import logoIconDark from '@src/assets/images/carbonAgent/icons/agent-logo.svg';
import logoIconText from '@src/assets/images/carbonAgent/icons/agent-text.svg';
import chevronIcon from '@src/assets/images/carbonAgent/icons/chevron.svg';
import collapseMenuIcon from '@src/assets/images/carbonAgent/icons/collapse-menu.svg';
import cbamIcon from '@src/assets/images/carbonAgent/icons/cbam.svg';
import enterpriseCarbonIcon from '@src/assets/images/carbonAgent/icons/enterprise-carbon.svg';
import esgIcon from '@src/assets/images/carbonAgent/icons/esg.svg';
import folderIcon from '@src/assets/images/carbonAgent/icons/folder.svg';
import historyChatIcon from '@src/assets/images/carbonAgent/icons/history-chat.svg';
import newChatIcon from '@src/assets/images/carbonAgent/icons/new-chat.svg';
import newProjectMutedIcon from '@src/assets/images/carbonAgent/icons/new-project-muted.svg';
import newProjectIcon from '@src/assets/images/carbonAgent/icons/new-project.svg';
import productFootprintIcon from '@src/assets/images/carbonAgent/icons/product-footprint.svg';
import profileGuideIcon from '@src/assets/images/carbonAgent/icons/profile-guide.svg';
import profileLanguageIcon from '@src/assets/images/carbonAgent/icons/profile-language.svg';
import profileLogoutIcon from '@src/assets/images/carbonAgent/icons/profile-logout.svg';
import profileManualIcon from '@src/assets/images/carbonAgent/icons/profile-manual.svg';
import profileNotificationIcon from '@src/assets/images/carbonAgent/icons/profile-notification.svg';
import profileSettingsIcon from '@src/assets/images/carbonAgent/icons/profile-settings.svg';
import profileSupportIcon from '@src/assets/images/carbonAgent/icons/profile-support.svg';
import projectConversationIcon from '@src/assets/images/carbonAgent/icons/project-conversation.svg';
import projectConversationMemberIcon from '@src/assets/images/carbonAgent/icons/project-conversation-member.svg';
import projectConversationPersonalIcon from '@src/assets/images/carbonAgent/icons/project-conversation-personal.svg';
import projectHomeIcon from '@src/assets/images/carbonAgent/icons/project-home.svg';
import projectTaskIcon from '@src/assets/images/carbonAgent/icons/project-task.svg';
import issueFeedbackIcon from '@src/assets/images/carbonAgent/feedback/entry.svg';
import sendDisabledIcon from '@src/assets/images/carbonAgent/icons/send-disabled.svg';
import successIcon from '@src/assets/images/carbonAgent/icons/success.svg';
import navAddonIcon from '@src/assets/svg/carbonAgent/nav-addon.svg';
import navInvoiceIcon from '@src/assets/svg/carbonAgent/nav-invoice.svg';
import navLogoutIcon from '@src/assets/svg/carbonAgent/nav-logout.svg';
import navOrderIcon from '@src/assets/svg/carbonAgent/nav-order.svg';
import navPlanIcon from '@src/assets/svg/carbonAgent/nav-plan.svg';
import navPointsIcon from '@src/assets/svg/carbonAgent/nav-points.svg';
import navSettingsIcon from '@src/assets/svg/carbonAgent/nav-settings.svg';
import avatarIcon from '@src/assets/svg/icon_avatar.svg';
import I18N, { LocaleType } from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export const icons = {
  addIcon,
  aiAssistant,
  avatarIcon,
  chevronIcon,
  collapseMenuIcon,
  cbamIcon,
  enterpriseCarbonIcon,
  esgIcon,
  folderIcon,
  historyChatIcon,
  logoIconDark,
  navAddonIcon,
  navInvoiceIcon,
  navLogoutIcon,
  navOrderIcon,
  navPlanIcon,
  navPointsIcon,
  navSettingsIcon,
  newChatIcon,
  newProjectMutedIcon,
  newProjectIcon,
  productFootprintIcon,
  profileGuideIcon,
  profileManualIcon,
  profileLanguageIcon,
  profileLogoutIcon,
  profileNotificationIcon,
  profileSettingsIcon,
  profileSupportIcon,
  projectConversationIcon,
  projectConversationMemberIcon,
  projectConversationPersonalIcon,
  projectHomeIcon,
  projectTaskIcon,
  issueFeedbackIcon,
  sendDisabledIcon,
  successIcon,
  logoIconText,
};

export type AgentSectionKey =
  | 'newChat'
  | 'history'
  | 'issueFeedback'
  | 'cbamFiles'
  | 'factorLibrary'
  | 'footprintAccounting'
  | 'productFootprint'
  | 'enterpriseCarbon'
  | 'enterpriseFollows'
  | 'enterpriseDetail'
  | 'enterpriseCompare'
  | 'esg'
  | `project:${string}`
  | `projectComparison:${string}`
  | `projectOverview:${string}`
  | `projectTasks:${string}`;

export type AccountBindStatus = 'HAS_ACCOUNT' | 'NO_ACCOUNT';

export type ModeKey =
  | 'productFootprint'
  | 'enterpriseCarbon'
  | 'model_update'
  | 'remodeling'
  | 'data_analysis'
  | 'generate_report'
  | 'regenerate_report'
  | 'comingSoon'
  | 'none'
  | `skill:${string}`;

export type ModeOption = {
  disabled?: boolean;
  key: ModeKey;
  label: string;
  quickSkill?: string;
  scene?: string;
};

export type AgentHomeSkill = {
  description?: string | null;
  disabledReason?: string | null;
  displayPosition?: string | null;
  enabled: boolean;
  iconKey?: string | null;
  name: string;
  quickSkill: string;
  scene: string;
  sortNo: number;
};

export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'carbon-agent-sidebar-collapsed';
export const HISTORY_DROP_ID = 'carbon-agent-history-drop';
export const PROJECT_DROP_PREFIX = 'carbon-agent-project-drop:';
export const CONVERSATION_DRAG_PREFIX = 'carbon-agent-conversation:';
export const AGENT_COMPOSER_MESSAGE_MAX_LENGTH = 10000;
export const AGENT_SESSION_TITLE_MAX_LENGTH = 40;
export const AGENT_ACCOUNT_SEARCH_MAX_LENGTH = 80;
export const AGENT_FORM_TEXT_MAX_LENGTH = 200;
export const AGENT_FORM_TEXTAREA_MAX_LENGTH = 1000;
export const AGENT_ATTACHMENT_ACCEPT_EXTENSIONS = [
  '7z',
  'csv',
  'doc',
  'docx',
  'jpeg',
  'jpg',
  'md',
  'pdf',
  'png',
  'rar',
  'txt',
  'xls',
  'xlsx',
  'zip',
];

export type HomeSuggestion = {
  message: string;
  pageContext?: Record<string, unknown>;
  priority?: number;
  scene?: string;
  source?: string;
  title: string;
};

export const fallbackPromptRows = [
  [
    '资讯：CBAM 和 产品碳足迹披露近期有哪些要点值得关注',
    'AI agent 如何实现跨任务自主协作？',
  ],
  ['未来 5 年哪些行业可能迎来爆发？', '资讯：最近哪些行业在推进产品碳标签认证'],
];

export const fallbackSuggestions: HomeSuggestion[] = fallbackPromptRows.flatMap(
  row =>
    row.map(item => ({
      message: item,
      title: item,
    })),
);

export type AgentConversation = {
  accountBindStatus?: AccountBindStatus;
  bizId?: number | string | null;
  bizRef?: Record<string, unknown>;
  bizType?: string | null;
  cbamId?: number | string | null;
  canEditEnterprisePreview?: boolean;
  canWrite?: boolean;
  id: string;
  hasUnread?: boolean;
  initiatorCompanyId?: number | string;
  initiatorCompanyName?: string;
  initiatorUserId?: number | string;
  initiatorUserName?: string;
  initiatedByMe?: boolean;
  intent?: string;
  module?: string | null;
  projectId: string | null;
  projectSession?: boolean;
  quickSkill?: string | null;
  running?: boolean;
  runningMessageId?: string;
  scene?: string | null;
  sessionScope?: string | null;
  sessionId?: string;
  sourceSessionId?: string | null;
  sourceSuggestionId?: number | string | null;
  sourceTaskId?: number | string | null;
  status?: string;
  time: string;
  title: string;
  titleSource?: string;
  workspaceProjectId?: string | null;
};

export type AgentEnterpriseBusinessCapabilities = {
  canApproveTask?: boolean;
  canCreateAccounting?: boolean;
  canCreateTask?: boolean;
  canEditAccounting?: boolean;
  canEditEmissionSource?: boolean;
  canFillTask?: boolean;
  canInviteMember?: boolean;
  canManageMemberRole?: boolean;
  canManageProject?: boolean;
  canViewAccounting?: boolean;
};

export type AgentEnterpriseProjectSetting = {
  accountingExistedAtCreate: boolean;
  accountingExists: boolean;
  accountingYear: number;
  computationId: number | string;
  gwp: string;
  gwpName: string;
  locked: boolean;
  orgId?: number | string | null;
  sourceSessionId?: string | null;
  timeType: number;
  timeTypeName: string;
};

export type AgentProject = {
  businessCapabilities?: AgentEnterpriseBusinessCapabilities;
  businessType?: string;
  businessTypeName?: string;
  createTime?: string;
  currentRole?: 'admin' | 'member' | 'owner' | (string & {});
  currentRoleName?: string;
  enterpriseSetting?: AgentEnterpriseProjectSetting | null;
  expectedFinishTime?: string;
  id: string;
  manageable?: boolean;
  memberCount?: number;
  name: string;
  ownerCompanyId?: number | string;
  ownerCompanyName?: string;
  ownerUserId?: number | string;
  ownerUserName?: string;
  projectGoal?: string;
  setting?: {
    factorPreferences?: Record<string, string>;
    lifecycleScope?: string;
    lifecycleScopeName?: string;
    scopeValue?: string | null;
    settingVersion?: number;
    updateTime?: string;
  } | null;
  status?: string;
  statusName?: string;
  updateTime?: string;
  version?: number;
};

export const initialConversations: AgentConversation[] = [
  {
    id: 'conversation-laptop',
    projectId: null,
    title: '笔记本电脑',
    time: '2026/5/20 14:00:00',
  },
  {
    id: 'conversation-water',
    projectId: null,
    title: '一瓶500ml矿泉水',
    time: '2026/5/20 14:00:00',
  },
  {
    id: 'conversation-tissue',
    projectId: null,
    title: '一盒100抽纸巾',
    time: '2026/5/20 14:00:00',
  },
  {
    id: 'conversation-shirt',
    projectId: null,
    title: '一件纯棉T恤衫的产品碳足迹核算模型',
    time: '2026/5/20 14:00:00',
  },
];

export const getPrimaryNavItems = (): Array<{
  icon: string;
  key: Exclude<AgentSectionKey, `project:${string}`>;
  label: string;
}> => [
  {
    icon: icons.enterpriseCarbonIcon,
    key: 'enterpriseCarbon',
    label: I18N.carbonAgent.enterpriseCarbon,
  },
  {
    icon: icons.esgIcon,
    key: 'esg',
    label: I18N.carbonAgent.esg,
  },
];

export const DEFAULT_ACCOUNT_BIND_STATUS: AccountBindStatus = 'NO_ACCOUNT';

export const quickSkillLabelMap = createI18nLabelMap({
  build_model: () => I18N.carbonAgent.skillBuildModel,
  data_analysis: () => I18N.carbonAgent.skillDataAnalysis,
  enterprise_data_analysis: () => I18N.carbonAgent.skillDataAnalysis,
  enterprise_generate_report: () => I18N.carbonAgent.skillGenerateReport,
  enterprise_modeling: () => I18N.carbonAgent.enterpriseCarbon,
  generate_report: () => I18N.carbonAgent.skillGenerateReport,
  model_update: () => I18N.carbonAgent.skillModelUpdate,
  regenerate_report: () => I18N.carbonAgent.skillRegenerateReport,
  remodeling: () => I18N.carbonAgent.skillRemodeling,
});

const modeQuickSkillMap: Partial<Record<ModeKey, string>> = {
  data_analysis: 'data_analysis',
  enterpriseCarbon: 'enterprise_modeling',
  generate_report: 'generate_report',
  model_update: 'model_update',
  productFootprint: 'build_model',
  regenerate_report: 'regenerate_report',
  remodeling: 'remodeling',
};

const getInitialModeOptions = (): ModeOption[] => [
  {
    disabled: true,
    key: 'comingSoon',
    label: I18N.carbonAgent.comingSoon,
  },
];

const getModeledModeOptions = (): ModeOption[] => [
  {
    key: 'model_update',
    label: quickSkillLabelMap.model_update,
  },
  {
    key: 'data_analysis',
    label: quickSkillLabelMap.data_analysis,
  },
  {
    key: 'generate_report',
    label: quickSkillLabelMap.generate_report,
  },
];

const modeOptionFactoryByLocale: Record<
  LocaleType,
  Record<AccountBindStatus, () => ModeOption[]>
> = {
  [LocaleType.enUS]: {
    HAS_ACCOUNT: getModeledModeOptions,
    NO_ACCOUNT: getInitialModeOptions,
  },
  [LocaleType.zhCN]: {
    HAS_ACCOUNT: getModeledModeOptions,
    NO_ACCOUNT: getInitialModeOptions,
  },
  [LocaleType.zhTW]: {
    HAS_ACCOUNT: getModeledModeOptions,
    NO_ACCOUNT: getInitialModeOptions,
  },
};

export const getModeOptionsByAccountBindStatus = (
  accountBindStatus: AccountBindStatus = DEFAULT_ACCOUNT_BIND_STATUS,
  locale: LocaleType = LocaleType.zhCN,
): ModeOption[] =>
  modeOptionFactoryByLocale[locale][accountBindStatus]?.() ||
  modeOptionFactoryByLocale[LocaleType.zhCN][DEFAULT_ACCOUNT_BIND_STATUS]();

export const getQuickSkillByMode = (
  mode: ModeKey,
  options?: {
    enterpriseCarbon?: boolean;
  },
): string => {
  if (options?.enterpriseCarbon) {
    if (mode === 'data_analysis') {
      return 'enterprise_data_analysis';
    }

    if (mode === 'generate_report') {
      return 'enterprise_generate_report';
    }
  }

  return modeQuickSkillMap[mode] || '';
};

export const getConversationDragId = (conversationId: string) =>
  `${CONVERSATION_DRAG_PREFIX}${conversationId}`;

export const getProjectDropId = (projectId: string) =>
  `${PROJECT_DROP_PREFIX}${projectId}`;

export const getProjectSectionKey = (projectId: string): AgentSectionKey =>
  `project:${projectId}`;

export const getProjectTasksSectionKey = (projectId: string): AgentSectionKey =>
  `projectTasks:${projectId}`;

export const getProjectOverviewSectionKey = (
  projectId: string,
): AgentSectionKey => `projectOverview:${projectId}`;

export const getProjectComparisonSectionKey = (
  projectId: string,
): AgentSectionKey => `projectComparison:${projectId}`;

export const parseConversationDragId = (dragId: string) =>
  dragId.startsWith(CONVERSATION_DRAG_PREFIX)
    ? dragId.slice(CONVERSATION_DRAG_PREFIX.length)
    : '';

export const parseProjectDropId = (dropId: string) =>
  dropId.startsWith(PROJECT_DROP_PREFIX)
    ? dropId.slice(PROJECT_DROP_PREFIX.length)
    : '';

export type AnswerSection = {
  items: string[];
  subtitle: string;
};

export type FollowUpQuestion = {
  customInput?: string;
  options: Array<{
    label: string;
    selected?: boolean;
  }>;
  question: string;
};

export const defaultAnswerSummary =
  '2026年CBAM正式开征、全球产品碳足迹披露强制化提速，核心要点可概括为：CBAM进入实质性缴费期、证书价格落地、范围加速扩围；碳足迹从自愿变强制、中外标准趋同、数据可互认但风险高。';

export const defaultAnswerSections: AnswerSection[] = [
  {
    subtitle: '1. 正式生效与价格落地',
    items: [
      '2026.1.1：CBAM 结束过渡期，进入实质性征收阶段。',
      '2026.4：欧盟公布首个季度证书价 ——75.36 欧元 / 吨 CO₂e（挂钩 EU ETS 均价）。',
      '计算公式：应缴金额 =（产品隐含排放量−免费配额覆盖排放）× 证书价格−原产国已付碳价。',
      '免费配额递减：2026 年 97.5%→2034 年归零，2034 年后全额承担碳成本。',
    ],
  },
  {
    subtitle: '2. 覆盖范围与扩围时间表',
    items: [
      '当前六大行业：钢铁、铝、水泥、化肥、电力、氢（含前驱物排放）。',
      '2028.1.1 扩围：新增180 种钢铝密集下游产品（机械、汽车零部件、家电等）。',
      '微量豁免：年进口≤50 吨或单批货值≤150 欧元可豁免申报 / 缴费。',
    ],
  },
];

export const followUpQuestions: FollowUpQuestion[] = [
  {
    question: '电脑的具体型号是什么？',
    options: [
      { label: 'ThinkPad 系列' },
      { label: 'Think系列' },
      { label: 'Pad 系列' },
      { label: '其他' },
    ],
  },
  {
    question: '主要材质有哪些？',
    customInput: '其他',
    options: [
      { label: '铝合金' },
      { label: '塑胶' },
      { label: '钢材' },
      { label: '电子元器件' },
      { label: '其他', selected: true },
    ],
  },
  {
    question: '要计算哪些生命周期？',
    options: [
      { label: '原材料获取' },
      { label: '生产制造' },
      { label: '分销和储存' },
      { label: '产品使用' },
      { label: '废弃处置' },
      { label: '其他' },
    ],
  },
];
