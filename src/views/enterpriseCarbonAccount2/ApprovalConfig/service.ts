import { request } from '@/api/request';

export interface ApprovalFlowItem {
  id: number;
  createBy: number;
  updateBy: number;
  createTime: string;
  updateTime: string;
  companyId: number;
  flowName: string;
  flowKey: string;
  description: string;
  status: number;
  deleted: number;
}

export interface ApprovalFlowNode {
  id: number;
  companyId: number;
  flowId: number;
  nodeOrder: number;
  nodeName: string;
  approveType: number; // 1: 人员, 2: 角色, 3: 数据审批负责人
  approveSource: string | null;
  onEmptyAction: number; // 1: 自动通过, 2: 不通过, 3: 指定人员
  assignToPerson: string | null;
  isParallel: boolean;
  remark: string | null;
}

export interface ApprovalFlowDetail {
  id: number;
  companyId: number;
  flowName: string;
  flowKey: string;
  description: string;
  flowStatus: number;
  nodeList: ApprovalFlowNode[];
}

export const getApprovalConfigList = (params: {
  pageNum: number;
  pageSize: number;
}) =>
  request<{
    data: {
      pageNum: number;
      pageSize: number;
      size: number;
      total: number;
      pages: number;
      list: ApprovalFlowItem[];
    };
  }>({
    method: 'GET',
    url: '/management/approvalFlow/list',
    params,
  });

export const toggleApprovalConfigStatus = (id: number) =>
  request({
    method: 'POST',
    url: '/management/approvalFlow/editFlowEnable',
    data: { id },
  });

export const getApprovalConfigDetail = (params: { id: number }) =>
  request<{ data: ApprovalFlowDetail }>({
    method: 'GET',
    url: '/management/approvalFlow/flowInfo',
    params,
  });

export interface SaveApprovalNodeParams {
  nodeOrder: number;
  nodeName: string;
  approveType: string;
  approveSource: string;
  onEmptyAction: string;
  assignToPerson: string;
}

export interface SaveApprovalFlowParams {
  flowId: string;
  nodeList: SaveApprovalNodeParams[];
}

export const saveApprovalFlow = (data: SaveApprovalFlowParams) =>
  request({
    method: 'POST',
    url: '/management/approvalNode/editNode',
    data,
  });
