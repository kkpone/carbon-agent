import config from '@src/config';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { BuildModelDescribeSet } from '@src/views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/constant';
import { FootprintAccountInfoUrlStatus } from '@src/views/carbonFootprint3/FootprintAccount/constant';
import { STEP_OPTION_VALUE } from '@src/views/carbonFootprint3/util/constant';

import {
  CARBON_DATA_DATA_TYPE,
  CARBON_DATA_FILL_TYPE,
  CARBON_DATA_REQ_DATA_TYPE,
  CARBON_DATA_REQ_TYPE,
  CARBON_DATA_STATUS,
} from '../constant';

/** 模型共享填报任务识别参数 */
export type ModelShareTaskIdentifyParams = {
  fillType?: number | null;
  modelShareFlag?: number | boolean | null;
  reqType?: number | null;
  accountId?: number | null;
  businessId?: number | null;
};

/** fillType=3：模型共享填报，页面只读且不可切换填报方式 */
export const isModelShareFillType = (fillType?: number | null) =>
  Number(fillType) === CARBON_DATA_FILL_TYPE.MODEL_SHARE;

/** 系统匹配 / 模型共享：快照与结果展示逻辑一致 */
export const isMatchLikeFillType = (fillType?: number | null) =>
  Number(fillType) === CARBON_DATA_FILL_TYPE.MATCH ||
  isModelShareFillType(fillType);

/**
 * 是否为模型共享创建的供应链填报任务（创建收数任务 / 绑定供应商）
 * 优先 fillType=3；其次 modelShareFlag；兜底：产品碳足迹 + 共享副本 accountId + 源核算 businessId
 */
export const isModelShareSupplierTask = (
  data?: ModelShareTaskIdentifyParams | null,
) => {
  if (!data) return false;
  if (isModelShareFillType(data.fillType)) return true;
  if (data.modelShareFlag === 1 || data.modelShareFlag === true) return true;

  return (
    Number(data.reqType) === CARBON_DATA_REQ_TYPE.FOOTPRINT &&
    Boolean(data.accountId) &&
    Boolean(data.businessId)
  );
};

/** 审核通过后展示排放强度、模型预览、报告下载 */
export const canShowModelShareFillResult = (status?: number | null) =>
  Number(status) === CARBON_DATA_STATUS.APPROVED;

/** 跳转到共享副本建模页（当前页内路由） */
export const getSharedModelManagementPath = (params: {
  accountId: number;
  dataType?: number | null;
  reqDataType?: number | null;
}) => {
  const isProcess =
    Number(params.dataType) === CARBON_DATA_DATA_TYPE.PROCESS ||
    Number(params.reqDataType) === CARBON_DATA_REQ_DATA_TYPE.PROCESS_ACCOUNT;

  const base = isProcess
    ? RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingManagement
    : RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement;

  return `${base}/${params.accountId}`;
};

/** 新标签打开共享副本核算建模页，交互对齐批量解析建模「进入核算」 */
export const openSharedModelAccountingInNewTab = (params: {
  accountId?: number | null;
  productId?: number | null;
  delFlag?: number | null;
}) => {
  const accountId = Number(params.accountId);
  const productId = Number(params.productId);

  if (!accountId) {
    return false;
  }
  if (!productId) {
    return false;
  }

  const status =
    Number(params.delFlag) === 1
      ? FootprintAccountInfoUrlStatus.DETAIL
      : FootprintAccountInfoUrlStatus.EDIT;

  const route =
    `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail}` +
    `?productId=${productId}` +
    `&status=${status}` +
    `&accountId=${accountId}` +
    `&stepValue=${STEP_OPTION_VALUE.MODEL}` +
    `&listOrGraph=${BuildModelDescribeSet.VISUAL}`;

  window.open(
    `${window.location.origin}${config.BASENAME || ''}${route}`,
    '_blank',
    'noopener,noreferrer',
  );
  return true;
};
