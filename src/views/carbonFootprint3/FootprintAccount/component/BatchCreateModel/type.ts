import { UploadFile } from 'antd';

export type BatchFile = {
  name: string;
  size?: string;
  sizeUnit?: string;
  url: string;
  fileType?: string;
  level?: string;
  createTime?: string;
  uploadTime?: string;
};

export type BatchTaskStatus = 0 | 1 | 2 | 3 | 4;

export type BatchAccountStatus = 0 | 1 | 2;

export type BatchTaskInfo = {
  id: number;
  productName?: string;
  userContent?: string;
  fileWay?: 0 | 1;
  dataFile?: BatchFile[];
  status?: BatchTaskStatus;
  delFlag?: 0 | 1;
};

export type ReferTreeNode = {
  id: number;
  referId?: number;
  batchId: number;
  tmpId?: number;
  parentId?: number;
  level?: number;
  levelName?: string;
  accountId?: number;
  accountName?: string;
  productId?: number;
  productName?: string;
  aiFill?: 0 | 1;
  multiRefer?: 0 | 1;
  referCount?: number;
  children?: ReferTreeNode[];
};

export type BatchAccountTmp = {
  id?: number;
  batchId?: number;
  accountId?: number;
  accountName?: string;
  accountStatus?: BatchAccountStatus;
  emissionTotal?: string;
  levelName?: string;
  supplierName?: string;
  productId?: number;
  productName?: string;
  startTime?: string;
  endTime?: string;
  amount?: string;
  unitCode?: string;
  unitName?: string;
  scope?: 0 | 1 | 2;
  scopeValue?: string;
  aiFill?: 0 | 1;
  productFrom?: 0 | 1;
  advice?: string[];
  supportFile?: BatchFile[];
  dataFile?: BatchFile[];
  delFlag?: 0 | 1;
  remark?: string;
};

export type BatchAccountReferReq = {
  batchId: number;
  referId?: number;
  targetReferId?: number;
};

/** 其他引用关系列表查询参数 */
export type BatchReferListReq = {
  batchId: number;
  tmpId: number;
};

export type ByReferVo = {
  referId: number;
  tmpId: number;
  parentId?: number;
  level?: number;
  levelName?: string;
  accountName?: string;
  parentName?: string;
  childNames?: string;
  childCount?: number;
};

export type DictOption = {
  dictValue: string;
  dictLabel: string;
  sourceType?: string;
  sourceName?: string;
};

export type ProductOption = {
  id: number;
  productName: string;
  specification?: string;
};

export type UploadResponse = {
  code?: number;
  msg?: string;
  data?:
    | string
    | {
        name?: string;
        url?: string;
      };
};

export type BatchUploadFile = UploadFile<UploadResponse>;
