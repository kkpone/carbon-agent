import { RouteMaps } from '@/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { withCurrentLocalePrefix } from '@/router/localePath';
import { UserStatus } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import { apiBindData } from '@/views/system/login/service';

/**
 * 处理 accountId 绑定逻辑
 * @param accountId accountId 字符串
 * @param onSuccess 绑定成功且用户状态正常时的回调
 * @param onTrialUpgrade 需要升级时的回调
 * @param history 路由 history 对象，用于跳转（可选）
 * @returns Promise<void>
 */
export const handleAccountIdBind = async (
  accountId: string | null,
  onSuccess?: () => void,
  onTrialUpgrade?: () => void,
  history?: { push: (path: string) => void },
): Promise<UserStatus | undefined> => {
  if (!accountId) {
    onSuccess?.();
    return;
  }

  try {
    const bindRes = await apiBindData({
      accountId: Number(accountId),
    });
    if (
      bindRes.data.code === 200 &&
      (bindRes.data.data?.userStatus === UserStatus.NORMAL ||
        bindRes.data.data?.userStatus === UserStatus.TRIAL_NORMAL)
    ) {
      // 只有正常用户才执行成功回调
      onSuccess?.();
    } else {
      if (bindRes.data.data?.userStatus === UserStatus.SAAS) {
        // SAAS 用户跳转到工作台并刷新页面
        if (history) {
          history.push(RouteMaps.workIndex);
          window.location.reload();
        } else {
          window.location.href = withCurrentLocalePrefix(RouteMaps.workIndex);
        }
        return;
      }
      if (bindRes.data.data?.userStatus === UserStatus.NO_PERMISSION) {
        if (history) {
          history.push(
            RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
          );
          window.location.reload();
        } else {
          window.location.href = withCurrentLocalePrefix(
            RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
          );
        }
        return;
      }
      // 需要升级
      onTrialUpgrade?.();
      // eslint-disable-next-line consistent-return
      return bindRes.data.data?.userStatus;
    }
  } catch {
    // 接口调用失败时，不执行任何回调
  }
};
