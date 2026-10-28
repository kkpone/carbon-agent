import { useRequest } from 'ahooks';
import { ValueOf } from 'type-fest';

import { request } from '@/api/request';

export const useUserOrgType = ({ isShare }: { isShare?: boolean } = {}) => {
  const { data } = useRequest(
    () =>
      request<{ data: { companyOrg: { orgType: ValueOf<typeof ORG_TYPE> } } }>({
        url: '/management/user/detail',
      }).then(resp => resp.data.data.companyOrg.orgType),
    {
      cacheKey: 'userOrgType',
      refreshDeps: [],
      manual: isShare,
      cacheTime: 1000 * 60 * 60,
    },
  );

  return data;
};

export const ORG_TYPE = {
  ENTERPRISE: 1,
  ORG: 2,
  MAIN_PART: 3,
} as const;
