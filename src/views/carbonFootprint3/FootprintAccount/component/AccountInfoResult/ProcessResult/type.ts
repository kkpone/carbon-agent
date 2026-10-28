/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 16:49:56
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-04 18:33:04
 */
type ChartData = {
  code: number;
  name: string;
  rate: number;
  total: string;
};

export type AccountChartData = {
  byStages: ChartData[];
  byAccountIns: ChartData[];
  byAccountOuts: ChartData[];
  emissionTotal: string;
};

export type Emission = {
  id: number | null;
  emissionSourceId?: number | string | null;
  sourceId?: number | string | null;
  stage: string;
  name: string;
  type: string;
  amount: string;
  unitName: string;
  emissionTotal: string;
  percentage: string;
  factor: string;
  factorUnit: string;
  processId: number;
  processName: string;
  stageIndex?: number;
  [P: string]: any;
};
