export type OperateData = {
  id: number;
  year: string | number;
  createTime: string;
  createBy: string;
  indicatorList: OperateIndicator[];
};

export type OperateIndicator = {
  id: number;
  name: string;
  unit: string;
  unitName: string;
  preset: number;
  deleted: number;
  year: string;
  totalValue: string;
};
