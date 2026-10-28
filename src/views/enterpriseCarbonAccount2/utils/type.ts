/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 16:25:58
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-16 20:12:55
 */
export interface EnterpriseCategorys {
  searchValue: null | any;
  createBy: null | any;
  createTime: string;
  updateBy: null | any;
  updateTime: string;
  remark: null | any;
  params: any;
  sourceCategoryId: number;
  computationId: number;
  parentId: number;
  name: string;
  outOrderNum: number;
  deleted: number;
  delflag: number;
  firstCategoryId: number | null;
  oldSourceCategoryId: null | any;
  oldDictSourceCategoryId: null | any;
  level: number;
  requestFlag: boolean;
  children: EnterpriseCategorys[];
}

export interface SourceCategoryListType {
  finishCount?: string;
  key: number | string;
  ghgCategory?: string;
  ghgClassify?: string;
  total: number;
  id: number;
  parentId?: number;
  sourceCategoryId: number;
  businessParentId?: number;
  level?: number;
  businessId: string;
  name: string;
}
export interface OpreationBack {
  code: number;
  msg: string;
}
export interface BackTableData<TableData> {
  currSize: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  rows: TableData[];
  total: number;
}
export interface AccountListBackTableData {
  searchValue: null;
  createBy: string;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
  remark: null;
  params: {};
  computationId: number;
  companyId: number;
  name: string;
  period: string;
  begTime: Date;
  endTime: Date;
  compareComputationId: number;
  totalQuantity: number;
  quantization: string;
  gwp: string;
  modelFlag: number;
  categoryType: number;
  deleted: number;
  timeType: number;
  choseType: null;
  modelId: null | number;
  modelType: null | number;
  emission: null | string;
  computationYear: null;
  cyear: number;
  cquarter: null | string;
  cmonth: null | string;
  computationStatus: number;
}
