import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';
import { useEffect, useMemo, useState } from 'react';

import { loadCarbonLabelApplications } from './applicationList';
import type { CarbonLabelSubmission } from './types';

/** 已有申请的列表与页签只留在桌面预览容器，不写入会话或分享数据。 */
export function useCarbonLabelApplications({
  accountIdsKey,
  enabled,
  open,
  sessionKey,
}: {
  accountIdsKey: string;
  enabled: boolean;
  open: boolean;
  sessionKey: string;
}) {
  const [result, setResult] = useState<{
    accountIdsKey: string;
    sessionKey: string;
    rows: CarbonLabelListData[];
  }>();
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!enabled || !open || !accountIdsKey) return undefined;
    const controller = new AbortController();
    const accountIds = accountIdsKey.split('|');

    Promise.allSettled(
      accountIds.map(accountId =>
        loadCarbonLabelApplications(accountId, controller.signal),
      ),
    ).then(results => {
      if (controller.signal.aborted) return;
      setResult(previous => ({
        accountIdsKey,
        sessionKey,
        rows: results.flatMap((item, index) => {
          if (item.status === 'fulfilled') return item.value;
          // 刷新失败时保留已打开记录，避免卸载正在编辑的申请。
          return previous?.sessionKey === sessionKey
            ? previous.rows.filter(
                row => String(row.accountId) === accountIds[index],
              )
            : [];
        }),
      }));
    });

    return () => controller.abort();
  }, [accountIdsKey, enabled, open, reload, sessionKey]);

  const applications = useMemo(() => {
    if (
      !enabled ||
      result?.sessionKey !== sessionKey ||
      result.accountIdsKey !== accountIdsKey
    )
      return [];
    const accountIds = new Set(accountIdsKey.split('|'));
    // 这里只隔离当前会话/核算上下文；接口筛选和分页已在请求层完成。
    return result.rows.filter(row => accountIds.has(String(row.accountId)));
  }, [accountIdsKey, enabled, result, sessionKey]);
  const applicationsLoading = Boolean(
    enabled &&
      open &&
      accountIdsKey &&
      (result?.sessionKey !== sessionKey ||
        result.accountIdsKey !== accountIdsKey),
  );

  return {
    applications,
    applicationsLoading,
    updateApplication: (application: CarbonLabelSubmission) => {
      setResult(previous => {
        if (
          !previous ||
          previous.sessionKey !== sessionKey ||
          previous.accountIdsKey !== accountIdsKey
        )
          return previous;

        let updated = false;
        const rows = previous.rows.map(row => {
          if (
            String(row.accountId) !== application.accountId ||
            String(row.id) !== application.id
          )
            return row;

          updated = true;
          return {
            ...row,
            applyNum: application.applyNum ?? row.applyNum,
            status: application.status ?? row.status,
          };
        });

        return updated ? { ...previous, rows } : previous;
      });
    },
    refreshApplications: () => setReload(value => value + 1),
  };
}
