/** 批量建模任务状态，与后端 BatchTaskStatus 枚举对齐 */
export enum BatchTaskStatus {
  /** 待解析 */
  BEFORE_PARSE = 0,
  /** 待建模 */
  WAIT_MODEL = 1,
  /** 建模中 */
  MODELING = 2,
  /** 建模完成 */
  MODEL_DONE = 3,
  /** 建模失败 */
  MODEL_FAIL = 4,
}

export type BatchTaskRecord = {
  id: number;
  /** 最终产品名称 */
  productName?: string;
  /** 操作人名称 */
  updateName?: string;
  /** 任务状态 */
  status?: BatchTaskStatus;
  /** 完成/更新时间 */
  updateTime?: string;
};

export type BatchTaskListParams = {
  pageNum: number;
  pageSize: number;
  /** 产品名称，后端模糊匹配 */
  productName?: string;
  /** 任务状态 */
  status?: BatchTaskStatus;
};

export type BatchTaskListPage = {
  rows: BatchTaskRecord[];
  total: number;
};
