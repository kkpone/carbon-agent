/*
 * @Author: 张明尧
 * @Date: 2022-09-13 16:47:49
 */
// 对查询关键字中的特殊字符进行编码
/**
 * 根据当前名称获取路径上的参数
 * @param name 当前名称
 * @returns 返回对应的参数
 */
export const utilGetUrlParams = (name: string): string => {
  const search = new URLSearchParams(window.location.search);
  return search.get(name) || '';
};
