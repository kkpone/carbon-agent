/*
 * @@description:碳足迹结果页 - 过程核算、快速核算
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 11:07:31
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 15:44:05
 */

import useUrlState from '@ahooksjs/use-url-state';
import emptyImg from '@src/assets/svg/empty.svg';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import I18N from '@src/lang/I18N';
import {
  haveAccountEditPermissions,
  haveAiEmissionAnalysisPermissions,
} from '@src/views/carbonFootprint3/permissions';
import { Button, Col, Radio, Row, Table } from 'antd';
import classNames from 'classnames';
import EChartsReact from 'echarts-for-react';
import { saveAs } from 'file-saver';
import { FC, useEffect, useState, useMemo, memo } from 'react';

import exportIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/export.svg';
import AISuggestion from '@/views/carbonFootprint3/component/AISuggestion';
import BusinessForesightCard from '@/views/carbonFootprint3/component/BusinessForesightCard';

import { tableColumns } from './columns';
import styles from './index.module.less';
import {
  getAccountExportResult,
  getAccountResult,
  getAccountTableInfo,
} from './service';
import { AccountChartData, ChartData, Emission } from './type';
import { AccountingInfoData } from '../../../AccountDetail/AccountInfo/type';
import { getPaletteColor } from '../chartColor';
import type { AccountEmissionTaskTarget } from '../type';

type CarbonFootprintResultProps = {
  accountInfo: AccountingInfoData;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  showAISuggestion?: boolean;
  showBusinessForesight?: boolean;
  onAISuggestionReferenceSelect?: (content: string) => void;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
  onQuestionGuideClick?: (question: string) => void;
  onSuggestionReferenceAdd?: (referenceText: string) => void;
};

const MAX_LABEL_LENGTH = 30;
const MAX_AXIS_LABEL_LENGTH = 10;
const BAR_AXIS_LABEL_WIDTH = 64;
const BAR_GRID_RIGHT = 72;

const formatAxisLabel = (value: string | number) => {
  const numberValue = Number(value);
  const text =
    Number.isFinite(numberValue) && String(value).trim() !== ''
      ? Number(numberValue.toFixed(6)).toString()
      : String(value);
  return text.length > MAX_AXIS_LABEL_LENGTH
    ? `${text.slice(0, MAX_AXIS_LABEL_LENGTH)}...`
    : text;
};

const PIE_CHART_COLORS = [
  '#0CBF9F',
  '#048677',
  '#026961',
  '#004541',
  '#002A23',
];

const BAR_CHART_COLORS = [
  '#57D9B8',
  '#0CBF9F',
  '#08A28B',
  '#048677',
  '#026961',
  '#005854',
  '#004541',
  '#004245',
  '#002A23',
];

const formatPercent = (value: number) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '');

const getPieTooltipPosition = (
  point: [number, number],
  _params: unknown,
  _dom: HTMLElement,
  _rect: unknown,
  size: { contentSize: [number, number]; viewSize: [number, number] },
) => {
  const [contentWidth, contentHeight] = size.contentSize;
  const [viewWidth, viewHeight] = size.viewSize;
  const gap = 12;
  const maxX = Math.max(viewWidth - contentWidth - gap, gap);
  const maxY = Math.max(viewHeight - contentHeight - gap, gap);
  const preferredX =
    point[0] < viewWidth / 2 ? point[0] + gap : point[0] - contentWidth - gap;
  const preferredY = point[1] - contentHeight / 2;

  return [
    Math.min(Math.max(preferredX, gap), maxX),
    Math.min(Math.max(preferredY, gap), maxY),
  ];
};

