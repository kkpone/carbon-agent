import { request } from '@/api/request';

import type { EnterpriseCarbonTaskAvailabilities } from '../EnterpriseCarbonProjectTasks/type';

export type EnterpriseSourceTreeSource = {
  activityData?: number | string | null;
  activityUnit?: string;
  appointName?: string;
  emissionQuantity?: string | number | null;
  facility?: string;
  id: number | string;
  name: string;
  /** 因子匹配方式，核算引用表示产品碳来源 */
  fdType?: number | string | null;
  supportImg?: {
    name: string;
    supportImgId: number | string;
    url: string;
  }[];
  taskAvailabilities?: EnterpriseCarbonTaskAvailabilities;
};

export type EnterpriseSourceTreeNode = {
  children?: EnterpriseSourceTreeNode[];
  code?: string | number | null;
  emissionQuantity?: string | number | null;
  finishCount?: number;
  name: string;
  nodeId?: string;
  nodeType?: 'ghgCategory' | 'ghgClassify' | string;
  parentCode?: string | number | null;
  rate?: string;
  sourceList?: EnterpriseSourceTreeSource[];
  totalCount?: number;
  unit?: string;
};

export type EnterpriseSourceTreeData = {
  computationId?: number | string;
  computationPeriod?: number | string | null;
  computationStatus?: number | string;
  emissionQuantity?: string | number | null;
  finishCount?: number;
  nodeList?: EnterpriseSourceTreeNode[];
  orgName?: string;
  timeType?: number;
  totalCount?: number;
  unit?: string;
  year?: number | string;
};

export const getEnterpriseSourceTree = async (params: {
  computationId?: string;
  computationPeriod?: string;
  ghgCategory?: string;
  isoCategory?: string;
  sessionId?: string;
  shareId?: string;
  unfilled?: string;
  versionType?: string;
}) => {
  const { data } = await request<{ data: EnterpriseSourceTreeData }>({
    method: 'GET',
    url: '/enterprise/source/tree',
    params,
  });

  return data.data;
};
