/**
 * @file 企业碳专家复核 list 业务数据读取及成功响应误判兼容。
 * 原始请求仍由 service.ts 定义，本文件统一返回企业复核记录数组。
 */
import { fetchEnterpriseCarbonExpertReviewList } from './service';
import type {
  EnterpriseCarbonExpertReviewDetail,
  EnterpriseCarbonExpertReviewDetailResponse,
  EnterpriseCarbonExpertReviewListParams,
  EnterpriseCarbonExpertReviewRequestOptions,
  EnterpriseCarbonExpertReviewResponse,
} from './types';
import { getEnterpriseCarbonExpertReviewListData } from './utils';

type RejectedEnterpriseCarbonExpertReviewListResponse = {
  data?: EnterpriseCarbonExpertReviewResponse<
    EnterpriseCarbonExpertReviewDetailResponse[]
  >;
};

const getRejectedEnterpriseCarbonExpertReviewListSuccessData = (
  error: unknown,
) => {
  const responseData = (
    error as RejectedEnterpriseCarbonExpertReviewListResponse
  )?.data;
  const responseCode = Number(responseData?.code);

  if (responseCode === 1 || responseCode === 200) {
    return responseData;
  }

  return undefined;
};

/**
 * 与产品碳 list 一致：正常响应直接返回记录数组；
 * 请求层误将 code=1/200 的有效业务响应判为失败时，继续使用其中的记录。
 */
export const fetchEnterpriseCarbonExpertReviewDetails = async (
  params: EnterpriseCarbonExpertReviewListParams,
  signal?: AbortSignal,
  options?: EnterpriseCarbonExpertReviewRequestOptions,
): Promise<EnterpriseCarbonExpertReviewDetail[]> => {
  try {
    const response = await fetchEnterpriseCarbonExpertReviewList(
      params,
      signal,
      options,
    );

    return getEnterpriseCarbonExpertReviewListData(response.data.data);
  } catch (error) {
    const responseData =
      getRejectedEnterpriseCarbonExpertReviewListSuccessData(error);

    if (responseData) {
      return getEnterpriseCarbonExpertReviewListData(responseData.data);
    }

    throw error;
  }
};