export const QucikAccountResult: FC<CarbonFootprintResultProps> = memo(
  ({
    accountInfo,
    isDetail,
    apiExtraParams,
    showAISuggestion,
    showBusinessForesight,
    onAISuggestionReferenceSelect,
    onEmissionTaskCreate,
    onQuestionGuideClick,
    onSuggestionReferenceAdd,
  }) => {
    const { id: accountId } = accountInfo;
    const [urlState] = useUrlState<Record<string, any>>();
    const [pieChartType, setPieChartType] = useState<'stage' | 'type'>('stage');

    const [barChartType, setBarChartType] = useState<
      'stage' | 'type' | 'emission'
    >('stage');

    const [chartData, setChartData] = useState<AccountChartData>({
      byStages: [],
      byEmissions: [],
      byTypes: [],
      emissionTotal: '',
    });

    const [accountTableList, setAccountTableList] = useState<Emission[]>([]);

    const [tableLoading, setTableLoading] = useState(false);

    const [, setExportButtonLoading] = useState(false);

    const [pieData, setPieData] = useState<
      { label: string; value: number; [K: string]: any }[]
    >([]);

    const [barData, setBarData] = useState<
      { label: string; value: number; [K: string]: any }[]
    >([]);

    const getTableData = async (id: number) => {
      try {
        setTableLoading(true);
        const resp = await getAccountTableInfo({
          ...apiExtraParams,
          accountId: id,
        });
        let stageName = '';
        let stageCount = 0;
        setAccountTableList(
          resp?.data?.data?.accountList?.map(emission => {
            if (stageName !== emission.stage) {
              stageName = emission.stage;
              stageCount = 1;
            } else {
              stageCount += 1;
            }
            return {
              ...emission,
              stageIndex: stageCount,
            };
          }) || [],
        );
      } finally {
        setTableLoading(false);
      }
    };

    const getChartData = async (id: number) => {
      const resp = await getAccountResult({ ...apiExtraParams, id });
      setChartData(resp?.data?.data);
    };

    useEffect(() => {
      getChartData(accountId);
      getTableData(accountId);
    }, [accountId]);

    useEffect(() => {
      const chartDataList = (
        pieChartType === 'stage' ? chartData.byStages : chartData?.byTypes
      )?.sort((prevData, data) => prevData.code - data.code);

      setPieData(
        chartDataList?.map(({ name, total }) => ({
          value: Number(total),
          label:
            name.length > MAX_LABEL_LENGTH
              ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
              : name,
          name,
        })) || [],
      );
    }, [pieChartType, chartData]);

    useEffect(() => {
      let chartDataList: ChartData[] = [];
      switch (barChartType) {
        case 'stage':
          chartDataList = chartData.byStages;
          break;
        case 'type':
          chartDataList = chartData.byTypes;
          break;
        default:
          chartDataList = chartData.byEmissions;
      }
      const nextBarData: any[] = [];
      chartDataList
        ?.sort((prev, curr) => Number(curr.total) - Number(prev.total))
        ?.forEach(({ rate, name, total, code, totalTrans }, index) => {
          if (totalTrans) {
            nextBarData.push({
              value: Number(total) - Number(totalTrans),
              label:
                name.length > MAX_LABEL_LENGTH
                  ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
                  : name,
              rate,
              name,
              code,
              index,
              type: I18N.carbonFootprint3.excludingTransportation,
              all: Number(total),
            });
            nextBarData.push({
              value: Number(totalTrans),
              label:
                name.length > MAX_LABEL_LENGTH
                  ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
                  : name,
              rate,
              name,
              code,
              index,
              type: I18N.carbonFootprint.transport,
              all: Number(total),
            });
          } else if (code === 7) {
            nextBarData.push({
              value: Number(total),
              label:
                name.length > MAX_LABEL_LENGTH
                  ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
                  : name,
              rate,
              name,
              code,
              index,
              // color: '#7CE6C8',
              type:
                barChartType === 'type'
                  ? I18N.carbonFootprint.transport
                  : undefined,
              all: Number(total),
            });
          } else {
            nextBarData.push({
              value: Number(total),
              label:
                name.length > MAX_LABEL_LENGTH
                  ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
                  : name,
              rate,
              name,
              code,
              index,
              // color: '#7CE6C8',
              type:
                barChartType === 'type'
                  ? I18N.carbonFootprint3.excludingTransportation
                  : undefined,
              all: Number(total),
            });
          }
        });
      setBarData(nextBarData);
    }, [barChartType, chartData]);

    const stageCountMap: Record<string, number> = useMemo(() => {
      const map: Record<string, number> = {};
      accountTableList?.forEach(({ stage }) => {
        map[stage] = map[stage] ? map[stage] + 1 : 1;
      });
      return map;
    }, [accountTableList]);

    const pieTotal = useMemo(
      () => pieData.reduce((sum, item) => sum + Number(item.value || 0), 0),
      [pieData],
    );

    const getPieLegendText = (name: string) => {
      const item = pieData.find(data => data.label === name);
      if (!item || !pieTotal) return name;
      return `${name}：${formatPercent(
        (Number(item.value) / pieTotal) * 100,
      )}%`;
    };

    const pieColors = useMemo(
      () =>
        Array.from({ length: pieData.length }, (_, index) =>
          getPaletteColor(PIE_CHART_COLORS, index, pieData.length),
        ),
      [pieData.length],
    );

    const barColors = useMemo(
      () =>
        Array.from({ length: barData.length }, (_, index) =>
          getPaletteColor(
            BAR_CHART_COLORS,
            barData.length - 1 - index,
            barData.length,
          ),
        ),
      [barData.length],
    );

    const exportResult = async () => {
      try {
        setExportButtonLoading(true);
        const res = await getAccountExportResult({
          ...apiExtraParams,
          accountId,
        });
        saveAs(res.data.data.url, res.data.data.name);
      } finally {
        setExportButtonLoading(false);
      }
    };

    const isSharePages = useMemo(() => {
      const snap = urlState?.snapFlag ?? urlState?.snapflag;
      return snap === '6' || snap === '7' || snap === 6 || snap === 7;
    }, [urlState?.snapFlag, urlState?.snapflag]);

    return (
      <div className={styles.carbonFootprintResultContainer}>
        <Row gutter={16} className={styles.chartRow}>
          <Col span={12} className={styles.chartCol}>
            <div className={styles.chartContent}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>
                  {I18N.carbonFootprint3.emissionComposition}
                </div>
                <Radio.Group
                  value={pieChartType}
                  optionType='button'
                  options={[
                    { label: I18N.carbonFootprint3.byStage, value: 'stage' },
                    { label: I18N.carbonFootprint3.byType, value: 'type' },
                  ]}
                  onChange={e => setPieChartType(e.target.value)}
                />
              </div>
              {pieData.length > 0 ? (
                <div className={styles.pieChartWrap}>
                  <EChartsReact
                    className={styles.pieChart}
                    style={{
                      height: 'var(--pie-chart-size)',
                      width: 'var(--pie-chart-size)',
                    }}
                    option={{
                      tooltip: {
                        trigger: 'item',
                        appendToBody: true,
                        position: getPieTooltipPosition,
                        formatter: (arg: {
                          marker: string;
                          name: string;
                          value: number;
                          percent: number;
                        }) => {
                          const { name, marker, value, percent } = arg;
                          return `
                            ${marker}
                            <span>${name}<span>
                            <span style="font-weight: bold; display: inline-block; margin-left: 16px">
                              <span>${value}<span>
                              <span style="display: inline-block; margin-left: 4px">${percent}%<span>
                            <span>
                        `;
                        },
                      },
                      legend: {
                        show: false,
                      },
                      series: [
                        {
                          type: 'pie',
                          tooltip: {},
                          center: ['50%', '50%'],
                          radius: [72, 96],
                          padAngle: 1,
                          itemStyle: {
                            borderRadius: 6,
                            borderColor: '#fff',
                            borderWidth: 4,
                          },
                          data: (pieData || []).map((item, index) => ({
                            name: item.label,
                            value: item.value,
                            itemStyle: {
                              color: pieColors[index],
                            },
                          })),
                          label: {
                            show: true,
                            position: 'center',
                            formatter:
                              `{value|${accountInfo.emissionTotal}}` +
                              '\n' +
                              `{name|${I18N.carbonFootprint3.totalEmissionsK}}`,
                            rich: {
                              value: {
                                color: '#026961',
                                backgroundColor: '#fff',
                                align: 'center',
                                fontWeight: 500,
                                fontSize: 16,
                                lineHeight: 24,
                              },
                              name: {
                                color: '#999EA4',
                                backgroundColor: '#fff',
                                align: 'center',
                                fontSize: 12,
                                lineHeight: 18,
                                padding: [4, 0, 0, 0],
                              },
                            },
                          },
                        },
                      ],
                    }}
                  />
                  <div className={styles.pieLegend}>
                    {pieData.map((item, index) => (
                      <div
                        className={styles.pieLegendItem}
                        key={`${item.name}-${item.label}`}
                      >
                        <span
                          className={styles.pieLegendMarker}
                          style={{ background: pieColors[index] }}
                        />
                        <span className={styles.pieLegendText}>
                          {getPieLegendText(item.label)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.empty}>
                  <img src={emptyImg} alt='' />
                  <span className={styles.emptyText}>
                    {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
                  </span>
                </div>
              )}
            </div>
          </Col>
          <Col span={12} className={styles.chartCol}>
            <div className={styles.chartContent}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>
                  {I18N.carbonFootprint3.emissionRanking}
                </div>
                <Radio.Group
                  value={barChartType}
                  optionType='button'
                  options={[
                    { label: I18N.carbonFootprint3.byStage, value: 'stage' },
                    { label: I18N.carbonFootprint3.byType, value: 'type' },
                    {
                      label: I18N.carbonFootprint3.byEmissionSource,
                      value: 'emission',
                    },
                  ]}
                  onChange={e => setBarChartType(e.target.value)}
                />
              </div>
              <EChartsReact
                className={styles.chart}
                style={{ height: '100%', width: '100%' }}
                option={{
                  tooltip: {},
                  grid: {
                    left: 16,
                    right: BAR_GRID_RIGHT,
                    top: 16,
                    bottom: 34,
                    containLabel: true,
                  },
                  xAxis: {
                    type: 'value',
                    axisLabel: {
                      color: '#999EA4',
                      fontSize: 12,
                      hideOverlap: true,
                      margin: 12,
                      overflow: 'truncate',
                      ellipsis: '...',
                      width: BAR_AXIS_LABEL_WIDTH,
                      formatter: formatAxisLabel,
                    },
                    splitLine: {
                      lineStyle: {
                        color: '#E7EAEE',
                      },
                    },
                  },
                  yAxis: {
                    type: 'category',
                    axisLine: {
                      show: false,
                    },
                    axisTick: {
                      show: false,
                    },
                    axisLabel: {
                      color: '#999EA4',
                      fontSize: 12,
                      margin: 8,
                      overflow: 'truncate',
                      width: 66,
                    },
                    data: (barData || []).map(item => item.label),
                  },
                  series: [
                    {
                      type: 'bar',
                      barMaxWidth: 12,
                      data: (barData || []).map((item, index) => ({
                        value: item.value,
                        itemStyle: {
                          color: barColors[index],
                          borderRadius:
                            Number(item.value) < 0
                              ? [4, 0, 0, 4]
                              : [0, 4, 4, 0],
                        },
                      })),
                    },
                  ],
                }}
              />
            </div>
          </Col>
        </Row>
        {showBusinessForesight && (
          <BusinessForesightCard accountId={accountId} />
        )}
        {showAISuggestion &&
          (haveAiEmissionAnalysisPermissions() || isSharePages) && (
            <AISuggestion
              accountId={accountId}
              collapse={false}
              isSharePages={isSharePages}
              onReferenceSelect={onAISuggestionReferenceSelect}
              onQuestionGuideClick={onQuestionGuideClick}
              onSuggestionReferenceAdd={onSuggestionReferenceAdd}
            />
          )}
        <div className={styles.titleContainerMain}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              {I18N.carbonFootprint3.emissionInventory}
            </div>
            {haveAccountEditPermissions() && !isDetail && (
              <Button
                type='default'
                onClick={exportResult}
                className={classNames(styles.outFile, 'm-l-16')}
                icon={
                  <img className={styles.exportIcon} src={exportIcon} alt='' />
                }
              >
                {I18N.carbonFootprint3.export}
              </Button>
            )}
          </div>
          <Table
            className={styles.emissionTable}
            rowKey='id'
            scroll={{ x: 1600 }}
            columns={tableColumns(stageCountMap, onEmissionTaskCreate)}
            dataSource={accountTableList}
            pagination={false}
            loading={tableLoading}
          />
        </div>
      </div>
    );
  },
);
