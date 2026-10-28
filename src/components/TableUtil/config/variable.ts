import { Variable } from '../types/variable';

/**
 * 表格需要的变量
 */
export const variableData: Variable = {
  /** 当前默认采用通用型组件 --- 暂未支持其他类型组件 */
  model: 'common',
  /** 表格没有返回值的时候显示的内容 */
  noText: '-',
  /** 每页显示的条数 */
  pageSize: 10,
  /** 是否固定分页到底部状态栏 -- 默认不固定底部 */
  pagePosition: false,
};
