export type AuditListProps = {
  auditLists: AuditListData[];
  embedded?: boolean;
};

export type AuditListData = {
  id: number;
  productId: number;
  applyNum: string;
  /** 0 提交申请 1 撤销申请 2 审核通过 3 审核未通过 */
  actType: number;
  /** 审核动作 */
  actDesc: string;
  /** 审核信息 */
  comment: string;
  createBy: number;
  createTime: string;
  updateByName: string;
  delFlag: number;
  labelId: number;
  // 版本
  version?: number;
};
