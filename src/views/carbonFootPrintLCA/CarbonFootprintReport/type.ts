/**
 * IPage«Report»
 */
export interface IPageReport {
  /**
   * list
   */
  list?: ReportProps[];
  /**
   * 页码，从1开始
   */
  pageNum?: number;
  /**
   * 总页数
   */
  pages?: number;
  /**
   * 页面大小
   */
  pageSize?: number;
  /**
   * 当前页的数量
   */
  size?: number;
  /**
   * 总数
   */
  total?: number;
  [property: string]: any;
}

/**
 * 碳足迹报告类型
 */
export interface ReportProps {
  id: number;
  createBy: number;
  updateBy: number;
  createTime: Date;
  updateByName: string;
  updateTime: Date;
  companyId: number;
  orgId: number;
  reportName: string;
  modelId: number;
  assessmentId?: number;
  projectName: string;
  clientName: string;
  companyAddr: null;
  deleted: boolean;
  orgName: string;
  modelName: string;
  modelCode: string;
  funcUnit: string;
  startTime: Date;
  endTime: Date;
  productName: string;
  productCode: string;
  planName: string;
  [property: string]: any;
}

/**
 * 碳足迹报告列表搜索栏类型
 */
export interface Request {
  /**
   * 报告名称
   */
  likeName?: string;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 组织id
   */
  orgId?: number;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 产品名称或编码
   */
  productNameOrCode?: string;
  [property: string]: any;
}

/**
 * 评价方法列表
 */
export interface AssessmentRequest {
  /**
   * 评价方案
   */
  assessmentMethod?: string;
  /**
   * 模型名称
   */
  likeModelName?: string;
  /**
   * 方案名称
   */
  likePlanName?: string;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 组织id
   */
  orgId?: number;
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

/**
 * 评价方法列表返回
 */
export interface AssessmentResp {
  /**
   * 评价方法
   */
  assessmentMethod?: string;
  /**
   * 评价方法
   */
  assessmentMethodName?: string;
  /**
   * 评价指标。|分割
   */
  assessmentTargetList?: string;
  /**
   * 评价指标
   */
  assessmentTargetNames?: string;
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
   * 功能单位
   */
  funcUnit?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 模型编码
   */
  modelCode?: string;
  /**
   * 模型id
   */
  modelId?: number;
  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 所属组织
   */
  orgId?: number;
  /**
   * 组织名称
   */
  orgName?: string;
  /**
   * 方案名称
   */
  planName?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新者名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 模型版本号
   */
  version?: number;
  [property: string]: any;
}
