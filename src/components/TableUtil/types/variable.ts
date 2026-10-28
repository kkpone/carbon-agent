/**
 * 表格配置选项
 */
export interface Variable {
  model: 'common'; // 当前支持的几种表格组件的类型
  noText: string; // 如果表格中没有数据，默认显示 '-'
  pageSize: number; // 默认配置表格显示10条数据
  /** 是否固定分页到底部状态栏 -- 默认是不固定底部 */
  pagePosition: boolean;
}
