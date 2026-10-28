/*
 * @Author: 张明尧
 * @Date: 2022-10-15 16:58:27
 */
export interface CountDownHoursProps {
  /** 计算开始时间 */
  startTime: Date;
  /** 精确到时分秒哪一种
   * hour - 就是 x小时x分钟x秒
   * minute - 就是 x分钟x秒
   * second - 就是 x秒
   */
  preciseType?: 'hour' | 'minute' | 'second';
}
