/**
 * @file 企业碳专家复核详情组件的属性类型。
 */
import type { EnterpriseCarbonExpertReviewDetail } from '../types';

export type EnterpriseCarbonExpertReviewDetailProps = {
  detail: EnterpriseCarbonExpertReviewDetail;
  onViewAccounting?: (detail: EnterpriseCarbonExpertReviewDetail) => void;
};
