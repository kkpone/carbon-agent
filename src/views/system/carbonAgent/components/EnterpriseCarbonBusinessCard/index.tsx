/**
 * @file 企业碳业务卡装配组件，解析企业核算/报告卡上下文并接入企业专属复核与认证组件。
 */
import I18N from '@src/lang/I18N';

import {
  getEnterpriseCarbonAccountingYear,
  getEnterpriseCarbonBusinessId,
  getEnterpriseCarbonBusinessKind,
  getEnterpriseCarbonReportFiles,
  getEnterpriseCarbonReportYear,
  getEnterpriseBusinessRecord,
  getEnterpriseBusinessValue,
  type EnterpriseCarbonReportFile,
} from '../../enterpriseBusinessCard';
import type { AgentMessageCard } from '../../service';
import EnterpriseCarbonComputationCard from '../EnterpriseCarbonComputationCard';
import EnterpriseCarbonReportCard from '../EnterpriseCarbonReportCard';
import type { EnterpriseCarbonCertificationTarget } from '../enterpriseCarbonCertification/types';
import type {
  EnterpriseCarbonExpertReviewTarget,
  EnterpriseCarbonExpertReviewSnapshot,
} from '../enterpriseCarbonExpertReview/types';

type EnterpriseCarbonAccountingCardTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType: 'account';
  orgId?: string;
  refreshKey?: string;
  title?: string;
  type: 'enterpriseCarbonAccounting';
  year: string;
};

type EnterpriseCarbonReportCardTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType: 'report';
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  orgId?: string;
  refreshKey?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  title?: string;
  type: 'enterpriseCarbonReport';
  year?: string;
};

type EnterpriseCarbonExpertReviewPreviewTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewTarget['reviewDetail'];
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewTarget['reviewDetails'];
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewSnapshot;
  orgId?: string;
  reportId?: string;
  type: 'enterpriseCarbonExpertReview';
  year?: string;
};

export type EnterpriseCarbonBusinessCardOpenTarget =
  | EnterpriseCarbonAccountingCardTarget
  | EnterpriseCarbonCertificationTarget
  | EnterpriseCarbonExpertReviewPreviewTarget
  | EnterpriseCarbonReportCardTarget;

type EnterpriseCarbonBusinessCardProps = {
  card: AgentMessageCard;
  interactionDisabled?: boolean;
  onOpen?: (target: EnterpriseCarbonBusinessCardOpenTarget) => void;
  showThirdPartyCertification?: boolean;
};

const getBusinessCardPayload = (card: AgentMessageCard) => {
  const root = getEnterpriseBusinessRecord(card.card);
  const safePayload = getEnterpriseBusinessRecord(root.safePayload);

  return {
    ...safePayload,
    ...root,
  };
};

const getBusinessCardData = (payload: Record<string, unknown>) => {
  const nestedCard = getEnterpriseBusinessRecord(payload.card);

  if (Object.keys(nestedCard).length) {
    return nestedCard;
  }

  return payload;
};

const getBusinessCardRecords = (businessCard: Record<string, unknown>) => [
  getEnterpriseBusinessRecord(businessCard.summary),
  getEnterpriseBusinessRecord(businessCard.data),
  getEnterpriseBusinessRecord(businessCard.snapshot),
  businessCard,
];

type EnterpriseCarbonCardRefreshTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType: 'account' | 'report';
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  reportId?: string;
  reportUrl?: string;
  type: 'enterpriseCarbonAccounting' | 'enterpriseCarbonReport';
  year?: string;
};

const getEnterpriseCarbonCardRefreshKey = (
  card: AgentMessageCard,
  target: EnterpriseCarbonCardRefreshTarget,
) =>
  [
    card.messageId,
    card.orderNo,
    card.cardType,
    target.type,
    target.reportId,
    target.reportUrl,
    target.enterpriseCarbonBizType,
    target.enterpriseCarbonBizId,
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
  ]
    .filter(value => value !== undefined && value !== null && value !== '')
    .join('|');

