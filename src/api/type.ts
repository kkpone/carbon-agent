/** 通用下拉选项类型。 */
export interface OptionsType {
  label: string;
  value: string | number;
}

/** 附件信息，与文件上传接口返回 DTO 保持一致。 */
export interface UploadFile {
  companyId?: number;
  createBy?: number;
  createTime?: Date;
  deleted?: boolean;
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  id?: number;
  objectId?: number;
  objectType?: number;
  orgId?: number;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}
