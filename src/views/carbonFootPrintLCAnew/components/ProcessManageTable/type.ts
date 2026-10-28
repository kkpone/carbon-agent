/**
 * 过程管理-输入、输出、研究对象
 */
export interface InputOutput {
  /**
   * 输入列表
   */
  inputList?: IoDto[];
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 输出列表
   */
  outputList?: IoDto[];
  /**
   * 过程编码
   */
  processCode?: string;
  /**
   * 过程id
   */
  processId?: number;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 研究对象列表
   */
  researchObjectList?: IoDto[];
  /**
   * 支撑材料
   */
  supportFile?: string;
  /**
   * 系统边界
   */
  systemBoundary?: string;
  [property: string]: any;
}

/**
 * IoDto
 */
export interface IoDto {
  /**
   * 分配系数
   */
  allocFactor?: number;
  /**
   * 平衡值
   */
  balanceValue?: number;
  /**
   * 基线值
   */
  baselineValue?: number;
  /**
   * 数据类型: 1 原材料;2 耗材;3 包装材料;4 能耗;5 水耗;6 运输; 7 资本货物; 8 处置产品; 9 废气; 10 废水; 11 固体废弃物; 12 可再生输出物;
   * 13 待处理输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水; 11:固体废弃物;
   * 12:内循环输出物; 13:待处理输出物; 14:有价值的输出物)
   */
  dataType?: number;
  /**
   * 数量
   */
  dataValue?: number;
  /**
   * 禁止编辑
   */
  forbidEdit?: boolean;
  /**
   * 输入输出编码
   */
  ioCode?: string;
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
  /**
   * 上下游数据code
   */
  linkCode?: string;
  /**
   * 上下游关联输入输出名称
   */
  linkIoName?: string;
  /**
   * 上下游数据名称
   */
  linkName?: string;
  /**
   * 链接类型。1 过程数据；2 模型引用；3 数据库数据；4 引用供应商结果数据；5 自建因子(1:过程数据; 2:模型引用; 3:数据库数据; 4:引用供应商结果数据;
   * 5:自建因子)
   */
  linkType?: number;
  /**
   * 输出类型。1 普通输出；2 多重引用主输出；3 多重引用子输出(1:普通输出; 2:多重引用主输出; 3:多重引用子输出)
   */
  outputType?: number;
  /**
   * 研究对象类型。0 -；1 主要研究对象；2 主产品；3 副产品(0:-; 1:主要研究对象; 2:主产品; 3:副产品)
   */
  researchObject?: number;
  researchObject_name?: string;
  /**
   * 多重引用子io列表
   */
  subIoList?: IoDto[];
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
 * 支撑材料
 */
export interface UploadFile {
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
   * 文件uuid
   */
  fileId?: string;
  /**
   * 文件名
   */
  fileName?: string;
  /**
   * 文件外网url
   */
  fileUrl?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 过程or输入/输出id
   */
  objectId?: number;
  /**
   * 模块类型: 1 过程; 2 输入/输出(1:过程; 2:输入/输出; 3:过程库; 4:输入/输出库)
   */
  objectType?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
