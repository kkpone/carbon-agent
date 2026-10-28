/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 10:16:06
 */

/** 供应商列表传参 */
export interface SupplierParams {
  companyName?: string;
  companyNumber?: string;
  purchaseGoodsId?: string;
  status?: number;
}

/** 供应商列表返回列表 */
export interface SupplierTableData {
  updateBy: string;
  updateTime: Date | string;
  type: number;
  result: number;
  carbonUser: boolean;
  remark: string;
  supplierId: number;
  supplierCompanyId: number;
  companyName: string;
  email: string;
  companyNumber: string;
  applyTime: Date | string;
  applyStatus: number;
  status: number;
  statusDesc: string;
  id: number;
}
