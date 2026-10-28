import I18N from '@src/lang/I18N';
import { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

interface PaymentCountdownProps {
  /** 剩余时间字符串，格式：HH:MM:SS */
  restPayTime: string;
  /** 是否激活倒计时 */
  active?: boolean;
}

/**
 * 支付剩余时间倒计时组件
 */
export const PaymentCountdown = ({
  restPayTime,
  active = true,
}: PaymentCountdownProps) => {
  const [timeParts, setTimeParts] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalSecondsRef = useRef<number>(0);

  // 解析剩余时间显示
  const parseRestPayTime = (time: string) => {
    if (!time || time === '00:00:00') {
      return { hours: '00', minutes: '00', seconds: '00' };
    }
    const parts = time.split(':');
    return {
      hours: parts[0]?.padStart(2, '0') || '00',
      minutes: parts[1]?.padStart(2, '0') || '00',
      seconds: parts[2]?.padStart(2, '0') || '00',
    };
  };

  // 倒计时功能
  useEffect(() => {
    if (!active || !restPayTime || restPayTime === '00:00:00') {
      setTimeParts({ hours: '00', minutes: '00', seconds: '00' });
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return () => {};
    }

    // 初始化时间
    setTimeParts(parseRestPayTime(restPayTime));

    // 计算总秒数
    const parts = restPayTime.split(':');
    totalSecondsRef.current =
      parseInt(parts[0] || '0', 10) * 3600 +
      parseInt(parts[1] || '0', 10) * 60 +
      parseInt(parts[2] || '0', 10);

    // 每秒更新倒计时
    countdownTimerRef.current = setInterval(() => {
      if (totalSecondsRef.current <= 0) {
        setTimeParts({ hours: '00', minutes: '00', seconds: '00' });
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        return;
      }

      totalSecondsRef.current--;
      const hours = Math.floor(totalSecondsRef.current / 3600);
      const minutes = Math.floor((totalSecondsRef.current % 3600) / 60);
      const seconds = totalSecondsRef.current % 60;

      setTimeParts({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [active, restPayTime]);

  if (!active || !restPayTime || restPayTime === '00:00:00') {
    return null;
  }

  return (
    <div className={styles.paymentTimeRemaining}>
      <span className={styles.paymentTimeLabel}>
        {I18N.components.whenPayingTheRemainingBalance}
      </span>
      <div className={styles.paymentTimeBox}>{timeParts.hours}</div>
      <span className={styles.paymentTimeSeparator}>:</span>
      <div className={styles.paymentTimeBox}>{timeParts.minutes}</div>
      <span className={styles.paymentTimeSeparator}>:</span>
      <div className={styles.paymentTimeBox}>{timeParts.seconds}</div>
    </div>
  );
};
