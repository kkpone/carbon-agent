import { ArrowLeftOutlined } from '@ant-design/icons';
import AiImgBg from '@assets/svg/ai_btn_bg.svg';
import AiImg from '@assets/svg/ai_white.svg';
import RefreshIcon from '@assets/svg/refresh.svg';
import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { message, Popover, Tooltip } from 'antd';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { FullscreenModal } from '@/components/FullscreenModal';
import Permission from '@/components/Permission';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { downloadFile, sleep } from '@/utils';

import { EditableCompanyName } from './components/EditableCompanyName';
import { EditableYear } from './components/EditableYear';
import { IssueCard } from './components/IssueCard';
import { IssueCatalog } from './components/IssueCatalog';
import { RatingInfo } from './components/RatingInfo';
import styles from './index.module.less';
import {
  aiMsciScoreModel,
  extractMsciRatingDetailResponse,
  getMsciRatingDetail,
  transformMsciRatingDetailData,
} from './service';
import { RatingModal } from '../MsciRatingList/components/RatingModal';
import {
  extractIndustryData,
  getIndustryData,
} from '../MsciRatingList/service';

export interface IMsciRatingDetailProps {}

export const MsciRatingDetail: FC<IMsciRatingDetailProps> = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') || '';
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const { data: detailResponse, refresh: refreshDetail } = useRequest(
    () => getMsciRatingDetail({ id }),
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  // 获取行业数据
  const { data: industryResponse } = useRequest(getIndustryData);
  const industryData = extractIndustryData(industryResponse);

  // 创建子行业 id 到名称的映射
  const subIndustryMap = useMemo(() => {
    const map = new Map<number | string, string>();
    industryData.forEach(industry => {
      if (industry.children) {
        industry.children.forEach(subIndustry => {
          map.set(subIndustry.id, subIndustry.name);
        });
      }
    });
    return map;
  }, [industryData]);

  // 根据子行业 id 获取名称
  const getSubIndustryName = (id: string | number | undefined): string => {
    if (!id) return '—';
    const name = subIndustryMap.get(Number(id));
    return name || '—';
  };

  // 提取并转换数据
  const rawData = extractMsciRatingDetailResponse(detailResponse);

  // 轮询定时器 ref
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [loadingIssue, setLoadingIssue] = useState(0);

  const isPolling = useMemo(() => {
    if (!rawData) return false;
    const { governanceStatus, environmentalStatus, socialStatus } = rawData;
    return (
      governanceStatus === 2 || environmentalStatus === 2 || socialStatus === 2
    );
  }, [rawData]);

  // 轮询逻辑：当有状态为 2（进行中）时，开始轮询直到所有状态都为 1（成功）
  useEffect(() => {
    if (!rawData) {
      // 如果没有数据，清除定时器
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return undefined;
    }

    const { governanceStatus, environmentalStatus, socialStatus } = rawData;

    // 检查是否有状态为 2（进行中）
    const hasProcessingStatus =
      governanceStatus === 2 || environmentalStatus === 2 || socialStatus === 2;

    // 检查是否所有状态都为 1（成功）
    const allCompleted =
      governanceStatus === 1 && environmentalStatus === 1 && socialStatus === 1;

    // 如果所有状态都已完成，清除定时器
    if (allCompleted) {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return undefined;
    }

    // 如果有进行中的状态，且还没有定时器，开始轮询
    if (hasProcessingStatus && !pollingTimerRef.current) {
      pollingTimerRef.current = setInterval(() => {
        refreshDetail();
      }, 3000); // 每 3 秒轮询一次
    }

    // 清理函数：当组件卸载时清除定时器
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rawData?.governanceStatus,
    rawData?.environmentalStatus,
    rawData?.socialStatus,
  ]);

  const ratingData = transformMsciRatingDetailData(rawData);

  // 企业名称状态，用于在编辑后更新显示
  const [companyName, setCompanyName] = useState(
    rawData?.businessName || ratingData?.companyName || '',
  );
  // 年份状态，用于在编辑后更新显示
  const [period, setPeriod] = useState(
    rawData?.period || ratingData?.period || '',
  );

  // 使用 ref 来标记是否刚刚编辑过，避免 useEffect 覆盖新数据
  const justEditedRef = useRef<{ companyName?: string; period?: string }>({});

  // 当 rawData 更新时，同步更新 companyName 和 period
  useEffect(() => {
    // 如果刚刚编辑过，跳过自动更新，避免抖动
    if (justEditedRef.current.companyName) {
      const editedValue = justEditedRef.current.companyName;
      justEditedRef.current.companyName = undefined;
      // 只在接口返回的数据与编辑的值不同时才更新（说明接口已确认）
      if (rawData?.businessName && rawData.businessName !== editedValue) {
        setCompanyName(rawData.businessName);
      }
      return;
    }
    if (justEditedRef.current.period) {
      const editedValue = justEditedRef.current.period;
      justEditedRef.current.period = undefined;
      // 只在接口返回的数据与编辑的值不同时才更新（说明接口已确认）
      if (rawData?.period && rawData.period !== editedValue) {
        setPeriod(rawData.period);
      }
      return;
    }

    // 正常情况下的数据同步
    if (rawData?.businessName) {
      setCompanyName(rawData.businessName);
    } else if (ratingData?.companyName) {
      setCompanyName(ratingData.companyName);
    }
    if (rawData?.period) {
      setPeriod(rawData.period);
    } else if (ratingData?.period) {
      setPeriod(ratingData.period);
    }
  }, [rawData, ratingData]);

  const groupedIssues = useMemo(() => {
    const env = rawData?.environmentalIssuesList || [];
    const social = rawData?.socialIssuesList || [];
    const gov = rawData?.governanceIssuesList || [];
    return { env, social, gov };
  }, [rawData]);

  // 支柱重新打分的 loading 状态，key 为支柱类型（1, 2, 3）
  const [pillarRefreshing, setPillarRefreshing] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    setPillarRefreshing(pre => ({
      ...pre,
      1: rawData?.environmentalStatus === 2,
      2: rawData?.socialStatus === 2,
      3: rawData?.governanceStatus === 2,
    }));
  }, [
    rawData?.governanceStatus,
    rawData?.environmentalStatus,
    rawData?.socialStatus,
  ]);

  // 处理支柱重新打分
  const handlePillarRefresh = async (type: 1 | 2 | 3) => {
    if (!rawData?.id || pillarRefreshing[type]) return; // 如果正在刷新中，禁止重复点击

    setPillarRefreshing(prev => ({ ...prev, [type]: true }));
    try {
      await aiMsciScoreModel({
        reportId: rawData.id,
        modelType: String(type),
      });
      await sleep(1000);
      // 请求成功后，刷新详情数据
      refreshDetail();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(I18N.esg.reRatingLost, error);
    } finally {
      setPillarRefreshing(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  const renderProgress = (percent?: string | number, fillColor?: string) => {
    const value = Number(percent) || 0;
    const filled = Math.round(Math.min(Math.max(value, 0), 100) / 10);
    return (
      <div className={styles.pillarProgressBar}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className={styles.pillarProgressSegment}
            style={{
              backgroundColor: idx < filled ? fillColor : '#fff',
              borderRadius:
                idx === 0
                  ? '4px 0 0 4px'
                  : idx === 9
                  ? '0 4px 4px 0'
                  : undefined,
            }}
          />
        ))}
      </div>
    );
  };

  const renderPillar = (
    type: 1 | 2 | 3,
    issues: {
      id: number | string;
      score?: any;
      percent?: any;
      name?: string;
    }[],
  ) => {
    if (!issues || issues.length === 0) return null;
    const config =
      type === 1
        ? {
            label: I18N.esg.environmentalPillar,
            color: '#3ab86e',
            bg: 'rgba(58, 184, 110, 0.1)',
            barBg: '#d8f1e2',
            score: ratingData?.environmentScore,
            percent: ratingData?.environmentPercent,
          }
        : type === 2
        ? {
            label: I18N.esg.pillarsOfSociety,
            color: '#f0d56c',
            bg: 'rgba(240, 213, 108, 0.2)',
            barBg: '#faf2d3',
            score: ratingData?.socialScore,
            percent: ratingData?.socialPercent,
          }
        : {
            label: I18N.esg.governancePillar,
            color: '#6e9fda',
            bg: 'rgba(110, 159, 218, 0.15)',
            barBg: '#e2ecf8',
            score: ratingData?.governanceScore,
            percent: ratingData?.governancePercent,
          };

    return (
      <div className={styles.pillarBlock} key={`pillar-${type}`}>
        <div
          className={styles.pillarHeader}
          style={{ backgroundColor: config.bg, borderLeftColor: config.color }}
        >
          <span className={styles.pillarName}>{config.label}</span>
          <span className={styles.pillarScore}>{config.score || '--'}</span>
          <span className={styles.pillarPercent}>
            {config.percent || '--'}
            {config.percent ? '%' : ''}
          </span>
          {renderProgress(config.percent, config.color)}
          {type === 3 && (
            <div>
              {I18N.esg.deductPoints}
              {ratingData?.governanceReduceScore ?? '--'}
            </div>
          )}
          <Permission flag='/esg/msciRating/update'>
            <div
              className={`${styles.refreshIcon} ${
                pillarRefreshing[type] ? styles.refreshIconRotating : ''
              } ${pillarRefreshing[type] ? styles.refreshIconDisabled : ''}`}
              onClick={e => {
                e.stopPropagation();
                handlePillarRefresh(type);
              }}
            >
              <img src={RefreshIcon} alt='' />
            </div>
          </Permission>
        </div>

        {issues.map(issue => (
          <IssueCard
            key={`${type}-${issue.id || Math.random()}`}
            issueId={issue.id}
            moduleType={type}
            issueLoading={loadingIssue > 0}
            setLoadingIssue={setLoadingIssue}
            parentRefreshing={pillarRefreshing[type]}
            name={(issue as any).name}
            percent={(issue as any).percent}
            score={(issue as any).score}
            color={config.color}
            barColor={config.barBg}
            refreshDetail={refreshDetail}
          />
        ))}
      </div>
    );
  };

  const issueLoading = false;

  return (
    <FullscreenModal>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.backArea}>
              <ArrowLeftOutlined
                className={styles.backIcon}
                onClick={handleBack}
              />
              <span className={styles.breadcrumbText}>{I18N.esg.aiRating}</span>
              <span className={styles.divider}>|</span>
              {rawData && ratingData ? (
                <EditableCompanyName
                  id={rawData.id}
                  period={period}
                  initialValue={companyName}
                  onUpdate={newValue => {
                    // 先更新本地状态，立即显示新值
                    setCompanyName(newValue);
                    // 标记刚刚编辑过，避免 useEffect 用旧数据覆盖
                    justEditedRef.current.companyName = newValue;
                    // 延迟刷新，确保状态已更新，避免抖动
                    setTimeout(() => {
                      refreshDetail();
                    }, 300);
                  }}
                />
              ) : (
                <span className={styles.companyName}>{companyName}</span>
              )}
              {rawData && ratingData ? (
                <EditableYear
                  id={rawData.id}
                  initialPeriod={period}
                  businessName={companyName}
                  onUpdate={newPeriod => {
                    // 先更新本地状态，立即显示新值
                    setPeriod(newPeriod);
                    // 标记刚刚编辑过，避免 useEffect 用旧数据覆盖
                    justEditedRef.current.period = newPeriod;
                    // 延迟刷新，确保状态已更新，避免抖动
                    setTimeout(() => {
                      refreshDetail();
                    }, 300);
                  }}
                />
              ) : (
                <span className={styles.yearDisplay}>{period || '—'}</span>
              )}
              <span className={styles.industryDisplay}>
                {getSubIndustryName(ratingData?.industrySub)}
              </span>
              {ratingData &&
                (ratingData.referFiles.length > 0 ||
                  ratingData.esgReportId) && (
                  <Popover
                    content={
                      <div className={styles.fileListPopover}>
                        {ratingData.esgReportId && (
                          <div className={styles.fileItem}>
                            <div
                              className={styles.fileName}
                              title={ratingData.esgReportName}
                            >
                              {ratingData.esgReportName}
                            </div>
                            <IconAlibabaNew
                              className={styles.downloadIcon}
                              type='icon-link'
                              onClick={e => {
                                e.stopPropagation();
                                history.push({
                                  pathname: RouteMaps.ESGAiGenerateDetail,
                                  search: `?id=${ratingData.esgReportId}`,
                                });
                              }}
                            />
                          </div>
                        )}
                        {ratingData.referFiles.map(file => (
                          <div className={styles.fileItem}>
                            <div className={styles.fileName} title={file.name}>
                              {file.name}
                            </div>
                            <IconAlibaba
                              className={styles.downloadIcon}
                              type='icon-icon_daoru'
                              onClick={e => {
                                e.stopPropagation();
                                downloadFile(file.url, file.name);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    }
                    trigger='hover'
                    overlayInnerStyle={{ padding: '12px' }}
                  >
                    <div className={styles.referFilesDisplay}>
                      <IconAlibabaNew
                        className={styles.referFilesIcon}
                        type='icon-link'
                      />
                      <span className={styles.referFilesCount}>
                        +
                        {ratingData.referFiles.length +
                          (ratingData.esgReportId ? 1 : 0)}
                      </span>
                    </div>
                  </Popover>
                )}
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.tipText}>{I18N.esg.thisResultIsA}</span>
            <Permission flag='/esg/msciRating/update'>
              <Tooltip title={I18N.esg.reRating}>
                <div
                  className={styles.addAccountBtn}
                  onClick={() => {
                    if (isPolling || loadingIssue > 0) {
                      message.info(I18N.esg.generating);
                      return;
                    }
                    setRatingModalOpen(true);
                  }}
                >
                  <div className={styles.addAccountBtnPrefix}>
                    <img alt='' src={AiImgBg} />
                    <img
                      className={styles.addAccountBtnAiIcon}
                      alt=''
                      src={AiImg}
                    />
                  </div>
                  {I18N.carbonFootPrintLCA.rating}
                </div>
              </Tooltip>
            </Permission>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.leftPanel}>
            <RatingInfo
              rating={ratingData?.rating}
              wakisScore={ratingData?.wakisScore}
              environmentScore={ratingData?.environmentScore}
              socialScore={ratingData?.socialScore}
              governanceScore={ratingData?.governanceScore}
              environmentPercent={ratingData?.environmentPercent}
              socialPercent={ratingData?.socialPercent}
              governancePercent={ratingData?.governancePercent}
            />
            <IssueCatalog
              environmentalIssues={groupedIssues.env}
              socialIssues={groupedIssues.social}
              governanceIssues={groupedIssues.gov}
            />
          </div>
          <div className={styles.rightPanel}>
            {issueLoading && (
              <div className={styles.loadingState}>
                {I18N.components.loading}
              </div>
            )}
            {!issueLoading &&
              ([1, 2, 3] as const).map(type =>
                renderPillar(
                  type,
                  type === 1
                    ? groupedIssues.env
                    : type === 2
                    ? groupedIssues.social
                    : groupedIssues.gov,
                ),
              )}
          </div>
        </div>
      </div>

      {ratingModalOpen && (
        <RatingModal
          open={ratingModalOpen}
          editId={rawData?.id ? Number(rawData.id) : undefined}
          onCancel={() => {
            setRatingModalOpen(false);
          }}
          onConfirm={async () => {
            setRatingModalOpen(false);
            // 刷新详情数据
            refreshDetail();
          }}
        />
      )}
    </FullscreenModal>
  );
};

export default MsciRatingDetail;
