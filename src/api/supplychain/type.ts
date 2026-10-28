/** 供应链-新增供应商 */
export interface AddSupplyLink {
  type: number;
  expire?: string;
  code?: string;
  companyId?: number;
  invitationCodeId: string;
}

/** 获取发起邀请人的信息 */
export interface InviteInfoData {
  invitationCodeId: number;
  code: string;
  companyId: number;
  invUserId: number;
  companyName: string;
}
