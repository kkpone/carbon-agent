/**
 * 产品信息
 */
export interface Product {
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
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 产品描述
   */
  description?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 物料号
   */
  materialNo?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 产品编码
   */
  productCode?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 来源系统(1:手动填报)
   */
  sourceSystem?: number;
  /**
   * 规格/型号
   */
  specification?: string;
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
  [property: string]: any;
}

/** 产品信息列表搜索栏部分类型 */
export interface Request {
  /**
   * 物料号
   */
  materialNo?: string;
  /**
   * 产品名称或编码
   */
  nameAndCode?: string;
  /**
   * 组织
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
   * 来源系统。1 手动填报
   */
  sourceSystem?: number;
  [property: string]: any;
}
