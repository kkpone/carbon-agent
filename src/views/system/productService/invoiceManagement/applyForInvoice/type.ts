/** 申请发票 - 选择发票订单 */
export interface InvoiceSelectOrderProps {
  /** 申请发票回调 */
  subSelectOrder: (totalMoney: number, keys: React.Key[]) => void;
}

/** 申请发票 - 填写发票信息 */
export interface InvoiceWriteInvoiceProps {
  /** 选中的订单id */
  orderIds: React.Key[];
  /** 订单总额 */
  totalMoney: number;
  /** 表单提交的数据 */
  subInvoiceAdd: (data: InvoiceWriteInvoiceAdd) => void;
}

/** 申请发票 - 确认发票 */
export interface InvoiceConfirmInvoiceProps {
  /** 表单的需要确认的数据 */
  addData: InvoiceWriteInvoiceAdd;
  /** 总金额 */
  totalMoney: number;
  /** 开票成功回调 */
  invoiceBack: () => void;
}
/** 填写发票 */
export interface InvoiceWriteInvoiceAdd {
  invoiceTitile: string;
  taxCode: string;
  invoiceType: number;
  type: number;
  money: number;
  content: string;
  registeredAddress: string;
  registeredPhone: string;
  bank: string;
  bankAccount: string;
  phone: string;
  orderList: InvoiceOrder[];
}
/** 填写发票 - 订单号 */
interface InvoiceOrder {
  orderId: string;
}
