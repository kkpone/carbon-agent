import { CARBON_DATA_STATUS } from '../../constant';

export type AuditRecord = {
  // 审核结果
  result:
    | typeof CARBON_DATA_STATUS.APPROVED
    | typeof CARBON_DATA_STATUS.DISAPPROVED;
  // 审核结果描述
  resultDesc: string;
  // 审核人
  createBy: string;
  // 审核时间
  createTime: string;
  // 审核备注
  content: string;
};
