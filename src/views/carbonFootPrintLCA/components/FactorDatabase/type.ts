export interface FactorResp {
  /**
   * 评价指标数据
   */
  factorList?: IoFactor[];
  /**
   * 输入输出编码
   */
  ioCode?: string;
  ioData?: IoData;
  /**
   * 输入输出id
   */
  ioId?: number;
  /**
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  [property: string]: any;
}

/**
 * IoFactor
 */
export interface IoFactor {
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
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 数值
   */
  dataValue?: number;
  /**
   * id
   */
  id?: number;
  /**
   * 输入输出编码
   */
  ioCode?: string;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 单位
   */
  unit?: string;
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * IoData
 */
export interface IoData {
  /**
   * 活动名称
   */
  actName?: string;
  /**
   * 地理代表性code
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 地理代表性
   */
  areaRepresentName?: string;
  /**
   * 一级分类
   */
  category1?: string;
  /**
   * 一级分类
   */
  category1Name?: string;
  /**
   * 二级分类
   */
  category2?: string;
  /**
   * 二级分类
   */
  category2Name?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 数据库名称
   */
  dbName?: string;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 生产周期结束日
   */
  endTime?: Date;
  /**
   * 数据名称
   */
  factorName?: string;
  /**
   * 功能单位
   */
  funcUnit?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 输入输出编码
   */
  ioCode?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 模型所属组织
   */
  orgId?: number;
  /**
   * 产品编码
   */
  productCode?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 产品单位
   */
  productUnit?: string;
  /**
   * 产品单位
   */
  productUnitName?: string;
  /**
   * 发布年份
   */
  publishYear?: number;
  /**
   * 采购产品名称
   */
  purchaseProductName?: string;
  /**
   * 关联产品名称
   */
  relProductName?: string;
  /**
   * 生产周期起始日
   */
  startTime?: Date;
  /**
   * 供应商数据编码
   */
  supplierDataNo?: string;
  /**
   * 供应商功能单位
   */
  supplierFuncUnit?: string;
  /**
   * 供应商名称
   */
  supplierName?: string;
  /**
   * 时间代表性结束
   */
  timeRepresentEnd?: number;
  /**
   * 时间代表性开始
   */
  timeRepresentStart?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
