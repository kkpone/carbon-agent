/**
 * @file 企业碳 Agent 专家复核的状态和固定交互常量。
 */
import type {
  EnterpriseCarbonExpertReviewFocusKey,
  EnterpriseCarbonExpertReviewStatusCode,
} from './types';

export const ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS = {
  COMPLETED: 'completed',
  PENDING_REVIEW: 'pending_review',
  REVIEWING: 'reviewing',
} as const satisfies Record<string, EnterpriseCarbonExpertReviewStatusCode>;

export const DEFAULT_ENTERPRISE_CARBON_EXPERT_REVIEW_FOCUS: EnterpriseCarbonExpertReviewFocusKey[] =
  ['model_boundary', 'emission_completeness', 'activity_data'];

export const MAX_ENTERPRISE_CARBON_EXPERT_REVIEW_PURPOSE_LENGTH = 300;

export const ENTERPRISE_CARBON_EXPERT_REVIEW_BUSINESS_TYPE = 'enterprise';
