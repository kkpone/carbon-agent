import useUrlState from '@ahooksjs/use-url-state';
import {
  CheckCircleOutlined,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import AiCompanyRankImg from '@assets/images/ai_company_rank.png';
import AiDistributionImg from '@assets/images/ai_distribution.png';
import AiReportImg from '@assets/images/ai_report.png';
import rankImg1 from '@assets/images/rank_1.png';
import rankImg2 from '@assets/images/rank_2.png';
import rankImg3 from '@assets/images/rank_3.png';
import atonIcon from '@assets/svg/aton.svg';
import Permission from '@src/components/Permission';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import {
  Button,
  Popover,
  Input,
  Select,
  Spin,
  Tabs,
  Tooltip,
  Empty,
} from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconAlibaba } from '@/components/iconfont';

import DistributionChart from './components/DistributionChart';
import ReportTable from './components/ReportTable';
import UploadModal from './components/UploadModal';
import {
  AI_TIP_STATUS,
  REPORT_ANALYZE_STATUS,
  REPORT_ANALYZE_STATUS_DESC,
  REPORT_CLOSE_STATUS,
  REPORT_TYPE,
  REPORT_TYPE_LABEL,
} from './constant';
import styles from './index.module.less';
import {
  analyzeReport,
  closeAiTip,
  closeReportAnalyzeStatus,
  getAiTipStatus,
  getIndustryList,
  getReportAnalyzeStatus,
  getReportData,
  getYearList,
} from './service';
import {
  Industry,
  ReportOverview,
  ReportStatus,
  Score,
  SearchParams,
} from './type';
import ScoresTag from '../components/RankTag';

