/**
 * SupplierData
 */
export interface SupplierData {
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
   * 数据来源
   */
  dataSource?: string;
  /**
   * 数据类型。1 原材料；2 耗材；3 包装材料；4 能耗；5 水耗；6 运输；7 资本货物；8 处置产品；9 废气；10 废水；11 固体废弃物；12 可再生输出物；13
   * 待处理输出物；14 有价值的输出物(1:原材料; 2:耗材; 3:包装材料; 4:能耗; 5:水耗; 6:运输; 7:资本货物; 8:处置产品; 9:废气; 10:废水;
   * 11:固体废弃物; 12:内循环输出物; 13:待处理输出物; 14:有价值的输出物)
   */
  dataType?: number;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 收货地城市
   */
  destinationCity?: string;
  /**
   * 因子来源
   */
  factorSource?: string;
  /**
   * 碳足迹因子数值
   */
  factorValue?: string;
  /**
   * 投料单位
   */
  feedingUnit?: string;
  /**
   * 碳足迹附件上传
   */
  footprintAttachment?: string;
  /**
   * 燃料类型
   */
  fuelType?: string;
  /**
   * 本产品的通用计量单位 或 功能单位
   */
  funcUnit?: string;
  /**
   * 均质材料
   */
  homogeneousMaterial?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 活动数据来源
   */
  ioDataSource?: string;
  /**
   * io数据类型。11 输入-化石燃料燃烧；12 输入-外购电力；121 输入-请提供其中绿电购电量，并选择绿电种类；13 输入-外购热力或蒸汽；131
   * 输入-方法二：重量（t）法：请填写所消耗热力的重量及对应的温度、压强信息，如购买蒸汽有不同的温度和压强，请分别提供；14 输入-生产用水；21 输出-产品；22
   * 输出-固体废物；23 输出-废水；24 输出-排放至大气(11:输入-化石燃料燃烧; 12:输入-外购电力; 121:输入-请提供其中绿电购电量，并选择绿电种类;
   * 13:输入-外购热力或蒸汽; 131:输入-方法二：重量（t）法：请填写所消耗热力的重量及对应的温度、压强信息，如购买蒸汽有不同的温度和压强，请分别提供; 14:输入-生产用水;
   * 21:输出-产品; 22:输出-固体废物; 23:输出-废水; 24:输出-排放至大气)
   */
  ioDataType?: number;
  /**
   * 输入输出类型。1 输入；2 输出(1:输入; 2:输出)
   */
  ioType?: number;
  /**
   * io单位
   */
  ioUnit?: string;
  /**
   * 值
   */
  ioValue?: string;
  /**
   * 值1
   */
  ioValue1?: string;
  /**
   * 值2
   */
  ioValue2?: string;
  /**
   * 值3
   */
  ioValue3?: string;
  /**
   * 值4
   */
  ioValue4?: string;
  /**
   * 制造商物料编码/描述
   */
  manufacturerMaterialNo?: string;
  /**
   * 物料描述
   */
  materialDesc?: string;
  /**
   * 物料投入量
   */
  materialInputQuantity?: string;
  /**
   * 材料中文名称
   */
  materialName?: string;
  /**
   * 英文名称及化学名称
   */
  materialNameEn?: string;
  /**
   * 物料编码
   */
  materialNo?: string;
  /**
   * 发货地城市
   */
  originCity?: string;
  /**
   * 主要运输方式
   */
  primaryTransMethod?: string;
  /**
   * 产品id
   */
  productId?: number;
  /**
   * 该原材料清单对应的产品产量
   */
  productOutput?: string;
  /**
   * 采购方式
   */
  purchasingMethod?: string;
  /**
   * 阶段
   */
  stage?: string;
  /**
   * 补充描述
   */
  suppDesc?: string;
  /**
   * 表类型。1 表头；2 原材料获取；3 输入；4 输出(1:表头; 2:原材料获取; 3:输入; 4:输出)
   */
  tableType?: number;
  /**
   * 运输数据来源
   */
  transDataSource?: string;
  /**
   * 运输距离
   */
  transDistance?: string;
  /**
   * 类型1
   */
  type1?: string;
  /**
   * 类型2
   */
  type2?: string;
  /**
   * io种类
   */
  type3?: string;
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
   * 运输工具载重
   */
  vehiclePayload?: string;
  /**
   * 每单位产品投入物料的重量
   */
  weightOfMaterialInput?: string;
  [property: string]: any;
}
