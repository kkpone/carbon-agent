/**
 * @file Carbon Agent 共享桌面预览容器；只负责各业务预览目标的标签和渲染接线。
 */
import { FileSearchOutlined, ShareAltOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import {
  ApplyForAccountStatus,
  ApplyForAccountStatusLabel,
} from '@src/views/carbonFootprint3/CarbonLabel/constant';
import { Dropdown, Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import type { RootState } from '@/store';
import type { AccountEmissionTaskTarget } from '@/views/carbonFootprint3/FootprintAccount/component/AccountInfoResult/type';
import WebOfficeSDK from '@/views/subModules/CarbonFootprintModel/WPSFile/web-office-sdk-solution-v2.0.7.es';

import CbamReportPreview from './CbamReportPreview';
import CbamMonitorPreview from './CbamMonitorPreview';
import CbamOperationReportPreview from './CbamOperationReportPreview';
import ExpertReviewDetailPanel from './ExpertReviewDetailPanel';
import Icon from './Icon';
import {
  PreviewDrawerCollapseIcon,
  PreviewExitFullscreenIcon,
  PreviewFullscreenIcon,
} from './PreviewPaneIcons';
import {
  getProductCarbonCertificateAccountIdsKey,
  getProductCarbonCertificateTabKey,
  mergeProductCarbonCertificateApplicationTargets,
} from './ProductCarbonCertificateApply/applicationTabs';
import { resolveProductCarbonCertificateEntry } from './ProductCarbonCertificateApply/entry';
import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateTargetFields,
} from './ProductCarbonCertificateApply/types';
import { useProductCarbonCertificateApplications } from './ProductCarbonCertificateApply/useProductCarbonCertificateApplications';
import { canDisplayProductCarbonCertificate } from './ProductCarbonCertificateApply/visibility';
import {
  getCarbonLabelAccountIdsKey,
  mergeCarbonLabelApplicationTargets,
} from './ProductCarbonLabelApply/applicationTabs';
import type { CarbonLabelSubmission } from './ProductCarbonLabelApply/types';
import { useCarbonLabelApplications } from './ProductCarbonLabelApply/useCarbonLabelApplications';
import {
  canDisplayCarbonLabel,
  getCarbonLabelTabKey,
  type CarbonLabelTargetFields,
} from './carbonLabelPreview';
import EnterpriseCarbonCertificationPreview from './enterpriseCarbonCertification/EnterpriseCarbonCertificationPreview';
import { ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE } from './enterpriseCarbonCertification/constants';
import type {
  EnterpriseCarbonCertificationPageType,
  EnterpriseCarbonCertificationRecord,
} from './enterpriseCarbonCertification/types';
import {
  getEnterpriseCarbonCertificationPageType,
  getEnterpriseCarbonCertificationProjectId,
  getEnterpriseCarbonCertificationRecordIdentity,
  getEnterpriseCarbonCertificationStatusName,
  getEnterpriseCarbonCertificationTabLabel,
  getEnterpriseCarbonCertificationTabTitle,
} from './enterpriseCarbonCertification/utils';
import EnterpriseCarbonExpertReviewDetail from './enterpriseCarbonExpertReview/EnterpriseCarbonExpertReviewDetail';
import type {
  EnterpriseCarbonExpertReviewDetail as EnterpriseCarbonExpertReviewDetailData,
  EnterpriseCarbonExpertReviewSnapshot,
} from './enterpriseCarbonExpertReview/types';
import {
  getEnterpriseCarbonExpertReviewIdentity,
  getEnterpriseCarbonExpertReviewTabLabel,
  getEnterpriseCarbonExpertReviewTabTitle,
} from './enterpriseCarbonExpertReview/utils';
import EnterpriseCarbonPreview from './enterpriseCarbonPreview';
import type {
  EnterpriseCarbonAccountingPermissions,
  EnterpriseCarbonAccountingPreviewTarget,
  EnterpriseCarbonPreviewView,
} from './enterpriseCarbonPreview/types';
import { canOpenExpertReviewDetail } from './expertReviewHelpers';
import { icons } from '../constants';
import {
  getReadyEnterpriseCarbonReportFiles,
  type EnterpriseCarbonReportFile,
} from '../enterpriseBusinessCard';
import style from '../index.module.less';
import {
  getWorkspaceLiveSessionIdentity,
  getWorkspaceLiveSessionUrl,
} from '../service';
import type {
  AgentCertificationItem,
  AgentExpertReviewStatus,
  AgentWorkspaceLiveSession,
} from '../service';

export type CertificationApplyAuthType = '0' | '3';

type PreviewPaneProps = {
  accountId?: string;
  accountRefreshKey?: string;
  activeTabKey?: PreviewTabKey;
  activeTabPlanId?: string;
  activeTabAccountId?: string;
  activeTabReportId?: string;
  activeTabReportUrl?: string;
  activeTabTrigger?: number;
  activeTabYear?: string;
  accountName?: string;
  agentSessionId?: string;
  certificationAccountId?: string;
  certificationAuthType?: CertificationApplyAuthType;
  certificationDraftAuthType?: CertificationApplyAuthType;
  certificationDetails?: AgentCertificationItem[];
  expertReviewDetail?: AgentExpertReviewStatus;
  expertReviewDetails?: AgentExpertReviewStatus[];
  enterpriseCarbonAccountingPermissions?: EnterpriseCarbonAccountingPermissions;
  enterpriseCarbonAccountingReadonly?: boolean;
  enterpriseCarbonReviewCertificationLoading?: boolean;
  enterpriseCarbonReviewCertificationReadonly?: boolean;
  activeTabEnterpriseCarbonBizId?: string;
  fullscreen: boolean;
  maxWidth: number;
  minWidth: number;
  open: boolean;
  previewTargets?: PreviewPaneTarget[];
  projectId?: string;
  productName?: string;
  productId?: string;
  readonly?: boolean;
  reportName?: string;
  reportId?: string;
  reportUrl?: string;
  shareAccountSearch?: string;
  shareAuth?: string;
  showBusinessForesight?: boolean;
  shareDisabled?: boolean;
  shareId?: string;
  shareLoading?: boolean;
  sessionId?: string;
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
  width: number;
  onClose: () => void;
  onCarbonLabelOpen?: (target?: PreviewPaneTarget) => void;
  onCarbonLabelSubmitted?: (
    key: string,
    application: CarbonLabelSubmission,
  ) => void;
  onAccountSuggestionReferenceSelect?: (content: string) => void;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
  onCertificationApplySubmitted?: (certificationId?: number | string) => void;
  onEnterpriseCarbonCertificationSubmitted?: (
    certificationId?: number | string,
  ) => void;
  onEnterpriseCarbonExpertReviewOpen?: (target?: PreviewPaneTarget) => void;
  onEnterpriseCarbonThirdPartyCertificationOpen?: (
    target?: PreviewPaneTarget,
    options?: { forceNew?: boolean },
  ) => void;
  onExpertReviewOpen?: (target?: PreviewPaneTarget) => void;
  onResizeBy: (delta: number) => void;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onShare?: () => void;
  onThirdPartyCertificationOpen?: (
    target?: PreviewPaneTarget,
    options?: { forceNew?: boolean },
  ) => void;
  onToggleFullscreen: () => void;
  reviewCertificationLoading?: boolean;
};

export type PreviewTabKey =
  | 'account'
  | 'carbonLabel'
  | `carbonLabel:${string}`
  | 'productCarbonCertificate'
  | `productCarbonCertificate:${string}`
  | 'cbamMonitor'
  | `cbamMonitor:${string}`
  | 'cbamOperationReport'
  | `cbamOperationReport:${string}`
  | 'cbamReport'
  | 'certification'
  | 'enterpriseCarbonAccounting'
  | 'enterpriseCarbonCertification'
  | 'enterpriseCarbonExpertReview'
  | 'enterpriseCarbonReport'
  | 'expertReview'
  | 'report'
  | 'workspace'
  | `account:${string}`
  | `cbamReport:${string}`
  | `certification:${string}`
  | `enterpriseCarbonAccounting:${string}`
  | `enterpriseCarbonCertification:${string}`
  | `enterpriseCarbonExpertReview:${string}`
  | `enterpriseCarbonReport:${string}`
  | `expertReview:${string}`
  | `report:${string}`
  | `workspace:${string}`;
type PreviewPaneTarget = CarbonLabelTargetFields &
  ProductCarbonCertificateTargetFields & {
    accountId?: string;
    accountName?: string;
    agentSessionId?: string;
    cbamId?: string;
    planId?: string;
    planName?: string;
    operationId?: string;
    certificationAuthType?: CertificationApplyAuthType;
    certificationDetails?: AgentCertificationItem[];
    certificationDraftAuthType?: CertificationApplyAuthType;
    expertReviewId?: number | string | null;
    expertReviewNo?: string | null;
    expertReviewStatus?: string | null;
    expertReviewStatusName?: string | null;
    enterpriseCarbonBizId?: string;
    enterpriseCarbonBizType?: 'account' | 'report';
    enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationRecord[];
    enterpriseCarbonCertificationDraft?: boolean;
    enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationPageType;
    enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetailData;
    enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewDetailData[];
    enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
    enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
    enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewSnapshot;
    productId?: string;
    productName?: string;
    reportId?: string;
    reportName?: string;
    reportUrl?: string;
    reportReadonly?: boolean;
    reportKind?: 'cbamMonitor' | 'cbamOperation';
    reportLabel?: string;
    refreshKey?: string;
    reviewDetail?: AgentExpertReviewStatus;
    reviewDetails?: AgentExpertReviewStatus[];
    shareAuth?: string;
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
type PreviewTabKind = NonNullable<PreviewPaneTarget['type']>;
type PreviewTabItem = CarbonLabelTargetFields &
  ProductCarbonCertificateTargetFields & {
    accountId?: string;
    accountName?: string;
    cbamId?: string;
    planId?: string;
    planName?: string;
    operationId?: string;
    certificationAuthType?: CertificationApplyAuthType;
    certificationDetail?: AgentCertificationItem;
    certificationDetails?: AgentCertificationItem[];
    certificationDraftAuthType?: CertificationApplyAuthType;
    detail?: AgentExpertReviewStatus;
    enterpriseCarbonBizId?: string;
    enterpriseCarbonBizType?: 'account' | 'report';
    enterpriseCarbonCertificationDetail?: EnterpriseCarbonCertificationRecord;
    enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationRecord[];
    enterpriseCarbonCertificationDraft?: boolean;
    enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationPageType;
    enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetailData;
    enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
    enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
    enterpriseCarbonTarget?: EnterpriseCarbonAccountingPreviewTarget;
    groupKey?: string;
    key: PreviewTabKey;
    kind: PreviewTabKind;
    label: string;
    productId?: string;
    productName?: string;
    reportId?: string;
    reportName?: string;
    reportUrl?: string;
    reportReadonly?: boolean;
    reportKind?: 'cbamMonitor' | 'cbamOperation';
    reportLabel?: string;
    refreshKey?: string;
    sourceTarget?: PreviewPaneTarget;
    shareAuth?: string;
    statusLabel?: string;
    title: string;
    workspaceLiveSession?: AgentWorkspaceLiveSession;
    year?: string;
    orgId?: string;
    certificationId?: number | string;
    applyNo?: string;
  };
type PreviewTabGroup = {
  key: string;
  label: string;
  tabs: PreviewTabItem[];
  title: string;
};

const getPreviewTabId = (key: PreviewTabKey) =>
  `carbon-agent-preview-tab-${key}`;
const getPreviewPanelId = (key: PreviewTabKey) =>
  `carbon-agent-preview-panel-${key}`;
const getPreviewGroupTabId = (key: string) =>
  `carbon-agent-preview-tab-group-${encodeURIComponent(key)}`;
const ACCOUNT_TAB_PREFIX = 'account:';
const CBAM_MONITOR_TAB_PREFIX = 'cbamMonitor:';
const CBAM_OPERATION_REPORT_TAB_PREFIX = 'cbamOperationReport:';
const CBAM_REPORT_TAB_PREFIX = 'cbamReport:';
const REPORT_TAB_PREFIX = 'report:';
const EXPERT_REVIEW_TAB_PREFIX = 'expertReview:';
const CERTIFICATION_TAB_PREFIX = 'certification:';
const PRODUCT_CARBON_CERTIFICATE_TAB_PREFIX = 'productCarbonCertificate:';
const ENTERPRISE_CARBON_ACCOUNTING_TAB_PREFIX = 'enterpriseCarbonAccounting:';
const ENTERPRISE_CARBON_CERTIFICATION_TAB_PREFIX =
  'enterpriseCarbonCertification:';
const ENTERPRISE_CARBON_EXPERT_REVIEW_TAB_PREFIX =
  'enterpriseCarbonExpertReview:';
const ENTERPRISE_CARBON_REPORT_TAB_PREFIX = 'enterpriseCarbonReport:';
const WORKSPACE_TAB_PREFIX = 'workspace:';
const getEnterpriseCarbonReportFileIdentity = (
  file?: EnterpriseCarbonReportFile,
) =>
  [file?.reportFileRecordId, file?.versionType, file?.path, file?.fileName]
    .filter(Boolean)
    .join(':');
const getEnterpriseCarbonPreviewViewOptions = (): {
  key: EnterpriseCarbonPreviewView;
  label: string;
}[] => [
  {
    key: 'canvas',
    label: I18N.carbonAgent.enterpriseCarbonCanvasView,
  },
  {
    key: 'list',
    label: I18N.carbonAgent.enterpriseCarbonListView,
  },
];
const isAccountPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'account' || key?.startsWith(ACCOUNT_TAB_PREFIX);
const isCbamMonitorPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'cbamMonitor' || key?.startsWith(CBAM_MONITOR_TAB_PREFIX);
const isCbamOperationReportPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'cbamOperationReport' ||
  key?.startsWith(CBAM_OPERATION_REPORT_TAB_PREFIX);
const isCbamReportPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'cbamReport' || key?.startsWith(CBAM_REPORT_TAB_PREFIX);
const isReportPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'report' || key?.startsWith(REPORT_TAB_PREFIX);
const isExpertReviewPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'expertReview' || key?.startsWith(EXPERT_REVIEW_TAB_PREFIX);
const isCertificationPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'certification' || key?.startsWith(CERTIFICATION_TAB_PREFIX);
const isProductCarbonCertificatePreviewTabKey = (key?: PreviewTabKey) =>
  key === 'productCarbonCertificate' ||
  key?.startsWith(PRODUCT_CARBON_CERTIFICATE_TAB_PREFIX);
const isEnterpriseCarbonAccountingPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'enterpriseCarbonAccounting' ||
  key?.startsWith(ENTERPRISE_CARBON_ACCOUNTING_TAB_PREFIX);
const isEnterpriseCarbonCertificationPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'enterpriseCarbonCertification' ||
  key?.startsWith(ENTERPRISE_CARBON_CERTIFICATION_TAB_PREFIX);
const isEnterpriseCarbonExpertReviewPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'enterpriseCarbonExpertReview' ||
  key?.startsWith(ENTERPRISE_CARBON_EXPERT_REVIEW_TAB_PREFIX);
const isEnterpriseCarbonReportPreviewTabKey = (key?: PreviewTabKey) =>
  key === 'enterpriseCarbonReport' ||
  key?.startsWith(ENTERPRISE_CARBON_REPORT_TAB_PREFIX);
const isWorkspacePreviewTabKey = (key?: PreviewTabKey) =>
  key === 'workspace' || key?.startsWith(WORKSPACE_TAB_PREFIX);
const getCertificationApplyAuthTypeFromItem = (
  item?: AgentCertificationItem | null,
): CertificationApplyAuthType => {
  const authType = String(
    item?.authType ??
      item?.auth_type ??
      item?.certificationAuthType ??
      item?.certification_auth_type ??
      '',
  );

  return authType === '3' ? '3' : '0';
};
const getCertificationPreviewId = (detail?: AgentCertificationItem | null) =>
  detail?.certificationId ?? detail?.id ?? detail?.accountId;
const getCertificationProjectId = (detail?: AgentCertificationItem | null) =>
  detail?.certificationId ??
  (detail?.applyNo || detail?.projectNo ? detail?.id : undefined);
const getCertificationPreviewStatus = (
  detail?: AgentCertificationItem | null,
) => detail?.certificationStatus ?? detail?.status;
const getCertificationPreviewStatusName = (
  detail?: AgentCertificationItem | null,
) => detail?.certificationStatusName || detail?.statusName;
const getCertificationPreviewTabKey = (
  detail: AgentCertificationItem,
  index: number,
): PreviewTabKey =>
  `${CERTIFICATION_TAB_PREFIX}${encodeURIComponent(
    [
      getCertificationPreviewId(detail),
      getCertificationApplyAuthTypeFromItem(detail),
      getCertificationPreviewStatus(detail),
      index,
    ]
      .filter(value => value !== undefined && value !== null && value !== '')
      .join(':'),
  )}`;
const getScopedCertificationPreviewTabKey = (
  detail: AgentCertificationItem,
  index: number,
  accountId: string,
): PreviewTabKey =>
  `${CERTIFICATION_TAB_PREFIX}${encodeURIComponent(
    [
      accountId,
      getCertificationPreviewId(detail),
      getCertificationApplyAuthTypeFromItem(detail),
      getCertificationPreviewStatus(detail),
      index,
    ]
      .filter(value => value !== undefined && value !== null && value !== '')
      .join(':'),
  )}`;
const getScopedCertificationDraftTabKey = (
  authType: CertificationApplyAuthType,
  accountId: string,
): PreviewTabKey =>
  `${CERTIFICATION_TAB_PREFIX}${encodeURIComponent(
    [accountId, 'draft', authType].join(':'),
  )}`;
const getCertificationPreviewTabTitle = (
  detail: AgentCertificationItem,
  index: number,
) => {
  const applyTitle = getCertificationApplyTitle(
    getCertificationApplyAuthTypeFromItem(detail),
  );
  const statusName = getCertificationPreviewStatusName(detail);

  return statusName
    ? `${applyTitle} - ${statusName}`
    : applyTitle || `${I18N.carbonAgent.thirdPartyCertification}${index + 1}`;
};
const getCertificationPreviewTabLabel = (
  detail: AgentCertificationItem,
  index: number,
) =>
  getCertificationApplyTitle(getCertificationApplyAuthTypeFromItem(detail)) ||
  getCertificationPreviewStatusName(detail) ||
  `${I18N.carbonAgent.thirdPartyCertification}${index + 1}`;
const getExpertReviewPreviewTabKey = (
  detail: AgentExpertReviewStatus,
  index: number,
): PreviewTabKey =>
  `${EXPERT_REVIEW_TAB_PREFIX}${encodeURIComponent(
    getExpertReviewPreviewIdentity(detail, index),
  )}`;
const getScopedExpertReviewPreviewTabKey = (
  detail: AgentExpertReviewStatus,
  index: number,
  accountId: string,
): PreviewTabKey =>
  `${EXPERT_REVIEW_TAB_PREFIX}${encodeURIComponent(
    [accountId, getExpertReviewPreviewIdentity(detail, index)]
      .filter(Boolean)
      .join(':'),
  )}`;
const getExpertReviewPreviewIdentity = (
  detail: AgentExpertReviewStatus,
  index: number,
) =>
  String(
    detail.reviewId ||
      detail.reviewNo ||
      [
        detail.accountId,
        detail.snapAccountId,
        detail.reportId,
        detail.status,
        detail.statusName,
      ]
        .filter(Boolean)
        .join(':') ||
      index,
  );
const getExpertReviewPreviewTabTitle = (
  detail: AgentExpertReviewStatus,
  index: number,
) =>
  detail.reviewNo ||
  detail.statusName ||
  `${I18N.carbonAgent.expertReview}${index + 1}`;
const getExpertReviewPreviewTabLabel = (
  detail: AgentExpertReviewStatus,
  index: number,
) =>
  detail.statusName ||
  detail.reviewNo ||
  `${I18N.carbonAgent.expertReview}${index + 1}`;
const getOptionalPreviewString = (value?: unknown) =>
  value === undefined || value === null ? '' : String(value).trim();
const getPreviewTargetAccountId = (target?: PreviewPaneTarget | null) =>
  getOptionalPreviewString(target?.accountId) ||
  getOptionalPreviewString(target?.reviewDetail?.accountId) ||
  getOptionalPreviewString(target?.reviewDetail?.snapAccountId) ||
  getOptionalPreviewString(target?.certificationDetails?.[0]?.accountId);
const getPreviewTargetProductId = (target?: PreviewPaneTarget | null) =>
  getOptionalPreviewString(target?.productId) || undefined;
const getPreviewTargetExpertReviewDetail = (
  target?: PreviewPaneTarget | null,
): AgentExpertReviewStatus | undefined => {
  if (target?.reviewDetail) {
    return target.reviewDetail;
  }

  const reviewId = getOptionalPreviewString(target?.expertReviewId);
  const reviewNo = getOptionalPreviewString(target?.expertReviewNo);
  const status = getOptionalPreviewString(target?.expertReviewStatus);
  const statusName = getOptionalPreviewString(target?.expertReviewStatusName);

  if (!reviewId && !reviewNo && !status && !statusName) {
    return undefined;
  }

  const fallbackDetail: AgentExpertReviewStatus = {
    accountId: getPreviewTargetAccountId(target) || undefined,
    accountName: target?.accountName,
    productName: target?.productName,
    reportId: target?.reportId,
    reportUrl: target?.reportUrl,
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
const getPreviewTargetExpertReviewDetails = (
  target?: PreviewPaneTarget | null,
) => {
  if (target?.reviewDetails?.length) {
    return target.reviewDetails;
  }

  const fallbackDetail = getPreviewTargetExpertReviewDetail(target);

  return fallbackDetail ? [fallbackDetail] : [];
};
const getPreviewTargetDisplayName = (target?: PreviewPaneTarget | null) =>
  getOptionalPreviewString(target?.productName) ||
  getOptionalPreviewString(target?.accountName) ||
  getOptionalPreviewString(target?.title) ||
  getOptionalPreviewString(target?.reviewDetail?.productName) ||
  getOptionalPreviewString(target?.reviewDetail?.accountName) ||
  getOptionalPreviewString(target?.certificationDetails?.[0]?.productName) ||
  getOptionalPreviewString(target?.certificationDetails?.[0]?.accountName) ||
  getOptionalPreviewString(target?.certificationDetails?.[0]?.projectName) ||
  getOptionalPreviewString(target?.reportName);
const getPreviewGroupFallbackLabel = (accountId: string) =>
  accountId
    ? I18N.template(I18N.carbonAgent.projectWithId, { val1: accountId })
    : I18N.carbonAgent.accountingModel;
const getPreviewScopedTabKey = (
  prefix:
    | typeof ACCOUNT_TAB_PREFIX
    | typeof CBAM_MONITOR_TAB_PREFIX
    | typeof CBAM_OPERATION_REPORT_TAB_PREFIX
    | typeof CBAM_REPORT_TAB_PREFIX
    | typeof ENTERPRISE_CARBON_ACCOUNTING_TAB_PREFIX
    | typeof ENTERPRISE_CARBON_CERTIFICATION_TAB_PREFIX
    | typeof ENTERPRISE_CARBON_EXPERT_REVIEW_TAB_PREFIX
    | typeof ENTERPRISE_CARBON_REPORT_TAB_PREFIX
    | typeof REPORT_TAB_PREFIX,
  value: string,
  fallback: number,
): PreviewTabKey =>
  `${prefix}${encodeURIComponent(value || String(fallback))}` as PreviewTabKey;
const getEnterpriseCarbonAccountingTarget = (
  target: PreviewPaneTarget,
): EnterpriseCarbonAccountingPreviewTarget => ({
  type: 'enterpriseCarbonAccounting',
  year: target.year,
});
const getEnterpriseCarbonAccountingPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    ENTERPRISE_CARBON_ACCOUNTING_TAB_PREFIX,
    [target.year, index].filter(Boolean).join(':'),
    index,
  );
const getEnterpriseCarbonReportPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    ENTERPRISE_CARBON_REPORT_TAB_PREFIX,
    [
      target.enterpriseCarbonBizId,
      target.reportId,
      getEnterpriseCarbonReportFileIdentity(
        target.enterpriseCarbonSelectedFile,
      ) ||
        target.reportName ||
        String(index),
    ]
      .filter(Boolean)
      .join(':'),
    index,
  );

const getEnterpriseCarbonCertificationPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    ENTERPRISE_CARBON_CERTIFICATION_TAB_PREFIX,
    [
      target.enterpriseCarbonBizType,
      target.enterpriseCarbonBizId,
      target.year,
      target.certificationId,
      target.applyNo,
      target.refreshKey,
      target.enterpriseCarbonCertificationPageType,
      index,
    ]
      .filter(Boolean)
      .join(':'),
    index,
  );

const getPreferredEnterpriseCarbonCertificationPreviewTabKey = (
  tabs: PreviewTabItem[],
  activeYear?: string,
  activeEnterpriseCarbonBizId?: string,
  activeReportId?: string,
  readonly = false,
) => {
  const matchesActiveTarget = (tab: PreviewTabItem) => {
    if (activeYear && tab.year !== activeYear) {
      return false;
    }

    if (
      activeEnterpriseCarbonBizId &&
      tab.enterpriseCarbonBizId !== activeEnterpriseCarbonBizId
    ) {
      return false;
    }

    if (activeReportId && tab.reportId !== activeReportId) {
      return false;
    }

    return true;
  };

  if (!readonly) {
    const draftTab = tabs.find(tab => {
      if (!tab.enterpriseCarbonCertificationDraft) {
        return false;
      }

      return matchesActiveTarget(tab);
    });

    if (draftTab) {
      return draftTab.key;
    }
  }

  if (activeYear || activeEnterpriseCarbonBizId || activeReportId) {
    const targetTab = tabs.find(matchesActiveTarget);

    if (targetTab) {
      return targetTab.key;
    }
  }

  return tabs[0]?.key;
};
const getCbamReportPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    CBAM_REPORT_TAB_PREFIX,
    target.cbamId || String(index),
    index,
  );
const getCbamMonitorPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    CBAM_MONITOR_TAB_PREFIX,
    target.planId || String(index),
    index,
  );
const getCbamOperationReportPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    CBAM_OPERATION_REPORT_TAB_PREFIX,
    target.operationId || String(index),
    index,
  );
const getEnterpriseCarbonExpertReviewPreviewTabKey = (
  target: PreviewPaneTarget,
  detail: EnterpriseCarbonExpertReviewDetailData,
  index: number,
): PreviewTabKey =>
  getPreviewScopedTabKey(
    ENTERPRISE_CARBON_EXPERT_REVIEW_TAB_PREFIX,
    [
      target.year || detail?.year,
      target.enterpriseCarbonBizType,
      target.reportId || detail.reportId,
      getEnterpriseCarbonExpertReviewIdentity(detail, index),
    ]
      .filter(Boolean)
      .join(':'),
    index,
  );
const getReportPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
  grouped: boolean,
): PreviewTabKey => {
  if (!grouped) {
    return 'report';
  }

  return getPreviewScopedTabKey(
    REPORT_TAB_PREFIX,
    [
      getPreviewTargetAccountId(target),
      target.reportId,
      target.reportUrl,
      index,
    ]
      .filter(Boolean)
      .join(':'),
    index,
  );
};
const getAccountPreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
  grouped: boolean,
): PreviewTabKey => {
  if (!grouped) {
    return 'account';
  }

  return getPreviewScopedTabKey(
    ACCOUNT_TAB_PREFIX,
    [getPreviewTargetAccountId(target), target.productId, index]
      .filter(Boolean)
      .join(':'),
    index,
  );
};
const getWorkspacePreviewTabKey = (
  target: PreviewPaneTarget,
  index: number,
): PreviewTabKey => {
  const workspaceIdentity = getWorkspaceLiveSessionIdentity(
    target.workspaceLiveSession,
  );

  return `${WORKSPACE_TAB_PREFIX}${encodeURIComponent(
    workspaceIdentity ||
      [target.workspaceLiveSession?.scope, index].filter(Boolean).join(':') ||
      String(index),
  )}`;
};
const getPreviewTargetMergeKey = (target: PreviewPaneTarget, index: number) => {
  const accountId = getPreviewTargetAccountId(target);
  const type = target.type || 'account';

  if (type === 'carbonLabel') return getCarbonLabelTabKey(target);

  if (type === 'workspace') {
    const workspaceIdentity = getWorkspaceLiveSessionIdentity(
      target.workspaceLiveSession,
    );
    const workspaceKey = workspaceIdentity
      ? [type, workspaceIdentity].join('|')
      : [type, target.workspaceLiveSession?.scope].filter(Boolean).join('|');

    return workspaceKey || [type, index].join('|');
  }

  if (type === 'report') {
    const reportKey = [type, accountId, target.reportId, target.reportUrl]
      .filter(Boolean)
      .join('|');

    return reportKey || [type, index].join('|');
  }

  if (type === 'cbamReport') {
    return (
      [type, target.cbamId].filter(Boolean).join('|') || [type, index].join('|')
    );
  }

  if (type === 'cbamMonitor') {
    return (
      [type, target.planId].filter(Boolean).join('|') || [type, index].join('|')
    );
  }

  if (type === 'cbamOperationReport') {
    return (
      [type, target.operationId].filter(Boolean).join('|') ||
      [type, index].join('|')
    );
  }

  if (type === 'enterpriseCarbonAccounting') {
    const enterpriseCarbonKey = [type, target.year].filter(Boolean).join('|');

    return enterpriseCarbonKey || [type, index].join('|');
  }

  if (type === 'enterpriseCarbonCertification') {
    if (target.year) {
      // 企业碳认证列表以年度为查询范围，同一年只保留一个预览数据源。
      return [type, target.year].join('|');
    }

    const enterpriseCarbonCertificationKey = [
      type,
      target.enterpriseCarbonBizType,
      target.enterpriseCarbonBizId,
    ]
      .filter(Boolean)
      .join('|');

    if (enterpriseCarbonCertificationKey) {
      return enterpriseCarbonCertificationKey;
    }

    return [type, index].join('|');
  }

  if (type === 'enterpriseCarbonExpertReview') {
    const detail =
      target.enterpriseCarbonExpertReviewDetail ||
      target.enterpriseCarbonExpertReviewDetails?.[0];
    const reviewYear = target.year || detail?.year;
    const enterpriseCarbonBizType =
      target.enterpriseCarbonBizType ||
      detail?.enterpriseCarbonBizType ||
      (detail?.objectType === 'report' ? 'report' : 'account');
    const reportId =
      enterpriseCarbonBizType === 'report'
        ? target.reportId || detail?.reportId
        : undefined;
    const enterpriseCarbonExpertReviewKey = [
      type,
      enterpriseCarbonBizType,
      reviewYear,
      reportId,
    ]
      .filter(Boolean)
      .join('|');

    return enterpriseCarbonExpertReviewKey || [type, index].join('|');
  }

  if (type === 'enterpriseCarbonReport') {
    const enterpriseCarbonReportId =
      getOptionalPreviewString(target.enterpriseCarbonBizId) ||
      getOptionalPreviewString(target.reportId);

    if (enterpriseCarbonReportId) {
      return [type, enterpriseCarbonReportId].join('|');
    }

    const enterpriseCarbonReportKey = [
      type,
      target.year,
      target.reportName,
      target.reportUrl,
    ]
      .filter(Boolean)
      .join('|');

    return enterpriseCarbonReportKey || [type, index].join('|');
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

    return (
      [type, accountId, reviewKey].filter(Boolean).join('|') ||
      [type, index].join('|')
    );
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
        .join(',') ||
      target.certificationAuthType ||
      target.certificationDraftAuthType;

    return (
      [type, accountId, certificationKey].filter(Boolean).join('|') ||
      [type, index].join('|')
    );
  }

  return [type, accountId || target.productId || index]
    .filter(Boolean)
    .join('|');
};
const mergePreviewTargets = (...targetLists: PreviewPaneTarget[][]) => {
  const mergedTargets: PreviewPaneTarget[] = [];
  const targetIndexByKey = new Map<string, number>();
  const mergeTargetData = (
    existingTarget: PreviewPaneTarget,
    nextTarget: PreviewPaneTarget,
  ): PreviewPaneTarget => {
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

    return {
      ...existingTarget,
      ...nextTarget,
    };
  };

  targetLists.flat().forEach((target, index) => {
    if (!target?.type) {
      return;
    }

    const targetKey = getPreviewTargetMergeKey(target, index);
    const existingIndex = targetIndexByKey.get(targetKey);

    if (existingIndex === undefined) {
      targetIndexByKey.set(targetKey, mergedTargets.length);
      mergedTargets.push(target);
      return;
    }

    mergedTargets[existingIndex] = mergeTargetData(
      mergedTargets[existingIndex],
      target,
    );
  });

  return mergedTargets;
};
const emitPreviewLayoutUpdate = () => {
  window.dispatchEvent(new Event('resize'));
};
const refreshWpsMountLayout = (mount?: HTMLDivElement | null) => {
  const iframe = mount?.querySelector('iframe');

  if (iframe) {
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.display = 'block';
    iframe.style.border = '0';
  }

  emitPreviewLayoutUpdate();
};

const getPreviewAccountDetailUrl = ({
  accountId,
  productId,
  resultOnly,
  shareAccountSearch,
  shareAuth,
}: {
  accountId?: string;
  productId?: string;
  resultOnly?: boolean;
  shareAccountSearch?: string;
  shareAuth?: string;
}) => {
  if (shareAccountSearch !== undefined || shareAuth) {
    const searchParams = new URLSearchParams(shareAccountSearch || '');
    const resolvedAccountId = accountId || searchParams.get('accountId') || '';
    const resolvedShareAuth = shareAuth || searchParams.get('shareAuth') || '';

    if (resolvedAccountId) {
      searchParams.set('accountId', resolvedAccountId);
    }

    if (resolvedShareAuth) {
      searchParams.set('shareAuth', resolvedShareAuth);
    }

    if (!searchParams.get('productId') && productId) {
      searchParams.set('productId', productId);
    }

    if (!searchParams.get('lang')) {
      searchParams.set('lang', 'zh-CN');
    }

    if (!searchParams.get('listOrGraph')) {
      searchParams.set('listOrGraph', '1');
    }

    if (!searchParams.get('snapFlag')) {
      searchParams.set('snapFlag', '7');
    }

    if (!searchParams.get('status')) {
      searchParams.set('status', '2');
    }

    if (!searchParams.get('stepValue')) {
      searchParams.set('stepValue', '2');
    }

    return `${
      RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareLogin
    }?${searchParams.toString()}`;
  }

  const searchParams = new URLSearchParams({
    accountId: accountId || '8565',
    listOrGraph: '1',
    status: resultOnly ? '2' : '1',
    stepValue: resultOnly ? '2' : '1',
  });

  if (productId) {
    searchParams.set('productId', productId);
  } else if (!accountId) {
    searchParams.set('productId', '4923');
  }

  return `${
    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail
  }?${searchParams.toString()}`;
};

const AccountInfoPreview = lazy(
  () =>
    import(
      '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo'
    ),
);
const CertificationApplyPreview = lazy(
  () =>
    import(
      '@src/views/Certification/carbonFootprintCertification/certificationProject/applyPage'
    ),
);

const getCertificationApplyTitle = (authType: CertificationApplyAuthType) =>
  authType === '3'
    ? I18N.carbonAgent.thirdPartyCertificationLabelTitle
    : I18N.carbonAgent.thirdPartyCertificationFootprintTitle;

const EDITABLE_CERTIFICATION_STATUSES = new Set(['0', '3', '4', '5', '7', '8']);

const getCertificationApplyPageType = (
  detail?: AgentCertificationItem | null,
) => {
  const status = getCertificationPreviewStatus(detail);

  return status !== undefined &&
    status !== null &&
    EDITABLE_CERTIFICATION_STATUSES.has(String(status))
    ? 'edit'
    : 'show';
};

