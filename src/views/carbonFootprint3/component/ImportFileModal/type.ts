/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 20:27:14
 * @Date: 2023-05-17 17:57:42
 * @@description:
 */
import { FetchNewPage } from '@src/components/TableUtil/types/util';
import { AxiosResponse } from 'axios';

export interface ImportFileModelProps<TableList, TableSearch> {
  title: string;
  visible: boolean;
  downLoadTemplateUrl: string;
  downLoadTemplateName?: string;
  /** commonTable中搜索条件 */
  getFileListRequest: (
    params: TableSearch,
  ) => Promise<AxiosResponse<AxiosResponse<TableList[]>>>;
  searchParamsData: any;
  /** 导入文件的接口回调 */
  importFileRequestBack: (
    url: string,
    fileName?: string,
  ) => Promise<{ code: number; data?: number }>;
  /** 取消弹框的回调 */
  onCancelBack: () => void;
  /** 导入成功的回调 */
  onOkImport?: (data?: number) => void;
  /** 上传文件限制类型 */
  acceptFileType?: string;
}

/** 导入记录获取 */
export interface ImportParams extends FetchNewPage {
  // 0 是产品  1 是核算
  type?: number;
  stage?: string;
  module?: string;
}

/** 导入通用格式 - 导入记录表格每一列数据 */
interface CommonImportTableList {
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

/** 输出 - 导入记录表格每一列数据 */
export interface OutImportTableList extends CommonImportTableList {}

/** 选择排放源 - 导入记录表格每一列数据 */
export interface EmissionImportTableList extends CommonImportTableList {}
