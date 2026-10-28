export interface NewProcessLibrary {
  id: number;
  lifeCycleList?: string;
  orgId: number;
  processLibName: string;
  selectedDb: string;
  [property: string]: any;
}

/**
 * 过程库
 */
export interface ProcessLibrary {
  /**
   * 地域代表性
   */
  areaRepresent?: string;
  /**
   * 地域代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 租户id
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
   * 数据来源
   */
  dataSource?: string;
  /**
   * 数据类型: 1 实景数据; 2 背景数据(1:实景数据; 2:背景数据)
   */
  dataType?: number;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  id?: number;
  /**
   * 多输出分配(1:无; 2:物理分配; 3:经济分配; 4:其他方法)
   */
  multiOutput?: number;
  /**
   * 所属组织
   */
  orgId?: number;
  /**
   * 所属组织名称
   */
  orgName?: string;
  /**
   * 产出产品名称
   */
  outputProductName?: string;
  /**
   * 过程描述
   */
  processDesc?: string;
  /**
   * 过程名称
   */
  processName?: string;
  /**
   * 产品单位
   */
  productUnit?: string;
  /**
   * 产品单位名称
   */
  productUnitName?: string;
  /**
   * 系统边界
   */
  systemBoundary?: string;
  /**
   * 技术代表性
   */
  techRepresent?: string;
  /**
   * 时间代表性
   */
  timeRepresent?: number;
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

/** 过程库列表搜索栏部分类型 */
export interface Request {
  /**
   * likeProcessName
   */
  likeProcessName?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 产出产品名称
   */
  outputProductName?: string;
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
 * 过程管理-列表-请求传参
 */
export interface InputOutputLibraryRequest {
  /**
   * 类别:1 输入; 2 输出; 3 产品
   */
  category?: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 菜单节点的upstreamProcessId
   */
  processId?: number;
  [property: string]: any;
}

/** 选择输入的请求传参 */
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
