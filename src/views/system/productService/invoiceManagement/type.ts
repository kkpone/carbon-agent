/** 发票管理-列表接口返回 */
export interface InvoiceManagementTableData {
  rows: InvoiceManagementList[];
  total: number;
}
/** 发票管理 - 列表list */
export interface InvoiceManagementList {
  id: number;
  companyId: number;
  companyNum: string;
  companyName: string;
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
  filePath?: string;
  status: number;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  remark: string;
  delFlag: number;
}
