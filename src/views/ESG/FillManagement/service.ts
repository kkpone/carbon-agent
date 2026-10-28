import { request } from '@/api/request';

import { ESGTask, IndicatorSystem } from '../type';

export const getTaskPeriodList = () =>
  request<{ data: IndicatorSystem[] }>({
    url: '/esg/task/frame/list',
  });

export const getESGTaskList = (params: { frameId: number }) =>
  request<{ data: ESGTask[] }>({
    url: '/esg/task/org/list',
    params,
  });

export const getESGTaskFillProgress = (params: { frameId: number }) =>
  request<{ data: { code: number; name: string; rate: string }[] }>({
    url: '/esg/task/overview',
    params,
  });
