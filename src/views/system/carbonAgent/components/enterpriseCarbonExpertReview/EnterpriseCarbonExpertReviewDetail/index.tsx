/**
 * @file 企业碳专属专家复核详情，展示企业冻结快照、审核状态、反馈与问题建议。
 */
import emptyIcon from '@src/assets/images/carbonAgent/icons/expert-review-empty.svg';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import style from './index.module.less';
import type { EnterpriseCarbonExpertReviewDetailProps } from './types';
import { ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS } from '../constants';
import {
  getEnterpriseCarbonExpertReviewSnapshotContext,
  getEnterpriseCarbonExpertReviewSnapshotUrl,
} from '../snapshot';
import type {
  EnterpriseCarbonExpertReviewDetail as EnterpriseCarbonExpertReviewDetailData,
  EnterpriseCarbonExpertReviewIssue,
} from '../types';

type StatusTone = 'completed' | 'pending' | 'reviewing';

const STATUS_CLASS_MAP: Record<
  StatusTone,
  { cardClassName: string; statusClassName: string }
> = {
  completed: {
    cardClassName: style.snapshotCardCompleted,
    statusClassName: style.statusCompleted,
  },
  pending: {
    cardClassName: style.snapshotCardPending,
    statusClassName: style.statusPending,
  },
  reviewing: {
    cardClassName: style.snapshotCardReviewing,
    statusClassName: style.statusReviewing,
  },
};

const getDisplayText = (value?: number | string | null) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return '-';
  }

  return String(value).trim();
};

const getStatusTone = (
  detail: EnterpriseCarbonExpertReviewDetailData,
): StatusTone => {
  const status = detail.status?.trim().toLowerCase();

  if (status === ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS.COMPLETED) {
    return 'completed';
  }

  if (status === ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS.REVIEWING) {
    return 'reviewing';
  }

  return 'pending';
};

const getStatusLabel = (detail: EnterpriseCarbonExpertReviewDetailData) => {
  if (detail.statusName?.trim()) {
    return detail.statusName.trim();
  }

  const tone = getStatusTone(detail);

  if (tone === 'completed') {
    return I18N.carbonAgent.expertReviewStatusCompleted;
  }

  if (tone === 'reviewing') {
    return I18N.carbonAgent.expertReviewStatusReviewing;
  }

  return I18N.carbonAgent.expertReviewStatusPending;
};

const getIssueKey = (issue: EnterpriseCarbonExpertReviewIssue, index: number) =>
  [index, issue.moduleName, issue.severity, issue.issue, issue.suggestion]
    .filter(Boolean)
    .join('-');

const EmptyContent = () => (
  <div className={style.emptyContent}>
    <img alt='' src={emptyIcon} />
    <span>{I18N.carbonAgent.expertReviewDetailNoContent}</span>
  </div>
);

