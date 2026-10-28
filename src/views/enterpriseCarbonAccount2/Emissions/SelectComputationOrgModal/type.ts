export type ComputationYear = {
  orgId: number;
  year: number;
  value: number;
  periodList: {
    value: number;
    name: string;
  }[];
};
