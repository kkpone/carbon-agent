import { publicToolText } from '../toolEvents';
import { EnterpriseDataCard } from '../enterpriseData/EnterpriseDataCard';
import { getEnterpriseCard } from '../enterpriseData/data';
/**
 * @file Carbon Agent 回答消息与业务结果卡容器，按业务类型转发预览目标。
 */
import {
  ArrowRightOutlined,
  CheckOutlined,
  CopyOutlined,
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import {
  Modal,
  Table,
  TableColumnsType,
  Tooltip,
  message as antdMessage,
} from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import saveAs from 'file-saver';
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

import CbamOperationReportDownload, {
  getOperationReportDownloadAccess,
} from './CbamOperationReportDownload';
import { operationReportCards } from '../operation/reportDownload';
import EnterpriseCarbonBusinessCard from './EnterpriseCarbonBusinessCard';
import FormRequestCard from './FormRequestCard';
import type { CertificationApplyAuthType } from './PreviewPane';
import ReportResultCard from './ReportResultCard';
import ReviewCertificationModals, {
  type ThirdPartyCertificationType,
} from './ReviewCertificationModals';
import StreamingMarkdown from './StreamingMarkdown';
import type { CcdbFactorCitation } from './ccdbFactorMarkdown';
import type { EnterpriseCarbonCertificationTarget } from './enterpriseCarbonCertification/types';
import type { EnterpriseCarbonExpertReviewTarget } from './enterpriseCarbonExpertReview/types';
import {
  DEFAULT_EXPERT_REVIEW_FOCUS,
  canOpenExpertReviewDetail,
  getExpertReviewButtonLabel,
} from './expertReviewHelpers';
import FetchUrlResult from './toolResults/FetchUrlResult';
import ModelAgentResult from './toolResults/ModelAgentResult';
import ProductCarbonModelAgentResult from './toolResults/ProductCarbonModelAgentResult';
import WriteTodosResult, {
  parseWriteTodosResult,
  type TodoItem,
} from './toolResults/WriteTodosResult';
import type { CcdbFactorPreviewTarget } from '../ccdbFactor';
import { readCcdbFactorId } from '../ccdbFactorIdentity';
import {
  getEnterpriseCarbonBusinessKind,
  type EnterpriseCarbonReportFile,
} from '../enterpriseBusinessCard';
import style from '../index.module.less';
import MonitorCard from '../monitor/MonitorCard';
import {
  isMonitorCard,
  monitorCards,
  monitorResult,
  monitorToolResults,
} from '../monitor/results';
import {
  operationAdvice,
  operationAdviceCards,
  OperationAdviceCard,
} from '../operation/materialAdvice';
import {
  AGENT_EXPERT_REVIEW_STATUS,
  applyAgentExpertReview,
  cancelAgentMessageFeedback,
  fetchAgentCertificationList,
  fetchAgentArtifactDownloadUrl,
  fetchAgentFeedbackCategories,
  fetchAgentExpertReviewList,
  fetchAgentExpertReviewStatus,
  fetchAgentWorkspaceFileDownloadUrl,
  getWorkspaceLiveSessionFromToolCall,
  getWorkspaceLiveSessionIdentity,
  getWorkspaceLiveSessionUrl,
  prepareAgentExpertReview,
  submitAgentMessageFeedback,
} from '../service';
import type {
  AgentActionRequestSubmitPayload,
  AgentAnswerControls,
  AgentCertificationItem,
  AgentChatAttachment,
  AgentExpertReviewObjectType,
  AgentExpertReviewPrepareInfo,
  AgentExpertReviewStatus,
  AgentExpertReviewStatusParams,
  AgentFeedbackCategory,
  AgentFeedbackSource,
  AgentFeedbackType,
  AgentFormRequestSubmitPayload,
  AgentMessageBlock,
  AgentMessageCard,
  AgentMessageFeedback,
  AgentMonitorMaterialOrigin,
  AgentToolCall,
  AgentWorkspaceLiveSession,
} from '../service';

type BusinessCardPreviewTarget = {
  planId?: string;
  planName?: string;
  accountId?: string;
  cbamId?: string;
  certificationAuthType?: CertificationApplyAuthType;
  certificationDetails?: AgentCertificationItem[];
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationDetails'];
  enterpriseCarbonCertificationDraft?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationDraft'];
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewTarget['reviewDetail'];
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewTarget['reviewDetails'];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewTarget['snapshot'];
  messageId?: string;
  reviewDetail?: AgentExpertReviewStatus;
  reviewDetails?: AgentExpertReviewStatus[];
  productId?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  refreshKey?: string;
  shareAuth?: string;
  type?:
    | 'account'
    | 'cbamMonitor'
    | 'cbamReport'
    | 'certification'
    | 'enterpriseCarbonAccounting'
    | 'enterpriseCarbonCertification'
    | 'enterpriseCarbonExpertReview'
    | 'enterpriseCarbonReport'
    | 'expertReview'
    | 'report';
  year?: string;
  enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationPageType'];
  orgId?: string;
  applyNo?: string;
  certificationId?: EnterpriseCarbonCertificationTarget['certificationId'];
};

const THIRD_PARTY_CERTIFICATION_AUTH_TYPE_MAP: Record<
  ThirdPartyCertificationType,
  CertificationApplyAuthType
> = {
  footprint: '0',
  label: '3',
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

type AnswerMessageProps = {
  onMonitorFilesSelect?: (
    files: File[],
    origin?: AgentMonitorMaterialOrigin,
  ) => void;
  answerControls?: AgentAnswerControls;
  blocks: AgentMessageBlock[];
  cards: AgentMessageCard[];
  copyOnly?: boolean;
  enterpriseCarbonReviewCertificationDisabled?: boolean;
  feedback?: AgentMessageFeedback;
  feedbackSource?: AgentFeedbackSource;
  interactionDisabled?: boolean;
  liveWorkspaceOpen?: boolean;
  liveWorkspaceSession?: AgentWorkspaceLiveSession;
  messageId?: string;
  previewOpen?: boolean;
  sessionId?: string;
  shareId?: string;
  showThirdPartyCertification?: boolean;
  showActionsByDefault?: boolean;
  streaming?: boolean;
  toolCalls: AgentToolCall[];
  uploadedAttachments?: AgentChatAttachment[];
  onActionRequestSubmit?: (payload: AgentActionRequestSubmitPayload) => void;
  onErrorFeedback?: () => void;
  onErrorRetry?: () => void;
  onFormRequestSubmit?: (payload: AgentFormRequestSubmitPayload) => void;
  onBusinessCardOpen?: (target: BusinessCardPreviewTarget) => void;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  onOpenAccountingManagement?: () => void;
  onOpenLiveWorkspace?: (session?: AgentWorkspaceLiveSession) => void;
  onOpenPreview?: () => void;
};

type AnswerItem =
  | {
      block: AgentMessageBlock;
      id: string;
      orderNo: number;
      type: 'block';
    }
  | {
      card: AgentMessageCard;
      id: string;
      orderNo: number;
      type: 'card';
    }
  | {
      id: string;
      callCount?: number;
      orderNo: number;
      toolCall: AgentToolCall;
      toolCalls?: AgentToolCall[];
      type: 'toolCall';
    };

type CcdbFactorResult = {
  description?: string;
  factorLevel?: string;
  name?: string;
  no: string;
  organization?: string;
  region?: string;
  specification?: string;
  value?: string;
  year?: string;
};

type CcdbSearchResult = {
  displayCount?: string;
  factors: CcdbFactorResult[];
  totalCount?: string;
};

type SearchEmissionFactorItem = {
  id?: string;
  detailUrl?: string;
  factor?: string;
  name?: string;
  region?: string;
  riskNote?: string;
  unit?: string;
  year?: string;
};

type SearchEmissionFactorResultData = {
  results: SearchEmissionFactorItem[];
};

type NormalFactorSearchItem = {
  applyYear?: string;
  applyYearEnd?: string;
  countries?: string;
  description?: string;
  detailUrl?: string;
  id?: string;
  institution?: string;
  name?: string;
  source?: string;
  sourceName?: string;
  sourceLevel?: string;
  specification?: string;
  unit?: string;
  value?: string;
  verified?: string;
  year?: string;
};

type NormalFactorSearchResultData = {
  displayCount: number;
  rows: NormalFactorSearchItem[];
  totalCount?: string;
};

type SearchKnowledgeItem = {
  riskNote?: string;
  summary?: string;
  title?: string;
};

type SearchKnowledgeResultData = {
  results: SearchKnowledgeItem[];
};

type WebSearchItem = {
  content?: string;
  score?: number;
  title?: string;
  url?: string;
};

type WebSearchResultData = {
  query?: string;
  requestId?: string;
  responseTime?: number;
  results: WebSearchItem[];
};

type WorkspaceArtifactExportResult = {
  artifactId?: string;
  fileId?: string;
  filename: string;
  mime?: string;
  sessionId?: string;
  size?: number;
};

type WorkspaceArtifactResolvedFile = {
  downloadUrl: string;
  filename: string;
  mime?: string;
};

const isUploadedWorkspaceArtifact = (
  result: WorkspaceArtifactExportResult | undefined,
  uploadedFileIds: ReadonlySet<string>,
) => Boolean(result?.fileId && uploadedFileIds.has(result.fileId));

type ToolArtifactPreviewKind =
  | 'image'
  | 'office'
  | 'pdf'
  | 'text'
  | 'unsupported';

type ToolArtifactCodePreviewProps = {
  language?: string;
  value: string;
};

const OFFICE_PREVIEW_URL = 'https://view.officeapps.live.com/op/embed.aspx';
const PDF_PREVIEW_TIMEOUT_MS = 8000;
const OFFICE_PREVIEW_EXTENSIONS = new Set([
  'doc',
  'docx',
  'odp',
  'ods',
  'odt',
  'pps',
  'ppsx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
]);
const IMAGE_PREVIEW_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
]);
const TEXT_PREVIEW_EXTENSIONS = new Set([
  'c',
  'conf',
  'cpp',
  'cs',
  'css',
  'csv',
  'env',
  'go',
  'h',
  'html',
  'ini',
  'java',
  'js',
  'json',
  'jsx',
  'less',
  'log',
  'markdown',
  'md',
  'mjs',
  'py',
  'rs',
  'scss',
  'sh',
  'sql',
  'toml',
  'ts',
  'tsx',
  'txt',
  'xml',
  'yaml',
  'yml',
]);
const TEXT_PREVIEW_MIME_TYPES = new Set([
  'application/javascript',
  'application/json',
  'application/ld+json',
  'application/markdown',
  'application/typescript',
  'application/x-javascript',
  'application/x-ndjson',
  'application/x-sh',
  'application/x-yaml',
  'application/xml',
  'application/yaml',
  'text/markdown',
]);

const LazyCodeMirrorPreview = lazy(async () => {
  const [{ default: CodeMirror }, { markdown }] = await Promise.all([
    import('@uiw/react-codemirror'),
    import('@codemirror/lang-markdown'),
  ]);

  const CodeMirrorTextPreview = ({
    language,
    value,
  }: ToolArtifactCodePreviewProps) => {
    const extensions = language === 'markdown' ? [markdown()] : [];

    return (
      <CodeMirror
        basicSetup={{
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        editable={false}
        extensions={extensions}
        height='280px'
        readOnly
        value={value}
      />
    );
  };

  return { default: CodeMirrorTextPreview };
});

type ActionRequestField = {
  key: string;
  label: string;
  value: string;
  values?: string[];
};

type CbamReportActionRequestArgs = {
  action: 'create' | 'update';
  report: {
    endDate: string;
    factoryId: number;
    include: 0 | 1;
    orgId: number;
    reportName: string;
    startDate: string;
  };
};

type ActionRequestMaterial = {
  id: string;
  mass?: string;
  materialType?: string;
  name: string;
};

type EnterpriseTaskCreateDetail = {
  assigneeName: string;
  categoryName: string;
  dueTime: string;
  id: string;
  orgName: string;
  scopeName: string;
  sourceName: string;
};

const ENTERPRISE_TASK_CREATE_KIND = 'project_enterprise_task_create';
const ENTERPRISE_TASK_TABLE_SCROLL_X = 720;
const ENTERPRISE_TASK_TABLE_SCROLL_Y = 240;
const ENTERPRISE_TASK_TABLE_VISIBLE_ROW_COUNT = 5;

const enterpriseTaskCreateDetailColumns: TableColumnsType<EnterpriseTaskCreateDetail> =
  [
    {
      dataIndex: 'sourceName',
      ellipsis: { showTitle: true },
      key: 'sourceName',
      title: I18N.carbonAgent.actionTaskDetailEmissionSource,
      width: 158,
    },
    {
      dataIndex: 'orgName',
      ellipsis: { showTitle: true },
      key: 'orgName',
      title: I18N.carbonAgent.enterpriseTaskAccountingSubject,
      width: 104,
    },
    {
      dataIndex: 'scopeName',
      ellipsis: { showTitle: true },
      key: 'scopeName',
      title: I18N.carbonAgent.enterpriseTaskScope,
      width: 104,
    },
    {
      dataIndex: 'categoryName',
      ellipsis: { showTitle: true },
      key: 'categoryName',
      title: I18N.carbonAgent.enterpriseTaskCategory,
      width: 104,
    },
    {
      dataIndex: 'assigneeName',
      ellipsis: { showTitle: true },
      key: 'assigneeName',
      title: I18N.carbonAgent.projectTaskAssignee,
      width: 104,
    },
    {
      dataIndex: 'dueTime',
      ellipsis: { showTitle: true },
      key: 'dueTime',
      title: I18N.carbonAgent.enterpriseTaskExpectedCompletionTime,
      width: 146,
    },
  ];

const hasActionRequestLineBreak = (value: string) => /[\r\n]/.test(value);

const renderActionRequestFieldValue = (
  field: ActionRequestField,
  isWideField: boolean,
) => {
  if (field.values?.length) {
    return (
      <span className={style.actionRequestChipList}>
        {field.values.map(value => (
          <span className={style.actionRequestChip} key={value}>
            {value}
          </span>
        ))}
      </span>
    );
  }

  if (hasActionRequestLineBreak(field.value)) {
    return (
      <span className={style.actionRequestMultilineValue}>{field.value}</span>
    );
  }

  if (isWideField) {
    return field.value;
  }

  return (
    <span className={style.actionRequestSummaryValue} title={field.value}>
      {field.value}
    </span>
  );
};

const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

const hasRecordValue = (data: unknown) =>
  Object.keys(asRecord(data)).length > 0;

const getOptionalString = (data: unknown) =>
  typeof data === 'string' && data.trim() ? data.trim() : undefined;

const getOptionalScalarString = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return String(data);
  }

  return undefined;
};

const getOptionalArray = (data: unknown) => (Array.isArray(data) ? data : []);

const cloneRecord = (record: Record<string, unknown>) =>
  JSON.parse(JSON.stringify(record)) as Record<string, unknown>;

const getActionRequestDecisionType = (signal: string) => {
  if (/reject|cancel|拒绝|拒絕|取消/i.test(signal)) {
    return 'reject';
  }

  if (/approve|confirm|确认|確認|执行|執行/i.test(signal)) {
    return 'approve';
  }

  return '';
};

const getFirstInterruptId = (
  payload: Record<string, unknown>,
  requestTemplate?: Record<string, unknown>,
) => {
  const payloadInterrupt = asRecord(getOptionalArray(payload.interrupts)[0]);
  const templateInterrupt = asRecord(
    getOptionalArray(requestTemplate?.interrupts)[0],
  );

  return (
    getOptionalString(payloadInterrupt.id) ||
    getOptionalString(templateInterrupt.id) ||
    getOptionalString(asRecord(payload.rawInterrupt).id) ||
    getOptionalString(asRecord(requestTemplate?.rawInterrupt).id) ||
    getOptionalString(payload.resumeEventId) ||
    getOptionalString(requestTemplate?.resumeEventId)
  );
};

const getCardActions = (card: AgentMessageCard) =>
  Array.isArray(card.card.actions) ? card.card.actions : [];

const isEnterpriseCarbonBusinessCard = (card: AgentMessageCard) => {
  const root = asRecord(card.card);
  const safePayload = asRecord(root.safePayload);
  const nestedCard = asRecord(root.card);
  const safeNestedCard = asRecord(safePayload.card);
  const records = [root, safePayload, nestedCard, safeNestedCard].flatMap(
    source => [
      asRecord(source.extra),
      asRecord(source.bizRef),
      asRecord(source.data),
      asRecord(source.summary),
      asRecord(source.snapshot),
      source,
    ],
  );

  return Boolean(getEnterpriseCarbonBusinessKind(records));
};

const isBusinessCard = (card: AgentMessageCard) =>
  card.cardType === 'business_card' ||
  getOptionalString(card.cardType) === 'cbam2_report' ||
  getOptionalString(card.card.eventType) === 'business_card' ||
  getOptionalString(card.card.cardType) === 'cbam2_report' ||
  getOptionalString(asRecord(card.card.card).cardType) === 'cbam2_report' ||
  getOptionalString(asRecord(card.card.card).cardType) ===
    'product_carbon_model' ||
  isEnterpriseCarbonBusinessCard(card);

const isLegacyProductModelCard = (card: AgentMessageCard) => {
  if (
    isBusinessCard(card) ||
    isActionRequestCard(card) ||
    isFormRequestCard(card) ||
    isErrorCard(card)
  ) {
    return false;
  }

  const cardRecord = card.card;
  const title =
    getOptionalString(cardRecord.title) ||
    getOptionalString(cardRecord.name) ||
    getOptionalString(cardRecord.cardTitle) ||
    '';
  const cardType =
    getOptionalString(card.cardType) ||
    getOptionalString(cardRecord.cardType) ||
    getOptionalString(cardRecord.type) ||
    '';
  const matchedModelCard =
    /碳足迹模型/.test(title) ||
    /product[_-]?carbon[_-]?model|carbon[_-]?model/i.test(cardType);

  if (!matchedModelCard) {
    return false;
  }

  const hasOpenAction = getCardActions(card).some(action => {
    const actionRecord = asRecord(action);
    const actionText =
      getOptionalString(actionRecord.text) ||
      getOptionalString(actionRecord.label) ||
      getOptionalString(actionRecord.name) ||
      '';
    const actionKey =
      getOptionalString(actionRecord.key) ||
      getOptionalString(actionRecord.type) ||
      getOptionalString(actionRecord.action) ||
      '';

    return /查看|打开/.test(actionText) || /open|view/i.test(actionKey);
  });

  return (
    hasOpenAction ||
    cardRecord.bizId !== undefined ||
    cardRecord.accountId !== undefined ||
    cardRecord.bizRef !== undefined
  );
};

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

const getBusinessCardRecords = (businessCard: Record<string, unknown>) => [
  asRecord(businessCard.summary),
  asRecord(businessCard.data),
  asRecord(businessCard.snapshot),
  businessCard,
];

const getBusinessCardValue = (
  records: Record<string, unknown>[],
  keys: string[],
) =>
  records
    .flatMap(record => keys.map(key => getOptionalScalarString(record[key])))
    .find(Boolean);

