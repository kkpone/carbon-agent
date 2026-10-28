export interface LifeCycleDataRequest {
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 产品id
   */
  productId?: number;
  /**
   * 过程名称
   */
  likeProcessName?: string;
}
export interface LifeCycleDataResponse {
  /**
   * 序号
   */
  allIndex: number;
  /**
   * 分配依据
   */
  allocBase: string;
  /**
   * 分配比例
   */
  allocFactor: number;
  /**
   * 分配方法
   */
  allocMethod: string;
  /**
   * 地理代表性
   */
  areaRepresent: string;
  /**
   * 过程code
   */
  processCode: string;
  /**
   * 公司id
   */
  companyId: number;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 数据类型。1 原材料；2 耗材；3 包装材料；4 能耗；5 水耗；6 运输；7 资本货物；8 处置产品；9 废气；10 废水；11 固体废弃物；12 可再生输出物；13 待处理输出物；14 有价值的输出物
   */
  dataType: number;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted: boolean;
  /**
   * 目的地
   */
  destinationCity: string;
  /**
   * 处置方式
   */
  disposalMethod: string;
  /**
   * 错误信息
   */
  errMsg: string;
  /**
   * id
   */
  id: number;
  /**
   * 生命周期数据导入表类型。0 过程；1 产品名称；2 材料输入；3 运输输入；4 能源和水输入；5 废水输出；6 固体废弃物输出
   */
  impProcessType: number;
  /**
   * 输入输出类型。1 输入；2 输出
   */
  ioType: number;
  /**
   * io单位
   */
  ioUnit: string;
  /**
   * 值
   */
  ioValue: string;
  /**
   * 起始地
   */
  originCity: string;
  /**
   * 过程描述
   */
  processDesc: string;
  /**
   * 过程名称
   */
  processName: string;
  /**
   * 产品id
   */
  productId: number;
  /**
   * 备注
   */
  remark: string;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 主产品；3 副产品
   */
  researchObject: number;
  /**
   * 技术代表性
   */
  techRepresent: string;
  /**
   * 时间代表性
   */
  timeRepresent: string;
  /**
   * 运输距离
   */
  transDistance: string;
  /**
   * 运输方式
   */
  transMethod: string;
  /**
   * 运输工具
   */
  transVehicle: string;
  /**
   * 更新者
   */
  updateBy: number;
  /**
   * 更新时间
   */
  updateTime: string;
  /**
   * 更新人名称
   */
  updateByName: string;
}

export interface LifeCycleDataImportRequest {
  /**
   * 文件名
   */
  fileName: string;
  /**
   * 文件url
   */
  fileUrl: string;
  /**
   * 产品id
   */
  productId: number;
}
