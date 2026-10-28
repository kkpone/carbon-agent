/**
 * 选择供应商结果列表的请求参数
 */
export interface SupplyRequest {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 供应商数据编码
   */
  dataCode?: string;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  [property: string]: any;
}

/**
 * ApplyRefDto
 */
export interface ApplyRefDto {
  /**
   * applyInfoId
   */
  applyInfoId?: number;
  /**
   * 数据请求类型。1 仅结果；2 全部核算过程(1:仅结果; 2:全部核算过程)
   */
  applyType?: number;
  /**
   * 快照的方案id。未选择为0
   */
  assessmentId?: number;
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价方法
   */
  assessmentMethodName?: string;
  /**
   * 评价指标。|分割
   */
  assessmentTargetList?: string;
  /**
   * 评价指标
   */
  assessmentTargetNames?: string;
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 供应商数据编码
   */
  dataCode?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 采购产品id
   */
  productId?: number;
  /**
   * 采购产品名称
   */
  productName?: string;
  /**
   * 结果数据
   */
  resultList?: FactorDto[];
  /**
   * 供应商id
   */
  supplierId?: number;
  /**
   * 供应商名称
   */
  supplierName?: string;
  /**
   * 供应商唯一代码
   */
  uniqueCode?: string;
  [property: string]: any;
}

/**
 * FactorDto
 */
export interface FactorDto {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价方法
   */
  assessmentMethodName?: string;
  /**
   * 评价指标
   */
  assessmentTarget?: string;
  /**
   * 评价指标
   */
  assessmentTargetName?: string;
  /**
   * 数值
   */
  dataValue?: number;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}