const getCbamReportId = (records: Record<string, unknown>[]) => {
  const module = getBusinessCardValue(records, [
    'module',
    'bizModule',
    'biz_module',
  ]);
  const cardType = getBusinessCardValue(records, ['cardType', 'card_type']);

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

const getBusinessCardTarget = (
  businessCard: Record<string, unknown>,
  payload?: Record<string, unknown>,
) => {
  const extra = asRecord(businessCard.extra);
  const bizRef = asRecord(businessCard.bizRef);
  const records = [
    extra,
    bizRef,
    asRecord(businessCard.data),
    asRecord(businessCard.summary),
    asRecord(businessCard.snapshot),
    businessCard,
    asRecord(payload),
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
  const reportId = getBusinessCardValue(records, [
    'reportId',
    'report_id',
    'bizId',
    'biz_id',
    'id',
  ]);
  const bizType = getBusinessCardValue(records, ['bizType', 'biz_type']);
  const cardType = getBusinessCardValue(records, ['cardType', 'card_type']);
  const reportName = getBusinessCardValue(records, [
    'reportName',
    'report_name',
    'name',
  ]);
  const shareAuth = getBusinessCardValue(records, ['shareAuth', 'share_auth']);
  const cbamId = getCbamReportId(records);

  if (cbamId) {
    return {
      cbamId,
      type: 'cbamReport' as const,
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
      productId: getBusinessCardValue(records, ['productId', 'product_id']),
      reportId,
      reportName,
      reportUrl,
      shareAuth,
      type: 'report' as const,
    };
  }

  const accountId = getBusinessCardValue(records, [
    'accountId',
    'account_id',
    'bizId',
    'biz_id',
    'id',
  ]);

  if (!accountId) {
    return undefined;
  }

  return {
    accountId,
    productId: getBusinessCardValue(records, ['productId', 'product_id']),
    shareAuth,
    type: 'account' as const,
  };
};

const getBusinessCardRefreshKey = (
  card: AgentMessageCard,
  target?: BusinessCardPreviewTarget,
) =>
  [
    card.messageId,
    card.orderNo,
    card.cardType,
    target?.type,
    target?.accountId,
    target?.cbamId,
    target?.productId,
    target?.reportId,
    target?.reportUrl,
    target?.enterpriseCarbonBizType,
    target?.enterpriseCarbonBizId,
    target?.year,
    target?.enterpriseCarbonFiles
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
  ]
    .filter(value => value !== undefined && value !== null && value !== '')
    .join('|');

const getBusinessCardLifecycleLabel = (records: Record<string, unknown>[]) => {
  const lifecycleLabel = getBusinessCardValue(records, [
    'lifecycleScope',
    'lifecycleStageNames',
    'lifeCycle',
    'lifecycle',
    'lifeCycleName',
    'lifecycleName',
    'life_cycle',
    'scopeName',
    'scope_name',
    'boundaryName',
    'boundary_name',
  ]);

  if (lifecycleLabel) {
    return lifecycleLabel;
  }

  const startTime = getBusinessCardValue(records, [
    'startTime',
    'start_time',
    'startDate',
    'start_date',
    'periodStart',
    'period_start',
  ]);
  const endTime = getBusinessCardValue(records, [
    'endTime',
    'end_time',
    'endDate',
    'end_date',
    'periodEnd',
    'period_end',
  ]);

  if (startTime || endTime) {
    return `${startTime || '-'} - ${endTime || '-'}`;
  }

  return '-';
};

const getBusinessCardMetricText = (value?: string, unit?: string) => {
  if (!value) {
    return I18N.carbonAgent.toBeCalculated;
  }

  return unit ? `${value} ${unit}` : value;
};

const formatExpertReviewSnapshotTime = (value?: string) => {
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

const getPrepareReviewStatusDetail = (
  prepareInfo?: AgentExpertReviewPrepareInfo | null,
  fallbackObjectType?: AgentExpertReviewObjectType,
): AgentExpertReviewStatus | null => {
  const reviewStatus = prepareInfo?.status?.reviewStatus;

  if (!reviewStatus || reviewStatus === 'not_submitted') {
    return null;
  }

  return {
    accountId: prepareInfo.status?.accountId || prepareInfo.accountId,
    accountName: prepareInfo.accountName,
    completeTime: prepareInfo.status?.reviewCompleteTime,
    createTime: prepareInfo.status?.reviewCreateTime,
    emissionUnit: prepareInfo.emissionUnit,
    functionalUnit: prepareInfo.functionalUnit,
    objectType: prepareInfo.objectType || fallbackObjectType,
    pointCost: prepareInfo.pointCost,
    productName: prepareInfo.productName,
    reportId: prepareInfo.status?.reportId || prepareInfo.reportId,
    reviewId: prepareInfo.status?.reviewId,
    reviewNo: prepareInfo.status?.reviewNo,
    status: reviewStatus,
    statusName: prepareInfo.status?.reviewStatusName,
    totalEmission: prepareInfo.totalEmission,
  };
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
  accountId?: string;
  objectType: AgentExpertReviewObjectType;
  prepareInfo?: AgentExpertReviewPrepareInfo | null;
  reportId?: string;
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

const decodePercentEncodedSegments = (value: string) =>
  value.replace(/(?:%[0-9a-f]{2})+/gi, segment => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

const decodeUrlEncodedText = (value?: string) => {
  let decoded = value?.trim() || '';

  for (let index = 0; index < 3 && /%[0-9a-f]{2}/i.test(decoded); index += 1) {
    const nextDecoded = decodePercentEncodedSegments(decoded);

    if (nextDecoded === decoded) {
      break;
    }

    decoded = nextDecoded;
  }

  return decoded;
};

const getReportDownloadName = (reportUrl: string, reportName?: string) => {
  if (reportName) {
    const decodedReportName = decodeUrlEncodedText(reportName);

    return /\.[a-z0-9]+$/i.test(decodedReportName)
      ? decodedReportName
      : `${decodedReportName}.docx`;
  }

  const rawName = reportUrl.split('?')[0].split('/').pop();

  if (!rawName) {
    return I18N.carbonAgent.reportFileNameDefault;
  }

  return decodeUrlEncodedText(rawName);
};

const removeOnlineWordLabel = (value?: string) =>
  value?.replace(/（在线\s*Word）|\(在线\s*Word\)/gi, '').trim() || '';

const getReportCardTitle = ({
  accountName,
  reportName,
  title,
}: {
  accountName?: string;
  reportName?: string;
  title?: string;
}) => {
  const baseTitle =
    removeOnlineWordLabel(decodeUrlEncodedText(reportName)) ||
    removeOnlineWordLabel(decodeUrlEncodedText(title)) ||
    I18N.carbonAgent.productFootprintReport;
  const titleWithAccountName =
    accountName && !baseTitle.includes(accountName)
      ? `${accountName} ${baseTitle}`
      : baseTitle;

  return `${titleWithAccountName}${I18N.carbonAgent.onlineWordSuffix}`;
};

const getExpertReviewStatusParams = ({
  accountId,
  isReportCard,
  reportId,
}: {
  accountId?: string;
  isReportCard: boolean;
  reportId?: string;
}): AgentExpertReviewStatusParams | undefined => {
  if (isReportCard) {
    if (!accountId && !reportId) {
      return undefined;
    }

    return {
      accountId,
      // objectType: 'report',
      // reportId,
    };
  }

  if (!accountId) {
    return undefined;
  }

  return {
    accountId,
    // objectType: 'account',
  };
};

const BusinessCard = ({
  card,
  interactionDisabled = false,
  messageId: parentMessageId,
  onOpen,
  onOpenAccountingManagement,
  showThirdPartyCertification = true,
}: {
  card: AgentMessageCard;
  interactionDisabled?: boolean;
  messageId?: string;
  onOpen?: (target: BusinessCardPreviewTarget) => void;
  onOpenAccountingManagement?: () => void;
  showThirdPartyCertification?: boolean;
}) => {
  const [expertReviewOpen, setExpertReviewOpen] = useState(false);
  const [thirdPartyCertificationOpen, setThirdPartyCertificationOpen] =
    useState(false);
  const [reviewPurpose, setReviewPurpose] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewStatusDetail, setReviewStatusDetail] =
    useState<AgentExpertReviewStatus | null>(null);
  const [reviewPrepareInfo, setReviewPrepareInfo] =
    useState<AgentExpertReviewPrepareInfo | null>(null);
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);
  const [certificationListLoading, setCertificationListLoading] =
    useState(false);
  const payload = getBusinessCardPayload(card);
  const businessCard = getBusinessCardData(payload);
  const records = getBusinessCardRecords(businessCard);
  const contextRecords = [
    asRecord(businessCard.extra),
    asRecord(businessCard.bizRef),
    ...records,
    payload,
  ];
  const productName =
    getBusinessCardValue(records, ['productName', 'name']) ||
    I18N.carbonAgent.productDefault;
  const accountName = getBusinessCardValue(records, [
    'accountName',
    'account_name',
  ]);
  const functionalUnit =
    getBusinessCardValue(records, ['functionalUnit', 'functional_unit']) ||
    I18N.carbonAgent.functionalUnitDefault;
  const lifecycleLabel = getBusinessCardLifecycleLabel(records);
  const unit = 'kgCO₂e';
  const totalEmission = getBusinessCardValue(records, [
    'emissionTotal',
    'totalEmission',
    'carbonFootprint',
    'estimatedEmission',
    'total',
  ]);
  const title =
    getOptionalString(businessCard.title) ||
    I18N.template(I18N.carbonAgent.modelTitleFormat, { val1: productName });
  const messageId =
    card.messageId ||
    getBusinessCardValue(contextRecords, ['messageId', 'message_id']) ||
    parentMessageId;
  const rawTarget = getBusinessCardTarget(businessCard, payload);
  const target = rawTarget
    ? {
        ...rawTarget,
        messageId,
        refreshKey: getBusinessCardRefreshKey(card, rawTarget),
      }
    : undefined;
  const canOpen = Boolean(target && onOpen);
  const isReportCard = target?.type === 'report';
  const isCbamReportCard = target?.type === 'cbamReport';
  const accountId =
    target?.accountId ||
    getBusinessCardValue(contextRecords, ['accountId', 'bizId', 'id']);
  const projectId = getBusinessCardValue(contextRecords, [
    'projectId',
    'project_id',
  ]);
  const reportId = getBusinessCardValue(contextRecords, [
    'reportId',
    'report_id',
  ]);
  const sessionId = getBusinessCardValue(contextRecords, [
    'sessionId',
    'session_id',
  ]);
  const snapshotVersion =
    getBusinessCardValue(contextRecords, [
      'version',
      'versionName',
      'modelVersion',
      'snapshotVersion',
    ]) || 'v1.0';
  const snapshotUpdateTime = formatExpertReviewSnapshotTime(
    getBusinessCardValue(contextRecords, [
      'updateTime',
      'updatedAt',
      'modelUpdateTime',
      'snapshotTime',
      'createTime',
      'createdAt',
    ]),
  );
  const reportTitle = getReportCardTitle({
    accountName,
    reportName: target?.reportName,
    title,
  });
  const reportDownloadName =
    isReportCard && target?.reportUrl
      ? getReportDownloadName(target.reportUrl, target.reportName)
      : undefined;
  const reviewObjectType = isReportCard ? 'report' : 'account';
  useEffect(() => {
    if (interactionDisabled) {
      setReviewStatusDetail(null);
      setReviewPrepareInfo(null);
      return undefined;
    }

    const statusParams = getExpertReviewStatusParams({
      accountId,
      isReportCard,
      reportId,
    });

    if (!statusParams) {
      setReviewStatusDetail(null);
      setReviewPrepareInfo(null);
      return undefined;
    }

    const abortCtrl = new AbortController();

    fetchAgentExpertReviewStatus(statusParams, abortCtrl.signal)
      .then(detail => {
        if (abortCtrl.signal.aborted) {
          return;
        }

        setReviewStatusDetail(
          canOpenExpertReviewDetail(detail) ? detail : null,
        );
      })
      .catch(() => {
        if (!abortCtrl.signal.aborted) {
          setReviewStatusDetail(null);
        }
      });

    return () => abortCtrl.abort();
  }, [accountId, interactionDisabled, isReportCard, reportId]);

  const handleOpen = () => {
    if (target && onOpen) {
      onOpen(target);
    }
  };

  const handleOpenAccountingManagement = () => {
    if (onOpenAccountingManagement) {
      onOpenAccountingManagement();
      return;
    }

    handleOpen();
  };

  const stopReportActionPropagation = (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };

  const handleOpenExpertReview = async () => {
    if (interactionDisabled) {
      return;
    }

    const statusParams = getExpertReviewStatusParams({
      accountId,
      isReportCard,
      reportId,
    });

    if (!statusParams) {
      antdMessage.warning(I18N.carbonAgent.expertReviewMissingAccount);
      return;
    }

    setReviewStatusLoading(true);
    setReviewPrepareInfo(null);
    try {
      const reviewDetails = await fetchAgentExpertReviewList(statusParams);
      const reviewDetail = reviewDetails[0] || null;
      const hasReviewDetail = reviewDetails.length > 0;

      setReviewStatusDetail(
        hasReviewDetail && canOpenExpertReviewDetail(reviewDetail)
          ? reviewDetail
          : null,
      );

      if (hasReviewDetail && onOpen) {
        onOpen({
          accountId,
          messageId,
          productId: target?.productId,
          reportId,
          reportName: target?.reportName,
          reportUrl: target?.reportUrl,
          reviewDetail: reviewDetail || undefined,
          reviewDetails,
          type: 'expertReview',
        });
        return;
      }

      const prepareInfo = await prepareAgentExpertReview({
        accountId,
        objectType: reviewObjectType,
        reportId: isReportCard ? reportId : undefined,
      });
      const prepareStatusDetail = getPrepareReviewStatusDetail(
        prepareInfo,
        reviewObjectType,
      );

      setReviewPrepareInfo(prepareInfo);
      setReviewStatusDetail(
        prepareStatusDetail && canOpenExpertReviewDetail(prepareStatusDetail)
          ? prepareStatusDetail
          : null,
      );
      setReviewPurpose('');
      setExpertReviewOpen(true);
    } catch {
      antdMessage.error(I18N.carbonAgent.expertReviewStatusLoadFailed);
    } finally {
      setReviewStatusLoading(false);
    }
  };

  const handleCloseExpertReview = () => {
    if (!reviewSubmitting) {
      setExpertReviewOpen(false);
    }
  };

  const handleOpenThirdPartyCertification = async () => {
    if (interactionDisabled) {
      return;
    }

    if (!accountId) {
      antdMessage.warning(
        I18N.carbonAgent.thirdPartyCertificationMissingAccount,
      );
      return;
    }

    setCertificationListLoading(true);
    try {
      const certificationItems = await fetchAgentCertificationList({
        accountId,
      });
      const certificationItem = certificationItems[0];

      if (certificationItem && onOpen) {
        onOpen({
          accountId,
          certificationAuthType:
            getCertificationApplyAuthTypeFromItem(certificationItem),
          certificationDetails: certificationItems,
          messageId,
          productId: target?.productId,
          reportId,
          reportName: target?.reportName,
          reportUrl: target?.reportUrl,
          type: 'certification',
        });
        return;
      }

      setThirdPartyCertificationOpen(true);
    } catch {
      antdMessage.error(
        I18N.carbonAgent.thirdPartyCertificationStatusLoadFailed,
      );
    } finally {
      setCertificationListLoading(false);
    }
  };

  const handleCloseThirdPartyCertification = () => {
    setThirdPartyCertificationOpen(false);
  };

  const handleThirdPartyCertificationSubmit = (
    certificationType: ThirdPartyCertificationType,
  ) => {
    if (interactionDisabled) {
      return;
    }

    const certificationAuthType =
      THIRD_PARTY_CERTIFICATION_AUTH_TYPE_MAP[certificationType];

    setThirdPartyCertificationOpen(false);
    onOpen?.({
      accountId,
      certificationAuthType,
      messageId,
      productId: target?.productId,
      reportId,
      reportName: target?.reportName,
      reportUrl: target?.reportUrl,
      type: 'certification',
    });
  };

  const expertReviewButtonLabel = reviewStatusLoading
    ? I18N.carbonAgent.expertReviewChecking
    : getExpertReviewButtonLabel(reviewStatusDetail);
  const thirdPartyCertificationButtonLabel = certificationListLoading
    ? I18N.carbonAgent.thirdPartyCertificationChecking
    : I18N.carbonAgent.thirdPartyCertification;

  const handleExpertReviewSubmit = async () => {
    if (interactionDisabled) {
      return;
    }

    const statusParams = getExpertReviewStatusParams({
      accountId,
      isReportCard,
      reportId,
    });

    if (!statusParams) {
      antdMessage.warning(I18N.carbonAgent.expertReviewMissingAccount);
      return;
    }

    if (reviewPrepareInfo?.canApply === false) {
      if (reviewPrepareInfo.disabledReason?.trim()) {
        antdMessage.warning(reviewPrepareInfo.disabledReason.trim());
      }
      return;
    }

    setReviewSubmitting(true);
    try {
      const preparedObjectType = getPreparedReviewObjectType(
        reviewPrepareInfo,
        reviewObjectType,
      );

      await applyAgentExpertReview({
        accountId,
        messageId,
        objectType: preparedObjectType,
        projectId,
        reportId,
        reviewFocus: DEFAULT_EXPERT_REVIEW_FOCUS,
        reviewPurpose:
          reviewPurpose.trim() || I18N.carbonAgent.expertReviewDefaultPurpose,
        sessionId,
      });
      antdMessage.success(I18N.carbonAgent.expertReviewApplySuccess);
      const fallbackReviewDetail = getSubmittedExpertReviewFallbackDetail({
        accountId,
        objectType: preparedObjectType,
        prepareInfo: reviewPrepareInfo,
        reportId,
      });
      const refreshedReviewDetails = await fetchAgentExpertReviewList(
        statusParams,
      ).catch(() => []);
      const nextReviewDetails = refreshedReviewDetails.length
        ? refreshedReviewDetails
        : [fallbackReviewDetail];
      const nextReviewDetail = nextReviewDetails[0] || fallbackReviewDetail;

      setReviewPrepareInfo(null);
      setReviewStatusDetail(
        canOpenExpertReviewDetail(nextReviewDetail)
          ? nextReviewDetail
          : fallbackReviewDetail,
      );
      setExpertReviewOpen(false);
      setReviewPurpose('');
      onOpen?.({
        accountId,
        messageId,
        productId: target?.productId,
        reportId,
        reportName: target?.reportName,
        reportUrl: target?.reportUrl,
        reviewDetail: nextReviewDetail,
        reviewDetails: nextReviewDetails,
        type: 'expertReview',
      });
    } catch {
      antdMessage.error(I18N.carbonAgent.expertReviewApplyFailed);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReportKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!canOpen) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  if (isCbamReportCard) {
    return (
      <ReportResultCard
        title={title}
        notice={I18N.carbonAgent.cbamReportGenerated}
        hint={I18N.carbonAgent.cbamReportPreviewHint}
        viewLabel={I18N.carbonAgent.viewCbamReport}
        disabled={!canOpen}
        onOpen={handleOpen}
      />
    );
  }

  if (isReportCard) {
    return (
      <div
        className={classNames(style.businessCard, style.reportBusinessCard)}
        aria-label={I18N.carbonAgent.reportCardLabel}
        aria-disabled={!canOpen}
        data-disabled={!canOpen || undefined}
        role='button'
        tabIndex={canOpen ? 0 : -1}
        onClick={canOpen ? handleOpen : undefined}
        onKeyDown={handleReportKeyDown}
      >
        <div className={style.businessCardNotice}>
          <span className={style.businessCardSuccessIcon} aria-hidden='true' />
          <span>{I18N.carbonAgent.onlineWordReportGenerated}</span>
        </div>
        <div className={style.reportBusinessCardPanel}>
          <div className={style.reportBusinessCardCopy}>
            <strong className={style.businessCardTitle}>{reportTitle}</strong>
            <p className={style.reportBusinessCardHint}>
              {I18N.carbonAgent.reportPreviewHint}
            </p>
          </div>
          <div className={style.reportBusinessCardActions}>
            <button
              className={style.reportBusinessCardButton}
              disabled={!canOpen}
              type='button'
              onClick={event => {
                stopReportActionPropagation(event);
                handleOpen();
              }}
            >
              {I18N.carbonAgent.viewReport}
            </button>
            {target?.reportUrl ? (
              <a
                className={style.reportBusinessCardButton}
                download={reportDownloadName}
                href={target.reportUrl}
                rel='noreferrer'
                target='_blank'
                onClick={stopReportActionPropagation}
              >
                {I18N.carbonAgent.download}
              </a>
            ) : null}
          </div>
        </div>
        <div
          className={classNames(
            style.businessCardCertification,
            style.reportBusinessCardCertification,
          )}
          onClick={event => event.stopPropagation()}
        >
          <div className={style.businessCardCertificationCopy}>
            <strong>{I18N.carbonAgent.reviewAndCertification}</strong>
            <span>{I18N.carbonAgent.reviewAndCertificationHint}</span>
          </div>
          <div className={style.businessCardCertificationActions}>
            <button
              className={classNames(
                style.businessCardActionButton,
                style.businessCardActionButtonPrimary,
              )}
              disabled={interactionDisabled || reviewStatusLoading}
              type='button'
              onClick={handleOpenExpertReview}
            >
              {expertReviewButtonLabel}
            </button>
            {showThirdPartyCertification ? (
              <button
                className={classNames(
                  style.businessCardActionButton,
                  style.businessCardActionButtonSecondary,
                )}
                disabled={interactionDisabled || certificationListLoading}
                type='button'
                onClick={handleOpenThirdPartyCertification}
              >
                {thirdPartyCertificationButtonLabel}
              </button>
            ) : null}
          </div>
        </div>
        <ReviewCertificationModals
          expertReviewCanApply={reviewPrepareInfo?.canApply}
          expertReviewDisabledReason={reviewPrepareInfo?.disabledReason}
          expertReviewOpen={expertReviewOpen}
          expertReviewPointCost={reviewPrepareInfo?.pointCost}
          reviewPurpose={reviewPurpose}
          reviewSubmitting={reviewSubmitting}
          snapshotUpdateTime={formatExpertReviewSnapshotTime(
            reviewPrepareInfo?.modelUpdateTime || snapshotUpdateTime,
          )}
          snapshotVersion={snapshotVersion}
          thirdPartyCertificationOpen={
            showThirdPartyCertification && thirdPartyCertificationOpen
          }
          onCloseExpertReview={handleCloseExpertReview}
          onCloseThirdPartyCertification={handleCloseThirdPartyCertification}
          onExpertReviewSubmit={handleExpertReviewSubmit}
          onReviewPurposeChange={setReviewPurpose}
          onThirdPartyCertificationSubmit={handleThirdPartyCertificationSubmit}
        />
      </div>
    );
  }

  return (
    <section
      className={style.businessCard}
      aria-label={I18N.carbonAgent.modelCardLabel}
    >
      <div className={style.businessCardNotice}>
        <span className={style.businessCardSuccessIcon} aria-hidden='true' />
        <span>{I18N.carbonAgent.modelCreatedNotice}</span>
      </div>
      <div className={style.businessCardPanel}>
        <button
          className={style.businessCardModelButton}
          disabled={!canOpen}
          type='button'
          onClick={handleOpen}
        >
          <div className={style.businessCardHead}>
            <strong className={style.businessCardTitle}>{title}</strong>
          </div>
          <div className={style.businessCardMeta}>
            <span>
              {I18N.carbonAgent.lifeCycleColon}
              {lifecycleLabel}
            </span>
            <span>
              {I18N.carbonAgent.functionalUnitColon}
              {functionalUnit}
            </span>
          </div>
          <div className={style.businessCardMetric}>
            <span>{I18N.carbonAgent.estimatedTotalFootprint}</span>
            <strong>{getBusinessCardMetricText(totalEmission, unit)}</strong>
          </div>
        </button>
        <div className={style.businessCardManagementHint}>
          <span>{I18N.carbonAgent.accountingManagementHintPrefix}</span>
          <button
            className={style.businessCardTextButton}
            disabled={
              interactionDisabled || (!onOpenAccountingManagement && !canOpen)
            }
            type='button'
            onClick={handleOpenAccountingManagement}
          >
            {I18N.carbonAgent.accountingManagement}
          </button>
          <span>{I18N.carbonAgent.accountingManagementHintSuffix}</span>
        </div>
      </div>
      <div className={style.businessCardCertification}>
        <div className={style.businessCardCertificationCopy}>
          <strong>{I18N.carbonAgent.reviewAndCertification}</strong>
          <span>{I18N.carbonAgent.reviewAndCertificationHint}</span>
        </div>
        <div className={style.businessCardCertificationActions}>
          <button
            className={classNames(
              style.businessCardActionButton,
              style.businessCardActionButtonPrimary,
            )}
            disabled={interactionDisabled || reviewStatusLoading}
            type='button'
            onClick={handleOpenExpertReview}
          >
            {expertReviewButtonLabel}
          </button>
          {showThirdPartyCertification ? (
            <button
              className={classNames(
                style.businessCardActionButton,
                style.businessCardActionButtonSecondary,
              )}
              disabled={interactionDisabled || certificationListLoading}
              type='button'
              onClick={handleOpenThirdPartyCertification}
            >
              {thirdPartyCertificationButtonLabel}
            </button>
          ) : null}
        </div>
      </div>
      <ReviewCertificationModals
        expertReviewCanApply={reviewPrepareInfo?.canApply}
        expertReviewDisabledReason={reviewPrepareInfo?.disabledReason}
        expertReviewOpen={expertReviewOpen}
        expertReviewPointCost={reviewPrepareInfo?.pointCost}
        reviewPurpose={reviewPurpose}
        reviewSubmitting={reviewSubmitting}
        snapshotUpdateTime={formatExpertReviewSnapshotTime(
          reviewPrepareInfo?.modelUpdateTime || snapshotUpdateTime,
        )}
        snapshotVersion={snapshotVersion}
        thirdPartyCertificationOpen={
          showThirdPartyCertification && thirdPartyCertificationOpen
        }
        onCloseExpertReview={handleCloseExpertReview}
        onCloseThirdPartyCertification={handleCloseThirdPartyCertification}
        onExpertReviewSubmit={handleExpertReviewSubmit}
        onReviewPurposeChange={setReviewPurpose}
        onThirdPartyCertificationSubmit={handleThirdPartyCertificationSubmit}
      />
    </section>
  );
};

const getActionRequestPayload = (card: AgentMessageCard) => {
  const cardRecord = asRecord(card.card);
  const safePayload = asRecord(cardRecord.safePayload);

  return {
    ...safePayload,
    ...cardRecord,
  };
};

const getActionRequests = (payload: Record<string, unknown>) =>
  Array.isArray(payload.actionRequests)
    ? payload.actionRequests.map(asRecord)
    : [];

const getDisplayActionRequests = (payload: Record<string, unknown>) =>
  Array.isArray(payload.displayActionRequests)
    ? payload.displayActionRequests.map(asRecord)
    : [];

const getActionRequestResumeRequest = (payload: Record<string, unknown>) =>
  asRecord(payload.resumeRequest);

const getActionRequestActions = (payload: Record<string, unknown>) => {
  if (Array.isArray(payload.actions) && payload.actions.length) {
    return payload.actions.map(asRecord).reverse();
  }

  const resumeRequest = getActionRequestResumeRequest(payload);
  const approveRequest = asRecord(resumeRequest.approve);
  const rejectRequest = asRecord(resumeRequest.reject);
  const actions: Record<string, unknown>[] = [];

  if (hasRecordValue(rejectRequest)) {
    actions.push({
      key: 'reject_action_request',
      label:
        getOptionalString(rejectRequest.message) ||
        I18N.carbonAgent.rejectExecution,
    });
  }

  if (hasRecordValue(approveRequest)) {
    actions.push({
      key: 'approve_action_request',
      label:
        getOptionalString(approveRequest.message) ||
        I18N.carbonAgent.confirmExecution,
    });
  }

  return actions;
};

const getActionRequestTitle = () => I18N.carbonAgent.needConfirmExecution;

const getActionRequestMessage = (payload: Record<string, unknown>) => {
  const message = getOptionalString(payload.message);

  if (!message) {
    return '';
  }

  if (/Tool execution requires approval/i.test(message)) {
    return I18N.carbonAgent.systemWillExecuteTool;
  }

  return message.split('\n').find(line => line.trim()) || message;
};

const ACTION_REQUEST_STATUS_LABELS = createI18nLabelMap<string, string>({
  NEED_USER_INPUT: () => I18N.carbonAgent.statusToSupplement,
  WAIT_CONFIRM: () => I18N.carbonAgent.statusToConfirm,
});

const getActionRequestStatusLabel = (status?: string) =>
  status ? ACTION_REQUEST_STATUS_LABELS[status] || status : '';

const getActionRequestInitialCollapsed = (payload: Record<string, unknown>) =>
  Boolean(
    payload.collapsed ||
      payload.defaultCollapsed ||
      payload.actionCollapsed ||
      payload.actionSubmitted ||
      payload.submitted,
  );

const getActionRequestSubmitPayload = (
  action: Record<string, unknown>,
  payload: Record<string, unknown>,
): AgentActionRequestSubmitPayload => {
  const actionLabel = getOptionalString(action.label) || '';
  const actionKey =
    getOptionalString(action.key) ||
    getOptionalString(action.action) ||
    actionLabel;
  const actionSignal = `${actionKey} ${actionLabel}`;
  const resumeRequest = getActionRequestResumeRequest(payload);
  const decisionType = getActionRequestDecisionType(actionSignal);
  const requestTemplate = asRecord(
    decisionType === 'approve'
      ? resumeRequest.approve
      : decisionType === 'reject'
      ? resumeRequest.reject
      : {},
  );
  const hasRequestTemplate = hasRecordValue(requestTemplate);
  const interruptId = getFirstInterruptId(payload, requestTemplate);
  const message =
    actionLabel ||
    getOptionalString(requestTemplate.message) ||
    actionKey ||
    I18N.carbonAgent.continueAction;

  if (hasRequestTemplate) {
    return cloneRecord(requestTemplate);
  }

  const resumeValue =
    decisionType === 'reject'
      ? {
          decisions: [
            {
              message: I18N.carbonAgent.userCancelledExecution,
              type: 'reject',
            },
          ],
        }
      : {
          decisions: [
            {
              type: decisionType || 'approve',
            },
          ],
        };

  return {
    action: actionKey,
    checkpoint: payload.checkpoint,
    message,
    resumeData: interruptId
      ? {
          [interruptId]: resumeValue,
        }
      : resumeValue,
    resumeEventId: interruptId,
  };
};

const ACTION_VALUE_LABELS = createI18nLabelMap<string, string>({
  'cradle-to-gate': () => I18N.carbonAgent.cradleToGate,
  'cradle-to-grave': () => I18N.carbonAgent.cradleToGrave,
  cradle_to_gate: () => I18N.carbonAgent.cradleToGate,
  cradle_to_grave: () => I18N.carbonAgent.cradleToGrave,
  large_scale: () => I18N.carbonAgent.largeScale,
  medium_scale: () => I18N.carbonAgent.mediumScale,
  small_scale: () => I18N.carbonAgent.smallScale,
});

const formatActionPrimitive = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value ? I18N.carbonAgent.yes : I18N.carbonAgent.no;
  }

  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  return ACTION_VALUE_LABELS[stringValue] || stringValue;
};

const stringifyActionValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        const itemRecord = asRecord(item);

        return (
          getOptionalString(itemRecord.name) || formatActionPrimitive(item)
        );
      })
      .filter(Boolean)
      .join('、');
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return formatActionPrimitive(value);
};

