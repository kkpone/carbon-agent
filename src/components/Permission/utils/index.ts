/*
 * @Author: 张明尧
 * @Date: 2022-07-13 14:23:39
 */
import store from '@src/store';

/** 检查是否有权限 */
export const checkPermissions = <T>(data: T, flag: string) => {
  const permissions = store.getState().companyUserInfo?.userInfo?.permissions;

  if (!flag || !permissions) return null;
  if (permissions.some(item => item === flag)) return data;
  return null;
};
