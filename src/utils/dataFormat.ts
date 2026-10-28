/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-12 15:40:45
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-12 15:51:28
 */
import { Citys } from '@src/api/types';

/** 处理城市数据, 原来code 是number，代码接口用到的是string */
export const formatCityTree = (cityTree?: Citys[]): Citys[] => {
  const dataFomat = (city: Citys): Citys => ({
    ...city,
    code: `${city.code}`,
    children: city.children ? city.children.map(c => dataFomat(c)) : [],
  });
  return cityTree?.map(c => dataFomat(c)) || [];
};