const getActionRequestSource = (actionRequest: Record<string, unknown>) => {
  const args = asRecord(actionRequest.args);
  const input = asRecord(args.input);

  return Object.keys(input).length ? input : args;
};

const getCbamActionRequestSummary = (
  actionRequest: Record<string, unknown>,
): { fields: ActionRequestField[]; name: string } | undefined => {
  if (actionRequest.name !== 'agent_cbam_report_save') {
    return undefined;
  }

  const { action, report } = actionRequest.args as CbamReportActionRequestArgs;
  const fields: ActionRequestField[] = [
    {
      key: 'reportName',
      label: I18N.carbonAgent.cbamActionReportName,
      value: report.reportName,
    },
    {
      key: 'reportPeriod',
      label: I18N.carbonAgent.cbamActionReportPeriod,
      value: `${report.startDate} 至 ${report.endDate}`,
    },
    {
      key: 'include',
      label: I18N.carbonAgent.cbamActionIncludeHeatPower,
      value: report.include === 0 ? I18N.carbonAgent.yes : I18N.carbonAgent.no,
    },
  ];

  return {
    fields,
    name:
      action === 'update'
        ? I18N.carbonAgent.cbamActionUpdateReport
        : I18N.carbonAgent.cbamActionCreateReport,
  };
};

const getActionPrimitiveValues = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map(item =>
          ['boolean', 'number', 'string'].includes(typeof item)
            ? formatActionPrimitive(item)
            : '',
        )
        .filter(Boolean)
    : [];

const ACTION_FIELD_LABELS = createI18nLabelMap<string, string>({
  action: () => I18N.carbonAgent.actionFieldAction,
  content: () => I18N.carbonAgent.actionFieldContent,
  draft: () => I18N.carbonAgent.actionFieldDraft,
  functionalUnit: () => I18N.carbonAgent.functionalUnit,
  lifecycleScope: () => I18N.carbonAgent.actionFieldLifecycleScope,
  lifeCycleStages: () => I18N.carbonAgent.actionFieldLifeCycleStages,
  productDescription: () => I18N.carbonAgent.actionFieldProductDescription,
  productName: () => I18N.carbonAgent.actionFieldProductName,
  productionRegion: () => I18N.carbonAgent.actionFieldProductionRegion,
  productionScale: () => I18N.carbonAgent.actionFieldProductionScale,
  standards: () => I18N.carbonAgent.actionFieldStandards,
  systemBoundary: () => I18N.carbonAgent.actionFieldSystemBoundary,
});

const getActionFieldLabel = (key: string) => ACTION_FIELD_LABELS[key] || key;

const ACTION_FIELD_ORDER = [
  'productName',
  'functionalUnit',
  'systemBoundary',
  'lifecycleScope',
  'productionRegion',
  'productionScale',
  'standards',
  'lifeCycleStages',
  'action',
  'draft',
  'content',
  'productDescription',
];

const getActionRequestFields = (
  source: Record<string, unknown>,
): ActionRequestField[] =>
  Object.entries(source)
    .filter(([key]) => key !== 'materials')
    .map(([key, value]) => {
      const values = getActionPrimitiveValues(value);

      return {
        key,
        label: getActionFieldLabel(key),
        value: values.length ? values.join('、') : stringifyActionValue(value),
        values: values.length ? values : undefined,
      };
    })
    .filter(item => item.value)
    .sort((prev, next) => {
      const prevIndex = ACTION_FIELD_ORDER.indexOf(prev.key);
      const nextIndex = ACTION_FIELD_ORDER.indexOf(next.key);

      return (
        (prevIndex === -1 ? ACTION_FIELD_ORDER.length : prevIndex) -
        (nextIndex === -1 ? ACTION_FIELD_ORDER.length : nextIndex)
      );
    });

const getDisplayActionFieldValue = (field: Record<string, unknown>) => {
  const { displayValue } = field;

  if (Array.isArray(displayValue)) {
    return displayValue.map(formatActionPrimitive).filter(Boolean).join('、');
  }

  if (
    displayValue &&
    typeof displayValue === 'object' &&
    Object.keys(asRecord(displayValue)).length
  ) {
    return stringifyActionValue(displayValue);
  }

  return formatActionPrimitive(displayValue);
};

const getDisplayActionRequestFields = (
  displayActionRequest: Record<string, unknown>,
): ActionRequestField[] =>
  Array.isArray(displayActionRequest.fields)
    ? displayActionRequest.fields
        .map((field, index) => {
          const fieldRecord = asRecord(field);
          const key =
            getOptionalString(fieldRecord.key) || `display-field-${index}`;
          const label = getOptionalString(fieldRecord.label) || key;
          const value = getDisplayActionFieldValue(fieldRecord);

          return {
            key,
            label,
            value,
          };
        })
        .filter(field => field.value)
    : [];

const getEnterpriseTaskCreateDetails = (
  actionRequest: Record<string, unknown>,
): EnterpriseTaskCreateDetail[] => {
  if (
    getOptionalString(actionRequest.kind) !== ENTERPRISE_TASK_CREATE_KIND ||
    !Array.isArray(actionRequest.items)
  ) {
    return [];
  }

  return actionRequest.items.map((item, index) => {
    const itemRecord = asRecord(item);
    const sourceName = getOptionalScalarString(itemRecord.sourceName) || '-';

    return {
      assigneeName: getOptionalScalarString(itemRecord.assigneeName) || '-',
      categoryName:
        getOptionalScalarString(itemRecord.categoryName) ||
        getOptionalScalarString(itemRecord.categoryNameRaw) ||
        '-',
      dueTime: getOptionalScalarString(itemRecord.dueTime) || '-',
      id: `${
        getOptionalScalarString(itemRecord.index) || String(index + 1)
      }-${sourceName}`,
      orgName: getOptionalScalarString(itemRecord.orgName) || '-',
      scopeName:
        getOptionalScalarString(itemRecord.scopeName) ||
        getOptionalScalarString(itemRecord.scopeNameRaw) ||
        '-',
      sourceName,
    };
  });
};

const EnterpriseTaskCreateDetailTable = ({
  items,
}: {
  items: EnterpriseTaskCreateDetail[];
}) => (
  <div className={style.actionRequestEnterpriseTaskTableWrap}>
    <Table<EnterpriseTaskCreateDetail>
      className={style.actionRequestEnterpriseTaskTable}
      columns={enterpriseTaskCreateDetailColumns}
      dataSource={items}
      pagination={false}
      rowKey='id'
      scroll={{
        x: ENTERPRISE_TASK_TABLE_SCROLL_X,
        y:
          items.length > ENTERPRISE_TASK_TABLE_VISIBLE_ROW_COUNT
            ? ENTERPRISE_TASK_TABLE_SCROLL_Y
            : undefined,
      }}
    />
  </div>
);

