type GhgClassify = {
  value: string;
  name: string;
  classifyList: GhgClassify[];
};

export type TaskOption = {
  orgList: { orgId: string; orgName: string }[];
  ghgCategoryList: GhgClassify[];
  yearList: string[];
  totalCount?: number;
  waitDealCount?: number;
};

export type TaskSearchParams = {
  pageNum: number;
  pageSize: number;
  sortType: number;
  year?: string;
  name?: string;
  orgIdList?: string[];
  ghgClassifyList?: string[][];
  reqStatus?: string;
  ticket?: string;
  companyId?: number;
};

export type Task = {
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
  // 活动数据（原值）
  activityData: number | null;
  // 修改后的活动数据（新值）
  modifiedActivityData?: number | string | null;
  // 修改的字段描述，如「活动类型A」
  modifiedFields?: string | null;
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
  // 状态 0取消 / 1完成 / 2待填报 / 3已提交
  status: number;
  submitStatus: number;
  updateTime: string;
  // 年度
  year: string;
  periodDesc: string;
  // 时间类型
  timeType: number;
  // 计算周期
  computationPeriod: string;
  facility: string;
  // 审批人
  approvers?: string;
  formulaLabel?: string | null;
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
      show?: number;
    }[];
  } | null;
  oldActivityData?: string;
};
