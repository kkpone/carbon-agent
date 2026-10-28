export type FactorSourceId = string | number;

export type FactorDatabaseSourceOption = {
  id: FactorSourceId;
  name: string;
};

export type GlobalFactorPreferencePlan = {
  id: number;
  name: string;
  sourceIds: FactorSourceId[];
  sourceNames: string;
  remark?: string;
  published: boolean;
  isDefault: boolean;
};

export type GlobalFactorPreferenceFormValues = {
  name: string;
  sourceIds: FactorSourceId[];
  remark?: string;
};
