/**
 * @file Carbon Agent 共享移动预览层；承载企业专家复核详情与冻结核算快照的移动接线。
 */
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import I18N from '@src/lang/I18N';
import { type ReactNode, useEffect, useState } from 'react';

import ExpertReviewDetailPanel from './ExpertReviewDetailPanel';
import Icon from './Icon';
import MobileModelDetail from './MobileModelDetail';
import {
  PreviewCertificationApply,
  PreviewReportWord,
  type CertificationApplyAuthType,
} from './PreviewPane';
import EnterpriseCarbonCertificationPreview from './enterpriseCarbonCertification/EnterpriseCarbonCertificationPreview';
import { ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE } from './enterpriseCarbonCertification/constants';
import type {
  EnterpriseCarbonCertificationPageType,
  EnterpriseCarbonCertificationRecord,
  EnterpriseCarbonCertificationTarget,
} from './enterpriseCarbonCertification/types';
import {
  getEnterpriseCarbonCertificationPageType,
  getEnterpriseCarbonCertificationProjectId,
} from './enterpriseCarbonCertification/utils';
import EnterpriseCarbonExpertReviewDetail from './enterpriseCarbonExpertReview/EnterpriseCarbonExpertReviewDetail';
import { getEnterpriseCarbonExpertReviewSnapshotContext } from './enterpriseCarbonExpertReview/snapshot';
import type { EnterpriseCarbonExpertReviewDetail as EnterpriseCarbonExpertReviewDetailData } from './enterpriseCarbonExpertReview/types';
import MobileEnterpriseCarbonPreview, {
  type EnterpriseCarbonMobileView,
} from './enterpriseCarbonPreview/MobileEnterpriseCarbonPreview';
import {
  formatEnterpriseCarbonAccountingTitle,
  getEnterpriseCarbonAccountingYear,
} from './enterpriseCarbonPreview/periodText';
import type {
  EnterpriseCarbonAccountingPermissions,
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonAccountingPreviewTarget,
} from './enterpriseCarbonPreview/types';
import { icons } from '../constants';
import {
  isEnterpriseCarbonReportFileReady,
  type EnterpriseCarbonReportFile,
} from '../enterpriseBusinessCard';
import style from '../index.module.less';
import type {
  AgentCertificationItem,
  AgentExpertReviewStatus,
  AgentWorkspaceLiveSession,
} from '../service';

type MobilePreviewTarget = {
  accountId?: string;
  certificationAuthType?: CertificationApplyAuthType;
  certificationDetails?: AgentCertificationItem[];
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationRecord[];
  enterpriseCarbonCertificationDraft?: boolean;
  enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationPageType;
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetailData;
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewDetailData[];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  versionType?: EnterpriseCarbonAccountingPreviewTarget['versionType'];
  reviewDetail?: AgentExpertReviewStatus;
  reviewDetails?: AgentExpertReviewStatus[];
  productId?: string;
  orgId?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  reportReadonly?: boolean;
  reportKind?: 'cbamMonitor' | 'cbamOperation';
  reportLabel?: string;
  snapFlag?: number | string;
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
  certificationId?: number | string;
  applyNo?: string;
};

type MobilePreviewLayerProps = {
  agentSessionId?: string;
  enterpriseCarbonAccountingPermissions?: EnterpriseCarbonAccountingPermissions;
  enterpriseCarbonAccountingReadonly?: boolean;
  open: boolean;
  projectId?: string;
  readonly?: boolean;
  sessionId?: string;
  shareId?: string;
  target?: MobilePreviewTarget;
  onClose: () => void;
};

type MobilePreviewNestedView =
  | 'enterpriseCarbonSnapshot'
  | 'modelDetail'
  | 'preview';

