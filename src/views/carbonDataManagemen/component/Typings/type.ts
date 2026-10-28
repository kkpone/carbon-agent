export type EchartDataType = {
  xaxis?: string[];
  yaxis?: number[];
  zaxis?: string[];
  historyRegister?: string;
  historyCers?: string;
  historyUv?: string;
  historyPv?: string;
};
export interface LinkDataType {
  userId?: string; // 用户id
  orgId?: string; // 分组id
  plId?: string; //		场景id
  tplName?: string; //	场景名称
  orgName?: string; //	分组名称
  periodType?: string; //	时间段 1 - 12
  countNum?: string; //	统计数量
  pv?: string | null; //	次数
  uv?: string | null; //	uv 人数
  cers?: string; //	减碳量
  opTime?: string; //	日期
  linkPer?: string | null; //	环比
  uvLink?: string | null; //	人数环比
  uvPercent?: string | null; //	人数环比变化
  cersLink?: string; //	减排量环比
  cersPercent?: string; //	减碳量 环比变化
  avgLink?: string; //	人均减排量环比
  avgPercent?: string | null; //	人均环比变化
  avgTime?: string; //	平均时间点
  avgCers?: string | null; // r人均减排量
}
export type CartDataType = {
  countNum?: string | null;
  linkPer?: string | null;
  tplName?: string | null;
};
export type LayoutType = {
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  i?: string;
  minW?: number;
  isDraggab?: boolean;
  isResizable?: boolean;
  static?: boolean;
  isDraggable?: boolean;
  moved?: boolean;
};
export type SearchDataType = Record<`${number}-${number}`, string>;
