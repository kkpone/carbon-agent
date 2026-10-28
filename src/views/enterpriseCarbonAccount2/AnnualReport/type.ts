/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-20 16:35:55
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-07 11:28:49
 */

export type Indicator = {
  foreignId: number;
  indicatorName: string;
  unitValue: string;
};

export type QuantityData = {
  year: number;
  baseYear_totalYearQuantity: number;
  baseYear_totalYearQuantity_intensity: number;
  totalYearQuantity: number;
  totalYearQuantity_intensity: number;
  comparison_totalYearQuantity: string;
  comparison_baseYear_totalYearQuantity_intensity: string;
  categoryData: [
    { category: string; emissionQuantity: number; emissionIntensity: number },
  ];
};

export type CategoryData = {
  [x: string]: string | number;
  category: string;
  emissionQuantity: string | number;
  emissionQuantityScale: string | number;
  standardEmissionQuantity: string | number;
  standardEmissionQuantityScale: string | number;
};

export type ClassifyData = {
  classify: number;
  classifyName: string;
  classifyNameSecond: string;
  [P: string]: any;
};

export type InfoData = {
  name: string;
  emissionQuantity: number;
  emissionQuantityRatio: number;
  category: string;
  classify: string;
  categoryRowStart: boolean;
  classifyRowStart: boolean;
  categoryCountMap: Record<string, number>;
  classifyCountMap: Record<string, number>;
};

export type CockpitData = {
  // 基准年年度碳排放量
  baseYear_totalYearQuantity: number;
  // 基准年年度碳排放强度
  baseYear_totalYearQuantity_intensity: number;
  // 年度碳排放量
  totalYearQuantity: number;
  // 年度碳排放强度
  totalYearQuantity_intensity: number;
  // 上年度碳排放强度
  before_totalYearQuantity_intensity: number | string;
  // 年度碳排放量对比基准年
  comparison_totalYearQuantity: number;
  // 年度碳排放强度对比基准年
  comparison_baseYear_totalYearQuantity_intensity: number;
  // 年度碳排放量同比
  comparison_before_totalYearQuantity: number;
  // 年度碳排放强度同比
  comparison_before_totalYearQuantity_intensity: number;

  indicatorList: Indicator[];
  foreignId: number;
};
