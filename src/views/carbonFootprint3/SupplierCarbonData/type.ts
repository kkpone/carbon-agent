import { ValueOf } from 'type-fest';

import { AUDIT_STATUS } from './constant';

export type SearchParams = {
  status?: number;
  companyName?: number;
};

export type AuditData = {
  id: number;
  // 供应商名称
  companyName: string;
  // 数据需求-功能描述
  demand: string;
  // 温室气体排放数据
  emissionDesc: string;
  // 状态 0未填报/1填报中/2待审核/3审核通过/4审核不通过
  status: ValueOf<typeof AUDIT_STATUS>;
  // 状态描述
  statusDesc: string;
  // 提交时间
  submitTime: string;
  // 审核人
  auditUser: string;
  // 审核时间
  auditTime: string;
  // 审核备注
  content: string;
};
