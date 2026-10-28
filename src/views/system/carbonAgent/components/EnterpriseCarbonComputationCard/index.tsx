/**
 * @file 企业碳核算结果卡，展示核算摘要并接入企业专属复核与认证操作区。
 */
import I18N from '@src/lang/I18N';
import classNames from 'classnames';

import style from '../../index.module.less';
import type { EnterpriseCarbonCertificationTarget } from '../enterpriseCarbonCertification/types';
import type { EnterpriseCarbonExpertReviewTarget } from '../enterpriseCarbonExpertReview/types';
import EnterpriseCarbonReviewCertificationActions from '../enterpriseCarbonReviewCertification/EnterpriseCarbonReviewCertificationActions';

type EnterpriseCarbonComputationCardProps = {
  canOpen: boolean;
  enterpriseCarbonBizId?: string;
  interactionDisabled?: boolean;
  messageId?: string;
  orgId?: string;
  onOpenCertification?: (target: EnterpriseCarbonCertificationTarget) => void;
  onOpenExpertReview?: (target: EnterpriseCarbonExpertReviewTarget) => void;
  onOpen: () => void;
  projectId?: string;
  sessionId?: string;
  showThirdPartyCertification?: boolean;
  summary: unknown;
  title?: string;
  year?: string;
};

const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

const getOptionalScalarString = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (typeof data === 'number' && Number.isFinite(data)) {
    return String(data);
  }

  return undefined;
};

const EnterpriseCarbonComputationCard = ({
  canOpen,
  enterpriseCarbonBizId,
  interactionDisabled,
  messageId,
  orgId,
  onOpenCertification,
  onOpenExpertReview,
  onOpen,
  projectId,
  sessionId,
  showThirdPartyCertification,
  summary,
  title,
  year,
}: EnterpriseCarbonComputationCardProps) => {
  const enterpriseCarbonSummary = asRecord(summary);
  let accountingScope: string | undefined;

  if (
    Array.isArray(enterpriseCarbonSummary.orgNames) &&
    enterpriseCarbonSummary.orgNames.length
  ) {
    accountingScope = enterpriseCarbonSummary.orgNames.join(
      I18N.carbonAgent.enterpriseCarbonValueSeparator,
    );
  }

  return (
    <div
      className={classNames(style.businessCard, style.enterpriseBusinessCard)}
      aria-label={I18N.carbonAgent.enterpriseCarbonComputationCardLabel}
      aria-disabled={!canOpen}
      data-disabled={!canOpen || undefined}
      role='button'
      tabIndex={canOpen ? 0 : -1}
      onClick={canOpen ? onOpen : undefined}
      onKeyDown={event => {
        if (!canOpen || event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={style.enterpriseBusinessCardNotice}>
        <span className={style.businessCardSuccessIcon} aria-hidden='true' />
        <span>{I18N.carbonAgent.enterpriseCarbonComputationReadyNotice}</span>
      </div>
      <div className={style.enterpriseBusinessCardPanel}>
        <strong className={style.enterpriseBusinessCardTitle}>
          {title || I18N.enterpriseCarbonAccount2.carbonEmissionAccounting}
        </strong>
        <div
          className={classNames(
            style.enterpriseBusinessCardDescription,
            style.enterpriseBusinessCardMeta,
          )}
        >
          <span>
            {I18N.template(
              I18N.carbonAgent.enterpriseCarbonAccountingPeriodDisplay,
              {
                val1:
                  getOptionalScalarString(
                    enterpriseCarbonSummary.timeTypeLabel,
                  ) || '-',
              },
            )}
          </span>
          <span>
            {I18N.template(
              I18N.carbonAgent.enterpriseCarbonAccountingStandardDisplay,
              {
                val1:
                  getOptionalScalarString(
                    enterpriseCarbonSummary.categoryTypeLabel,
                  ) || '-',
              },
            )}
          </span>
        </div>
        <p className={style.enterpriseBusinessCardDescription}>
          {I18N.template(
            I18N.carbonAgent.enterpriseCarbonAccountingScopeDisplay,
            {
              val1: accountingScope || '-',
            },
          )}
        </p>
      </div>
      <EnterpriseCarbonReviewCertificationActions
        context={{
          agentSessionId: sessionId,
          enterpriseCarbonBizId,
          enterpriseCarbonBizType: 'account',
          messageId,
          orgId,
          projectId,
          snapshot: {
            accountingPeriod: getOptionalScalarString(
              enterpriseCarbonSummary.timeTypeLabel,
            ),
            accountingScope,
            accountingStandard: getOptionalScalarString(
              enterpriseCarbonSummary.categoryTypeLabel,
            ),
            emissionUnit:
              getOptionalScalarString(enterpriseCarbonSummary.emissionUnit) ||
              getOptionalScalarString(enterpriseCarbonSummary.unit),
            title:
              title || I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
            totalEmission:
              getOptionalScalarString(enterpriseCarbonSummary.totalEmission) ||
              getOptionalScalarString(enterpriseCarbonSummary.emissionTotal),
            updateTime:
              getOptionalScalarString(enterpriseCarbonSummary.updateTime) ||
              getOptionalScalarString(enterpriseCarbonSummary.updatedAt),
          },
          year,
        }}
        interactionDisabled={interactionDisabled}
        showThirdPartyCertification={showThirdPartyCertification}
        onOpenCertification={onOpenCertification}
        onOpenExpertReview={onOpenExpertReview}
      />
    </div>
  );
};

export default EnterpriseCarbonComputationCard;
