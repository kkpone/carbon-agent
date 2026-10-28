import { request } from '@/api/request';

export const getSummaryInfo = params =>
  request<{ data: Record<string, any> }>({
    url: '/esg/survey/roleSummary',
    params,
  });
