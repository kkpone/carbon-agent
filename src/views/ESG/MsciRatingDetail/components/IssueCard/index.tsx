import { DownOutlined } from '@ant-design/icons';
import RefreshIcon from '@assets/svg/refresh.svg';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { message, Tooltip } from 'antd';
import { FC, useEffect, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import BusinessExposurePanel from './BusinessExposurePanel';
import GovernanceMetricItem from './GovernanceMetricItem';
import ManagePanel from './ManagePanel';
import styles from './index.module.less';
import {
  aiMsciScoreSingle,
  extractIssuesInfo,
  getIssuesInfo,
  IssuesInfoData,
} from '../../service';

const formatNumber = (
  val: string | number | undefined | null,
  fallback = '--',
) =>
  val === undefined || val === null || val === ''
    ? fallback
    : Number.isNaN(Number(val))
    ? String(val)
    : Number(val);

const ProgressBar: FC<{ percent?: string | number; fillColor: string }> = ({
  percent,
  fillColor,
}) => {
  const value = Number(percent) || 0;
  const filled = Math.round(Math.min(Math.max(value, 0), 100) / 10);
  return (
    <div className={styles.progressBar}>
      {Array.from({ length: 10 }).map((_, idx) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className={styles.progressSegment}
          style={{
            backgroundColor: idx < filled ? fillColor : '#fff',
            borderRadius:
              idx === 0 ? '4px 0 0 4px' : idx === 9 ? '0 4px 4px 0' : undefined,
          }}
        />
      ))}
    </div>
  );
};

export interface IssueCardProps {
  issueId: number | string;
  moduleType: number;
  name?: string;
  percent?: string | number;
  score?: string | number;
  color: string;
  barColor: string;
  parentRefreshing: boolean;
  setLoadingIssue: (v: number | ((pre: number) => number)) => void;
  issueLoading: boolean;
  refreshDetail: () => void;
}

