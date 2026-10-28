import { FetchPage } from '@src/components/TableUtil/types/util';

/** 导入记录获取 */
export interface ProductImportParams extends FetchPage {
  type?: number;
  stage?: string;
  module?: string;
}

/** 导入记录表格数据 */
export interface ProductImportTableData {
  rows: ProductImportTableList[];
  total: number;
}

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
}

/**
 * @description: 上传文件的导入参数
 */
export interface ImportFileApiData {
  fileUrl: string;
  accountId?: string;
  stage?: string;
}
