import { request, ResponseData, IPageList } from '@src/api/request';

import {
  AuditListType,
  AuditUserListResq,
  PrecursorAuditLogResq,
  PrecursorAuditNodeResq,
  PrecursorDataApprovalListProps,
  PrecursorDataApprovalListRequest,
} from './type';

/**
 * @description 前体数据审批列表
 */
export const getPrecursorDataApprovalList = (
  params: PrecursorDataApprovalListRequest,
) =>
  request<ResponseData<IPageList<PrecursorDataApprovalListProps>>>({
    method: 'GET',
    url: '/cbam2/supplyInfo/findAuditPage',
    params,
  });

/**
 * @description 前体数据审批详情
 */
export const getPrecursorDataApprovalDetail = (params: { id: number }) =>
  request<ResponseData<PrecursorDataApprovalListProps>>({
    method: 'GET',
    url: `/cbam2/supplyInfo/company/${params.id}`,
    params,
  });

/**
 * @description 前体数据审批流程列表
 */

export const getPrecursorAuditProcessList = (params: { id: number }) =>
  request<ResponseData<PrecursorAuditNodeResq[]>>({
    method: 'GET',
    url: `/cbam2/supplyAudit/node/list/curr`,
    params,
  });

/**
 * @description 前体数据审批记录列表
 */
export const getPrecursorAuditRecordList = (params: { id: number }) =>
  request<ResponseData<PrecursorAuditLogResq[]>>({
    method: 'GET',
    url: `/cbam2/supplyAudit/log/list`,
    params,
  });

/**
 * @description 前体数据审批 - 审批
 */

export const postPrecursorAudit = (data: AuditListType) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: `/cbam2/supplyAudit/audit`,
    data,
  });

/**
 * @description 前体数据审批 - 待审核人列表
 */
export const getPrecursorAuditUserList = (params: {
  auditDataId: number;
  pageNum: number;
  pageSize: number;
}) =>
  request<ResponseData<IPageList<AuditUserListResq>>>({
    method: 'GET',
    url: `/cbam2/supplyAudit/user/page`,
    params,
  });
