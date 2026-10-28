import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { useTrialUpgradeModal } from '@/components/TrialUpgradeModal';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { UserStatus } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';

import { handleAccountIdBind } from './handleAccountIdBind';

/**
 * 更新 URL 中的 status 参数：如果 status 为 2，则改为 1
 */
const updateStatusParam = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const status = searchParams.get('status');
  if (status === '2') {
    searchParams.set('status', '1');
    const newSearch = searchParams.toString();
    const newUrl = `${window.location.pathname}${
      newSearch ? `?${newSearch}` : ''
    }${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }
};

/**
 * Hook: 处理 accountId 绑定，并在需要升级时显示试用升级弹窗
 * @returns 返回一个函数，用于处理 accountId 绑定逻辑
 * @example
 * const handleBind = useAccountIdBindWithUpgrade();
 * // 自动从 URL 中获取 accountId
 * await handleBind();
 * // 或者手动传入 accountId
 * await handleBind(accountId);
 */
export const useAccountIdBindWithUpgrade = () => {
  const history = useHistory();
  const { openSubscriptionModal, closeSubscriptionModal } =
    useSubscriptionServiceModal();
  const { openTrialUpgradeModal } = useTrialUpgradeModal();

  const handleBind = useCallback(
    async (accountId?: string | null) => {
      // 如果没有传入 accountId，则从 URL 中获取
      const finalAccountId =
        accountId ??
        new URLSearchParams(window.location.search).get('accountId');

      await handleAccountIdBind(
        finalAccountId,
        () => {
          // 绑定成功，刷新页面
          updateStatusParam();
          window.location.reload();
        },
        () => {
          // 需要升级，显示试用升级提示弹窗
          openTrialUpgradeModal({
            onUpgrade: () => {
              // 用户选择升级，打开订阅服务弹窗
              openSubscriptionModal({
                onSuccess: async () => {
                  // 订阅成功后，再次尝试绑定
                  if (finalAccountId) {
                    const userStatus = await handleAccountIdBind(
                      finalAccountId,
                      () => {
                        updateStatusParam();
                        window.location.reload();
                      },
                      undefined,
                      history,
                    );
                    if (userStatus === UserStatus.SKU_INSUFFICIENT) {
                      closeSubscriptionModal();
                      history.push(
                        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
                      );
                      window.location.reload();
                    }
                  } else {
                    updateStatusParam();
                    window.location.reload();
                  }
                },
                onCancel: () => {
                  // 取消订阅，跳转到账户列表页
                  history.push(
                    RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
                  );
                  updateStatusParam();
                  window.location.reload();
                },
              });
            },
            onCancel: () => {
              // 放弃升级，跳转到账户列表页
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
              );
              updateStatusParam();
              window.location.reload();
            },
          });
        },
        history,
      );
    },
    [history, openSubscriptionModal, openTrialUpgradeModal],
  );

  return handleBind;
};
