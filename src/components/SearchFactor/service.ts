import { request } from '@src/api/request';
import { withShareEditSnapFlag } from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import { GetLocalStorageProductId } from '@src/utils/store';
import { AxiosResponse, CancelToken } from 'axios';
import { omit } from 'lodash-es';

import {
  SerachCarbonFactorEmissionParams,
  SerachCarbonFactorResult,
} from './type';

/** 获取因子数据table列表 */
export function getSerachCarbonFactorTable(
  data: SerachCarbonFactorEmissionParams,
  cancelToken?: CancelToken,
) {
  return request<AxiosResponse<SerachCarbonFactorResult[]>>({
    method: 'post',
    url: `/footprint3/factor/queryFactorListAuthSearch`,
    data: withShareEditSnapFlag(data),
    cancelToken,
  });
}

/** 企业碳核算-获取因子数据table列表 */
export function getEnterpriseSearchCarbonFactorTable(
  data: SerachCarbonFactorEmissionParams,
  cancelToken?: CancelToken,
) {
  return request<AxiosResponse<SerachCarbonFactorResult[]>>({
    method: 'post',
    url: `/enterprise/source/queryFactor`,
    data,
    cancelToken,
  });
}

export function associationalFactor(data: {
  name: string;
  sourceType?: string;
  transportType?: string;
  isEnterprise?: boolean;
  computationId?: number;
  accountId?: number;
  emissionClassify?: string;
}) {
  return request<AxiosResponse<string[]>>({
    method: 'post',
    url: `/${
      data.isEnterprise ? 'enterprise/source' : 'footprint3/factor'
    }/associationalFactor`,
    data: {
      ...omit(data, ['isEnterprise']),
      productId: GetLocalStorageProductId(),
    },
  });
}
