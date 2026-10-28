/**
 * 选择模型的请求参数
 */
export interface ChooseModelRequest {
  /**
   * 模型名称
   */
  likeModeName?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 当前模型id
   */
  modelId?: number;
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

export interface ChooseModel {
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
   * 每功能单位产品数量单位
   */
  baselineUnitName?: string;
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
  endTime?: Date;
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
   * 是否已配置主要研究对象
   */
  mainResearchObjectFlag?: boolean;
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
   * 模型类型。0 自建；1 过程库(0:自建; 1:过程库)
   */
  modelType?: number;
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
  startTime?: Date;
  /**
   * 供应商名称
   */
  supplierName?: string;
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
   * 版本
   */
  version?: number;
  [property: string]: any;
}
