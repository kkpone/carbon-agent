export type AccountProduct = {
  id: number;
  accountName: string;
  productName: string;
  emissionTotal: string;
  scope: number;
  // 核算方式： 0过程 1快速
  type: number;
  startTime: string;
  endTime: string;
  stageObjs: {
    stage: 0 | 1 | 2 | 3 | 4;
    stageName: string;
    stageTotal: string;
  }[];
};
