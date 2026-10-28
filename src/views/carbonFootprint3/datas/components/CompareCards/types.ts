export type ProductListParams = {
  pageNum: number;
  pageSize: number;
};

/** 对比产品的接口返回 */
export type ProductListApi = {
  rows: ProductListData[];
  total: number;
};

export type ProductListData = {
  id: number;
  accountName: string;
  type: number;
  startTime: string;
  endTime: string;
  productPic: string;
  productName: string;
};

/** 产品详情 */
export type ProductListInfo = {
  detail: ProductListInfoData;
};

export interface ProductListInfoData {
  account: ProductListInfoAccount;
  card: ProductListInfoCard;
  byStages: ProductListInfoByStage[];
  byTypes: ProductListInfoByStage[];
  topEmissions: ProductListInfoByStage[];
}

type ProductListInfoCard = {
  emissionTotal: string;
  stage: string;
  stageEmissions: string;
  type: string;
  typeEmissions: string;
  emission: string;
  emissions: string;
  diffRate: number;
  diffTrend: number;
};

type ProductListInfoByStage = {
  code: number;
  name: string;
  total: string;
  rate: number;
};

type ProductListInfoAccount = {
  id: number;
  companyId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  startTime: string;
  endTime: string;
  amount: string;
  unitType: string;
  unitCode: string;
  unitName: string;
  scope: number;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  delFlag: number;
  productPic?: string;
};
