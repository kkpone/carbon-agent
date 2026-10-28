/**
 * @file 企业碳专家复核顶部入口与两路自动恢复 Hook 的输入输出类型。
 */
import type {
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewPrepareInfo,
  EnterpriseCarbonExpertReviewTarget,
} from '../types';

export type EnterpriseCarbonExpertReviewOpenOptions = {
  focus?: boolean;
};

export type UseEnterpriseCarbonExpertReviewOptions = {
  autoRestoreEnabled?: boolean;
  autoRestoreAccountContexts?: EnterpriseCarbonExpertReviewContext[];
  autoRestoreSourceContext?: EnterpriseCarbonExpertReviewContext;
  readonly?: boolean;
  onOpenDetail: (
    target: EnterpriseCarbonExpertReviewTarget,
    options?: EnterpriseCarbonExpertReviewOpenOptions,
  ) => void;
};

export type UseEnterpriseCarbonExpertReviewResult = {
  checking: boolean;
  close: () => void;
  context?: EnterpriseCarbonExpertReviewContext;
  modalOpen: boolean;
  open: (target: EnterpriseCarbonExpertReviewTarget) => Promise<void>;
  prepareInfo?: EnterpriseCarbonExpertReviewPrepareInfo | null;
  purpose: string;
  setPurpose: (value: string) => void;
  submit: () => Promise<void>;
  submitting: boolean;
};
