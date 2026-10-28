/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-22 10:59:52
 * @Date: 2023-05-11 09:59:15
 * @@description:
 */
import { Factor } from '@src/views/carbonFootprint3/discharge/process/type';
import { AddFileData } from '@src/views/carbonFootprint3/type';

export type PostProcessProductsListDataAdd = {
  dataId: string | number;
  parentId: string;
  processProducts: Record<string, any>[];
};

export type PostAccessorProductsListData = {
  processProducts: AccessoryProductData[];
};

export type AccessoryProductDrawerProps = {
  loading: boolean;
  /** 功能单位名称 */
  unitName?: string;
  /** 初始化 - 回显FormValue */
  initValues?: AccessoryProductData[];
  visible: boolean;
  isEdit: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
  onOk: (productArr: Record<string, any>[]) => void;
  onCancel?: () => void;
};

export type AccessoryProductData = {
  id: number;
  companyId: number;
  accountId: number;
  processId: number;
  stage: number;
  name: string;
  type: number;
  amount: string;
  shareRate: number | null;
  unitCode: string;
  unitName: string;
  rate: null | string;
  emissionTotal: string;
  matchWay: number;
  matchWay_name: string;
  matchTypeId: number;
  matchId: number | null;
  matchName: null | string;
  factor: string;
  factorUnit: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  remark: string;
  delFlag: number;
  orderNum: number;
  matchObject: Factor;
  factorObj: Factor;
  processProduct: AccessoryProcessProduct;
  files?: AddFileData[];
  typeExtra: {
    // 再生回收率
    recycleRate: number | string;
    // 修正系数
    correctRate: number | string;
  };
  useAmount: number;
};

type AccessoryProcessProduct = {
  id: number;
  processId: number;
  processName: string;
  productName: string;
  type: number;
  accountYear: string;
  boundary: string;
  unitCode: number | string;
  unitName: string;
};
