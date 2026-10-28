import { request } from '@/api/request';

export const getEnterpriseUserStatus = () =>
  request<{ data: { userStatus: string; beModeling: number } }>({
    method: 'get',
    url: '/enterprise/computation/checkUserStatus',
  });

export const createLightEnterpriseAccount = () =>
  request<{ data: Record<string, any> }>({
    method: 'get',
    url: '/enterprise/computation/lightComputation',
  });

export const createLightEnterpriseAiModel = data =>
  request({
    method: 'post',
    url: '/enterprise/source/temp/createModelLight',
    data,
  });

export const createLightEnterpriseTravelAiModel = data =>
  request({
    method: 'post',
    url: '/enterprise/business/travel/createModelLight',
    data,
  });
