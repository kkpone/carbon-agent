import { request } from '@/api/request';

import { Indicator } from '../../type';

export const getSystemIndicatorTree = params =>
  request<{ data: Indicator[] }>({
    url: '/esg/customIndicator/tree',
    params,
  });

export const editIndicator = data =>
  request({
    method: 'post',
    url: '/esg/task/indicator/edit',
    data,
  });

export const getStandardList = () =>
  request<{ data: { id: number; name: string }[] }>({
    url: '/esg/customIndicator/standardList',
  });
