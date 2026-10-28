/**
 * 参数配置返回类型
 */
export interface ParameterResp {
  /**
   * 产品分类名称
   */
  categoryName?: string;
  /**
   * 删除的集合
   */
  cbamDelDTOList?: CbamDelDTO[];
  defaultCnList?: DefaultCn[];
  defaultNameEn?: string;
  defaultPrecursorList?: DefaultPrecursor[];
  defaultProcessList?: DefaultProcess[];
  defaultProductList?: DefaultProduct[];
  defaultSaleList?: DefaultSale[];
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 是否包含间接排放:1是;2否(0:无; 1:是; 2:否)
   */
  isExists?: number;
  unit?: string;
  unitName?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * CbamDelDTO
 */
export interface CbamDelDTO {
  /**
   * null(1:生产工序; 2:相关前驱体; 3:包含产品; 4:cn编码)
   */
  cbamDel?: number;
  id?: number;
  [property: string]: any;
}

/**
 * DefaultCn，产品分类默认cn编码和名称
 */
export interface DefaultCn {
  /**
   * cn编码
   */
  defaultCode?: string;
  /**
   * cn名称
   */
  defaultName?: string;
  defaultNameEn?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultPrecursor，产品分类默认前驱
 */
export interface DefaultPrecursor {
  /**
   * 前驱名称
   */
  defaultName?: string;
  defaultNameEn?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultProcess，产品分类默认生产工序
 */
export interface DefaultProcess {
  /**
   * 生产工序名称
   */
  defaultName?: string;
  defaultNameEn?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultProduct，产品分类包含产品
 */
export interface DefaultProduct {
  defaultName?: string;
  defaultNameEn?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * DefaultSale，外购商品配置
 */
export interface DefaultSale {
  /**
   * 字段名称
   */
  defaultName?: string;
  /**
   * 字段英文名
   */
  defaultNameEn?: string;
  delFlag?: number;
  id?: number;
  /**
   * 是否必填:0必填;1非必填
   */
  isRequired?: number;
  /**
   * 0展示;1不展示
   */
  isShow?: number;
  /**
   * 关联字段
   */
  link?: string;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/** 参数配置列表请求参数类型 */
export interface ParameterRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  [property: string]: any;
}
