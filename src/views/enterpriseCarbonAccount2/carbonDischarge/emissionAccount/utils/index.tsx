/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-06 11:00:52
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-16 22:53:22
 */

export const activityUnitCovers = (activeUint, unitList) => {
  const result = unitList.find(
    item => activeUint === item.dictValue,
  )?.dictLabel;

  return result;
};
