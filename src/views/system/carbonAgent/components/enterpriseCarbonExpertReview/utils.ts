/**
 * @file 企业碳 Agent 专家复核的状态转换、兜底详情和标签纯函数。
 */
import I18N from '@src/lang/I18N';

import {
  ENTERPRISE_CARBON_EXPERT_REVIEW_BUSINESS_TYPE,
  ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS,
} from './constants';
import type {
  EnterpriseCarbonExpertReviewApplyParams,
  EnterpriseCarbonExpertReviewApplyPayload,
  EnterpriseCarbonExpertReviewContext,
  EnterpriseCarbonExpertReviewDetail,
  EnterpriseCarbonExpertReviewDetailResponse,
  EnterpriseCarbonExpertReviewListParams,
  EnterpriseCarbonExpertReviewObjectType,
  EnterpriseCarbonExpertReviewPrepareInfo,
  EnterpriseCarbonExpertReviewPrepareParams,
  EnterpriseCarbonExpertReviewStatusParams,
  EnterpriseCarbonExpertReviewTarget,
} from './types';

export type EnterpriseCarbonExpertReviewPreviewSource = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetail;
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewDetail[];
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewContext['snapshot'];
  expertReviewId?: number | string | null;
  expertReviewNo?: string | null;
  expertReviewStatus?: string | null;
  expertReviewStatusName?: string | null;
  orgId?: string;
  reportId?: string;
  type?: string;
  year?: string;
};

export type EnterpriseCarbonExpertReviewPreviewTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewDetail;
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewDetail[];
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewContext['snapshot'];
  orgId?: string;
  reportId?: string;
  type: 'enterpriseCarbonExpertReview';
  year?: string;
};

const VALID_DETAIL_STATUS = new Set<string>(
  Object.values(ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS),
);

const VALID_OBJECT_TYPES = new Set<EnterpriseCarbonExpertReviewObjectType>([
  'account',
  'account_report',
  'report',
]);

const getOptionalScalarString = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

type EnterpriseCarbonExpertReviewRequestError = {
  data?: { msg?: unknown };
  response?: { data?: { msg?: unknown } };
};

/** 读取专家复核接口返回的错误文案，供手动操作避免重复提示。 */
export const getEnterpriseCarbonExpertReviewResponseErrorMessage = (
  error: unknown,
) => {
  if (!error || typeof error !== 'object') {
    return '';
  }

  const requestError = error as EnterpriseCarbonExpertReviewRequestError;
  let responseData = requestError.data;

  if (!responseData) {
    responseData = requestError.response?.data;
  }

  return getOptionalScalarString(responseData?.msg);
};

export const getEnterpriseCarbonExpertReviewYear = (
  context?: EnterpriseCarbonExpertReviewContext,
) => context?.year?.trim() || '';

export const getEnterpriseCarbonExpertReviewObjectType = (
  context?: EnterpriseCarbonExpertReviewContext,
): EnterpriseCarbonExpertReviewObjectType => {
  if (context?.enterpriseCarbonBizType === 'report') {
    return 'report';
  }

  return 'account';
};

const getOptionalNumber = (value?: number | string | null) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue;
};

/**
 * status 与 list 使用同一组企业查询字段。
 * 只有报告复核才携带 reportId，核算复核不发送该字段。
 */
const getEnterpriseCarbonExpertReviewQueryParams = (
  context: EnterpriseCarbonExpertReviewContext,
) => {
  const params: EnterpriseCarbonExpertReviewStatusParams = {
    businessType: ENTERPRISE_CARBON_EXPERT_REVIEW_BUSINESS_TYPE,
    year: getEnterpriseCarbonExpertReviewYear(context),
  };

  if (context.enterpriseCarbonBizType) {
    params.objectType = getEnterpriseCarbonExpertReviewObjectType(context);
  }

  if (context.enterpriseCarbonBizType === 'report') {
    const reportId = getOptionalNumber(context.reportId);

    if (reportId !== undefined) {
      params.reportId = reportId;
    }
  }

  return params;
};

