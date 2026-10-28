export interface CarbonAuthInfoReturn {
  /**
   * 申请编号
   */
  applyNo?: string;
  /**
   * 认证项目
   */
  authType?: number;
  /**
   * 组织id
   */
  companyId?: number;
  /**
   * 组织id
   */
  companyName?: string;

  /**
   * 附件
   */
  fileList?: FileListType[];
  /**
   * id
   */
  id: number;
  /**
   * 项目名称
   */
  projectName: string;
  /**
   * 项目ID
   */
  projectNo?: string;
  reportId?: number;
  reportInfo?: ReportResp;
  reportName?: string;
  reportUrl?: string;
  status: number;
  updateTime?: string;
  authFile: any[];
  confirmFile: any[];
}

interface FileListType {
  companyId?: number;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  id?: number;
  name?: string;
  size?: number;
  sourceId?: number;
  type?: Type;
  updateBy?: number;
  updateTime?: Date;
  url?: string;
  [property: string]: any;
}

enum Type {
  The0 = '0',
  The1 = '1',
  The2 = '2',
  The3 = '3',
  The4 = '4',
  The5 = '5',
}

interface ReportResp {
  accountSnapList?: ReportAccountSnap[];
  accountType?: number;
  companyId?: number;
  companyProfile?: string;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  description?: string;
  extra?: string;
  fileName?: string;
  fileUrl?: string;
  id?: number;
  productCount?: number;
  reportActivityList?: ReportActivitySnap[];
  reportFactoryList?: ReportFactorySnap[];
  reportId?: number;
  reportName?: string;
  snapCode?: string;
  suppose?: string;
  type?: number;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * ReportAccountSnap
 */
interface ReportAccountSnap {
  accountId?: number;
  accountName?: string;
  baseType?: number;
  companyId?: number;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  emissionTotal?: string;
  endTime?: Date;
  factor?: string;
  factorUnit?: string;
  id?: number;
  productId?: number;
  productName?: string;
  reportId?: number;
  snapId?: number;
  specification?: string;
  startTime?: Date;
  updateBy?: number;
  updateTime?: Date;
}

/**
 * ReportActivitySnap
 */
interface ReportActivitySnap {
  activityType?: ActivityType;
  dataType?: DataType;
  delFlag?: number;
  descs?: string;
  grade?: string;
  id?: number;
  snapId?: number;
  dataType_name?: string;
  activityType_name?: string;
}

enum ActivityType {
  The1 = '1',
  The2 = '2',
  The3 = '3',
  The4 = '4',
}

enum DataType {
  The0 = '0',
  The1 = '1',
  The2 = '2',
  The3 = '3',
  The4 = '4',
}

/**
 * ReportFactorySnap
 */
interface ReportFactorySnap {
  datas?: ActivityType;
  dataType?: DataType;
  delFlag?: number;
  descs?: string;
  id?: number;
  methodology?: Methodology;
  region?: Methodology;
  snapId?: number;
  technology?: Methodology;
  times?: ActivityType;
  dataType_name?: string;
  times_name?: string;
  technology_name?: string;
  region_name?: string;
  methodology_name?: string;
  datas_name?: string;
}

enum Methodology {
  The1 = '1',
  The2 = '2',
  The3 = '3',
}
