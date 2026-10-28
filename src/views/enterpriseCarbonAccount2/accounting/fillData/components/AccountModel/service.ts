import { request } from '@/api/request';

import { ListModel, ModelDetails } from './type';

export const getModelList = (params: {
  name: string;
  type: number;
  pageNum: number;
  pageSize: number;
  orgId: string;
  computationId: string;
  computationPeriod?: string;
}) =>
  request<{ rows: ListModel[]; total: number }>({
    url: '/enterprise/model/v2/recommend/list',
    params,
  });

export const getModelDetails = (
  params: Pick<ListModel, 'modelId' | 'modelType' | 'period'>,
) =>
  request<{ data: ModelDetails }>({
    url: '/enterprise/model/v2/preview/source/list',
    params,
  });

export const getApplySetting = (params: {
  computationId: string;
  period?: string;
  modelType?: number;
}) =>
  request<{
    data: {
      clearCurrentData: boolean;
      copyActivityData: boolean;
      copyAppointData: boolean;
    };
  }>({
    url: '/enterprise/model/v2/pop/use/model',
    params,
  });

export const postApplyModel = data =>
  request({
    method: 'post',
    url: '/enterprise/model/v2/use/model',
    data,
  });
