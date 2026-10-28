import { DatasFiltrateListData } from '../../type';

/**
 * @description: 左侧数据筛选的list接口参数
 */
export type DatasFiltrateListParams = {
  pageNum: number;
  pageSize: number;
  productName?: string;
  /** 0快速 1过程 undefind全部 */
  type?: number;
};

/**
 * @description: 左侧数据筛选的list接口
 */
export type DatasFiltrateListApi = {
  rows: DatasFiltrateListData[];
  list: any[];
  total: number;
};

/**
 * @description: 加载更多的Scroll
 */
export type DatasFiltrateListScrollData = {
  list: DatasFiltrateListData[];
  currentPage: number;
  isNoMore: boolean;
};
