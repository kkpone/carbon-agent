import { CloseOutlined } from '@ant-design/icons';
import { Progress } from 'antd';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';

import { AnimationFullscreenModal } from '@/components/AnimationFullscreenModal';

import defaultAnimation from './animations.json';
import styles from './index.module.less';

export interface LoadingProgressModalProps {
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 进度 0-100，不传则使用内置默认进度动画（每 500ms 随机递增，上限 95%） */
  progressPercent?: number;
  /** 提示文案 */
  text?: ReactNode;
  /** Lottie 动画数据，不传则使用内置默认动画 */
  animationData?: object;
  /** 动画宽高，默认 260 */
  animationSize?: number;
}

/**
 * 全屏加载进度弹窗：Lottie 动画 + 进度条 + 文案 + 关闭按钮
 */
export const LoadingProgressModal: FC<LoadingProgressModalProps> = ({
  open,
  onClose,
  progressPercent: progressPercentProp,
  text,
  animationData = defaultAnimation,
  animationSize = 260,
}) => {
  const [internalPercent, setInternalPercent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isControlled = progressPercentProp !== undefined;
  const progressPercent = isControlled ? progressPercentProp : internalPercent;

  useEffect(() => {
    if (!open) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setInternalPercent(0);
      return;
    }
    setInternalPercent(0);
    timerRef.current = setInterval(() => {
      setInternalPercent(prev => {
        const randomIncrement = 0.5 + Math.random();
        const newProgress = Math.min(95, prev + randomIncrement);
        return Number(newProgress.toFixed(2));
      });
    }, 500);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open]);

  return (
    <AnimationFullscreenModal open={open}>
      <div className={styles.loadingModal}>
        <div className={styles.loadingModalAnimation}>
          <Lottie
            animationData={animationData}
            loop
            play
            style={{ width: animationSize, height: animationSize }}
          />
        </div>
        <div className={styles.loadingModalProgress}>
          <Progress percent={progressPercent} status='active' />
        </div>
        {text != null && <div className={styles.loadingModalText}>{text}</div>}
        <div
          className={styles.closeModal}
          onClick={onClose}
          role='button'
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onClose()}
        >
          <CloseOutlined />
        </div>
      </div>
    </AnimationFullscreenModal>
  );
};
