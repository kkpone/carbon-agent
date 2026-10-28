import I18N from '@src/lang/I18N';
import type { CarbonLabelSubApiData } from '@src/views/carbonFootprint3/CarbonLabel/AddOrDetail/type';
import {
  ApplyForAccountStatus,
  ApplyForLabelType,
} from '@src/views/carbonFootprint3/CarbonLabel/constant';
import { getCarbonLabelContrastList } from '@src/views/carbonFootprint3/CarbonLabel/service';

import {
  getAgentCarbonLabelAuditRecords,
  getAgentCarbonLabelDetail,
  getAgentCarbonLabelPointCost,
  getAgentCarbonLabelPrepare,
} from './service';
import type {
  AgentLabelApplicationPayload,
  ApplicationContext,
  ApplicationInfo,
  ApplicationValues,
  PreparedApplicationInfo,
} from './types';

/** Agent 页面排放单位直接使用接口 accountObj.unitName。 */
export function getApplicationEmissionUnit(info: ApplicationInfo) {
  return info.accountObj?.unitName || '';
}

/** 预览允许返回空状态/申请编号；转换仅用于兼容现有展示组件。 */
export function normalizeApplicationInfo(
  response: PreparedApplicationInfo,
): ApplicationInfo {
  const info: ApplicationInfo = {
    ...response,
    id: response.id ?? undefined,
    status: response.status ?? undefined,
    applyNum: response.applyNum ?? undefined,
    version: response.version ?? undefined,
    labelType: response.labelType ?? ApplyForLabelType.ACCOUNT,
    labelPic: response.labelPic ?? undefined,
    pointCost: response.pointCost ?? undefined,
    pointPaid: response.pointPaid ?? undefined,
    updateBy: response.updateBy ?? undefined,
    updateTime: response.updateTime ?? undefined,
    errorCode: response.errorCode ?? undefined,
  };
  return {
    ...info,
    perEmission: String(info.accountObj?.perEmission ?? ''),
    perEmissionUnit: getApplicationEmissionUnit(info),
  };
}

export async function loadApplicationPointCost(accountId: string) {
  const { data } = await getAgentCarbonLabelPointCost(accountId);
  const cost = data.data?.pointCost;
  return Number.isSafeInteger(cost) && cost >= 0 ? cost : undefined;
}

/** 表单类别枚举继续沿用原碳标签接口；accountObj.equalList 只服务 H5 类比预览。 */
export async function loadApplicationCategoryOptions() {
  const { data } = await getCarbonLabelContrastList();
  return (Array.isArray(data.data) ? data.data : []).flatMap(rawItem => {
    // 旧页面直接把接口结果交给 Checkbox.Group。兼容线上实际的
    // label/value 结构和旧类型声明中的 name/code，避免无 value 时整页崩溃。
    const item = rawItem as typeof rawItem & {
      label?: string;
      value?: number | string;
    };
    const label = item.label ?? item.name;
    const value = item.value ?? item.code;
    return label != null && value != null ? [{ label, value }] : [];
  });
}

/** 只有首次付费申请需要展示当前积分价格；价格结果不参与提交资格判断。 */
export function shouldLoadApplicationPointCost(status?: number) {
  return (
    isApplicationEditable(status) && status !== ApplyForAccountStatus.NOT_PASS
  );
}

/** 产品、核算及已有申请信息统一由 Agent prepare 返回。 */
export async function prepareApplicationSource(
  accountId: string,
  productId?: string,
  forceNew = false,
) {
  const { data } = await getAgentCarbonLabelPrepare({
    accountId,
    forceNew,
  });
  const prepared = data.data;
  if (
    !prepared?.productId ||
    String(prepared.accountId) !== accountId ||
    (productId && String(prepared.productId) !== productId)
  )
    throw new Error(I18N.carbonAgent.labelApplication.sourceMissing);

  return normalizeApplicationInfo(prepared);
}

export async function loadApplicationSource(
  accountId: string,
  productId?: string,
) {
  return withApplicationRecords(
    await prepareApplicationSource(accountId, productId, false),
  );
}

export async function loadApplicationInfo(id: string) {
  const { data } = await getAgentCarbonLabelDetail(id);
  return normalizeApplicationInfo(data.data);
}

