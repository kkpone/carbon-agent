type GhgClassify = {
  value: string;
  name: string;
  classifyList: GhgClassify[];
};

export type ApprovalOption = {
  orgList: { orgId: string; orgName: string }[];
  ghgCategoryList: GhgClassify[];
  yearList: string[];
  totalCount?: number;
  waitDealCount?: number;
};

export type ApprovalSearchParams = {
  pageNum: number;
  pageSize: number;
  sortType: number;
  year?: string;
  name?: string;
  orgIdList?: string[];
  ghgClassifyList?: string[][];
  reqType?: string;
  ticket?: string;
  /** 填报人 userId */
  queryUserId?: number;
};

export type ApprovalTask = {
  id: number;
  // 排放源id
  sourceId: number;
  // 排放源名称
  name: string;
  // GHG分类值
  ghgCategory: string;
  ghgClassify: string;
  // GHG分类名称
  ghgClassifyName: string;
  // 活动数据
  activityData: number;
  // 活动数据单位
  activityUnit: string;
  activityType: number;
  // 主体id
  orgId: number;
  // 主体名称
  orgName: string;
  // 填报人
  appoint: string;
  // 填报人ids
  userIdList: string[] | null;
  // 附件集合
  imgList: {
    supportImgId: number;
    sourceId: number;
    name: string;
    url: string;
    type: number;
    deleted: number;
  }[];
  // 发起人
  initiate: string;
  // 状态 0待审批 / 1已通过 / 2已驳回 / 3已完成
  status: number;
  submitStatus: number;
  updateTime: string;
  // 核算年度
  year: string;
  periodDesc: string;
  // 时间类型
  timeType: number;
  // 核算周期
  computationPeriod: string;
  facility: string;
  // 审批人
  approvers?: string;
  // 旧的活动数据
  oldActivityData?: string | number | null;
  // 公式标签
  formulaLabel?: string | null;
  // 参数名称
  paramName?: string | null;
  edit?: boolean;
  methodObj?: {
    id: number;
    paramItem: {
      id: number;
      name: string;
      unitName: string;
      paramType: number;
      hasValue: number;
      defaultValue: string;
    }[];
  } | null;
  // 修改记录
  modifyRecord?: {
    fieldName: string;
    oldValue: string | number;
    newValue: string | number;
  };
  // 驳回原因
  rejectReason?: string;
  // 提交人
  submitter?: string;
  // 提交时间
  submitTime?: string;
};

export type ApprovalStatistics = {
  all: number;
  pending: number;
  rejected: number;
  completed: number;
  cancelled: number;
};
