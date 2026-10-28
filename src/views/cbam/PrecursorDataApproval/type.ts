import { SupplyAttribution } from '../PrecursorDataFill/type';

/** CBAM 前体数据审核提交参数 */
export type AuditListType = {
  /** 审核意见 */
  auditComment?: string;
  /** 审核数据 id */
  auditDataId?: number;
  /** 审核状态 */
  auditStatus?: 0 | 1 | 2 | 3 | 4;
};

export interface PrecursorDataApprovalListProps {
  /** applus审核状态。0 未审核；1 审核中；2 审核通过 */
  applusAuditStatus: number;
  /** 申请人联系方式 */
  applyMobile: string;
  /** 申请人 */
  applyRealName: string;
  /** 申请状态。0 未填报；1 填报中；2 已填报；3 待审批；4 审批通过；5 审批不通过；6 已撤回；7 已关闭(0:未填报; 1:填报中; 2:已填报; 3:待审批; 4:审批通过; 5:审批不通过; 6:已撤回; 7:已关闭),可用值:0,1,2,3,4,5,6,7 */
  applyStatus: number;
  /** 申请状态名称 */
  applyStatus_name: string;
  /** 申请时间 */
  applyTime: string;
  /** 审核时间 */
  auditTime: string;
  /** 客户公司id */
  companyId: number;
  /** 客户公司名称 */
  companyName: string;
  /** 来源国家转换值 */
  countryName: string;
  /** 来源国家枚举值 */
  countryValue: string;
  /** 创建者 */
  createBy: number;
  /** 创建时间 */
  createTime: string;
  /** 截止时间 */
  deadline: string;
  /** 标记删除。0 未删除 1 已删除 */
  deleted: boolean;
  /** 证据材料 */
  evidenceFile: string;
  /** id */
  id: number;
  /** 客户公司id */
  orgId: number;
  /** 前体名称 */
  precursorName: string;
  /** 前体id */
  productPrecursorId: number;
  /** 备注 */
  remark: string;
  /** 提交数据时间（获取时间） */
  submitTime: string;
  /** 供应商企业id */
  supplyCompanyId: number;
  /** 供应商所属组织 */
  supplyCompanyName: string;
  /** 供应商名称 */
  supplyName: string;
  /** 供应商主键id */
  supplyOrgId: number;
  /** 证明材料 */
  supportFile: string;
  /** 供应商企业唯一码 */
  uniqueCode: string;
  /** 更新者 */
  updateBy: number;
  /** 更新时间 */
  updateTime: string;
  userBtnFlag: boolean;
  auditDataId: number;
  unitName?: string;
  supplyAttributionList?: SupplyAttribution[];
}

export interface PrecursorDataApprovalListRequest {
  pageNum: number;
  pageSize: number;
  applyStatus: number;
  companyName: string;
  preName: string;
  supplyName: string;
  type: number;
}

/**
 * 审批流程
 */
export interface PrecursorAuditNodeResq {
  /**
   * 数据审批id
   */
  auditDataId?: number;
  /**
   * 审批组织id
   */
  auditOrgId?: number;
  /**
   * 审核状态。0 待审核；1 审核通过；2 审核不通过；3 已撤回；4 已作废(0:待审核; 1:审核通过; 2:审核不通过; 3:已撤回; 4:已作废),
   */
  auditStatus_name?: string;
  auditStatus?: number;
  /**
   * 审批内容（枚举）(1:企业碳核算排放数据审核; 3:供应链碳数据审核; 4:行业碳核算数据审核)
   */
  auditType?: number;
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 配置类型。1 按人员；2 按角色
   */
  configType?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 审批关联的数据
   */
  dataId?: string;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  id?: number;
  /**
   * 节点层级。从1开始
   */
  nodeLevel?: number;
  /**
   * 节点名称
   */
  nodeName?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 是否已审批节点或当前节点
   */
  passed?: boolean;
  /**
   * 审批配置id
   */
  sysAuditId?: number;
  /**
   * 角色id或用户ids。,分隔
   */
  targetIds?: number[];
  /**
   * 角色名或用户名
   */
  targetNames?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
}

/**
 * 审批记录
 */
export interface PrecursorAuditLogResq {
  /**
   * 审批人id
   */
  auditBy?: number;
  /**
   * 审批人手机号
   */
  auditByMobile?: string;
  /**
   * 审批人名称
   */
  auditByName?: string;
  /**
   * 审批意见
   */
  auditComment?: string;
  /**
   * 数据审批id
   */
  auditDataId?: number;
  /**
   * 审核状态。0 待审核；1 审核通过；2 审核不通过；3 已撤回；4 已作废
   */
  auditStatus?: 0 | 1 | 2 | 3 | 4;
  auditStatus_name?: string;
  /**
   * 审批时间
   */
  auditTime?: Date;
  /**
   * 审批内容（枚举）(1:企业碳核算排放数据审核; 3:供应链碳数据审核; 4:行业碳核算数据审核)
   */
  auditType?: 1 | 3 | 4;
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 审批关联的数据
   */
  dataId?: string;

  /**
   * id
   */
  id?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
}

export interface AuditRequest {
  /** 审核意见 */
  auditComment: number;
  /** 审核数据id */
  auditDataId: number;
  auditDataIdList?: number[];
  /** 审核结果 */
  auditStatus: number;
}

export interface AuditUserListResq {
  /**
   * 组织id
   */
  orgId: number;
  /**
   * 组织名称
   */
  orgName: string;
  /**
   * 姓名
   */
  realName: string;
  /**
   * 用户id
   */
  userId: number;
  /**
   * 用户名
   */
  userName: string;
}
