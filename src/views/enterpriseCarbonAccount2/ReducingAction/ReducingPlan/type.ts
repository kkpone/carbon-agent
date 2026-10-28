export type Ghg = {
  value: string;
  name: string;
  classifyList: Ghg[];
};

type Emission = {
  name: string;
  value: string;
  emission: string;
  classify: Emission[];
};

type SimpleOrg = {
  id: string;
  name: string;
  children: SimpleOrg[];
};

export type ReducingPlan = {
  id: number;
  name: string;
  targetSetting: number;
  scopeValue: string[][];
  orgValue: string[][];
  standardYear: string;
  ghgCategoryList: Ghg[];
  emissionDetail: Emission[];
  orgList: SimpleOrg[];
};
