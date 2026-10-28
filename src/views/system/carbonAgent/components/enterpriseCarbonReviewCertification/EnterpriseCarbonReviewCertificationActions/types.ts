/**
 * @file 企业碳核算卡和报告卡复核、第三方认证操作区的属性类型。
 */
import type {
  EnterpriseCarbonCertificationContext,
  EnterpriseCarbonCertificationTarget,
} from '../../enterpriseCarbonCertification/types';
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewSnapshot,
  EnterpriseCarbonExpertReviewTarget,
} from '../../enterpriseCarbonExpertReview/types';

export type EnterpriseCarbonReviewCertificationActionsProps = {
  context: EnterpriseCarbonCertificationContext &
    Pick<
      EnterpriseCarbonExpertReviewContext,
      'messageId' | 'projectId' | 'reportId'
    > & {
      snapshot?: EnterpriseCarbonExpertReviewSnapshot;
    };
  interactionDisabled?: boolean;
  showExpertReview?: boolean;
  showThirdPartyCertification?: boolean;
  onOpenCertification?: (target: EnterpriseCarbonCertificationTarget) => void;
  onOpenExpertReview?: (target: EnterpriseCarbonExpertReviewTarget) => void;
};
