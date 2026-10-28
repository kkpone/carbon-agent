export type ProductFootprintAccountId = string | number;

export type ProductReferResp = {
  accountTotal?: number;
  accountUnitCode?: string;
  accountUnitName?: string;
  companyId?: number;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  files?: Record<string, unknown>[];
  hasSharedModel?: boolean;
  id?: number;
  perUnitCode?: string;
  perUnitName?: string;
  perWeight?: string;
  productCode?: string;
  productDesc?: string;
  productName?: string;
  productPic?: string;
  productType?: string;
  productTypeName?: string;
  specification?: string;
  status?: number;
  techDesc?: string;
  unitType?: string;
  updateBy?: number;
  updateByName?: string;
  updateTime?: Date;
  [property: string]: unknown;
};

export type ProductPageResultVo = {
  rows?: ProductReferResp[];
  total?: number;
  [property: string]: unknown;
};

export type ProductReferPageResponse = {
  code?: number;
  data?: ProductPageResultVo;
  lang?: string;
  msg?: string;
  [property: string]: unknown;
};

export type AccountReferResp = {
  accountName?: string;
  accountStatus?: number;
  aiStatus?: number;
  amount?: string;
  companyId?: number;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  emissionTotal?: string;
  endTime?: Date;
  factor?: string;
  factorUnit?: string;
  files?: Record<string, unknown>[];
  id?: number;
  inStatus?: number;
  modelId?: number;
  productCode?: string;
  productId?: number;
  productName?: string;
  productPic?: string;
  purpose?: string;
  scope?: number;
  scopeValue?: string;
  specification?: string;
  startTime?: Date;
  status?: number;
  type?: number;
  unitCode?: string;
  unitName?: string;
  unitType?: string;
  updateBy?: number;
  updateByName?: string;
  updateTime?: Date;
  [property: string]: unknown;
};

export type AccountPageResultVo = {
  rows?: AccountReferResp[];
  total?: number;
  [property: string]: unknown;
};

export type AccountReferPageResponse = {
  code?: number;
  data?: AccountPageResultVo;
  lang?: string;
  msg?: string;
  [property: string]: unknown;
};

export type ProductReferListParams = {
  pageNum: number;
  pageSize: number;
};

export type AccountReferListParams = {
  pageNum: number;
  pageSize: number;
  productId?: number;
};

/** activityData 是页面产品数量列，不属于核算列表接口返回字段。 */
export type ProductFootprintAccountRow = AccountReferResp & {
  activityData?: string | number | null;
};

export type ProductFootprintAccountSelection = ProductFootprintAccountRow & {
  activityData: string | number | null;
};

export type ProductFootprintAccountSelectorProps = {
  open: boolean;
  selectionMode: 'multiple' | 'single';
  onCancel: () => void;
  onConfirm: (
    selectedRows: ProductFootprintAccountSelection[],
  ) => void | Promise<void>;
};
