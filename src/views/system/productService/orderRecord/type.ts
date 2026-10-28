import { PriceList, ProductList } from '../orderServiceCenter/type';

/** 订单记录-列表接口返回 */
export interface OrderRecordTableData {
  rows: OrderRecordList[];
  total: number;
}
/** 订单记录 - 列表list */
export interface OrderRecordList {
  id: number;
  /** 选中要求有Key值 */
  key: string;
  companyId: number;
  companyName: string;
  companyNum: string;
  orderId: string;
  orderName: string;
  orderInfo: string;
  testFlag: number;
  totalMoney: string;
  recieveMoney: number;
  realMoney: number;
  cutMoney: number;
  status: string;
  createBy: string;
  createTime: string;
  payTime: string;
  payCode: string;
  payStatus: string;
  payWay: string;
  codeUrl: string;
  invoiceFlag: number;
  auditState: string;
  auditBy: string;
  auditTime: string;
  auditRemark: string;
  delflag: number;
  upstringBy: string;
  upstringTime: string;
  origin: string;
  period: string;
  remark: string;
  page: number;
  size: number;
  sort: string;
  beginTime: string;
  endTime: string;
  orderGoods: string;
  orderAuditRecords: string;
}

/** 订单中的详情数据 */
export interface OrderRecordListDetail {
  id: number;
  companyId: number;
  companyName: string;
  companyNum: string;
  orderId: string;
  orderName: string;
  orderInfo: string;
  testFlag: number;
  totalMoney: string;
  recieveMoney: number;
  realMoney: number;
  cutMoney: number;
  status: string;
  createBy: string;
  createTime: string;
  payTime: string;
  payCode: string;
  payStatus: string;
  payWay: string;
  codeUrl: string;
  invoiceFlag: number;
  auditState: string;
  auditBy: string;
  auditTime: string;
  auditRemark: string;
  delflag: number;
  upstringBy: string;
  upstringTime: string;
  origin: string;
  period: string;
  remark: string;
  page: number;
  size: number;
  sort: string;
  beginTime: string;
  endTime: string;
  orderGoods: OrderGood[];
  orderAuditRecords: OrderAuditRecord[];
}

interface OrderAuditRecord {
  id: number;
  orderId: string;
  result: string;
  auditState: string;
  auditBy: string;
  auditTime: string;
  remark: string;
}

interface OrderGood {
  id: number;
  orderId: string;
  goodsId: string;
  goodsName: string;
  mode: number;
  priceId: number;
  priceType: string;
  value: number;
  goodsPeriod: string;
  totalMoney: number;
  recieveMoney: number;
  realMoney: number;
  cutMoney: number;
  priceList: PriceList[];
  productList: ProductList[];
}
