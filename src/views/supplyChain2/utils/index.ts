/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 15:16:58
 */
import I18N from '@src/lang/I18N';
import { regexpDecimalsNum, REGEXP_MORE_ZERO_DECIMALS } from '@src/utils/regs';
import { Dicts } from '@src/views/emission/Show/type';
import BigNumber from 'bignumber.js';
import moment, { Moment } from 'moment';

/**
 * @description: 单位产品排放量校验规则
 * @param {string} value 当前输入的值
 */
export const RegFactorUnitDischarge = (value: string) => {
  if (!value) return '';
  const newNum = new BigNumber(value);
  if (newNum.comparedTo(new BigNumber('9999999999.999999')) === 1) {
    return I18N.supplyChain2.theMaximumValueIs;
  }
  if (newNum.comparedTo(new BigNumber('-9999999999.999999')) === -1) {
    return I18N.supplyChain2.theMinimumValueIs;
  }
  if (!regexpDecimalsNum(6).test(value)) {
    return I18N.supplyChain2.maximumDecimalPlaces;
  }

  return '';
};

/**
 * @description: 单位产品排放量校验规则
 * @param {string} value 当前输入的值
 */
export const translateCasCaderData = (data: Dicts[]) => {
  const result = data.map(item => ({
    ...item,
    label: item.dictLabel,
    value: item.dictValue,
    children: item?.enumList?.map(ite => ({
      ...ite,
      label: ite.dictLabel,
      value: ite.dictValue,
    })),
  }));
  return result;
};

/**
 * @description: 单位产品排放量校验规则
 * @param {string} value 当前输入的值
 */
export const RegFactorEmission = (value: string) => {
  if (!value) return '';
  const newNum = new BigNumber(value);

  /** 正数 大于0 包含小数 */
  if (!REGEXP_MORE_ZERO_DECIMALS.test(value)) {
    return I18N.supplyChain2.theValueNeedsToBeLarge;
  }

  if (newNum.comparedTo(new BigNumber('9999999999.999999')) === 1) {
    return I18N.supplyChain2.theMaximumValueIs;
  }

  if (!regexpDecimalsNum(6).test(value)) {
    return I18N.supplyChain2.maximumDecimalPlaces;
  }

  return '';
};

/**
 * @description: 禁止选择日期
 * @param {string} value 当前输入的值
 */
export const disabledDate = current =>
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  current && current <= moment().subtract(1, 'days').endOf('day');
/**
 * @description: 禁止选择年份
 * @param {string} value 当前输入的值
 */
export const disabledDateYear = (current: Moment) =>
  !(
    current.isSameOrAfter('1990') &&
    current.isBefore(String(moment().year() + 1))
  );
