/**
 * 选择供应商CBAM数据请求参数
 */
export interface ChooseSupplyCbamRequest {
  /**
   * applus审核状态。0 未审核；1 审核中；2 审核通过
   */
  applusAuditStatus?: number;
  /**
   * 申请人联系方式
   */
  applyMobile?: string;
  /**
   * 申请人
   */
  applyRealName?: string;
  /**
   * 申请状态。0 未填报；1 填报中；2 已填报；3 待审批；4 审批通过；5 审批不通过；6 已撤回；7 已关闭
   */
  applyStatus?: number;
  /**
   * 申请时间
   */
  applyTime?: Date;
  /**
   * 审核时间
   */
  auditTime?: Date;
  /**
   * 客户公司id
   */
  companyId?: number;
  /**
   * 来源国家枚举值
   */
  countryinfoValue?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 截止日期
   */
  deadline?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 证据材料
   */
  evidenceFile?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 客户公司id
   */
  orgId?: number;
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * 前体名称
   */
  precursorName?: string;
  /**
   * 前体id
   */
  productPrecursorId?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 提交数据时间（获取时间）
   */
  submitTime?: Date;
  /**
   * 供应商企业id
   */
  supplyCompanyId?: string;
  /**
   * 供应商组织id
   */
  supplyOrgId?: string;
  /**
   * 证明材料
   */
  supportFile?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
/**
 * 选择供应商CBAM数据返回
 */
export interface SupplyInfo {
  /**
   * applus审核状态。0 未审核；1 审核中；2 审核通过
   */
  applusAuditStatus?: number;
  /**
   * 申请人联系方式
   */
  applyMobile?: string;
  /**
   * 申请人
   */
  applyRealName?: string;
  /**
   * 申请状态。0 未填报；1 填报中；2 已填报；3 待审批；4 审批通过；5 审批不通过；6 已撤回；7 已关闭
   */
  applyStatus?: number;
  /**
   * 申请时间
   */
  applyTime?: Date;
  /**
   * 审核时间
   */
  auditTime?: Date;
  /**
   * 客户公司id
   */
  companyId?: number;
  /**
   * 来源国家枚举值
   */
  countryinfoValue?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 截止日期
   */
  deadline?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 证据材料
   */
  evidenceFile?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 客户公司id
   */
  orgId?: number;
  /**
   * 前体名称
   */
  precursorName?: string;
  /**
   * 前体id
   */
  productPrecursorId?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 提交数据时间（获取时间）
   */
  submitTime?: Date;
  /**
   * 供应商企业id
   */
  supplyCompanyId?: string;
  /**
   * 供应商组织id
   */
  supplyOrgId?: string;
  /**
   * 证明材料
   */
  supportFile?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