const getCertificationApplyUrl = (
  authType: CertificationApplyAuthType,
  detail?: AgentCertificationItem | null,
  readonly = false,
  context?: {
    accountId?: string;
    agentSessionId?: string;
    productId?: string;
  },
) => {
  const certificationId = getCertificationProjectId(detail);
  const searchParams = new URLSearchParams({
    authType,
    pageType: readonly
      ? 'show'
      : certificationId
      ? getCertificationApplyPageType(detail)
      : 'add',
  });

  if (certificationId !== undefined && certificationId !== null) {
    searchParams.set('id', String(certificationId));
  }

  if (detail?.applyNo) {
    searchParams.set('applyNo', detail.applyNo);
  }

  if (context?.productId) {
    searchParams.set('productId', context.productId);
  }

  if (context?.accountId) {
    searchParams.set('accountId', context.accountId);
  }

  if (context?.agentSessionId) {
    searchParams.set('agentSessionId', context.agentSessionId);
  }

  return `${
    RouteMaps.CarbonFootprintCertificationProjectApplay
  }?${searchParams.toString()}`;
};

export const PreviewAccountDetail = ({
  accountId,
  onEmissionTaskCreate,
  onSuggestionReferenceSelect,
  productId,
  refreshKey,
  resultOnly = false,
  readonly = false,
  showBusinessForesight = true,
  showResultOverview = false,
  shareAccountSearch,
  shareAuth,
}: {
  accountId?: string;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
  onSuggestionReferenceSelect?: (content: string) => void;
  productId?: string;
  refreshKey?: string;
  resultOnly?: boolean;
  readonly?: boolean;
  showBusinessForesight?: boolean;
  showResultOverview?: boolean;
  shareAccountSearch?: string;
  shareAuth?: string;
}) => {
  const previewUrl = getPreviewAccountDetailUrl({
    accountId,
    productId,
    resultOnly,
    shareAccountSearch,
    shareAuth,
  });
  const previewKey = [previewUrl, refreshKey].filter(Boolean).join('|');

  if (shareAccountSearch !== undefined || shareAuth) {
    return (
      <iframe
        className={style.previewShareAccountFrame}
        key={previewKey}
        src={previewUrl}
        title={I18N.carbonAgent.accountingModel}
      />
    );
  }

  return (
    <MemoryRouter initialEntries={[previewUrl]} key={previewKey}>
      <Suspense
        fallback={
          <div className={style.previewLoading}>
            <Spin />
          </div>
        }
      >
        <AccountInfoPreview
          embedded
          hideStepNavigation={resultOnly}
          previewMode='agent'
          readonly={readonly}
          showBusinessForesight={showBusinessForesight}
          showResultOverview={showResultOverview}
          onAISuggestionReferenceSelect={onSuggestionReferenceSelect}
          onEmissionTaskCreate={onEmissionTaskCreate}
        />
      </Suspense>
    </MemoryRouter>
  );
};

export const PreviewCertificationApply = ({
  accountId,
  agentSessionId,
  authType,
  detail,
  onSubmitted,
  productId,
  readonly = false,
}: {
  accountId?: string;
  agentSessionId?: string;
  authType: CertificationApplyAuthType;
  detail?: AgentCertificationItem;
  onSubmitted?: (certificationId?: number | string) => void;
  productId?: string;
  readonly?: boolean;
}) => {
  const previewUrl = getCertificationApplyUrl(authType, detail, readonly, {
    accountId,
    agentSessionId,
    productId,
  });

  return (
    <div className={style.previewCertificationApply}>
      <MemoryRouter initialEntries={[previewUrl]} key={previewUrl}>
        <Suspense
          fallback={
            <div className={style.previewLoading}>
              <Spin />
            </div>
          }
        >
          <CertificationApplyPreview embedded onSubmitted={onSubmitted} />
        </Suspense>
      </MemoryRouter>
    </div>
  );
};

const getReportFileName = (reportUrl: string, reportName?: string) => {
  if (reportName) {
    return /\.docx?$/i.test(reportName) ? reportName : `${reportName}.docx`;
  }

  const rawName =
    reportUrl.split('?')[0].split('/').pop() ||
    I18N.carbonAgent.reportFileNameDefault;

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
};

const getEnterpriseCarbonReportFileName = (
  file: EnterpriseCarbonReportFile,
  index: number,
) =>
  file.fileName ||
  file.versionTypeLabel ||
  I18N.template(I18N.carbonAgent.enterpriseCarbonReportFileDefaultName, {
    val1: index + 1,
  });

const getEnterpriseCarbonReportFileLabel = (
  file: EnterpriseCarbonReportFile,
  index: number,
) =>
  getEnterpriseCarbonReportFileName(file, index).replace(/\.[a-z0-9]+$/i, '');

const getReportOfficeType = (url: string) => {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';

  if (['doc', 'docx', 'wps', 'wpt', 'dot', 'dotx', 'rtf'].includes(ext)) {
    return 'w';
  }

  if (['xls', 'xlsx', 'et', 'csv', 'xlt', 'xlsm'].includes(ext)) {
    return 's';
  }

  if (['ppt', 'pptx', 'dps', 'dpt', 'pps', 'ppsx'].includes(ext)) {
    return 'p';
  }

  if (ext === 'pdf') {
    return 'f';
  }

  return 'w';
};

