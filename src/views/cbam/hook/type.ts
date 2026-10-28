/**
 * CbamEnumResp
 */
export interface CbamEnumResp {
  code?: number | string;
  name?: string;
  score?: string;
  subList?: CbamEnumResp[];
}

/**
 * cbam报表-工业过程-自厂工序信息表-上级工序列表请求
 */
export interface PreProcessRequest {
  /**
   * cbamId
   */
  cbamId?: number;
  /**
   * id
   */
  id?: number;
  [property: string]: any;
}

/**
 * cbam报表-工业过程-自厂工序信息表-外购前体列表请求
 */
export interface PrePrecursorRequest {
  /**
   * cbamId
   */
  cbamId?: number;
  [property: string]: any;
}

/**
 * 参数配置返回类型
 */
export interface ParameterResp {
  /**
   * 产品分类名称
   */
  categoryName?: string;
  /**
   * 删除的集合
   */
  cbamDelDTOList?: CbamDelDTO[];
  defaultCnList?: DefaultCn[];
  defaultPrecursorList?: DefaultPrecursor[];
  defaultProcessList?: DefaultProcess[];
  defaultProductList?: DefaultProduct[];
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 是否包含间接排放:1是;2否(0:无; 1:是; 2:否)
   */
  isExists?: number;
  unit?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * CbamDelDTO
 */
export interface CbamDelDTO {
  /**
   * null(1:生产工序; 2:相关前驱体; 3:包含产品; 4:cn编码)
   */
  cbamDel?: number;
  id?: number;
  [property: string]: any;
}

/**
 * DefaultCn，产品分类默认cn编码和名称
 */
export interface DefaultCn {
  /**
   * cn编码
   */
  defaultCode?: string;
  /**
   * cn名称
   */
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultPrecursor，产品分类默认前驱
 */
export interface DefaultPrecursor {
  /**
   * 前驱名称
   */
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultProcess，产品分类默认生产工序
 */
export interface DefaultProcess {
  /**
   * 生产工序名称
   */
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultProduct，产品分类包含产品
 */
export interface DefaultProduct {
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/** 参数配置列表请求参数类型 */
export interface ParameterRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  [property: string]: any;
}

/** 参数配置-包含产品列表请求参数类型 */
export interface ParameterIncludeProductRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 供应商列表请求参数
 */
export interface SupplierListRequest {
  /**
   * 供应商编码
   */
  likeSupplierCode?: string;
  /**
   * 供应商名称
   */
  likeSupplierName?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 供应商状态。0 未提交；1 启用；2 禁用；3 审核中；4 审核不通过
   */
  supplierStatus?: number;
  /**
   * 商户类型。0 供应商；1 客户
   */
  supplierType?: number;
  [property: string]: any;
}

/**
 * 供应商列表返回
 */
export interface SupplierResp {
  /**
   * 负责人账号
   */
  adminUsername?: string;
  /**
   * 登录代码
   */
  companyCode?: string;
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 联系人邮箱
   */
  contactEmail?: string;
  /**
   * 联系人电话
   */
  contactMobile?: string;
  /**
   * 联系人
   */
  contactName?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * id
   */
  id?: number;
  /**
   * 最近申请企业碳核算时间 & 最近申请产品碳足迹时间
   */
  lastApplyTime?: Date;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 供应商编码
   */
  supplierCode?: string;
  /**
   * 供应商名称
   */
  supplierName?: string;
  /**
   * 供应商状态。0 未提交；1 启用；2 禁用；3 审核中；4 审核不通过(0:未提交; 1:启用; 2:禁用; 3:审核中; 4:审核不通过)
   */
  supplierStatus?: number;
  /**
   * 供应商类型。0 供应商；1 客户(0:供应商; 1:客户)
   */
  supplierType?: number;
  /**
   * 企业唯一代码
   */
  uniqueCode?: string;
  /**
   * 单位产品排放量（kgCO2e/核算单位）
   */
  unitDischarge?: string;
  /**
   * 单价（元）
   */
  unitPrice?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新者名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 统一社会信用代码
   */
  uscc?: string;
  [property: string]: any;
}
