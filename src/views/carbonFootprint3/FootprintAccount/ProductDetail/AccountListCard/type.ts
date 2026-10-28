import { ProductAccountingList } from '../../component/ProductSelectAccount/type';

export type AccountReferListParams = {
  pageNum: number;
  pageSize: number;
  /** 被引用的核算 id，用于查询引用当前核算的下游产品列表 */
  byAccountId: number;
};

export type AccountReferListData = {
  /** 下游产品核算 id */
  id?: number;
  productId?: number;
  productName?: string;
  accountName?: string;
  accountStatus?: number;
  unitName?: string;
};

/**
 * @description: 加载更多的Scroll
 */
export type AccountListCardScrollData = {
  list: ProductAccountingList[];
  currentPage: number;
  isNoMore: boolean;
};

/**
 * 分享提交参数
 */
export type ShareAccountPost = {
  id: number;
  accountId: number;
  url: string;
  type: number;
  password: string;
  expireValue: number;
  /** 是否支持编辑及数据同步:0不支持,1支持 */
  editType?: number;
  /** 编辑权限:0首次完成建模后失效,1有效期内可编辑 */
  editPermit?: number;
};
