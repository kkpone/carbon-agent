type ArticleLabel = {
  icon: string;
  cname: string;
  id: number;
};
export type ArticleData = {
  otherImgUrl: null;
  buttonText: null;
  icon: null;
  articleId: number;
  articleLabelList: ArticleLabel[];
  orderNum: null;
  herfUrl: null;
  customName: null;
  remark: null;
  title: string;
  content: null;
  jumpUrl: string;
  describes: null;
  imageLocation: null;
  path: null;
  imageUrlH5: string;
  titleOther: null;
  articleLabel: string;
  isTop: null;
  imageUrl: string;
  detailList: null;
  menuId: null;
  id: number;
  contentType: null;
};

export type AuthData = {
  /** 认证项目 0 产品碳足迹报告 1 产品对比报告 2 企业碳核算报告 */
  authType: 0 | 1 | 2;
  name: string; // 名称
  imgUrl: string; // 封面图
  count: number; // 认证数量
};

type DemoData = {
  // 产品名称
  productName: string;
  // 产品 ID
  productId: number | null;
  // 核算 ID
  accountId: number | null;
  // 跳转链接
  jumpUrl: string;
};

/**
 * 1 产品碳足迹 2 企业碳核算
 */
export enum EProductType {
  product = '1',
  company = '2',
}

// 返回数据结构
export type IdentityData = {
  // 试用产品有效期（天）
  duration: number;
  // 试用产品数据列表
  demoDataList: DemoData[];
  /** 是否试用用户（0：否，1：是） */
  userDemo: 0 | 1;
  /** 用户试用是否到期（0：否，1：是） */
  trialExpired: 0 | 1;
  /** 产品列表 */
  productList: { productType: EProductType }[];
};