const getVisibleActionRequestFields = (
  actionRequest: Record<string, unknown>,
  fields: ActionRequestField[],
) => {
  if (actionRequest.name !== 'agent_cbam2_factory_save') {
    return fields;
  }

  return fields.filter(field => !['country', 'orgId'].includes(field.key));
};

const getActionMaterialMass = (material: Record<string, unknown>) => {
  if (material.mass_unknown === true || material.massUnknown === true) {
    return I18N.carbonAgent.massUnknown;
  }

  const mass = material.mass_kg ?? material.massKg ?? material.mass;

  if (mass === null || mass === undefined || mass === '') {
    return undefined;
  }

  const massText = String(mass);

  return /kg/i.test(massText) ? massText : `${massText} kg`;
};

const getActionRequestMaterials = (
  source: Record<string, unknown>,
): ActionRequestMaterial[] => {
  if (!Array.isArray(source.materials)) {
    return [];
  }

  return source.materials
    .map((material, index) => {
      const materialRecord = asRecord(material);
      const name =
        getOptionalString(materialRecord.name) ||
        I18N.template(I18N.carbonAgent.materialN, { val1: String(index + 1) });
      const materialType =
        getOptionalString(materialRecord.material_type) ||
        getOptionalString(materialRecord.materialType);

      return {
        id: `${name}-${String(index)}`,
        mass: getActionMaterialMass(materialRecord),
        materialType,
        name,
      };
    })
    .filter(material => material.name);
};

