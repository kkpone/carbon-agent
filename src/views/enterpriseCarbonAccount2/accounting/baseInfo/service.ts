import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

interface ModelListElement {
  business: null | string;
  categoryType: number;
  companyId: number | null;
  companyName: null;
  companyNumber: null;
  customization: number | null;
  deleted: number;
  description: null | string;
  gwp: string;
  modelId: number;
  modelType: number;
  name: string;
  quantization: string;
}

// 核算详情
export interface DataComputationBackData {
  id: number;
  computationId: number;
  companyId: number;
  supplierDataId: number;
  name: string;
  period: string;
  totalQuantity: number;
  quantization: string;
  gwp: string;
  categoryType: number;
  deleted: number;
  timeType: number;
  cyear: number;
  cquarter: number;
  cmonth: number;
  begTime: string;
  endTime: string;
  modelId: number;
  modelType: number;
  computationStatus: number;
  computationType: number;
  modelInfo: ModelListElement;
  orgId: number;
  orgName: string;
  aiStatus: number;
  finishCount: number;
  totalCount: number;
  emission: number;
  emissionScopeOne: number;
  emissionScopeTwo: number;
  emissionScopeThree: number;
  scopeOneRate: number;
  scopeTwoRate: number;
  scopeThreeRate: number;
}

/**
 * 核算详情
 */
export function apiComputationInfo(params: {
  computationId: string | number;
  computationPeriod?: string;
}) {
  return request<AxiosResponse<DataComputationBackData>>({
    method: 'GET',
    url: `/enterprise/computation`,
    params,
  });
}
