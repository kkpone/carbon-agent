export type SupplierCarbonData = {
  id: number;
  // 供应商名称
  computeCompanyName: string;
  // 供应商id
  supplierId: number;
  // 温室气体排放数据
  emissionDesc: string;
  // 数据请求来源
  reqDataType: string;
  // 数据请求来源描述
  reqDataTypeDesc: string;
  // 提交时间
  submitTime: string;
  // 审核人
  auditUser: string;
  // 审核时间
  auditTime: string;
  // 审核备注
  content: string;
  // 单位产品排放量
  factor: number;
  // 分子单位
  unitCode: string;
  // 分母单位
  computeUnit: string;
  // 核算年份
  year: string;
  // 电子邮箱
  email: string;
  // 截止日期
  expireTime: string;
  // 数据请求类型 1结果 / 2过程
  dataType: number;
  // 系统边界要求 1半 / 2全生命周期
  footBorderType: number;
  // 数据要求说明
  descr: string;
};

export type SupplierDataSearchParams = {
  name?: string;
  supplierIds?: number[];
};

export type Supplier = {
  supplierId: number;
  companyName: string;
};
