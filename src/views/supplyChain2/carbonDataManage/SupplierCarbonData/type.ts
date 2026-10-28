/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-15 21:22:03
 */

export interface DataAuditParams {
  result: number;
  content: string;
  id: number | string;
}
// 审核列表
export interface DataAuditListTableData {
  createBy: string;
  createTime: Date;
  status: number;
  id: number;
  companyId: number;
  supplierDataId: number;
  result: number;
  content: string;
  deleted: number;
  phone: null;
  resultDesc: string;
  carbonUser: null | boolean;
  reqType: number;
}
// 核算详情
export interface DataComputationBackData {
  id: number;
  companyId: number;
  supplierDataId: number;
  name: string;
  period: string;
  totalQuantity: number;
  quantization: string;
  gwp: string;
  categoryType: number;
  deleted: number;
  timeType: number;
  cyear: number;
  cquarter: number;
  cmonth: number;
  begTime: string;
  endTime: string;
  modelId: number;
  modelType: number;
  computationStatus: number;
  computationType: number;
}
