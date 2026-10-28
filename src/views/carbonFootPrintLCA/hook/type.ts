/**
 * LcaEnumResp
 */
export interface LcaEnumResp {
  code?: number;
  name?: string;
  score?: string;
  subList?: LcaEnumResp[];
}

/**
 * LifeCycle
 */
export interface LifeCycle {
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
   * 阶段名称
   */
  stageName?: string;
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
 * DictTree
 */
export interface DictTree {
  /**
   * 子节点
   */
  children?: DictTree[];
  /**
   * code
   */
  code?: string;
  /**
   * name
   */
  name?: string;
  [property: string]: any;
}

/**
 * LcaDb
 */
export interface LcaDb {
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
   * id
   */
  id?: number;
  /**
   * 发布机构
   */
  institution?: string;
  /**
   * 0 启用 1 禁用(0:启用; 1:禁用)
   */
  status?: number;
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
