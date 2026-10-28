import { RouteMaps } from '@src/router/route-paths';
import { withCurrentLocalePrefix } from '@src/router/localePath';
import { InviteSearch } from './common';

/**
 * 主要是判断如果通过邀请链接建立供应商关系时没有登录的情况
 * 用作登录弹窗
 */
export const isInviteLogin = () => {
  const search = new URLSearchParams(window.location.search);
  if (search) {
    /** 获取发起邀请的id */
    const inviteInfoId = search.get(InviteSearch.COMID);
    if (inviteInfoId) {
      sessionStorage.setItem(InviteSearch.COMID, inviteInfoId);
      window.location.href = withCurrentLocalePrefix(RouteMaps.login);
    }
  }
};
