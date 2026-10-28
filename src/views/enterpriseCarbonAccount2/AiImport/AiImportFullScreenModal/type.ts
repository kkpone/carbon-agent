export type EmissionSource = {
  id: number;
  name: string;
  facility: string;
  activityData: number;
  ghgCategory: string;
  ghgCategoryName: string;
  ghgClassify: string;
  ghgClassifyName: string;
  activityUnit: string;
  unitCodeArr: string;
  activityUnitName: string;
  factorValue: string;
  factorUnit: string;
  factorUnitM: string;
  errorFlag: number;
  repeatFlag: number;
};

export type SearchParams = {
  computationId: string;
  computationPeriod: string;
  pageNum: number;
  pageSize: number;
  error?: number;
  ghgClassifyList?: string;
};
