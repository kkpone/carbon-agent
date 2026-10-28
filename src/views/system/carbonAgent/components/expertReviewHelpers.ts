import I18N from '@src/lang/I18N';

import { AGENT_EXPERT_REVIEW_STATUS } from '../service';
import type {
  AgentExpertReviewFocusKey,
  AgentExpertReviewStatus,
} from '../service';

export const DEFAULT_EXPERT_REVIEW_FOCUS: AgentExpertReviewFocusKey[] = [
  'model_boundary',
  'emission_completeness',
];

const EXPERT_REVIEW_DETAIL_STATUS: ReadonlySet<string> = new Set([
  AGENT_EXPERT_REVIEW_STATUS.PENDING_REVIEW,
  AGENT_EXPERT_REVIEW_STATUS.REVIEWING,
  AGENT_EXPERT_REVIEW_STATUS.COMPLETED,
]);

export const canOpenExpertReviewDetail = (
  detail?: AgentExpertReviewStatus | null,
) => {
  if (!detail) {
    return false;
  }

  const status = (detail.status || '').trim().toLowerCase();

  return EXPERT_REVIEW_DETAIL_STATUS.has(status);
};

export const getExpertReviewButtonLabel = (
  detail?: AgentExpertReviewStatus | null,
) => {
  if (!canOpenExpertReviewDetail(detail)) {
    return I18N.carbonAgent.expertReview;
  }

  if (detail?.statusName?.trim()) {
    return detail.statusName.trim();
  }

  const status = (detail?.status || '').trim().toLowerCase();

  if (status === AGENT_EXPERT_REVIEW_STATUS.COMPLETED) {
    return I18N.carbonAgent.expertReviewStatusCompleted;
  }

  if (status === AGENT_EXPERT_REVIEW_STATUS.REVIEWING) {
    return I18N.carbonAgent.expertReviewStatusReviewing;
  }

  return I18N.carbonAgent.expertReviewStatusPending;
};
