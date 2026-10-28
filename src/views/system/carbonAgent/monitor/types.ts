/** 监测 v1.1 使用服务端字符串 ID；不将 Long 转为 JS Number。 */
export type MonitorPage = {
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore: boolean;
  nextPageNum?: number;
};
export type MonitorPlan = {
  planId: string;
  planName?: string;
  year?: number;
  versionNo?: string;
  status?: number;
  dataVersion?: number;
};
export type MonitorStep = {
  moduleCode: string;
  extractionResultId: string;
  idempotencyKey: string;
  state: string;
};
export type MonitorSource = {
  sourceId: string;
  sourceType: string;
  name: string;
  coverage?: string;
  unprocessed?: string;
  processingStatus?: string;
};
export type MonitorBatch = {
  batchId: string;
  status: string;
  detail?: string;
  sources: MonitorSource[];
};
export type MonitorIntake = {
  intakeId: string;
  planId?: string;
  year?: number;
  materialStatus: string;
  bindingStatus: string;
  applyStatus: string;
  pendingModules?: string[];
  failedModules?: string[];
  needsInputModules?: string[];
  succeededStepCount: number;
  pendingStepCount: number;
  steps: MonitorStep[];
  stepPage: MonitorPage;
  batches?: MonitorBatch[];
  batchPage?: MonitorPage;
};
export type MonitorSession = {
  activeMonitorPlanId?: string;
  activeIntakeId?: string;
  monitorPlans: MonitorPlan[];
  monitorIntakes: MonitorIntake[];
  monitorPlanPage: MonitorPage;
  monitorIntakePage: MonitorPage;
};
export type MonitorGap = {
  sectionCode: string;
  fieldPath: string;
  itemKey?: string;
  name: string;
  meaning?: string;
  applicabilityDescription?: string;
  suggestedMaterials?: string[];
  blocking: boolean;
  explanationStatus: string;
};
/** 业务缺口由同一保存快照整理；一个字段可以影响多组进度，但只展示一次。 */
export type MonitorGapGroup = {
  code: string;
  title: string;
  meaning?: string;
  suggestedMaterials?: string[];
  items: MonitorGap[];
};
export type MonitorCardData = {
  cardId?: string;
  cardType?: string;
  title?: string;
  summary?: string;
  introduction?: string;
  planId?: string;
  intakeId?: string;
  year?: number;
  dataVersion?: number;
  lang?: string;
  templateVersion?: string;
  groups?: {
    title: string;
    description?: string;
    note?: string;
    rows: { name: string; materials: string }[];
  }[];
  uploadText?: string;
  conversationText?: string;
  replyTemplate?: string;
  questionText?: string;
  examples?: string[];
  receivedMaterials?: MonitorSource[];
  completion?: {
    completionRate: number;
    completedCount: number;
    totalCount: number;
    groupStats?: {
      sectionCode: string;
      completed: boolean;
      requiredCount: number;
      filledRequiredCount: number;
    }[];
  };
  gaps?: MonitorGap[];
  gapGroups?: MonitorGapGroup[];
  guidanceVersion?: string;
};
export type MonitorResult = {
  /** 历史接口已完成快照组装；失败时也置 true，前端不能再逐卡补查。 */
  cardResolved?: boolean;
  cardResolveError?: string;
  resolvedCard?: MonitorCardData;
  cardType?: string;
  planId?: string;
  intakeId?: string;
  planName?: string;
  year?: number;
  dataVersion?: number;
  saved?: boolean;
  changed?: boolean;
  created?: boolean;
  saveType?: string;
  hostOperation?: string;
  cardId?: string;
  display?: { cardId?: string; cardType?: string };
  summary?: string;
  fileId?: string;
  fileName?: string;
  fileStatus?: string;
  sourceDataVersion?: number;
  language?: string;
};
