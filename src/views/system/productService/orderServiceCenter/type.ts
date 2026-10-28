/** 服务中心列表数据 */
export interface OrderServiceCenterList {
  id: number;
  productId: string;
  expireTime: string;
  companyId: number;
  createTime: string;
  updateTime: string;
  productName: string;
  delFlag: string;
  leftDays: number;
  buyFlag: number;
}
/** 获取续订明细 */
export interface OrderProductListDetail {
  id: number;
  goodsName: string;
  goodsId: string;
  goodsAttribute: string;
  goodsInfo: string;
  labels: string;
  type: number;
  mode: number;
  status: string;
  orderNum: number;
  delflag: number;
  createBy: string;
  createTime: string;
  updateTime: string;
  page: number;
  size: number;
  productList: ProductList[];
  priceList: PriceList[];
}
/** 续订明细 - 产品列表 */
export interface PriceList {
  id: number;
  priceId: number;
  goodsId: string;
  priceType: string;
  value: number;
  realPrice: number;
  standPrice: number;
  period?: string;
}
/** 续订明细 - 产品价格 */
export interface ProductList {
  id: number;
  goodsId: string;
  productId: string;
  productName: string;
  productInfo: string;
}

/** 提交订单的参数 */
export interface SubOrderData {
  goodsId: string | number;
  priceId: number | string;
}
/** 提交订单的返回值 */
export interface SubOrderApiData {
  payMoney: string;
  orderId: string;
  code_url: string;
  /** 订单时间 */
  orderTime: string;
}

/** 支付结果返回 */
export interface OrderPayStatusBack {
  trade_state: string;
  orderId: string;
  /** 订单状态：0未支付，1已支付，2已取消 */
  status: string;
  /** 订单描述 */
  desc: string;
}
