import { request } from '@/api/request';
import { Org } from '@/components/OrgTree/type';

export const getOrgList = () =>
  request<{ data: Org[] }>({
    url: '/esg/frame/frame/orgTree',
    debounced: true,
  });
