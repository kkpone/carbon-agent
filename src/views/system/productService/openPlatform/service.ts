import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  ApiKeySecretData,
  CreateApiKeyReq,
  OpenPlatformApiKeyItem,
} from './type';

const apiPrefix = 'management/sysApiKey';

export function getApiKeyList() {
  return request<AxiosResponse<OpenPlatformApiKeyItem[]>>({
    method: 'get',
    url: `${apiPrefix}/list`,
  });
}

export function createApiKey(data: CreateApiKeyReq) {
  return request<AxiosResponse<ApiKeySecretData>>({
    method: 'post',
    url: `${apiPrefix}/create`,
    data,
  });
}

export function updateApiKeyStatus(params: { id: number; status: 0 | 1 }) {
  return request<AxiosResponse<ApiKeySecretData>>({
    method: 'post',
    url: `${apiPrefix}/status`,
    params,
  });
}

export function rotateApiKey(params: { id: number }) {
  return request<AxiosResponse<ApiKeySecretData>>({
    method: 'post',
    url: `${apiPrefix}/rotate`,
    params,
  });
}
