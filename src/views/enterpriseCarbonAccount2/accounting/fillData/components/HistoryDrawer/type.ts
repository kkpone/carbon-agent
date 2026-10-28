export type EmissionHistoryRecords = {
  time: string;
  records: {
    editor: string;
    emissionName: string;
    time: string;
    editType: number;
    editFields: {
      fieldName: string;
      oldValue: string;
      newValue: string;
    }[];
    detail: Record<string, any>[];
  }[];
}[];

export type MatchSource = {
  facility: string;
  ghgCategory: string;
  ghgCategoryName: string;
  ghgClassify: string;
  ghgClassifyName: string;
  id: number;
  name: string;
};
