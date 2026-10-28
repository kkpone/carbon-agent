export type CarbonLabelParams = {
  pageNum: number;
  pageSize: number;
  productName?: string;
  status?: string;
  /** Agent 按来源核算查询，过滤和分页由后端完成。 */
  accountId?: number | string;
};

export type CarbonLabelListData = {
  id: number;
  /** Agent 申请值；旧详情未返回时沿用 accountObj 和 unitName。 */
  perEmission?: string;
  perEmissionUnit?: string;
  accountObj: AccountObj;
  /** 业务错误编码：1产品被删除，2核算被删除 */
  errorCode?: number;
  /**
   * 核算对象
   */
  accountId: number;
  /**
   * 功能单位
   */
  accountName: string;
  /**
   * 产品名称
   */
  productName: string;
  productId: number;
  productPic: string;
  /**
   * 产品规格
   */
  specs: string;
  specsShow: number;
  brand: string;
  /**
   * 单位标识
   */
  unitCode: string;
  /**
   * 单位名称
   */
  unitName: string;
  /**
   * 标签类型
   */
  labelType: number;

  /** 核算周期 - 开始*/
  startTime: string;
  /** 核算周期 - 结束*/
  endTime: string;
  periodShow: number;
  contrastValues: string;
  contrastShow: number;
  /**
   * 更新人
   */
  updateBy: string;
  /**
   * 状态：0待提交，1待审核，2审核通过，3审核未通过
   */
  status: number;

  /**
   * 更新时间
   */
  updateTime: string;

  /**
   * 申请编号
   */
  applyNum: string;
  specification: string;
};

export type AccountObj = {
  /**
   * 碳排放类比 列表
   */
  equalList: EqualObj[];
  /**
   * 核算单位产品排放量
   */
  perEmission?: string;
  /**
   * 排放量分布
   */
  stageList?: StageObj[];
  /**
   * 单位标识
   */
  unitCode?: string;
  /**
   * 单位名称
   */
  unitName?: string;
};

interface EqualObj {
  /**
   * 相当于多少
   */
  amount: number;
  code: number;
  name: string;
  unitName: string;
}

interface StageObj {
  stage: number;
  change: number;
  stageName: string;
  emissionTotal: number;
  rateAccount: number;
  rateOffset: number;
  rateReduce: number;
  rateLeft: string;
}

/** 碳披露参数 */
export type CarbonLabelPrviewParams = {
  accountId: number;
  productId: number;
};

/**
 * 业务错误编码：1产品被删除，2核算被删除
 */
export type ApiBackErrorCode = {
  errorCode: number;
};

/** 原提交接口的兼容扩展；旧调用方仍只读取 errorCode。 */
export type CarbonLabelSubmitResult = ApiBackErrorCode & {
  id?: number | string;
};
