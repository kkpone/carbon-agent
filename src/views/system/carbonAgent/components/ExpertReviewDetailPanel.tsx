import expertReviewEmptyIcon from '@src/assets/images/carbonAgent/icons/expert-review-empty.svg';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';

import {
  getExpertReviewSnapshotModelAccountId,
  getExpertReviewSnapshotModelUrl,
} from './expertReviewSnapshotOrigin';
import style from '../index.module.less';
import { AGENT_EXPERT_REVIEW_STATUS } from '../service';
import type {
  AgentExpertReviewIssue,
  AgentExpertReviewStatus,
} from '../service';

type ExpertReviewStatusTone = 'completed' | 'pending' | 'reviewing';

type ExpertReviewDetailPanelProps = {
  detail: AgentExpertReviewStatus;
  onViewModel?: (accountId: string) => void;
};

const getDisplayText = (value?: number | string | null) =>
  value === undefined || value === null || String(value).trim() === ''
    ? '-'
    : String(value).trim();

const parseReviewDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const dateTimeMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (dateTimeMatch) {
    const [, year, month, day, hour, minute, second = '0'] = dateTimeMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );

    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatReviewDate = (date: Date) => {
  const pad = (timeValue: number) => String(timeValue).padStart(2, '0');

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatReviewTime = (value?: string | null) => {
  const date = parseReviewDate(value);

  if (date) {
    return formatReviewDate(date);
  }

  return value ? value.replace(/-/g, '.') : '-';
};

const getEstimatedCompleteTime = (detail: AgentExpertReviewStatus) => {
  if (detail.completeTime) {
    return formatReviewTime(detail.completeTime);
  }

  const createTime = parseReviewDate(detail.createTime);

  if (!createTime) {
    return '-';
  }

  const estimatedTime = new Date(createTime);

  estimatedTime.setDate(estimatedTime.getDate() + 2);

  return formatReviewDate(estimatedTime);
};

const getReviewStatusTone = (
  detail: AgentExpertReviewStatus,
): ExpertReviewStatusTone => {
  const status = (detail.status || '').trim().toLowerCase();

  if (status === AGENT_EXPERT_REVIEW_STATUS.COMPLETED) {
    return 'completed';
  }

  if (status === AGENT_EXPERT_REVIEW_STATUS.REVIEWING) {
    return 'reviewing';
  }

  if (status === AGENT_EXPERT_REVIEW_STATUS.PENDING_REVIEW) {
    return 'pending';
  }

  return 'pending';
};

const getReviewStatusLabel = (detail: AgentExpertReviewStatus) => {
  if (detail.statusName?.trim()) {
    return detail.statusName.trim();
  }

  const tone = getReviewStatusTone(detail);

  if (tone === 'completed') {
    return I18N.carbonAgent.expertReviewStatusCompleted;
  }

  if (tone === 'reviewing') {
    return I18N.carbonAgent.expertReviewStatusReviewing;
  }

  return I18N.carbonAgent.expertReviewStatusPending;
};

const getReviewObjectLabel = (objectType?: string | null) => {
  if (objectType === 'report') {
    return I18N.carbonAgent.expertReviewDetailObjectReport;
  }

  if (objectType === 'model_report') {
    return I18N.carbonAgent.expertReviewDetailObjectModelReport;
  }

  return I18N.carbonAgent.expertReviewDetailObjectAccount;
};

const getReviewTitle = (detail: AgentExpertReviewStatus) =>
  getDisplayText(detail.accountName || detail.productName).replace(
    /^-$/,
    I18N.carbonAgent.expertReviewDetailDefaultTitle,
  );

const getReviewInitial = (title: string) => {
  const normalizedTitle = title.trim();

  return normalizedTitle ? normalizedTitle.slice(0, 1).toUpperCase() : 'C';
};

const getIssueKey = (issue: AgentExpertReviewIssue, index: number) =>
  [index, issue.moduleName, issue.severity, issue.issue, issue.suggestion]
    .filter(Boolean)
    .join('-');

const ExpertReviewEmpty = () => (
  <div className={style.expertReviewDetailEmpty}>
    <span className={style.expertReviewDetailEmptyIcon} aria-hidden='true'>
      <img alt='' src={expertReviewEmptyIcon} />
    </span>
    <span>{I18N.carbonAgent.expertReviewDetailNoContent}</span>
  </div>
);

const ExpertReviewDetailPanel = ({
  detail,
  onViewModel,
}: ExpertReviewDetailPanelProps) => {
  const title = getReviewTitle(detail);
  const statusTone = getReviewStatusTone(detail);
  const issues = Array.isArray(detail.issues) ? detail.issues : [];
  const snapshotModelAccountId = getExpertReviewSnapshotModelAccountId(
    detail.snapAccountId,
  );
  const snapshotModelUrl = getExpertReviewSnapshotModelUrl(
    detail.snapAccountId,
  );
  const canViewModel = onViewModel
    ? Boolean(snapshotModelAccountId)
    : Boolean(snapshotModelUrl);
  const totalEmission = [
    getDisplayText(detail.totalEmission),
    detail.emissionUnit?.trim(),
  ]
    .filter(value => value && value !== '-')
    .join(' ');
  const metricItems = [
    {
      label: I18N.carbonAgent.expertReviewDetailObjectLabel,
      value: getReviewObjectLabel(detail.objectType),
    },
    {
      label: I18N.carbonAgent.expertReviewDetailTotalEmission,
      value: totalEmission || '-',
    },
    {
      label: I18N.carbonAgent.expertReviewDetailFunctionalUnit,
      value: getDisplayText(detail.functionalUnit),
    },
    {
      label: I18N.carbonAgent.expertReviewDetailEstimatedComplete,
      value: getEstimatedCompleteTime(detail),
    },
  ];
  const statusClassName = classNames(
    style.expertReviewDetailStatus,
    statusTone === 'pending' && style.expertReviewDetailStatusPending,
    statusTone === 'reviewing' && style.expertReviewDetailStatusReviewing,
    statusTone === 'completed' && style.expertReviewDetailStatusCompleted,
  );

  return (
    <div className={style.expertReviewDetailPanel}>
      <div className={style.expertReviewDetailCard}>
        <section
          className={classNames(
            style.expertReviewDetailSnapshot,
            statusTone === 'pending' && style.expertReviewDetailSnapshotPending,
            statusTone === 'reviewing' &&
              style.expertReviewDetailSnapshotReviewing,
            statusTone === 'completed' &&
              style.expertReviewDetailSnapshotCompleted,
          )}
        >
          <div className={style.expertReviewDetailSnapshotHeader}>
            <div className={style.expertReviewDetailProductThumb}>
              <span>{getReviewInitial(title)}</span>
            </div>
            <div className={style.expertReviewDetailSnapshotTitle}>
              <strong>{title}</strong>
              <span>{I18N.carbonAgent.expertReviewDetailSnapshotBadge}</span>
            </div>
            {canViewModel ? (
              <button
                className={style.expertReviewDetailViewButton}
                type='button'
                onClick={() => {
                  if (onViewModel && snapshotModelAccountId) {
                    onViewModel(snapshotModelAccountId);
                    return;
                  }

                  if (snapshotModelUrl) {
                    window.open(
                      snapshotModelUrl,
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }
                }}
              >
                {I18N.carbonAgent.expertReviewDetailViewModel}
              </button>
            ) : null}
          </div>
          <div className={style.expertReviewDetailMetricGrid}>
            {metricItems.map(item => (
              <div className={style.expertReviewDetailMetric} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
            <div className={style.expertReviewDetailMetric}>
              <span>{I18N.carbonAgent.expertReviewDetailStatus}</span>
              <strong>
                <span className={statusClassName}>
                  {getReviewStatusLabel(detail)}
                </span>
              </strong>
            </div>
          </div>
        </section>

        <section className={style.expertReviewDetailSection}>
          <h3>{I18N.carbonAgent.expertReviewDetailFeedback}</h3>
          {detail.expertOpinion?.trim() ? (
            <div className={style.expertReviewDetailFeedbackBox}>
              {detail.expertOpinion.trim()}
            </div>
          ) : (
            <ExpertReviewEmpty />
          )}
        </section>

        <section className={style.expertReviewDetailSection}>
          <h3>{I18N.carbonAgent.expertReviewDetailIssues}</h3>
          <div className={style.expertReviewDetailIssueTableWrap}>
            <table className={style.expertReviewDetailIssueTable}>
              <thead>
                <tr>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueModule}</th>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueProblem}</th>
                  <th>{I18N.carbonAgent.expertReviewDetailIssueSuggestion}</th>
                </tr>
              </thead>
              {issues.length ? (
                <tbody>
                  {issues.map((issue, index) => (
                    <tr key={getIssueKey(issue, index)}>
                      <td>{getDisplayText(issue.moduleName)}</td>
                      <td>{getDisplayText(issue.issue)}</td>
                      <td>{getDisplayText(issue.suggestion)}</td>
                    </tr>
                  ))}
                </tbody>
              ) : null}
            </table>
            {!issues.length ? <ExpertReviewEmpty /> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpertReviewDetailPanel;