const EnterpriseCarbonExpertReviewDetail = ({
  detail,
  onViewAccounting,
}: EnterpriseCarbonExpertReviewDetailProps) => {
  const tone = getStatusTone(detail);
  const statusPresentation = STATUS_CLASS_MAP[tone];
  let issues: EnterpriseCarbonExpertReviewIssue[] = [];

  if (Array.isArray(detail.issues)) {
    issues = detail.issues;
  }

  const snapshotContext =
    getEnterpriseCarbonExpertReviewSnapshotContext(detail);
  const snapshotUrl = getEnterpriseCarbonExpertReviewSnapshotUrl(detail);
  const title = getDisplayText(detail.accountName);
  const accountingScope = getDisplayText(detail.accountScope);
  const accountingPeriod = getDisplayText(detail.periodName);
  const accountingStandard = getDisplayText(detail.standardName);
  const emissionValue = getDisplayText(detail.totalEmission);
  const emissionUnit = detail.emissionUnit || '';
  const statusLabel = getStatusLabel(detail);
  let totalEmission = '-';

  if (emissionValue !== '-') {
    totalEmission = emissionValue;

    if (emissionUnit) {
      totalEmission = `${emissionValue} ${emissionUnit}`;
    }
  }

  const metrics = [
    {
      label: I18N.enterpriseCarbonAccount2.accountingEntity,
      value: accountingScope,
    },
    {
      label: I18N.components.accountingCycle,
      value: accountingPeriod,
    },
    {
      label: I18N.enterpriseCarbonAccount2.accountingStandards,
      value: accountingStandard,
    },
    {
      label: I18N.carbonAgent.enterpriseCarbonExpertReviewEstimatedEmission,
      value: totalEmission,
    },
  ];
  let canViewAccounting = Boolean(snapshotUrl);

  if (onViewAccounting) {
    canViewAccounting = Boolean(snapshotContext);
  }
  const expertOpinion = detail.expertOpinion?.trim();
  let feedbackContent: ReactNode = <EmptyContent />;
  let issueTableBody: ReactNode = null;
  let issueEmptyContent: ReactNode = <EmptyContent />;

  if (expertOpinion) {
    feedbackContent = <div className={style.feedbackBox}>{expertOpinion}</div>;
  }

  if (issues.length) {
    issueTableBody = (
      <tbody>
        {issues.map((issue, index) => {
          const moduleName = getDisplayText(issue.moduleName);
          const issueContent = getDisplayText(issue.issue);
          const suggestion = getDisplayText(issue.suggestion);

          return (
            <tr key={getIssueKey(issue, index)}>
              <td title={moduleName}>{moduleName}</td>
              <td title={issueContent}>{issueContent}</td>
              <td title={suggestion}>{suggestion}</td>
            </tr>
          );
        })}
      </tbody>
    );
    issueEmptyContent = null;
  }

  const handleViewAccounting = () => {
    const currentSnapshotContext =
      getEnterpriseCarbonExpertReviewSnapshotContext(detail);

    if (onViewAccounting && currentSnapshotContext) {
      onViewAccounting(detail);
      return;
    }

    const currentSnapshotUrl =
      getEnterpriseCarbonExpertReviewSnapshotUrl(detail);

    if (currentSnapshotUrl) {
      window.open(currentSnapshotUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={style.detailPanel}>
      <div className={style.detailContent}>
        <section
          className={classNames(
            style.snapshotCard,
            statusPresentation.cardClassName,
          )}
        >
          <div className={style.snapshotCardInner}>
            <div className={style.snapshotHeader}>
              <div className={style.snapshotTitle}>
                <strong>{title}</strong>
                <span>
                  {I18N.carbonAgent.enterpriseCarbonExpertReviewSnapshotBadge}
                </span>
              </div>
              {canViewAccounting && (
                <button
                  className={style.viewButton}
                  type='button'
                  onClick={handleViewAccounting}
                >
                  {I18N.carbonFootprint3.viewAccounting}
                </button>
              )}
            </div>

            <div className={style.metricGrid}>
              {metrics.map(metric => (
                <div className={style.metric} key={metric.label}>
                  <span title={metric.label}>{metric.label}</span>
                  <strong title={metric.value}>{metric.value}</strong>
                </div>
              ))}
              <div className={style.metric}>
                <span title={I18N.carbonAgent.expertReviewDetailStatus}>
                  {I18N.carbonAgent.expertReviewDetailStatus}
                </span>
                <strong title={statusLabel}>
                  <span
                    className={classNames(
                      style.status,
                      statusPresentation.statusClassName,
                    )}
                  >
                    {statusLabel}
                  </span>
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={classNames(style.section, style.feedbackSection)}>
          <h3>{I18N.carbonAgent.expertReviewDetailFeedback}</h3>
          {feedbackContent}
        </section>

        <section className={style.section}>
          <h3>{I18N.carbonAgent.expertReviewDetailIssues}</h3>
          <div className={style.issueTableWrap}>
            <table className={style.issueTable}>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueModule}</th>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueProblem}</th>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueSuggestion}</th>
                </tr>
              </thead>
              {issueTableBody}
            </table>
            {issueEmptyContent}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EnterpriseCarbonExpertReviewDetail;
