import { request, ResponseData, IPageList } from '@src/api/request';

import {
  PrecursorDataFillListResq,
  PrecursorDataFillListRequest,
  PrecursorDataFillFeedBackResq,
  PrecursorDataFillResp,
  SupplyAttribution,
} from './type';

/**
 * @description 前体数据填报列表
 */
export const getPrecursorDataFillList = (
  params: PrecursorDataFillListRequest,
) =>
  request<ResponseData<IPageList<PrecursorDataFillListResq>>>({
    method: 'GET',
    url: '/cbam2/supplyInfo/findSupplyPage',
    params,
  });

/**
 * @description 前体数据填报详情
 */
export const getPrecursorDataFillDetail = (params: { id: number }) =>
  request<ResponseData<PrecursorDataFillListResq>>({
    method: 'GET',
    url: `/cbam2/supplyInfo/supply/${params.id}`,
    params,
  });

/**
 * @description 前体数据填报 - 详情 - 反馈列表
 */
export const getPrecursorFeedBackList = (params: { supplyId: number }) =>
  request<ResponseData<PrecursorDataFillFeedBackResq[]>>({
    method: 'GET',
    url: `/cbam2/supplyAudit`,
    params,
  });

/**
 * @description 前体数据填报详情-数据填报详情
 */
export const getPrecursorDataFillDataDetail = (params: { id: number }) =>
  request<ResponseData<PrecursorDataFillResp>>({
    method: 'GET',
    url: `/cbam2/supplyAttribution/${params.id}`,
    params,
  });

/**
 * @description 前体数据填报-填报-保存/保存并提交
 */
export const postPrecursorDataFillDataSubmit = (data: PrecursorDataFillResp) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/supplyAttribution',
    data,
  });

/**
 * @description 前体数据填报 - 撤回审批
 */
export const postPrecursorFillRollBack = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/cbam2/supplyAudit/rollback`,
    data,
  });

/**
 * @description 前体数据填报 - 提交审批
 */
export const postPrecursorFillSubmit = (params: { supplyInfoId: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/cbam2/supplyAudit/submitOrRollBack`,
    params,
  });

/**
 * @description 前体数据填报详情-数据填报详情-查询根据选择已有CBAM数据产品对应的排放数据
 */
export const getPrecursorDataFillDataProductDetail = (params: {
  productId: number;
}) =>
  request<ResponseData<SupplyAttribution[]>>({
    method: 'GET',
    url: `/cbam2/supplyAttribution/getCbamProductData`,
    params,
  });
