import I18N from '@src/lang/I18N';
import { Checkbox, Input, Tooltip } from 'antd';
import classNames from 'classnames';
import { isNull } from 'lodash-es';
import { FC, useMemo, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';

import climateSvg from './climate.svg';
import copySvg from './copy.svg';
import disableCopySvg from './disableCopy.svg';
import forestSvg from './forest.svg';
import styles from './index.module.less';
import waterSvg from './water.svg';
import { EssentialIssue, ScoreData } from '../../service';
import { ProgressItem } from '../ProgressItem';
import { Question } from '../Question';

export interface IModulesCardProps {
  info: ScoreData;
  replaceContent?: (targetHeader: string, content: string) => void;
  getContentByHeader?: (targetHeader: string) => string;
  refresh?: () => void;
  loading?: boolean;
  reScoreByModelType?: (modelType: '1' | '2' | '3' | '4') => void;
  /** 1 完整版 2 中小版 */
  reportVersion?: string;
  userAnswerLoading?: boolean;
  setUserAnswerLoading?: (loading: boolean) => void;
  disable?: boolean;
  isOnline?: boolean;
}

const getIcon = (icon: string) => {
  switch (icon) {
    case '1':
    case '4':
      return climateSvg;
    case '2':
      return waterSvg;
    case '3':
      return forestSvg;
    default:
      return null;
  }
};

const getBgColor = (ruleType: number) => {
  switch (ruleType) {
    case 1:
    case 4:
      return '#e71b48';
    case 3:
      return '#9ece70';
    case 2:
      return '#489ED7';
    default:
      return '#E5E5E5';
  }
};

/** 气候：#EF95AC，森林：#C9DDBA，水 ：#7FC3F0 */
const getDisableBgColor = (ruleType: number) => {
  switch (ruleType) {
    case 1:
    case 4:
      return '#EF95AC';
    case 3:
      return '#C9DDBA';
    case 2:
      return '#7FC3F0';
    default:
      return '#E5E5E5';
  }
};

const getTitle = (ruleType: string) => {
  switch (ruleType) {
    case '1':
    case '4':
      return I18N.enterpriseCarbonAccount2.climateChange;
    case '2':
      return I18N.enterpriseCarbonAccount2.waterSecurity;
    case '3':
      return I18N.enterpriseCarbonAccount2.forest;
    default:
      return '';
  }
};

const renderIssueText = (text?: string | null) => text || '-';

const renderIssueTitle = (issue: EssentialIssue) => {
  const title = issue.problemTitle || issue.name;
  if (issue.ecCode && title) {
    return `${issue.ecCode} ${title}`;
  }
  return issue.ecCode || title || '-';
};

interface EssentialIssuesProps {
  title: string;
  count?: number;
  issues?: EssentialIssue[];
  type: 'failed' | 'unknown';
}

const EssentialIssues: FC<EssentialIssuesProps> = ({
  title,
  count,
  issues = [],
  type,
}) => {
  const [showAll, setShowAll] = useState(false);
  const showIssues = showAll ? issues : issues.slice(0, 3);

  if (!count && issues.length === 0) {
    return null;
  }

  return (
    <div className={styles.essentialIssues}>
      <div className={styles.essentialHeader}>
        <div className={styles.essentialTitle}>
          {title}
          <span className={styles.essentialCount}>
            {count || issues.length}
          </span>
        </div>
        {issues.length > 3 && (
          <div
            className={styles.expandAll}
            onClick={() => setShowAll(pre => !pre)}
          >
            {showAll ? '收起' : '展开全部'}
          </div>
        )}
      </div>
      <div className={styles.essentialList}>
        {showIssues.map((issue, index) => (
          <div
            className={classNames(styles.essentialItem, {
              [styles.unknownIssue]: type === 'unknown',
            })}
            key={`${issue.criteriaId || issue.ecCode || index}-${type}`}
          >
            <div className={styles.issueIndex}>{index + 1}</div>
            <div className={styles.issueContent}>
              <div className={styles.issueName}>{renderIssueTitle(issue)}</div>
              <div className={styles.issueMeta}>
                <span>约束原因：</span>
                {renderIssueText(issue.evidence)}
              </div>
              <div className={styles.issueMeta}>
                <span>关联题目：</span>
                {renderIssueText(issue.relatedQuestionCodes)}
              </div>
              <div className={styles.issueMeta}>
                <span>建议：</span>
                {renderIssueText(issue.summary || issue.failImpact)}
              </div>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className={styles.emptyIssue}>暂无明细</div>
        )}
      </div>
    </div>
  );
};

export const ModulesCard: FC<IModulesCardProps> = props => {
  const {
    info,
    replaceContent,
    getContentByHeader,
    refresh,
    loading,
    reScoreByModelType,
    reportVersion,
    userAnswerLoading,
    setUserAnswerLoading,
    disable = false,
    isOnline = false,
  } = props;
  const [open, setOpen] = useState<boolean>(
    info.ruleType === 1 || info.ruleType === 4,
  );
  const [search, setSearch] = useState<string>('');
  const [onlyOptimize, setOnlyOptimize] = useState<boolean>(false);

  const showQuestion = useMemo(() => {
    const filter = info.questionDataList?.filter(
      item =>
        item.questionTitle.includes(search) ||
        item.questionCode.includes(search),
    );
    if (onlyOptimize) {
      return filter?.filter(item => !item.scoreAll);
    }
    return filter;
  }, [info.questionDataList, onlyOptimize, search]);

  const hasScorePermission = checkPermissions(
    true,
    '/enterpriseCarbonAccounting/cdp/aiScore',
  );

  return (
    <div className={styles.modulesCard}>
      <div className={styles.cardInfo}>
        <div className={styles.header}>
          <div className={styles.left}>
            <div className={styles.icon}>
              <img src={getIcon(info.ruleType.toString() || '') || ''} alt='' />
            </div>
            <div className={styles.title}>
              {getTitle(info.ruleType.toString() || '')}
            </div>
            {!disable && (
              <div
                className={classNames(styles.score, {
                  [styles.scoreA]: info.ruleType === 1 || info.ruleType === 4,
                  [styles.scoreB]: info.ruleType === 2,
                  [styles.scoreC]: info.ruleType === 3,
                })}
              >
                {reportVersion === '2' ? 'SME' : ''} {info.scores || '-'}
              </div>
            )}
          </div>
          {!disable && hasScorePermission && (
            <div
              className={styles.right}
              onClick={() => {
                if (loading || userAnswerLoading) {
                  return;
                }
                reScoreByModelType?.(
                  info.ruleType.toString() as '1' | '2' | '3' | '4',
                );
              }}
            >
              <Tooltip
                title={
                  userAnswerLoading
                    ? I18N.components.reRatingInProgress
                    : I18N.components.remark
                }
              >
                <img
                  src={userAnswerLoading ? disableCopySvg : copySvg}
                  style={{
                    cursor: userAnswerLoading ? 'not-allowed' : 'pointer',
                  }}
                  alt=''
                />
              </Tooltip>
            </div>
          )}
          {disable && (
            <div className={styles.disable}>
              {I18N.carbonFootPrintLCA.notApplicable}
            </div>
          )}
        </div>
        {!disable && (
          <div className={styles.progressWrapper}>
            {/* {info.questionDataList?.map((step: any) => (
              <ProgressItem progress={{
                ...step,
                score: 'A',
              }} />
            ))} */}
            <ProgressItem
              progress={{
                name: I18N.esg.disclose,
                percent: Number(info.disclosurePercent || 0) * 100,
                score: 'D',
                reportScore: info.scores,
                bgColor: getBgColor(info.ruleType || 1),
                disableBgColor: getDisableBgColor(info.ruleType || 1),
                reportVersion,
                line1Percent: isNull(info.disclosurePercent1)
                  ? null
                  : Number(info.disclosurePercent1 || 0) * 100,
                line2Percent: isNull(info.disclosurePercent2)
                  ? null
                  : Number(info.disclosurePercent2 || 0) * 100,
              }}
            />
            <ProgressItem
              progress={{
                name: I18N.components.cognition,
                percent: Number(info.cognitionPercent || 0) * 100,
                score: 'C',
                reportScore: info.scores,
                bgColor: getBgColor(info.ruleType || 1),
                disableBgColor: getDisableBgColor(info.ruleType || 1),
                reportVersion,
                line1Percent: isNull(info.cognitionPercent1)
                  ? null
                  : Number(info.cognitionPercent1 || 0) * 100,
                line2Percent: isNull(info.cognitionPercent2)
                  ? null
                  : Number(info.cognitionPercent2 || 0) * 100,
              }}
            />
            <ProgressItem
              progress={{
                name: I18N.carbonFootprint.administration,
                percent: Number(info.managePercent || 0) * 100,
                score: 'B',
                reportScore: info.scores,
                bgColor: getBgColor(info.ruleType || 1),
                disableBgColor: getDisableBgColor(info.ruleType || 1),
                reportVersion,
                line1Percent: isNull(info.managePercent1)
                  ? null
                  : Number(info.managePercent1 || 0) * 100,
                line2Percent: isNull(info.managePercent2)
                  ? null
                  : Number(info.managePercent2 || 0) * 100,
              }}
            />
            {reportVersion === '1' && (
              <ProgressItem
                progress={{
                  name: I18N.components.leader,
                  percent: Number(info.leaderPercent || 0) * 100,
                  score: 'A',
                  reportScore: info.scores,
                  bgColor: getBgColor(info.ruleType || 1),
                  disableBgColor: getDisableBgColor(info.ruleType || 1),
                  reportVersion,
                  line1Percent: isNull(info.leaderPercent1)
                    ? null
                    : Number(info.leaderPercent1 || 0) * 100,
                  line2Percent: null,
                }}
              />
            )}
          </div>
        )}
      </div>
      {!disable && (
        <div className={styles.switch}>
          <div
            className={styles.switchText}
            onClick={() => setOpen(pre => !pre)}
          >
            <svg
              className={classNames(styles.btn, {
                [styles.switchOpen]: open,
              })}
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
            >
              <path
                d='M2.54624 9.18942C2.43242 9.12093 2.30192 9.08514 2.16908 9.08599C2.03624 9.08683 1.90621 9.12428 1.79327 9.19422C1.68034 9.26417 1.58888 9.3639 1.52893 9.48245C1.46899 9.60099 1.44288 9.73377 1.45348 9.86619C1.47521 10.1363 1.64595 10.3714 1.896 10.4755L7.6759 13.3655C7.77675 13.4163 7.8881 13.4427 8.00102 13.4427C8.11394 13.4427 8.22529 13.4163 8.32614 13.3655L14.106 10.4755C14.4303 10.2805 14.5491 9.86816 14.3784 9.53034C14.2076 9.19252 13.8052 9.04408 13.4558 9.18942L8.00102 11.9131L2.54624 9.18942ZM2.54624 4.52175C2.43242 4.45326 2.30192 4.41747 2.16908 4.41832C2.03624 4.41917 1.90621 4.45661 1.79327 4.52655C1.68034 4.5965 1.58888 4.69623 1.52893 4.81478C1.46899 4.93333 1.44288 5.0661 1.45348 5.19852C1.47521 5.46833 1.64595 5.7037 1.896 5.80784L7.6759 8.69779C7.77675 8.74859 7.8881 8.77505 8.00102 8.77505C8.11394 8.77505 8.22529 8.74859 8.32614 8.69779L14.106 5.80784C14.2287 5.75676 14.3349 5.67287 14.4129 5.56538C14.491 5.45788 14.5379 5.33095 14.5486 5.19852C14.5592 5.06611 14.533 4.93334 14.4731 4.8148C14.4131 4.69627 14.3217 4.59655 14.2087 4.52661C14.0958 4.45667 13.9658 4.41922 13.833 4.41836C13.7001 4.4175 13.5696 4.45328 13.4558 4.52175L8.00102 7.24548L2.54624 4.52175Z'
                fill='#939393'
              />
            </svg>
          </div>
          <div
            className={classNames(styles.questionsWrapper, {
              [styles.questionOpen]: open,
            })}
          >
            <div className={styles.search}>
              {!!info.failedEssentialCount && (
                <div className={styles.essentialSummary}>
                  按题目得分可达 {info.baseScores || info.scores || '-'} →{' '}
                  基础约束校验结果为 {info.finalScores || info.scores || '-'}
                </div>
              )}
              <EssentialIssues
                title='未通过基础约束（影响当前评级）'
                count={info.failedEssentialCount}
                issues={info.essentialFailList}
                type='failed'
              />
              <EssentialIssues
                title='待确认基础约束（可能影响评级）'
                count={info.unknownEssentialCount}
                issues={info.essentialUnknownList}
                type='unknown'
              />
              <div className={styles.searchControls}>
                <Input
                  size='small'
                  style={{
                    height: '32px',
                    width: '200px',
                  }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={I18N.components.search}
                />
                <Checkbox
                  value={onlyOptimize}
                  onChange={e => setOnlyOptimize(e.target.checked)}
                >
                  {I18N.components.onlyLookingForOptimizableOptions}
                </Checkbox>
              </div>
            </div>
            <div className={styles.questions}>
              {showQuestion.map(question => (
                <Question
                  question={question}
                  loading={loading}
                  refresh={() => {
                    refresh?.();
                  }}
                  isOnline={isOnline}
                  reportVersion={reportVersion}
                  userAnswerLoading={userAnswerLoading}
                  setUserAnswerLoading={setUserAnswerLoading}
                  getContentByHeader={getContentByHeader}
                  replaceContent={replaceContent}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
