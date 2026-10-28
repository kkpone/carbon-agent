/**
 * 价格信息
 */
export interface PriceItem {
  id: number;
  priceId: number;
  goodsId: string;
  priceType: string;
  value: number;
  realPrice: number;
  standPrice: number;
}

/**
 * 商品信息
 */
export interface GoodsItem {
  id: number;
  goodsName: string;
  goodsId: string;
  goodsAttribute: string;
  goodsInfo: string;
  labels: string;
  type: number;
  mode: number;
  status: string;
  online: number;
  orderNum: number;
  delflag: number;
  createBy: string;
  createTime: string;
  updateBy: string | null;
  updateTime: string;
  page: number;
  size: number;
  sort: string | null;
  totalMoney: number | null;
  recieveMoney: number | null;
  realMoney: number | null;
  cutMoney: number | null;
  goodsPrices: string;
  goodsProducts: string | null;
  strSkus: string | null;
  productList: any | null;
  priceList: PriceItem[];
  skuList: any | null;
  buyCountStatus: string;
  productSkuCounts: number;
}

/**
 * 商品信息接口返回数据
 */
export interface GoodsPersonalResponse {
  code: number;
  msg: string;
  data: {
    // 用户当前已购买/选择的方案 goodsId
    goodsId?: string;
    // 用户因子库购买状态："0" 未购买，"1" 已购买
    factorBuyStatus?: string;
    goodserviceList: GoodsItem[];
    goodFactorList: GoodsItem[];
    goodCountsList: GoodsItem[];
    goodSupportList: GoodsItem[];
  };
  lang: null;
}

/**
 * 选中的方案信息
 */
export interface SelectedPlan {
  goodsId: string;
  priceId: number;
  quantity: number;
  price: number;
  buyCountStatus: string;
  productSkuCounts?: number;
}

/**
 * 选中的因子库信息
 */
export interface SelectedFactor {
  goodsId: string;
  priceId: number;
  price: number;
}

/**
 * 选中的产品数量信息
 */
export interface SelectedCount {
  goodsId: string;
  priceId: number;
  quantity: number;
  price: number;
}

/**
 * 选中的专业服务信息
 */
export interface SelectedSupport {
  goodsId: string;
  priceId: number;
  quantity: number;
  price: number;
  checked: boolean;
}

/**
 * 提交订单请求参数
 */
export interface SubmitOrderPersonalParams {
  orderGoods: {
    goodsId: string;
    priceId: number;
    goodsType: string;
  }[];
  companyId: number;
}

/**
 * 提交订单响应
 */
export interface SubmitOrderPersonalResponse {
  code: number;
  msg: string;
  data: {
    payMoney: number;
    orderTime: string;
    orderId: string;
    code_url: string;
  };
  lang: null;
}

/**
 * 订单详情
 */
export interface OrderDetailsPersonal {
  id: number;
  companyName: string;
  orderId: string;
  createTime: string;
  payTime: string;
  codeUrl: string;
  status: string;
  orderGoods: any[];
}

/**
 * 订单支付状态
 */
export interface OrderPayStatusPersonal {
  status: string;
  [key: string]: any;
}
