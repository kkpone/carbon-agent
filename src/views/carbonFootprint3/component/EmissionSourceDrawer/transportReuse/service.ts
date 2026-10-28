import { request } from '@/api/request';
import type {
  BatchReuseResult,
  TransportReuseListResult,
  TransportReuseRow,
  TransportReuseService,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportReuse/types';

export const TRANSPORT_REUSE_API_URLS = {
  distanceOptions: '/footprint3/accountEmissionTransport/distanceOptions',
  reuseList: '/footprint3/accountEmissionTransport/reuseList',
  batchReuseDistance: '/footprint3/accountEmissionTransport/batchReuseDistance',
  batchReuseFactor: '/footprint3/accountEmissionTransport/batchReuseFactor',
} as const;

const getResponseData = <T>(response: { data: { data: T } }) =>
  response.data.data;

export const transportReuseService: TransportReuseService = {
  async getDistanceOptions(params) {
    const response = await request<{ data: TransportReuseRow[] }>({
      method: 'GET',
      url: TRANSPORT_REUSE_API_URLS.distanceOptions,
      params: { ...params, reuseType: 'DISTANCE' },
    });
    return getResponseData(response);
  },
  async getDistanceReuseList(params) {
    const response = await request<{ data: TransportReuseListResult }>({
      method: 'GET',
      url: TRANSPORT_REUSE_API_URLS.reuseList,
      params: { ...params, reuseType: 'DISTANCE' },
    });
    return getResponseData(response);
  },
  async getFactorReuseList(params) {
    const response = await request<{ data: TransportReuseListResult }>({
      method: 'GET',
      url: TRANSPORT_REUSE_API_URLS.reuseList,
      params: { ...params, reuseType: 'FACTOR' },
    });
    return getResponseData(response);
  },
  async batchReuseDistance(data) {
    const response = await request<{ data: BatchReuseResult }>({
      method: 'POST',
      url: TRANSPORT_REUSE_API_URLS.batchReuseDistance,
      data,
    });
    return getResponseData(response);
  },
  async batchReuseFactor(data) {
    const response = await request<{ data: BatchReuseResult }>({
      method: 'POST',
      url: TRANSPORT_REUSE_API_URLS.batchReuseFactor,
      data,
    });
    return getResponseData(response);
  },
};
