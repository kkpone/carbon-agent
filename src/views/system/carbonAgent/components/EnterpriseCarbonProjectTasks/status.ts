import I18N from '@src/lang/I18N';

import type { EnterpriseCarbonTaskStatus } from './type';

export const ENTERPRISE_CARBON_TASK_STATUS_LABELS: Record<
  EnterpriseCarbonTaskStatus,
  string
> = {
  completed: I18N.carbonAgent.enterpriseTaskCompleted,
  pendingApproval: I18N.carbonAgent.enterpriseTaskPendingApproval,
  pendingReport: I18N.carbonAgent.enterpriseTaskPendingReport,
  rejected: I18N.carbonAgent.enterpriseTaskRejected,
};
