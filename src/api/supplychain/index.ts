/**
 * @file 供应链-供应商管理/商品管理
 * @author wangjiahui
 * */

import { request } from '../request';
import { BackendResponse } from '../types';
import { AddSupplyLink, InviteInfoData } from './type';

/** 接受邀请 */
export function ApiAccpetInvitation(params: {
  code: string;
  companyId?: number;
}) {
  return request<BackendResponse<AddSupplyLink>>({
    method: 'get',
    url: `/supply/code/relation`,
    params,
  });
}

/** 获取邀请信息 */

export function ApiInviteInfoGet(params: { invitationCodeId: string }) {
  return request<BackendResponse<InviteInfoData>>({
    method: 'get',
    url: `/supply/code/getById`,
    params,
  });
}