export const PreviewReportWord = ({
  open,
  readonly = false,
  reportName,
  reportUrl,
  sourceFileName,
}: {
  open: boolean;
  readonly?: boolean;
  reportName?: string;
  reportUrl?: string;
  sourceFileName?: string;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const wpsInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  )?.userInfo as
    | {
        userId?: string | number;
        username?: string;
        userName?: string;
      }
    | undefined;
  const registerApiPath =
    import.meta.env.REACT_APP_WPS_API_URL ||
    (process.env.REACT_APP_WPS_API_URL as string);
  const appId =
    import.meta.env.REACT_APP_WPS_APP_ID ||
    (process.env.REACT_APP_WPS_APP_ID as string);
  const file = useMemo(
    () => ({
      name: reportUrl
        ? sourceFileName === undefined
          ? getReportFileName(reportUrl, reportName)
          : sourceFileName || getReportFileName(reportUrl)
        : '',
      url: reportUrl || '',
    }),
    [reportName, reportUrl, sourceFileName],
  );
  const debounceSave = useMemo(
    () => debounce(() => wpsInstanceRef.current?.save?.(), 1000),
    [],
  );

  const destroyWps = () => {
    wpsInstanceRef.current?.destroy?.();
    wpsInstanceRef.current = null;
  };

  useEffect(
    () => () => {
      debounceSave.cancel();
      destroyWps();
    },
    [debounceSave],
  );

  useEffect(() => {
    if (!open || !file.url || !mountRef.current) {
      destroyWps();
      return;
    }

    let cancelled = false;

    const initWps = async () => {
      setLoading(true);
      setError('');

      try {
        if (!registerApiPath || !appId) {
          throw new Error(I18N.carbonAgent.onlineWordConfigMissing);
        }

        const res = await fetch(`${registerApiPath}/wps/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            filePermission: { update: readonly ? 0 : 1 },
            ossUrl: file.url,
            userId: `${userInfo?.userId ?? ''}`,
            userName: `${userInfo?.username ?? userInfo?.userName ?? ''}`,
          }),
        });
        const data: { fileId: string; message?: string; token: string } =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || I18N.carbonAgent.onlineWordRegisterFailed,
          );
        }

        if (cancelled) {
          return;
        }

        destroyWps();
        const instance = WebOfficeSDK.init({
          appId,
          fileId: data.fileId,
          mount: mountRef.current,
          officeType: getReportOfficeType(file.url),
          readOnly: readonly,
          token: data.token,
        });

        if (!readonly) {
          instance.ApiEvent?.AddApiEventListener?.(
            'DocumentSaveStatus',
            (saveStatus: { status?: number }) => {
              if (saveStatus?.status === 7) {
                debounceSave();
              }
            },
          );
        }

        wpsInstanceRef.current = instance;
        requestAnimationFrame(() => refreshWpsMountLayout(mountRef.current));
        window.setTimeout(() => refreshWpsMountLayout(mountRef.current), 180);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : I18N.carbonAgent.onlineWordOpenFailed,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initWps();

    return () => {
      cancelled = true;
      destroyWps();
    };
  }, [appId, debounceSave, file, open, readonly, registerApiPath, userInfo]);

  useEffect(() => {
    if (!open || !reportUrl || !mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    let animationFrame = 0;
    const scheduleRefresh = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        refreshWpsMountLayout(mount);
      });
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleRefresh)
        : undefined;

    scheduleRefresh();
    resizeObserver?.observe(mount);
    window.addEventListener('resize', scheduleRefresh);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleRefresh);
    };
  }, [open, reportUrl]);

  if (!reportUrl) {
    return (
      <div className={style.previewReportWord}>
        <div className={style.previewReportEmpty}>
          {I18N.carbonAgent.noReportUrl}
        </div>
      </div>
    );
  }

  return (
    <div className={style.previewReportWord}>
      {error ? (
        <div className={style.previewReportError}>
          <p>{error}</p>
          <button
            type='button'
            onClick={() => window.open(reportUrl, '_blank')}
          >
            {I18N.carbonAgent.openInNewWindow}
          </button>
        </div>
      ) : null}
      <Spin spinning={loading}>
        <div className={style.previewReportMount} ref={mountRef} />
      </Spin>
    </div>
  );
};

const getWorkspaceLiveSessionMeta = (session: AgentWorkspaceLiveSession) =>
  [
    session.provider,
    session.computerUseStatus,
    session.vncPort
      ? I18N.template(I18N.carbonAgent.workspaceLiveSessionPort, {
          val1: session.vncPort,
        })
      : '',
  ].filter(Boolean);

const WorkspaceLiveSessionPanel = ({
  readonly = false,
  session,
}: {
  readonly?: boolean;
  session: AgentWorkspaceLiveSession;
}) => {
  const workspaceUrl = getWorkspaceLiveSessionUrl(session);
  const workspaceIdentity = getWorkspaceLiveSessionIdentity(session);
  const [frameWorkspace, setFrameWorkspace] = useState(() => ({
    identity: workspaceIdentity,
    url: workspaceUrl,
  }));
  const frameWorkspaceUrl = frameWorkspace.url || workspaceUrl;
  const workspaceMeta = getWorkspaceLiveSessionMeta(session);

  useEffect(() => {
    setFrameWorkspace(prevFrameWorkspace => {
      const identityChanged =
        workspaceIdentity &&
        prevFrameWorkspace.identity &&
        workspaceIdentity !== prevFrameWorkspace.identity;
      const missingFrameUrl = !prevFrameWorkspace.url && workspaceUrl;

      if (!identityChanged && !missingFrameUrl) {
        return prevFrameWorkspace;
      }

      return {
        identity: workspaceIdentity,
        url: workspaceUrl,
      };
    });
  }, [workspaceIdentity, workspaceUrl]);

  return (
    <div className={style.workspaceLiveSessionPanel}>
      <div className={style.workspaceLiveSessionToolbar}>
        <div className={style.workspaceLiveSessionMeta}>
          <strong>{I18N.carbonAgent.workspaceLiveSession}</strong>
          {workspaceMeta.length ? (
            <span>{workspaceMeta.join(' / ')}</span>
          ) : null}
        </div>
        {/* {frameWorkspaceUrl && !readonly ? (
          <a
            className={style.workspaceLiveSessionOpenButton}
            href={frameWorkspaceUrl}
            rel='noreferrer'
            target='_blank'
          >
            {I18N.carbonAgent.openWorkspaceLiveSession}
          </a>
        ) : null} */}
      </div>
      <div className={style.workspaceLiveSessionFrameWrap}>
        {frameWorkspaceUrl ? (
          <>
            <iframe
              allow='clipboard-read; clipboard-write; fullscreen'
              className={style.workspaceLiveSessionFrame}
              src={frameWorkspaceUrl}
              title={I18N.carbonAgent.workspaceLiveSession}
            />
            {readonly ? (
              <div className={style.workspaceLiveSessionReadonlyMask}>
                <span>{I18N.carbonAgent.shareReadonly}</span>
              </div>
            ) : null}
          </>
        ) : (
          <div className={style.previewLoading}>
            {I18N.carbonAgent.workspaceLiveSessionUnavailable}
          </div>
        )}
      </div>
    </div>
  );
};

const CarbonLabelApplyPreview = lazy(() => import('./ProductCarbonLabelApply'));
const ProductCarbonCertificateApplyPreview = lazy(
  () => import('./ProductCarbonCertificateApply'),
);

const PreviewPane = ({
  accountId,
  accountRefreshKey,
  accountName,
  agentSessionId,
  activeTabEnterpriseCarbonBizId,
  activeTabAccountId,
  activeTabKey,
  activeTabPlanId,
  activeTabReportId,
  activeTabReportUrl,
  activeTabTrigger,
  activeTabYear,
  certificationAccountId,
  certificationAuthType,
  certificationDraftAuthType,
  certificationDetails,
  expertReviewDetail,
  expertReviewDetails,
  enterpriseCarbonAccountingPermissions,
  enterpriseCarbonAccountingReadonly,
  enterpriseCarbonReviewCertificationLoading = false,
  enterpriseCarbonReviewCertificationReadonly,
  fullscreen,
  maxWidth,
  minWidth,
  open,
  previewTargets,
  projectId,
  productName,
  productId,
  readonly = false,
  reportId,
  reportName,
  reportUrl,
  shareAccountSearch,
  shareAuth,
  showBusinessForesight = true,
  shareDisabled = false,
  shareId,
  shareLoading = false,
  sessionId,
  title,
  type = 'account',
  width,
  onClose,
  onCarbonLabelOpen,
  onCarbonLabelSubmitted,
  onAccountSuggestionReferenceSelect,
  onEmissionTaskCreate,
  onCertificationApplySubmitted,
  onEnterpriseCarbonCertificationSubmitted,
  onEnterpriseCarbonExpertReviewOpen,
  onEnterpriseCarbonThirdPartyCertificationOpen,
  onExpertReviewOpen,
  onResizeBy,
  onResizeStart,
  onShare,
  onThirdPartyCertificationOpen,
  onToggleFullscreen,
  reviewCertificationLoading,
}: PreviewPaneProps) => {
  const [reviewCertificationMenuOpen, setReviewCertificationMenuOpen] =
    useState(false);
  const reviewCertificationTriggerRef = useRef<HTMLButtonElement>(null);
  const closeReviewCertificationMenu = () => {
    setReviewCertificationMenuOpen(false);
    reviewCertificationTriggerRef.current?.focus();
  };
  const carbonLabelVisible = canDisplayCarbonLabel(
    readonly,
    shareId,
    window.innerWidth,
  );
  const productCarbonCertificateVisible = canDisplayProductCarbonCertificate(
    readonly,
    shareId,
    window.innerWidth,
  );
  const [
    localProductCarbonCertificateTargets,
    setLocalProductCarbonCertificateTargets,
  ] = useState<PreviewPaneTarget[]>([]);
  const enterpriseCarbonReviewCertificationIsReadonly =
    enterpriseCarbonReviewCertificationReadonly ?? readonly;
  let enterpriseCarbonCertificationSubmitted =
    onEnterpriseCarbonCertificationSubmitted;

  if (enterpriseCarbonReviewCertificationIsReadonly) {
    enterpriseCarbonCertificationSubmitted = undefined;
  }

  const hasAccountPreview = Boolean(accountId);
  const hasReportPreview = Boolean(reportUrl);
  const normalizedCertificationDetails = useMemo(
    () => certificationDetails || [],
    [certificationDetails],
  );
  const legacyCertificationTabs = useMemo(
    () =>
      normalizedCertificationDetails.map((detail, index) => ({
        accountId:
          getOptionalPreviewString(detail.accountId) ||
          certificationAccountId ||
          accountId,
        accountName:
          getOptionalPreviewString(detail.accountName) || accountName,
        certificationDetail: detail,
        certificationDetails: normalizedCertificationDetails,
        key: getCertificationPreviewTabKey(detail, index),
        label: getCertificationPreviewTabLabel(detail, index),
        kind: 'certification' as const,
        productId,
        productName:
          getOptionalPreviewString(detail.productName) || productName,
        reportId,
        reportName,
        reportUrl,
        statusLabel: getCertificationPreviewStatusName(detail) || undefined,
        title: getCertificationPreviewTabTitle(detail, index),
      })),
    [
      accountId,
      accountName,
      certificationAccountId,
      normalizedCertificationDetails,
      productId,
      productName,
      reportId,
      reportName,
      reportUrl,
    ],
  );
  const certificationAddAuthType = readonly
    ? undefined
    : certificationDraftAuthType ||
      (!legacyCertificationTabs.length ? certificationAuthType : undefined);
  const hasCertificationPreview = Boolean(
    certificationAddAuthType || legacyCertificationTabs.length,
  );
  const normalizedExpertReviewDetails = useMemo(
    () =>
      expertReviewDetails?.length
        ? expertReviewDetails
        : expertReviewDetail
        ? [expertReviewDetail]
        : [],
    [expertReviewDetail, expertReviewDetails],
  );
  const legacyExpertReviewTabs = useMemo(
    () =>
      normalizedExpertReviewDetails.map((detail, index) => ({
        detail,
        key: getExpertReviewPreviewTabKey(detail, index),
        label: getExpertReviewPreviewTabLabel(detail, index),
        kind: 'expertReview' as const,
        statusLabel: getExpertReviewPreviewTabLabel(detail, index),
        title: getExpertReviewPreviewTabTitle(detail, index),
      })),
    [normalizedExpertReviewDetails],
  );
  const hasExpertReviewPreview = legacyExpertReviewTabs.length > 0;
  const directPreviewTargets = useMemo<PreviewPaneTarget[]>(
    () =>
      [
        hasAccountPreview
          ? {
              accountId,
              accountName,
              productId,
              productName,
              refreshKey: accountRefreshKey,
              shareAuth,
              title,
              type: 'account' as const,
            }
          : undefined,
        hasReportPreview
          ? {
              accountId,
              accountName,
              productId,
              productName,
              reportId,
              reportName,
              reportUrl,
              shareAuth,
              title,
              type: 'report' as const,
            }
          : undefined,
        hasExpertReviewPreview
          ? {
              accountId,
              accountName,
              productId,
              productName,
              reportId,
              reportName,
              reportUrl,
              reviewDetail: normalizedExpertReviewDetails[0],
              reviewDetails: normalizedExpertReviewDetails,
              shareAuth,
              title,
              type: 'expertReview' as const,
            }
          : undefined,
        hasCertificationPreview
          ? {
              accountId: certificationAccountId || accountId,
              accountName,
              certificationAuthType,
              certificationDetails: normalizedCertificationDetails,
              certificationDraftAuthType,
              productId,
              productName,
              reportId,
              reportName,
              reportUrl,
              shareAuth,
              title,
              type: 'certification' as const,
            }
          : undefined,
      ].filter(Boolean) as PreviewPaneTarget[],
    [
      accountId,
      accountRefreshKey,
      accountName,
      certificationAccountId,
      certificationAuthType,
      certificationDraftAuthType,
      hasAccountPreview,
      hasCertificationPreview,
      hasExpertReviewPreview,
      hasReportPreview,
      normalizedCertificationDetails,
      normalizedExpertReviewDetails,
      productId,
      productName,
      reportId,
      reportName,
      reportUrl,
      shareAuth,
      title,
    ],
  );
  const sourcePreviewTargets = useMemo(
    () =>
      mergePreviewTargets(
        previewTargets || [],
        previewTargets?.length ? [] : directPreviewTargets,
      ).filter(target => target.type !== 'carbonLabel' || carbonLabelVisible),
    [carbonLabelVisible, directPreviewTargets, previewTargets],
  );
  const carbonLabelAccountIdsKey =
    getCarbonLabelAccountIdsKey(sourcePreviewTargets);
  const { applications, refreshApplications, updateApplication } =
    useCarbonLabelApplications({
      accountIdsKey: carbonLabelAccountIdsKey,
      enabled: carbonLabelVisible,
      open,
      sessionKey: agentSessionId || sessionId || '',
    });
  const labelMergedPreviewTargets = useMemo<PreviewPaneTarget[]>(
    () =>
      mergeCarbonLabelApplicationTargets(sourcePreviewTargets, applications),
    [sourcePreviewTargets, applications],
  );
  const productCarbonCertificateAccountIdsKey =
    getProductCarbonCertificateAccountIdsKey(labelMergedPreviewTargets);
  const {
    applications: productCarbonCertificateApplications,
    updateApplication: updateProductCarbonCertificateApplication,
  } = useProductCarbonCertificateApplications({
    accountIdsKey: productCarbonCertificateAccountIdsKey,
    enabled: productCarbonCertificateVisible,
    open,
    sessionKey: agentSessionId || sessionId || '',
  });
  useEffect(() => {
    setLocalProductCarbonCertificateTargets([]);
  }, [agentSessionId, sessionId]);
  const mergedPreviewTargets = useMemo<PreviewPaneTarget[]>(
    () =>
      mergeProductCarbonCertificateApplicationTargets(
        [...labelMergedPreviewTargets, ...localProductCarbonCertificateTargets],
        productCarbonCertificateApplications,
      ),
    [
      labelMergedPreviewTargets,
      localProductCarbonCertificateTargets,
      productCarbonCertificateApplications,
    ],
  );
  const carbonLabelPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(target => target.type === 'carbonLabel' && target.accountId)
        .map(target => ({
          ...target,
          key: getCarbonLabelTabKey(target),
          kind: 'carbonLabel' as const,
          label: I18N.carbonFootprint3.carbonLabel,
          statusLabel:
            ApplyForAccountStatusLabel[
              target.carbonLabelStatus ?? ApplyForAccountStatus.TO_BE_SUB
            ],
          title: target.carbonLabelApplicationId
            ? [
                I18N.carbonFootprint3.carbonLabel,
                target.carbonLabelApplyNum,
                ApplyForAccountStatusLabel[
                  target.carbonLabelStatus ?? ApplyForAccountStatus.TO_BE_SUB
                ],
              ]
                .filter(Boolean)
                .join(' · ')
            : I18N.carbonAgent.labelApplication.title,
          sourceTarget: target,
        })),
    [mergedPreviewTargets],
  );
  const productCarbonCertificatePreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(
          target =>
            target.type === 'productCarbonCertificate' && target.accountId,
        )
        .map(target => ({
          ...target,
          key: getProductCarbonCertificateTabKey(target),
          kind: 'productCarbonCertificate' as const,
          label: I18N.carbonAgent.certificateApplication.certificateTypeValue,
          sourceTarget: target,
          statusLabel: target.productCarbonCertificateStatusName,
          title: target.productCarbonCertificateStatusName
            ? `${I18N.carbonAgent.certificateApplication.certificateTypeValue} · ${target.productCarbonCertificateStatusName}`
            : I18N.carbonAgent.certificateApplication.title,
        })),
    [mergedPreviewTargets],
  );
  const productReportPreviewTabs = useMemo<PreviewTabItem[]>(() => {
    const reportTargets = mergedPreviewTargets.filter(
      target =>
        target.type === 'report' &&
        Boolean(target.reportUrl) &&
        (!shareId || !target.reportKind),
    );
    const hasMultipleReports = reportTargets.length > 1;

    return reportTargets.map((target, index) => ({
      accountId: getPreviewTargetAccountId(target),
      accountName: target.accountName,
      key: getReportPreviewTabKey(target, index, hasMultipleReports),
      kind: 'report',
      label: target.reportLabel || I18N.carbonAgent.productFootprintReport,
      productId: getPreviewTargetProductId(target),
      productName: target.productName,
      reportId: target.reportId,
      reportName: target.reportName,
      reportUrl: target.reportUrl,
      reportReadonly: target.reportReadonly,
      reportKind: target.reportKind,
      reportLabel: target.reportLabel,
      shareAuth: target.shareAuth,
      title: target.reportName || I18N.carbonAgent.productFootprintReport,
    }));
  }, [mergedPreviewTargets, shareId]);
  const cbamReportPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(
          target =>
            !shareId && target.type === 'cbamReport' && Boolean(target.cbamId),
        )
        .map((target, index) => ({
          cbamId: target.cbamId,
          key: getCbamReportPreviewTabKey(target, index),
          kind: 'cbamReport' as const,
          label: I18N.cbam.cbamNews,
          sourceTarget: target,
          title: target.title || I18N.cbam.cbamNews,
        })),
    [mergedPreviewTargets, shareId],
  );
  const cbamMonitorPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(
          target =>
            !shareId && target.type === 'cbamMonitor' && Boolean(target.planId),
        )
        .map((target, index) => ({
          key: getCbamMonitorPreviewTabKey(target, index),
          kind: 'cbamMonitor' as const,
          label: I18N.cbamMonitor.monitorManagement,
          planId: target.planId,
          planName: target.planName,
          refreshKey: target.refreshKey,
          sourceTarget: target,
          title: target.planName || I18N.cbamMonitor.monitorManagement,
        })),
    [mergedPreviewTargets, shareId],
  );
  const cbamOperationReportPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(
          target =>
            !shareId &&
            target.type === 'cbamOperationReport' &&
            Boolean(target.operationId),
        )
        .map((target, index) => ({
          key: getCbamOperationReportPreviewTabKey(target, index),
          kind: 'cbamOperationReport' as const,
          label: I18N.cbamOperationReport.operationReport,
          operationId: target.operationId,
          reportName: target.reportName,
          refreshKey: target.refreshKey,
          sourceTarget: target,
          title: target.reportName || I18N.cbamOperationReport.operationReport,
        })),
    [mergedPreviewTargets, shareId],
  );
  const previewAccountIds = useMemo(
    () =>
      Array.from(
        new Set(
          mergedPreviewTargets
            .map(target => getPreviewTargetAccountId(target))
            .filter(Boolean),
        ),
      ),
    [mergedPreviewTargets],
  );
  const shouldGroupProductPreviewTabs = previewAccountIds.length > 1;
  const workspacePreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(
          (
            target,
          ): target is PreviewPaneTarget & {
            workspaceLiveSession: AgentWorkspaceLiveSession;
          } =>
            target.type === 'workspace' && Boolean(target.workspaceLiveSession),
        )
        .map((target, index) => ({
          key: getWorkspacePreviewTabKey(target, index),
          kind: 'workspace',
          label: I18N.carbonAgent.workspaceLiveSession,
          title: target.title || I18N.carbonAgent.workspaceLiveSession,
          workspaceLiveSession: target.workspaceLiveSession,
        })),
    [mergedPreviewTargets],
  );
  const enterpriseCarbonAccountingPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(target => target.type === 'enterpriseCarbonAccounting')
        .map((target, index) => ({
          enterpriseCarbonTarget: getEnterpriseCarbonAccountingTarget(target),
          key: getEnterpriseCarbonAccountingPreviewTabKey(target, index),
          kind: 'enterpriseCarbonAccounting' as const,
          label: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
          refreshKey: target.refreshKey,
          sourceTarget: target,
          title:
            target.title ||
            I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
          year: target.year,
        })),
    [mergedPreviewTargets],
  );
  const enterpriseCarbonReportTargets = useMemo(
    () =>
      mergedPreviewTargets.filter(
        target => target.type === 'enterpriseCarbonReport',
      ),
    [mergedPreviewTargets],
  );
  const enterpriseCarbonCertificationPreviewTabs = useMemo<
    PreviewTabItem[]
  >(() => {
    const tabs: PreviewTabItem[] = [];

    mergedPreviewTargets.forEach((target, targetIndex) => {
      if (target.type !== 'enterpriseCarbonCertification') {
        return;
      }

      const certificationDetails =
        target.enterpriseCarbonCertificationDetails || [];

      certificationDetails.forEach((detail, detailIndex) => {
        const certificationId =
          getEnterpriseCarbonCertificationProjectId(detail);
        const pageType = getEnterpriseCarbonCertificationPageType(
          detail,
          enterpriseCarbonReviewCertificationIsReadonly,
        );
        const title = getEnterpriseCarbonCertificationTabTitle(detail);
        const label = getEnterpriseCarbonCertificationTabLabel();
        const { enterpriseCarbonBizId, enterpriseCarbonBizType, orgId, year } =
          target;
        const certificationReportId =
          getOptionalPreviewString(detail.reportId) ||
          getOptionalPreviewString(target.reportId) ||
          undefined;

        const tabTarget: PreviewPaneTarget = {
          ...target,
          applyNo: detail.applyNo || undefined,
          certificationId,
          enterpriseCarbonBizId,
          enterpriseCarbonBizType,
          enterpriseCarbonCertificationPageType: pageType,
          orgId,
          refreshKey: getEnterpriseCarbonCertificationRecordIdentity(
            detail,
            detailIndex,
          ),
          year,
        };

        tabs.push({
          applyNo: detail.applyNo || undefined,
          certificationId,
          enterpriseCarbonBizId,
          enterpriseCarbonBizType,
          enterpriseCarbonCertificationDetail: detail,
          enterpriseCarbonCertificationDetails: certificationDetails,
          enterpriseCarbonCertificationPageType: pageType,
          key: getEnterpriseCarbonCertificationPreviewTabKey(
            tabTarget,
            targetIndex + detailIndex,
          ),
          kind: 'enterpriseCarbonCertification',
          label,
          orgId,
          reportId: certificationReportId,
          sourceTarget: target,
          statusLabel: getEnterpriseCarbonCertificationStatusName(detail),
          title,
          year,
        });
      });

      const showDraft =
        Boolean(target.enterpriseCarbonCertificationDraft) &&
        !enterpriseCarbonReviewCertificationIsReadonly;

      if (showDraft) {
        const draftTarget: PreviewPaneTarget = {
          ...target,
          applyNo: undefined,
          certificationId: undefined,
          enterpriseCarbonCertificationPageType:
            ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD,
        };
        const title = I18N.carbonAgent.enterpriseCarbonCertificationTitle;

        tabs.push({
          enterpriseCarbonBizId: target.enterpriseCarbonBizId,
          enterpriseCarbonBizType: target.enterpriseCarbonBizType,
          enterpriseCarbonCertificationDetails: certificationDetails,
          enterpriseCarbonCertificationDraft: true,
          enterpriseCarbonCertificationPageType:
            ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD,
          key: getEnterpriseCarbonCertificationPreviewTabKey(
            draftTarget,
            targetIndex + certificationDetails.length,
          ),
          kind: 'enterpriseCarbonCertification',
          label: title,
          orgId: target.orgId,
          reportId: target.reportId,
          sourceTarget: target,
          title,
          year: target.year,
        });
      }
    });

    return tabs;
  }, [enterpriseCarbonReviewCertificationIsReadonly, mergedPreviewTargets]);
  const focusedEnterpriseCarbonReportTarget = useMemo(
    () =>
      enterpriseCarbonReportTargets[enterpriseCarbonReportTargets.length - 1],
    [enterpriseCarbonReportTargets],
  );
  const enterpriseCarbonReportPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      enterpriseCarbonReportTargets.flatMap((target, targetIndex) => {
        const files = getReadyEnterpriseCarbonReportFiles(
          target.enterpriseCarbonFiles,
        );
        const fileEntries = files.length
          ? files.map((file, index) => ({ file, index }))
          : target.reportUrl
          ? [{ file: target.enterpriseCarbonSelectedFile, index: 0 }]
          : [];

        return fileEntries.map(({ file, index }) => {
          const reportTabLabel = file
            ? getEnterpriseCarbonReportFileLabel(file, index)
            : (target.reportName || target.title || '').replace(
                /\.[a-z0-9]+$/i,
                '',
              ) || I18N.carbonAgent.enterpriseCarbonReportPreviewTitle;
          const reportName = file
            ? getEnterpriseCarbonReportFileName(file, index)
            : target.reportName;
          const tabTarget = {
            ...target,
            enterpriseCarbonSelectedFile: file,
          };

          return {
            enterpriseCarbonBizId: target.enterpriseCarbonBizId,
            enterpriseCarbonFiles: target.enterpriseCarbonFiles,
            enterpriseCarbonSelectedFile: file,
            key: getEnterpriseCarbonReportPreviewTabKey(
              tabTarget,
              targetIndex + index,
            ),
            kind: 'enterpriseCarbonReport' as const,
            label: reportTabLabel,
            refreshKey: target.refreshKey,
            reportId: target.reportId,
            reportName,
            reportUrl: file?.path || target.reportUrl,
            sourceTarget: tabTarget,
            title: reportTabLabel,
            year: target.year,
          };
        });
      }),
    [enterpriseCarbonReportTargets],
  );
  const enterpriseCarbonExpertReviewPreviewTabs = useMemo<PreviewTabItem[]>(
    () =>
      mergedPreviewTargets
        .filter(target => target.type === 'enterpriseCarbonExpertReview')
        .flatMap((target, targetIndex) => {
          let details = target.enterpriseCarbonExpertReviewDetails;

          if (!details?.length && target.enterpriseCarbonExpertReviewDetail) {
            details = [target.enterpriseCarbonExpertReviewDetail];
          }

          if (!details?.length) {
            return [];
          }

          return details.map((detail, detailIndex) => {
            const tabIndex = targetIndex + detailIndex;

            return {
              enterpriseCarbonBizId: target.enterpriseCarbonBizId,
              enterpriseCarbonBizType: target.enterpriseCarbonBizType,
              enterpriseCarbonExpertReviewDetail: detail,
              key: getEnterpriseCarbonExpertReviewPreviewTabKey(
                target,
                detail,
                tabIndex,
              ),
              kind: 'enterpriseCarbonExpertReview' as const,
              label: getEnterpriseCarbonExpertReviewTabLabel(
                detail,
                detailIndex,
              ),
              reportId: target.reportId,
              sourceTarget: target,
              statusLabel: getEnterpriseCarbonExpertReviewTabLabel(
                detail,
                detailIndex,
              ),
              title: getEnterpriseCarbonExpertReviewTabTitle(
                detail,
                detailIndex,
              ),
              year: target.year || detail.year || undefined,
            };
          });
        }),
    [mergedPreviewTargets],
  );
  const previewTargetExpertReviewTabs = useMemo<PreviewTabItem[]>(() => {
    const tabKeys = new Set(legacyExpertReviewTabs.map(tab => tab.key));
    const tabs: PreviewTabItem[] = [];

    mergedPreviewTargets.forEach((target, targetIndex) => {
      const targetReviewDetails = getPreviewTargetExpertReviewDetails(target);

      targetReviewDetails.forEach((detail, detailIndex) => {
        const key = getExpertReviewPreviewTabKey(
          detail,
          targetIndex + detailIndex,
        );

        if (tabKeys.has(key)) {
          return;
        }

        tabKeys.add(key);
        tabs.push({
          accountId: getPreviewTargetAccountId(target),
          accountName: target.accountName,
          detail,
          key,
          kind: 'expertReview',
          label: getExpertReviewPreviewTabLabel(detail, detailIndex),
          productId: getPreviewTargetProductId(target),
          productName: target.productName,
          reportId: target.reportId,
          reportName: target.reportName,
          reportUrl: target.reportUrl,
          shareAuth: target.shareAuth,
          statusLabel: getExpertReviewPreviewTabLabel(detail, detailIndex),
          title: getExpertReviewPreviewTabTitle(detail, detailIndex),
        });
      });
    });

    return tabs;
  }, [legacyExpertReviewTabs, mergedPreviewTargets]);
  const legacyProductPreviewTabs = useMemo(
    () =>
      [
        hasAccountPreview
          ? {
              accountId,
              accountName,
              key: 'account' as const,
              kind: 'account' as const,
              label: I18N.carbonAgent.accountingModel,
              productId,
              productName,
              refreshKey: accountRefreshKey,
              shareAuth,
              title: I18N.carbonAgent.accountingModel,
            }
          : undefined,
        ...productReportPreviewTabs,
        ...legacyExpertReviewTabs,
        ...previewTargetExpertReviewTabs,
        ...legacyCertificationTabs,
        certificationAddAuthType
          ? {
              accountId: certificationAccountId || accountId,
              accountName,
              certificationAuthType: certificationAddAuthType,
              certificationDraftAuthType: certificationAddAuthType,
              certificationDetails: normalizedCertificationDetails,
              key: 'certification' as const,
              kind: 'certification' as const,
              label: getCertificationApplyTitle(certificationAddAuthType),
              productId,
              productName,
              reportId,
              reportName,
              reportUrl,
              title: getCertificationApplyTitle(certificationAddAuthType),
            }
          : undefined,
      ].filter(Boolean) as PreviewTabItem[],
    [
      accountId,
      accountRefreshKey,
      accountName,
      certificationAddAuthType,
      certificationAccountId,
      hasAccountPreview,
      legacyCertificationTabs,
      legacyExpertReviewTabs,
      normalizedCertificationDetails,
      previewTargetExpertReviewTabs,
      productId,
      productName,
      productReportPreviewTabs,
      reportId,
      reportName,
      reportUrl,
      shareAuth,
    ],
  );
  const groupedPreviewTabGroups = useMemo<PreviewTabGroup[]>(() => {
    if (!shouldGroupProductPreviewTabs) {
      return [];
    }

    const groups = new Map<string, PreviewTabGroup>();
    const accountTabAdded = new Set<string>();
    const tabKeysByGroup = new Map<string, Set<PreviewTabKey>>();
    const ensureGroup = (target: PreviewPaneTarget, index: number) => {
      const targetAccountId = getPreviewTargetAccountId(target);

      if (!targetAccountId) {
        return undefined;
      }

      const existingGroup = groups.get(targetAccountId);
      const targetLabel =
        getPreviewTargetDisplayName(target) ||
        getPreviewGroupFallbackLabel(targetAccountId);

      if (existingGroup) {
        if (
          existingGroup.label ===
            getPreviewGroupFallbackLabel(targetAccountId) &&
          targetLabel !== existingGroup.label
        ) {
          existingGroup.label = targetLabel;
          existingGroup.title = targetLabel;
        }

        return existingGroup;
      }

      const group: PreviewTabGroup = {
        key: targetAccountId || String(index),
        label: targetLabel,
        tabs: [],
        title: targetLabel,
      };

      groups.set(targetAccountId, group);
      tabKeysByGroup.set(group.key, new Set<PreviewTabKey>());
      return group;
    };
    const addTab = (group: PreviewTabGroup, tab: PreviewTabItem) => {
      const groupTabKeys = tabKeysByGroup.get(group.key);

      if (groupTabKeys?.has(tab.key)) {
        return;
      }

      groupTabKeys?.add(tab.key);
      group.tabs.push(tab);
    };
    const addAccountTab = (
      group: PreviewTabGroup,
      target: PreviewPaneTarget,
      index: number,
    ) => {
      if (accountTabAdded.has(group.key)) {
        return;
      }

      accountTabAdded.add(group.key);
      addTab(group, {
        accountId: getPreviewTargetAccountId(target),
        accountName: target.accountName,
        groupKey: group.key,
        key: getAccountPreviewTabKey(target, index, true),
        kind: 'account',
        label: I18N.carbonAgent.accountingModel,
        productId: getPreviewTargetProductId(target),
        productName: target.productName,
        refreshKey: target.refreshKey,
        shareAuth: target.shareAuth,
        title: I18N.carbonAgent.accountingModel,
      });
    };
    const addExpertReviewTabs = (
      group: PreviewTabGroup,
      target: PreviewPaneTarget,
    ) => {
      const targetReviewDetails = getPreviewTargetExpertReviewDetails(target);

      targetReviewDetails.forEach((detail, detailIndex) => {
        addTab(group, {
          accountId: getPreviewTargetAccountId(target),
          accountName: target.accountName,
          detail,
          groupKey: group.key,
          key: getScopedExpertReviewPreviewTabKey(
            detail,
            detailIndex,
            group.key,
          ),
          kind: 'expertReview',
          label: I18N.carbonAgent.expertReview,
          productId: getPreviewTargetProductId(target),
          productName: target.productName,
          reportId: target.reportId,
          reportName: target.reportName,
          reportUrl: target.reportUrl,
          shareAuth: target.shareAuth,
          statusLabel: getExpertReviewPreviewTabLabel(detail, detailIndex),
          title: getExpertReviewPreviewTabTitle(detail, detailIndex),
        });
      });
    };

    mergedPreviewTargets.forEach((target, targetIndex) => {
      const group = ensureGroup(target, targetIndex);

      if (!group) {
        return;
      }

      addAccountTab(group, target, targetIndex);
      addExpertReviewTabs(group, target);

      if (target.type === 'productCarbonCertificate') {
        const certificateTab = productCarbonCertificatePreviewTabs.find(
          tab => tab.key === getProductCarbonCertificateTabKey(target),
        );

        if (certificateTab) {
          addTab(group, { ...certificateTab, groupKey: group.key });
        }
        return;
      }

      if (target.type === 'carbonLabel') {
        const labelTab = carbonLabelPreviewTabs.find(
          tab => tab.key === getCarbonLabelTabKey(target),
        );
        if (labelTab) addTab(group, { ...labelTab, groupKey: group.key });
        return;
      }

      if (target.type === 'account' || target.type === 'expertReview') {
        return;
      }

      if (target.type === 'report' && target.reportUrl) {
        addTab(group, {
          accountId: getPreviewTargetAccountId(target),
          accountName: target.accountName,
          groupKey: group.key,
          key: getReportPreviewTabKey(target, targetIndex, true),
          kind: 'report',
          label: target.reportLabel || I18N.carbonAgent.productFootprintReport,
          productId: getPreviewTargetProductId(target),
          productName: target.productName,
          reportId: target.reportId,
          reportName: target.reportName,
          reportUrl: target.reportUrl,
          reportReadonly: target.reportReadonly,
          reportKind: target.reportKind,
          reportLabel: target.reportLabel,
          shareAuth: target.shareAuth,
          title: target.reportName || I18N.carbonAgent.productFootprintReport,
        });
        return;
      }

      if (target.type === 'certification') {
        const targetCertificationDetails = target.certificationDetails || [];
        const targetCertificationDraftAuthType = readonly
          ? undefined
          : target.certificationDraftAuthType ||
            (!targetCertificationDetails.length
              ? target.certificationAuthType
              : undefined);

        targetCertificationDetails.forEach((detail, detailIndex) => {
          addTab(group, {
            accountId:
              getOptionalPreviewString(detail.accountId) ||
              getPreviewTargetAccountId(target),
            accountName:
              getOptionalPreviewString(detail.accountName) ||
              target.accountName,
            certificationAuthType:
              getCertificationApplyAuthTypeFromItem(detail),
            certificationDetail: detail,
            certificationDetails: targetCertificationDetails,
            groupKey: group.key,
            key: getScopedCertificationPreviewTabKey(
              detail,
              detailIndex,
              group.key,
            ),
            kind: 'certification',
            label: getCertificationPreviewTabLabel(detail, detailIndex),
            productId: getPreviewTargetProductId(target),
            productName:
              getOptionalPreviewString(detail.productName) ||
              target.productName,
            reportId: target.reportId,
            reportName: target.reportName,
            reportUrl: target.reportUrl,
            shareAuth: target.shareAuth,
            statusLabel: getCertificationPreviewStatusName(detail) || undefined,
            title: getCertificationPreviewTabTitle(detail, detailIndex),
          });
        });

        if (targetCertificationDraftAuthType) {
          addTab(group, {
            accountId: getPreviewTargetAccountId(target),
            accountName: target.accountName,
            certificationAuthType: targetCertificationDraftAuthType,
            certificationDraftAuthType: targetCertificationDraftAuthType,
            certificationDetails: targetCertificationDetails,
            groupKey: group.key,
            key: getScopedCertificationDraftTabKey(
              targetCertificationDraftAuthType,
              group.key,
            ),
            kind: 'certification',
            label: getCertificationApplyTitle(targetCertificationDraftAuthType),
            productId: getPreviewTargetProductId(target),
            productName: target.productName,
            reportId: target.reportId,
            reportName: target.reportName,
            reportUrl: target.reportUrl,
            shareAuth: target.shareAuth,
            title: getCertificationApplyTitle(targetCertificationDraftAuthType),
          });
        }
      }
    });

    return Array.from(groups.values()).filter(group => group.tabs.length);
  }, [
    carbonLabelPreviewTabs,
    mergedPreviewTargets,
    productCarbonCertificatePreviewTabs,
    readonly,
    shouldGroupProductPreviewTabs,
  ]);
  const enterpriseCarbonPreviewTabGroups = useMemo<PreviewTabGroup[]>(() => {
    const groups = new Map<string, PreviewTabGroup>();

    [
      ...enterpriseCarbonAccountingPreviewTabs,
      ...enterpriseCarbonReportPreviewTabs,
      ...enterpriseCarbonExpertReviewPreviewTabs,
      ...enterpriseCarbonCertificationPreviewTabs,
    ].forEach(tab => {
      const year = getOptionalPreviewString(tab.year);

      if (!year) {
        return;
      }

      const groupKey = `enterpriseCarbon:${year}`;
      const label = I18N.template(
        I18N.carbonAgent.enterpriseCarbonAccountingYearTitle,
        { val1: year },
      );
      const group = groups.get(groupKey) || {
        key: groupKey,
        label,
        tabs: [],
        title: label,
      };

      let groupedTab = { ...tab, groupKey };

      if (tab.kind === 'enterpriseCarbonExpertReview') {
        groupedTab = {
          ...groupedTab,
          label: I18N.carbonAgent.expertReview,
        };
      }

      group.tabs.push(groupedTab);
      groups.set(groupKey, group);
    });

    return Array.from(groups.values()).filter(group => group.tabs.length);
  }, [
    enterpriseCarbonAccountingPreviewTabs,
    enterpriseCarbonCertificationPreviewTabs,
    enterpriseCarbonExpertReviewPreviewTabs,
    enterpriseCarbonReportPreviewTabs,
  ]);
  const shouldGroupEnterpriseCarbonPreviewTabs =
    enterpriseCarbonPreviewTabGroups.length > 1;
  const previewTabGroups = useMemo(
    () => [
      ...(shouldGroupProductPreviewTabs ? groupedPreviewTabGroups : []),
      ...(shouldGroupEnterpriseCarbonPreviewTabs
        ? enterpriseCarbonPreviewTabGroups
        : []),
    ],
    [
      enterpriseCarbonPreviewTabGroups,
      groupedPreviewTabGroups,
      shouldGroupEnterpriseCarbonPreviewTabs,
      shouldGroupProductPreviewTabs,
    ],
  );
  const shouldGroupPreviewTabs = previewTabGroups.length > 0;
  const previewTabs = useMemo(
    () => [
      ...(shouldGroupProductPreviewTabs
        ? groupedPreviewTabGroups.flatMap(group => group.tabs)
        : [
            ...legacyProductPreviewTabs,
            ...carbonLabelPreviewTabs,
            ...productCarbonCertificatePreviewTabs,
          ]),
      ...enterpriseCarbonAccountingPreviewTabs,
      ...enterpriseCarbonReportPreviewTabs,
      ...enterpriseCarbonExpertReviewPreviewTabs,
      ...enterpriseCarbonCertificationPreviewTabs,
      ...cbamMonitorPreviewTabs,
      ...cbamOperationReportPreviewTabs,
      ...cbamReportPreviewTabs,
      ...workspacePreviewTabs,
    ],
    [
      enterpriseCarbonAccountingPreviewTabs,
      enterpriseCarbonCertificationPreviewTabs,
      enterpriseCarbonExpertReviewPreviewTabs,
      enterpriseCarbonReportPreviewTabs,
      cbamMonitorPreviewTabs,
      cbamOperationReportPreviewTabs,
      cbamReportPreviewTabs,
      groupedPreviewTabGroups,
      legacyProductPreviewTabs,
      carbonLabelPreviewTabs,
      productCarbonCertificatePreviewTabs,
      shouldGroupProductPreviewTabs,
      workspacePreviewTabs,
    ],
  );
  const groupedPreviewTabKeys = useMemo(
    () =>
      new Set(
        previewTabGroups.flatMap(group => group.tabs.map(tab => tab.key)),
      ),
    [previewTabGroups],
  );
  const standalonePreviewTabs = useMemo(
    () => previewTabs.filter(tab => !groupedPreviewTabKeys.has(tab.key)),
    [groupedPreviewTabKeys, previewTabs],
  );
  const firstAccountPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'account',
  )?.key;
  const firstCbamReportPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'cbamReport',
  )?.key;
  const firstCbamMonitorPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'cbamMonitor',
  )?.key;
  const firstCbamOperationReportPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'cbamOperationReport',
  )?.key;
  const preferredCbamMonitorPreviewTabKey =
    (activeTabPlanId
      ? cbamMonitorPreviewTabs.find(tab => tab.planId === activeTabPlanId)?.key
      : undefined) || firstCbamMonitorPreviewTabKey;
  const firstReportPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'report',
  )?.key;
  const preferredReportPreviewTabKey =
    (activeTabAccountId || activeTabReportId || activeTabReportUrl
      ? previewTabs.find(
          tab =>
            tab.kind === 'report' &&
            (!activeTabAccountId || tab.accountId === activeTabAccountId) &&
            (!activeTabReportId || tab.reportId === activeTabReportId) &&
            (!activeTabReportUrl || tab.reportUrl === activeTabReportUrl),
        )?.key
      : undefined) || firstReportPreviewTabKey;
  const firstExpertReviewPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'expertReview',
  )?.key;
  const firstCertificationPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'certification',
  )?.key;
  const firstEnterpriseCarbonAccountingPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'enterpriseCarbonAccounting',
  )?.key;
  const firstEnterpriseCarbonCertificationPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'enterpriseCarbonCertification',
  )?.key;
  const enterpriseCarbonCertificationDraftTabKey =
    enterpriseCarbonCertificationPreviewTabs.find(
      tab => tab.enterpriseCarbonCertificationDraft,
    )?.key;
  const activeTargetIsEnterpriseCarbonCertification =
    type === 'enterpriseCarbonCertification';
  const firstEnterpriseCarbonExpertReviewPreviewTabKey = previewTabs.find(
    tab => tab.kind === 'enterpriseCarbonExpertReview',
  )?.key;
  let preferredEnterpriseCarbonExpertReviewPreviewTabKey =
    firstEnterpriseCarbonExpertReviewPreviewTabKey;

  if (activeTabYear || activeTabEnterpriseCarbonBizId || activeTabReportId) {
    const matchingEnterpriseCarbonExpertReviewTab =
      enterpriseCarbonExpertReviewPreviewTabs.find(tab => {
        if (activeTabYear && tab.year !== activeTabYear) {
          return false;
        }

        if (
          activeTabEnterpriseCarbonBizId &&
          tab.enterpriseCarbonBizId !== activeTabEnterpriseCarbonBizId
        ) {
          return false;
        }

        if (activeTabReportId && tab.reportId !== activeTabReportId) {
          return false;
        }

        return true;
      });

    if (matchingEnterpriseCarbonExpertReviewTab) {
      preferredEnterpriseCarbonExpertReviewPreviewTabKey =
        matchingEnterpriseCarbonExpertReviewTab.key;
    }
  }
  const preferredEnterpriseCarbonCertificationPreviewTabKey =
    getPreferredEnterpriseCarbonCertificationPreviewTabKey(
      enterpriseCarbonCertificationPreviewTabs,
      activeTabYear,
      activeTabEnterpriseCarbonBizId,
      activeTabReportId,
      readonly,
    ) || firstEnterpriseCarbonCertificationPreviewTabKey;
  const preferredEnterpriseCarbonAccountingPreviewTabKey =
    (activeTabYear
      ? enterpriseCarbonAccountingPreviewTabs.find(
          tab => tab.year === activeTabYear,
        )?.key
      : undefined) || firstEnterpriseCarbonAccountingPreviewTabKey;
  const selectedEnterpriseCarbonReportFileIdentity =
    getEnterpriseCarbonReportFileIdentity(
      focusedEnterpriseCarbonReportTarget?.enterpriseCarbonSelectedFile,
    );
  const firstEnterpriseCarbonReportPreviewTabKey =
    (selectedEnterpriseCarbonReportFileIdentity
      ? enterpriseCarbonReportPreviewTabs.find(
          tab =>
            (!focusedEnterpriseCarbonReportTarget?.reportId ||
              tab.reportId === focusedEnterpriseCarbonReportTarget.reportId) &&
            getEnterpriseCarbonReportFileIdentity(
              tab.enterpriseCarbonSelectedFile,
            ) === selectedEnterpriseCarbonReportFileIdentity,
        )?.key
      : undefined) ||
    enterpriseCarbonReportPreviewTabs.find(
      tab =>
        (!focusedEnterpriseCarbonReportTarget?.enterpriseCarbonBizId ||
          tab.enterpriseCarbonBizId ===
            focusedEnterpriseCarbonReportTarget.enterpriseCarbonBizId) &&
        (!focusedEnterpriseCarbonReportTarget?.reportId ||
          tab.reportId === focusedEnterpriseCarbonReportTarget.reportId),
    )?.key ||
    enterpriseCarbonReportPreviewTabs[0]?.key;
  const preferredCertificationAccountId =
    certificationAccountId ||
    getOptionalPreviewString(normalizedCertificationDetails[0]?.accountId);
  const preferredCertificationPreviewTabKey =
    (!readonly && certificationDraftAuthType
      ? previewTabs.find(
          tab =>
            tab.kind === 'certification' &&
            (!preferredCertificationAccountId ||
              tab.accountId === preferredCertificationAccountId) &&
            tab.certificationDraftAuthType === certificationDraftAuthType,
        )?.key
      : undefined) ||
    (preferredCertificationAccountId
      ? previewTabs.find(
          tab =>
            tab.kind === 'certification' &&
            tab.accountId === preferredCertificationAccountId,
        )?.key
      : undefined) ||
    firstCertificationPreviewTabKey;
  const latestWorkspacePreviewTabKey = [...previewTabs]
    .reverse()
    .find(tab => tab.kind === 'workspace')?.key;
  const preferredCarbonLabelTabKey =
    carbonLabelPreviewTabs.find(tab => tab.key === activeTabKey)?.key ||
    carbonLabelPreviewTabs[carbonLabelPreviewTabs.length - 1]?.key;
  const preferredProductCarbonCertificateTabKey =
    productCarbonCertificatePreviewTabs.find(tab => tab.key === activeTabKey)
      ?.key ||
    productCarbonCertificatePreviewTabs[
      productCarbonCertificatePreviewTabs.length - 1
    ]?.key;
  const defaultTab = useMemo<PreviewTabKey>(() => {
    if (type === 'carbonLabel' && preferredCarbonLabelTabKey)
      return preferredCarbonLabelTabKey;
    if (
      type === 'productCarbonCertificate' &&
      preferredProductCarbonCertificateTabKey
    ) {
      return preferredProductCarbonCertificateTabKey;
    }
    if (
      activeTargetIsEnterpriseCarbonCertification &&
      enterpriseCarbonCertificationDraftTabKey
    ) {
      return enterpriseCarbonCertificationDraftTabKey;
    }

    if (type === 'workspace' && latestWorkspacePreviewTabKey) {
      return latestWorkspacePreviewTabKey;
    }

    if (type === 'cbamReport' && firstCbamReportPreviewTabKey) {
      return firstCbamReportPreviewTabKey;
    }

    if (type === 'cbamMonitor' && preferredCbamMonitorPreviewTabKey) {
      return preferredCbamMonitorPreviewTabKey;
    }

    if (
      type === 'cbamOperationReport' &&
      firstCbamOperationReportPreviewTabKey
    ) {
      return firstCbamOperationReportPreviewTabKey;
    }

    if (type === 'certification' && preferredCertificationPreviewTabKey) {
      return preferredCertificationPreviewTabKey;
    }

    if (
      type === 'enterpriseCarbonAccounting' &&
      preferredEnterpriseCarbonAccountingPreviewTabKey
    ) {
      return preferredEnterpriseCarbonAccountingPreviewTabKey;
    }

    if (
      type === 'enterpriseCarbonCertification' &&
      preferredEnterpriseCarbonCertificationPreviewTabKey
    ) {
      return preferredEnterpriseCarbonCertificationPreviewTabKey;
    }

    if (
      type === 'enterpriseCarbonExpertReview' &&
      preferredEnterpriseCarbonExpertReviewPreviewTabKey
    ) {
      return preferredEnterpriseCarbonExpertReviewPreviewTabKey;
    }

    if (
      type === 'enterpriseCarbonReport' &&
      firstEnterpriseCarbonReportPreviewTabKey
    ) {
      return firstEnterpriseCarbonReportPreviewTabKey;
    }

    if (type === 'expertReview' && firstExpertReviewPreviewTabKey) {
      return firstExpertReviewPreviewTabKey;
    }

    if (type === 'report' && firstReportPreviewTabKey) {
      return firstReportPreviewTabKey;
    }

    if (firstAccountPreviewTabKey) {
      return firstAccountPreviewTabKey;
    }

    return previewTabs[0]?.key || 'report';
  }, [
    activeTargetIsEnterpriseCarbonCertification,
    preferredCarbonLabelTabKey,
    preferredCbamMonitorPreviewTabKey,
    preferredProductCarbonCertificateTabKey,
    enterpriseCarbonCertificationDraftTabKey,
    firstAccountPreviewTabKey,
    firstCbamOperationReportPreviewTabKey,
    firstCbamReportPreviewTabKey,
    firstEnterpriseCarbonReportPreviewTabKey,
    firstExpertReviewPreviewTabKey,
    latestWorkspacePreviewTabKey,
    firstReportPreviewTabKey,
    preferredCertificationPreviewTabKey,
    preferredEnterpriseCarbonAccountingPreviewTabKey,
    preferredEnterpriseCarbonCertificationPreviewTabKey,
    preferredEnterpriseCarbonExpertReviewPreviewTabKey,
    previewTabs,
    type,
  ]);
  const [activeTab, setActiveTab] = useState<PreviewTabKey>(defaultTab);
  const pendingProductCarbonCertificateTabKeyRef = useRef<PreviewTabKey>();
  const focusedProductCarbonCertificateAccountIdRef = useRef<string>();
  const appliedActiveTabRequestIdentityRef = useRef<string>();
  const productCarbonCertificatePreparingAccountIdsRef = useRef(
    new Set<string>(),
  );
  const [openedPreviewGroupKey, setOpenedPreviewGroupKey] = useState<string>();
  const getResolvablePreviewTab = useCallback(
    (key?: PreviewTabKey) => {
      if (!key) {
        return undefined;
      }

      if (previewTabs.some(tab => tab.key === key)) {
        return key;
      }

      if (key === 'carbonLabel' || key.startsWith('carbonLabel:'))
        return preferredCarbonLabelTabKey;

      if (isProductCarbonCertificatePreviewTabKey(key)) {
        return preferredProductCarbonCertificateTabKey;
      }

      if (isAccountPreviewTabKey(key)) {
        return firstAccountPreviewTabKey;
      }

      if (isCbamReportPreviewTabKey(key)) {
        return firstCbamReportPreviewTabKey;
      }

      if (isCbamMonitorPreviewTabKey(key)) {
        return preferredCbamMonitorPreviewTabKey;
      }

      if (isCbamOperationReportPreviewTabKey(key)) {
        return firstCbamOperationReportPreviewTabKey;
      }

      if (isReportPreviewTabKey(key)) {
        return preferredReportPreviewTabKey;
      }

      if (isExpertReviewPreviewTabKey(key)) {
        return firstExpertReviewPreviewTabKey;
      }

      if (isCertificationPreviewTabKey(key)) {
        return preferredCertificationPreviewTabKey;
      }

      if (isEnterpriseCarbonAccountingPreviewTabKey(key)) {
        return preferredEnterpriseCarbonAccountingPreviewTabKey;
      }

      if (isEnterpriseCarbonCertificationPreviewTabKey(key)) {
        return preferredEnterpriseCarbonCertificationPreviewTabKey;
      }

      if (isEnterpriseCarbonExpertReviewPreviewTabKey(key)) {
        return preferredEnterpriseCarbonExpertReviewPreviewTabKey;
      }

      if (isEnterpriseCarbonReportPreviewTabKey(key)) {
        return firstEnterpriseCarbonReportPreviewTabKey;
      }

      if (isWorkspacePreviewTabKey(key)) {
        return latestWorkspacePreviewTabKey;
      }

      return undefined;
    },
    [
      firstAccountPreviewTabKey,
      firstCbamOperationReportPreviewTabKey,
      firstCbamReportPreviewTabKey,
      firstEnterpriseCarbonReportPreviewTabKey,
      firstExpertReviewPreviewTabKey,
      latestWorkspacePreviewTabKey,
      preferredCarbonLabelTabKey,
      preferredCbamMonitorPreviewTabKey,
      preferredCertificationPreviewTabKey,
      preferredEnterpriseCarbonAccountingPreviewTabKey,
      preferredEnterpriseCarbonCertificationPreviewTabKey,
      preferredEnterpriseCarbonExpertReviewPreviewTabKey,
      preferredProductCarbonCertificateTabKey,
      preferredReportPreviewTabKey,
      previewTabs,
    ],
  );
  const activePreviewTab = getResolvablePreviewTab(activeTab) || defaultTab;
  const activePreviewTabItem = previewTabs.find(
    tab => tab.key === activePreviewTab,
  );
  const [
    enterpriseCarbonPreviewViewByTab,
    setEnterpriseCarbonPreviewViewByTab,
  ] = useState<Partial<Record<PreviewTabKey, EnterpriseCarbonPreviewView>>>({});
  const activePreviewIsEnterpriseCarbonAccounting =
    activePreviewTabItem?.kind === 'enterpriseCarbonAccounting';
  const activePreviewIsEnterpriseCarbon =
    activePreviewIsEnterpriseCarbonAccounting ||
    activePreviewTabItem?.kind === 'enterpriseCarbonCertification' ||
    activePreviewTabItem?.kind === 'enterpriseCarbonExpertReview' ||
    activePreviewTabItem?.kind === 'enterpriseCarbonReport';
  const activePreviewIsEnterpriseCarbonReport =
    activePreviewTabItem?.kind === 'enterpriseCarbonReport';
  const activePreviewUsesEnterpriseCarbonShell =
    activePreviewIsEnterpriseCarbonAccounting ||
    activePreviewTabItem?.kind === 'enterpriseCarbonCertification' ||
    activePreviewTabItem?.kind === 'enterpriseCarbonExpertReview';
  const activeEnterpriseCarbonPreviewView =
    activePreviewIsEnterpriseCarbonAccounting
      ? enterpriseCarbonPreviewViewByTab[activePreviewTab] || 'canvas'
      : undefined;
  const handleEnterpriseCarbonPreviewViewChange = (
    nextView: EnterpriseCarbonPreviewView,
  ) => {
    setEnterpriseCarbonPreviewViewByTab(prevViewByTab => ({
      ...prevViewByTab,
      [activePreviewTab]: nextView,
    }));
  };
  const activePreviewSupportsReviewCertification =
    activePreviewIsEnterpriseCarbon ||
    (activePreviewTabItem?.kind !== 'cbamMonitor' &&
      activePreviewTabItem?.kind !== 'cbamReport' &&
      activePreviewTabItem?.kind !== 'enterpriseCarbonAccounting' &&
      activePreviewTabItem?.kind !== 'enterpriseCarbonCertification' &&
      activePreviewTabItem?.kind !== 'enterpriseCarbonExpertReview' &&
      activePreviewTabItem?.kind !== 'enterpriseCarbonReport');
  const activePreviewTarget = useMemo<PreviewPaneTarget | undefined>(() => {
    if (!activePreviewTabItem) {
      return undefined;
    }

    const activeAccountId = activePreviewTabItem.accountId || accountId;
    const contextTarget = mergedPreviewTargets.find(
      target =>
        target.messageId &&
        getPreviewTargetAccountId(target) === String(activeAccountId || ''),
    );
    const baseTarget = {
      accountId: activeAccountId,
      accountName: activePreviewTabItem.accountName || accountName,
      messageId:
        activePreviewTabItem.messageId ||
        activePreviewTabItem.sourceTarget?.messageId ||
        contextTarget?.messageId,
      productId: activePreviewTabItem.productId || productId,
      productName: activePreviewTabItem.productName || productName,
      reportId: activePreviewTabItem.reportId || reportId,
      reportName: activePreviewTabItem.reportName || reportName,
      reportUrl: activePreviewTabItem.reportUrl || reportUrl,
      reportReadonly: activePreviewTabItem.reportReadonly,
      reportKind: activePreviewTabItem.reportKind,
      reportLabel: activePreviewTabItem.reportLabel,
      shareAuth: activePreviewTabItem.shareAuth || shareAuth,
      title: activePreviewTabItem.title || title,
    };

    if (activePreviewTabItem.kind === 'carbonLabel') {
      return {
        ...baseTarget,
        ...activePreviewTabItem.sourceTarget,
        type: 'carbonLabel',
      };
    }

    if (activePreviewTabItem.kind === 'productCarbonCertificate') {
      return {
        ...baseTarget,
        ...activePreviewTabItem.sourceTarget,
        type: 'productCarbonCertificate',
      };
    }

    if (activePreviewTabItem.kind === 'certification') {
      return {
        ...baseTarget,
        certificationAuthType: activePreviewTabItem.certificationDetail
          ? getCertificationApplyAuthTypeFromItem(
              activePreviewTabItem.certificationDetail,
            )
          : activePreviewTabItem.certificationAuthType,
        certificationDetails:
          activePreviewTabItem.certificationDetails ||
          (activePreviewTabItem.certificationDetail
            ? [activePreviewTabItem.certificationDetail]
            : undefined),
        certificationDraftAuthType:
          activePreviewTabItem.certificationDraftAuthType,
        type: 'certification',
      };
    }

    if (activePreviewTabItem.kind === 'expertReview') {
      return {
        ...baseTarget,
        accountId:
          baseTarget.accountId ||
          getOptionalPreviewString(activePreviewTabItem.detail?.accountId) ||
          getOptionalPreviewString(activePreviewTabItem.detail?.snapAccountId),
        reviewDetail: activePreviewTabItem.detail,
        reviewDetails: activePreviewTabItem.detail
          ? [activePreviewTabItem.detail]
          : undefined,
        type: 'expertReview',
      };
    }

    if (activePreviewTabItem.kind === 'enterpriseCarbonAccounting') {
      return {
        ...activePreviewTabItem.sourceTarget,
        ...activePreviewTabItem.enterpriseCarbonTarget,
        type: 'enterpriseCarbonAccounting',
      };
    }

    if (activePreviewTabItem.kind === 'enterpriseCarbonCertification') {
      return {
        ...activePreviewTabItem.sourceTarget,
        applyNo: activePreviewTabItem.applyNo,
        certificationId: activePreviewTabItem.certificationId,
        enterpriseCarbonBizId: activePreviewTabItem.enterpriseCarbonBizId,
        enterpriseCarbonBizType:
          activePreviewTabItem.enterpriseCarbonBizType || 'account',
        enterpriseCarbonCertificationDetails:
          activePreviewTabItem.enterpriseCarbonCertificationDetails,
        enterpriseCarbonCertificationDraft:
          activePreviewTabItem.enterpriseCarbonCertificationDraft,
        enterpriseCarbonCertificationPageType:
          activePreviewTabItem.enterpriseCarbonCertificationPageType || 'add',
        orgId: activePreviewTabItem.orgId,
        type: 'enterpriseCarbonCertification',
        year: activePreviewTabItem.year,
      };
    }

    if (activePreviewTabItem.kind === 'enterpriseCarbonExpertReview') {
      return {
        ...activePreviewTabItem.sourceTarget,
        enterpriseCarbonBizId: activePreviewTabItem.enterpriseCarbonBizId,
        enterpriseCarbonBizType: activePreviewTabItem.enterpriseCarbonBizType,
        enterpriseCarbonExpertReviewDetail:
          activePreviewTabItem.enterpriseCarbonExpertReviewDetail,
        enterpriseCarbonExpertReviewDetails:
          activePreviewTabItem.sourceTarget
            ?.enterpriseCarbonExpertReviewDetails,
        reportId: activePreviewTabItem.reportId,
        type: 'enterpriseCarbonExpertReview',
        year: activePreviewTabItem.year,
      };
    }

    if (activePreviewTabItem.kind === 'enterpriseCarbonReport') {
      return {
        ...activePreviewTabItem.sourceTarget,
        ...baseTarget,
        enterpriseCarbonBizId: activePreviewTabItem.enterpriseCarbonBizId,
        enterpriseCarbonBizType: 'report',
        enterpriseCarbonFiles: activePreviewTabItem.enterpriseCarbonFiles,
        enterpriseCarbonSelectedFile:
          activePreviewTabItem.enterpriseCarbonSelectedFile,
        reportId: activePreviewTabItem.reportId,
        reportName: activePreviewTabItem.reportName,
        reportUrl: activePreviewTabItem.reportUrl,
        type: 'enterpriseCarbonReport',
        year: activePreviewTabItem.year,
      };
    }

    if (activePreviewTabItem.kind === 'workspace') {
      return {
        title: activePreviewTabItem.title,
        type: 'workspace',
        workspaceLiveSession: activePreviewTabItem.workspaceLiveSession,
      };
    }

    if (activePreviewTabItem.kind === 'cbamReport') {
      return {
        cbamId: activePreviewTabItem.cbamId,
        title: activePreviewTabItem.title,
        type: 'cbamReport',
      };
    }

    if (activePreviewTabItem.kind === 'cbamMonitor') {
      return {
        planId: activePreviewTabItem.planId,
        planName: activePreviewTabItem.planName,
        refreshKey: activePreviewTabItem.refreshKey,
        title: activePreviewTabItem.title,
        type: 'cbamMonitor',
      };
    }

    if (activePreviewTabItem.kind === 'cbamOperationReport') {
      return {
        operationId: activePreviewTabItem.operationId,
        reportName: activePreviewTabItem.reportName,
        refreshKey: activePreviewTabItem.refreshKey,
        title: activePreviewTabItem.title,
        type: 'cbamOperationReport',
      };
    }

    return {
      ...baseTarget,
      type: activePreviewTabItem.kind,
    };
  }, [
    accountId,
    accountName,
    activePreviewTabItem,
    mergedPreviewTargets,
    productId,
    productName,
    reportId,
    reportName,
    reportUrl,
    shareAuth,
    title,
  ]);
  const activeCarbonLabelSourceTarget = useMemo<
    PreviewPaneTarget | undefined
  >(() => {
    if (activePreviewTabItem?.kind !== 'productCarbonCertificate') {
      return activePreviewTarget;
    }

    const activeAccountId = getPreviewTargetAccountId(activePreviewTarget);

    if (!activeAccountId) {
      return undefined;
    }

    const accountTab = previewTabs.find(
      tab =>
        tab.kind === 'account' &&
        (activePreviewTabItem.groupKey
          ? tab.groupKey === activePreviewTabItem.groupKey
          : String(tab.accountId) === activeAccountId),
    );

    return {
      accountId: activeAccountId,
      accountName: accountTab?.accountName || activePreviewTarget?.accountName,
      messageId: activePreviewTarget?.messageId,
      productId: accountTab?.productId || activePreviewTarget?.productId,
      productName: accountTab?.productName || activePreviewTarget?.productName,
      shareAuth: accountTab?.shareAuth || activePreviewTarget?.shareAuth,
      title: accountTab?.title || activePreviewTarget?.title,
      type: 'account',
    };
  }, [activePreviewTabItem, activePreviewTarget, previewTabs]);
  let activeExpertReviewOpen = onExpertReviewOpen;
  let activeThirdPartyCertificationOpen = onThirdPartyCertificationOpen;
  let activeReviewCertificationLoading = reviewCertificationLoading;

  if (activePreviewIsEnterpriseCarbon) {
    activeExpertReviewOpen = onEnterpriseCarbonExpertReviewOpen;
    activeThirdPartyCertificationOpen =
      onEnterpriseCarbonThirdPartyCertificationOpen;
    activeReviewCertificationLoading =
      enterpriseCarbonReviewCertificationLoading;
  }

  if (activePreviewIsEnterpriseCarbonReport) {
    activeExpertReviewOpen = undefined;
  }
  const activeReviewCertificationIsReadonly = activePreviewIsEnterpriseCarbon
    ? enterpriseCarbonReviewCertificationIsReadonly
    : readonly;
  const showPreviewTabs = previewTabs.length > 0;
  const showCarbonLabelEntry = Boolean(
    carbonLabelVisible &&
      onCarbonLabelOpen &&
      activePreviewTarget?.accountId &&
      [
        'account',
        'report',
        'expertReview',
        'certification',
        'carbonLabel',
        'productCarbonCertificate',
      ].includes(activePreviewTabItem?.kind || ''),
  );
  const showProductCarbonCertificateEntry = Boolean(
    productCarbonCertificateVisible &&
      activePreviewTarget?.accountId &&
      [
        'account',
        'report',
        'expertReview',
        'certification',
        'carbonLabel',
        'productCarbonCertificate',
      ].includes(activePreviewTabItem?.kind || ''),
  );
  const showReviewCertificationEntry = Boolean(
    !activePreviewTabItem?.reportKind &&
      !activeReviewCertificationIsReadonly &&
      activePreviewSupportsReviewCertification &&
      (activeExpertReviewOpen ||
        activeThirdPartyCertificationOpen ||
        showCarbonLabelEntry ||
        showProductCarbonCertificateEntry),
  );
  const previewTargetKey = useMemo(
    () =>
      [
        accountId,
        productId,
        reportId,
        reportName,
        reportUrl,
        hasAccountPreview ? 'account' : '',
        hasReportPreview ? 'report' : '',
        hasExpertReviewPreview ? 'expertReview' : '',
        hasCertificationPreview ? 'certification' : '',
        certificationAuthType,
        certificationAddAuthType,
        normalizedCertificationDetails
          .map((detail, index) =>
            [
              detail.id,
              detail.certificationId,
              detail.certificationStatus,
              detail.certificationStatusName,
              detail.status,
              detail.statusName,
              detail.authType,
              detail.auth_type,
              detail.certificationAuthType,
              detail.certification_auth_type,
              index,
            ]
              .filter(
                value => value !== undefined && value !== null && value !== '',
              )
              .join(':'),
          )
          .join('|'),
        normalizedExpertReviewDetails
          .map(detail =>
            [detail.reviewId, detail.reviewNo, detail.status, detail.statusName]
              .filter(Boolean)
              .join(':'),
          )
          .join('|'),
        previewTabs
          .map(tab =>
            [tab.key, tab.title, tab.reportUrl, tab.statusLabel]
              .filter(Boolean)
              .join(':'),
          )
          .join('|'),
      ]
        .filter(Boolean)
        .join('|'),
    [
      accountId,
      certificationAddAuthType,
      certificationAuthType,
      hasAccountPreview,
      hasCertificationPreview,
      hasExpertReviewPreview,
      hasReportPreview,
      normalizedCertificationDetails,
      normalizedExpertReviewDetails,
      previewTabs,
      productId,
      reportId,
      reportName,
      reportUrl,
    ],
  );
  const [mountedTabs, setMountedTabs] = useState<PreviewTabKey[]>([]);
  const previewTargetKeyRef = useRef(previewTargetKey);

  useEffect(() => {
    const pendingCertificateTabKey =
      pendingProductCarbonCertificateTabKeyRef.current;

    if (
      pendingCertificateTabKey &&
      previewTabs.some(tab => tab.key === pendingCertificateTabKey)
    ) {
      pendingProductCarbonCertificateTabKeyRef.current = undefined;
      setActiveTab(pendingCertificateTabKey);
      return;
    }

    setActiveTab(currentTab =>
      previewTabs.some(tab => tab.key === currentTab) ? currentTab : defaultTab,
    );
  }, [defaultTab, previewTargetKey, previewTabs]);

  useEffect(() => {
    if (!open || !shouldGroupPreviewTabs) {
      setOpenedPreviewGroupKey(undefined);
    }
  }, [open, shouldGroupPreviewTabs]);

  useEffect(() => {
    const enterpriseCarbonDraftTabKey =
      activeTargetIsEnterpriseCarbonCertification &&
      enterpriseCarbonCertificationDraftTabKey
        ? enterpriseCarbonCertificationDraftTabKey
        : undefined;
    let requestIdentity = '';

    if (enterpriseCarbonDraftTabKey) {
      requestIdentity = [
        agentSessionId || sessionId || '',
        activeTabTrigger ?? '',
        'enterpriseCarbonCertificationDraft',
        enterpriseCarbonDraftTabKey,
      ].join('|');
    } else if (activeTabKey) {
      requestIdentity = [
        agentSessionId || sessionId || '',
        activeTabTrigger ?? '',
        activeTabKey,
        activeTabAccountId || '',
        activeTabEnterpriseCarbonBizId || '',
        activeTabPlanId || '',
        activeTabReportId || '',
        activeTabReportUrl || '',
        activeTabYear || '',
      ].join('|');
    }

    if (
      !requestIdentity ||
      appliedActiveTabRequestIdentityRef.current === requestIdentity
    ) {
      return;
    }

    const resolvedActiveTabKey =
      enterpriseCarbonDraftTabKey || getResolvablePreviewTab(activeTabKey);

    if (!resolvedActiveTabKey) {
      return;
    }

    appliedActiveTabRequestIdentityRef.current = requestIdentity;
    focusedProductCarbonCertificateAccountIdRef.current = undefined;
    setActiveTab(resolvedActiveTabKey);
  }, [
    agentSessionId,
    activeTargetIsEnterpriseCarbonCertification,
    activeTabKey,
    activeTabAccountId,
    activeTabEnterpriseCarbonBizId,
    activeTabPlanId,
    activeTabReportId,
    activeTabReportUrl,
    activeTabTrigger,
    activeTabYear,
    enterpriseCarbonCertificationDraftTabKey,
    getResolvablePreviewTab,
    sessionId,
  ]);

  useEffect(() => {
    if (previewTargetKeyRef.current === previewTargetKey) {
      return;
    }

    previewTargetKeyRef.current = previewTargetKey;
    setMountedTabs(previous =>
      Array.from(
        new Set([
          ...previous.filter(
            key =>
              (key.startsWith('carbonLabel:') ||
                key.startsWith(PRODUCT_CARBON_CERTIFICATE_TAB_PREFIX) ||
                previewTabs.some(
                  tab => tab.key === key && Boolean(tab.reportKind),
                )) &&
              previewTabs.some(tab => tab.key === key),
          ),
          ...(open ? [activePreviewTab] : []),
        ]),
      ),
    );
  }, [activePreviewTab, open, previewTargetKey, previewTabs]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMountedTabs(prevTabs =>
      prevTabs.includes(activePreviewTab)
        ? prevTabs
        : [...prevTabs, activePreviewTab],
    );
  }, [activePreviewTab, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let nextAnimationFrame = 0;
    const animationFrame = window.requestAnimationFrame(() => {
      emitPreviewLayoutUpdate();
      nextAnimationFrame = window.requestAnimationFrame(
        emitPreviewLayoutUpdate,
      );
    });
    const timer = window.setTimeout(
      emitPreviewLayoutUpdate,
      fullscreen ? 240 : 180,
    );

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (nextAnimationFrame) {
        window.cancelAnimationFrame(nextAnimationFrame);
      }

      window.clearTimeout(timer);
    };
  }, [activePreviewTab, fullscreen, open, width]);

  const handlePreviewTabChange = (nextTab: PreviewTabKey) => {
    if (!previewTabs.some(tab => tab.key === nextTab)) {
      return;
    }

    focusedProductCarbonCertificateAccountIdRef.current = undefined;
    setActiveTab(nextTab);
  };
  const handleProductCarbonCertificateOpen = async (
    target?: PreviewPaneTarget,
  ) => {
    const targetAccountId = getPreviewTargetAccountId(target);

    if (!productCarbonCertificateVisible || !targetAccountId) {
      return;
    }

    closeReviewCertificationMenu();
    focusedProductCarbonCertificateAccountIdRef.current = targetAccountId;
    const localDraft = localProductCarbonCertificateTargets.find(
      item =>
        item.type === 'productCarbonCertificate' &&
        item.accountId === targetAccountId &&
        !item.productCarbonCertificateApplicationId,
    );

    if (
      productCarbonCertificatePreparingAccountIdsRef.current.has(
        targetAccountId,
      )
    ) {
      return;
    }

    productCarbonCertificatePreparingAccountIdsRef.current.add(targetAccountId);
    const temporaryKey =
      localDraft?.productCarbonCertificateTemporaryKey ||
      `draft:${targetAccountId}`;
    try {
      const resolution = await resolveProductCarbonCertificateEntry(
        targetAccountId,
      );
      const { application } = resolution;
      const applicationId =
        resolution.kind === 'existing' && application.id != null
          ? String(application.id)
          : undefined;
      const resolvedTarget: PreviewPaneTarget = {
        ...localDraft,
        accountId: targetAccountId,
        accountName: localDraft?.accountName || target?.accountName,
        messageId: localDraft?.messageId || target?.messageId,
        productId: localDraft?.productId || target?.productId,
        productName:
          application.productName ||
          localDraft?.productName ||
          target?.productName,
        productCarbonCertificateApplicationId: applicationId,
        productCarbonCertificateInitializing: false,
        // prepare 返回值先作为页面回填；正式申请仍会继续加载 detail，
        // detail 失败时保留这份接口数据，不让请求错误把页面拦掉。
        productCarbonCertificatePrepared: application,
        productCarbonCertificateStatus: application.status || undefined,
        productCarbonCertificateStatusName: application.statusName || undefined,
        productCarbonCertificateTemporaryKey: applicationId
          ? undefined
          : temporaryKey,
        type: 'productCarbonCertificate',
      };
      const resolvedKey = getProductCarbonCertificateTabKey(resolvedTarget);
      const shouldKeepCertificateFocused =
        focusedProductCarbonCertificateAccountIdRef.current === targetAccountId;
      const matchesResolvedTarget = (item: PreviewPaneTarget) => {
        if (item === localDraft) {
          return true;
        }

        if (
          item.type !== 'productCarbonCertificate' ||
          String(item.accountId) !== targetAccountId
        ) {
          return false;
        }

        if (applicationId) {
          return (
            String(item.productCarbonCertificateApplicationId || '') ===
            applicationId
          );
        }

        return !item.productCarbonCertificateApplicationId;
      };

      if (shouldKeepCertificateFocused) {
        pendingProductCarbonCertificateTabKeyRef.current = resolvedKey;
      }
      if (applicationId) {
        updateProductCarbonCertificateApplication(application);
      }
      setLocalProductCarbonCertificateTargets(previous => {
        const targetExists = previous.some(matchesResolvedTarget);

        if (!targetExists) {
          return [...previous, resolvedTarget];
        }

        return previous.map(item =>
          matchesResolvedTarget(item) ? resolvedTarget : item,
        );
      });
      if (shouldKeepCertificateFocused) {
        setActiveTab(resolvedKey);
      }
    } catch {
      // 请求层统一处理错误；保留已打开的空白证书页，不增加局部错误或重试状态。
      const fallbackTarget: PreviewPaneTarget = {
        ...localDraft,
        accountId: targetAccountId,
        accountName: localDraft?.accountName || target?.accountName,
        messageId: localDraft?.messageId || target?.messageId,
        productId: localDraft?.productId || target?.productId,
        productName: localDraft?.productName || target?.productName,
        productCarbonCertificateInitializing: false,
        productCarbonCertificateTemporaryKey: temporaryKey,
        type: 'productCarbonCertificate',
      };
      const fallbackKey = getProductCarbonCertificateTabKey(fallbackTarget);
      const shouldKeepCertificateFocused =
        focusedProductCarbonCertificateAccountIdRef.current === targetAccountId;

      if (shouldKeepCertificateFocused) {
        pendingProductCarbonCertificateTabKeyRef.current = fallbackKey;
      }
      setLocalProductCarbonCertificateTargets(previous =>
        localDraft
          ? previous.map(item => (item === localDraft ? fallbackTarget : item))
          : [...previous, fallbackTarget],
      );
      if (shouldKeepCertificateFocused) {
        setActiveTab(fallbackKey);
      }
    } finally {
      productCarbonCertificatePreparingAccountIdsRef.current.delete(
        targetAccountId,
      );
    }
  };
  const handleProductCarbonCertificateSubmitted = (
    temporaryKey: string,
    applicationId: string,
  ) => {
    const submittedTarget = localProductCarbonCertificateTargets.find(
      target =>
        target.type === 'productCarbonCertificate' &&
        target.productCarbonCertificateTemporaryKey === temporaryKey,
    );
    const submittedAccountId =
      submittedTarget?.accountId || activePreviewTarget?.accountId;
    const nextKey = getProductCarbonCertificateTabKey({
      accountId: submittedAccountId,
      productCarbonCertificateApplicationId: applicationId,
    });

    focusedProductCarbonCertificateAccountIdRef.current = submittedAccountId
      ? String(submittedAccountId)
      : undefined;
    pendingProductCarbonCertificateTabKeyRef.current = nextKey;
    setLocalProductCarbonCertificateTargets(previous =>
      previous.map(target => {
        if (
          target.type !== 'productCarbonCertificate' ||
          target.productCarbonCertificateTemporaryKey !== temporaryKey
        ) {
          return target;
        }

        return {
          ...target,
          productCarbonCertificateApplicationId: applicationId,
          productCarbonCertificateInitializing: false,
          productCarbonCertificatePrepared: undefined,
          productCarbonCertificateStatus: undefined,
          productCarbonCertificateStatusName: undefined,
          productCarbonCertificateTemporaryKey: undefined,
        };
      }),
    );

    setActiveTab(nextKey);
  };
  const handleProductCarbonCertificateDetailLoaded = (
    application: ProductCarbonCertificateApplication,
  ) => {
    updateProductCarbonCertificateApplication(application);
    setLocalProductCarbonCertificateTargets(previous =>
      previous.map(target =>
        target.type === 'productCarbonCertificate' &&
        String(target.accountId) === String(application.accountId) &&
        String(target.productCarbonCertificateApplicationId) ===
          String(application.id)
          ? {
              ...target,
              productCarbonCertificateStatus: application.status || undefined,
              productCarbonCertificateStatusName:
                application.statusName || undefined,
            }
          : target,
      ),
    );
  };
  const closePreviewGroup = (groupKey?: string) => {
    setOpenedPreviewGroupKey(currentGroupKey =>
      groupKey && currentGroupKey !== groupKey ? currentGroupKey : undefined,
    );
  };
  const handlePreviewTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (currentIndex < 0) {
      return;
    }

    const lastIndex = previewTabs.length - 1;
    let nextIndex: number | undefined;

    if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'ArrowRight') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextTab = previewTabs[nextIndex];

    handlePreviewTabChange(nextTab.key);
    requestAnimationFrame(() => {
      document.getElementById(getPreviewTabId(nextTab.key))?.focus();
    });
  };
  const handlePreviewGroupKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (currentIndex < 0) {
      return;
    }

    const lastIndex = previewTabGroups.length - 1;
    let nextIndex: number | undefined;

    if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'ArrowRight') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextGroup = previewTabGroups[nextIndex];
    const nextTab = nextGroup?.tabs[0];

    if (!nextTab) {
      return;
    }

    handlePreviewTabChange(nextTab.key);
    requestAnimationFrame(() => {
      document.getElementById(getPreviewGroupTabId(nextGroup.key))?.focus();
    });
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open || fullscreen) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onResizeBy(24);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onResizeBy(-24);
    }
  };

  return (
    <aside
      className={classNames(style.previewPane, {
        [style.previewPaneClosed]: !open,
        [style.previewPaneFullscreen]: fullscreen,
        [style.previewPaneEnterpriseCarbon]:
          activePreviewUsesEnterpriseCarbonShell,
      })}
      aria-hidden={!open}
      aria-label={I18N.carbonAgent.modelingPreview}
    >
      {!fullscreen ? (
        <button
          className={style.previewResizeHandle}
          type='button'
          aria-label={I18N.template(I18N.carbonAgent.resizePreviewWidth, {
            val1: Math.round(width),
            val2: minWidth,
            val3: maxWidth,
          })}
          tabIndex={open ? 0 : -1}
          onKeyDown={handleResizeKeyDown}
          onPointerDown={onResizeStart}
        />
      ) : null}
      <header className={style.previewHeader}>
        <div className={style.previewTitleWrap}>
          {fullscreen ? (
            <button
              className={style.previewContextButton}
              type='button'
              aria-label={I18N.carbonAgent.backToConversation}
              tabIndex={open ? undefined : -1}
              onClick={onToggleFullscreen}
            >
              <Icon
                className={style.previewContextIcon}
                src={icons.historyChatIcon}
              />
            </button>
          ) : null}
          {showPreviewTabs ? (
            <div
              className={classNames(style.previewTabs, {
                [style.previewTabsGrouped]: shouldGroupPreviewTabs,
              })}
              role='tablist'
              aria-label={I18N.carbonAgent.previewTypeLabel}
            >
              {shouldGroupPreviewTabs ? (
                <>
                  {previewTabGroups.map((group, groupIndex) => {
                    const activeGroup = group.tabs.some(
                      tab => tab.key === activePreviewTab,
                    );
                    const activeGroupTab =
                      group.tabs.find(tab => tab.key === activePreviewTab) ||
                      group.tabs[0];

                    return (
                      <Dropdown
                        dropdownRender={() => (
                          <div
                            className={classNames(
                              style.previewTabDropdown,
                              style.previewTabDropdownPortal,
                            )}
                            role='menu'
                          >
                            {group.tabs.map(tab => (
                              <button
                                className={classNames(
                                  style.previewTabDropdownItem,
                                  {
                                    [style.previewTabDropdownItemActive]:
                                      activePreviewTab === tab.key,
                                  },
                                )}
                                id={getPreviewTabId(tab.key)}
                                key={tab.key}
                                role='menuitem'
                                title={tab.title}
                                type='button'
                                onClick={event => {
                                  handlePreviewTabChange(tab.key);
                                  closePreviewGroup(group.key);
                                  event.currentTarget.blur();
                                }}
                              >
                                <span>{tab.label}</span>
                                {tab.statusLabel &&
                                tab.statusLabel !== tab.label ? (
                                  <small>{tab.statusLabel}</small>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        )}
                        key={group.key}
                        open={openedPreviewGroupKey === group.key}
                        placement='bottomLeft'
                        trigger={['hover']}
                        onOpenChange={nextOpen =>
                          setOpenedPreviewGroupKey(
                            nextOpen ? group.key : undefined,
                          )
                        }
                      >
                        <div
                          className={classNames(style.previewTabGroup, {
                            [style.previewTabGroupOpen]:
                              openedPreviewGroupKey === group.key,
                          })}
                        >
                          <button
                            aria-controls={
                              activeGroupTab
                                ? getPreviewPanelId(activeGroupTab.key)
                                : undefined
                            }
                            aria-expanded={openedPreviewGroupKey === group.key}
                            aria-haspopup='menu'
                            aria-selected={activeGroup}
                            className={classNames(
                              style.previewTab,
                              style.previewTabGrouped,
                              {
                                [style.previewTabActive]: activeGroup,
                              },
                            )}
                            id={getPreviewGroupTabId(group.key)}
                            role='tab'
                            tabIndex={open && activeGroup ? 0 : -1}
                            title={group.title}
                            type='button'
                            onClick={() => {
                              if (activeGroupTab) {
                                handlePreviewTabChange(activeGroupTab.key);
                              }
                            }}
                            onKeyDown={event =>
                              handlePreviewGroupKeyDown(event, groupIndex)
                            }
                          >
                            <span className={style.previewTabLabel}>
                              {group.label}
                            </span>
                            {group.tabs.length > 1 ? (
                              <span className={style.previewTabCount}>
                                {group.tabs.length}
                              </span>
                            ) : null}
                          </button>
                        </div>
                      </Dropdown>
                    );
                  })}
                  {standalonePreviewTabs.map(tab => (
                    <button
                      className={classNames(style.previewTab, {
                        [style.previewTabActive]: activePreviewTab === tab.key,
                      })}
                      type='button'
                      key={tab.key}
                      id={getPreviewTabId(tab.key)}
                      role='tab'
                      aria-controls={getPreviewPanelId(tab.key)}
                      aria-selected={activePreviewTab === tab.key}
                      tabIndex={open && activePreviewTab === tab.key ? 0 : -1}
                      title={tab.title}
                      onClick={() => handlePreviewTabChange(tab.key)}
                      onKeyDown={event =>
                        handlePreviewTabKeyDown(
                          event,
                          previewTabs.findIndex(item => item.key === tab.key),
                        )
                      }
                    >
                      <span className={style.previewTabText}>{tab.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                previewTabs.map(tab => (
                  <button
                    className={classNames(style.previewTab, {
                      [style.previewTabActive]: activePreviewTab === tab.key,
                    })}
                    type='button'
                    key={tab.key}
                    id={getPreviewTabId(tab.key)}
                    role='tab'
                    aria-controls={getPreviewPanelId(tab.key)}
                    aria-selected={activePreviewTab === tab.key}
                    tabIndex={open && activePreviewTab === tab.key ? 0 : -1}
                    title={tab.title}
                    onClick={() => handlePreviewTabChange(tab.key)}
                    onKeyDown={event =>
                      handlePreviewTabKeyDown(
                        event,
                        previewTabs.findIndex(item => item.key === tab.key),
                      )
                    }
                  >
                    <span className={style.previewTabText}>{tab.label}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <span className={style.previewTitle}>
              {previewTabs[0]?.title || I18N.carbonAgent.accountingModel}
            </span>
          )}
        </div>
        <div className={style.previewHeaderActions}>
          {activePreviewIsEnterpriseCarbonAccounting &&
          enterpriseCarbonAccountingPermissions?.canViewAccounting !== false &&
          activeEnterpriseCarbonPreviewView !== 'result' ? (
            <div
              className={style.previewViewSwitch}
              role='tablist'
              aria-label={I18N.carbonAgent.previewTypeLabel}
            >
              {getEnterpriseCarbonPreviewViewOptions().map(option => (
                <button
                  className={classNames(style.previewViewSwitchButton, {
                    [style.previewViewSwitchButtonActive]:
                      activeEnterpriseCarbonPreviewView === option.key,
                  })}
                  key={option.key}
                  role='tab'
                  type='button'
                  aria-selected={
                    activeEnterpriseCarbonPreviewView === option.key
                  }
                  tabIndex={open ? undefined : -1}
                  onClick={() =>
                    handleEnterpriseCarbonPreviewViewChange(option.key)
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          {onShare && !activePreviewTabItem?.reportKind ? (
            <Tooltip title={I18N.carbonAgent.share} placement='bottom'>
              <button
                className={style.previewShareButton}
                type='button'
                aria-label={I18N.carbonAgent.share}
                aria-busy={shareLoading}
                disabled={shareDisabled}
                onClick={onShare}
              >
                <ShareAltOutlined />
              </button>
            </Tooltip>
          ) : null}
          {showReviewCertificationEntry ? (
            <div
              className={style.previewReviewCertificationMenu}
              onMouseEnter={() => setReviewCertificationMenuOpen(true)}
              onMouseLeave={event => {
                if (!event.currentTarget.contains(document.activeElement)) {
                  setReviewCertificationMenuOpen(false);
                }
              }}
              onFocus={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setReviewCertificationMenuOpen(true);
                }
              }}
              onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setReviewCertificationMenuOpen(false);
                }
              }}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  closeReviewCertificationMenu();
                }
              }}
            >
              <button
                ref={reviewCertificationTriggerRef}
                aria-expanded={reviewCertificationMenuOpen}
                aria-haspopup='menu'
                className={style.previewReviewCertificationTrigger}
                disabled={activeReviewCertificationLoading}
                type='button'
                onClick={() => setReviewCertificationMenuOpen(true)}
              >
                <FileSearchOutlined
                  className={style.previewReviewCertificationTriggerIcon}
                />
                <span>{I18N.carbonAgent.reviewAndCertification}</span>
              </button>
              <div
                className={classNames(style.previewReviewCertificationPopover, {
                  [style.previewReviewCertificationPopoverOpen]:
                    reviewCertificationMenuOpen,
                })}
                role='menu'
              >
                {!activePreviewIsEnterpriseCarbonReport && (
                  <button
                    className={style.previewReviewCertificationMenuItem}
                    disabled={
                      !activeExpertReviewOpen ||
                      activeReviewCertificationLoading
                    }
                    role='menuitem'
                    type='button'
                    onClick={() =>
                      activeExpertReviewOpen?.(activePreviewTarget)
                    }
                  >
                    <strong>{I18N.carbonAgent.expertReview}</strong>
                    <small>
                      {I18N.carbonAgent.reviewAndCertificationExpertReviewDesc}
                    </small>
                  </button>
                )}
                <button
                  className={style.previewReviewCertificationMenuItem}
                  disabled={
                    !activeThirdPartyCertificationOpen ||
                    activeReviewCertificationLoading
                  }
                  role='menuitem'
                  type='button'
                  onClick={() =>
                    activeThirdPartyCertificationOpen?.(activePreviewTarget, {
                      forceNew: true,
                    })
                  }
                >
                  <strong>{I18N.carbonAgent.thirdPartyCertification}</strong>
                  <small>
                    {I18N.carbonAgent.reviewAndCertificationThirdPartyDesc}
                  </small>
                </button>
                {showCarbonLabelEntry ? (
                  <button
                    className={style.previewReviewCertificationMenuItem}
                    role='menuitem'
                    type='button'
                    onClick={() => {
                      closeReviewCertificationMenu();
                      onCarbonLabelOpen?.(activeCarbonLabelSourceTarget);
                    }}
                  >
                    <strong>{I18N.carbonAgent.labelApplication.entry}</strong>
                    <small>{I18N.carbonAgent.labelApplication.entryDesc}</small>
                  </button>
                ) : null}
                {showProductCarbonCertificateEntry ? (
                  <button
                    className={style.previewReviewCertificationMenuItem}
                    role='menuitem'
                    type='button'
                    onClick={() => {
                      handleProductCarbonCertificateOpen(activePreviewTarget);
                    }}
                  >
                    <strong>
                      {I18N.carbonAgent.certificateApplication.entry}
                    </strong>
                    <small>
                      {I18N.carbonAgent.certificateApplication.entryDesc}
                    </small>
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          <button
            className={style.previewIconButton}
            type='button'
            aria-label={
              fullscreen
                ? I18N.carbonAgent.exitFullscreen
                : I18N.carbonAgent.fullscreenPreview
            }
            tabIndex={open ? undefined : -1}
            title={
              fullscreen
                ? I18N.carbonAgent.exitFullscreen
                : I18N.carbonAgent.fullscreenPreview
            }
            onClick={onToggleFullscreen}
          >
            {fullscreen ? (
              <PreviewExitFullscreenIcon />
            ) : (
              <PreviewFullscreenIcon />
            )}
          </button>
          <button
            className={style.previewIconButton}
            type='button'
            aria-label={I18N.carbonAgent.collapsePreview}
            tabIndex={open ? undefined : -1}
            title={I18N.carbonAgent.collapsePreview}
            onClick={onClose}
          >
            <PreviewDrawerCollapseIcon
              className={style.previewDrawerCollapseIcon}
            />
          </button>
        </div>
      </header>
      <div
        className={classNames(style.previewCanvas, {
          [style.previewCanvasCarbonLabel]:
            activePreviewTabItem?.kind === 'carbonLabel',
          [style.previewCanvasCarbonCertificate]:
            activePreviewTabItem?.kind === 'productCarbonCertificate',
          [style.previewCanvasEnterpriseCarbon]:
            activePreviewUsesEnterpriseCarbonShell,
        })}
      >
        <div
          className={classNames(style.previewContent, {
            [style.previewContentEnterpriseCarbon]:
              activePreviewUsesEnterpriseCarbonShell,
          })}
        >
          {previewTabs.map(tab => {
            const tabActive = activePreviewTab === tab.key;
            const tabMounted = tab.reportKind
              ? (open && tabActive) || mountedTabs.includes(tab.key)
              : tab.kind === 'carbonLabel'
              ? carbonLabelVisible &&
                ((open && tabActive) || mountedTabs.includes(tab.key))
              : tab.kind === 'productCarbonCertificate'
              ? productCarbonCertificateVisible &&
                ((open && tabActive) || mountedTabs.includes(tab.key))
              : tab.kind === 'workspace'
              ? open
              : open || mountedTabs.includes(tab.key);

            return tabMounted ? (
              <div
                className={classNames(style.previewTabPanel, {
                  [style.previewTabPanelActive]: tabActive,
                })}
                id={getPreviewPanelId(tab.key)}
                key={tab.key}
                role='tabpanel'
                aria-labelledby={getPreviewTabId(tab.key)}
                hidden={!tabActive}
              >
                {tab.kind === 'carbonLabel' &&
                tab.accountId &&
                carbonLabelVisible ? (
                  <Suspense
                    fallback={
                      <div className={style.previewLoading}>
                        <Spin />
                      </div>
                    }
                  >
                    <CarbonLabelApplyPreview
                      accountId={tab.accountId}
                      productId={tab.productId}
                      applicationId={tab.carbonLabelApplicationId}
                      applicationApplyNum={tab.carbonLabelApplyNum}
                      forceNew={tab.carbonLabelForceNew}
                      preparedApplication={tab.carbonLabelPreparedApplication}
                      messageId={tab.messageId}
                      projectId={projectId}
                      sessionId={agentSessionId || sessionId}
                      onSubmitted={application => {
                        updateApplication(application);
                        onCarbonLabelSubmitted?.(
                          tab.carbonLabelKey || '',
                          application,
                        );
                        refreshApplications();
                      }}
                    />
                  </Suspense>
                ) : null}
                {tab.kind === 'productCarbonCertificate' &&
                tab.accountId &&
                productCarbonCertificateVisible ? (
                  <Suspense
                    fallback={
                      <div className={style.previewLoading}>
                        <Spin />
                      </div>
                    }
                  >
                    <ProductCarbonCertificateApplyPreview
                      accountId={tab.accountId}
                      applicationId={tab.productCarbonCertificateApplicationId}
                      initializing={tab.productCarbonCertificateInitializing}
                      messageId={tab.messageId}
                      preparedApplication={tab.productCarbonCertificatePrepared}
                      projectId={projectId}
                      sessionId={agentSessionId || sessionId}
                      temporaryKey={tab.productCarbonCertificateTemporaryKey}
                      onDetailLoaded={
                        handleProductCarbonCertificateDetailLoaded
                      }
                      onSubmitted={handleProductCarbonCertificateSubmitted}
                    />
                  </Suspense>
                ) : null}
                {tabActive && tab.kind === 'account' ? (
                  <PreviewAccountDetail
                    accountId={tab.accountId || accountId}
                    onEmissionTaskCreate={
                      onEmissionTaskCreate
                        ? target =>
                            onEmissionTaskCreate({
                              ...target,
                              sourceAccountId: tab.accountId || accountId,
                            })
                        : undefined
                    }
                    onSuggestionReferenceSelect={
                      readonly ? undefined : onAccountSuggestionReferenceSelect
                    }
                    productId={tab.productId || productId}
                    refreshKey={tab.refreshKey || accountRefreshKey}
                    readonly={readonly}
                    shareAccountSearch={shareAccountSearch}
                    shareAuth={tab.shareAuth || shareAuth}
                    showBusinessForesight={showBusinessForesight}
                  />
                ) : null}
                {/* 只读 CBAM 报告按文件保留已打开的 Word 实例，切换页签不重新注册预览。 */}
                {(tabActive || Boolean(tab.reportKind)) &&
                tab.kind === 'report' ? (
                  <PreviewReportWord
                    open={tabMounted}
                    readonly={readonly || tab.reportReadonly}
                    reportName={tab.reportName || reportName}
                    reportUrl={tab.reportUrl || reportUrl}
                  />
                ) : null}
                {tabActive && tab.kind === 'cbamReport' && tab.cbamId ? (
                  <CbamReportPreview cbamId={tab.cbamId} onBack={onClose} />
                ) : null}
                {tabActive && tab.kind === 'cbamMonitor' && tab.planId ? (
                  <CbamMonitorPreview
                    planId={tab.planId}
                    readonly={readonly}
                    refreshKey={tab.refreshKey}
                  />
                ) : null}
                {tabActive &&
                tab.kind === 'cbamOperationReport' &&
                tab.operationId ? (
                  <CbamOperationReportPreview
                    operationId={tab.operationId}
                    readonly={readonly}
                    refreshKey={tab.refreshKey}
                  />
                ) : null}
                {tabActive && tab.kind === 'enterpriseCarbonReport'
                  ? (() => {
                      const selectedReportUrl =
                        tab.enterpriseCarbonSelectedFile?.path || tab.reportUrl;

                      return (
                        <PreviewReportWord
                          key={[tab.key, tab.refreshKey, selectedReportUrl]
                            .filter(Boolean)
                            .join('|')}
                          open={tabMounted}
                          readonly={readonly}
                          reportName={tab.reportName || tab.title}
                          reportUrl={selectedReportUrl}
                          sourceFileName={
                            tab.enterpriseCarbonSelectedFile?.fileName || ''
                          }
                        />
                      );
                    })()
                  : null}
                {tabActive && tab.kind === 'expertReview' && tab.detail ? (
                  <ExpertReviewDetailPanel detail={tab.detail} />
                ) : null}
                {tabActive &&
                  tab.kind === 'enterpriseCarbonExpertReview' &&
                  tab.enterpriseCarbonExpertReviewDetail && (
                    <EnterpriseCarbonExpertReviewDetail
                      detail={tab.enterpriseCarbonExpertReviewDetail}
                    />
                  )}
                {tabActive && tab.kind === 'certification' ? (
                  <PreviewCertificationApply
                    accountId={tab.accountId || accountId}
                    agentSessionId={agentSessionId}
                    authType={
                      tab.certificationDetail
                        ? getCertificationApplyAuthTypeFromItem(
                            tab.certificationDetail,
                          )
                        : tab.certificationAuthType ||
                          certificationAddAuthType ||
                          '0'
                    }
                    detail={tab.certificationDetail}
                    productId={tab.productId || productId}
                    readonly={readonly}
                    onSubmitted={
                      readonly ? undefined : onCertificationApplySubmitted
                    }
                  />
                ) : null}
                {tabActive &&
                tab.kind === 'enterpriseCarbonCertification' &&
                tab.enterpriseCarbonCertificationPageType ? (
                  <EnterpriseCarbonCertificationPreview
                    agentSessionId={agentSessionId}
                    onSubmitted={enterpriseCarbonCertificationSubmitted}
                    readonly={enterpriseCarbonReviewCertificationIsReadonly}
                    target={{
                      applyNo: tab.applyNo,
                      certificationId: tab.certificationId,
                      enterpriseCarbonBizId: tab.enterpriseCarbonBizId,
                      enterpriseCarbonBizType:
                        tab.enterpriseCarbonBizType || 'account',
                      enterpriseCarbonCertificationDetails:
                        tab.enterpriseCarbonCertificationDetails,
                      enterpriseCarbonCertificationDraft:
                        tab.enterpriseCarbonCertificationDraft,
                      enterpriseCarbonCertificationPageType:
                        tab.enterpriseCarbonCertificationPageType,
                      orgId: tab.orgId,
                      type: 'enterpriseCarbonCertification',
                      year: tab.year,
                    }}
                  />
                ) : null}
                {tabActive &&
                tab.kind === 'enterpriseCarbonAccounting' &&
                tab.enterpriseCarbonTarget ? (
                  <EnterpriseCarbonPreview
                    activeView={activeEnterpriseCarbonPreviewView}
                    key={[tab.key, tab.refreshKey].filter(Boolean).join('|')}
                    onViewChange={handleEnterpriseCarbonPreviewViewChange}
                    open={open}
                    permissions={enterpriseCarbonAccountingPermissions}
                    projectId={projectId}
                    readonly={enterpriseCarbonAccountingReadonly ?? readonly}
                    sessionId={sessionId}
                    shareId={shareId}
                    target={tab.enterpriseCarbonTarget}
                  />
                ) : null}
                {tabActive &&
                tab.kind === 'workspace' &&
                tab.workspaceLiveSession ? (
                  <WorkspaceLiveSessionPanel
                    readonly={readonly}
                    session={tab.workspaceLiveSession}
                  />
                ) : null}
              </div>
            ) : null;
          })}
        </div>
      </div>
    </aside>
  );
};

export default PreviewPane;
