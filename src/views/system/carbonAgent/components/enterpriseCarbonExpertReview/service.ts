/**
 * @file 企业碳 Agent 专家复核四个接口的独立请求定义。
 * 本文件只声明请求地址、方法、入参和返回类型，不处理接口返回数据。
 */
import { request } from '@api/request';

import type {
  EnterpriseCarbonExpertReviewApplyParams,
  EnterpriseCarbonExpertReviewApplyResponse,
  EnterpriseCarbonExpertReviewListParams,
  EnterpriseCarbonExpertReviewListResponse,
  EnterpriseCarbonExpertReviewPrepareParams,
  EnterpriseCarbonExpertReviewPrepareResponse,
  EnterpriseCarbonExpertReviewRequestOptions,
  EnterpriseCarbonExpertReviewStatusParams,
  EnterpriseCarbonExpertReviewStatusResponse,
} from './types';

/** 查询当前企业年度及复核对象的最新复核状态。 */
export const fetchEnterpriseCarbonExpertReviewStatus = (
  params: EnterpriseCarbonExpertReviewStatusParams,
  signal?: AbortSignal,
  options?: EnterpriseCarbonExpertReviewRequestOptions,
) =>
  request<EnterpriseCarbonExpertReviewStatusResponse>({
    method: 'GET',
    params,
    signal,
    silentResponseError: options?.silentResponseError,
    url: '/ai/agent/expert-review/status',
  });

/** 查询当前企业年度及复核对象的全部复核记录。 */
export const fetchEnterpriseCarbonExpertReviewList = (
  params: EnterpriseCarbonExpertReviewListParams,
  signal?: AbortSignal,
  options?: EnterpriseCarbonExpertReviewRequestOptions,
) =>
  request<EnterpriseCarbonExpertReviewListResponse>({
    method: 'GET',
    params,
    signal,
    silentResponseError: options?.silentResponseError,
    url: '/ai/agent/expert-review/list',
  });

/** 获取当前企业年度及复核对象的申请准备信息。 */
export const prepareEnterpriseCarbonExpertReview = (
  data: EnterpriseCarbonExpertReviewPrepareParams,
  signal?: AbortSignal,
  options?: EnterpriseCarbonExpertReviewRequestOptions,
) =>
  request<EnterpriseCarbonExpertReviewPrepareResponse>({
    data,
    method: 'POST',
    signal,
    silentResponseError: options?.silentResponseError,
    url: '/ai/agent/expert-review/prepare',
  });

/** 提交当前企业年度的专家复核申请。 */
export const applyEnterpriseCarbonExpertReview = (
  data: EnterpriseCarbonExpertReviewApplyParams,
  signal?: AbortSignal,
) =>
  request<EnterpriseCarbonExpertReviewApplyResponse>({
    data,
    method: 'POST',
    signal,
    silentResponseError: true,
    url: '/ai/agent/expert-review/apply',
  });
