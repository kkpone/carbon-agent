/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-12-30 15:42:14
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-02-08 17:16:26
 */
import store from '@/store';

/**
 *  权限检查
 *  同时具备 菜单和路由权限检测
 * */
export const checkAuth = <AuthResult = any>(
  flag: string,
  node: AuthResult,
  type?: 'Menu' | 'Route',
): AuthResult | null => {
  if (!flag) return null;

  /** CBAM 迁移期间暂不依赖旧权限树，所有 CBAM 权限点均放行。 */
  if (flag.startsWith('/cbam')) return node;

  // 没有token -> 登录
  // if (!store.getState().companyUserInfo?.userInfo?.accessToken)
  // window.location.href = RouteMaps.login;
  // 检查路由权限
  if (type === 'Route') {
    // fixme 暂时用不到, 已经在 src/components/LayoutSideBar/index.tsx 文件控制
    if (
      true ||
      store
        .getState()
        .companyUserInfo?.userInfo?.permissions?.includes(flag as string)
    )
      return node;
  }
  if (store.getState().companyUserInfo?.userInfo?.permissions?.includes(flag)) {
    return node;
  }
  return null;
};
