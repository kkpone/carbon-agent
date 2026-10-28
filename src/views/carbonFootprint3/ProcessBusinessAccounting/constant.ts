/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-04-03 09:47:41
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-03 16:57:30
 */
import distributionImg from '@src/assets/svg/distribution.svg';
import productFillImg from '@src/assets/svg/icon_product_fill2.svg';
import scrapFillImg from '@src/assets/svg/icon_scrap_fill.svg';
import productImg from '@src/assets/svg/product.svg';
import useImg from '@src/assets/svg/use.svg';

/** 过程核算 - 区分节点是因子，过程和供应商 */
export const PROCESS_MATCH_TYPE = {
  FACTOR: 0,
  PROCESS: 1,
  PROVIDER: 2,
  SUPPLIER: 5,
} as const;

export const ICON_IMG_MAP = {
  0: productFillImg,
  1: productImg,
  2: distributionImg,
  3: useImg,
  4: scrapFillImg,
};
