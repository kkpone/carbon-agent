/*
 * @Author: 张明尧
 * @Date: 2022-10-19 17:48:57
 */
import {
  OrderProductListDetail,
  PriceList,
  ProductList,
  SubOrderApiData,
} from '../type';
/** 续订弹窗 - 选择时长 */
export interface OrderServiceCenterSelectTimeProps {
  /** 当前选中续订的 接口返回数据 */
  continueInfo: OrderProductListDetail;
  /** 获取价格信息 */
  getPrice: (info: PriceList) => void;
}

/** 续订弹窗 - 确认定点杆 */
export interface OrderServiceCenterConfirmOrderProps {
  /** 产品列表 */
  productList: ProductList[];
  /** 提交订单的返回值 */
  subOrderBack: SubOrderApiData;
  /** 支付成功 */
  paySuccess: () => void;
  /** 当前选中的价格信息 */
  checkPriceList?: PriceList;
}

/** 续订弹窗 - 确认定点杆 */
export interface OrderServiceCenterPaySuccessProps {
  /** 产品列表 */
  productList: ProductList[];
  /** 提交订单的返回值 */
  subOrderBack: SubOrderApiData;
  /** 当前选中的价格信息 */
  checkPriceList?: PriceList;
  closeModal?: () => void;
  /** 点击查看订单 - 如果在订单页面点击查看订单，直接关闭弹框 */
  findOrder?: () => void;
  /** 点击申请发票 - 如果在订单页面点击查看订单，直接关闭弹框 */
  findInvoice?: () => void;
}