const getEnterpriseCarbonCardTarget = (
  card: AgentMessageCard,
  businessCard: Record<string, unknown>,
  payload: Record<string, unknown>,
):
  | EnterpriseCarbonAccountingCardTarget
  | EnterpriseCarbonReportCardTarget
  | undefined => {
  const records = [
    getEnterpriseBusinessRecord(businessCard.extra),
    getEnterpriseBusinessRecord(businessCard.bizRef),
    getEnterpriseBusinessRecord(businessCard.data),
    getEnterpriseBusinessRecord(businessCard.summary),
    getEnterpriseBusinessRecord(businessCard.snapshot),
    businessCard,
    payload,
  ];
  const enterpriseCarbonKind = getEnterpriseCarbonBusinessKind(records);
  const orgId = getEnterpriseBusinessValue(records, ['orgId', 'org_id']);
  const reportId = getEnterpriseBusinessValue(records, [
    'reportId',
    'report_id',
    'bizId',
    'biz_id',
    'id',
  ]);
  const reportName = getEnterpriseBusinessValue(records, [
    'reportName',
    'report_name',
    'name',
  ]);
  const title = getEnterpriseBusinessValue(records, [
    'title',
    'cardTitle',
    'name',
  ]);

  if (enterpriseCarbonKind === 'account') {
    const year = getEnterpriseCarbonAccountingYear(records);

    if (!year) {
      return undefined;
    }

    const target: EnterpriseCarbonAccountingCardTarget = {
      enterpriseCarbonBizId: getEnterpriseCarbonBusinessId(records),
      enterpriseCarbonBizType: 'account',
      orgId,
      title: title || I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
      type: 'enterpriseCarbonAccounting',
      year,
    };
    target.refreshKey = getEnterpriseCarbonCardRefreshKey(card, target);

    return target;
  }

  if (enterpriseCarbonKind !== 'report') {
    return undefined;
  }

  const enterpriseCarbonFiles = getEnterpriseCarbonReportFiles(records);
  const enterpriseCarbonReportId =
    getEnterpriseCarbonBusinessId(records) || reportId;
  const year = getEnterpriseCarbonReportYear(records);

  if (!enterpriseCarbonReportId && !enterpriseCarbonFiles.length) {
    return undefined;
  }

  const target: EnterpriseCarbonReportCardTarget = {
    enterpriseCarbonBizId: enterpriseCarbonReportId,
    enterpriseCarbonBizType: 'report',
    enterpriseCarbonFiles,
    orgId,
    reportId: enterpriseCarbonReportId,
    reportName,
    title: title || reportName,
    type: 'enterpriseCarbonReport',
    year,
  };
  target.refreshKey = getEnterpriseCarbonCardRefreshKey(card, target);

  return target;
};

const EnterpriseCarbonBusinessCard = ({
  card,
  interactionDisabled = false,
  onOpen,
  showThirdPartyCertification = true,
}: EnterpriseCarbonBusinessCardProps) => {
  const payload = getBusinessCardPayload(card);
  const businessCard = getBusinessCardData(payload);
  const records = getBusinessCardRecords(businessCard);
  const contextRecords = [
    getEnterpriseBusinessRecord(businessCard.extra),
    getEnterpriseBusinessRecord(businessCard.bizRef),
    ...records,
    payload,
  ];
  const target = getEnterpriseCarbonCardTarget(card, businessCard, payload);

  if (!target) {
    return null;
  }

  const messageId =
    card.messageId ||
    getEnterpriseBusinessValue(contextRecords, ['messageId', 'message_id']);
  const projectId = getEnterpriseBusinessValue(contextRecords, [
    'projectId',
    'project_id',
  ]);
  const sessionId = getEnterpriseBusinessValue(contextRecords, [
    'sessionId',
    'session_id',
  ]);
  const canOpen = Boolean(onOpen);
  const handleOpenExpertReview = (
    reviewTarget: EnterpriseCarbonExpertReviewTarget,
  ) => {
    if (!onOpen) {
      return;
    }

    onOpen({
      enterpriseCarbonBizId: reviewTarget.enterpriseCarbonBizId,
      enterpriseCarbonBizType: reviewTarget.enterpriseCarbonBizType,
      enterpriseCarbonExpertReviewDetail: reviewTarget.reviewDetail,
      enterpriseCarbonExpertReviewDetails: reviewTarget.reviewDetails,
      enterpriseCarbonSnapshot: reviewTarget.snapshot,
      orgId: reviewTarget.orgId,
      reportId: reviewTarget.reportId,
      type: 'enterpriseCarbonExpertReview',
      year: reviewTarget.year,
    });
  };

  if (target.type === 'enterpriseCarbonReport') {
    return (
      <EnterpriseCarbonReportCard
        canOpen={canOpen}
        interactionDisabled={interactionDisabled}
        messageId={messageId}
        onOpen={onOpen}
        onOpenCertification={onOpen}
        onOpenExpertReview={handleOpenExpertReview}
        projectId={projectId}
        sessionId={sessionId}
        showThirdPartyCertification={showThirdPartyCertification}
        target={target}
      />
    );
  }

  const handleOpen = () => {
    if (onOpen) {
      onOpen(target);
    }
  };

  return (
    <EnterpriseCarbonComputationCard
      canOpen={canOpen}
      enterpriseCarbonBizId={target.enterpriseCarbonBizId}
      interactionDisabled={interactionDisabled}
      messageId={messageId}
      orgId={target.orgId}
      onOpen={handleOpen}
      onOpenCertification={onOpen}
      onOpenExpertReview={handleOpenExpertReview}
      projectId={projectId}
      sessionId={sessionId}
      showThirdPartyCertification={showThirdPartyCertification}
      summary={businessCard.summary}
      title={target.title}
      year={target.year}
    />
  );
};

export default EnterpriseCarbonBusinessCard;
