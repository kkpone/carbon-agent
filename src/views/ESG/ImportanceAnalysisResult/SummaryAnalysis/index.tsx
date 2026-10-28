import { DownloadOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Segmented, Spin, Table } from 'antd';
import classNames from 'classnames';
import * as htmlToImage from 'html-to-image';
import { pick } from 'lodash-es';
import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import NumberInputTableCell from '@/components/NumberInputTableCell';
// import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import {
  getSummaryAnalysis,
  resetScore,
  updateScore,
  updateSummaryAnalysis,
} from './service';

const GRAPH_TYPE = {
  quadrants: {
    value: 0,
    label: I18N.esg.fourQuadrantDiagram,
  },
  sector: {
    value: 1,
    label: I18N.esg.fanShapedBullseyeMap,
  },
};

const SummaryAnalysis: FC<{
  id: string;
  analysisInfo: Record<string, any>;
  editPermission: boolean;
  updateImportanceAnalysis: () => Promise<void>;
}> = ({ id, analysisInfo, editPermission, updateImportanceAnalysis }) => {
  const chartAnalysisRef = useRef<HTMLDivElement>(null);

  const [chartAnalysisHeight, setChartAnalysisHeight] = useState(0);

  const [chartData, setChartData] = useState<Record<string, any>>();

  const [loading, setLoading] = useState(true);

  const [exportLoading, setExportLoading] = useState(false);

  const graphConfig = useMemo(
    () => pick(analysisInfo, ['chartType', 'chartFour', 'chartFlat']),
    [analysisInfo],
  );

  const { chartType, chartFlat, chartFour } = graphConfig;

  const { mid_d, high_d } = chartFlat;

  const { x, y } = chartFour;

  const topicList =
    chartData?.reduce(
      (prev, topicGroup) => [
        ...prev,
        ...(topicGroup.topicList || []).map(topic => ({
          ...topic,
          moduleType: topicGroup.moduleType,
        })),
      ],
      [],
    ) || [];

  const renderTopicCircle = () =>
    topicList.map(topic => (
      <div
        key={topic.id}
        className={classNames(styles.topicCircle, {
          [styles.ETopicCircle]: topic.moduleType === '1',
          [styles.STopicCircle]: topic.moduleType === '2',
          [styles.GTopicCircle]: topic.moduleType === '3',
        })}
        style={{
          left: `${(topic.companyScore / 5) * 100}%`,
          top: `${((5 - topic.selfScore) / 5) * 100}%`,
        }}
      >
        {topic.orderNum}
      </div>
    ));

  const getChartData = async params => {
    try {
      setLoading(true);
      const { data } = await getSummaryAnalysis(params);
      setChartData(data.data);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async data => {
    try {
      setLoading(true);
      await updateSummaryAnalysis({
        id,
        ...data,
      });
      await updateImportanceAnalysis();
    } catch {
      setLoading(false);
    }
  };

  const updateTopicScore = async data => {
    try {
      setLoading(true);
      await updateScore(data);
      getChartData({ id });
    } catch {
      setLoading(false);
    }
  };

  const resetTopicScore = async data => {
    try {
      setLoading(true);
      await resetScore(data);
      getChartData({ id });
    } catch {
      setLoading(false);
    }
  };

  const exportChart = () => {
    if (!chartAnalysisRef.current) return;
    setExportLoading(true);
    htmlToImage
      .toPng(chartAnalysisRef.current, {
        backgroundColor: '#fff',
        skipFonts: false,
        style: {
          color: '#000000',
        },
      })
      .then(dataUrl => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = I18N.esg.exportImageP;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .finally(() => {
        setExportLoading(false);
      });
  };

  useEffect(() => {
    getChartData({ id });
  }, [id, graphConfig]);

  useLayoutEffect(() => {
    if (chartAnalysisRef.current) {
      setChartAnalysisHeight(chartAnalysisRef.current.offsetHeight);
    }
  }, [chartData]);

  return (
    <Spin spinning={loading}>
      <div className={styles.summaryAnalysis}>
        <div>
          <div className={styles.title}>{I18N.esg.importantIssues2}</div>
          <div className={styles.chartConfig}>
            <Segmented
              value={chartType}
              options={[
                {
                  value: GRAPH_TYPE.quadrants.value,
                  label: GRAPH_TYPE.quadrants.label,
                },
                {
                  value: GRAPH_TYPE.sector.value,
                  label: GRAPH_TYPE.sector.label,
                },
              ]}
              onChange={value => {
                updateData({ ...graphConfig, chartType: value });
              }}
            />
            <Button
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={exportChart}
            >
              {I18N.esg.downloadChart}
            </Button>
          </div>
          <div className={styles.chartAnalysis} ref={chartAnalysisRef}>
            <div className={styles.esgCategory}>
              <div className={styles.esgCategoryItem}>
                <div className={styles.esgCategoryItemIcon} />
                <span>{I18N.esg.environment}</span>
              </div>
              <div className={styles.esgCategoryItem}>
                <div className={styles.esgCategoryItemIcon} />
                <span>{I18N.esg.society}</span>
              </div>
              <div className={styles.esgCategoryItem}>
                <div className={styles.esgCategoryItemIcon} />
                <span>{I18N.esg.governance}</span>
              </div>
            </div>
            <div className={styles.chartContent}>
              <div className={classNames(styles.axisText, styles.xAxisText)}>
                {I18N.esg.importanceOfTheCompany}
              </div>
              <div className={classNames(styles.axisText, styles.yAxisText)}>
                {I18N.esg.stakeholder}
              </div>
              <div className={classNames(styles.recordNum, styles.zeroRecord)}>
                0
              </div>
              <div className={styles.xAxisRecord}>
                {new Array(5).fill('').map((_, index) => (
                  <div className={styles.recordNum}>{index + 1}</div>
                ))}
              </div>
              <div className={styles.yAxisRecord}>
                {new Array(5).fill('').map((_, index) => (
                  <div className={styles.recordNum}>{5 - index}</div>
                ))}
              </div>
              {chartType === GRAPH_TYPE.quadrants.value &&
                (() => {
                  const top = ((5 - y) / 5) * 100;
                  const left = (x / 5) * 100;
                  return (
                    <div className={styles.chartContainer}>
                      <div
                        className={styles.xAxisLine}
                        style={{ top: `${top}%` }}
                      />
                      <div
                        className={styles.yAxisLine}
                        style={{ left: `${left}%` }}
                      />
                      <NumberInputTableCell
                        className={styles.scoreInput}
                        style={{
                          top: -30,
                          left: `calc(${left}% - 20px)`,
                        }}
                        size='small'
                        value={x}
                        min={0}
                        max={5}
                        disabled={!editPermission}
                        controls={false}
                        step={0.1}
                        maxDecimals={2}
                        onBlur={val => {
                          if (val === x) return;
                          updateData({
                            ...graphConfig,
                            chartFour: {
                              ...chartFour,
                              x: val,
                            },
                          });
                        }}
                      />
                      <NumberInputTableCell
                        className={styles.scoreInput}
                        style={{
                          top: `calc(${top}% - 12px)`,
                          right: -42,
                        }}
                        size='small'
                        value={y}
                        min={0}
                        max={5}
                        disabled={!editPermission}
                        controls={false}
                        step={0.1}
                        maxDecimals={2}
                        onBlur={val => {
                          if (val === y) return;
                          updateData({
                            ...graphConfig,
                            chartFour: {
                              ...chartFour,
                              y: val,
                            },
                          });
                        }}
                      />
                      <div className={styles.quadrants}>
                        <div
                          className={classNames(styles.quadrantsItem, {
                            [styles.hiddenQuadrantsItem]:
                              left === 0 || top === 0,
                          })}
                          style={{ width: `${left}%`, height: `${top}%` }}
                        >
                          <div className={styles.quadrantsItemBg} />
                        </div>
                        <div
                          className={classNames(styles.quadrantsItem, {
                            [styles.hiddenQuadrantsItem]:
                              left === 100 || top === 0,
                          })}
                          style={{ width: `${100 - left}%`, height: `${top}%` }}
                        >
                          <div className={styles.quadrantsItemBg} />
                        </div>
                        <div
                          className={classNames(styles.quadrantsItem, {
                            [styles.hiddenQuadrantsItem]:
                              left === 0 || top === 100,
                          })}
                          style={{ width: `${left}%`, height: `${100 - top}%` }}
                        >
                          <div className={styles.quadrantsItemBg} />
                        </div>
                        <div
                          className={classNames(styles.quadrantsItem, {
                            [styles.hiddenQuadrantsItem]:
                              left === 100 || top === 100,
                          })}
                          style={{
                            width: `${100 - left}%`,
                            height: `${100 - top}%`,
                          }}
                        >
                          <div className={styles.quadrantsItemBg} />
                        </div>
                      </div>
                      {renderTopicCircle()}
                    </div>
                  );
                })()}
              {chartType === GRAPH_TYPE.sector.value &&
                (() => {
                  const left = ((5 - mid_d) / 5) * 100;
                  const top = (high_d / 5) * 100;
                  const highWidth = (high_d / 5) * 2 * 100;
                  const midWidth = (mid_d / 5) * 2 * 100;
                  return (
                    <div className={styles.chartContainer}>
                      <div className={styles.xAxisLine} />
                      <div className={styles.yAxisLine} />
                      <NumberInputTableCell
                        className={styles.scoreInput}
                        style={{
                          top: -30,
                          left: `calc(${left}% - 20px)`,
                        }}
                        size='small'
                        value={mid_d}
                        min={high_d}
                        max={5}
                        controls={false}
                        disabled={!editPermission}
                        step={0.1}
                        maxDecimals={2}
                        onBlur={val => {
                          if (val === mid_d) return;
                          updateData({
                            ...graphConfig,
                            chartFlat: {
                              ...chartFlat,
                              mid_d: val,
                            },
                          });
                        }}
                      />
                      <NumberInputTableCell
                        className={styles.scoreInput}
                        style={{
                          right: -42,
                          top: `calc(${top}% - 12px)`,
                        }}
                        size='small'
                        value={high_d}
                        min={0}
                        max={mid_d ?? 5}
                        controls={false}
                        disabled={!editPermission}
                        step={0.1}
                        maxDecimals={2}
                        onBlur={val => {
                          if (val === high_d) return;
                          updateData({
                            ...graphConfig,
                            chartFlat: {
                              ...chartFlat,
                              high_d: val,
                            },
                          });
                        }}
                      />
                      <div className={styles.sectorChart}>
                        <div
                          className={styles.fan}
                          style={{
                            width: `${midWidth}%`,
                            background: 'rgba(12, 191, 159, 0.08)',
                          }}
                        />
                        <div
                          className={styles.fan}
                          style={{
                            width: `${highWidth}%`,
                            background: 'rgba(12, 191, 159, 0.16)',
                          }}
                        />
                      </div>
                      {renderTopicCircle()}
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
        <div>
          <div className={styles.title}>
            {I18N.esg.theFinalAgenda}
            {/* <Button icon={<IconAlibabaNew type='icon-icon-daochu' />}>
              数据导出
            </Button> */}
          </div>
          <div
            className={styles.tableContent}
            style={{ height: chartAnalysisHeight + 50 }}
          >
            {chartData?.map(topicGroup => (
              <div className={styles.tableContainer}>
                <div
                  className={classNames(styles.topicGroupHeader, {
                    [styles.ETopicGroupHeader]: topicGroup.moduleType === '1',
                    [styles.STopicGroupHeader]: topicGroup.moduleType === '2',
                    [styles.GTopicGroupHeader]: topicGroup.moduleType === '3',
                  })}
                >
                  {topicGroup.moduleName}
                </div>
                <Table
                  rowKey='id'
                  dataSource={topicGroup.topicList}
                  scroll={{ x: 558 }}
                  size='small'
                  columns={[
                    {
                      title: I18N.carbonFootprint.number,
                      dataIndex: 'orderNum',
                      width: 68,
                      fixed: 'left',
                    },
                    {
                      title: I18N.esg.topicName,
                      dataIndex: 'name',
                      ellipsis: true,
                      width: 168,
                      fixed: 'left',
                      render: (_, record: Record<string, any>) => {
                        const { name, level } = record;
                        const isHigh = level === 0;
                        const isLow = level === 2;
                        return (
                          <div className={styles.topicNameCell}>
                            <div className={styles.tableTopicName}>{name}</div>
                            <div
                              className={styles.tableTopicLevel}
                              style={{
                                borderColor: isHigh
                                  ? '#004541'
                                  : isLow
                                  ? '#0CBF9F'
                                  : '#026961',
                                color: isHigh
                                  ? '#004541'
                                  : isLow
                                  ? '#0CBF9F'
                                  : '#026961',
                              }}
                            >
                              {isHigh
                                ? I18N.carbonAccount.high
                                : isLow
                                ? I18N.carbonAccount.low
                                : I18N.carbonAccount.in}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: I18N.esg.regardingTheCompany,
                      dataIndex: 'companyScore',
                      width: 148,
                      ellipsis: true,
                      render: (_, record: Record<string, any>) => {
                        const { companyScore } = record;
                        return (
                          <div className={styles.inputCell}>
                            <NumberInputTableCell
                              className={styles.tableScoreInput}
                              variant='borderless'
                              disabled={!editPermission}
                              controls={false}
                              value={companyScore}
                              min={0}
                              max={5}
                              maxDecimals={2}
                              onBlur={val => {
                                if (val === companyScore) return;
                                updateTopicScore({
                                  id: record.id,
                                  type: 0,
                                  companyScore: val,
                                });
                              }}
                            />
                            {editPermission && (
                              <Button
                                className={styles.resetBtn}
                                type='link'
                                onClick={() =>
                                  resetTopicScore({ id: record.id, type: 0 })
                                }
                              >
                                {I18N.esg.restoreInitialState}
                              </Button>
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: I18N.esg.regardingStakeholdersInterests2,
                      dataIndex: 'selfScore',
                      width: 168,
                      ellipsis: true,
                      render: (_, record: Record<string, any>) => {
                        const { selfScore } = record;
                        return (
                          <div className={styles.inputCell}>
                            <NumberInputTableCell
                              className={styles.tableScoreInput}
                              variant='borderless'
                              disabled={!editPermission}
                              controls={false}
                              value={selfScore}
                              min={0}
                              max={5}
                              maxDecimals={2}
                              onBlur={val => {
                                if (val === selfScore) return;
                                updateTopicScore({
                                  id: record.id,
                                  type: 1,
                                  selfScore: val,
                                });
                              }}
                            />
                            {editPermission && (
                              <Button
                                className={styles.resetBtn}
                                type='link'
                                onClick={() =>
                                  resetTopicScore({ id: record.id, type: 1 })
                                }
                              >
                                {I18N.esg.restoreInitialState}
                              </Button>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                  pagination={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default SummaryAnalysis;