const getPreviewTitle = (target?: MobilePreviewTarget) => {
  if (target?.type === 'cbamReport') {
    return I18N.cbam.cbamNews;
  }

  if (target?.type === 'enterpriseCarbonAccounting') {
    const year = getEnterpriseCarbonAccountingYear(target.year);

    return formatEnterpriseCarbonAccountingTitle(year);
  }

  if (target?.type === 'enterpriseCarbonReport') {
    return (
      target.reportName || I18N.carbonAgent.enterpriseCarbonReportPreviewTitle
    );
  }

  if (target?.type === 'enterpriseCarbonExpertReview') {
    return I18N.carbonAgent.expertReview;
  }

  if (target?.type === 'enterpriseCarbonCertification') {
    return I18N.carbonAgent.enterpriseCarbonCertificationTitle;
  }

  if (target?.type === 'workspace') {
    return I18N.carbonAgent.workspaceLiveSession;
  }

  if (target?.type === 'expertReview') {
    return I18N.carbonAgent.expertReview;
  }

  if (target?.type === 'certification' && target.certificationAuthType) {
    return target.certificationAuthType === '3'
      ? I18N.carbonAgent.thirdPartyCertificationLabelTitle
      : I18N.carbonAgent.thirdPartyCertificationFootprintTitle;
  }

  if (target?.type === 'report' || target?.reportUrl) {
    return target.reportName || I18N.carbonAgent.onlineWord;
  }

  return I18N.carbonAgent.modelDetail;
};

const getWorkspaceLiveSessionUrl = (session?: AgentWorkspaceLiveSession) =>
  session?.vncAutoconnectUrl || session?.vncUrl || '';

const getEnterpriseCarbonPreviewReportFile = (
  files?: EnterpriseCarbonReportFile[],
  selectedFile?: EnterpriseCarbonReportFile,
) => {
  if (isEnterpriseCarbonReportFileReady(selectedFile)) {
    return selectedFile;
  }

  return files?.find(file => isEnterpriseCarbonReportFileReady(file));
};

/**
 * 企业复核移动目标会把来源上下文保存在 target 顶层。
 * 详情缺少对应字段时补回真实来源值，确保查看核算仍只由 reportId 控制。
 */
const getMobileEnterpriseCarbonExpertReviewDetail = (
  target: MobilePreviewTarget,
) => {
  const sourceDetail =
    target.enterpriseCarbonExpertReviewDetail ||
    target.enterpriseCarbonExpertReviewDetails?.[0];

  if (!sourceDetail) {
    return undefined;
  }

  const detail = { ...sourceDetail };

  if (!detail.reportId && target.reportId) {
    detail.reportId = target.reportId;
  }

  if (!detail.orgId && target.orgId) {
    detail.orgId = target.orgId;
  }

  if (!detail.year && target.year) {
    detail.year = target.year;
  }

  return detail;
};

