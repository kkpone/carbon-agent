import { request } from '@/api/request';

import { Indicator } from '../../type';

export const getIndicatorMenu = params =>
  request<{ data: Indicator[] }>({
    url: '/esg/frame/indicator/leftTree',
    params,
  });

export const getIndicatorFillMenu = params =>
  request<{ data: Indicator[] }>({
    url: '/esg/task/indicator/leftTree',
    params,
  });

export const getIndicatorDetails = params =>
  request<{ data: { baseInfo: Indicator; rightTree: Indicator[] } }>({
    url: '/esg/frame/indicator/info',
    params,
  });

export const getIndicatorFillDetails = params =>
  request<{ data: { baseInfo: Indicator; rightTree: Indicator[] } }>({
    url: '/esg/task/indicator/info',
    params,
  });

export const submitIndicator = data =>
  request({
    method: 'post',
    url: '/esg/task/indicator/submit',
    data,
  });
