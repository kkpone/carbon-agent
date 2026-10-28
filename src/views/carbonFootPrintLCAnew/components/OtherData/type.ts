/**
 * FactorDataResp
 */
export interface FactorDataResp {
  /**
   * 分配系数
   */
  allocFactor?: number;
  /**
   * 基线值
   */
  baselineValue?: number;
  /**
   * 单位换算比例
   */
  convertRatio?: number;
  createBy?: number;
  createTime?: Date;
  /**
   * 数据类型: 1 原材料;2 耗材;3 包装材料;4 能耗;5 水耗;6 运输; 7 资本货物; 8 处置产品; 9 废气; 10 废水; 11 固体废弃物; 12 可再生输出物;
   * 13 待处理输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水; 11:固体废弃物;
   * 12:可再生输出物; 13:待处理输出物; 14:有价值的输出物)
   */
  dataType?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * 折旧率
   */
  depreciationRate?: number;
  /**
   * 评价指标列表
   */
  factorList?: FactorDto[];
  /**
   * id
   */
  id?: number;
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
  linkIo?: LinkIoResp;
  /**
   * 链接输入输出code
   */
  linkIoCode?: string;
  /**
   * 链接过程code
   */
  linkProcessCode?: string;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子(1:过程数据; 2:模型引用; 3:数据库数据; 4:引用供应商结果数据;
   * 5:自建因子)
   */
  linkType?: number;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 过程code
   */
  processCode?: string;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 主产品；3 副产品(0:-; 1:主要研究对象; 2:主产品; 3:副产品)
   */
  researchObject?: number;
  supplierRef?: ApplyRefDto;
  /**
   * 支撑材料
   */
  supportFile?: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 单位
   */
  unitName?: string;
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  updateTime?: Date;
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

/**
 * FactorDto
 */
export interface FactorDtoOther {
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
  dataValue?: string;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}

/**
 * IoData
 */
export interface IoData {
  /**
   * 供应商数据id
   */
  applyInfoId?: number;
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
   * 数据库数据分类
   */
  lcaFactorCategory?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 模型id
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
   * 产品单位
   */
  productUnit?: string;
  /**
   * 产品单位
   */
  productUnitName?: string;
  /**
   * 生产周期起始日
   */
  startTime?: Date;
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
  /**
   * 发布年份
   */
  year?: string;
  [property: string]: any;
}

/**
 * LinkIoResp
 */
export interface LinkIoResp {
  /**
   * 地理代表性code
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 基线值
   */
  baselineValue?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * 输入输出编码
   */
  ioCode?: string;
  /**
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 生命周期阶段
   */
  lifeCycle?: string;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 过程编码
   */
  processCode?: string;
  /**
   * 过程描述
   */
  processDesc?: string;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 质量平衡值
   */
  qualityValue?: number;
  /**
   * 时间代表性结束
   */
  timeRepresentEnd?: number;
  /**
   * 时间代表性开始
   */
  timeRepresentStart?: number;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 单位
   */
  unitName?: string;
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
  dataCode?: string | number;
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
   * 核算单位
   */
  productUnit?: string;
  /**
   * 核算单位
   */
  productUnitName?: string;
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
