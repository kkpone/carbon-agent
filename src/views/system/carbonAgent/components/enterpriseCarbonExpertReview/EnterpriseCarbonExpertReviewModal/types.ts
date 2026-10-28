/**
 * @file 企业碳专家复核申请弹窗的属性类型。
 */
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewPrepareInfo,
} from '../types';

export type EnterpriseCarbonExpertReviewModalProps = {
  context?: EnterpriseCarbonExpertReviewContext;
  open: boolean;
  prepareInfo?: EnterpriseCarbonExpertReviewPrepareInfo | null;
  purpose: string;
  submitting: boolean;
  onCancel: () => void;
  onPurposeChange: (value: string) => void;
  onSubmit: () => void;
};
