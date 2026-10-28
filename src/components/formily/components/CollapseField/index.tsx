import type { Field } from '@formily/core';
import { connect, mapProps, useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { FormItemStatus } from '@src/views/enterpriseCarbonAccount2/CdpAiAssistant/detail/components/type';
import { useCdpAiAssistant } from '@src/views/enterpriseCarbonAccount2/CdpAiAssistant/detail/context';
import { useTimeout, useUpdate } from 'ahooks';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import collapseSvg from './collapse.svg';
import disableScoreSvg from './disableScore.svg';
import styles from './index.module.less';
import scoreSvg from './score.svg';

interface CollapseFieldProps {
  // define your props here
  label: string;
  description?: string;
  showTag?: boolean;
  questionStatus?: FormItemStatus;
  canCollapse?: boolean;
  hideScore?: boolean;
}

const TagText = {
  [FormItemStatus.filled]: I18N.enterpriseCarbonAccount2.completed,
  [FormItemStatus.generating]:
    I18N.enterpriseCarbonAccount2.aiGenerationInProgress,
  [FormItemStatus.toBeConfirmed]: I18N.carbonDataManagemen.toBeConfirmed,
  [FormItemStatus.unfilled]: I18N.DomesticVersion.notFilledIn,
};

const CollapseFieldComponent: React.FC<
  React.PropsWithChildren<CollapseFieldProps>
> = props => {
  // define your component logic here
  const field = useField() as Field;

  // const fieldSch
  const [collapse, setCollapse] = useState(false);
  const { selfModified, initialValue, value, component } = field;
  const {
    children,
    label,
    description,
    showTag = true,
    questionStatus,
    canCollapse = true,
    hideScore = false,
  } = props;

  const [showTagDelay, setShowTagDelay] = useState(false);
  useTimeout(() => {
    setShowTagDelay(true);
  }, 5000);

  const update = useUpdate();

  useEffect(() => {
    const isTable =
      component[1].renderType === 'table' || component[1].renderType === 'row';
    if (isTable && (!initialValue || initialValue === JSON.stringify(value))) {
      setTimeout(() => {
        field.selfModified = false;
        setTimeout(() => {
          update();
        }, 16);
      }, 32);
    }
  }, [initialValue, value, field]);

  const { rescore, ruleData } = useCdpAiAssistant();

  const handleRescore = async () => {
    await rescore(field.title.split(' ')[0]); // 传递模型类型
  };

  const canScore = ruleData?.includes(field.title?.split(' ')?.[0] || '');

  return (
    <div className={styles.collapse}>
      <div className={styles.header} id={field.props.name.toString()}>
        <div className={styles.left}>
          {canCollapse && (
            <div
              onClick={() => setCollapse(pre => !pre)}
              className={styles.icon}
            >
              <img src={collapseSvg} alt='' className={styles.collapseSvg} />
            </div>
          )}
          <div className={styles.title} id={`${field.title}`}>
            {label}
          </div>
        </div>
        <div className={styles.right}>
          {showTag && showTagDelay && (
            <div
              className={classNames(styles.tag, {
                [styles.filled]:
                  questionStatus === FormItemStatus.filled || selfModified,
                [styles.generating]:
                  questionStatus === FormItemStatus.generating,
                [styles.toBeConfirmed]:
                  questionStatus === FormItemStatus.toBeConfirmed,
                [styles.unfilled]: questionStatus === FormItemStatus.unfilled,
              })}
            >
              {selfModified
                ? TagText[FormItemStatus.filled]
                : TagText[questionStatus || FormItemStatus.unfilled]}
            </div>
          )}
          {(questionStatus === FormItemStatus.filled || selfModified) &&
            !hideScore && (
              <Tooltip
                title={
                  canScore
                    ? I18N.enterpriseCarbonAccount2.aiRating
                    : I18N.components.thereAreCurrentlyNoReviewsForThisQuestion
                }
              >
                <div
                  className={classNames(styles.rule, {
                    [styles.disable]: !canScore,
                  })}
                  onClick={() => {
                    if (canScore) {
                      handleRescore();
                    }
                  }}
                >
                  <img
                    src={canScore ? scoreSvg : disableScoreSvg}
                    alt=''
                    className={styles.scoreSvg}
                  />
                  {/* <div className={styles.ruleTitle}>评分</div> */}
                </div>
              </Tooltip>
            )}
        </div>
      </div>
      <div className={styles.desc}>{description}</div>
      {!collapse && (
        <div
          className={classNames({
            [styles.children]: canCollapse,
            [styles.childrenWithoutPadding]: !canCollapse,
          })}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const CollapseField = connect(
  CollapseFieldComponent,
  mapProps((props, field) => ({
    label: field.title,
    description: field.description,
  })),
);