export async function loadApplication(id: string) {
  return withApplicationRecords(await loadApplicationInfo(id));
}

export async function loadApplicationAuditRecords(applyNum?: string) {
  if (!applyNum) return [];
  const { data } = await getAgentCarbonLabelAuditRecords({ applyNum });
  return data.data;
}

async function withApplicationRecords(info: ApplicationInfo) {
  const records = await loadApplicationAuditRecords(info.applyNum);
  return { info, records, preview: info };
}

export function toAgentApplicationPayload(
  values: ApplicationValues,
  info: ApplicationInfo,
  context: ApplicationContext = {},
): AgentLabelApplicationPayload {
  if (info.accountId == null || info.productId == null)
    throw new Error(I18N.carbonAgent.labelApplication.sourceMissing);
  return {
    accountId: info.accountId,
    productId: info.productId,
    productName: values.productName,
    accountName: values.accountName,
    brand: values.brand,
    specsShow: values.specsShow,
    specs: values.specs,
    productPic: values.productPic?.[0]?.url || '',
    periodShow: values.periodShow,
    startTime: values.period?.[0] || '',
    endTime: values.period?.[1] || '',
    contrastShow: values.contrastShow,
    contrastValues: values.contrastValuesArr?.join(',') || '',
    unitCode: info.unitCode,
    unitName: info.unitName,
    projectId: info.projectId ?? context.projectId ?? null,
    sessionId: info.sessionId ?? context.sessionId ?? null,
    messageId: info.messageId ?? context.messageId ?? null,
  };
}

export function toApplicationValues(info: ApplicationInfo): ApplicationValues {
  return {
    productName: info.productName || '',
    accountName: info.accountName || '',
    period:
      info.startTime && info.endTime ? [info.startTime, info.endTime] : [],
    perEmission: String(info.accountObj?.perEmission ?? ''),
    perEmissionUnit: getApplicationEmissionUnit(info),
    productUnitName: info.unitName || '',
    brand: info.brand || '',
    specs: info.specs || '',
    specsShow: info.specsShow ?? 1,
    periodShow: info.periodShow ?? 1,
    contrastShow: info.contrastShow ?? 1,
    contrastValuesArr: info.contrastValues
      ? info.contrastValues.split(',').map(Number)
      : [],
    productPic: info.productPic
      ? [
          {
            url: info.productPic,
            name: I18N.carbonFootprint3.productImages,
            uid: 'label-product',
          },
        ]
      : [],
  };
}

/** 与旧模块保持同一转换：图片取首张，类别逗号分隔，日期字符串。 */
export function toApplicationPayload(
  values: ApplicationValues,
  info: ApplicationInfo,
): CarbonLabelSubApiData {
  return {
    id: info.id,
    applyNum: info.applyNum,
    productId: info.productId,
    accountId: info.accountId,
    productName: values.productName,
    accountName: values.accountName,
    startTime: values.period?.[0] || '',
    endTime: values.period?.[1] || '',
    perEmission: values.perEmission,
    perEmissionUnit: values.perEmissionUnit,
    unitName: info.unitName,
    labelType: ApplyForLabelType.ACCOUNT,
    brand: values.brand,
    specs: values.specs,
    specsShow: values.specsShow,
    periodShow: values.periodShow,
    contrastShow: values.contrastShow,
    contrastValues: values.contrastValuesArr?.join(','),
    productPic: values.productPic?.[0]?.url || '',
  };
}

/** 只映射展示字段；equalList / stageList 等计算结果始终保留接口值。 */
export function toApplicationPreview(
  values: ApplicationValues,
  info: ApplicationInfo,
): ApplicationInfo {
  const fields = toApplicationPayload(values, info);
  return {
    ...info,
    ...fields,
    id: info.id,
    productId: info.productId,
    accountId: info.accountId,
    accountObj: {
      ...info.accountObj,
      equalList: info.accountObj?.equalList || [],
      perEmission: values.perEmission,
      unitName: values.perEmissionUnit,
    },
  };
}

export function isApplicationEditable(status?: number) {
  return (
    status === undefined ||
    [
      ApplyForAccountStatus.TO_BE_SUB,
      ApplyForAccountStatus.NOT_PASS,
      ApplyForAccountStatus.REVIEWED_ERR,
    ].includes(status)
  );
}
