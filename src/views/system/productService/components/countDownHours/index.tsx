/**
 * 倒计时组件 - 可自定义为：小时 - 分钟 - 秒
 * 后面如果要求精准度的话，可以进行优化
 * @returns
 */
import I18N from '@src/lang/I18N';
import { useState } from 'react';
import { CountDownHoursProps } from './type';

const CountDownHours = (props: CountDownHoursProps) => {
  const { startTime } = props;
  /** 小时 */
  const [currentHour, setCurrentHour] = useState<number>(0);
  /** 分钟 */
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  /** 秒 */
  const [currentSecond, setCurrentSecond] = useState<number>(0);

  /**
   * 根据时间格式获取时间戳
   * @param time 当前的时间格式
   * @returns 毫秒的时间戳
   */
  const getTime = (time: Date) => new Date(time).getTime();
  /**
   * 动态添加 0
   * @param time 数字
   * @returns
   */
  const setZero = (time: number) => (time < 10 ? `0${time}` : time);
  /** 结束时间戳 */
  const endDateTime = getTime(startTime) + 60 * 60 * 2 * 1000;
  /** 当前时间时间戳 */
  const startDateTime = getTime(new Date());
  /** 获取当前的差值 */
  const timeDifference = endDateTime - startDateTime;
  /** 时间戳转换为秒数 */
  let timeDifferenceSeconds = Math.round(timeDifference / 1000);
  /** 执行倒计时 */
  const time = setInterval(() => {
    timeDifferenceSeconds--;
    if (timeDifferenceSeconds <= 0) {
      clearInterval(time);
      setCurrentHour(0);
      setCurrentMinute(0);
      setCurrentSecond(0);
    } else {
      setCurrentHour(parseInt(`${(timeDifferenceSeconds / 60 / 60) % 24}`, 10));
      setCurrentMinute(parseInt(`${(timeDifferenceSeconds / 60) % 60}`, 10));
      setCurrentSecond(parseInt(`${timeDifferenceSeconds % 60}`, 10));
    }
  }, 1000);
  /** 拿到当前秒数 开始循环 */

  return (
    <span>{I18N.template(I18N.system.setZe, { val1: setZero(currentHour),
val2: setZero(currentMinute),
val3: setZero(
      currentSecond,
    ) })}</span>
  );
};

export default CountDownHours;
