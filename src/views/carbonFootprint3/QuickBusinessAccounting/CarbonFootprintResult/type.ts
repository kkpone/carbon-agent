/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 16:49:56
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-10 09:47:52
 */
export type ChartData = {
  code: number;
  name: string;
  rate: number;
  total: string;
};

export type AccountChartData = {
  byTypes: ChartData[];
  byStages: ChartData[];
  byEmissions: ChartData[];
  emissionTotal: string;
};

export type Emission = {
  id: number;
  stage: string;
  name: string;
  type: string;
  amount: string;
  unitName: string;
  emissionTotal: string;
  percentage: string;
  factor: string;
  factorUnit: string;
  stageIndex?: number;
};