export const IssueCard: FC<IssueCardProps> = ({
  issueId,
  moduleType,
  name,
  percent,
  score,
  color,
  barColor,
  parentRefreshing,
  issueLoading,
  setLoadingIssue,
  refreshDetail,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [exposureOpen, setExposureOpen] = useState(true);
  const [manageOpen, setManageOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 重新打分中的状态

  const { data: detailResp, run } = useRequest(() => getIssuesInfo(issueId), {
    ready: !!issueId && !parentRefreshing, // 只有在视窗内且未请求过时才请求
    refreshDeps: [issueId],
    manual: false,
  });

  const issue = extractIssuesInfo(detailResp) || ({} as IssuesInfoData);
  const { aiStatus } = issue;
  const isGenerating = aiStatus === 0 || refreshing || parentRefreshing; // 0 表示生成中，或正在重新打分

  // 处理重新打分
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发展开/收起
    if (issueLoading) {
      message.info(I18N.esg.esgms);
      return;
    }
    if (!issue.id || refreshing || parentRefreshing) return; // 如果正在刷新中，禁止重复点击

    setRefreshing(true); // 立即设置为刷新中状态，显示旋转动画
    try {
      setLoadingIssue(pre => pre + 1);
      await aiMsciScoreSingle(Number(issue.id));
      // 请求成功后，重新获取 issue 信息
      run();
      setRefreshing(false);
      refreshDetail?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.esg.reRatingLost, error);
      setRefreshing(false); // 失败时重置状态
    } finally {
      setLoadingIssue(pre => pre - 1);
    }
  };

  // 当 aiStatus 变为 0 时，保持 refreshing 状态；当变为 1 或 2 时，重置 refreshing
  useEffect(() => {
    if (aiStatus === 1 || aiStatus === 2) {
      setRefreshing(false);
    }
  }, [aiStatus]);

  const displayName = issue.issuesName || name || I18N.esg.keyIssues;
  const displayScore = issue.issuesScore ?? score;
  const displayPercent = issue.issuesPercent ?? percent;
  const isGovernance = moduleType === 3;

  return (
    <div className={styles.issueCard}>
      {/* 议题头 */}
      <div
        id={`issue-${issueId}`}
        className={styles.issueHeader}
        style={{ borderLeftColor: color }}
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className={styles.issueHeaderLeft}>
          <span className={styles.issueChevron}>
            <DownOutlined rotate={expanded ? 180 : 0} />
          </span>
          <span className={styles.issueTitle}>{displayName}</span>
          <span className={styles.issueScore}>
            {formatNumber(displayScore)}
          </span>
          {!isGovernance && (
            <span className={styles.issuePercent}>
              {formatNumber(displayPercent)}
              {displayPercent ? '%' : ''}
            </span>
          )}
          {!isGovernance && (
            <ProgressBar percent={displayPercent} fillColor={barColor} />
          )}
        </div>
        {aiStatus === 2 && (
          <Tooltip title={I18N.esg.scoringFailedPlease}>
            <div className={styles.warningIcon} onClick={handleRefresh}>
              <IconAlibabaNew type='icon-Warning' />
            </div>
          </Tooltip>
        )}
        <div
          className={`${styles.refreshIcon} ${
            isGenerating ? styles.refreshIconRotating : ''
          } ${refreshing ? styles.refreshIconDisabled : ''}`}
          onClick={handleRefresh}
        >
          <img src={RefreshIcon} alt='' />
        </div>
      </div>

      {!expanded ? null : isGovernance ? (
        Array.isArray(issue.metricItemList) &&
        issue.metricItemList.length > 0 ? (
          <div className={styles.section}>
            <div className={styles.sectionBody}>
              {issue.metricItemList.map((item: any, idx: number) => (
                <GovernanceMetricItem
                  key={item.id || idx}
                  name={item.metricItemName}
                  score={item.metricItemScore}
                  content={item.metricItemContent}
                  suggestion={item.metricItemSuggestion}
                />
              ))}
            </div>
          </div>
        ) : null
      ) : (
        <>
          {/* 敞口评分 */}
          {issue.exposureScore && (
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                style={{
                  borderBottom: exposureOpen ? '1px solid #e5e7eb' : 'none',
                  paddingBottom: exposureOpen ? '8px' : '0',
                }}
                onClick={() => setExposureOpen(prev => !prev)}
              >
                <span className={styles.chevron}>
                  <DownOutlined rotate={exposureOpen ? 180 : 0} />
                </span>
                <span className={styles.sectionTitle}>
                  {I18N.esg.exposureScore}
                </span>
                <span className={styles.sectionScore}>
                  {formatNumber(issue.exposureScore.exposureScore)}
                </span>
              </div>
              {exposureOpen && (
                <div className={styles.sectionBody}>
                  {/* 业务敞口 */}
                  {issue.exposureScore.businessExposure && (
                    <BusinessExposurePanel
                      title={I18N.esg.businessExposure2}
                      score={
                        issue.exposureScore.businessExposure
                          .businessExposureScore
                      }
                      items={(
                        issue.exposureScore.businessExposure
                          .businessExposureDataItemList || []
                      ).map((item: any) => ({
                        id: item.id,
                        name: item.businessExposureDataName,
                        score: item.businessExposureDataScore,
                        content: item.businessExposureDataContent,
                        suggestion: item.businessExposureDataSuggestion,
                      }))}
                      suggestion={
                        issue.exposureScore.businessExposure
                          .businessExposureSuggestion
                      }
                    />
                  )}

                  {/* 地理敞口 */}
                  {issue.exposureScore.geographicExposure && (
                    <BusinessExposurePanel
                      title={I18N.esg.geographicalExposure}
                      score={
                        issue.exposureScore.geographicExposure
                          .geographicExposureScore
                      }
                      items={(
                        issue.exposureScore.geographicExposure
                          .geographicExposureDataItemList || []
                      ).map((item: any) => ({
                        id: item.id,
                        name: item.geographicExposureDataName,
                        score: item.geographicExposureDataScore,
                        content: item.geographicExposureDataContent,
                        suggestion: item.geographicExposureDataSuggestion,
                      }))}
                      suggestion={
                        issue.exposureScore.geographicExposure
                          .geographicExposureSuggestion
                      }
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 管理得分 */}
          {issue.manageScore && (
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setManageOpen(prev => !prev)}
              >
                <span className={styles.chevron}>
                  <DownOutlined rotate={manageOpen ? 180 : 0} />
                </span>
                <span className={styles.sectionTitle}>
                  {I18N.esg.managementScore}
                </span>
                <span className={styles.sectionScore}>
                  {formatNumber(issue.manageScore.managementScore)}
                </span>
              </div>
              {manageOpen && (
                <div className={styles.sectionBody}>
                  {(issue.manageScore.manageDimension || []).map(
                    (dimension: any, idx: number) => (
                      <ManagePanel
                        key={dimension.id || idx}
                        title={dimension.dimensionName}
                        score={dimension.dimensionScore}
                        items={(
                          dimension.manageDimensionDataItemList || []
                        ).map((item: any) => ({
                          id: item.id,
                          name: item.dataPointName,
                          score: item.dataPointScore,
                          content: item.dataPointScoreContent,
                          suggestion: item.dataPointSuggestion,
                          description: item.dataPointScoreDesc,
                        }))}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
