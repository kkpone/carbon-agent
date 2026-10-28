import { CommonProductListData } from '../type';

/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-15 15:28:18
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 15:28:34
 */
export interface TableRow {
  searchValue: null;
  createBy: string;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
  remark: null;
  params: any;
  id: number;
  companyId: number;
  accountId: number;
  productId: number;
  reportName: string;
  accountName: string;
  productName: string;
  startTime: Date;
  endTime: Date;
  productCode: string;
  companyProfile: string;
  suppose: string;
  type: number;
  compareAccountId: number;
  compareProductId: number;
  extra: null;
  description: string;
  delFlag: number;
  reportActivityList: null;
  reportFactoryList: null;
  updateByName: string;
  expandedList?: CommonProductListData[];
}
