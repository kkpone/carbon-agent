import { request } from '@/api/request';

export const getSuggestion = params =>
  request<{ data: { chatResult: string; aiContent: string; topicId: number } }>(
    {
      url: '/footprint3/account/getAiEmissionInfo',
      params,
    },
  );

export const getRecommend = params =>
  request<{ data: Record<string, any>[] }>({
    url: '/neutral/goods/goodsNeutral',
    params,
  });

export const getAskFootAiAssistant = (params: { accountId: number }) =>
  request<{ data: { topicId: number } }>({
    url: '/ai/chat/askFootAiAssistant',
    params,
  });
