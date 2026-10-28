/**
 * @file 企业碳专家复核 prepare 业务数据读取及成功响应误判兼容。
 * 原始请求仍由 service.ts 定义，本文件只将 prepare 响应转换为企业业务数据。
 */
import { prepareEnterpriseCarbonExpertReview } from './service';
import type {
  EnterpriseCarbonExpertReviewPrepareInfo,
  EnterpriseCarbonExpertReviewPrepareParams,
  EnterpriseCarbonExpertReviewRequestOptions,
  EnterpriseCarbonExpertReviewResponse,
} from './types';

type RejectedEnterpriseCarbonExpertReviewResponse<T> = {
  data?: EnterpriseCarbonExpertReviewResponse<T>;
};

const getRejectedEnterpriseCarbonExpertReviewSuccessData = <T>(
  error: unknown,
) => {
  const responseData = (
    error as RejectedEnterpriseCarbonExpertReviewResponse<T>
  )?.data;
  const responseCode = Number(responseData?.code);

  if (responseCode === 1 || responseCode === 200) {
    return responseData;
  }

  return undefined;
};

/**
 * 与产品碳 prepare 一致：正常响应直接取 data；
 * 请求层误将 code=1/200 的有效业务响应判为失败时，继续使用其中的业务数据。
 */
export const fetchEnterpriseCarbonExpertReviewPrepareInfo = async (
  params: EnterpriseCarbonExpertReviewPrepareParams,
  signal?: AbortSignal,
  options?: EnterpriseCarbonExpertReviewRequestOptions,
): Promise<EnterpriseCarbonExpertReviewPrepareInfo | null> => {
  try {
    const response = await prepareEnterpriseCarbonExpertReview(
      params,
      signal,
      options,
    );

    return response.data.data || null;
  } catch (error) {
    const responseData =
      getRejectedEnterpriseCarbonExpertReviewSuccessData<EnterpriseCarbonExpertReviewPrepareInfo | null>(
        error,
      );

    if (responseData) {
      return responseData.data || null;
    }

    throw error;
  }
};
