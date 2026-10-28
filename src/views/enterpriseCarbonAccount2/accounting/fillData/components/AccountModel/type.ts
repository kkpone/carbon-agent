export type ListModel = {
  modelId: number;
  modelType: number;
  name: string;
  desc: string;
  orgId: number;
  period: number;
  scopeOneCount: string;
  scopeThreeCount: string;
  scopeTwoCount: string;
  year: string;
};

export type ModelDetails = {
  name: string;
  ghgCategory: string;
  count: number;
  nodes: {
    name: string;
    ghgCategory: string;
    ghgClassify: string;
    count: number;
    dictSourceList: {
      name: string;
      activityUnit: string;
      activityUnitDesc: string;
      appoint: string;
      facility: string;
    }[];
  }[];
}[];
