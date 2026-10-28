import { ApplyForAccountStatus } from '@src/views/carbonFootprint3/CarbonLabel/constant';

import { prepareApplicationSource } from './data';
import type { ApplicationInfo } from './types';

export type CarbonLabelEntryResolution =
  | {
      application: ApplicationInfo;
      forceNew: false;
      kind: 'existing';
    }
  | {
      application: ApplicationInfo;
      forceNew: boolean;
      kind: 'new';
    };

/** 新申请只复用 prepare 返回的模型与表单数据，不继承旧申请身份和会话。 */
export function toNewCarbonLabelApplication(
  application: ApplicationInfo,
): ApplicationInfo {
  return {
    ...application,
    id: undefined,
    status: undefined,
    applyNum: undefined,
    version: undefined,
    labelPic: undefined,
    pointCost: undefined,
    pointPaid: undefined,
    projectId: undefined,
    sessionId: undefined,
    messageId: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateByName: undefined,
    updateTime: undefined,
  };
}

/**
 * 点击入口后的唯一业务判断：
 * - 未完成申请直接定位详情；
 * - 已完成申请通过 forceNew=true 取得新申请初始化数据；
 * - 没有申请 ID 时直接使用本次 prepare 数据创建新页签。
 */
export async function resolveCarbonLabelEntry(
  accountId: string,
  productId?: string,
): Promise<CarbonLabelEntryResolution> {
  const current = await prepareApplicationSource(accountId, productId, false);

  if (
    current.id !== undefined &&
    current.id !== null &&
    current.status !== ApplyForAccountStatus.PASS
  ) {
    return { application: current, forceNew: false, kind: 'existing' };
  }

  const forceNew =
    current.id !== undefined &&
    current.id !== null &&
    current.status === ApplyForAccountStatus.PASS;
  const prepared = forceNew
    ? await prepareApplicationSource(accountId, productId, true)
    : current;

  return {
    application: toNewCarbonLabelApplication(prepared),
    forceNew,
    kind: 'new',
  };
}
