import { InfoCircleOutlined } from '@ant-design/icons';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, useContext } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import styles from './index.module.less';

// MSCI 评级等级
const RATING_LEVELS = ['CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA'];

// 评级颜色映射
const RATING_COLORS: Record<string, string> = {
  AAA: '#008077',
  AA: '#008077',
  A: '#008077',
  BBB: '#faad14',
  BB: '#faad14',
  B: '#ff4d4f',
  C: '#ff4d4f',
  CC: '#ff4d4f',
  CCC: '#ff4d4f',
};

export interface RatingInfoProps {
  rating?: string;
  wakisScore?: number;
  environmentScore?: number;
  socialScore?: number;
  governanceScore?: number;
  environmentPercent?: number;
  socialPercent?: number;
  governancePercent?: number;
}

// 获取评级颜色
const getRatingColor = (ratingLevel: string) =>
  RATING_COLORS[ratingLevel] || '#008077';

export const RatingInfo: FC<RatingInfoProps> = ({
  rating,
  wakisScore,
  environmentScore,
  socialScore,
  governanceScore,
  environmentPercent,
  socialPercent,
  governancePercent,
}) => {
  const { locale } = useContext(LocaleContext);

  // 获取 URL 参数

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;
  return (
    <div className={styles.ratingInfo}>
      <div className={styles.ratingCard}>
        <div className={styles.ratingHeaderWrapper}>
          <div className={styles.ratingHeader}>
            <div className={styles.ratingTitleRow}>
              <span className={styles.ratingTitleMain}>ESG</span>
              <span className={styles.ratingTitleSub}>(WAKIS)</span>
              <Tooltip title={I18N.esg.wakis}>
                <InfoCircleOutlined className={styles.infoIcon} />
              </Tooltip>
            </div>
            <div className={styles.estimatedScore}>
              {I18N.esg.estimatedRating}
            </div>
          </div>
          <div className={styles.ratingCircleWrapper}>
            <div
              className={styles.ratingCircle}
              style={{ backgroundColor: getRatingColor(rating) }}
            >
              {rating || '--'}
            </div>
            <div className={styles.ratingInnerCircle} />
          </div>
        </div>
        <div className={styles.ratingScale}>
          {RATING_LEVELS.map(level => (
            <div
              key={level}
              className={`${styles.scaleItem} ${
                level === rating ? styles.scaleItemActive : ''
              }`}
              style={{
                backgroundColor:
                  level === rating ? getRatingColor(level) : 'transparent',
                color: level === rating ? '#fff' : '#04252b',
              }}
            >
              {level}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.wakisScore}>
        <div className={styles.wakisScoreHeader}>
          <span className={styles.wakisScoreTitle}>
            {I18N.esg.keyIssuesAdded}
          </span>
          <span className={styles.wakisScoreSub}>(WAKIS)</span>
          <span className={styles.wakisScoreValue}>{wakisScore || '--'}</span>
        </div>
        <div className={styles.scoreBreakdown}>
          <div className={styles.scoreItem}>
            <div
              className={classNames(styles.scoreLabelRow, {
                [styles.scoreLabelRowEn]: isEn,
              })}
            >
              <span className={styles.scoreLabel}>{I18N.esg.environment}</span>
              <span className={styles.scorePercent}>
                {environmentPercent || '--'}%
              </span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {environmentScore || '--'}
            </div>
          </div>
          <div className={styles.scoreItem}>
            <div
              className={classNames(styles.scoreLabelRow, {
                [styles.scoreLabelRowEn]: isEn,
              })}
            >
              <span className={styles.scoreLabel}>{I18N.esg.society}</span>
              <span className={styles.scorePercent}>
                {socialPercent || '--'}%
              </span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {socialScore || '--'}
            </div>
          </div>
          <div className={styles.scoreItem}>
            <div
              className={classNames(styles.scoreLabelRow, {
                [styles.scoreLabelRowEn]: isEn,
              })}
            >
              <span className={styles.scoreLabel}>{I18N.esg.governance}</span>
              <span className={styles.scorePercent}>
                {governancePercent || '--'}%
              </span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {governanceScore || '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
