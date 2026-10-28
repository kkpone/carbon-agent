import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';

import type { CarbonLabelTargetFields } from '../carbonLabelPreview';

type ApplicationSourceTarget = CarbonLabelTargetFields & {
  accountId?: string;
  accountName?: string;
  productId?: string;
  productName?: string;
  type?: string;
};

type ApplicationTarget = ApplicationSourceTarget & { type: 'carbonLabel' };

/** 只从产品碳上下文取核算 ID，不将企业碳、CBAM 等业务 ID 混入查询。 */
export function getCarbonLabelAccountIdsKey(
  targets: ApplicationSourceTarget[],
) {
  return Array.from(
    new Set(
      targets
        .filter(
          target =>
            target.accountId &&
            [
              'account',
              'report',
              'expertReview',
              'certification',
              'carbonLabel',
            ].includes(target.type || 'account'),
        )
        .map(target => target.accountId as string),
    ),
  )
    .sort()
    .join('|');
}

/** 已打开的申请沿用原 key，首次提交后不因列表刷新重复建 tab 或丢失表单。 */
export function mergeCarbonLabelApplicationTargets<
  T extends ApplicationSourceTarget,
>(
  targets: T[],
  applications: CarbonLabelListData[],
): Array<T | ApplicationTarget> {
  const applicationById = new Map(
    applications.map(row => [`${row.accountId}:${row.id}`, row]),
  );
  const openedIds = new Set<string>();
  const result: Array<T | ApplicationTarget> = targets.map(target => {
    if (target.type !== 'carbonLabel' || !target.carbonLabelApplicationId)
      return target;
    const identity = `${target.accountId}:${target.carbonLabelApplicationId}`;
    openedIds.add(identity);
    const record = applicationById.get(identity);
    return record
      ? {
          ...target,
          carbonLabelApplyNum: record.applyNum,
          carbonLabelStatus: record.status,
        }
      : target;
  });

  applications.forEach(record => {
    const identity = `${record.accountId}:${record.id}`;
    if (openedIds.has(identity)) return;
    openedIds.add(identity);
    result.push({
      accountId: String(record.accountId),
      accountName: record.accountName,
      productId:
        record.productId == null ? undefined : String(record.productId),
      productName: record.productName,
      carbonLabelKey: `application:${identity}`,
      carbonLabelApplicationId: String(record.id),
      carbonLabelApplyNum: record.applyNum,
      carbonLabelStatus: record.status,
      type: 'carbonLabel',
    });
  });
  return result;
}
