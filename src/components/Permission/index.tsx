/* eslint-disable no-empty */
/*
 * @@description:权限组件
 * @usage <Permission flag='element flag'>you reactNode</Permission>
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-11 10:36:42
 */

import { RootState } from '@src/store';
import { getLoginStorage } from '@src/utils/feishuSession';
import { FC, PropsWithChildren, ReactElement } from 'react';
import { useSelector } from 'react-redux';

import { SET_COMPANY_USER_INFO } from '@/store/actionTypes';

interface IProps {
  flag?: string;
}

const Permission: FC<PropsWithChildren<IProps>> = ({ children, flag }) => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const permissions = selector?.userInfo?.permissions || [];

  const isRender =
    permissions.length > 0 && flag && permissions?.includes(flag.trim());

  if (!isRender) return null;

  return children as ReactElement;
};

export default Permission;

/** 数据权限 0 无编辑权限 1 有编辑权限 */
export const DataPermission = ({ editPermission, children }) =>
  (Number(editPermission) === 1 || editPermission === null) && children;

export const usePermission = (flag: string) => {
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const permissions = selector?.userInfo?.permissions || [];

  const hasPermission =
    permissions.length > 0 && flag && permissions?.includes(flag.trim());
  return hasPermission;
};

export const getPermission = (flag: string) => {
  const localPermission =
    getLoginStorage().getItem(SET_COMPANY_USER_INFO) || '';
  let permissions: string[] = [];

  if (localPermission) {
    try {
      const userInfoParent = JSON.parse(localPermission);
      permissions = userInfoParent?.userInfo?.permissions || [];
    } catch (error) {}
  }

  const hasPermission =
    permissions.length > 0 && flag && permissions?.includes(flag.trim());
  return hasPermission;
};
