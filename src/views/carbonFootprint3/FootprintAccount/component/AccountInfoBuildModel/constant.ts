/** 搭建模型 - 下面操作 - 切换列表和可视化 */

export enum BuildModelDescribeSet {
  LIST = 0,
  VISUAL = 1,
}

/** ai建模是否动画执行完毕 */
export enum AiProcessStatus {
  // 动画也执行完毕了
  FAIL = 0,
  // 接口建模中 - 接口还没反馈
  PENDING = 1,
  // 接口完成 - 但是动画没执行完毕
  SUCCESS = 2,
}