export const createEnterpriseCarbonExpertReviewStatusParams = (
  context: EnterpriseCarbonExpertReviewContext,
): EnterpriseCarbonExpertReviewStatusParams =>
  getEnterpriseCarbonExpertReviewQueryParams(context);

export const createEnterpriseCarbonExpertReviewListParams = (
  context: EnterpriseCarbonExpertReviewContext,
): EnterpriseCarbonExpertReviewListParams =>
  getEnterpriseCarbonExpertReviewQueryParams(context);

/** prepare 始终明确当前是企业核算复核还是企业报告复核。 */
export const createEnterpriseCarbonExpertReviewPrepareParams = (
  context: EnterpriseCarbonExpertReviewContext,
): EnterpriseCarbonExpertReviewPrepareParams => {
  const params: EnterpriseCarbonExpertReviewPrepareParams = {
    businessType: ENTERPRISE_CARBON_EXPERT_REVIEW_BUSINESS_TYPE,
    objectType: getEnterpriseCarbonExpertReviewObjectType(context),
    year: getEnterpriseCarbonExpertReviewYear(context),
  };

  if (context.enterpriseCarbonBizType === 'report') {
    const reportId = getOptionalNumber(context.reportId);

    if (reportId !== undefined) {
      params.reportId = reportId;
    }
  }

  return params;
};

/** 将页面提交命令转换为企业 apply 接口的真实入参。 */
export const createEnterpriseCarbonExpertReviewApplyParams = (
  payload: EnterpriseCarbonExpertReviewApplyPayload,
): EnterpriseCarbonExpertReviewApplyParams => {
  const { context } = payload;
  let { objectType } = payload;

  if (!objectType) {
    objectType = getEnterpriseCarbonExpertReviewObjectType(context);
  }

  const params: EnterpriseCarbonExpertReviewApplyParams = {
    businessType: ENTERPRISE_CARBON_EXPERT_REVIEW_BUSINESS_TYPE,
    objectType,
    reviewFocus: payload.reviewFocus,
    reviewPurpose: payload.reviewPurpose,
    year: getEnterpriseCarbonExpertReviewYear(context),
  };

  if (context.messageId) {
    params.messageId = context.messageId;
  }

  const projectId = getOptionalNumber(context.projectId);

  if (projectId !== undefined) {
    params.projectId = projectId;
  }

  if (context.enterpriseCarbonBizType === 'report') {
    const reportId = getOptionalNumber(context.reportId);

    if (reportId !== undefined) {
      params.reportId = reportId;
    }
  }

  if (context.agentSessionId) {
    params.sessionId = context.agentSessionId;
  }

  return params;
};

/** list.data 缺失时按企业接口的空列表语义处理。 */
export const getEnterpriseCarbonExpertReviewListData = (
  data?: EnterpriseCarbonExpertReviewDetailResponse[] | null,
): EnterpriseCarbonExpertReviewDetail[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data;
};

export const getEnterpriseCarbonExpertReviewContextKey = (
  context?: EnterpriseCarbonExpertReviewContext,
) => {
  const year = getEnterpriseCarbonExpertReviewYear(context);

  if (!year) {
    return '';
  }

  return [
    context?.agentSessionId,
    year,
    context?.enterpriseCarbonBizType,
    context?.reportId,
  ]
    .filter(Boolean)
    .join(':');
};

