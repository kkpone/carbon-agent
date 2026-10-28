import { request } from '@/api/request';

export const genSummaryAdvice = params =>
  request<{ data: Record<string, any> }>({
    url: '/esg/survey/aiAnalyzeResult',
    params,
  });
