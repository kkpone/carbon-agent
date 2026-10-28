export type TempData = {
  id: number;
  activityData: number;
  activityUnit: string;
  activityUnitName: string;
  ghgCategory: string;
  ghgClassify: string;
  dateStr: string;
  unitCodeArr?: string;
  bindId?: number;
  errorList: { type: number }[];
};
