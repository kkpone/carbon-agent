export interface PageReturn<T> {
  list: T[];
  total: number;
}

export interface Response<T> {
  code?: number;
  data?: T;
  lang?: string;
  msg?: string;
}

export interface GreenSupplierListParams {
  /**
   * 减排类别
   */
  category?: number;
  /**
   * 分类
   */
  likeClassify?: string;
  /**
   * 企业名称
   */
  likeEnterpriseName?: string;
  /**
   * 页码
   */
  pageNum?: number;
  /**
   * 每页条数
   */
  pageSize?: number;
  /**
   * 是否展示
   */
  onShow?: string;
}
export interface GreenSupplierInfo {
  /**
   * 适用场景
   */
  applyScene?: string;
  /**
   * 减排属性描述
   */
  attributeDesc?: number;
  /**
   * 分类
   */
  classify?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 服务客户
   */
  customer?: string;

  /**
   * 企业明称
   */
  enterpriseName?: string;
  /**
   * 减排商品类别
   */
  goodsClassify?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 减排类别
   */
  reductionCategory?: number;
  /**
   * 是否在官网展示
   */
  show?: boolean;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
}
