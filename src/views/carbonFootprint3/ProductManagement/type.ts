/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-01-03 15:54:16
 * @Date: 2023-01-03 14:19:38
 * @@description: 产品管理的类型页面
 */

/** 产品库 - 查询列表参数 */
export interface ProductLibraryTableParams {
  /** 产品编码 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
}

/**
 * @description: 提交产品
 */
export interface ProductLibraryAddData {
  /** 产品编码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
  specification: string;
  productDesc: string;
  productExtras: ProductExtra[];
}
/** 产品库 - 初始化接口 */
export interface ProductLibraryTableDataInit extends ProductLibraryTableData {
  productExtras: ProductExtra[];
}

/** 产品库 - 详情信息 */
export interface ProductLibraryTableDataDetail {
  id: string;
  productCode: string;
  productName: string;
  specification: string;
  productDesc: string;
  productExtras: ProductExtra[];
}

/** 产品库 - 新增产品的自定义属性显示 */
export interface ProductExtra {
  id: number;
  companyId?: number;
  productId: string;
  /** 属性Id */
  extraId: number;
  type: number;
  name: string;
  value: string;
  required: number;
  status: number;
  orderNum: number;
  extraEnums: ExtraEnum[];
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  delFlag: number;
}
interface ExtraEnum {
  id: number;
  companyId: number;
  extraId: number;
  name: string;
  status: number;
  orderNum: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null;
  updateTime: string;
  delFlag: number;
}

/** 产品库 - 列表数据 */
export interface ProductLibraryTableData {
  id: number;
  companyId?: number;
  productCode: string;
  productName: string;
  /** 规格型号 */
  specification: string;
  /** 产品描述 */
  productDesc: string;
  /** 扩展属性对象 */
  extra?: string;
  status: number;
  createBy?: string;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  delFlag?: number;
}

/** 产品属性 - 查询列表参数 */
export interface ProductAttributeTableParams {
  /** 属性名称 */
  name?: string;
  /** 状态 0 输入 - 1 选择 */
  status?: number;
}
/** 产品属性 - 列表数据 */
export interface ProductAttributeTableData {
  id: number;
  companyId: number;
  module: number;
  name: string;
  type: number;
  required: number;
  /** 状态 0 启用 - 1 禁用 */
  status: number;
  orderNum: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
}

/** 产品属性 - 新增属性 */
export interface ProductAttributeAddForm {
  /** 模块： 0-产品 1-报告 */
  module: 0;
  /** 名称 */
  name: string;
  /** 0-输入型 1-选择型 */
  type: number;
  /** 0-非必填 1-必填 */
  required: number;
  /** 排序 */
  orderNum: number;
}
/** 产品属性 - 新增属性 */
export interface ProductAttributeUpdate {
  id: number;
  /** 状态 0 启用 - 1 禁用 */
  status: number;
}

/** 产品属性 - 产品详情 */
export interface ProductAttributeDetail extends ProductAttributeTableData {}

/** 产品属性 - 枚举值管理列表 */
export interface ProductAttributeEnumTableData {
  id: number;
  companyId: number;
  extraId: number;
  name: string;
  status: number;
  orderNum: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
}

/** 产品属性 - 新增枚举值 */
interface ProductAttributeEnumObj {
  /** 名字 */
  name: string;
  /** 状态 0 启用 1禁用 */
  status: number;
  /** 顺序 */
  orderNum: number;
}
/** 产品属性 - 新增枚举值 */
export interface ProductAttributeEnumAdd extends ProductAttributeEnumObj {
  /** 属性id */
  extraId: string;
}

/** 产品属性 - 编辑枚举值 */
export interface ProductAttributeEnumEdit extends ProductAttributeEnumObj {
  /** 列表id */
  id: number;
}

/** 产品属性 - 枚举值修改状态 */
export interface ProductAttributeEnumUpdate {
  id: number;
  /** 状态 0 启用 - 1 禁用 */
  status: number;
}
