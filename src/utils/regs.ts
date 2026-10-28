/* eslint-disable no-useless-escape */
/** 正数（包括小数） */
export const REGEXP_MORE_ZERO_DECIMALS: RegExp =
  /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;

/** 大于0的正整数 */
export const REGEXP_MORE_ZERO_INTEGER: RegExp = /^(0|[1-9][0-9]*)$/;

/**
 * @description: 小数最多输入几位
 * @param {number} num 位数
 * @return {RegExp} 正则
 */
export const regexpDecimalsNum = (num: number | string, min?: number) => {
  if (typeof num === 'string') {
    return new RegExp(`^-?[0-9]+(\\.[0-9]{1,${min}})?$`);
  }

  // eslint-disable-next-line no-useless-escape
  return new RegExp(
    `(^-?[0-9]{1,11}$)|(^-?[0-9]{1,11}[\.]{1}[0-9]{${
      typeof min === 'number' ? min : 1
    },${num}}$)`,
  );
};
