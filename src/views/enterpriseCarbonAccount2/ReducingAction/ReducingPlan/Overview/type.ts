import { ValueOf } from 'type-fest';

import { YEAR_TYPE, COMPARE_TAG } from '../constant';

type CompareTag = ValueOf<typeof COMPARE_TAG>;

export type YearType = ValueOf<typeof YEAR_TYPE>;

export type OverviewInfo = {
  // 目标年度
  plannedYear: number | null;
  // 目标减排
  plannedCers: number;
  // 完成比例
  completionRate: number;
  // 上年度
  yesterYear: number;
  // 上年度目标排放
  yesterYearPlannedEmissions: number;
  // 上年度实际排放
  yesterYearRealityEmissions: number | null;
  // 上年度(超出/低于)目标值
  yesterYearTargetEmissions: number;
  // 上年度(1超出/0相等/-1低于)
  yesterYearTargetType: CompareTag;
  // 当前年度
  currentYear: number;
  // 当前年度目标排放
  currentYearPlannedEmissions: number;
  // 当前年度预测排放
  currentYearForecastEmissions: number | null;
  // 当前年度(超出/低于)目标值
  currentYearTargetEmissions: number;
  // 当前年度(1超出/0相等/-1低于)
  currentYearTargetType: CompareTag;
  choose: string;
  forecastConfig: boolean;
};

export type YearEmission = {
  // 年份
  year: number;
  // 实际排放量
  emissions: number;
  // 目标排放量
  predictEmissions: number;
  // 预测排放量
  forecastEmissions: number;
  // 基准值
  standardEmissions: number;
  // 对比基准值
  compareStandardEmissions: number;
  // 对比基准值结果类型 1超出/0等于/-1低于
  compareStandardEmissionsResult: CompareTag;
  // 对比目标
  comparePredictEmissions: number;
  // 对比目标结果类型 1超出/0等于/-1低于
  comparePredictEmissionsResult: CompareTag;
  beforeFlag: boolean;
  // 减排措施合集减排量
  measureTotalReduceEmission: number;
  // 预测减排 - 减排措施减排后的排放量
  forecastEmissionsReduce: number;
};

export type EmissionRow = {
  name: string;
  // 目标减排
  predictEmissions: string;
  // 实际减排
  realityRredictEmissions: string;
  // 目标排放
  targetEmissions: string;
  // 实际排放
  emissions: string;
  // 基准年排放
  standardEmissions: string;
  // 完成度
  complete: string;
  detailInfoList: EmissionRow[];
};
