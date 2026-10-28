/**
 * 选择过程的请求参数
 */
export interface ChooseProcessLibraryRequest {
  /**
   * 过程集名称
   */
  likeProcessLibName?: string;
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

export interface ChooseProcessLibrary {
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
   * id
   */
  id?: number;
  /**
   * 生命周期id列表。','分割
   */
  lifeCycleList?: string;
  /**
   * 生命周期阶段
   */
  lifeCycleName?: string;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 所属组织
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 过程库名称
   */
  processLibName?: string;
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
