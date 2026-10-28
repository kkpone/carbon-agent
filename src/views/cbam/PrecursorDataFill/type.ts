export interface PrecursorDataFillListResq {
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
  unitName: string;
}

export interface PrecursorDataFillListRequest {
  pageNum: number;
  pageSize: number;
  applyStatus: number;
  companyName: string;
  preName: string;
  supplyName: string;
  type: number;
}

export interface PrecursorDataFillFeedBackResq {
  /**
   * 审核状态。0 待审核 1 审核通过 2 审核不通过
   */
  approvalStatus: number;
  approvalStatus_name: string;
  /**
   * 审批人id
   */
  auditBy: number;
  /**
   * 审批人联系方式
   */
  auditByMobile: string;
  /**
   * 审批人姓名
   */
  auditByName: string;
  /**
   * 审批意见
   */
  auditComment: string;
  /**
   * 审批时间
   */
  auditTime: string;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * id
   */
  id: number;
  /**
   * 供应商数据id
   */
  supplyInfoId: number;
  /**
   * 更新者
   */
  updateBy: number;
  /**
   * 更新时间
   */
  updateTime: string;
}

/**
 * 数据填报详情
 */
export interface PrecursorDataFillResp {
  /**
   * 申请状态。0 未填报；1 填报中；2 已填报；3 待审批；4 审批通过；5 审批不通过；6 已撤回；7 已关闭(0:未填报; 1:填报中; 2:已填报; 3:待审批;
   * 4:审批通过; 5:审批不通过; 6:已撤回; 7:已关闭)
   */
  applyStatus?: number;
  cnCode?: string;
  defaultCnId?: number;
  cnName?: string;
  /**
   * 来源国家枚举值
   */
  countryValue?: string;
  countryValueName?: string;
  /**
   * 证据材料
   */
  evidenceFile?: any;
  supplyAttributionList?: SupplyAttribution[];
  /**
   * 填报数据id
   */
  supplyInfoId?: number;
  [property: string]: any;
}

/**
 * SupplyAttribution，工序归因排放量
 */
export interface SupplyAttribution {
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 电力排放系数来源字典标识
   */
  eleSource?: string;
  /**
   * 元素枚举:1直接排放;2热力的输入输出;3尾气/隐含排放;4电力使用;5电力输出/电力排放系数,10/non
   */
  emissionElement?: number;
  /**
   * 来源枚举
   */
  emissionSource?: number;
  id?: number;
  /**
   * 输入/使用排放系数;前驱的电力使用
   */
  inputFactor?: number;
  /**
   * 热力/尾气/电力输入;前驱的间接排放
   */
  inputPower?: number;
  /**
   * 输出/回收排放系数;电力排放系数
   */
  outFactor?: number;
  /**
   * 热力/尾气/电力输出 直接排放量;前驱的直接排放
   */
  outPower?: number;
  /**
   * 供应商数据id
   */
  supplyInfoId?: number;
  /**
   * 更新人
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
