import { SideBarNode } from '../components/ProcessLeftMenu/type';

/**
 * 模型
 */
export interface ModelInfo {
  /**
   * 假设和限制
   */
  assumptionsAndConstraints?: string;
  /**
   * 每功能单位产品数量
   */
  baselineNum?: number;
  /**
   * 每功能单位产品数量单位
   */
  baselineUnit?: string;
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
  createTime?: any;
  /**
   * 截止规则
   */
  cutoffRule?: string;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 生产周期结束日
   */
  endTime?: any;
  /**
   * 预期用途
   */
  expectedUse?: string;
  /**
   * 工厂地址
   */
  factoryAddr?: string;
  /**
   * 工厂联系人姓名
   */
  factoryContactName?: string;
  /**
   * 功能单位
   */
  funcUnit?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 生命周期id列表。','分割
   */
  lifeCycleList?: string;
  /**
   * 制造商
   */
  manufacturer?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 所属组织
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
   * 产品工艺流程图
   */
  productFlowDiagram?: string;
  /**
   * 产品id
   */
  productId?: number;
  /**
   * 产品照片
   */
  productImg?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 产品产地code
   */
  productOrigin?: string;
  /**
   * 产品产地详细地址
   */
  productOriginDetail?: string;
  /**
   * 研究目标
   */
  researchTarget?: string;
  /**
   * 已选数据库。','分割
   */
  selectedDb?: string;
  /**
   * 生产周期起始日
   */
  startTime?: any;
  /**
   * 系统边界描述
   */
  systemBoundaryDesc?: string;
  /**
   * 系统边界图
   */
  systemBoundaryImg?: string;
  /**
   * 系统边界生命周期类型。1 半生命周期; 2 全生命周期; 3 自定义生命周期(1:半生命周期; 2:全生命周期; 3:自定义生命周期)
   */
  systemBoundaryType?: number;
  /**
   * 是否已配置研究对象
   */
  mainResearchObjectFlag?: boolean;
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

/**
 * 碳足迹模型列表搜索栏的类型
 */
export interface Request {
  /**
   * 模型名称
   */
  likeModeName?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 产品名称或编码
   */
  nameAndCode?: string;
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
  [property: string]: any;
}

/**
 * 数据授权请求参数
 */
export interface ModelAuthRequest {
  /**
   * 数据请求类型。1 仅结果；2 全部核算过程(1:仅结果; 2:全部核算过程)
   */
  applyType?: number;
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 供应商id
   */
  supplierId?: number;
  /**
   * 供应商唯一代码
   */
  uniqueCode?: string;
  [property: string]: any;
}

/**
 * 配置主要研究对象
 */
export interface SetMainResearchObjRequest {
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 过程名称
   */
  processName?: string;
  [property: string]: any;
}

/**
 * 清单分析左侧菜单数接口返回类型
 */
export interface ProcessTreeDataResp {
  /**
   * 每功能单位产品数量
   */
  baselineNum?: number;
  /**
   * 每功能单位产品数量单位
   */
  baselineUnit?: string;
  /**
   * 功能单位
   */
  funcUnit?: string;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 生命周期列表
   */
  stageList?: SideBarNode[];
  [property: string]: any;
}

/**
 * 清单分析手动计算
 */
export interface IoWarn {
  ioCode?: string;
  /**
   * null(1:基线值计算冲突; 1:质量平衡值计算冲突)
   */
  ioWarnType?: number;
  processCode?: string;
  [property: string]: any;
}

/**
 *  保存到库
 */
export interface SaveProcessToLibRequest {
  /**
   * 过程code
   */
  processCode?: string;
  /**
   * 过程库名称
   */
  processLibName?: string;
  /**
   * 保存过程集方式(1:截取上游过程集; 2:截取下游过程集; 3:截取单元过程)
   */
  processLibType?: number;
  [property: string]: any;
}

/**
 * 清单分析-过程描述
 */
export interface Process {
  /**
   * 地理代表性code
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 数据来源
   */
  dataSource?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 选择导入的产品生命周期数据
   */
  impProcessCode?: string;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 多输出分配方式。1 无；2 物理分配；3 经济分配；4 其他方法(1:无; 2:物理分配; 3:经济分配; 4:其他方法)
   */
  multiOutputType?: number;
  /**
   * 数据类型。1 实景数据; 2 背景数据(1:实景数据; 2:背景数据)
   */
  processDataType?: number;
  /**
   * 过程描述
   */
  processDesc?: string;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 支撑材料
   */
  supportFile?: string;
  /**
   * 报告是否披露
   */
  reportFlag?: boolean;
  /**
   * 系统边界
   */
  systemBoundary?: string;
  /**
   * 技术代表性
   */
  techRepresent?: string;
  /**
   * 时间代表性结束
   */
  timeRepresentEnd?: number;
  /**
   * 时间代表性开始
   */
  timeRepresentStart?: number;
  [property: string]: any;
}

/**
 * 清单分析-过程描述-删除过程
 */
export interface ProcessDeleteRequest {
  /**
   * id
   */
  id: number;
  /**
   * 批量删除idList
   */
  idList?: number[];
  [property: string]: any;
}

/**
 * 清单分析-过程结构图
 */
export interface StructureChartResp {
  /**
   * edges
   */
  edges?: Edge[];
  /**
   * nodes
   */
  nodes?: Node[];
  [property: string]: any;
}
/**
 * Edge
 */
export interface Edge {
  source?: SourceTarget;
  target?: SourceTarget;
  [property: string]: any;
}
/**
 * SourceTarget
 */
export interface SourceTarget {
  cell?: string;
  port?: string;
  [property: string]: any;
}
/**
 * Node
 */
export interface Node {
  id?: string;
  label?: string;
  /**
   * ports
   */
  ports?: Port[];
  [property: string]: any;
}
/**
 * Port
 */
export interface Port {
  attrs?: Atrr;
  group?: string;
  id?: string;
  [property: string]: any;
}
/**
 * Atrr
 */
export interface Atrr {
  label?: string;
  [property: string]: any;
}

/**
 * 过程管理-列表-请求传参
 */
export interface InputOutputRequest {
  /**
   * 过程code或输入输出code
   */
  code: string;
  /**
   * 链接类型（输入输出必传）。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子
   */
  linkType?: number;
  [property: string]: any;
}

/**
 * 过程管理-产品-编辑分配系数
 */
export interface AllocFactorRequest {
  /**
   * 分配系数
   */
  allocFactor?: number;
  /**
   * 输入输出编码
   */
  ioCode?: string;
  [property: string]: any;
}

/**
 * 过程管理-输入输出-编辑研究对象
 */
export interface ResearchObjectRequest {
  /**
   * 输入输出编码
   */
  ioCode?: string;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 输入-主产品；3 输入-副产品；4 输出-主产品；5 输出-副产品(0:-; 1:主要研究对象; 2:输入-主产品;
   * 3:输入-副产品; 4:输出-主产品; 5:输出-副产品)
   */
  researchObject?: number;
  [property: string]: any;
}

/**
 * 过程管理-新增/编辑输入输出-过程数据&模型引用
 */
export interface ProcessModelIORequest {
  /**
   * 单位换算比例
   */
  convertRatio?: number;
  /**
   * 数据类型: 1 原材料;2 耗材;3 包装材料;4 能耗;5 水耗;6 运输; 7 资本货物; 8 处置产品; 9 废气; 10 废水; 11 固体废弃物; 12 可再生输出物;
   * 13 待处理输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水; 11:固体废弃物;
   * 12:可再生输出物; 13:待处理输出物)
   */
  dataType?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * id
   */
  id?: number;
  /**
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子(1:过程数据; 2:模型引用; 3:数据库数据; 4:引用供应商结果数据;
   * 5:自建因子)
   */
  linkType?: number;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 过程code
   */
  processCode?: string;
  /**
   * 循环利用比例（可再生输出物必传）
   */
  recyclingRatio?: number;
  /**
   * 选择的输入输出编码（允许为空，不传则只保存上半部分）
   */
  selectIoCode?: string;
  /**
   * 选择的过程库id（过程库必传）
   */
  selectLibId?: number;
  /**
   * 选择的模型id（模型引用必传）
   */
  selectModelId?: number;
  /**
   * 支持材料
   */
  supportFile?: string;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}

/**
 * 过程管理-新增/编辑输入输出-过程数据&模型引用
 */
export interface ProcessFactorIORequest {
  /**
   * 地理代表性code
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 评价指标列表
   */
  assessmentList?: AssessmentDto[];
  /**
   * 单位换算比例
   */
  convertRatio?: number;
  /**
   * 数据类型: 1 原材料;2 耗材;3 包装材料;4 能耗;5 水耗;6 运输; 7 资本货物; 8 处置产品; 9 废气; 10 废水; 11 固体废弃物; 12 可再生输出物;
   * 13 待处理输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水; 11:固体废弃物;
   * 12:可再生输出物; 13:待处理输出物)
   */
  dataType?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * 折旧率（资本货物必传）
   */
  depreciationRate?: number;
  /**
   * 数据名称
   */
  factorName?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 输入输出名称
   */
  ioName?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子(1:过程数据; 2:模型引用; 3:数据库数据; 4:引用供应商结果数据;
   * 5:自建因子)
   */
  linkType?: number;
  /**
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 过程code
   */
  processCode?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 产品单位
   */
  productUnit?: string;
  /**
   * 循环利用比例（可再生输出物必传）
   */
  recyclingRatio?: number;
  /**
   * 支持材料
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
  [property: string]: any;
}

/**
 * AssessmentDto
 */
export interface AssessmentDto {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价指标
   */
  assessmentTarget?: string;
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
 * 过程管理-输入输出-详情
 */
export interface ProcessModelIORes {
  upOrDownDatabase?: {
    lcaFactorCategory?: string;
    lcaMaterial?: string;
  };
  multiMainIoCode?: string;
  supplierRef?: ApplyRefDto;
  upOrDownSupplier?: {
    /**
     * 单位换算比例
     */
    convertRatio?: number;
  };
  databaseData?: {
    /**
     * 单位换算比例
     */
    convertRatio?: number;
  };
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
   * 12:可再生输出物; 13:待处理输出物)
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
  factorList?: IoFactor[];
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
   * 模型id/过程库id
   */
  modelId?: number;
  /**
   * 过程code
   */
  processCode?: string;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 输入-主产品；3 输入-副产品；4 输出-主产品；5 输出-副产品(0:-; 1:主要研究对象; 2:输入-主产品;
   * 3:输入-副产品; 4:输出-主产品; 5:输出-副产品)
   */
  researchObject?: number;
  /**
   * 支撑材料
   */
  supportFile?: any;
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

/** 输入输出列表 */
export interface ChooseIOListRequest {
  /**
   * 输入输出类型。1 输入；2 输出
   */
  ioType?: number;
  /**
   * lifeCycleId
   */
  lifeCycleId?: number;
  /**
   * likeIoName
   */
  likeIoName?: string;
  /**
   * 模型id
   */
  modelId: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * unit
   */
  unit?: string;
  [property: string]: any;
}

/** 选择输入的搜索 */
export interface ChooseInputRequest {
  /**
   * 输入名称
   */
  inputName?: string;
  /**
   * 模型id
   */
  modelId: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 过程名称
   */
  processName?: string;
  [property: string]: any;
}

/**
 * 数据匹配请求
 */
export interface MatchDataRequest {
  /**
   * 具体材质
   */
  factorName?: string;
  /**
   * 数据分类
   */
  lcaFactorCategory?: string;
  /**
   * lcaMaterial
   */
  lcaMaterial?: string;
  /**
   * 模型已选数据库
   */
  selectedDb: string;
  [property: string]: any;
}

/**
 * 数据匹配返回
 */
export interface MatchDataResp {
  /**
   * 活动及产品UUID
   */
  activityUuid?: string;
  /**
   * 地理位置
   */
  area?: string;
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
   * 活动名称
   */
  factorName?: string;
  /**
   * id
   */
  id?: number;
  /**
   * LCA数据库id
   */
  lcaDbId?: number;
  /**
   * 数据分类
   */
  lcaFactorCategory?: string;
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
   * 适用场景
   */
  scene?: string;
  /**
   * 来源文件名称
   */
  source?: string;
  /**
   * 源语言。字典值
   */
  sourceLanguage?: string;
  /**
   * 0 启用 1 禁用(0:启用; 1:禁用)
   */
  status?: number;
  /**
   * 技术代表性
   */
  techRepresent?: string;
  /**
   * 时间周期结束
   */
  timeRepresentEnd?: number;
  /**
   * 时间周期开始
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
   * 网址/文献
   */
  url?: string;
  /**
   * 发布年份
   */
  year?: string;
  [property: string]: any;
}

/**
 * 影响评价方案列表
 */
export interface ImpactAssessmentListResp {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价方法
   */
  assessmentMethodName?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 方案名称
   */
  planName?: string;
  /**
   * 方案状态。0 待计算；1 计算中；2 计算完成(0:待计算; 1:计算中; 2:计算完成)
   */
  planStatus?: number;
  /**
   * 评价指标。|分割
   */
  assessmentTargetList?: string;
  [property: string]: any;
}

/**
 * 影响评价方案详情
 */
export interface ImpactAssessmentPlanRequest {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价指标列表
   */
  assessmentTargetList?: string[];
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 方案名称
   */
  planName?: string;
  [property: string]: any;
}

/**
 * 影响评价方案-删除
 */
export interface ImpactAssessmentPlanDeleteRequest {
  /**
   * id
   */
  id: number;
  /**
   * 批量删除idList
   */
  idList?: number[];
  [property: string]: any;
}

/**
 * 整体影响评价结果
 */
export interface AssessmentDataResp {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
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
   * 生命周期阶段
   */
  lifeCycle?: string;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 百分比
   */
  ratio?: string;
  /**
   * 总计
   */
  total?: number;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}

/**
 * 计算信息
 */
export interface CalculateInfoResp {
  /**
   * 是否计算中
   */
  calculating?: boolean;
  /**
   * 是否有错误
   */
  errorFlag?: boolean;
  /**
   * 	模型id
   */
  modelId?: boolean;
}

/**
 * 生命周期影响评价返回数据
 */
export interface ImpactAssessmentResp {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
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
   * 生命周期阶段
   */
  lifeCycle?: string;
  /**
   * 生命周期阶段id
   */
  lifeCycleId?: number;
  /**
   * 百分比
   */
  ratio?: string;
  /**
   * 总计
   */
  total?: number;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}

/**
 * 旭日图返回
 */
export interface SunburstDto {
  /**
   * children
   */
  children?: SunburstDto[];
  /**
   * code
   */
  code?: string;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * name
   */
  name?: string;
  /**
   * 百分比(0-100)
   */
  ratio?: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * value
   */
  value?: number;
  [property: string]: any;
}

/**
 * 影响评价
 */
export interface StageImpactAssessment {
  /**
   * 名称
   */
  name?: string;
  /**
   * 百分比
   */
  percentage?: string;
  /**
   * 数值
   */
  value?: number;
  [property: string]: any;
}

/**
 * 贡献度分析
 */
export interface ContributionAnalysisNode {
  /**
   * 子节点
   */
  children?: ContributionAnalysisNode[];
  /**
   * 名称
   */
  name?: string;
  /**
   * 指标值列表
   */
  valueList?: ContributionValueDto[];
  [property: string]: any;
}
/**
 * 贡献度分析指标值列表
 */
export interface ContributionValueDto {
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
   * 比例(0-100)
   */
  ratio?: number;
  /**
   * 单位
   */
  unit?: string;
  [property: string]: any;
}

export interface OptionsType {
  label?: string;
  value?: number | string;
  unit?: string;
}

/**
 * 字典枚举列表-请求
 */
export interface DictEnumListRequest {
  /**
   * 枚举值名称
   */
  dictLabel?: string;
  /**
   * 字典类型
   */
  dictType: string;
  /**
   * 枚举值标识
   */
  dictValue?: string;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 所属分类
   */
  sourceType?: string;
  [property: string]: any;
}

/**
 * 字典枚举列表
 */
export interface DictEnumResp {
  /**
   * 字典标签
   */
  dictLabel?: string;
  /**
   * 字典排序
   */
  dictSort?: number;
  /**
   * 字典类型
   */
  dictType?: string;
  /**
   * 字典键值
   */
  dictValue?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 关联值
   */
  relatedValue?: string;
  /**
   * 所属分类
   */
  sourceType?: string;
  /**
   * 所属分类名称
   */
  sourceTypeName?: string;
  [property: string]: any;
}

/**
 * 敏感性分析列表请求
 */
export interface SensibilityAnalysisListRequest {
  /**
   * 方案id
   */
  assessmentId: number;
  /**
   * 评价指标
   */
  assessmentTarget: string;
  [property: string]: any;
}

/**
 * 敏感性分析列表请求返回
 */
export interface SensibilityAnalysisListResp {
  /**
   * 数值
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
   * 过程名称
   */
  processName?: string;
  [property: string]: any;
}

/**
 * 不确定分析-计算请求
 */
export interface UncertaintyAnalysisCalcRequest {
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 执行次数
   */
  countNum?: number;
  [property: string]: any;
}

/**
 * 不确定分析-计算进度
 */
export interface UncertaintyProgressCalcResp {
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 执行次数
   */
  countNum?: number;
  /**
   * 当前次数
   */
  currNum?: number;
  [property: string]: any;
}

/**
 * 不确定分析-柱状图
 */
export interface AssessmentUncertaintyHistogramResp {
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 评价指标
   */
  assessmentTarget?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 结束值[
   */
  endValue?: number;
  /**
   * id
   */
  id?: number;
  /**
   * 等级。1-50
   */
  level?: number;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 概率（0-100）
   */
  probability?: number;
  /**
   * 开始值[
   */
  startValue?: number;
  /**
   * 次数
   */
  statistics?: number;
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * 不确定分析-列表返回
 */
export interface AssessmentUncertaintyListResp {
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 评价指标
   */
  assessmentTarget?: string;
  /**
   * 评价指标
   */
  assessmentTargetName?: string;
  /**
   * 平均值
   */
  avgValue?: number;
  /**
   * 变化
   */
  changeValue?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标准偏差
   */
  deviationValue?: number;
  /**
   * 2.5%下限
   */
  floorValue?: number;
  /**
   * id
   */
  id?: number;
  /**
   * 最大值
   */
  maxValue?: number;
  /**
   * 中间值
   */
  medianValue?: number;
  /**
   * 最小值
   */
  minValue?: number;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 总数
   */
  total?: number;
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  updateTime?: Date;
  /**
   * 97.5%上限
   */
  upperValue?: number;
  /**
   * 模型版本号
   */
  version?: number;
  [property: string]: any;
}

/**
 * AssessmentVersionResp
 */
export interface AssessmentVersionResp {
  /**
   * 方案id
   */
  assessmentId?: number;
  /**
   * 影响评价版本是否最新
   */
  assessmentLatest?: boolean;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 敏感性版本是否最新
   */
  sensibilityLatest?: boolean;
  /**
   * 不确定性分析版本是否最新
   */
  uncertaintyLatest?: boolean;
  [property: string]: any;
}

/**
 * 数据质量评价请求
 */
export interface DataQualityRequest {
  /**
   * 方案id
   */
  assessmentId: number;
  /**
   * 评价指标
   */
  assessmentTarget: string;
  /**
   * 数据质量类别。1 欧盟电池法；2 欧盟PEF,
   */
  dataQualityCategory: number;
}

/**
 * 数据质量评价
 */
export interface AssessmentDataQualityResp {
  /**
   * 贡献度
   */
  contribution: number;
  /**
   * 数据质量层级。1 总值；1 过程；2 输入输出(1:总值; 2:过程; 3:输入输出),可用值:1,2,3
   */
  dataQualityClass: number;
  /**
   * 数据质量评级
   */
  dqr: number;
  /**
   * GeR
   */
  ger: number;
  /**
   * 地理代表性描述
   */
  gerDesc: string;
  /**
   * P
   */
  pre: number;
  /**
   * 数据准确性描述
   */
  preDesc: string;
  /**
   * 数据类型。1 实景数据; 2 背景数据(1:实景数据; 2:背景数据),
   */
  processDataType: number;
  /**
   * 数据源编码
   */
  sourceCode: string;
  /**
   * 过程名称
   */
  sourceName: string;
  /**
   * TeR
   */
  ter: number;
  /**
   * 技术代表性描述
   */
  terDesc: string;
  /**
   * TiR
   */
  tir: number;
  /**
   * 时间代表性描述
   */
  tirDesc: string;
  /** 输入输出 */
  ioList?: AssessmentDataQualityResp[];
}

/**
 * 数据质量评价评级详情请求
 */
export interface DataQualityRateDetailRequest {
  /** 方案id */
  assessmentId?: number;
  /** 评价指标 */
  assessmentTarget?: string;
  /** 数据质量类别。1 欧盟电池法；2 欧盟PEF */
  dataQualityCategory: number;
  /** 数据质量层级 1 总值；2 过程；3 输入输出 */
  dataQualityClass?: number;
  /** 数据质量指标。1 时间代表性；2 地理代表性；3 技术代表性；4 数据准确性 */
  qualityTarget?: number;
  /** sourceCode */
  sourceCode?: string;
}

/**
 * 数据质量评价评级详情
 */
export interface DataQualityRateDetailResq {
  /**
   * 方案id*/
  assessmentId?: number;
  /** 评价指标 */
  assessmentTarget?: string;
  /** 数据质量类别。1 欧盟电池法；2 欧盟PEF */
  dataQualityCategory?: number;
  /** 数据质量层级 1 总值；2 过程；3 输入输出 */
  dataQualityClass?: number;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子
   */
  linkType?: number;
  /**
   * 数据类型。1 实景数据; 2 背景数据
   */
  processDataType?: number;
  /**
   * 数据质量等级。1 非常好；2 好；3 一般；4 劣质；5 非常劣质
   */
  qualityLevel?: number;
  /**
   * 数据质量指标。1 时间代表性；2 地理代表性；3 技术代表性；4 数据准确性
   */
  qualityTarget?: number;
  /**
   * 数据源编码
   */
  sourceCode?: string;
  /**
   * 过程名称
   */
  sourceName?: string;
  /**
   * value1
   */
  value1?: string;
  /**
   * value2
   */
  value2?: string;
}

/**
 * 数据质量平衡计算进度信息
 */
export interface AssessmentDataQualityProgressResp {
  /**
   * 是否计算中
   */
  calculating: boolean;
  /**
   * 是否有错误
   */
  errorFlag: boolean;
  /**
   * 模型id
   */
  modelId: number;
}
