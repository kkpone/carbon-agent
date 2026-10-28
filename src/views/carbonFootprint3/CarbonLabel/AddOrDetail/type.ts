import { AddFileDataAndUid } from '../../type';

export type UrlStateProps = {
  productId: string;
  status: 'edit' | 'detail';
  accountId: string;
};

export type CarbonLabelSubValues = {
  /** 碳标签类型 */
  labelType: number;
  /** 产品名称 */
  productId: number | string;
  /** 规格型号 */
  specs?: string;
  /** 规格型号显隐 0 隐藏  1显示 */
  specsShow: number;
  /** 功能单位id */
  accountId: number | string;
  /** 品牌名称 */
  brand: string;
  /** 产品图片 */
  productPic: AddFileDataAndUid[];
  /** 核算周期 */
  period?: string[];
  /** 核算周期显隐 0 隐藏  1显示 */
  periodShow: number;
  /** 碳排放类别  */
  contrastValuesArr: number[];
  /** 碳排放类别显隐 0 隐藏 1显示 */
  contrastShow: number;
};

/**
 * 提交申请表单接口所需参数信息
 */
export type CarbonLabelSubApiData = {
  id?: number | string;
  /** Agent 申请中的单位排放量，不修改来源核算；需后端保存并回显。 */
  perEmission?: string;
  /** Agent 完整排放单位（如 kgCO₂e/件），需原提交/详情接口兼容保存和回显，不做前端换算。 */
  perEmissionUnit?: string;
  /**
   * 核算对象
   */
  accountId?: number | string;
  applyNum?: string;
  /**
   * 功能单位
   */
  accountName?: string;
  /**
   * 产品id
   */
  productId?: number | string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 产品图片路径
   */
  productPic: string;
  /**
   * 标签类型
   */
  labelType: number;
  /**
   * 品牌
   */
  brand: string;
  /**
   * 核算周期-开始时间
   */
  startTime: string;
  /**
   * 核算周期-结束时间
   */
  endTime: string;
  /**
   * 核算周期显隐 1显0隐
   */
  periodShow: number;
  /**
   * 产品规格
   */
  specs?: string;
  /**
   * 产品规格显隐 1显0隐
   */
  specsShow: number;
  /**
   * 碳排放类比-显隐：1显，0隐
   */
  contrastShow: number;
  /**
   * 碳排放类比项勾选项字符串：1,2
   */
  contrastValues?: string;

  /**
   * 单位
   */
  unitName?: string;
  status?: number;
};

/**
 * 碳排放类比列表
 */
export type CarbonLabelContrastList = {
  code: number;
  name: string;
};
