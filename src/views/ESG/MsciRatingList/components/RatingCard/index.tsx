import I18N, { LocaleType } from '@src/lang/I18N';
import { Popconfirm } from 'antd';
import classNames from 'classnames';
import { FC, useContext } from 'react';
import { useHistory } from 'react-router-dom';

// import EditIcon from '@/assets/svg/edit.svg';
import { LocaleContext } from '@/components/LocaleProvider';
import Permission from '@/components/Permission';
import { checkPermissions } from '@/components/Permission/utils';
import IconFont from '@/components/iconfont';

import styles from './index.module.less';

// MSCI 评级等级
const RATING_LEVELS = ['CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA'];

// 评级颜色映射（根据设计使用 #008077）
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

export interface RatingCardData {
  id: number;
  businessName: string;
  year: number;
  industry: string;
  rating: string;
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  environmentPercent: number;
  socialPercent: number;
  governancePercent: number;
}

export interface RatingCardProps {
  data: RatingCardData;
  // onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

// 获取评级颜色
const getRatingColor = (ratingLevel: string) =>
  RATING_COLORS[ratingLevel] || '#008077';

export const RatingCard: FC<RatingCardProps> = ({ data, onDelete }) => {
  const history = useHistory();

  // const handleEdit = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onEdit?.(data.id);
  // };

  const handleDelete = () => {
    onDelete?.(data.id);
  };

  const handleCardClick = () => {
    const hasPermission = checkPermissions(true, '/esg/msciRating/read');
    if (!hasPermission) {
      // mess.error(I18N.esg.noPermission);
      return;
    }
    history.push(`/ESG/msciRatingDetail?id=${data.id}`);
  };

  const { locale } = useContext(LocaleContext);

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  return (
    <div className={styles.ratingCard} onClick={handleCardClick}>
      <div className={styles.leftSection}>
        <div className={styles.companyName}>{data.businessName || '-'}</div>
        <div className={styles.tagsWrapper}>
          <div className={styles.tag}>{data.year}</div>
          <div className={styles.tag}>{data.industry}</div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.ratingContent}>
          <div className={styles.ratingHeader}>
            <div className={styles.ratingTitleWrapper}>
              <div
                className={styles.ratingTitleRow}
                style={{
                  borderTop: `1px solid ${getRatingColor(data.rating)}`,
                }}
              >
                <span className={styles.ratingTitleMain}>ESG</span>
                <span className={styles.ratingTitleSub} />
                {/* <Tooltip title='WAKIS: 关键议题加权得分,那根据企业实际指标情况得分,非最终得分,最终得分调对企业所属行业整体最终调整,无法预估'>
                  <InfoCircleOutlined className={styles.infoIcon} />
                </Tooltip> */}
              </div>
              <div className={styles.estimatedScore}>
                {I18N.esg.estimatedRating}
              </div>
            </div>
            <div className={styles.ratingCircleWrapper}>
              <div
                className={styles.ratingCircle}
                style={{
                  backgroundColor: getRatingColor(data.rating),
                }}
              >
                {data.rating}
              </div>
              <div className={styles.ratingInnerCircle} />
            </div>
            <Permission flag='/esg/msciRating/delete'>
              <div
                className={styles.ratingActions}
                onClick={e => e.stopPropagation()}
              >
                <Popconfirm
                  title={I18N.esg.confirmToDelete}
                  onConfirm={handleDelete}
                  okText={I18N.carbonFootprint.confirm2}
                  cancelText={I18N.carbonFootprint.cancel}
                >
                  <IconFont
                    // className={style.cardRemoveIcon}
                    className={styles.actionIcon}
                    type='icon-icon-shanshu-3'
                    onClick={e => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </Permission>
          </div>

          <div className={styles.ratingScale}>
            {RATING_LEVELS.map((level, index) => (
              <div
                key={level}
                className={`${styles.scaleItem} ${
                  level === data.rating ? styles.scaleItemActive : ''
                } ${index === 0 ? styles.scaleItemFirst : ''} ${
                  index === RATING_LEVELS.length - 1 ? styles.scaleItemLast : ''
                }`}
                style={{
                  backgroundColor:
                    level === data.rating
                      ? getRatingColor(data.rating)
                      : 'transparent',
                  color: level === data.rating ? '#fff' : '#04252b',
                }}
              >
                {level}
              </div>
            ))}
          </div>
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
                {data.environmentPercent}%
              </span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {data.environmentScore}
            </div>
          </div>
          <div className={styles.scoreItem}>
            <div
              className={classNames(styles.scoreLabelRow, {
                [styles.scoreLabelRowEn]: isEn,
              })}
            >
              <span className={styles.scoreLabel}>{I18N.esg.society}</span>
              <span className={styles.scorePercent}>{data.socialPercent}%</span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {data.socialScore}
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
                {data.governancePercent}%
              </span>
            </div>
            <div
              className={classNames(styles.scoreValue, {
                [styles.scoreValueEn]: isEn,
              })}
            >
              {data.governanceScore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
