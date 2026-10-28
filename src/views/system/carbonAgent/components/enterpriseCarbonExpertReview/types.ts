/**
 * @file 企业碳 Agent 专家复核的独立接口契约、业务上下文和预览目标类型。
 * 企业接口类型不继承也不引用产品碳专家复核类型。
 */

export type EnterpriseCarbonExpertReviewBusinessType = 'account' | 'report';

export type EnterpriseCarbonExpertReviewObjectType =
  | 'account'
  | 'account_report'
  | 'report';

export type EnterpriseCarbonExpertReviewStatusCode =
  | 'completed'
  | 'pending_review'
  | 'reviewing';

export type EnterpriseCarbonExpertReviewFocusKey =
  | 'activity_data'
  | 'emission_completeness'
  | 'factor_match'
  | 'model_boundary'
  | 'report_expression';

/**
 * 企业卡片已有的核算展示数据。
 * 该结构属于企业页面上下文，不属于四个专家复核接口的返回结构。
 */
export type EnterpriseCarbonExpertReviewSnapshot = {
  accountingPeriod?: string;
  accountingScope?: string;
  accountingStandard?: string;
  emissionUnit?: string;
  title?: string;
  totalEmission?: number | string | null;
  updateTime?: string;
  version?: string;
};

/** 企业卡片、顶部入口和自动恢复共同使用的业务上下文。 */
export type EnterpriseCarbonExpertReviewContext = {
  agentSessionId?: string;
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: EnterpriseCarbonExpertReviewBusinessType;
  messageId?: string;
  orgId?: string;
  projectId?: string;
  reportId?: string;
  snapshot?: EnterpriseCarbonExpertReviewSnapshot;
  year?: string;
};

/** GET /ai/agent/expert-review/status */
export type EnterpriseCarbonExpertReviewStatusParams = {
  businessType: 'enterprise';
  objectType?: EnterpriseCarbonExpertReviewObjectType;
  reportId?: number;
  year: string;
};

/** GET /ai/agent/expert-review/list */
export type EnterpriseCarbonExpertReviewListParams = {
  businessType: 'enterprise';
  objectType?: EnterpriseCarbonExpertReviewObjectType;
  reportId?: number;
  year: string;
};

/** POST /ai/agent/expert-review/prepare */
export type EnterpriseCarbonExpertReviewPrepareParams = {
  businessType: 'enterprise';
  objectType: EnterpriseCarbonExpertReviewObjectType;
  reportId?: number;
  year: string;
};

/** POST /ai/agent/expert-review/apply */
export type EnterpriseCarbonExpertReviewApplyParams = {
  businessType: 'enterprise';
  fileIds?: string[];
  messageId?: string;
  objectType: EnterpriseCarbonExpertReviewObjectType;
  projectId?: number;
  reportId?: number;
  reviewFocus: EnterpriseCarbonExpertReviewFocusKey[];
  reviewPurpose: string;
  sessionId?: string;
  year: string;
};

/** 企业专家复核单次请求的展示选项。 */
export type EnterpriseCarbonExpertReviewRequestOptions = {
  silentResponseError?: boolean;
};

/** 企业专家复核接口统一响应包装。 */
export type EnterpriseCarbonExpertReviewResponse<T> = {
  code?: number;
  data?: T;
  lang?: string | null;
  msg?: string;
};

/** prepare.data.status 的企业接口原始结构。 */
export type EnterpriseCarbonExpertReviewPrepareStatus = {
  accountId?: number | null;
  businessType?: string | null;
  certificationStatus?: string | null;
  certificationStatusName?: string | null;
  computationIds?: number[] | null;
  hasExpertFeedback?: boolean | null;
  objectType?: string | null;
  reportId?: number | null;
  reviewCompleteTime?: string | null;
  reviewCreateTime?: string | null;
  reviewId?: number | null;
  reviewNo?: string | null;
  reviewStatus?: string | null;
  reviewStatusName?: string | null;
  year?: string | null;
};

/** prepare.data 的企业接口原始结构。 */
export type EnterpriseCarbonExpertReviewPrepareInfo = {
  accountId?: number | null;
  accountName?: string | null;
  accountScope?: string | null;
  businessType?: string | null;
  canApply?: boolean | null;
  computationIds?: number[] | null;
  disabledReason?: string | null;
  emissionUnit?: string | null;
  functionalUnit?: string | null;
  modelUpdateTime?: string | null;
  objectType?: string | null;
  orgId?: number | null;
  periodName?: string | null;
  pointCost?: number | null;
  productName?: string | null;
  reportId?: number | null;
  standardName?: string | null;
  status?: EnterpriseCarbonExpertReviewPrepareStatus | null;
  totalEmission?: string | null;
  year?: string | null;
};

