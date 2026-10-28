import { request } from '@/api/request';

export const createAccountByAI = data =>
  request<{ data: { accountId: number; topicId: number } }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiAccount',
    data,
  });

export const buildModelByAI = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiModel',
    data,
  });

export const genAITopicRecord = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiChat',
    data,
  });

export const reBuildByAI = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelAgain',
    data,
  });

export const reGenAITopicRecord = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiChatAgain',
    data,
  });

export const addSourceByAI = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiMoreEmission',
    data,
  });

export const reModelByAI = data =>
  request({
    method: 'post',
    url: '/footprint3/accountEmission/aiReModel',
    data,
  });
