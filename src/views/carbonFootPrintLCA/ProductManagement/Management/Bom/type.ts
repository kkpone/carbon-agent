/**
 * BomResp
 */
export interface BomResp {
  /**
   * 数量
   */
  amount?: number;
  /**
   * 数量单位
   */
  amountUnit?: string;
  /**
   * 数量单位
   */
  amountUnitDesc?: string;
  /**
   * 物料编码
   */
  bomCode?: string;
  /**
   * 英文描述
   */
  bomEnDesc?: string;
  /**
   * 物料名称
   */
  bomName?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 最新版本
   */
  lastVersion?: string;
  /**
   * 物料层级
   */
  level?: number;
  /**
   * 物料材质
   */
  material?: string;
  /**
   * 其他单位数量
   */
  otherAmount?: number;
  /**
   * 其他数量单位
   */
  otherAmountUnit?: string;
  /**
   * 其他数量单位
   */
  otherAmountUnitDesc?: string;
  /**
   * 上级物料编码
   */
  pcode?: string;
  /**
   * 父部件id
   */
  pid?: number;
  /**
   * 产品id
   */
  productId?: number;
  /**
   * 重量
   */
  weight?: number;
  /**
   * 重量单位
   */
  weightUnit?: string;
  /**
   * 重量单位
   */
  weightUnitDesc?: string;
  [property: string]: any;
}
