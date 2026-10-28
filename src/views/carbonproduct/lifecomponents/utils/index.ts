import { ProductType } from '@src/components/Factor/utils';

// 发布年份：必选项，枚举值，1990年-当前年份
export const factorPublishYear = () => {
  const yearNow = new Date().getFullYear();
  const results = new Array(yearNow - 1990 + 1).fill(yearNow);
  return results.map((y, i) => y - i);
};

// 获取字典项 碳足迹 抽屉

/**
 * @description 临时存储 session storage 中的 key，用于保存选中的因子，用完即删
 */
const FACTOR_SEARCH_RESULT = 'FACTOR_SEARCH_RESULT';

export const setFactorSearchResult = ({
  factor,
}: // factorSource,
// ...props
{
  factor: Record<string, any>;
  factorSource: ProductType;
  //	是	因子id
  factorId: string | number;
  //	是	因子名称
  factorName: string | number;
}) => {
  sessionStorage.setItem(FACTOR_SEARCH_RESULT, JSON.stringify(factor));
};

// 编辑数据时保存到 sessionstorage 中的key
