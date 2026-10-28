export type FileType = {
  name: string;
  uid: string;
  url: string;
  suffix: string;
  fileName?: string;
};
/**
 * ImportQuery 导入历史请求数据
 */
export interface ImportLogReq {
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 关联数据id
   */
  dataId?: number;
  /**
   * 导入内容。1 供应商；2 采购产品；3 填报数据；4 LCA模型,可用值:1,2,3,4,5,6,7,8,9
   */
  importType?: number;
  [property: string]: any;
}

/**
 * ImportLog 导入历史数据
 */
export interface ImportLogResp {
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 操作人
   */
  createByName?: string;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 关联数据id
   */
  dataId?: number;
  /**
   * 完成时间
   */
  doneTime?: Date;
  /**
   * 失败条数
   */
  failedCount?: number;
  /**
   * 异常数据url
   */
  failedFileUrl?: string;
  /**
   * 文件名
   */
  fileName?: string;
  /**
   * 文件url
   */
  fileUrl?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 导入状态。0 导入中 1 已导入 -1 导入失败(0:导入中; 1:导入成功; -1:导入失败)
   */
  importStatus?: number;
  /**
   * 导入时间
   */
  importTime?: Date;
  /**
   * 导入内容。1 供应商；2 采购产品(1:供应商; 2:采购产品; 3:填报数据; 4:LCA模型; 5:BOM; 6:距离; 7:因子UUID; 8:数字护照)
   */
  importType?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 成功条数
   */
  successCount?: number;
  /**
   * 总条数
   */
  totalCount?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新人名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