const ActionRequestCard = ({
  card,
  submitting = false,
  onSubmit,
}: {
  card: AgentMessageCard;
  submitting?: boolean;
  onSubmit?: (payload: AgentActionRequestSubmitPayload) => void;
}) => {
  const payload = useMemo(() => getActionRequestPayload(card), [card]);

  const actionLocked =
    !onSubmit ||
    submitting ||
    payload.actionSubmitted === true ||
    payload.submitted === true;
  const actionRequests = useMemo(() => getActionRequests(payload), [payload]);
  const displayActionRequests = useMemo(
    () => getDisplayActionRequests(payload),
    [payload],
  );
  const actions = useMemo(() => getActionRequestActions(payload), [payload]);
  const message = getActionRequestMessage(payload);
  const status = getActionRequestStatusLabel(getOptionalString(payload.status));
  const renderActionRequests = displayActionRequests.length
    ? displayActionRequests
    : actionRequests;
  const actionRequestKey = [
    getOptionalString(payload.resumeEventId),
    getOptionalString(payload.checkpoint),
    renderActionRequests
      .map(
        actionRequest =>
          getOptionalString(actionRequest.actionLabel) ||
          getOptionalString(actionRequest.actionName) ||
          getOptionalString(actionRequest.name),
      )
      .join('|'),
  ]
    .filter(Boolean)
    .join('-');
  const [collapsed, setCollapsed] = useState(() =>
    getActionRequestInitialCollapsed(payload),
  );

  useEffect(() => {
    setCollapsed(getActionRequestInitialCollapsed(payload));
  }, [actionRequestKey, payload]);

  return (
    <section
      className={classNames(style.actionRequestCard, {
        [style.actionRequestCardCollapsed]: collapsed,
      })}
    >
      <div className={style.actionRequestCardSurface}>
        <div className={style.actionRequestHeader}>
          <div>
            <h3>{getActionRequestTitle()}</h3>
            {message ? <p>{message}</p> : null}
          </div>
          <div className={style.actionRequestHeaderActions}>
            {status ? <span>{status}</span> : null}
            <button
              className={style.actionRequestToggle}
              type='button'
              aria-expanded={!collapsed}
              aria-label={
                collapsed
                  ? I18N.carbonAgent.expandExecutionDetail
                  : I18N.carbonAgent.collapseExecutionDetail
              }
              onClick={() => setCollapsed(prevCollapsed => !prevCollapsed)}
            >
              <span
                className={classNames(style.actionRequestToggleIcon, {
                  [style.actionRequestToggleIconCollapsed]: collapsed,
                })}
                aria-hidden='true'
              />
            </button>
          </div>
        </div>

        {!collapsed ? (
          <>
            {renderActionRequests.length ? (
              <div className={style.actionRequestList}>
                {renderActionRequests.map((actionRequest, index) => {
                  const isDisplayActionRequest =
                    displayActionRequests.length > 0;
                  const requestName =
                    getOptionalString(actionRequest.actionLabel) ||
                    getOptionalString(actionRequest.actionName) ||
                    getOptionalString(actionRequest.name) ||
                    I18N.carbonAgent.toolToExecute;
                  const rawActionRequest = isDisplayActionRequest
                    ? actionRequests[index] || {}
                    : actionRequest;
                  const cbamActionRequestSummary =
                    getCbamActionRequestSummary(rawActionRequest);
                  const source = getActionRequestSource(rawActionRequest);
                  const fields = cbamActionRequestSummary
                    ? cbamActionRequestSummary.fields
                    : isDisplayActionRequest
                    ? getDisplayActionRequestFields(actionRequest)
                    : getActionRequestFields(source);
                  const visibleFields = getVisibleActionRequestFields(
                    rawActionRequest,
                    fields,
                  );
                  const materials = isDisplayActionRequest
                    ? []
                    : getActionRequestMaterials(source);
                  const enterpriseTaskCreateDetails =
                    getEnterpriseTaskCreateDetails(actionRequest);
                  const displayRequestName =
                    cbamActionRequestSummary?.name || requestName;

                  return (
                    <article
                      className={style.actionRequestItem}
                      key={`${displayRequestName}-${getOptionalString(
                        actionRequest.description,
                      )}`}
                    >
                      <div className={style.actionRequestToolName}>
                        <span>{I18N.carbonAgent.aboutToExecute}</span>
                        <strong>{displayRequestName}</strong>
                      </div>
                      {visibleFields.length ? (
                        <dl className={style.actionRequestSummary}>
                          {visibleFields.map(field => {
                            const showEnterpriseTaskTable =
                              field.key === 'content' &&
                              enterpriseTaskCreateDetails.length > 0;
                            const isWideField =
                              showEnterpriseTaskTable ||
                              hasActionRequestLineBreak(field.value) ||
                              ['content', 'productDescription'].includes(
                                field.key,
                              );

                            return (
                              <div
                                className={
                                  isWideField
                                    ? style.actionRequestSummaryWide
                                    : undefined
                                }
                                key={field.key}
                              >
                                <dt>{field.label}</dt>
                                <dd>
                                  {showEnterpriseTaskTable ? (
                                    <EnterpriseTaskCreateDetailTable
                                      items={enterpriseTaskCreateDetails}
                                    />
                                  ) : (
                                    renderActionRequestFieldValue(
                                      field,
                                      isWideField,
                                    )
                                  )}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      ) : null}
                      {materials.length ? (
                        <div className={style.actionRequestMaterials}>
                          <div className={style.actionRequestSectionTitle}>
                            {I18N.carbonAgent.materialComposition}
                          </div>
                          <div className={style.actionRequestMaterialList}>
                            {materials.map(material => (
                              <div
                                className={style.actionRequestMaterialItem}
                                key={material.id}
                              >
                                <strong>{material.name}</strong>
                                {[material.mass, material.materialType].filter(
                                  Boolean,
                                ).length ? (
                                  <span>
                                    {[material.mass, material.materialType]
                                      .filter(Boolean)
                                      .join(' / ')}
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : null}

            {actions.length ? (
              <div className={style.actionRequestActions}>
                {actions.map(action => {
                  const actionKey =
                    getOptionalString(action.key) ||
                    getOptionalString(action.action) ||
                    getOptionalString(action.label) ||
                    'action';
                  const actionLabel = getOptionalString(action.label) || '';
                  const isPrimary =
                    getActionRequestDecisionType(
                      `${actionKey} ${actionLabel}`,
                    ) === 'approve';

                  return (
                    <button
                      className={
                        isPrimary
                          ? style.actionRequestPrimaryButton
                          : style.actionRequestSecondaryButton
                      }
                      key={actionKey}
                      type='button'
                      disabled={actionLocked}
                      aria-busy={submitting}
                      onClick={() =>
                        !actionLocked &&
                        onSubmit?.(
                          getActionRequestSubmitPayload(action, payload),
                        )
                      }
                    >
                      {submitting
                        ? I18N.carbonAgent.submitting
                        : getOptionalString(action.label) ||
                          I18N.carbonAgent.confirm}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
};

const isActionRequestCard = (card: AgentMessageCard) =>
  card.cardType === 'action_request' ||
  getOptionalString(card.card.eventType) === 'action_request';

const isFormRequestCard = (card: AgentMessageCard) =>
  card.cardType === 'form_request' ||
  getOptionalString(card.card.eventType) === 'form_request';

const isErrorCard = (card: AgentMessageCard) =>
  card.cardType === 'error' ||
  getOptionalString(card.card.eventType) === 'error';

const getErrorCardMessage = (card: AgentMessageCard) => {
  const safePayload = asRecord(card.card.safePayload);

  return (
    getOptionalString(card.card.message) ||
    getOptionalString(safePayload.message) ||
    getOptionalString(card.card.errorMessage) ||
    I18N.carbonAgent.errorRetryHint
  );
};

const ErrorCard = ({
  card,
  hideActions = false,
  submitting = false,
  onFeedback,
  onRetry,
}: {
  card: AgentMessageCard;
  hideActions?: boolean;
  submitting?: boolean;
  onFeedback?: () => void;
  onRetry?: () => void;
}) => (
  <section className={style.errorCard} role='alert'>
    <div className={style.errorCardBody}>
      <div className={style.errorCardHeader}>
        <div className={style.errorCardIcon} aria-hidden='true' />
        <strong>{I18N.carbonAgent.answerGenerationFailed}</strong>
      </div>
      <p>{getErrorCardMessage(card)}</p>
    </div>
    {!hideActions ? (
      <div className={style.errorCardActions}>
        <button type='button' onClick={onFeedback}>
          {I18N.carbonAgent.feedbackProblem}
        </button>
        <button
          className={style.errorCardRetry}
          disabled={!onRetry || submitting}
          aria-busy={submitting}
          type='button'
          onClick={onRetry}
        >
          {submitting
            ? I18N.carbonAgent.submitting
            : I18N.carbonAgent.regenerate}
        </button>
      </div>
    ) : null}
  </section>
);

const AnswerCardItem = ({
  sessionId,
  shareId,
  onMonitorFilesSelect,
  card,
  copyOnly = false,
  enterpriseCarbonReviewCertificationDisabled,
  interactionDisabled = false,
  messageId,
  onActionRequestSubmit,
  onBusinessCardOpen,
  onErrorFeedback,
  onErrorRetry,
  onFormRequestSubmit,
  onOpenAccountingManagement,
  showThirdPartyCertification = true,
}: {
  sessionId?: string;
  shareId?: string;
  onMonitorFilesSelect?: (
    files: File[],
    origin?: AgentMonitorMaterialOrigin,
  ) => void;
  card: AgentMessageCard;
  copyOnly?: boolean;
  enterpriseCarbonReviewCertificationDisabled?: boolean;
  interactionDisabled?: boolean;
  messageId?: string;
  onActionRequestSubmit?: (payload: AgentActionRequestSubmitPayload) => void;
  onBusinessCardOpen?: (target: BusinessCardPreviewTarget) => void;
  onErrorFeedback?: () => void;
  onErrorRetry?: () => void;
  onFormRequestSubmit?: (payload: AgentFormRequestSubmitPayload) => void;
  onOpenAccountingManagement?: () => void;
  showThirdPartyCertification?: boolean;
}) => {
  if (getEnterpriseCard(card.card)) {
    return (
      <EnterpriseDataCard
        card={card}
        sessionId={sessionId}
        disabled={interactionDisabled}
        readonly={Boolean(shareId) || copyOnly}
      />
    );
  }
  const operationReport = getOperationReportDownloadAccess(
    card.card,
    sessionId,
  );
  if (operationReport?.fileId) {
    return (
      <CbamOperationReportDownload
        access={operationReport}
        disabled={interactionDisabled}
        restricted={Boolean(shareId) || copyOnly}
        onOpen={shareId ? undefined : onBusinessCardOpen}
      />
    );
  }
  if (isMonitorCard(card)) {
    const result =
      monitorResult({
        ...card.card,
        cardType: card.cardType || card.card.cardType,
      }) || {};
    // 新材料/进度资源按 cardId 回读；旧监测计划成果卡沿用下面已有业务卡展示。
    if (result.cardId || result.fileId) {
      return (
        <MonitorCard
          result={result}
          originMessageId={card.messageId || messageId}
          sessionId={sessionId}
          disabled={interactionDisabled}
          restricted={Boolean(shareId) || copyOnly}
          onOpen={shareId ? undefined : onBusinessCardOpen}
          onFilesSelect={onMonitorFilesSelect}
        />
      );
    }
  }
  const operationMaterial = operationAdvice(card.card);
  if (operationMaterial)
    return (
      <OperationAdviceCard
        advice={operationMaterial}
        messageId={card.messageId || messageId}
        disabled={interactionDisabled || Boolean(shareId) || copyOnly}
        onFilesSelect={onMonitorFilesSelect}
      />
    );
  if (isEnterpriseCarbonBusinessCard(card)) {
    return (
      <EnterpriseCarbonBusinessCard
        card={card}
        interactionDisabled={
          enterpriseCarbonReviewCertificationDisabled ?? interactionDisabled
        }
        onOpen={onBusinessCardOpen}
        showThirdPartyCertification={showThirdPartyCertification}
      />
    );
  }

  if (isBusinessCard(card)) {
    return (
      <BusinessCard
        card={card}
        interactionDisabled={interactionDisabled}
        messageId={messageId}
        onOpen={onBusinessCardOpen}
        onOpenAccountingManagement={onOpenAccountingManagement}
        showThirdPartyCertification={showThirdPartyCertification}
      />
    );
  }

  if (isActionRequestCard(card)) {
    return (
      <ActionRequestCard
        card={card}
        submitting={interactionDisabled}
        onSubmit={onActionRequestSubmit}
      />
    );
  }

  if (isFormRequestCard(card)) {
    return (
      <FormRequestCard
        card={card}
        submitting={interactionDisabled}
        onSubmit={onFormRequestSubmit}
      />
    );
  }

  if (isErrorCard(card)) {
    return (
      <ErrorCard
        card={card}
        hideActions={copyOnly}
        submitting={interactionDisabled}
        onFeedback={onErrorFeedback}
        onRetry={onErrorRetry}
      />
    );
  }

  return null;
};

const ThinkingIndicator = () => (
  <div
    className={style.answerThinking}
    aria-label={I18N.carbonAgent.generatingAnswer}
  >
    <span />
    <span />
    <span />
  </div>
);

const TOOL_STATUS_LABELS = createI18nLabelMap<string, string>({
  COMPLETED: () => I18N.carbonAgent.toolStatusSuccess,
  ERROR: () => I18N.carbonAgent.toolStatusFailed,
  FAILED: () => I18N.carbonAgent.toolStatusFailed,
  RUNNING: () => I18N.carbonAgent.toolStatusRunning,
  SUCCESS: () => I18N.carbonAgent.toolStatusSuccess,
});

const TOOL_TERMINAL_STATUSES = new Set([
  'ENDED',
  'COMPLETED',
  'ERROR',
  'FAILED',
  'SUCCESS',
]);

const getToolCallKey = (toolCall: AgentToolCall) =>
  toolCall.toolCallId ||
  toolCall.eventId ||
  `${toolCall.toolName || 'tool'}-${toolCall.sequenceNo || ''}-${
    toolCall.createTime || ''
  }`;

const getToolStatusLabel = (status?: string) =>
  status === 'ENDED'
    ? '已结束'
    : status
    ? TOOL_STATUS_LABELS[status] || status
    : '';

const getToolStatusTone = (status?: string) => {
  if (status === 'ENDED') return 'default';
  if (status === 'SUCCESS' || status === 'COMPLETED') {
    return 'success';
  }

  if (status === 'ERROR' || status === 'FAILED') {
    return 'error';
  }

  return 'running';
};

const formatToolCallTime = (time?: string) => {
  if (!time) {
    return undefined;
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  });
};

const getToolCallMeta = (toolCall: AgentToolCall) =>
  [
    toolCall.toolName,
    typeof toolCall.costMillis === 'number'
      ? `${toolCall.costMillis}ms`
      : undefined,
  ].filter(Boolean);

const getToolCallName = (toolCall: AgentToolCall) =>
  toolCall.display?.stageName ||
  toolCall.payload?.display?.stageName ||
  toolCall.toolName ||
  toolCall.message ||
  toolCall.title ||
  I18N.carbonAgent.toolDefault;

const getNormalizedToolName = (toolName?: string) =>
  toolName?.trim().toLowerCase();

const isWriteTodosToolName = (toolName?: string) => {
  const normalizedToolName = getNormalizedToolName(toolName);

  return (
    normalizedToolName === 'write_todos' || normalizedToolName === 'writetodos'
  );
};

const isProductCarbonModelAgentToolName = (toolName?: string) => {
  const normalizedToolName = getNormalizedToolName(toolName);
  const actualToolName = normalizedToolName?.replace(/^agent\s+/, '');

  return actualToolName === 'product_carbon_model_agent';
};

const getToolCallGroupKey = (toolCall: AgentToolCall) =>
  getNormalizedToolName(
    toolCall.toolName ||
      toolCall.display?.stageName ||
      toolCall.payload?.display?.stageName ||
      getToolCallName(toolCall),
  ) || I18N.carbonAgent.toolDefault;

const isToolCallTerminal = (toolCall: AgentToolCall) =>
  TOOL_TERMINAL_STATUSES.has(toolCall.status || '');

const isHiddenToolResultName = (toolName?: string) => {
  const normalizedToolName = getNormalizedToolName(toolName);

  return (
    normalizedToolName === 'grep' ||
    normalizedToolName === 'grep_file' ||
    normalizedToolName === 'grep_files' ||
    normalizedToolName === 'glob' ||
    normalizedToolName === 'ls' ||
    normalizedToolName === 'read_file' ||
    normalizedToolName === 'readfile'
  );
};

const getToolProcessText = (toolCall: AgentToolCall, callCount?: number) => {
  const toolName = getToolCallName(toolCall);
  if (toolCall.status === 'ENDED') return `${toolName} · 已结束`;
  const callCountText =
    callCount && callCount > 1
      ? I18N.template(I18N.carbonAgent.calledTimesSuffix, { val1: callCount })
      : '';

  if (toolCall.status === 'SUCCESS' || toolCall.status === 'COMPLETED') {
    return callCount && callCount > 1
      ? I18N.template(I18N.carbonAgent.calledToolTimes, {
          val1: toolName,
          val2: callCount,
        })
      : I18N.template(I18N.carbonAgent.calledTool, { val1: toolName });
  }

  if (toolCall.status === 'ERROR' || toolCall.status === 'FAILED') {
    return I18N.template(I18N.carbonAgent.toolCallFailedFormat, {
      val1: toolName,
      val2: callCountText,
    });
  }

  return I18N.template(I18N.carbonAgent.callingToolFormat, {
    val1: toolName,
    val2: callCountText,
  });
};

const formatJsonString = (data: string) => {
  const trimmedData = data.trim();

  if (!/^[{[]/.test(trimmedData)) {
    return data;
  }

  try {
    return JSON.stringify(JSON.parse(trimmedData), null, 2);
  } catch {
    return data;
  }
};

const isReferenceOnlyRecord = (record: Record<string, unknown>) =>
  typeof record.$ref === 'string' && Object.keys(record).length === 1;

const stringifyToolResult = (data: unknown): string => {
  if (typeof data === 'string') {
    return formatJsonString(data);
  }

  if (Array.isArray(data)) {
    return data
      .map(item => {
        if (typeof item === 'string') {
          return formatJsonString(item);
        }

        const itemRecord = asRecord(item);

        if (typeof itemRecord.text === 'string') {
          return formatJsonString(itemRecord.text);
        }

        if (isReferenceOnlyRecord(itemRecord)) {
          return '';
        }

        if (itemRecord.content) {
          return stringifyToolResult(itemRecord.content);
        }

        return Object.keys(itemRecord).length
          ? JSON.stringify(itemRecord, null, 2)
          : '';
      })
      .filter(Boolean)
      .join('\n\n');
  }

  const record = asRecord(data);

  return Object.keys(record).length ? JSON.stringify(record, null, 2) : '';
};

const parseJsonRecord = (data: unknown) => {
  if (typeof data !== 'string') {
    return asRecord(data);
  }

  try {
    return asRecord(JSON.parse(data));
  } catch {
    return {};
  }
};

const getNumberValue = (data: unknown) => {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === 'string' && data.trim()) {
    const nextValue = Number(data);

    return Number.isFinite(nextValue) ? nextValue : undefined;
  }

  return undefined;
};

const getFileNameFromPath = (path?: string) => {
  const rawName = path?.split('/').filter(Boolean).pop();

  if (!rawName) {
    return undefined;
  }

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
};

const formatToolFileSize = (size?: number) => {
  if (!size || size < 0) {
    return '';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
};

const getToolFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop()?.trim();

  return extension && extension !== fileName
    ? extension.slice(0, 4).toUpperCase()
    : 'FILE';
};

const getFileExtensionName = (fileName: string) => {
  const baseName = fileName.split('?')[0].split('#')[0];
  const extension = baseName.split('.').pop()?.trim().toLowerCase();

  return extension && extension !== baseName ? extension : '';
};

const getNormalizedMimeType = (mime?: string) =>
  mime?.split(';')[0].trim().toLowerCase() || '';

const isOfficeMimeType = (mimeType: string) =>
  mimeType === 'application/msword' ||
  mimeType === 'application/vnd.ms-excel' ||
  mimeType === 'application/vnd.ms-powerpoint' ||
  mimeType.startsWith('application/vnd.openxmlformats-officedocument') ||
  mimeType.startsWith('application/vnd.oasis.opendocument');

const isTextMimeType = (mimeType: string) =>
  mimeType.startsWith('text/') || TEXT_PREVIEW_MIME_TYPES.has(mimeType);

const getToolArtifactPreviewKind = ({
  filename,
  mime,
}: {
  filename: string;
  mime?: string;
}): ToolArtifactPreviewKind => {
  const extension = getFileExtensionName(filename);
  const mimeType = getNormalizedMimeType(mime);

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (
    IMAGE_PREVIEW_EXTENSIONS.has(extension) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }

  if (OFFICE_PREVIEW_EXTENSIONS.has(extension) || isOfficeMimeType(mimeType)) {
    return 'office';
  }

  if (TEXT_PREVIEW_EXTENSIONS.has(extension) || isTextMimeType(mimeType)) {
    return 'text';
  }

  return 'unsupported';
};

const getToolArtifactCodeLanguage = (filename: string, mime?: string) => {
  const extension = getFileExtensionName(filename);
  const mimeType = getNormalizedMimeType(mime);

  return extension === 'md' ||
    extension === 'markdown' ||
    mimeType === 'text/markdown' ||
    mimeType === 'application/markdown'
    ? 'markdown'
    : undefined;
};

const getOfficePreviewUrl = (url: string) => {
  const searchParams = new URLSearchParams({ src: url });

  return `${OFFICE_PREVIEW_URL}?${searchParams.toString()}`;
};

const getPdfPreviewUrl = (url: string) =>
  `${url}${url.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=1`;

const useLazyPreviewVisible = () => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      return undefined;
    }

    const node = previewRef.current;

    if (!node) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [visible]);

  return { previewRef, visible };
};

const normalizeWorkspaceArtifactExport = (
  data: unknown,
): WorkspaceArtifactExportResult | undefined => {
  const record = parseJsonRecord(data);

  if (!Object.keys(record).length) {
    return undefined;
  }

  const nestedCandidates = [
    record.safePayload,
    record.content,
    record.data,
    record.chunk,
  ];
  const nestedResult = nestedCandidates
    .map(normalizeWorkspaceArtifactExport)
    .find(Boolean);

  if (nestedResult) {
    return nestedResult;
  }

  const type = getOptionalScalarString(record.type);
  const nestedArtifactRecord = asRecord(record.artifact);
  const artifactRecord = Object.keys(nestedArtifactRecord).length
    ? nestedArtifactRecord
    : record;
  const hasWorkspaceArtifact =
    type === 'workspace_artifact_exported' ||
    Boolean(
      artifactRecord.artifact_id ||
        artifactRecord.artifactId ||
        artifactRecord.article_id ||
        artifactRecord.articleId ||
        artifactRecord.file_id ||
        artifactRecord.fileId,
    );

  if (!hasWorkspaceArtifact || !Object.keys(artifactRecord).length) {
    return undefined;
  }

  const artifactId =
    getOptionalScalarString(artifactRecord.artifact_id) ||
    getOptionalScalarString(artifactRecord.artifactId);
  const fileId =
    getOptionalScalarString(artifactRecord.article_id) ||
    getOptionalScalarString(artifactRecord.articleId) ||
    getOptionalScalarString(artifactRecord.file_id) ||
    getOptionalScalarString(artifactRecord.fileId);
  const sessionId =
    getOptionalScalarString(artifactRecord.session_id) ||
    getOptionalScalarString(artifactRecord.sessionId) ||
    getOptionalScalarString(record.session_id) ||
    getOptionalScalarString(record.sessionId);
  const filename =
    getOptionalScalarString(artifactRecord.filename) ||
    getOptionalScalarString(artifactRecord.name) ||
    getFileNameFromPath(getOptionalScalarString(artifactRecord.path)) ||
    artifactId ||
    fileId ||
    I18N.carbonAgent.mdDownloadFile;

  return {
    artifactId,
    fileId,
    filename,
    mime: getOptionalScalarString(artifactRecord.mime),
    sessionId,
    size: getNumberValue(artifactRecord.size),
  };
};

const getWorkspaceArtifactExportResult = (toolCall: AgentToolCall) => {
  // 监测报告由 MonitorCard 使用受控业务接口下载，不能把业务 fileId 当沙箱文件。
  if (monitorToolResults(toolCall).some(result => result.fileId))
    return undefined;
  const payload = asRecord(toolCall.payload);
  const safePayload = asRecord(payload.safePayload);
  const payloadChunk = asRecord(payload.chunk);
  const safePayloadChunk = asRecord(safePayload.chunk);

  return [
    payload,
    safePayload,
    payload.content,
    safePayload.content,
    payloadChunk.content,
    safePayloadChunk.content,
  ]
    .map(normalizeWorkspaceArtifactExport)
    .find(Boolean);
};

const CCDB_SEARCH_FIELD_PATTERNS: Array<{
  key: keyof Omit<CcdbFactorResult, 'no'>;
  label: string;
  pattern: RegExp;
}> = [
  {
    key: 'name',
    label: '名称',
    pattern: /名称\s*:\s*(.+)$/,
  },
  {
    key: 'value',
    label: '排放因子值',
    pattern: /排放因子值\s*:\s*(.+)$/,
  },
  {
    key: 'region',
    label: '适用国家/地区',
    pattern: /适用国家\/地区\s*:\s*(.+)$/,
  },
  {
    key: 'year',
    label: '发布年份',
    pattern: /发布年份\s*:\s*(.+)$/,
  },
  {
    key: 'organization',
    label: '发布机构',
    pattern: /发布机构\s*:\s*(.+)$/,
  },
  {
    key: 'specification',
    label: '规格说明',
    pattern: /规格说明\s*:\s*(.+)$/,
  },
  {
    key: 'factorLevel',
    label: '因子级别',
    pattern: /因子级别\s*:\s*(.+)$/,
  },
  {
    key: 'description',
    label: '描述',
    pattern: /描述\s*:\s*(.+)$/,
  },
];

const parseCcdbSearchFactors = (result: string): CcdbSearchResult | null => {
  if (!result.includes('因子 #')) {
    return null;
  }

  const countMatch = result.match(
    /共找到\s*(\d+)\s*条碳排放因子数据(?:[（(]以下展示前\s*(\d+)\s*条[）)])?/,
  );
  const sections = result
    .split(/━━━\s*因子\s*#/)
    .slice(1)
    .map(section => section.trim())
    .filter(Boolean);
  const factors = sections
    .map(section => {
      const lines = section
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      const firstLine = lines[0] || '';
      const no = firstLine.replace(/━━━/g, '').trim();

      return lines.slice(1).reduce<CcdbFactorResult>(
        (factor, line) => {
          const fieldPattern = CCDB_SEARCH_FIELD_PATTERNS.find(({ pattern }) =>
            pattern.test(line),
          );

          if (!fieldPattern) {
            return factor;
          }

          const value = line.match(fieldPattern.pattern)?.[1]?.trim();

          return value
            ? {
                ...factor,
                [fieldPattern.key]: value,
              }
            : factor;
        },
        {
          no,
        },
      );
    })
    .filter(factor => factor.name || factor.value);

  if (!factors.length) {
    return null;
  }

  return {
    displayCount: countMatch?.[2],
    factors,
    totalCount: countMatch?.[1],
  };
};

const parseSearchEmissionFactor = (
  result: string,
): SearchEmissionFactorResultData | null => {
  try {
    const parsed = JSON.parse(result);
    const { results } = asRecord(parsed);

    if (!Array.isArray(results)) {
      return null;
    }

    const normalizedResults = results
      .map(item => {
        const itemRecord = asRecord(item);
        const factor =
          itemRecord.factor === null || itemRecord.factor === undefined
            ? undefined
            : String(itemRecord.factor);

        return {
          factor,
          id: readCcdbFactorId(itemRecord),
          detailUrl:
            typeof itemRecord.detailUrl === 'string'
              ? itemRecord.detailUrl
              : undefined,
          name:
            typeof itemRecord.name === 'string' ? itemRecord.name : undefined,
          region:
            typeof itemRecord.region === 'string'
              ? itemRecord.region
              : undefined,
          riskNote:
            typeof itemRecord.risk_note === 'string'
              ? itemRecord.risk_note
              : typeof itemRecord.riskNote === 'string'
              ? itemRecord.riskNote
              : undefined,
          unit:
            typeof itemRecord.unit === 'string' ? itemRecord.unit : undefined,
          year:
            itemRecord.year === null || itemRecord.year === undefined
              ? undefined
              : String(itemRecord.year),
        };
      })
      .filter(item => item.name || item.factor);

    return normalizedResults.length
      ? {
          results: normalizedResults,
        }
      : null;
  } catch {
    return null;
  }
};

const getSearchEmissionFactorKey = (item: SearchEmissionFactorItem) =>
  [item.name, item.factor, item.unit, item.region, item.year, item.riskNote]
    .filter(Boolean)
    .join('-');

const NORMAL_FACTOR_SEARCH_DISPLAY_LIMIT = 10;

const isNormalFactorSearchToolName = (toolName?: string) => {
  const normalizedToolName = getNormalizedToolName(toolName) || '';

  return (
    normalizedToolName.includes('普通因子检索') ||
    normalizedToolName.includes('normal_factor') ||
    normalizedToolName.includes('ordinary_factor') ||
    normalizedToolName.includes('common_factor') ||
    normalizedToolName.includes('factor_search') ||
    normalizedToolName.includes('factorsearch')
  );
};

const parseJsonLikeValue = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return data;
  }

  const trimmedData = data.trim();

  if (!/^[{[]/.test(trimmedData)) {
    return data;
  }

  try {
    return JSON.parse(trimmedData);
  } catch {
    return data;
  }
};

const getNormalFactorSearchPayloadCandidates = (
  data: unknown,
): Record<string, unknown>[] => {
  const rootRecord = asRecord(parseJsonLikeValue(data));
  const nestedKeys = ['data', 'result', 'content', 'payload'];

  return [
    rootRecord,
    ...nestedKeys.map(key => asRecord(parseJsonLikeValue(rootRecord[key]))),
  ].filter(hasRecordValue);
};

const getNormalFactorRows = (payload: Record<string, unknown>) => {
  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload.records)) {
    return payload.records;
  }

  if (Array.isArray(payload.list)) {
    return payload.list;
  }

  const data = parseJsonLikeValue(payload.data);
  const dataRecord = asRecord(data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(dataRecord.rows)) {
    return dataRecord.rows;
  }

  if (Array.isArray(dataRecord.items)) {
    return dataRecord.items;
  }

  return [];
};

const getNormalFactorField = (
  record: Record<string, unknown>,
  keys: string[],
) =>
  keys.reduce<string | undefined>(
    (value, key) => value || getOptionalScalarString(record[key]),
    undefined,
  );

const normalizeNormalFactorText = (value?: string) =>
  value?.replace(/\s+/g, ' ').trim();

const normalizeNormalFactorSearchItem = (
  item: unknown,
): NormalFactorSearchItem | null => {
  const itemRecord = asRecord(item);
  const normalizedItem: NormalFactorSearchItem = {
    applyYear: getNormalFactorField(itemRecord, ['applyYear', 'apply_year']),
    applyYearEnd: getNormalFactorField(itemRecord, [
      'applyYearEnd',
      'apply_year_end',
    ]),
    countries: getNormalFactorField(itemRecord, [
      'countries',
      'country',
      'area',
      'region',
    ]),
    description: normalizeNormalFactorText(
      getNormalFactorField(itemRecord, ['description', 'desc']),
    ),
    detailUrl: getNormalFactorField(itemRecord, ['detailUrl', 'detail_url']),
    id: readCcdbFactorId(itemRecord),
    institution: getNormalFactorField(itemRecord, [
      'institution',
      'organization',
      'org',
    ]),
    name: getNormalFactorField(itemRecord, [
      'name',
      'factorName',
      'factor_name',
    ]),
    source: normalizeNormalFactorText(
      getNormalFactorField(itemRecord, ['source', 'sourceName', 'source_name']),
    ),
    sourceName: normalizeNormalFactorText(
      getNormalFactorField(itemRecord, ['sourceName', 'source_name']),
    ),
    sourceLevel: getNormalFactorField(itemRecord, [
      'sourceLevel',
      'source_level',
      'factorLevel',
      'factor_level',
    ]),
    specification: getNormalFactorField(itemRecord, ['specification', 'spec']),
    unit:
      getNormalFactorField(itemRecord, ['unit']) ||
      [
        getNormalFactorField(itemRecord, ['numeratorUnit', 'numerator_unit']),
        getNormalFactorField(itemRecord, [
          'denominatorUnit',
          'denominator_unit',
        ]),
      ]
        .filter(Boolean)
        .join('/'),
    value: getNormalFactorField(itemRecord, [
      'cValue',
      'value',
      'factor',
      'factorValue',
      'factor_value',
      'emissionFactorValue',
    ]),
    verified: getNormalFactorField(itemRecord, ['verified']),
    year: getNormalFactorField(itemRecord, ['year']),
  };

  return Object.values(normalizedItem).some(Boolean) ? normalizedItem : null;
};

const parseNormalFactorSearch = (
  result: string,
): NormalFactorSearchResultData | null => {
  const payload = getNormalFactorSearchPayloadCandidates(result).find(
    candidate => getNormalFactorRows(candidate).length,
  );

  if (!payload) {
    return null;
  }

  const normalizedRows = getNormalFactorRows(payload)
    .map(normalizeNormalFactorSearchItem)
    .filter(Boolean) as NormalFactorSearchItem[];

  if (!normalizedRows.length) {
    return null;
  }

  const displayedRows = normalizedRows.slice(
    0,
    NORMAL_FACTOR_SEARCH_DISPLAY_LIMIT,
  );

  return {
    displayCount: displayedRows.length,
    rows: displayedRows,
    totalCount:
      getOptionalScalarString(payload.total) ||
      getOptionalScalarString(payload.totalCount) ||
      getOptionalScalarString(payload.count) ||
      String(normalizedRows.length),
  };
};

const getNormalFactorMetaItems = (item: NormalFactorSearchItem) =>
  [
    item.sourceLevel
      ? `${I18N.carbonAgent.levelPrefix}${item.sourceLevel}`
      : undefined,
    item.countries
      ? `${I18N.carbonAgent.regionPrefix}${item.countries}`
      : undefined,
    item.year || item.applyYear
      ? `${I18N.carbonAgent.yearPrefix}${item.year || item.applyYear}`
      : undefined,
    item.applyYearEnd
      ? `${I18N.carbonAgent.applyEndPrefix}${item.applyYearEnd}`
      : undefined,
    item.specification
      ? `${I18N.carbonAgent.specPrefix}${item.specification}`
      : undefined,
    item.institution
      ? `${I18N.carbonAgent.orgPrefix}${item.institution}`
      : undefined,
  ].filter(Boolean);

const getNormalFactorSearchKey = (
  item: NormalFactorSearchItem,
  index: number,
) =>
  [item.id, item.name, item.value, item.unit, item.source, String(index)]
    .filter(Boolean)
    .join('-');

const parseSearchKnowledge = (
  result: string,
): SearchKnowledgeResultData | null => {
  try {
    const parsed = JSON.parse(result);
    const { results } = asRecord(parsed);

    if (!Array.isArray(results)) {
      return null;
    }

    const normalizedResults = results
      .map(item => {
        const itemRecord = asRecord(item);

        return {
          riskNote:
            typeof itemRecord.risk_note === 'string'
              ? itemRecord.risk_note
              : typeof itemRecord.riskNote === 'string'
              ? itemRecord.riskNote
              : undefined,
          summary:
            typeof itemRecord.summary === 'string'
              ? itemRecord.summary
              : undefined,
          title:
            typeof itemRecord.title === 'string' ? itemRecord.title : undefined,
        };
      })
      .filter(item => item.title || item.summary);

    return normalizedResults.length
      ? {
          results: normalizedResults,
        }
      : null;
  } catch {
    return null;
  }
};

const getCcdbFactorCitations = (
  toolCalls: AgentToolCall[],
): CcdbFactorCitation[] => {
  const citations = toolCalls.flatMap(toolCall => {
    const toolName = getToolCallName(toolCall);

    if (
      !isNormalFactorSearchToolName(toolCall.toolName) &&
      !isNormalFactorSearchToolName(toolName)
    ) {
      return [];
    }

    const searchResult = parseNormalFactorSearch(getToolCallResult(toolCall));

    return (
      searchResult?.rows.flatMap(row =>
        row.name && row.detailUrl
          ? [
              {
                detailUrl: row.detailUrl,
                factorId: row.id,
                name: row.name,
              },
            ]
          : [],
      ) || []
    );
  });
  const seen = new Set<string>();

  return citations.filter(citation => {
    const key = `${citation.factorId || ''}:${citation.detailUrl}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getSearchKnowledgeKey = (item: SearchKnowledgeItem) =>
  [item.title, item.summary, item.riskNote].filter(Boolean).join('-');

const parseWebSearch = (result: string): WebSearchResultData | null => {
  try {
    const parsed = JSON.parse(result);
    const parsedRecord = asRecord(parsed);
    const { results } = parsedRecord;

    if (!Array.isArray(results)) {
      return null;
    }

    const normalizedResults = results
      .map(item => {
        const itemRecord = asRecord(item);
        const rawScore = itemRecord.score;

        return {
          content:
            typeof itemRecord.content === 'string'
              ? itemRecord.content
              : undefined,
          score:
            typeof rawScore === 'number'
              ? rawScore
              : typeof rawScore === 'string'
              ? Number(rawScore)
              : undefined,
          title:
            typeof itemRecord.title === 'string' ? itemRecord.title : undefined,
          url: typeof itemRecord.url === 'string' ? itemRecord.url : undefined,
        };
      })
      .filter(item => item.title || item.url || item.content);

    return normalizedResults.length
      ? {
          query:
            typeof parsedRecord.query === 'string'
              ? parsedRecord.query
              : undefined,
          requestId:
            typeof parsedRecord.request_id === 'string'
              ? parsedRecord.request_id
              : typeof parsedRecord.requestId === 'string'
              ? parsedRecord.requestId
              : undefined,
          responseTime:
            typeof parsedRecord.response_time === 'number'
              ? parsedRecord.response_time
              : undefined,
          results: normalizedResults,
        }
      : null;
  } catch {
    return null;
  }
};

const getWebSearchHost = (url?: string) => {
  if (!url) {
    return '';
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getWebSearchScoreLabel = (score?: number) => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '';
  }

  return `${Math.round(score * 100)}%`;
};

const getWebSearchKey = (item: WebSearchItem) =>
  [item.url, item.title, item.content].filter(Boolean).join('-');

const getToolCallResult = (toolCall: AgentToolCall) => {
  const payload = asRecord(toolCall.payload);
  const safePayload = asRecord(payload.safePayload);
  const payloadChunk = asRecord(payload.chunk);
  const safePayloadChunk = asRecord(safePayload.chunk);

  return publicToolText(
    stringifyToolResult(safePayload.content) ||
      stringifyToolResult(safePayloadChunk.content) ||
      stringifyToolResult(payload.content) ||
      stringifyToolResult(payloadChunk.content),
  );
};

type WriteTodosMergeState = {
  firstCall: AgentToolCall;
  latestCall: AgentToolCall;
  order: string[];
  todosByContent: Map<string, TodoItem>;
};

const getMergedWriteTodosResult = (state: WriteTodosMergeState) =>
  `Updated todo list to ${JSON.stringify(
    state.order
      .map(content => state.todosByContent.get(content))
      .filter(Boolean),
  )}`;

const buildMergedWriteTodosCall = (
  state: WriteTodosMergeState,
): AgentToolCall => {
  const latestPayload = asRecord(state.latestCall.payload);
  const latestSafePayload = asRecord(latestPayload.safePayload);
  const result = getMergedWriteTodosResult(state);

  return {
    ...state.latestCall,
    eventId: state.firstCall.eventId || state.latestCall.eventId,
    orderNo: state.firstCall.orderNo,
    payload: {
      ...latestPayload,
      safePayload: {
        ...latestSafePayload,
        content: result,
      },
    },
    sequenceNo: state.firstCall.sequenceNo,
    streamOrderNo: state.firstCall.streamOrderNo,
    toolCallId: state.firstCall.toolCallId || state.latestCall.toolCallId,
  };
};

const mergeWriteTodosToolCalls = (toolCalls: AgentToolCall[]) => {
  const mergedToolCalls: AgentToolCall[] = [];
  let mergeState: WriteTodosMergeState | undefined;

  const flushWriteTodos = () => {
    if (!mergeState) {
      return;
    }

    mergedToolCalls.push(buildMergedWriteTodosCall(mergeState));
    mergeState = undefined;
  };

  toolCalls.forEach(toolCall => {
    if (!isWriteTodosToolName(getToolCallName(toolCall))) {
      flushWriteTodos();
      mergedToolCalls.push(toolCall);
      return;
    }

    const todos = parseWriteTodosResult(getToolCallResult(toolCall));

    if (!todos.length) {
      flushWriteTodos();
      mergedToolCalls.push(toolCall);
      return;
    }

    if (!mergeState) {
      mergeState = {
        firstCall: toolCall,
        latestCall: toolCall,
        order: [],
        todosByContent: new Map<string, TodoItem>(),
      };
    } else {
      mergeState.latestCall = toolCall;
    }

    todos.forEach(todo => {
      if (!mergeState) {
        return;
      }

      if (!mergeState.todosByContent.has(todo.content)) {
        mergeState.order.push(todo.content);
      }

      mergeState.todosByContent.set(todo.content, todo);
    });
  });

  flushWriteTodos();

  return mergedToolCalls;
};

const getToolCallDisplayOrderNo = (toolCall: AgentToolCall, index: number) =>
  toolCall.streamOrderNo ||
  toolCall.orderNo ||
  (toolCall.sequenceNo ? toolCall.sequenceNo * 10 + 5 : 20 + index);

const getMergedToolCallSummaryCall = (toolCalls: AgentToolCall[]) => {
  const latestCall = toolCalls[toolCalls.length - 1];

  if (!latestCall || !isWriteTodosToolName(getToolCallName(latestCall))) {
    return latestCall;
  }

  const mergedWriteTodosCalls = mergeWriteTodosToolCalls(toolCalls);

  return mergedWriteTodosCalls[mergedWriteTodosCalls.length - 1] || latestCall;
};

const getGroupedToolCallItems = (
  toolCalls: AgentToolCall[],
  streaming: boolean,
) => {
  const toolCallGroups = toolCalls.reduce<AgentToolCall[][]>(
    (groups, toolCall) => {
      const currentGroup = groups[groups.length - 1];

      if (
        !currentGroup ||
        getToolCallGroupKey(currentGroup[currentGroup.length - 1]) !==
          getToolCallGroupKey(toolCall)
      ) {
        groups.push([toolCall]);
        return groups;
      }

      currentGroup.push(toolCall);
      return groups;
    },
    [],
  );

  return toolCallGroups.map((group, index) => {
    const firstCall = group[0];
    const latestCall = group[group.length - 1];
    const showLatestCallOnly =
      group.length > 1 && streaming && !isToolCallTerminal(latestCall);
    const toolCall = showLatestCallOnly
      ? latestCall
      : getMergedToolCallSummaryCall(group);
    const callCount = group.length > 1 ? group.length : undefined;

    return {
      callCount,
      id:
        group.length > 1
          ? `${getToolCallGroupKey(firstCall)}-${getToolCallKey(
              firstCall,
            )}-${getToolCallKey(latestCall)}-${group.length}`
          : getToolCallKey(toolCall),
      orderNo: getToolCallDisplayOrderNo(
        showLatestCallOnly ? latestCall : firstCall,
        index,
      ),
      toolCall,
      toolCalls: group.length > 1 ? group : undefined,
      type: 'toolCall' as const,
    };
  });
};

const getAnswerCardItemIdentity = (
  item: Extract<AnswerItem, { type: 'card' }>,
) => {
  const { card } = item.card;
  const safePayload = asRecord(card.safePayload);
  const data = asRecord(card.data);
  const identity = [card, safePayload, data]
    .flatMap(record =>
      ['fileId', 'eventId', 'toolCallId', 'blockId', 'id'].map(key =>
        getOptionalScalarString(record[key]),
      ),
    )
    .find(Boolean);

  return `${item.card.messageId}:${item.card.cardType || 'card'}:${
    identity || item.id
  }`;
};

const getAnswerItemIdentity = (item: AnswerItem) => {
  if (item.type === 'block') {
    return `block:${item.id}`;
  }

  // test
  if (item.type === 'card') {
    return `card:${getAnswerCardItemIdentity(item)}`;
  }

  return `toolCall:${getToolCallKey(item.toolCall)}`;
};

const getAnswerBlockContentIdentity = (
  item: Extract<AnswerItem, { type: 'block' }>,
) =>
  [
    item.block.messageId,
    item.block.blockType || 'markdown',
    item.block.content.trim(),
  ].join(':');

const dedupeAnswerItems = (items: AnswerItem[], streaming: boolean) => {
  const dedupedItems: AnswerItem[] = [];
  const identityIndexes = new Map<string, number>();
  const blockContentIndexes = new Map<string, number>();

  items.forEach(item => {
    const identity = getAnswerItemIdentity(item);
    const contentIdentity =
      !streaming && item.type === 'block'
        ? getAnswerBlockContentIdentity(item)
        : '';
    const existingIndex =
      identityIndexes.get(identity) ??
      (contentIdentity ? blockContentIndexes.get(contentIdentity) : undefined);

    if (existingIndex !== undefined) {
      const existingItem = dedupedItems[existingIndex];

      if (
        item.type === 'block' &&
        existingItem.type === 'block' &&
        item.block.content.startsWith(existingItem.block.content)
      ) {
        dedupedItems[existingIndex] = {
          ...item,
          id: existingItem.id,
          orderNo: Math.min(existingItem.orderNo, item.orderNo),
        };
      }

      identityIndexes.set(identity, existingIndex);

      if (contentIdentity) {
        blockContentIndexes.set(contentIdentity, existingIndex);
      }

      return;
    }

    const nextIndex = dedupedItems.length;

    dedupedItems.push(item);
    identityIndexes.set(identity, nextIndex);

    if (contentIdentity) {
      blockContentIndexes.set(contentIdentity, nextIndex);
    }
  });

  return dedupedItems;
};

const getCcdbFactorMetaItems = (factor: CcdbFactorResult) =>
  [
    factor.factorLevel
      ? `${I18N.carbonAgent.levelPrefix}${factor.factorLevel}`
      : undefined,
    factor.region
      ? `${I18N.carbonAgent.regionPrefix}${factor.region}`
      : undefined,
    factor.year ? `${I18N.carbonAgent.yearPrefix}${factor.year}` : undefined,
    factor.organization
      ? `${I18N.carbonAgent.orgPrefix}${factor.organization}`
      : undefined,
    factor.specification
      ? `${I18N.carbonAgent.specPrefix}${factor.specification}`
      : undefined,
    factor.description
      ? `${I18N.carbonAgent.descPrefix}${factor.description}`
      : undefined,
  ].filter(Boolean);

const CcdbSearchFactorsResult = ({ result }: { result: string }) => {
  const searchResult = useMemo(() => parseCcdbSearchFactors(result), [result]);

  if (!searchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.ccdbFactorResult}>
      <div className={style.ccdbFactorResultHead}>
        <span>{I18N.carbonAgent.carbonEmissionFactor}</span>
        {searchResult.totalCount ? (
          <b>
            {I18N.template(I18N.carbonAgent.totalCountItems, {
              val1: searchResult.totalCount,
            })}
            {searchResult.displayCount
              ? I18N.template(I18N.carbonAgent.showTopItems, {
                  val1: searchResult.displayCount,
                })
              : ''}
          </b>
        ) : null}
      </div>
      <div className={style.ccdbFactorList}>
        {searchResult.factors.map(factor => (
          <article className={style.ccdbFactorItem} key={factor.no}>
            <div className={style.ccdbFactorMain}>
              <span className={style.ccdbFactorNo}>#{factor.no}</span>
              <h4>{factor.name || I18N.carbonAgent.unnamedFactor}</h4>
              {factor.value ? (
                <strong className={style.ccdbFactorValue}>
                  {factor.value}
                </strong>
              ) : null}
            </div>
            <div className={style.ccdbFactorMetaLine}>
              {getCcdbFactorMetaItems(factor).map(meta => (
                <span key={meta}>{meta}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const SearchEmissionFactorResult = ({
  result,
  onFactorOpen,
}: {
  result: string;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
}) => {
  const searchResult = useMemo(
    () => parseSearchEmissionFactor(result),
    [result],
  );

  if (!searchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.emissionFactorResult}>
      <div className={style.emissionFactorResultHead}>
        <span>{I18N.carbonAgent.factorSearchCandidates}</span>
        <b>
          {I18N.template(I18N.carbonAgent.countItems, {
            val1: searchResult.results.length,
          })}
        </b>
      </div>
      <div className={style.emissionFactorList}>
        {searchResult.results.map(item => {
          const factorValue = item.factor
            ? `${item.factor}${item.unit ? ` ${item.unit}` : ''}`
            : I18N.carbonAgent.unconfirmedFactorValue;

          return (
            <article
              className={style.emissionFactorItem}
              key={getSearchEmissionFactorKey(item) || 'factor'}
            >
              <div className={style.emissionFactorMain}>
                <h4>{item.name || I18N.carbonAgent.unnamedCandidate}</h4>
                <button
                  type='button'
                  disabled={!item.id || !onFactorOpen}
                  onClick={() =>
                    item.id &&
                    onFactorOpen?.({
                      factorId: item.id,
                      name: item.name,
                      detailUrl: item.detailUrl,
                    })
                  }
                  className={
                    item.factor
                      ? style.emissionFactorValue
                      : style.emissionFactorValueMuted
                  }
                >
                  {factorValue}
                </button>
              </div>
              <div className={style.emissionFactorMetaLine}>
                {item.region ? (
                  <span>
                    {I18N.carbonAgent.regionPrefix}
                    {item.region}
                  </span>
                ) : null}
                {item.year ? (
                  <span>
                    {I18N.carbonAgent.yearPrefix}
                    {item.year}
                  </span>
                ) : null}
                {item.riskNote ? (
                  <span>
                    {I18N.carbonAgent.tipPrefix}
                    {item.riskNote}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

const NormalFactorSearchResult = ({
  result,
  onFactorOpen,
}: {
  result: string;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
}) => {
  const searchResult = useMemo(() => parseNormalFactorSearch(result), [result]);

  if (!searchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  const totalCountNumber = Number(searchResult.totalCount);
  const shouldShowDisplayCount = Number.isFinite(totalCountNumber)
    ? totalCountNumber > searchResult.displayCount
    : Boolean(
        searchResult.totalCount &&
          searchResult.totalCount !== String(searchResult.displayCount),
      );

  return (
    <div className={style.normalFactorResult}>
      <div className={style.normalFactorResultHead}>
        <span>{I18N.carbonAgent.normalFactorSearchResult}</span>
        <b>
          {searchResult.totalCount
            ? I18N.template(I18N.carbonAgent.totalCountItems, {
                val1: searchResult.totalCount,
              })
            : I18N.template(I18N.carbonAgent.countItems, {
                val1: searchResult.displayCount,
              })}
          {shouldShowDisplayCount
            ? I18N.template(I18N.carbonAgent.showTopItems, {
                val1: searchResult.displayCount,
              })
            : ''}
        </b>
      </div>
      <div className={style.normalFactorList}>
        {searchResult.rows.map((item, index) => {
          const factorName = item.name || I18N.carbonAgent.unnamedFactor;
          const factorValue = item.value
            ? `${item.value}${item.unit ? ` ${item.unit}` : ''}`
            : item.unit || I18N.carbonAgent.noFactorValue;
          const metaItems = getNormalFactorMetaItems(item);
          const openFactor = () =>
            item.id &&
            onFactorOpen?.({
              factorId: item.id,
              name: item.name,
              detailUrl: item.detailUrl,
              countries: item.countries,
              sourceName: item.institution || item.sourceName,
              year: item.year || item.applyYear,
              unit: item.unit,
              value: item.value,
            });

          return (
            <article
              className={style.normalFactorItem}
              key={getNormalFactorSearchKey(item, index)}
            >
              <div className={style.normalFactorMain}>
                <div className={style.normalFactorTitleBlock}>
                  {item.id && onFactorOpen ? (
                    <button
                      aria-label={`${I18N.carbonAgent.viewFactorDetails}: ${factorName}`}
                      className={style.normalFactorTitleButton}
                      title={`${I18N.carbonAgent.viewFactorDetails}: ${factorName}`}
                      type='button'
                      onClick={openFactor}
                    >
                      <span className={style.normalFactorTitleText}>
                        {factorName}
                      </span>
                      <ArrowRightOutlined
                        aria-hidden='true'
                        className={style.normalFactorTitleArrow}
                      />
                    </button>
                  ) : (
                    <h4>{factorName}</h4>
                  )}
                  {item.institution || item.sourceName || item.source ? (
                    <span
                      title={item.institution || item.sourceName || item.source}
                    >
                      {item.institution || item.sourceName || item.source}
                    </span>
                  ) : null}
                </div>
                <button
                  type='button'
                  disabled={!item.id || !onFactorOpen}
                  onClick={openFactor}
                  className={
                    item.value
                      ? style.normalFactorValue
                      : style.normalFactorValueMuted
                  }
                >
                  {factorValue}
                </button>
              </div>
              {metaItems.length ? (
                <div className={style.normalFactorMetaLine}>
                  {metaItems.map(meta => (
                    <span key={meta}>{meta}</span>
                  ))}
                </div>
              ) : null}
              {item.description ? (
                <p
                  className={style.normalFactorDescription}
                  title={item.description}
                >
                  {item.description}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
};

const SearchKnowledgeResult = ({ result }: { result: string }) => {
  const searchResult = useMemo(() => parseSearchKnowledge(result), [result]);

  if (!searchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.knowledgeResult}>
      <div className={style.knowledgeResultHead}>
        <span>{I18N.carbonAgent.knowledgeSearchResult}</span>
        <b>
          {I18N.template(I18N.carbonAgent.countItems, {
            val1: searchResult.results.length,
          })}
        </b>
      </div>
      <div className={style.knowledgeList}>
        {searchResult.results.map(item => (
          <article
            className={style.knowledgeItem}
            key={getSearchKnowledgeKey(item) || 'knowledge'}
          >
            <h4>{item.title || I18N.carbonAgent.unnamedKnowledge}</h4>
            {item.summary ? (
              <p className={style.knowledgeSummary}>{item.summary}</p>
            ) : null}
            {item.riskNote ? (
              <p className={style.knowledgeRisk}>{item.riskNote}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

const WebSearchResult = ({ result }: { result: string }) => {
  const searchResult = useMemo(() => parseWebSearch(result), [result]);

  if (!searchResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.webSearchResult}>
      <div className={style.webSearchResultHead}>
        <div className={style.webSearchQuery}>
          <span>{I18N.carbonAgent.webSearch}</span>
          {searchResult.query ? <strong>{searchResult.query}</strong> : null}
        </div>
        <div className={style.webSearchStats}>
          <b>
            {I18N.template(I18N.carbonAgent.countItems, {
              val1: searchResult.results.length,
            })}
          </b>
          {typeof searchResult.responseTime === 'number' ? (
            <time>{searchResult.responseTime.toFixed(2)}s</time>
          ) : null}
        </div>
      </div>
      <div className={style.webSearchList}>
        {searchResult.results.map((item, index) => {
          const scoreLabel = getWebSearchScoreLabel(item.score);
          const host = getWebSearchHost(item.url);
          const title =
            item.title ||
            host ||
            I18N.template(I18N.carbonAgent.searchResultN, { val1: index + 1 });

          return (
            <article
              className={style.webSearchItem}
              key={getWebSearchKey(item) || title}
            >
              <div className={style.webSearchItemHeader}>
                <div className={style.webSearchItemTitleBlock}>
                  {item.url ? (
                    <a
                      className={style.webSearchTitle}
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {title}
                    </a>
                  ) : (
                    <h4 className={style.webSearchTitle}>{title}</h4>
                  )}
                  {host ? (
                    <span className={style.webSearchHost}>{host}</span>
                  ) : null}
                </div>
                {scoreLabel ? (
                  <span className={style.webSearchScore}>
                    {I18N.template(I18N.carbonAgent.relevance, {
                      val1: scoreLabel,
                    })}
                  </span>
                ) : null}
              </div>
              {item.content ? (
                <p className={style.webSearchContent}>{item.content}</p>
              ) : null}
            </article>
          );
        })}
      </div>
      {searchResult.requestId ? (
        <p className={style.webSearchRequestId}>
          {I18N.carbonAgent.requestIdLabel}
          {searchResult.requestId}
        </p>
      ) : null}
    </div>
  );
};

const getCustomToolProcessResult = ({
  onFactorOpen,
  rawToolName,
  result,
  toolName,
}: {
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  rawToolName?: string;
  result: string;
  toolName?: string;
}) => {
  const normalizedToolName = getNormalizedToolName(toolName);

  if (
    isNormalFactorSearchToolName(rawToolName) ||
    isNormalFactorSearchToolName(toolName)
  ) {
    return (
      <NormalFactorSearchResult result={result} onFactorOpen={onFactorOpen} />
    );
  }

  if (toolName === 'ccdb_search_factors') {
    return <CcdbSearchFactorsResult result={result} />;
  }

  if (toolName === 'searchEmissionFactor') {
    return (
      <SearchEmissionFactorResult result={result} onFactorOpen={onFactorOpen} />
    );
  }

  if (toolName === 'searchKnowledge') {
    return <SearchKnowledgeResult result={result} />;
  }

  if (toolName === 'web_search' || toolName === 'webSearch') {
    return <WebSearchResult result={result} />;
  }

  if (normalizedToolName === 'fetch_url' || normalizedToolName === 'fetchurl') {
    return <FetchUrlResult result={result} />;
  }

  if (normalizedToolName === 'modelagentresult') {
    return <ModelAgentResult result={result} />;
  }

  if (
    isProductCarbonModelAgentToolName(toolName) ||
    isProductCarbonModelAgentToolName(rawToolName)
  ) {
    return <ProductCarbonModelAgentResult result={result} />;
  }

  if (isWriteTodosToolName(toolName)) {
    return <WriteTodosResult result={result} />;
  }

  return null;
};

const WorkspaceLiveSessionResult = ({
  liveWorkspaceOpen,
  liveWorkspaceSession,
  result,
  onOpenLiveWorkspace,
}: {
  liveWorkspaceOpen?: boolean;
  liveWorkspaceSession?: AgentWorkspaceLiveSession;
  result: AgentWorkspaceLiveSession;
  onOpenLiveWorkspace?: (session?: AgentWorkspaceLiveSession) => void;
}) => {
  const workspaceUrl = getWorkspaceLiveSessionUrl(result);
  const activeWorkspaceIdentity =
    getWorkspaceLiveSessionIdentity(liveWorkspaceSession);
  const resultWorkspaceIdentity = getWorkspaceLiveSessionIdentity(result);
  const resultActive = Boolean(
    liveWorkspaceOpen &&
      activeWorkspaceIdentity &&
      activeWorkspaceIdentity === resultWorkspaceIdentity,
  );
  const sandboxLabel = result.sandboxId
    ? I18N.template(I18N.carbonAgent.workspaceLiveSandbox, {
        val1: result.sandboxId,
      })
    : I18N.carbonAgent.workspaceLiveDesktop;

  return (
    <div className={style.workspaceLiveResult}>
      <div className={style.workspaceLiveResultMain}>
        <span className={style.workspaceLiveResultIcon} />
        <div className={style.workspaceLiveResultText}>
          <strong>{I18N.carbonAgent.workspaceLiveStarted}</strong>
          <span>{sandboxLabel}</span>
        </div>
      </div>
      {onOpenLiveWorkspace && workspaceUrl ? (
        <button
          className={style.workspaceLiveResultButton}
          disabled={resultActive}
          type='button'
          onClick={() => onOpenLiveWorkspace(result)}
        >
          {resultActive
            ? I18N.carbonAgent.workspaceRightPreviewOpened
            : I18N.carbonAgent.workspaceOpenRightPreview}
        </button>
      ) : null}
    </div>
  );
};

const resolveWorkspaceArtifactFile = async (
  result: WorkspaceArtifactExportResult,
  shareId?: string,
  fallbackSessionId?: string,
): Promise<WorkspaceArtifactResolvedFile> => {
  const shareFileId = shareId ? result.fileId || result.artifactId : undefined;
  const sessionId = result.sessionId || fallbackSessionId;

  if (shareId && shareFileId) {
    const fileData = await fetchAgentWorkspaceFileDownloadUrl({
      fileId: shareFileId,
      sessionId,
      shareId,
    });
    const downloadUrl = fileData.downloadUrl || '';

    if (!downloadUrl) {
      throw new Error(I18N.carbonAgent.emptyDownloadLink);
    }

    return {
      downloadUrl,
      filename: fileData.filename || fileData.name || result.filename,
      mime: fileData.mime || result.mime,
    };
  }

  if (result.artifactId) {
    const artifactData = await fetchAgentArtifactDownloadUrl(result.artifactId);
    const downloadUrl = artifactData.downloadUrl || '';

    if (!downloadUrl) {
      throw new Error(I18N.carbonAgent.emptyDownloadLink);
    }

    return {
      downloadUrl,
      filename: artifactData.filename || result.filename,
      mime: artifactData.mime || result.mime,
    };
  }

  if (result.fileId) {
    const fileData = await fetchAgentWorkspaceFileDownloadUrl({
      fileId: result.fileId,
      sessionId,
      shareId,
    });
    const downloadUrl = fileData.downloadUrl || '';

    if (!downloadUrl) {
      throw new Error(I18N.carbonAgent.emptyDownloadLink);
    }

    return {
      downloadUrl,
      filename: fileData.filename || fileData.name || result.filename,
      mime: fileData.mime || result.mime,
    };
  }

  throw new Error(I18N.carbonAgent.missingDownloadInfo);
};

type ToolArtifactPreviewState =
  | {
      status: 'idle';
    }
  | {
      status: 'loading';
    }
  | {
      kind: ToolArtifactPreviewKind;
      source: WorkspaceArtifactResolvedFile;
      status: 'ready';
      text?: string;
    }
  | {
      error: string;
      source?: WorkspaceArtifactResolvedFile;
      status: 'error';
    };

const ToolArtifactPreviewStatus = ({ children }: { children: string }) => (
  <div className={style.toolArtifactPreviewStatus}>{children}</div>
);

const ToolArtifactTextFallback = ({ value }: { value: string }) => (
  <pre className={style.toolArtifactPreviewCodeFallback}>{value}</pre>
);

const ToolArtifactPdfPreview = ({
  source,
}: {
  source: WorkspaceArtifactResolvedFile;
}) => {
  const timeoutRef = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [loadSlow, setLoadSlow] = useState(false);

  const clearLoadTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  useEffect(() => {
    clearLoadTimeout();
    setLoaded(false);
    setLoadSlow(false);
    timeoutRef.current = window.setTimeout(() => {
      setLoadSlow(true);
    }, PDF_PREVIEW_TIMEOUT_MS);

    return clearLoadTimeout;
  }, [source.downloadUrl]);

  const handleLoad = () => {
    clearLoadTimeout();
    setLoaded(true);
    setLoadSlow(false);
  };

  return (
    <div className={style.toolArtifactPdfPreview}>
      <iframe
        className={style.toolArtifactPreviewFrame}
        loading='lazy'
        src={getPdfPreviewUrl(source.downloadUrl)}
        title={source.filename}
        onLoad={handleLoad}
      />
      <a
        className={style.toolArtifactPdfPreviewAction}
        href={source.downloadUrl}
        rel='noreferrer'
        target='_blank'
      >
        {I18N.carbonAgent.openPreviewInNewTab}
      </a>
      {!loaded ? (
        <div className={style.toolArtifactPdfPreviewLoading}>
          <span>{I18N.carbonAgent.filePreviewLoading}</span>
        </div>
      ) : null}
      {loadSlow ? (
        <div className={style.toolArtifactPdfPreviewHint}>
          <span>{I18N.carbonAgent.pdfPreviewSlow}</span>
          <a href={source.downloadUrl} rel='noreferrer' target='_blank'>
            {I18N.carbonAgent.openPreviewInNewTab}
          </a>
        </div>
      ) : null}
    </div>
  );
};

const ToolArtifactPreview = ({
  result,
  resolveFile,
}: {
  result: WorkspaceArtifactExportResult;
  resolveFile: () => Promise<WorkspaceArtifactResolvedFile>;
}) => {
  const initialKind = getToolArtifactPreviewKind(result);
  const { previewRef, visible } = useLazyPreviewVisible();
  const [previewState, setPreviewState] = useState<ToolArtifactPreviewState>({
    status: 'idle',
  });

  useEffect(() => {
    setPreviewState({ status: 'idle' });
  }, [result.artifactId, result.fileId, result.filename, result.mime]);

  useEffect(() => {
    if (!visible || initialKind === 'unsupported') {
      return undefined;
    }

    let cancelled = false;

    const loadPreview = async () => {
      let previewSource: WorkspaceArtifactResolvedFile | undefined;

      setPreviewState({ status: 'loading' });

      try {
        const source = await resolveFile();
        previewSource = source;
        const kind = getToolArtifactPreviewKind(source);

        if (kind === 'text') {
          const response = await fetch(source.downloadUrl);

          if (!response.ok) {
            throw new Error(I18N.carbonAgent.filePreviewFailed);
          }

          const text = await response.text();

          if (!cancelled) {
            setPreviewState({ kind, source, status: 'ready', text });
          }

          return;
        }

        if (!cancelled) {
          setPreviewState({ kind, source, status: 'ready' });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewState({
          error:
            error instanceof Error
              ? error.message
              : I18N.carbonAgent.filePreviewFailed,
          source: previewSource,
          status: 'error',
        });
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [initialKind, resolveFile, visible]);

  if (initialKind === 'unsupported') {
    return null;
  }

  const renderPreviewBody = () => {
    if (!visible || previewState.status === 'idle') {
      return (
        <ToolArtifactPreviewStatus>
          {I18N.carbonAgent.filePreviewPreparing}
        </ToolArtifactPreviewStatus>
      );
    }

    if (previewState.status === 'loading') {
      return (
        <ToolArtifactPreviewStatus>
          {I18N.carbonAgent.filePreviewLoading}
        </ToolArtifactPreviewStatus>
      );
    }

    if (previewState.status === 'error') {
      return (
        <div className={style.toolArtifactPreviewError}>
          <span>
            {previewState.error || I18N.carbonAgent.filePreviewFailed}
          </span>
          {previewState.source?.downloadUrl ? (
            <a
              href={previewState.source.downloadUrl}
              rel='noreferrer'
              target='_blank'
            >
              {I18N.carbonAgent.openPreviewInNewTab}
            </a>
          ) : null}
        </div>
      );
    }

    const { kind, source, text } = previewState;

    if (kind === 'office') {
      return (
        <iframe
          className={style.toolArtifactPreviewFrame}
          loading='lazy'
          src={getOfficePreviewUrl(source.downloadUrl)}
          title={source.filename}
        />
      );
    }

    if (kind === 'pdf') {
      return <ToolArtifactPdfPreview source={source} />;
    }

    if (kind === 'image') {
      return (
        <div className={style.toolArtifactPreviewImageWrap}>
          <img
            alt={source.filename}
            className={style.toolArtifactPreviewImage}
            loading='lazy'
            src={source.downloadUrl}
            onError={() => {
              setPreviewState({
                error: I18N.carbonAgent.filePreviewFailed,
                source,
                status: 'error',
              });
            }}
          />
        </div>
      );
    }

    if (kind === 'text' && text !== undefined) {
      return (
        <div className={style.toolArtifactPreviewCode}>
          <Suspense fallback={<ToolArtifactTextFallback value={text} />}>
            <LazyCodeMirrorPreview
              language={getToolArtifactCodeLanguage(
                source.filename,
                source.mime,
              )}
              value={text}
            />
          </Suspense>
        </div>
      );
    }

    return (
      <ToolArtifactPreviewStatus>
        {I18N.carbonAgent.filePreviewUnsupported}
      </ToolArtifactPreviewStatus>
    );
  };

  return (
    <div className={style.toolArtifactPreview} ref={previewRef}>
      <div className={style.toolArtifactPreviewHeader}>
        <span>{I18N.carbonAgent.filePreview}</span>
      </div>
      <div className={style.toolArtifactPreviewBody}>{renderPreviewBody()}</div>
    </div>
  );
};

const WorkspaceArtifactDownloadResult = ({
  result,
  sessionId,
  shareId,
  uploadedFileIds,
}: {
  result: WorkspaceArtifactExportResult;
  sessionId?: string;
  shareId?: string;
  uploadedFileIds: ReadonlySet<string>;
}) => {
  const [downloading, setDownloading] = useState(false);
  const resolvedFileRef = useRef<WorkspaceArtifactResolvedFile>();
  const isUploadedFile = isUploadedWorkspaceArtifact(result, uploadedFileIds);
  const sizeText = formatToolFileSize(result.size);
  const metaItems = [result.mime, sizeText].filter(Boolean);

  useEffect(() => {
    resolvedFileRef.current = undefined;
  }, [
    result.artifactId,
    result.fileId,
    result.filename,
    result.mime,
    result.sessionId,
    sessionId,
    shareId,
  ]);

  const resolveFile = useCallback(async () => {
    if (resolvedFileRef.current) {
      return resolvedFileRef.current;
    }

    const file = await resolveWorkspaceArtifactFile(result, shareId, sessionId);
    resolvedFileRef.current = file;

    return file;
  }, [
    result.artifactId,
    result.fileId,
    result.filename,
    result.mime,
    result.sessionId,
    sessionId,
    shareId,
  ]);

  const handleDownload = async () => {
    setDownloading(true);
    const hideLoading = antdMessage.loading(
      I18N.carbonAgent.fetchingDownloadLink,
      0,
    );

    try {
      const file = await resolveFile();

      saveAs(file.downloadUrl, file.filename);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry;

      antdMessage.error(errorMessage);
    } finally {
      hideLoading();
      setDownloading(false);
    }
  };

  return (
    <>
      <div className={style.toolArtifactDownload}>
        <span className={style.toolArtifactDownloadIcon} aria-hidden='true'>
          {getToolFileExtension(result.filename)}
        </span>
        <span className={style.toolArtifactDownloadBody}>
          <span
            className={style.toolArtifactDownloadTitle}
            title={result.filename}
          >
            {result.filename}
          </span>
          {metaItems.length ? (
            <span className={style.toolArtifactDownloadMeta}>
              {metaItems.join(' · ')}
            </span>
          ) : null}
        </span>
        <button
          className={style.toolArtifactDownloadButton}
          disabled={downloading}
          type='button'
          onClick={handleDownload}
        >
          {downloading
            ? I18N.carbonAgent.fetchingDownloadLink
            : I18N.carbonAgent.download}
        </button>
      </div>
      {!isUploadedFile ? (
        <ToolArtifactPreview result={result} resolveFile={resolveFile} />
      ) : null}
    </>
  );
};

type ToolProcessSummaryProps = {
  callCount?: number;
  toolCall: AgentToolCall;
};

const ToolProcessSummary = ({
  callCount,
  toolCall,
}: ToolProcessSummaryProps) => {
  const tone = getToolStatusTone(toolCall.status);

  return (
    <summary className={style.toolProcessSummary}>
      <span
        className={`${style.toolProcessIcon} ${
          style[`toolProcessIcon-${tone}`]
        }`}
      />
      <span className={style.toolProcessText}>
        {getToolProcessText(toolCall, callCount)}
      </span>
      {toolCall.status ? (
        <b className={style.toolProcessStatus}>
          {getToolStatusLabel(toolCall.status)}
        </b>
      ) : null}
    </summary>
  );
};

const ToolProcessItem = ({
  liveWorkspaceOpen,
  liveWorkspaceSession,
  sessionId,
  shareId,
  toolCall,
  uploadedFileIds,
  onFactorOpen,
  onOpenLiveWorkspace,
}: {
  liveWorkspaceOpen?: boolean;
  liveWorkspaceSession?: AgentWorkspaceLiveSession;
  sessionId?: string;
  shareId?: string;
  toolCall: AgentToolCall;
  uploadedFileIds: ReadonlySet<string>;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  onOpenLiveWorkspace?: (session?: AgentWorkspaceLiveSession) => void;
}) => {
  const meta = getToolCallMeta(toolCall);
  const liveSession = getWorkspaceLiveSessionFromToolCall(toolCall);
  const artifactExport = getWorkspaceArtifactExportResult(toolCall);
  const operationReportDownload =
    !shareId && ['COMPLETED', 'SUCCESS'].includes(toolCall.status || '')
      ? getOperationReportDownloadAccess(toolCall.payload, sessionId)
      : undefined;
  const isUploadedFile = isUploadedWorkspaceArtifact(
    artifactExport,
    uploadedFileIds,
  );
  const result = getToolCallResult(toolCall);
  const toolName = getToolCallName(toolCall);
  const toolCallTime = formatToolCallTime(toolCall.createTime);
  const shouldShowResult = Boolean(
    !operationReportDownload?.fileId &&
      (liveSession ||
        artifactExport ||
        operationReportDownload ||
        (result && !isHiddenToolResultName(toolName))),
  );
  const customToolResult = getCustomToolProcessResult({
    onFactorOpen,
    rawToolName: toolCall.toolName,
    result,
    toolName,
  });
  // Only deduplicate against a fully visible raw result; custom cards may omit fields.
  const isDuplicateError = Boolean(
    toolCall.errorMessage &&
      shouldShowResult &&
      !liveSession &&
      !operationReportDownload &&
      !artifactExport &&
      !customToolResult &&
      formatJsonString(toolCall.errorMessage).trim() === result.trim(),
  );
  const shouldShowError = Boolean(toolCall.errorMessage && !isDuplicateError);
  const hasDetails = Boolean(
    shouldShowError || meta.length || shouldShowResult,
  );

  return (
    <details
      className={style.toolProcessItem}
      open={Boolean(
        liveSession ||
          (operationReportDownload && !operationReportDownload.fileId) ||
          (artifactExport && !isUploadedFile),
      )}
    >
      <ToolProcessSummary toolCall={toolCall} />
      {hasDetails ? (
        <div className={style.toolProcessDetail}>
          {shouldShowError ? (
            <p className={style.toolProcessError}>
              {publicToolText(toolCall.errorMessage || '')}
            </p>
          ) : null}
          {meta.length ? (
            <p className={style.toolProcessMeta}>{meta.join(' · ')}</p>
          ) : null}
          {shouldShowResult ? (
            <div className={style.toolProcessResultCard}>
              <div className={style.toolProcessResultHeader}>
                <span>{I18N.carbonAgent.callResult}</span>
                <div className={style.toolProcessResultHeaderMeta}>
                  <b>{toolName}</b>
                  {toolCallTime ? (
                    <time dateTime={toolCall.createTime}>{toolCallTime}</time>
                  ) : null}
                </div>
              </div>
              {liveSession ? (
                <WorkspaceLiveSessionResult
                  liveWorkspaceOpen={liveWorkspaceOpen}
                  liveWorkspaceSession={liveWorkspaceSession}
                  result={liveSession}
                  onOpenLiveWorkspace={onOpenLiveWorkspace}
                />
              ) : operationReportDownload ? (
                <CbamOperationReportDownload access={operationReportDownload} />
              ) : artifactExport ? (
                <WorkspaceArtifactDownloadResult
                  result={artifactExport}
                  sessionId={sessionId}
                  shareId={shareId}
                  uploadedFileIds={uploadedFileIds}
                />
              ) : (
                customToolResult || (
                  <pre className={style.toolProcessResult}>{result}</pre>
                )
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </details>
  );
};

const ToolProcessGroupItem = ({
  callCount,
  liveWorkspaceOpen,
  liveWorkspaceSession,
  sessionId,
  shareId,
  toolCall,
  toolCalls,
  uploadedFileIds,
  onFactorOpen,
  onOpenLiveWorkspace,
}: {
  callCount?: number;
  liveWorkspaceOpen?: boolean;
  liveWorkspaceSession?: AgentWorkspaceLiveSession;
  sessionId?: string;
  shareId?: string;
  toolCall: AgentToolCall;
  toolCalls: AgentToolCall[];
  uploadedFileIds: ReadonlySet<string>;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  onOpenLiveWorkspace?: (session?: AgentWorkspaceLiveSession) => void;
}) => (
  <details
    className={style.toolProcessItem}
    open={toolCalls.some(groupToolCall =>
      Boolean(
        getWorkspaceLiveSessionFromToolCall(groupToolCall) ||
          getWorkspaceArtifactExportResult(groupToolCall),
      ),
    )}
  >
    <ToolProcessSummary callCount={callCount} toolCall={toolCall} />
    <div className={style.toolProcessGroupList}>
      {toolCalls.map(groupToolCall => (
        <ToolProcessItem
          key={getToolCallKey(groupToolCall)}
          liveWorkspaceOpen={liveWorkspaceOpen}
          liveWorkspaceSession={liveWorkspaceSession}
          sessionId={sessionId}
          shareId={shareId}
          toolCall={groupToolCall}
          uploadedFileIds={uploadedFileIds}
          onFactorOpen={onFactorOpen}
          onOpenLiveWorkspace={onOpenLiveWorkspace}
        />
      ))}
    </div>
  </details>
);

const DEFAULT_FEEDBACK_CATEGORY = 'incorrect_or_incomplete';
const MAX_FEEDBACK_DETAIL_LENGTH = 1000;

const getAnswerMessageId = ({
  blocks,
  cards,
  messageId,
  toolCalls,
}: {
  blocks: AgentMessageBlock[];
  cards: AgentMessageCard[];
  messageId?: string;
  toolCalls: AgentToolCall[];
}) =>
  messageId ||
  blocks.find(block => block.messageId)?.messageId ||
  cards.find(card => card.messageId)?.messageId ||
  toolCalls.find(toolCall => toolCall.messageId)?.messageId ||
  '';

const getAnswerCopyText = (blocks: AgentMessageBlock[]) =>
  blocks
    .map(block => block.content.trim())
    .filter(Boolean)
    .join('\n\n');

const AnswerMessage = ({
  onMonitorFilesSelect,
  answerControls,
  blocks,
  cards,
  copyOnly = false,
  enterpriseCarbonReviewCertificationDisabled,
  feedback,
  feedbackSource = 'agent_web',
  interactionDisabled = false,
  liveWorkspaceOpen = false,
  liveWorkspaceSession,
  messageId,
  previewOpen = false,
  sessionId,
  shareId,
  showThirdPartyCertification = true,
  showActionsByDefault = false,
  streaming = false,
  toolCalls,
  uploadedAttachments,
  onActionRequestSubmit,
  onErrorFeedback,
  onErrorRetry,
  onFormRequestSubmit,
  onBusinessCardOpen,
  onFactorOpen,
  onOpenAccountingManagement,
  onOpenLiveWorkspace,
  onOpenPreview,
}: AnswerMessageProps) => {
  const items: AnswerItem[] = useMemo(() => {
    const nextItems: AnswerItem[] = [
      ...blocks
        .filter(block => block.content)
        .map(block => ({
          block,
          id: block.flowId || `${block.messageId}-${block.blockId}`,
          orderNo: block.streamOrderNo ?? block.orderNo,
          type: 'block' as const,
        })),
      ...operationAdviceCards(
        operationReportCards(
          monitorCards(cards, toolCalls),
          toolCalls,
          sessionId,
        ),
        toolCalls,
      )
        .filter(card => !isLegacyProductModelCard(card))
        .map(card => ({
          card,
          id: `${card.messageId}-${card.cardType || 'card'}-${card.orderNo}-${
            card.card.fileId || ''
          }`,
          orderNo: card.streamOrderNo ?? card.orderNo,
          type: 'card' as const,
        })),
      ...getGroupedToolCallItems(toolCalls, streaming),
    ].sort((prev, next) => prev.orderNo - next.orderNo);

    return dedupeAnswerItems(nextItems, streaming);
  }, [blocks, cards, sessionId, streaming, toolCalls]);
  const actionMessageId = useMemo(
    () => getAnswerMessageId({ blocks, cards, messageId, toolCalls }),
    [blocks, cards, messageId, toolCalls],
  );
  const factorCitations = useMemo(
    () => getCcdbFactorCitations(toolCalls),
    [toolCalls],
  );
  const uploadedFileIds = useMemo(
    () =>
      new Set(
        uploadedAttachments?.flatMap(attachment =>
          attachment.fileId ? [attachment.fileId] : [],
        ),
      ),
    [uploadedAttachments],
  );
  const feedbackDetailInputId = useMemo(
    () =>
      `answer-feedback-detail-${String(actionMessageId || messageId).replace(
        /[^a-zA-Z0-9_-]/g,
        '-',
      )}`,
    [actionMessageId, messageId],
  );
  const answerCopyText = useMemo(
    () =>
      getAnswerCopyText(
        items.flatMap(item => (item.type === 'block' ? [item.block] : [])),
      ),
    [items],
  );
  const [copied, setCopied] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    AgentFeedbackType | undefined
  >(() => feedback?.feedbackType);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCategories, setFeedbackCategories] = useState<
    AgentFeedbackCategory[]
  >([]);
  const [feedbackCategoriesLoading, setFeedbackCategoriesLoading] =
    useState(false);
  const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState(
    feedback?.feedbackCategory || DEFAULT_FEEDBACK_CATEGORY,
  );
  const [feedbackDetail, setFeedbackDetail] = useState('');
  const canRenderActions = Boolean(actionMessageId && !streaming);
  const feedbackUnavailable = !actionMessageId || !sessionId;
  const normalizedFeedbackDetail = feedbackDetail.trim();
  const canSubmitDislikeFeedback = Boolean(
    selectedFeedbackCategory && normalizedFeedbackDetail,
  );

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    setFeedbackType(feedback?.feedbackType);
    setFeedbackModalOpen(false);
    setSelectedFeedbackCategory(
      feedback?.feedbackCategory || DEFAULT_FEEDBACK_CATEGORY,
    );
    setFeedbackDetail('');
  }, [actionMessageId, feedback?.feedbackCategory, feedback?.feedbackType]);

  const ensureFeedbackCategories = async () => {
    if (feedbackCategories.length) {
      return feedbackCategories;
    }

    setFeedbackCategoriesLoading(true);

    try {
      const categories = await fetchAgentFeedbackCategories();
      setFeedbackCategories(categories);
      setSelectedFeedbackCategory(
        categories[0]?.code || DEFAULT_FEEDBACK_CATEGORY,
      );

      return categories;
    } catch {
      antdMessage.error(I18N.carbonAgent.feedbackCategoriesLoadFailed);

      return [];
    } finally {
      setFeedbackCategoriesLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!answerCopyText) {
      return;
    }

    const copySuccess = copy(answerCopyText);
    setCopied(copySuccess);

    if (copySuccess) {
      antdMessage.success(I18N.carbonAgent.copiedAnswer);
      return;
    }

    antdMessage.error(I18N.carbonAgent.copyFailed);
  };

  const submitFeedback = async ({
    category,
    detail,
    type,
  }: {
    category?: string;
    detail?: string;
    type: AgentFeedbackType;
  }) => {
    if (feedbackUnavailable) {
      antdMessage.warning(I18N.carbonAgent.answerFeedbackMissingInfo);
      return;
    }

    setFeedbackSubmitting(true);

    try {
      await submitAgentMessageFeedback(actionMessageId, {
        feedbackCategory: category,
        feedbackDetail: detail,
        feedbackType: type,
        source: feedbackSource,
      });
      setFeedbackType(type);
      setFeedbackModalOpen(false);
      antdMessage.success(I18N.carbonAgent.answerFeedbackSubmitted);
    } catch {
      antdMessage.error(I18N.carbonAgent.answerFeedbackFailed);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const cancelFeedback = async () => {
    if (feedbackUnavailable) {
      antdMessage.warning(I18N.carbonAgent.answerFeedbackMissingInfo);
      return;
    }

    setFeedbackSubmitting(true);

    try {
      await cancelAgentMessageFeedback(sessionId!, actionMessageId);
      setFeedbackType(undefined);
      antdMessage.success(I18N.carbonAgent.answerFeedbackCanceled);
    } catch {
      antdMessage.error(I18N.carbonAgent.answerFeedbackCancelFailed);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleLikeFeedback = async () => {
    if (feedbackType === '1') {
      await cancelFeedback();
      return;
    }

    await submitFeedback({ type: '1' });
  };

  const handleDislikeFeedback = async () => {
    if (feedbackType === '2') {
      await cancelFeedback();
      return;
    }

    setFeedbackModalOpen(true);
    await ensureFeedbackCategories();
  };

  const handleSubmitDislikeFeedback = async () => {
    if (!normalizedFeedbackDetail) {
      antdMessage.warning(I18N.carbonAgent.answerFeedbackDetailRequired);
      return;
    }

    const category =
      selectedFeedbackCategory ||
      feedbackCategories[0]?.code ||
      DEFAULT_FEEDBACK_CATEGORY;

    await submitFeedback({
      category,
      detail: normalizedFeedbackDetail,
      type: '2',
    });
  };
  const showFeedbackTooltip = feedbackSource !== 'agent_h5';
  const likeFeedbackLabel =
    feedbackType === '1'
      ? I18N.carbonAgent.cancelLikeAnswer
      : I18N.carbonAgent.likeAnswer;
  const dislikeFeedbackLabel =
    feedbackType === '2'
      ? I18N.carbonAgent.cancelDislikeAnswer
      : I18N.carbonAgent.dislikeAnswer;

  if (!items.length && !streaming && !toolCalls.length && !answerControls) {
    return null;
  }

  return (
    <article className={style.answerMessage} data-carbon-agent-answer='true'>
      {items.map(item => {
        if (item.type === 'block') {
          return (
            <section
              className={style.answerBlock}
              data-carbon-agent-answer-block='true'
              data-block-id={item.block.blockId}
              data-message-id={item.block.messageId}
              key={`${item.type}:${item.id}`}
            >
              <StreamingMarkdown
                content={item.block.content}
                factorCitations={factorCitations}
                onFactorOpen={onFactorOpen}
                sessionId={sessionId}
                shareId={shareId}
                streaming={streaming}
              />
            </section>
          );
        }

        if (item.type === 'card') {
          return (
            <AnswerCardItem
              sessionId={sessionId}
              shareId={shareId}
              onMonitorFilesSelect={onMonitorFilesSelect}
              card={item.card}
              copyOnly={copyOnly}
              enterpriseCarbonReviewCertificationDisabled={
                enterpriseCarbonReviewCertificationDisabled
              }
              interactionDisabled={interactionDisabled}
              key={`${item.type}:${item.id}`}
              messageId={item.card.messageId || messageId}
              onActionRequestSubmit={onActionRequestSubmit}
              onBusinessCardOpen={onBusinessCardOpen}
              onErrorFeedback={copyOnly ? undefined : onErrorFeedback}
              onErrorRetry={copyOnly ? undefined : onErrorRetry}
              onFormRequestSubmit={onFormRequestSubmit}
              onOpenAccountingManagement={onOpenAccountingManagement}
              showThirdPartyCertification={showThirdPartyCertification}
            />
          );
        }

        if (item.toolCalls?.length) {
          return (
            <ToolProcessGroupItem
              callCount={item.callCount}
              key={`${item.type}:${item.id}`}
              liveWorkspaceOpen={liveWorkspaceOpen}
              liveWorkspaceSession={liveWorkspaceSession}
              sessionId={sessionId}
              shareId={shareId}
              toolCall={item.toolCall}
              toolCalls={item.toolCalls}
              uploadedFileIds={uploadedFileIds}
              onFactorOpen={copyOnly ? undefined : onFactorOpen}
              onOpenLiveWorkspace={copyOnly ? undefined : onOpenLiveWorkspace}
            />
          );
        }

        return (
          <ToolProcessItem
            key={`${item.type}:${item.id}`}
            liveWorkspaceOpen={liveWorkspaceOpen}
            liveWorkspaceSession={liveWorkspaceSession}
            sessionId={sessionId}
            shareId={shareId}
            toolCall={item.toolCall}
            uploadedFileIds={uploadedFileIds}
            onFactorOpen={copyOnly ? undefined : onFactorOpen}
            onOpenLiveWorkspace={copyOnly ? undefined : onOpenLiveWorkspace}
          />
        );
      })}

      {streaming && !items.length ? <ThinkingIndicator /> : null}

      {!copyOnly && answerControls?.showStartModel && onOpenPreview ? (
        <button
          className={style.startModelButton}
          type='button'
          disabled={previewOpen || interactionDisabled}
          onClick={onOpenPreview}
        >
          {I18N.carbonAgent.startModeling}
        </button>
      ) : null}

      {canRenderActions ? (
        <div
          className={classNames(style.answerActions, {
            [style.answerActionsVisible]: showActionsByDefault,
          })}
          aria-label={I18N.carbonAgent.answerActions}
        >
          <Tooltip
            title={
              copied
                ? I18N.carbonAgent.copiedAnswer
                : I18N.carbonAgent.copyAnswer
            }
            placement='top'
          >
            <button
              className={classNames(style.answerActionButton, {
                [style.answerActionButtonActive]: copied,
              })}
              type='button'
              aria-label={I18N.carbonAgent.copyAnswer}
              disabled={!answerCopyText}
              onClick={handleCopyAnswer}
            >
              {copied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </Tooltip>
          {!copyOnly ? (
            <>
              <Tooltip
                title={showFeedbackTooltip ? likeFeedbackLabel : null}
                placement='top'
              >
                <button
                  className={classNames(style.answerActionButton, {
                    [style.answerActionButtonActive]: feedbackType === '1',
                  })}
                  type='button'
                  aria-label={likeFeedbackLabel}
                  disabled={feedbackSubmitting || interactionDisabled}
                  onClick={handleLikeFeedback}
                >
                  {feedbackType === '1' ? <LikeFilled /> : <LikeOutlined />}
                </button>
              </Tooltip>
              <Tooltip
                title={showFeedbackTooltip ? dislikeFeedbackLabel : null}
                placement='top'
              >
                <button
                  className={classNames(
                    style.answerActionButton,
                    style.answerActionButtonNegative,
                    {
                      [style.answerActionButtonNegativeActive]:
                        feedbackType === '2',
                    },
                  )}
                  type='button'
                  aria-label={dislikeFeedbackLabel}
                  disabled={feedbackSubmitting || interactionDisabled}
                  onClick={handleDislikeFeedback}
                >
                  {feedbackType === '2' ? (
                    <DislikeFilled />
                  ) : (
                    <DislikeOutlined />
                  )}
                </button>
              </Tooltip>
            </>
          ) : null}
        </div>
      ) : null}

      <span className={style.srOnly} aria-live='polite'>
        {copied ? I18N.carbonAgent.copiedAnswer : ''}
      </span>

      <Modal
        centered
        destroyOnClose
        open={feedbackModalOpen}
        className={style.answerFeedbackModal}
        width={558}
        title={I18N.carbonAgent.dislikeFeedbackTitle}
        onCancel={() => setFeedbackModalOpen(false)}
        footer={
          <div className={style.answerFeedbackFooter}>
            <button
              className={style.answerFeedbackCancelButton}
              type='button'
              disabled={feedbackSubmitting}
              onClick={() => setFeedbackModalOpen(false)}
            >
              {I18N.carbonAgent.cancel}
            </button>
            <button
              className={style.answerFeedbackSubmitButton}
              type='button'
              disabled={
                feedbackSubmitting ||
                feedbackCategoriesLoading ||
                !canSubmitDislikeFeedback
              }
              onClick={handleSubmitDislikeFeedback}
            >
              {feedbackSubmitting
                ? I18N.carbonAgent.submittingFeedback
                : I18N.carbonAgent.submit}
            </button>
          </div>
        }
      >
        <div className={style.answerFeedbackForm}>
          <div
            className={style.answerFeedbackCategoryGroup}
            role='radiogroup'
            aria-label={I18N.carbonAgent.dislikeFeedbackCategory}
          >
            {(feedbackCategories.length
              ? feedbackCategories
              : [
                  {
                    code: DEFAULT_FEEDBACK_CATEGORY,
                    name: I18N.carbonAgent
                      .feedbackCategoryIncorrectOrIncomplete,
                  },
                ]
            ).map(category => (
              <button
                className={classNames(style.answerFeedbackCategoryButton, {
                  [style.answerFeedbackCategoryButtonActive]:
                    selectedFeedbackCategory === category.code,
                })}
                type='button'
                role='radio'
                aria-checked={selectedFeedbackCategory === category.code}
                disabled={feedbackCategoriesLoading}
                key={category.code}
                onClick={() => setSelectedFeedbackCategory(category.code)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className={style.answerFeedbackField}>
            <label
              className={style.answerFeedbackFieldLabel}
              htmlFor={feedbackDetailInputId}
            >
              <span
                className={style.answerFeedbackRequiredMark}
                aria-hidden='true'
              >
                *
              </span>
              {I18N.carbonAgent.dislikeFeedbackDetail}
            </label>
            <div className={style.answerFeedbackTextareaWrap}>
              <textarea
                id={feedbackDetailInputId}
                className={style.answerFeedbackDetail}
                value={feedbackDetail}
                maxLength={MAX_FEEDBACK_DETAIL_LENGTH}
                placeholder={I18N.carbonAgent.dislikeFeedbackDetailPlaceholder}
                required
                aria-required='true'
                onChange={event => setFeedbackDetail(event.target.value)}
              />
              <span className={style.answerFeedbackCounter}>
                {feedbackDetail.length}/{MAX_FEEDBACK_DETAIL_LENGTH}
              </span>
            </div>
          </div>

          <div className={style.answerFeedbackNotice}>
            {I18N.carbonAgent.feedbackConversationNotice}
          </div>
        </div>
      </Modal>
    </article>
  );
};

export default memo(AnswerMessage);
