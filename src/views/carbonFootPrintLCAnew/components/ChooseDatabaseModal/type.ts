/**
 * 选择数据库的请求参数
 */
export interface DatabaseRequest {
  /**
   * 数据库id
   */
  lcaDbId?: number;
  /**
   * 因子名称
   */
  likeFactorName?: string;
  /**
   * 产品名称
   */
  likeProductName?: string;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 模型已选数据库
   */
  selectedDb: string;
  /**
   * 发布年份
   */
  year?: string;
  [property: string]: any;
}

/**
 * LcaFactor
 */
export interface LcaFactor {
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
