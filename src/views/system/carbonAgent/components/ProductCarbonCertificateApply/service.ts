import { request } from '@src/api/request';
import type { BackendResponse } from '@src/api/types';

import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateSubmitPayload,
} from './types';

type ProductCarbonCertificateSubmitResult = {
  id?: number | string | null;
};

export function getProductCarbonCertificateList(
  accountId: string,
  signal?: AbortSignal,
) {
  return request<BackendResponse<ProductCarbonCertificateApplication[]>>({
    method: 'get',
    params: { accountId },
    signal,
    url: '/ai/agent/certificate/list',
  });
}

export function postProductCarbonCertificatePrepare(
  accountId: string,
  forceNew = false,
  signal?: AbortSignal,
) {
  return request<BackendResponse<ProductCarbonCertificateApplication>>({
    data: { accountId, forceNew },
    method: 'post',
    signal,
    url: '/ai/agent/certificate/prepare',
  });
}

export function getProductCarbonCertificatePointCost(
  accountId: string,
  signal?: AbortSignal,
) {
  return request<BackendResponse<{ pointCost?: number | null }>>({
    method: 'get',
    params: { accountId },
    signal,
    url: '/ai/agent/certificate/point-cost',
  });
}

export function getProductCarbonCertificateDetail(
  id: string,
  signal?: AbortSignal,
) {
  return request<BackendResponse<ProductCarbonCertificateApplication>>({
    method: 'get',
    signal,
    url: `/ai/agent/certificate/${encodeURIComponent(id)}`,
  });
}

export function postProductCarbonCertificateSubmit(
  data: ProductCarbonCertificateSubmitPayload,
) {
  return request<BackendResponse<ProductCarbonCertificateSubmitResult>>({
    data,
    method: 'post',
    url: '/ai/agent/certificate/submit',
  });
}
