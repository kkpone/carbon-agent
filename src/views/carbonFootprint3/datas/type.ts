/**
 * @description: 左侧数据筛选的list接口返回值
 */
export type DatasFiltrateListData = {
  id: number;
  companyId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  startTime: Date;
  endTime: Date;
  amount: string;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId?: number;
  scope: number;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: Date;
  delFlag: number;
};
