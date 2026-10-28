/*
 * @@description:time format
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:41:17
 */

const addZero2Number = (num: string | number) =>
  // @ts-ignore
  num >= 10 ? num : `0${num}`;

export const timestampToTimeSecond = (timestamp: string | number | Date) => {
  const date = new Date(timestamp); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const Y = date.getFullYear();
  const M = addZero2Number(date.getMonth() + 1);
  const D = addZero2Number(date.getDate());
  const h = addZero2Number(date.getHours());
  const m = addZero2Number(date.getMinutes());
  const s = addZero2Number(date.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};
