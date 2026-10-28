import { TableContext } from 'table-render/dist/src/types';

/** 处理刷新是否保留当前页 */
export const refreshAction = (
  /** true时，刷新时保留当前页 */
  applyDefaultOptions: boolean,
  refresh?: TableContext<any>['refresh'],
  // 这里添加了一个新的参数，用于接收额外的搜索参数
  searchParams?: any,
) => {
  const options = applyDefaultOptions ? { stay: true, tab: 1 } : undefined;
  // 将额外的搜索参数传递给 refresh 函数
  refresh?.(options, searchParams);
};
