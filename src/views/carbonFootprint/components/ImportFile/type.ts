/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-07 10:53:48
 * @Date: 2023-02-03 10:06:14
 * @@description:
 */

/** 导入记录表格每一列数据 */
export interface ProductImportTableList {
  id: number;
  companyId: number;
  module: number;
  module_name: string;
  name: string;
  totalRows: number;
  normalRows: number;
  errorRows: number;
  url: string;
  urlError: string;
  status: number;
  status_name: string;
  createTime: string;
  createBy: number;
  createByName: string;
  fail: number;
  failUrl: string;
}
