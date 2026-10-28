export type ProcessAccountInfo = {
  accountName: string;
  startTime: string;
  endTime: string;
};

export type ProcessAccounting = {
  key: number | string;
  dataId: number;
  processId: number;
  id: string;
  parentId: string;
  matchType: number;
  name: string;
  orderNum: number;
  processType: null;
  children: ProcessAccounting[];
};

export type Process = {
  accountId: number;
  accountYear: string;
  boundary: string;
  createTime: '2023-05-24 18:41:31';
  delFlag: number;
  emissionTotal: string;
  id: number;
  name: string;
  orderNum: number;
  productErea: string;
  remark: string;
};

export type ProcessProduct = {
  id: number;
  processId: number;
  name: string;
  // 类型：1主产品，2副产品，3回用产品
  type: number;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number | string;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  // 排放量
  emissionTotal: number;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: number;
  matchTypeId: number;
  matchId: number;
  matchName: string;
  factor: string;
  factorUnit: string;
  year: string;
  // 因子对象
  factorObj: Record<string, any>;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: Record<string, any>;
  files?: File[];
};

export type ProcessIn = {
  id: number;
  processId: number;
  name: string;
  // 1主料，2辅料，3包装材料，4再生材料，5能耗，6水耗，7运输
  type: number;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  matchName: string;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: number;
  matchTypeId: number;
  typeExtra: {
    name?: string;
    // 运输方式
    way: number;
    // 数量、重量、百分比
    amount: number | string;
    // 单位标识
    unitCode: string;
    // 单位名称
    unitName: string;
    // 运输距离
    distance: number | string;
  };
  // 因子对象
  factorObj: Record<string, any>;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: Record<string, any>;
  supplierObj?: Record<string, any>;
  files?: File[];
  children?: Record<string, any>;
  requestState?: number;
};

export type ProcessOut = {
  id: number;
  processId: number;
  name: string;
  type: number;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  matchName: string;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: number;
  matchTypeId: number;
  typeExtra: {
    // 再生回收率
    recycleRate: number | string;
    // 修正系数
    correctRate: number | string;
  };
  // 因子对象
  factorObj: Record<string, any>;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: Record<string, any>;
  files?: File[];
};
