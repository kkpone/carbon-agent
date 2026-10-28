import { Steps } from 'antd';
import { FC } from 'react';

import styles from './index.module.less';

export type Item = {
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  key: string;
};

type StepTabsProps = {
  currentStep: number;
  items: Item[];
  onChange: (step: number) => void;
  leftNode?: React.ReactNode;
  rightNode?: React.ReactNode;
  showSteps?: boolean;
};

export const StepTabs: FC<StepTabsProps> = props => {
  const {
    currentStep,
    items,
    onChange,
    leftNode,
    rightNode,
    showSteps = true,
  } = props;

  const stepWidth = 334 * (items.length - 1) + 96;

  return (
    <div className={styles.stepTab}>
      <div className={styles.headerWrapper}>
        <div className={styles.leftNode}>{leftNode}</div>
        <div
          className={styles.headerContent}
          style={{ left: '50%', marginLeft: `-${stepWidth / 2}px` }}
        >
          {showSteps && (
            <Steps
              style={{
                width: stepWidth,
              }}
              className={styles.stepsClass}
              current={currentStep}
              onChange={current => onChange(current)}
            >
              {items.map(item => (
                <Steps.Step
                  key={item.key}
                  title={item.label}
                  disabled={item.disabled}
                />
              ))}
            </Steps>
          )}
        </div>
        <div className={styles.rightNode}>{rightNode}</div>
      </div>
      <div className={styles.content}>
        {items[currentStep] && items[currentStep].content}
      </div>
    </div>
  );
};
