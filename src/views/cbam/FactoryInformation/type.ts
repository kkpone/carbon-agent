/**
 * 工厂信息返回类型
 */
export interface FactoryResp {
  /**
   * 授权代表姓名
   */
  authorizedRepresentative?: string;
  /**
   * 城市
   */
  city?: string;
  /**
   * 国家
   */
  country?: string;
  /**
   * 创建人
   */
  createBy?: number;
  createTime?: Date;
  /**
   * 0正常;1删除
   */
  delFlag?: number;
  /**
   * 详细地址
   */
  detailedAddress?: string;
  /**
   * 经济活动
   */
  economicActivity?: string;
  email?: string;
  factorName?: string;
  /**
   * 工厂编码
   */
  factoryCode?: string;
  /**
   * 工厂名称英文
   */
  factoryNameEn?: string;
  id?: number;
  /**
   * 纬度
   */
  latitude?: string;
  /**
   * 区位码
   */
  locationCode?: string;
  /**
   * 经度
   */
  longitude?: string;
  /**
   * 电话
   */
  mobile?: string;
  /**
   * 所属组织id
   */
  orgId?: number;
  orgName?: string;
  /**
   * 邮政编码
   */
  postalCode?: string;
  /**
   * 邮政信箱
   */
  postOfficeBox?: string;
  /**
   * 更新人
   */
  updateBy?: number;
  updateByName?: string;
  updateTime?: Date;
  [property: string]: any;
}

/** 工厂信息列表请求参数类型 */
export interface FactoryRequest {
  factoryCode?: string;
  factoryName?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  [property: string]: any;
}
