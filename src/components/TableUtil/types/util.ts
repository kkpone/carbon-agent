/**
 * 接口分页--- 这边必须要定死(后端 稳定性和统一性)
 */
export interface FetchPage {
  // 页码
  page: number;
  // 每页条数
  size: number;
}

/**
 * 新标准接口分页
 */
export interface FetchNewPage {
  /** 页码 */
  pageNum: number;

  /** 每页条数 */
  pageSize: number;
}

/** java 接口返回数据格式 */
export type JavaResponse<T> = {
  /**
   *
   * @type {number}
   * @memberof RPageResultThemeDto
   */
  code?: number;
  /**
   *
   * @type {PageResultThemeDto}
   * @memberof RPageResultThemeDto
   */
  data?: PageResult<T>;
  /**
   *
   * @type {string}
   * @memberof RPageResultThemeDto
   */
  msg?: string;
};

export interface PageResult<T> {
  /**
   * 当前页的数量
   * @type {number}
   * @memberof PageResultThemeDto
   */
  currSize?: number;
  /**
   * 页码，从1开始
   * @type {number}
   * @memberof PageResultThemeDto
   */
  pageNum?: number;
  /**
   * 页面大小
   * @type {number}
   * @memberof PageResultThemeDto
   */
  pageSize?: number;
  /**
   * 总页数
   * @type {number}
   * @memberof PageResultThemeDto
   */
  pages?: number;
  /**
   * rows
   * @type {Array<ThemeDto>}
   * @memberof PageResultThemeDto
   */
  rows?: Array<T>;
  /**
   * 总数
   * @type {number}
   * @memberof PageResultThemeDto
   */
  total?: number;
}
