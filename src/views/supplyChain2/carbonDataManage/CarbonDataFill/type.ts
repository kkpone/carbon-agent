/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-11 20:30:15
 */

// 碳数据填报 -企业碳核算 -> 选择记录（直接）
export interface Report {
  url: string;
  name: string;
}

// 数据请求详情
export interface DataIfoReqBackData {
  companyName: string;
  computeCompanyName: string;
  computationYear: string;
  expireTime: Date;
  dataType: number;
  computationType: string;
  computationScope: string;
  phone: string;
  updateBy: null;
  createTime: Date;
  supplierId: number;
  descr: string;
  name: string;
  computationUnit: string;
  auditList: AuditList[];
  footBorderType: number | undefined;
  createBy: string;
}

interface AuditList {
  createTime: Date;
  updateBy: string;
  result: number;
  resultDesc: string;
  content: string;
  phone: string;
}
