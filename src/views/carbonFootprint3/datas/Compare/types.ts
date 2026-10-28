export type ProductListData = {
  id: number;
  accountName: string;
  type: number;
  startTime: string;
  endTime: string;
  productName: string;
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
export interface ProductData {
  // 搜索值，目前为null
  searchValue: null;
  // 创建者
  createBy: string;
  // 创建时间
  createTime: string;
  // 更新者
  updateBy: string;
  // 更新时间
  updateTime: string;
  // 备注，目前为null
  remark: null;
  // 参数，空对象
  params: {};
  // 目标产品id
  id: number;
  companyId: number;
  accountId: number;
  productId: number;
  // 报告名称，目前为null
  reportName: null;
  type: number;
  accountType: number;
  compareAccountId: number;
  compareProductId: number;
  // 删除标志
  delFlag: number;
  // 产品名称
  prductName: string;
  prductNameCompare: string;
  // 功能单位
  accountName: string;
  // 基准产品功能单位
  accountNameCompare: string;
  // 排放量
  emissionTotal: string;
  // 排放量
  emissionTotalCompare: string;
  // 减排比例
  totalReductionRate: string;
  /** 对比数据是否有效 0 无效 1 有效 */
  accountCompareStatus: number;
  productPic?: string;
  productPicCompare?: string;
}
