/*
 * @Author: 张明尧
 * @Date: 2022-09-03 15:54:00
 */

/**
 * 处理科学计数法问题
 * @param num 当前可能被将科学计数法的数
 * @returns 处理号的数
 */
export const getFullNum = num => {
  // 处理非数字
  if (isNaN(num)) {
    return num;
  }

  // 处理不需要转换的数字
  const str = `${num}`;
  if (!/e/i.test(str)) {
    return num;
  }

  return num.toFixed(18).replace(/\.?0+$/, '');
};