const MobilePreviewLayer = ({
  agentSessionId,
  enterpriseCarbonAccountingPermissions,
  enterpriseCarbonAccountingReadonly,
  open,
  projectId,
  readonly = false,
  sessionId,
  shareId,
  target,
  onClose,
}: MobilePreviewLayerProps) => {
  const [nestedView, setNestedView] =
    useState<MobilePreviewNestedView>('preview');
  const [nestedModelAccountId, setNestedModelAccountId] = useState('');
  const [enterpriseCarbonSnapshotContext, setEnterpriseCarbonSnapshotContext] =
    useState<EnterpriseCarbonAccountingContext>();
  const [enterpriseCarbonSnapshotView, setEnterpriseCarbonSnapshotView] =
    useState<EnterpriseCarbonMobileView>('orgList');
  const [enterpriseCarbonView, setEnterpriseCarbonView] =
    useState<EnterpriseCarbonMobileView>('orgList');

  useEffect(() => {
    setNestedView('preview');
    setNestedModelAccountId('');
    setEnterpriseCarbonSnapshotContext(undefined);
    setEnterpriseCarbonSnapshotView('orgList');
    setEnterpriseCarbonView('orgList');
  }, [open, target]);

  if (!open || !target || target.type === 'carbonLabel') {
    return null;
  }

  const isReport = target.type === 'report' || Boolean(target.reportUrl);
  const isCbamReport = target.type === 'cbamReport';
  const isWorkspace = target.type === 'workspace';
  const isEnterpriseCarbon = target.type === 'enterpriseCarbonAccounting';
  const isEnterpriseCarbonReport = target.type === 'enterpriseCarbonReport';
  const isEnterpriseCarbonExpertReview =
    target.type === 'enterpriseCarbonExpertReview';
  const isEnterpriseCarbonCertification =
    target.type === 'enterpriseCarbonCertification';
  const enterpriseCarbonReportFile = isEnterpriseCarbonReport
    ? getEnterpriseCarbonPreviewReportFile(
        target.enterpriseCarbonFiles,
        target.enterpriseCarbonSelectedFile,
      )
    : undefined;
  const enterpriseCarbonReportUrl =
    enterpriseCarbonReportFile?.path || target.reportUrl;
  const enterpriseCarbonReportName =
    enterpriseCarbonReportFile?.fileName ||
    enterpriseCarbonReportFile?.versionTypeLabel ||
    target.reportName;
  const workspaceUrl = getWorkspaceLiveSessionUrl(target.workspaceLiveSession);
  const expertReviewDetail = target.reviewDetail || target.reviewDetails?.[0];
  const enterpriseCarbonExpertReviewDetail =
    getMobileEnterpriseCarbonExpertReviewDetail(target);
  const showNestedModelDetail =
    target.type === 'expertReview' &&
    nestedView === 'modelDetail' &&
    Boolean(nestedModelAccountId);
  const showEnterpriseCarbonSnapshot =
    isEnterpriseCarbonExpertReview &&
    nestedView === 'enterpriseCarbonSnapshot' &&
    Boolean(enterpriseCarbonSnapshotContext);
  const certificationDetail = target.certificationDetails?.[0];
  const certificationDetailAuthType = String(
    certificationDetail?.authType ??
      certificationDetail?.auth_type ??
      certificationDetail?.certificationAuthType ??
      certificationDetail?.certification_auth_type ??
      '',
  );
  const certificationAuthType =
    target.certificationAuthType ||
    (certificationDetailAuthType === '3'
      ? '3'
      : certificationDetail
      ? '0'
      : undefined);
  const isExpertReview = target.type === 'expertReview';
  const isCertification =
    target.type === 'certification' && Boolean(certificationAuthType);
  let enterpriseCarbonCertificationTarget:
    | EnterpriseCarbonCertificationTarget
    | undefined;

  if (isEnterpriseCarbonCertification) {
    const enterpriseCertificationDetails =
      target.enterpriseCarbonCertificationDetails || [];
    const enterpriseCertificationDetail = enterpriseCertificationDetails[0];
    let enterpriseCertificationPageType =
      target.enterpriseCarbonCertificationPageType;
    let enterpriseCertificationId = target.certificationId;
    let enterpriseCertificationApplyNo = target.applyNo;
    let { enterpriseCarbonBizId, enterpriseCarbonBizType } = target;
    let { orgId: enterpriseOrgId, year: enterpriseYear } = target;

    if (enterpriseCertificationDetail) {
      enterpriseCertificationPageType =
        getEnterpriseCarbonCertificationPageType(
          enterpriseCertificationDetail,
          readonly,
        );
      enterpriseCertificationId = getEnterpriseCarbonCertificationProjectId(
        enterpriseCertificationDetail,
      );
      enterpriseCertificationApplyNo =
        enterpriseCertificationDetail.applyNo || undefined;

      if (enterpriseCertificationDetail.enterpriseCarbonBizId?.trim()) {
        enterpriseCarbonBizId =
          enterpriseCertificationDetail.enterpriseCarbonBizId.trim();
      }

      if (enterpriseCertificationDetail.enterpriseCarbonBizType) {
        enterpriseCarbonBizType =
          enterpriseCertificationDetail.enterpriseCarbonBizType;
      }

      if (enterpriseCertificationDetail.orgId?.trim()) {
        enterpriseOrgId = enterpriseCertificationDetail.orgId.trim();
      }

      if (enterpriseCertificationDetail.year?.trim()) {
        enterpriseYear = enterpriseCertificationDetail.year.trim();
      }
    }

    if (!enterpriseCertificationPageType) {
      enterpriseCertificationPageType =
        ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.ADD;
    }

    if (readonly) {
      enterpriseCertificationPageType =
        ENTERPRISE_CARBON_CERTIFICATION_PAGE_TYPE.SHOW;
    }

    enterpriseCarbonCertificationTarget = {
      applyNo: enterpriseCertificationApplyNo,
      certificationId: enterpriseCertificationId,
      enterpriseCarbonBizId,
      enterpriseCarbonBizType: enterpriseCarbonBizType || 'account',
      enterpriseCarbonCertificationDetails: enterpriseCertificationDetails,
      enterpriseCarbonCertificationDraft:
        target.enterpriseCarbonCertificationDraft,
      enterpriseCarbonCertificationPageType: enterpriseCertificationPageType,
      orgId: enterpriseOrgId,
      type: 'enterpriseCarbonCertification',
      year: enterpriseYear,
    };
  }
  let title = getPreviewTitle(target);

  if (showNestedModelDetail) {
    title = I18N.carbonAgent.modelDetail;
  } else if (isEnterpriseCarbon && enterpriseCarbonView === 'detail') {
    title = I18N.carbonAgent.enterpriseCarbonAccountingDataDetails;
  }

  if (showEnterpriseCarbonSnapshot) {
    title = formatEnterpriseCarbonAccountingTitle(
      enterpriseCarbonSnapshotContext?.year,
    );

    if (enterpriseCarbonSnapshotView === 'detail') {
      title = I18N.carbonAgent.enterpriseCarbonAccountingDataDetails;
    }
  }

  const handleBack = () => {
    if (showEnterpriseCarbonSnapshot) {
      if (enterpriseCarbonSnapshotView === 'detail') {
        setEnterpriseCarbonSnapshotView('orgList');
        return;
      }

      setNestedView('preview');
      setEnterpriseCarbonSnapshotContext(undefined);
      setEnterpriseCarbonSnapshotView('orgList');
      return;
    }

    if (showNestedModelDetail) {
      setNestedView('preview');
      setNestedModelAccountId('');
      return;
    }

    if (isEnterpriseCarbon && enterpriseCarbonView === 'detail') {
      setEnterpriseCarbonView('orgList');
      return;
    }

    onClose();
  };

  let enterprisePreviewContent: ReactNode;

  if (showEnterpriseCarbonSnapshot && enterpriseCarbonSnapshotContext) {
    enterprisePreviewContent = (
      <MobileEnterpriseCarbonPreview
        readonly
        snapshotContext={enterpriseCarbonSnapshotContext}
        target={{
          type: 'enterpriseCarbonAccounting',
          versionType: target.versionType,
          year: enterpriseCarbonSnapshotContext.year,
        }}
        view={enterpriseCarbonSnapshotView}
        onViewChange={setEnterpriseCarbonSnapshotView}
      />
    );
  } else if (
    isEnterpriseCarbonCertification &&
    enterpriseCarbonCertificationTarget
  ) {
    enterprisePreviewContent = (
      <EnterpriseCarbonCertificationPreview
        agentSessionId={agentSessionId}
        readonly={readonly}
        target={enterpriseCarbonCertificationTarget}
      />
    );
  } else if (
    isEnterpriseCarbonExpertReview &&
    enterpriseCarbonExpertReviewDetail
  ) {
    enterprisePreviewContent = (
      <EnterpriseCarbonExpertReviewDetail
        detail={enterpriseCarbonExpertReviewDetail}
        onViewAccounting={detail => {
          const snapshotContext =
            getEnterpriseCarbonExpertReviewSnapshotContext(detail);

          if (!snapshotContext) {
            return;
          }

          setEnterpriseCarbonSnapshotContext(snapshotContext);
          setEnterpriseCarbonSnapshotView('orgList');
          setNestedView('enterpriseCarbonSnapshot');
        }}
      />
    );
  }

  return (
    <section className={style.mobilePreviewLayer} aria-label={title}>
      <header className={style.mobilePreviewHeader}>
        <button
          className={style.mobilePreviewBackButton}
          type='button'
          aria-label={I18N.carbonAgent.back}
          onClick={handleBack}
        >
          <Icon
            className={style.mobilePreviewBackIcon}
            src={icons.chevronIcon}
          />
        </button>
        <h1>{title}</h1>
        <button
          className={style.mobilePreviewCloseButton}
          type='button'
          aria-label={I18N.carbonAgent.closePreview}
          onClick={onClose}
        >
          <span aria-hidden='true' />
        </button>
      </header>
      <div className={style.mobilePreviewBody}>
        {enterprisePreviewContent ||
          (showNestedModelDetail ? (
            <MobileModelDetail
              accountId={nestedModelAccountId}
              snapFlag={API_EXTRA_PARAMS_SNAPFLAG.SHARE}
            />
          ) : isEnterpriseCarbon ? (
            enterpriseCarbonAccountingPermissions?.canViewAccounting ===
            false ? (
              <div className={style.mobilePreviewPermissionState} role='status'>
                {I18N.carbonAgent.enterpriseCarbonAccountingViewUnauthorized}
              </div>
            ) : (
              <MobileEnterpriseCarbonPreview
                projectId={projectId}
                readonly={enterpriseCarbonAccountingReadonly ?? readonly}
                sessionId={sessionId}
                shareId={shareId}
                target={{
                  type: 'enterpriseCarbonAccounting',
                  versionType: target.versionType,
                  year: target.year,
                }}
                view={enterpriseCarbonView}
                onViewChange={setEnterpriseCarbonView}
              />
            )
          ) : isEnterpriseCarbonReport ? (
            <PreviewReportWord
              open={open}
              readonly
              reportName={enterpriseCarbonReportName}
              reportUrl={enterpriseCarbonReportUrl}
              sourceFileName={enterpriseCarbonReportFile?.fileName || ''}
            />
          ) : isCbamReport ? (
            <div className={style.mobilePreviewPermissionState} role='status'>
              {I18N.carbonAgent.cbamReportMobileUnsupported}
            </div>
          ) : isExpertReview && expertReviewDetail ? (
            <ExpertReviewDetailPanel
              detail={expertReviewDetail}
              onViewModel={accountId => {
                setNestedModelAccountId(accountId);
                setNestedView('modelDetail');
              }}
            />
          ) : isWorkspace ? (
            <div className={style.workspaceLiveSessionPanel}>
              <div className={style.workspaceLiveSessionFrameWrap}>
                {workspaceUrl ? (
                  <>
                    <iframe
                      allow='clipboard-read; clipboard-write; fullscreen'
                      className={style.workspaceLiveSessionFrame}
                      src={workspaceUrl}
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
          ) : isCertification && certificationAuthType ? (
            <PreviewCertificationApply
              accountId={target.accountId}
              agentSessionId={agentSessionId}
              authType={certificationAuthType}
              detail={certificationDetail}
              productId={target.productId}
              readonly={readonly}
            />
          ) : isReport ? (
            <PreviewReportWord
              open={open}
              readonly={readonly || target.reportReadonly}
              reportName={target.reportName}
              reportUrl={target.reportUrl}
            />
          ) : (
            <MobileModelDetail
              accountId={target.accountId}
              snapFlag={target.snapFlag}
            />
          ))}
      </div>
    </section>
  );
};

export default MobilePreviewLayer;