const AiReport: FC = () => {
  const [urlParams, setUrlParams] = useUrlState<SearchParams>(
    {
      type: REPORT_TYPE.ALL,
      pageNum: 1,
      pageSize: 10,
      refreshFlag: false,
    },
    {
      parseOptions: {
        parseNumbers: true,
        parseBooleans: true,
      },
      stringifyOptions: {
        arrayFormat: 'comma',
      },
    },
  );

  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const [yearList, setYearList] = useState<string[]>([]);

  const [industryList, setIndustryList] = useState<Industry[]>([]);

  const [reportData, setReportData] = useState<ReportOverview>();

  const [reportDataLoading, setReportDataLoading] = useState(false);

  const [reportAnalyzeStatus, setReportAnalyzeStatus] =
    useState<ReportStatus>();

  const prevReportAnalyzeStatus = useRef<number>();

  const [currScore, setCurrScore] = useState<Score>();

  const [popoverOpen, setPopoverOpen] = useState<true>();

  const popoverRef = useRef<{ setPopupVisible(visible: boolean): void }>();

  const history = useHistory();

  const { year, industry, type, companyName } = urlParams;

  const loopReportAnalyzeStatus = async () => {
    const { data } = await getReportAnalyzeStatus();
    setReportAnalyzeStatus(data.data);

    if (
      prevReportAnalyzeStatus.current === REPORT_ANALYZE_STATUS.PROCESSING &&
      data.data.uploadStatus === REPORT_ANALYZE_STATUS.SUCCESS
    ) {
      const refreshFlag =
        new URLSearchParams(location.search).get('refreshFlag') === 'true';
      setUrlParams({
        refreshFlag: !refreshFlag,
        pageNum: 1,
      });
    }

    if (data.data.uploadStatus === REPORT_ANALYZE_STATUS.PROCESSING) {
      setTimeout(loopReportAnalyzeStatus, 1000);
    }

    prevReportAnalyzeStatus.current = data.data.uploadStatus;
  };

  const onReportAnalyzeStatusClose = async () => {
    const { data } = await closeReportAnalyzeStatus();

    if (reportAnalyzeStatus) {
      setReportAnalyzeStatus({
        ...reportAnalyzeStatus,
        ...data.data,
      });
    }
  };

  const onReportAnalyze = async (data: {
    name: string;
    url: string;
    year: string;
    scores?: string;
  }) => {
    await analyzeReport(data);
    loopReportAnalyzeStatus();
    Toast('success', I18N.carbonFootprint.operationSuccessful);
  };

  const closePopover = async () => {
    await closeAiTip();
    setPopoverOpen(undefined);
    popoverRef.current?.setPopupVisible(false);
  };

  const onCompanyNameChange = useMemo(
    () =>
      debounce((name: string) => {
        setUrlParams({
          companyName: name || undefined,
          pageNum: 1,
        });
      }, 500),
    [setUrlParams],
  );

  useEffect(() => {
    loopReportAnalyzeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getYearList().then(({ data }) => {
      setYearList(data.data.yearList || []);
    });
    getIndustryList().then(({ data }) => {
      setIndustryList(data.data.cdp_industry || []);
    });
    getAiTipStatus().then(({ data }) => {
      if (data.data.closeStatus === AI_TIP_STATUS.OPEN) {
        setPopoverOpen(true);
      }
    });
  }, []);

  useEffect(() => {
    setReportDataLoading(true);
    getReportData({ year, industry })
      .then(({ data }) => {
        const { scorePercentsList = [] } = data.data;
        let score = scorePercentsList[0];
        scorePercentsList.forEach(scoreItem => {
          if (Number(scoreItem.rate) > Number(score.rate)) {
            score = scoreItem;
          }
        });
        setReportData(data.data);
        setCurrScore(score);
      })
      .finally(() => setReportDataLoading(false));
  }, [year, industry]);

  const filterOption = (
    input: string,
    option?: { label: string; value: number },
  ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div className={styles.report}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>
            {I18N.enterpriseCarbonAccount2.cdpReport}
          </div>
          <Select
            className={styles.headerSelect}
            value={industry}
            placeholder={I18N.enterpriseCarbonAccount2.industry2}
            allowClear
            options={industryList.map(({ dictValue, dictLabel }) => ({
              value: Number(dictValue),
              label: dictLabel,
            }))}
            showSearch
            filterOption={filterOption}
            onChange={selectedIndustry => {
              setUrlParams({ industry: selectedIndustry, pageNum: 1 });
            }}
          />
          <Select
            className={styles.headerSelect}
            value={year}
            placeholder={I18N.carbonFootprint.year}
            allowClear
            options={yearList.map(yearOpt => ({
              value: Number(yearOpt),
              label: yearOpt,
            }))}
            onChange={selectedYear => {
              setUrlParams({ year: selectedYear, pageNum: 1 });
            }}
          />
        </div>
        <Permission flag='enterprise:report:upload'>
          <div className={styles.headerRight}>
            {reportAnalyzeStatus?.closeStatus === REPORT_CLOSE_STATUS.OPEN &&
              reportAnalyzeStatus.uploadStatus !==
                REPORT_ANALYZE_STATUS.NO_DATA && (
                <div
                  className={classNames(styles.analyzeStatus, {
                    [styles.repeatStatus]:
                      reportAnalyzeStatus.uploadStatus ===
                      REPORT_ANALYZE_STATUS.REPEAT,
                    [styles.failStatus]:
                      reportAnalyzeStatus.uploadStatus ===
                      REPORT_ANALYZE_STATUS.FAIL,
                  })}
                >
                  {(status => {
                    if (
                      status === REPORT_ANALYZE_STATUS.FAIL ||
                      status === REPORT_ANALYZE_STATUS.REPEAT
                    ) {
                      return <ExclamationCircleOutlined />;
                    }
                    if (status === REPORT_ANALYZE_STATUS.SUCCESS) {
                      return <CheckCircleOutlined />;
                    }
                    if (status === REPORT_ANALYZE_STATUS.PROCESSING) {
                      return <LoadingOutlined />;
                    }
                    return null;
                  })(reportAnalyzeStatus.uploadStatus)}
                  <span className={styles.statusText}>
                    {
                      REPORT_ANALYZE_STATUS_DESC[
                        reportAnalyzeStatus.uploadStatus
                      ]
                    }
                  </span>
                  {reportAnalyzeStatus.uploadStatus !==
                    REPORT_ANALYZE_STATUS.PROCESSING && (
                    <>
                      <Tooltip overlay={reportAnalyzeStatus.uploadMessage}>
                        <span
                          className={styles.statusOperate}
                          onClick={() => {
                            if (!isNil(reportAnalyzeStatus.id)) {
                              history.push(
                                `${RouteMaps.enterpriseCarbonAccountingAiReportDetail}?reportId=${reportAnalyzeStatus.id}`,
                              );
                            }
                          }}
                        >
                          {I18N.carbonFootprint.check}
                        </span>
                      </Tooltip>
                      <CloseCircleFilled
                        className={styles.statusClose}
                        onClick={onReportAnalyzeStatusClose}
                      />
                    </>
                  )}
                </div>
              )}
            <Popover
              overlayClassName={styles.uploadBtnPopover}
              placement='bottomRight'
              visible={popoverOpen}
              ref={popoverRef}
              content={
                <div className={styles.popover}>
                  <div className={styles.popoverHeader}>
                    <img alt='' src={atonIcon} />
                    <div className={styles.popoverTitle}>
                      {I18N.enterpriseCarbonAccount2.aiAssistant}
                    </div>
                  </div>
                  <div className={styles.popoverText}>
                    <div>{I18N.enterpriseCarbonAccount2.youCanUpload}</div>
                    <div className={styles.popoverTip}>
                      {I18N.enterpriseCarbonAccount2.wePromise}
                    </div>
                  </div>
                  {!!popoverOpen && (
                    <div className={styles.popoverBottom}>
                      <Button
                        type='primary'
                        size='small'
                        onClick={closePopover}
                      >
                        {I18N.enterpriseCarbonAccount2.iGotIt}
                      </Button>
                    </div>
                  )}
                </div>
              }
            >
              <Button
                type='primary'
                icon={<PlusOutlined />}
                disabled={
                  reportAnalyzeStatus?.uploadStatus ===
                  REPORT_ANALYZE_STATUS.PROCESSING
                }
                onClick={() => {
                  setUploadModalVisible(true);
                  if (popoverOpen) {
                    closePopover();
                  }
                }}
              >
                {I18N.enterpriseCarbonAccount2.uploadReport}
              </Button>
            </Popover>
          </div>
        </Permission>
      </div>
      <Spin spinning={reportDataLoading}>
        <div className={styles.dataBoardContent}>
          <div className={styles.dataBoard}>
            <div className={styles.dataBoardHeader}>
              <div className={styles.dataBoardHeaderLeft}>
                <img
                  className={styles.dataBoardIcon}
                  alt=''
                  src={AiReportImg}
                />
                <div>{I18N.enterpriseCarbonAccount2.reportData}</div>
              </div>
            </div>
            <div className={styles.reportDataContent}>
              <div
                className={classNames(styles.reportData, styles.allReportData)}
              >
                <div className={styles.reportDataNum}>
                  {reportData?.reportCounts}
                </div>
                <div className={styles.reportDataName}>
                  {I18N.enterpriseCarbonAccount2.allReports}
                </div>
              </div>
              <div className={styles.reportData}>
                <div className={styles.reportDataNum}>
                  {reportData?.browseCounts}
                </div>
                <div className={styles.reportDataName}>
                  {I18N.enterpriseCarbonAccount2.recentBrowsing}
                </div>
              </div>
              <div className={styles.reportData}>
                <div className={styles.reportDataNum}>
                  {reportData?.comReportCounts}
                </div>
                <div className={styles.reportDataName}>
                  {I18N.enterpriseCarbonAccount2.enterpriseUpload}
                </div>
              </div>
              <div className={styles.reportData}>
                <div className={styles.reportDataNum}>
                  {reportData?.collectCounts}
                </div>
                <div className={styles.reportDataName}>
                  {I18N.enterpriseCarbonAccount2.whatIAmFollowing}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.dataBoard}>
            <div className={styles.dataBoardHeader}>
              <div className={styles.dataBoardHeaderLeft}>
                <img
                  className={styles.dataBoardIcon}
                  alt=''
                  src={AiDistributionImg}
                />
                <div>{I18N.enterpriseCarbonAccount2.scoreDistribution}</div>
              </div>
              <div className={styles.dataBoardTip}>
                {I18N.enterpriseCarbonAccount2.onlyBasedOnReceived}
              </div>
            </div>
            {reportData?.scorePercentsList?.length !== 0 && (
              <>
                <div className={styles.distributionTagContent}>
                  {(reportData?.scorePercentsList || []).map(score => {
                    const { scores, rate } = score;
                    return (
                      <div
                        className={classNames(styles.distributionTag, {
                          [styles.selectedDistributionTag]:
                            score.scores === currScore?.scores,
                        })}
                        key={score.scores}
                        onClick={() => setCurrScore(score)}
                      >
                        <div className={styles.distributionName}>{scores}</div>
                        <div className={styles.distributionVal}>{rate}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.placeholder} />
                <div className={styles.chartContent}>
                  <div className={styles.chartContentLeft}>
                    <div className={styles.scoreCount}>{currScore?.counts}</div>
                    <div className={styles.scoreTip}>
                      {I18N.enterpriseCarbonAccount2.numberOfReports}
                    </div>
                    <div className={styles.scoreCompare}>
                      <span>
                        {
                          I18N.enterpriseCarbonAccount2
                            .comparedToThePreviousYear
                        }
                      </span>
                      <span className={styles.scoreCompareVal}>
                        {currScore?.comparePreYear}%
                      </span>
                    </div>
                  </div>
                  <div className={styles.chartContentRight}>
                    <DistributionChart
                      year={year}
                      yearPercents={currScore?.yearPercents || []}
                    />
                  </div>
                </div>
              </>
            )}
            {reportData?.scorePercentsList?.length === 0 && <Empty />}
          </div>
          <div className={styles.dataBoard}>
            <div className={styles.dataBoardHeader}>
              <div className={styles.dataBoardHeaderLeft}>
                <img
                  className={styles.dataBoardIcon}
                  alt=''
                  src={AiCompanyRankImg}
                />
                <div>{I18N.enterpriseCarbonAccount2.companyRanking}</div>
                <Tooltip title={I18N.enterpriseCarbonAccount2.onlyBasedOnScope}>
                  <div className={styles.dataBoardTip}>
                    <IconAlibaba type='icon-icon-tishi' />
                  </div>
                </Tooltip>
              </div>
            </div>
            {(reportData?.companyRanking || []).map((company, index) => {
              const {
                companyName: rankCompanyName,
                scores,
                unitIntensity,
              } = company;
              const maxUnitIntensity = [
                ...(reportData?.companyRanking || []),
              ].pop()?.unitIntensity;

              return (
                <div className={styles.rankCompany}>
                  {(() => {
                    if (index <= 2) {
                      const imgMap = {
                        0: rankImg1,
                        1: rankImg2,
                        2: rankImg3,
                      };
                      return (
                        <img
                          className={styles.companyRankImg}
                          alt=''
                          src={imgMap[index]}
                        />
                      );
                    }
                    return (
                      <div className={styles.companyRank}>{index + 1}</div>
                    );
                  })()}
                  <div className={styles.companyName} title={rankCompanyName}>
                    {rankCompanyName}
                  </div>
                  <div className={styles.companyBar}>
                    <div
                      className={styles.companyPercentBar}
                      style={{
                        width: `${
                          (Number(unitIntensity) / Number(maxUnitIntensity)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div
                    className={styles.companyIntensity}
                    title={unitIntensity}
                  >
                    {unitIntensity}
                  </div>
                  <ScoresTag scores={scores} />
                </div>
              );
            })}
            {reportData?.companyRanking?.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>
      </Spin>
      <div className={styles.reportTableContent}>
        <Tabs
          className={styles.typeTab}
          activeKey={`${type}`}
          tabBarExtraContent={
            <Input
              defaultValue={companyName}
              placeholder={I18N.enterpriseCarbonAccount2.companyName}
              allowClear
              suffix={<SearchOutlined className={styles.inputSearchIcon} />}
              onChange={e => {
                onCompanyNameChange(e.target.value);
              }}
            />
          }
          onChange={key => {
            setUrlParams({
              type: key,
              pageNum: 1,
            });
          }}
        >
          {Object.values(REPORT_TYPE).map(reportType => (
            <Tabs.TabPane
              key={reportType}
              tab={REPORT_TYPE_LABEL[reportType]}
            />
          ))}
        </Tabs>
        <ReportTable
          searchParams={urlParams as Required<SearchParams>}
          setSearchParams={setUrlParams}
          onCollectSuccess={() => {
            setUrlParams({
              refreshFlag: !urlParams.refreshFlag,
            });
            getReportData({ year, industry }).then(({ data }) => {
              setReportData(data.data);
            });
          }}
        />
      </div>
      <UploadModal
        visible={uploadModalVisible}
        yearList={yearList}
        onCancel={() => setUploadModalVisible(false)}
        onConfirm={onReportAnalyze}
      />
    </div>
  );
};

export default AiReport;
