import { getSystemOrgUserList } from '@/sdks/systemV2ApiDocs';

/** 返回所属组织列表 */
export const getCommonOrgsList = async () => {
  const { data } = await getSystemOrgUserList({});
  return data.data || [];
};
