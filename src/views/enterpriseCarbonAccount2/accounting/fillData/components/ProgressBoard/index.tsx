import { ClockCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Progress } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import ProgressModal from './ProgressModal';
import { getTaskProgressData, noticeTask } from './service';
import { Toast } from '@/utils';
import classNames from 'classnames';

type ProgressBoardProps = {
  emissionList: Record<string, any>[];
  computationId: string;
  computationPeriod?: string;
};

const WARN_COUNTDOWN_HOURS = 24;

/** 催报/催批成功后作为冷却起点，使用本机当前时刻（与 getWarnWindowEndMs 严格解析格式一致） */
const formatLocalWarnTime = () => moment().format('YYYY-MM-DD HH:mm:ss');

/** 从 warnTime 起 24 小时窗口的结束时间戳；解析失败返回 null */
const getWarnWindowEndMs = (warnTime: string): number | null => {
  const raw = `${warnTime || ''}`.trim();
  if (!raw) return null;

  const strict = moment(raw, 'YYYY-MM-DD HH:mm:ss', true);
  const m = strict.isValid() ? strict : moment(raw);
  if (!m.isValid()) return null;

  return m.clone().add(WARN_COUNTDOWN_HOURS, 'hours').valueOf();
};

/** 剩余毫秒数格式化为 HH:mm:ss（不超过 99:59:59 时仍按总小时数显示） */
const formatCountdownHms = (remainingMs: number) => {
  if (remainingMs <= 0) return '00:00:00';
  const totalSec = Math.floor(remainingMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(
    s,
  ).padStart(2, '0')}`;
};

const formatPercent = (numerator: number, denominator: number) => {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
};

/** 从 warnTime 起 24h 窗口的剩余时间，每秒刷新 */
const useWarnCountdown = (warnTime: string) => {
  const [text, setText] = useState('--:--:--');

  useEffect(() => {
    const endMs = getWarnWindowEndMs(warnTime);
    if (endMs == null) {
      setText('--:--:--');
      return () => {};
    }

    const tick = () => setText(formatCountdownHms(endMs - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [warnTime]);

  return text;
};

const countdownOver = (countdownText: string) =>
  countdownText === '--:--:--' || countdownText === '00:00:00';

const ProgressBoard = ({
  computationId,
  computationPeriod,
  emissionList,
}: ProgressBoardProps) => {
  const [progressData, setProgressData] = useState<{
    auditWarnTime: string;
    auditTotal: number;
    auditFinishCount: number;
    taskFinishCount: number;
    taskTotal: number;
    taskWarnTime: string;
  }>();

  const getData = async params => {
    const { data } = await getTaskProgressData(params);
    setProgressData(data.data);
  };

  useEffect(() => {
    getData({ computationId, computationPeriod });
  }, [computationId, computationPeriod, emissionList]);

  const taskWarnTime = progressData?.taskWarnTime ?? '';
  const auditWarnTime = progressData?.auditWarnTime ?? '';

  const taskCountdownText = useWarnCountdown(taskWarnTime);
  const auditCountdownText = useWarnCountdown(auditWarnTime);

  const [taskNoticeLoading, setTaskNoticeLoading] = useState(false);
  const [auditNoticeLoading, setAuditNoticeLoading] = useState(false);
  if (!progressData) {
    return null;
  }

  const { auditFinishCount, taskFinishCount, taskTotal, auditTotal } =
    progressData;

  const fillPercent = formatPercent(taskFinishCount, taskTotal);
  const approvePercent = formatPercent(auditFinishCount, auditTotal);

  return (
    <div className={styles.progressBoard}>
      {/* 左半区：填报进度 + 进度条 + 分数 + 倒计时(自 taskWarnTime 起 24h) */}
      <div className={styles.progressSegment}>
        <div className={styles.progressBlock}>
          <ProgressModal
            type={0}
            computationId={computationId}
            computationPeriod={computationPeriod}
          >
            <Button type='link' className={styles.progressHit}>
              {I18N.enterpriseCarbonAccount2.dataFillingProgress}
            </Button>
          </ProgressModal>

          <div className={styles.progressTrack}>
            <Progress
              percent={fillPercent}
              showInfo={false}
              strokeColor='#138d75'
              trailColor='#EBEDF0'
              strokeLinecap='round'
              strokeWidth={8}
            />
          </div>
          <span className={styles.progressCount}>
            {taskFinishCount}/{taskTotal}
          </span>
        </div>
        {countdownOver(taskCountdownText) ? (
          <button
            type='button'
            className={classNames(styles.remindButton, styles.reportBtn)}
            disabled={taskNoticeLoading}
            onClick={async () => {
              try {
                setTaskNoticeLoading(true);
                await noticeTask({
                  computationId,
                  computationPeriod,
                  type: 0,
                });
                Toast(
                  'success',
                  I18N.enterpriseCarbonAccount2.reportReminderSuccessful,
                );
                setProgressData({
                  ...progressData,
                  taskWarnTime: formatLocalWarnTime(),
                });
              } finally {
                setTaskNoticeLoading(false);
              }
            }}
          >
            <IconAlibabaNew type='icon-icon-youxiang-lin' />
            <span>{I18N.enterpriseCarbonAccount2.remindToFill}</span>
          </button>
        ) : (
          <div className={styles.timerBadge} aria-hidden>
            <ClockCircleOutlined className={styles.timerBadgeIcon} />
            <span>{taskCountdownText}</span>
          </div>
        )}
      </div>

      {/* 右半区：审批进度 + 进度条 + 分数 + 倒计时(自 auditWarnTime 起 24h) + 催批 */}
      <div className={styles.progressSegment}>
        <div className={styles.progressBlock}>
          <ProgressModal
            type={1}
            computationId={computationId}
            computationPeriod={computationPeriod}
          >
            <Button type='link' className={styles.progressHit}>
              {I18N.enterpriseCarbonAccount2.approvalVerificationProgress}
            </Button>
          </ProgressModal>
          <div className={styles.progressTrack}>
            <Progress
              percent={approvePercent}
              showInfo={false}
              strokeColor='#138d75'
              trailColor='#EBEDF0'
              strokeLinecap='round'
              strokeWidth={8}
            />
          </div>
          <span className={styles.progressCount}>
            {auditFinishCount}/{auditTotal}
          </span>
        </div>
        {countdownOver(auditCountdownText) ? (
          <button
            type='button'
            className={classNames(styles.remindButton, styles.approvalBtn)}
            disabled={auditNoticeLoading}
            onClick={async () => {
              try {
                setAuditNoticeLoading(true);
                await noticeTask({
                  computationId,
                  computationPeriod,
                  type: 1,
                });
                Toast(
                  'success',
                  I18N.enterpriseCarbonAccount2.successfullyUrgedForApproval,
                );
                setProgressData({
                  ...progressData,
                  auditWarnTime: formatLocalWarnTime(),
                });
              } finally {
                setAuditNoticeLoading(false);
              }
            }}
          >
            <IconAlibabaNew type='icon-fasong' />
            <span>{I18N.enterpriseCarbonAccount2.remindToApprove}</span>
          </button>
        ) : (
          <div className={styles.timerBadge} aria-hidden>
            <ClockCircleOutlined className={styles.timerBadgeIcon} />
            <span>{auditCountdownText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBoard;
