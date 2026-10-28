import { request } from '@/api/request';

import { IndicatorSystem, TopicGroup } from '../../type';

export const getFrameList = () =>
  request<{
    rows: {
      id: number;
      name: string;
      lgList: { name: string; url: string }[];
    }[];
  }>({
    url: '/esg/model/frame/list',
  });

export const getTopicGroup = params =>
  request<{ data: TopicGroup[] }>({
    url: '/esg/model/topic/list',
    params,
  });

export const getFrameTopicIds = (params: { ids: string; surveyId?: number }) =>
  request<{ data: number[] }>({
    url: '/esg/model/frame/topics',
    params,
  });

export const getIndicatorSystem = (params: { id: number }) =>
  request<{ data: IndicatorSystem }>({
    url: '/esg/frame/frame/info',
    params,
  });
