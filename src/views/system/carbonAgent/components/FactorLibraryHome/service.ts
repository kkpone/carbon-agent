import { request } from '@api/request';

import type { FactorLibraryItem, FactorLibraryRecordsPage } from './types';

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export async function fetchPopularFactors(
  language: 'zh' | 'en',
  signal?: AbortSignal,
): Promise<FactorLibraryItem[]> {
  const response = await request<ApiResponse<FactorLibraryItem[]>>({
    method: 'GET',
    url: '/management/api/ccdb/v1/factor-records/popular',
    params: { language },
    signal,
  });
  if (response.data.code !== 200) throw new Error(response.data.msg);
  return response.data.data;
}

export async function fetchRecentFactors(
  pageNum: number,
  signal?: AbortSignal,
): Promise<FactorLibraryRecordsPage> {
  const response = await request<ApiResponse<FactorLibraryRecordsPage>>({
    method: 'GET',
    url: '/management/api/ccdb/v1/factor-records',
    params: { pageNum, pageSize: 12 },
    signal,
  });
  if (response.data.code !== 200) throw new Error(response.data.msg);
  return response.data.data;
}
