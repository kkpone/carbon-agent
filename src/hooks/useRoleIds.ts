import { apiRoleList } from '@src/views/dashborad/orgstaff/service';
import { useQuery } from '@tanstack/react-query';

export const useRoleIds = () => {
  const { data, refetch } = useQuery({
    queryKey: ['RoleIds'],
    queryFn: () => apiRoleList({ size: 1000, page: 1 }),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 60,
    keepPreviousData: true,
  });
  const originData = data?.data?.data;
  const transformData = (originData?.rows || []).map(item => ({
    label: item.roleName,
    value: item.roleId,
  }));
  return { transformData, originData, refetch };
};
