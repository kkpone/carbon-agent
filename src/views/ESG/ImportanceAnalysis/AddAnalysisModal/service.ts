import { request } from '@/api/request';

export const checkCompanyTopics = () =>
  request<{ data: number }>({
    url: '/esg/survey/hasTopics',
  });
