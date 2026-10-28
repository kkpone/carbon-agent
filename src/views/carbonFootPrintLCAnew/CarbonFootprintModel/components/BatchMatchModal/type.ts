/**
 * 背景数据列表的请求参数
 */
export interface IOFactorRequest {
  /**
   * 生命周期阶段
   */
  lifeCycleId?: number;
  /**
   * io名称
   */
  likeIoName?: string;
  /**
   * 过程名称
   */
  likeProcessName?: string;
  /**
   * 模型id
   */
  modelId: number;
  [property: string]: any;
}

/**
 * IOFactorResp
 */
export interface IOFactorResp {
  /**
   * 分配系数
   */
  allocFactor?: number;
  /**
   * 地理代表性code
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 平衡值
   */
  balanceValue?: number;
  /**
   * 基线值
   */
  baselineValue?: number;
  /**
   * 单位换算比例
   */
  convertRatio?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 数据类型。1 原材料；2 耗材；3 包装材料；4 能耗；5 水耗；6 运输；7 资本货物；8 处置产品；9 废气；10 废水；11 固体废弃物；12 可再生输出物；13
   * 待处理输出物；14 有价值的输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水;
   * 11:固体废弃物; 12:内循环输出物; 13:待处理输出物; 14:有价值的输出物)
   */
  dataType?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 折旧率
   */
  depreciationRate?: number;
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
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 输入输出名称en
   */
  ioNameEn?: string;
  /**
   * 输入输出名称（全语言）
   */
  ioNameFull?: string;
  /**
   * 输入输出名称zh
   */
  ioNameZh?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * 生命周期阶段
   */
  lifeCycle?: string;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 生命周期阶段
   */
  lifeCycleName?: string;
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
   * 过程描述
   */
  processDesc?: string;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 引用的id。过程库id、模型id、lca数据库id、applyInfoId
   */
  refId?: number;
  /**
   * 可再生输出物关联io
   */
  renewingIoCode?: string;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 主产品；3 副产品(0:-; 1:主要研究对象; 2:主产品; 3:副产品)
   */
  researchObject?: number;
  /**
   * 支撑材料
   */
  supportFile?: string;
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
   * 具体材质
   */
  lcaMaterial?: string;
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
 * 背景数据匹配的请求参数
 */
export interface IoFactorMatchRequest {
  /**
   * 批量idList
   */
  idList?: number[];
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 标签集列表
   */
  tagSetList?: string[];
  [property: string]: any;
}

/**
 * IoFactorMatchResp
 */
export interface IoFactorMatchResp {
  /**
   * 因子名称
   */
  factorName?: string;
  /**
   * 数据id
   */
  id?: number;
  /**
   * 标签名称
   */
  tagName?: string;
  [property: string]: any;
}
