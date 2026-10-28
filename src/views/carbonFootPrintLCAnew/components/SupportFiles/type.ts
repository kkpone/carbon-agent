/**
 * 支撑材料传参
 */

export interface UploadFilesRequest {
  /**
   * 对象id
   */
  objectId?: number;
  /**
   * 对象类型
   */
  objectType?: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  [property: string]: any;
}

export interface SupportUploadFile {
  /**
   * 公司id
   */
  companyId?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 文件uuid
   */
  fileId?: string;
  /**
   * 文件名
   */
  fileName?: string;
  /**
   * 文件外网url
   */
  fileUrl?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 过程or输入/输出id
   */
  objectId?: number;
  /**
   * 模块类型: 1 过程; 2 输入/输出(1:过程; 2:输入/输出; 3:过程库; 4:输入/输出库)
   */
  objectType?: number;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}