export const isEnterpriseCarbonExpertReviewRequestCancelled = (
  error: unknown,
  signal?: AbortSignal,
) => {
  if (signal?.aborted) {
    return true;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const requestError = error as { code?: string; name?: string };

  return (
    requestError.code === 'ERR_CANCELED' ||
    requestError.name === 'CanceledError'
  );
};

export const canOpenEnterpriseCarbonExpertReviewDetail = (
  detail?: { status?: string | null } | null,
) => {
  const status = detail?.status?.trim().toLowerCase();

  if (!status) {
    return false;
  }

  return VALID_DETAIL_STATUS.has(status);
};

export const getEnterpriseCarbonExpertReviewFallbackDetail = (
  source?: EnterpriseCarbonExpertReviewPreviewSource,
): EnterpriseCarbonExpertReviewDetail | undefined => {
  const reviewId = getOptionalScalarString(source?.expertReviewId);
  const reviewNo = getOptionalScalarString(source?.expertReviewNo);
  const status = getOptionalScalarString(source?.expertReviewStatus);
  const statusName = getOptionalScalarString(source?.expertReviewStatusName);

  if (!reviewId && !reviewNo && !status && !statusName) {
    return undefined;
  }

  let objectType: EnterpriseCarbonExpertReviewObjectType = 'account';

  if (
    source?.type === 'enterpriseCarbonReport' ||
    source?.enterpriseCarbonBizType === 'report'
  ) {
    objectType = 'report';
  }

  const detail: EnterpriseCarbonExpertReviewDetail = {
    enterpriseCarbonBizId:
      getOptionalScalarString(source?.enterpriseCarbonBizId) || undefined,
    enterpriseCarbonBizType: source?.enterpriseCarbonBizType,
    objectType,
    orgId: getOptionalScalarString(source?.orgId) || undefined,
    reportId: getOptionalScalarString(source?.reportId) || undefined,
    reviewId: reviewId || undefined,
    reviewNo: reviewNo || undefined,
    snapshot: source?.enterpriseCarbonSnapshot,
    status: status || undefined,
    statusName: statusName || undefined,
    year: getOptionalScalarString(source?.year) || undefined,
  };

  if (
    !reviewId &&
    !reviewNo &&
    !canOpenEnterpriseCarbonExpertReviewDetail(detail)
  ) {
    return undefined;
  }

  return detail;
};

export const getEnterpriseCarbonExpertReviewOnlyTarget = (
  source: EnterpriseCarbonExpertReviewPreviewSource,
): EnterpriseCarbonExpertReviewPreviewTarget | undefined => {
  let details = source.enterpriseCarbonExpertReviewDetails;

  if (!details?.length && source.enterpriseCarbonExpertReviewDetail) {
    details = [source.enterpriseCarbonExpertReviewDetail];
  }

  if (!details?.length) {
    const fallbackDetail =
      getEnterpriseCarbonExpertReviewFallbackDetail(source);

    if (fallbackDetail) {
      details = [fallbackDetail];
    }
  }

  if (!details?.length) {
    return undefined;
  }

  return {
    enterpriseCarbonBizId: source.enterpriseCarbonBizId,
    enterpriseCarbonBizType: source.enterpriseCarbonBizType,
    enterpriseCarbonExpertReviewDetail: details[0],
    enterpriseCarbonExpertReviewDetails: details,
    enterpriseCarbonSnapshot: source.enterpriseCarbonSnapshot,
    orgId: source.orgId,
    reportId: source.reportId,
    type: 'enterpriseCarbonExpertReview',
    year: source.year,
  };
};

export const getEnterpriseCarbonExpertReviewButtonLabel = (
  detail?: EnterpriseCarbonExpertReviewDetail | null,
) => {
  if (!canOpenEnterpriseCarbonExpertReviewDetail(detail)) {
    return I18N.carbonAgent.expertReview;
  }

  if (detail?.statusName?.trim()) {
    return detail.statusName.trim();
  }

  const status = detail?.status?.trim().toLowerCase();

  if (status === ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS.COMPLETED) {
    return I18N.carbonAgent.expertReviewStatusCompleted;
  }

  if (status === ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS.REVIEWING) {
    return I18N.carbonAgent.expertReviewStatusReviewing;
  }

  return I18N.carbonAgent.expertReviewStatusPending;
};

export const getPreparedEnterpriseCarbonExpertReviewObjectType = (
  prepareInfo: EnterpriseCarbonExpertReviewPrepareInfo | null | undefined,
  fallbackObjectType: EnterpriseCarbonExpertReviewObjectType,
) => {
  const objectType = prepareInfo?.objectType;

  if (
    objectType &&
    VALID_OBJECT_TYPES.has(objectType as EnterpriseCarbonExpertReviewObjectType)
  ) {
    return objectType as EnterpriseCarbonExpertReviewObjectType;
  }

  return fallbackObjectType;
};

/**
 * prepare.data.status 是状态摘要，不是详情接口结构。
 * 这里只按企业接口字段生成卡片按钮所需的企业复核详情。
 */
export const getEnterpriseCarbonExpertReviewPrepareDetail = (
  prepareInfo: EnterpriseCarbonExpertReviewPrepareInfo | null | undefined,
  context: EnterpriseCarbonExpertReviewContext,
): EnterpriseCarbonExpertReviewDetail | null => {
  const reviewStatus = prepareInfo?.status?.reviewStatus;

  if (!reviewStatus || reviewStatus === 'not_submitted') {
    return null;
  }

  const fallbackObjectType = getEnterpriseCarbonExpertReviewObjectType(context);
  const detailObjectType = getPreparedEnterpriseCarbonExpertReviewObjectType(
    prepareInfo,
    fallbackObjectType,
  );

  return {
    accountName: prepareInfo?.accountName,
    accountScope: prepareInfo?.accountScope,
    businessType:
      prepareInfo?.status?.businessType || prepareInfo?.businessType,
    completeTime: prepareInfo?.status?.reviewCompleteTime,
    computationIds:
      prepareInfo?.status?.computationIds || prepareInfo?.computationIds,
    createTime: prepareInfo?.status?.reviewCreateTime,
    emissionUnit: prepareInfo?.emissionUnit,
    enterpriseCarbonBizId: context.enterpriseCarbonBizId,
    enterpriseCarbonBizType: context.enterpriseCarbonBizType,
    functionalUnit: prepareInfo?.functionalUnit,
    objectType: detailObjectType,
    orgId: getOptionalScalarString(prepareInfo?.orgId) || context.orgId,
    periodName: prepareInfo?.periodName,
    pointCost: prepareInfo?.pointCost,
    productName: prepareInfo?.productName,
    reportId: prepareInfo?.status?.reportId || prepareInfo?.reportId,
    reviewId: prepareInfo?.status?.reviewId,
    reviewNo: prepareInfo?.status?.reviewNo,
    snapshot: context.snapshot,
    standardName: prepareInfo?.standardName,
    status: reviewStatus,
    statusName: prepareInfo?.status?.reviewStatusName,
    totalEmission: prepareInfo?.totalEmission,
    year:
      prepareInfo?.status?.year ||
      prepareInfo?.year ||
      getEnterpriseCarbonExpertReviewYear(context),
  };
};

/**
 * apply 已成功但 list 暂无记录时，按当前企业 prepare 数据保持待复核页面。
 * 该兜底属于申请后的页面流程，不改变任何接口返回值。
 */
export const createSubmittedEnterpriseCarbonExpertReviewDetail = (
  context: EnterpriseCarbonExpertReviewContext,
  prepareInfo: EnterpriseCarbonExpertReviewPrepareInfo | null | undefined,
  objectType: EnterpriseCarbonExpertReviewObjectType,
): EnterpriseCarbonExpertReviewDetail => ({
  accountName: prepareInfo?.accountName,
  accountScope: prepareInfo?.accountScope,
  businessType: prepareInfo?.businessType,
  computationIds: prepareInfo?.computationIds,
  emissionUnit: prepareInfo?.emissionUnit,
  enterpriseCarbonBizId: context.enterpriseCarbonBizId,
  enterpriseCarbonBizType: context.enterpriseCarbonBizType,
  functionalUnit: prepareInfo?.functionalUnit,
  objectType,
  orgId: getOptionalScalarString(prepareInfo?.orgId) || context.orgId,
  periodName: prepareInfo?.periodName,
  pointCost: prepareInfo?.pointCost,
  productName: prepareInfo?.productName,
  reportId:
    prepareInfo?.status?.reportId || prepareInfo?.reportId || context.reportId,
  snapshot: context.snapshot,
  standardName: prepareInfo?.standardName,
  status: ENTERPRISE_CARBON_EXPERT_REVIEW_STATUS.PENDING_REVIEW,
  statusName: I18N.carbonAgent.expertReviewStatusPending,
  totalEmission: prepareInfo?.totalEmission,
  year: prepareInfo?.year || getEnterpriseCarbonExpertReviewYear(context),
});

/**
 * 将接口详情放入企业预览目标，并补充详情接口未返回的当前卡片来源。
 * 接口原字段保持不变，不生成产品碳字段或企业字段别名。
 */
export const createEnterpriseCarbonExpertReviewTarget = (
  context: EnterpriseCarbonExpertReviewContext,
  details: EnterpriseCarbonExpertReviewDetail[],
): EnterpriseCarbonExpertReviewTarget => {
  const detailsWithContext = details.map(detail => {
    const detailWithContext = { ...detail };

    if (!detailWithContext.enterpriseCarbonBizId) {
      detailWithContext.enterpriseCarbonBizId = context.enterpriseCarbonBizId;
    }

    if (!detailWithContext.enterpriseCarbonBizType) {
      detailWithContext.enterpriseCarbonBizType =
        context.enterpriseCarbonBizType;
    }

    if (!detailWithContext.orgId) {
      detailWithContext.orgId = context.orgId;
    }

    if (!detailWithContext.reportId) {
      detailWithContext.reportId = context.reportId;
    }

    if (!detailWithContext.snapshot) {
      detailWithContext.snapshot = context.snapshot;
    }

    if (!detailWithContext.year) {
      detailWithContext.year = context.year;
    }

    return detailWithContext;
  });

  return {
    ...context,
    reviewDetail: detailsWithContext[0],
    reviewDetails: detailsWithContext,
    type: 'enterpriseCarbonExpertReview',
  };
};

export const getValidEnterpriseCarbonExpertReviewDetails = (
  details: EnterpriseCarbonExpertReviewDetail[],
) => details.filter(canOpenEnterpriseCarbonExpertReviewDetail);

export const getEnterpriseCarbonExpertReviewIdentity = (
  detail: EnterpriseCarbonExpertReviewDetail,
  index: number,
) => {
  if (detail.reviewId) {
    return String(detail.reviewId);
  }

  if (detail.reviewNo) {
    return detail.reviewNo;
  }

  const fallbackIdentity = [
    detail.year,
    detail.snapAccountId,
    detail.reportId,
    detail.status,
    detail.statusName,
  ]
    .filter(Boolean)
    .join(':');

  if (fallbackIdentity) {
    return fallbackIdentity;
  }

  return String(index);
};

export const getEnterpriseCarbonExpertReviewTabTitle = (
  detail: EnterpriseCarbonExpertReviewDetail,
  index: number,
) => {
  if (detail.reviewNo) {
    return detail.reviewNo;
  }

  if (detail.statusName) {
    return detail.statusName;
  }

  return `${I18N.carbonAgent.expertReview}${index + 1}`;
};

export const getEnterpriseCarbonExpertReviewTabLabel = (
  detail: EnterpriseCarbonExpertReviewDetail,
  index: number,
) => {
  if (detail.statusName) {
    return detail.statusName;
  }

  if (detail.reviewNo) {
    return detail.reviewNo;
  }

  return `${I18N.carbonAgent.expertReview}${index + 1}`;
};
