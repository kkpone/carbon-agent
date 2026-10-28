/**
 * @file 企业碳 Agent 第三方认证列表服务，只按年度查询企业认证记录。
 */
import { request } from '@api/request';

import type {
  EnterpriseCarbonCertificationListParams,
  EnterpriseCarbonCertificationRecord,
} from './types';

export type EnterpriseCarbonCertificationList =
  EnterpriseCarbonCertificationRecord[];

type EnterpriseCarbonCertificationListData =
  | EnterpriseCarbonCertificationRecord[]
  | {
      data?: EnterpriseCarbonCertificationRecord[];
      list?: EnterpriseCarbonCertificationRecord[];
      records?: EnterpriseCarbonCertificationRecord[];
      rows?: EnterpriseCarbonCertificationRecord[];
      total?: number | string;
    };

type EnterpriseCarbonCertificationListResponse = {
  code: number;
  data?: EnterpriseCarbonCertificationListData;
  lang?: string | null;
  msg: string;
};

const getEnterpriseCarbonCertificationRows = (
  data?: EnterpriseCarbonCertificationListData,
): EnterpriseCarbonCertificationList => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.rows || data?.list || data?.records || data?.data || [];
};

export const fetchEnterpriseCarbonCertificationList = (
  params: EnterpriseCarbonCertificationListParams,
  signal?: AbortSignal,
) =>
  request<EnterpriseCarbonCertificationListResponse>({
    method: 'GET',
    params,
    signal,
    url: '/enterprise/calculate/agentCertificationList',
  }).then(response => getEnterpriseCarbonCertificationRows(response.data.data));
