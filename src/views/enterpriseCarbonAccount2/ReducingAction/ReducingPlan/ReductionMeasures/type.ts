export type MeasuresType = {
  id: number;
  name: string;
  status: number;
  begTime: string;
  endTime: string;
  measureDesc: string;
  type: number;
  feasibility: number;
  paramItem: {
    id: string;
    name: string;
    type: number;
    unit: string[];
    defaultValue: string;
  }[];
  reduceResult: {
    scope: string[];
    type: number;
    formula: { value: string; label: string }[];
    formulaString: string;
  }[];
  cost: { value: string; label: string }[];
  costString: string;
  earnings: { value: string; label: string }[];
  earningsString: string;
  channelType: number;
  measureType: number;
  predictReduce: string;
  predictCost: string;
  predictEarnings: string;
};

export type AccountSetting = {
  accountWay: number;
  yearList: { value: string; label: string }[];
};
