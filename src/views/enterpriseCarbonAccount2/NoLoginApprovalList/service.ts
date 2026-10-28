import { request } from '@/api/request';

import { APPROVAL_REQ_STATUS } from '../ApprovalList/constant';
import { getApprovalList } from '../ApprovalList/service';

/** 未登录审批页：按 ticket 获取用户信息（姓名 + 待审批数量） */
export const getApprovalUserInfo = async (params: { ticket?: string }) => {
  const [userRes, listRes] = await Promise.all([
    request<{ data: { name: string; waitDealCount?: number } }>({
      url: '/enterprise/source/task/info/by/ticket',
      params,
    }).catch(() => ({ data: { data: { name: '' } } })),
    getApprovalList({
      ticket: params.ticket,
      reqType: APPROVAL_REQ_STATUS.PENDING,
      pageNum: 1,
      pageSize: 1,
      sortType: 1,
    }).catch(() => ({ data: { waitDealTotal: 0 } })),
  ]);
  return {
    data: {
      data: {
        name: userRes.data?.data?.name ?? '',
        waitDealCount: listRes.data?.waitDealTotal ?? 0,
      },
    },
  };
};