export type EnterpriseCarbonExpertReviewIssue = {
  issue?: string | null;
  moduleName?: string | null;
  severity?: string | null;
  severityName?: string | null;
  suggestion?: string | null;
};

export type EnterpriseCarbonExpertReviewFile = {
  downloadUrl?: string | null;
  expiresAt?: string | null;
  fileId?: string | null;
  filename?: string | null;
  mime?: string | null;
  size?: number | null;
};

export type EnterpriseCarbonExpertReviewLog = {
  actionCode?: string | null;
  actionName?: string | null;
  createTime?: string | null;
  operatorName?: string | null;
  remark?: string | null;
};

/** status、list、apply 的企业接口详情原始结构。 */
export type EnterpriseCarbonExpertReviewDetailResponse = {
  accountId?: number | null;
  accountName?: string | null;
  accountScope?: string | null;
  businessType?: string | null;
  companyName?: string | null;
  completeTime?: string | null;
  computationIds?: number[] | null;
  createTime?: string | null;
  emissionUnit?: string | null;
  expertOpinion?: string | null;
  files?: EnterpriseCarbonExpertReviewFile[];
  functionalUnit?: string | null;
  internalRemark?: string | null;
  issues?: EnterpriseCarbonExpertReviewIssue[];
  logs?: EnterpriseCarbonExpertReviewLog[];
  objectType?: string | null;
  orgId?: number | null;
  periodName?: string | null;
  pointCost?: number | null;
  productName?: string | null;
  reportFileName?: string | null;
  reportId?: number | null;
  reportUrl?: string | null;
  reviewFocus?: string[];
  reviewId?: number | null;
  reviewNo?: string | null;
  reviewPurpose?: string | null;
  snapAccountId?: number | null;
  snapCode?: string | null;
  snapReportId?: number | null;
  snapshotData?: Record<string, unknown> | null;
  standardName?: string | null;
  status?: string | null;
  statusName?: string | null;
  totalEmission?: string | null;
  userName?: string | null;
  year?: string | null;
};

/**
 * 企业页面使用的复核详情。
 * 接口详情保持原字段，页面仅补充当前企业卡片来源，不改写接口字段。
 */
export type EnterpriseCarbonExpertReviewDetail = Omit<
  EnterpriseCarbonExpertReviewDetailResponse,
  'computationIds' | 'orgId' | 'reportId' | 'reviewId' | 'snapAccountId'
> & {
  computationIds?: Array<number | string> | null;
  enterpriseCarbonBizId?: string | null;
  enterpriseCarbonBizType?: EnterpriseCarbonExpertReviewBusinessType | null;
  orgId?: number | string | null;
  reportId?: number | string | null;
  reviewId?: number | string | null;
  reviewObjectName?: string | null;
  snapAccountId?: number | string | null;
  snapshot?: EnterpriseCarbonExpertReviewSnapshot | null;
};

export type EnterpriseCarbonExpertReviewStatusResponse =
  EnterpriseCarbonExpertReviewResponse<EnterpriseCarbonExpertReviewDetailResponse | null>;

export type EnterpriseCarbonExpertReviewListResponse =
  EnterpriseCarbonExpertReviewResponse<
    EnterpriseCarbonExpertReviewDetailResponse[]
  >;

export type EnterpriseCarbonExpertReviewPrepareResponse =
  EnterpriseCarbonExpertReviewResponse<EnterpriseCarbonExpertReviewPrepareInfo | null>;

export type EnterpriseCarbonExpertReviewApplyResponse =
  EnterpriseCarbonExpertReviewResponse<EnterpriseCarbonExpertReviewDetailResponse | null>;

/**
 * 页面提交命令。
 * 业务层使用该结构生成企业 apply 接口的独立请求参数。
 */
export type EnterpriseCarbonExpertReviewApplyPayload = {
  context: EnterpriseCarbonExpertReviewContext;
  objectType?: EnterpriseCarbonExpertReviewObjectType;
  reviewFocus: EnterpriseCarbonExpertReviewFocusKey[];
  reviewPurpose: string;
};

export type EnterpriseCarbonExpertReviewTarget =
  EnterpriseCarbonExpertReviewContext & {
    reviewDetail?: EnterpriseCarbonExpertReviewDetail;
    reviewDetails?: EnterpriseCarbonExpertReviewDetail[];
    type: 'enterpriseCarbonExpertReview';
  };
